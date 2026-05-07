/// <reference types="./_config/tree-sitter-types.d.ts" />
// @ts-check

export default grammar({
  name: 'lume',

  extras: $ => [
    /[ \t]/,
    $.comment,
  ],

  word: $ => $.identifier,

  // Bare `pub`/`publish` on its own line overlaps with every declaration
  // that takes an optional visibility prefix — GLR explores both paths and
  // the longest match wins (combined decl preferred when the keyword follows).
  conflicts: $ => [
    [$.publish_statement, $.visibility],
    [$._definition, $.enum_declaration],
    [$._definition, $.struct_declaration],
    [$._definition, $.const_declaration],
    [$._definition, $.fn_declaration],
    [$._definition, $.mutable_declaration],
  ],

  rules: {
    source_file: $ => repeat(choice($._definition, /\r?\n/)),

    _definition: $ => choice(
      $.import_statement,
      $.publish_statement,
      $.enum_declaration,
      $.struct_declaration,
      $.const_declaration,
      $.fn_declaration,
      $.mutable_declaration,
      $.visibility,
      $._attribute_like,
    ),

    _attribute_like: $ => choice(
      $.attribute,
      $.builtin_attribute,
    ),

    // ────────────────────────────────
    // import orlaya/gist::{ User, Result, MAX_SIZE, do_thing }
    import_statement: $ => prec.right(seq(
      'import',
      field('path', $.import_path),
      optional(seq(
        '::',
        optional(seq(
          '{',
          repeat(choice($._imported_item, ',', /\r?\n/)),
          optional('}'),
        )),
      )),
    )),

    // ────────────────────────────────
    // publish types/catalogs::{ PNPM_CATALOGS, PNPM_SETTINGS }
    // Mirrors import_statement — re-export form used in `pub.lm` barrel files.
    publish_statement: $ => prec.right(seq(
      'publish',
      field('path', $.import_path),
      optional(seq(
        '::',
        optional(seq(
          '{',
          repeat(choice($._imported_item, ',', /\r?\n/)),
          optional('}'),
        )),
      )),
    )),

    _imported_item: $ => choice(
      alias($.identifier, $.imported_name),
      $.imported_attribute_namespace,
    ),

    imported_attribute_namespace: $ => seq(
      '#',
      field('name', $.attribute_name),
    ),

    // pub = package-wide visibility, publish = external/public API.
    visibility: $ => choice('pub', 'publish'),

    // ────────────────────────────────
    // Stubs for keywords that don't have full grammar yet — just the leading
    // keyword (plus optional visibility) so Zed highlights them while we
    // prototype. Replace with real declaration rules when the language grows.
    const_declaration: $ => prec.right(seq(optional($.visibility), 'const')),
    fn_declaration: $ => prec.right(seq(optional($.visibility), 'fn')),
    mutable_declaration: $ => prec.right(seq(optional($.visibility), 'mutable')),

    // Forms:
    //   file/path                 — regular
    //   ./file/path, ../file/path — relative (. or .. max)
    //   #/aliased/path            — alias (# highlighted specially)
    //   @scope/pkg                — npm-style scoped
    // The prefix is just the special char(s); the / and the rest are body.
    // This keeps path slashes visually consistent and lets the parser accept
    // in-progress paths like `import .` or `import #` mid-typing.
    import_path: $ => choice(
      seq($.path_alias_prefix, optional($.path_body)),
      seq($.path_relative_prefix, optional($.path_body)),
      $.path_body,
    ),

    path_alias_prefix: $ => '#',
    path_relative_prefix: $ => /\.\.?/,
    path_body: $ => choice(
      seq('/', optional(seq($.path_segment, repeat(seq('/', optional($.path_segment)))))),
      seq($.path_segment, repeat(seq('/', optional($.path_segment)))),
    ),
    path_segment: $ => /[\w@][\w\-.@]*/,

    // ────────────────────────────────
    // enum ErrTypes { ... }
    // Optional leading pub/publish = visibility.
    enum_declaration: $ => seq(
      optional($.visibility),
      'enum',
      field('name', $.type_identifier),
      '{',
      repeat(choice($.variant, $._attribute_like, /\r?\n/)),
      '}',
    ),

    // | NotFound
    // | Invalid(reason: String)
    // | Ok(String)
    // | Err(...ErrTypes)
    variant: $ => prec.right(seq(
      '|',
      field('name', $.type_identifier),
      optional($.variant_params),
      optional($._attribute_like),
      optional(','),
    )),

    variant_params: $ => seq(
      '(',
      commaSep(choice($.spread_type, $.named_field, $._type)),
      ')',
    ),

    named_field: $ => seq(
      field('name', $.identifier),
      ':',
      field('type', $._type),
    ),

    // ────────────────────────────────
    // struct Result { ... }
    // Optional leading pub/publish = visibility.
    struct_declaration: $ => seq(
      optional($.visibility),
      'struct',
      field('name', $.type_identifier),
      $.struct_body,
    ),

    struct_body: $ => seq(
      '{',
      repeat(choice($.struct_field, $.spread_type, $._attribute_like, ',', /\r?\n/)),
      '}',
    ),

    struct_field: $ => prec.right(seq(
      field('name', $.identifier),
      ':',
      field('type', $._type),
      optional($._attribute_like),
      optional(','),
    )),

    // ────────────────────────────────
    // Types

    _type: $ => choice(
      $.maybe_type,
      $.generic_type,
      $.nested_struct,
      $.type_identifier,
    ),

    maybe_type: $ => seq(
      'maybe',
      $._type,
    ),

    generic_type: $ => seq(
      field('name', $.type_identifier),
      $.type_arguments,
    ),

    type_arguments: $ => seq(
      '<',
      commaSep($._type),
      '>',
    ),

    nested_struct: $ => seq(
      '{',
      repeat(choice($.struct_field, $.spread_type, $._attribute_like, ',', /\r?\n/)),
      '}',
    ),

    // ...ErrTypes
    spread_type: $ => seq(
      '...',
      $.type_identifier,
    ),

    // ────────────────────────────────
    // #aka('workspace:*')
    // #derive(this-thing, that_thing, 'or this string')
    attribute: $ => prec.right(seq(
      '#',
      $.attribute_name,
      optional($.attribute_arguments),
    )),

    builtin_attribute: $ => prec.right(seq(
      $.builtin_attribute_name,
      optional($.attribute_arguments),
    )),

    attribute_arguments: $ => choice(
      seq(
        '(',
        commaSep($.attribute_value),
        ')',
      ),
      prec.right(seq(
        $.attribute_value,
        repeat1(seq($.attribute_list_delimiter, $.attribute_value)),
      )),
      $.inline_attribute_arguments,
    ),

    inline_attribute_arguments: $ => prec.right(choice(
      $.attribute_value,
      seq(
        $.attribute_value,
        repeat1(seq('|', $.attribute_value)),
      ),
    )),

    attribute_value: $ => choice(
      $.string,
      $.type_identifier,
      $.attribute_arg,
    ),

    builtin_attribute_name: $ => choice('aka', 'default'),

    attribute_name: $ => /[a-zA-Z_][a-zA-Z0-9_-]*(?::[a-zA-Z_][a-zA-Z0-9_-]*)*/,
    attribute_list_delimiter: $ => token(/,[ \t]+/),

    // Unquoted attribute argument — identifier-like but allows dashes
    attribute_arg: $ => /[a-z_][\w\-]*/,

    // ────────────────────────────────

    comment: $ => seq('//', /.*/),
    string: $ => /'[^'\n]*'?|"[^"\n]*"?/,
    type_identifier: $ => /[A-Z][a-zA-Z0-9_]*/,
    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,
  },
})

/**
 * @param {RuleOrLiteral} rule
 */
function commaSep(rule) {
  return optional(seq(rule, repeat(seq(',', rule))))
}
