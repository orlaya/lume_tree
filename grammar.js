/// <reference types="./_config/tree-sitter-types.d.ts" />
// @ts-check

export default grammar({
  name: 'lume',

  extras: $ => [
    /[ \t]/,
    $.comment,
  ],

  word: $ => $.identifier,

  rules: {
    source_file: $ => repeat(choice($._definition, /\r?\n/)),

    _definition: $ => choice(
      $.import_statement,
      $.enum_declaration,
      $.struct_declaration,
    ),

    // ────────────────────────────────
    // import orlaya/gist::{ User, Result, MAX_SIZE, do_thing }
    import_statement: $ => seq(
      'import',
      field('path', $.import_path),
      '::',
      '{',
      commaSep(alias($.identifier, $.imported_name)),
      '}',
    ),

    import_path: $ => /@?[a-zA-Z_][\w\-\/.]*/,

    // ────────────────────────────────
    // enum ErrTypes { ... }
    enum_declaration: $ => seq(
      'enum',
      field('name', $.type_identifier),
      '{',
      repeat(choice($.variant, ',', /\r?\n/)),
      '}',
    ),

    // | NotFound
    // | Invalid(reason: String)
    // | Ok(String)
    // | Err(...ErrTypes)
    variant: $ => seq(
      '|',
      field('name', $.type_identifier),
      optional($.variant_params),
      optional($.attribute),
    ),

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
    struct_declaration: $ => seq(
      'struct',
      field('name', $.type_identifier),
      $.struct_body,
    ),

    struct_body: $ => seq(
      '{',
      repeat(choice($.struct_field, $.spread_type, ',', /\r?\n/)),
      '}',
    ),

    struct_field: $ => seq(
      field('name', $.identifier),
      ':',
      field('type', $._type),
      optional($.attribute),
    ),

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
      repeat(choice($.struct_field, $.spread_type, ',', /\r?\n/)),
      '}',
    ),

    // ...ErrTypes
    spread_type: $ => seq(
      '...',
      $.type_identifier,
    ),

    // ────────────────────────────────
    // #aka('workspace:*')
    attribute: $ => seq(
      '#',
      $.identifier,
      optional(seq(
        '(',
        commaSep($.string),
        ')',
      )),
    ),

    // ────────────────────────────────

    comment: $ => seq('//', /.*/),
    string: $ => /'[^']*'/,
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
