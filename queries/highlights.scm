
; Comments
; ————————————————————————
(comment) @comment


;
;
; Keywords
; ————————————————————————
"enum" @keyword
"struct" @keyword
"maybe" @keyword
"import" @keyword


;
;
; Imports
; ————————————————————————

(import_statement
  "::" @operator
  "{" @punctuation.bracket
  "}" @punctuation.bracket)

(import_path
  (path_body) @string.special)

(import_path
  (path_alias_prefix) @operator)

(import_path
  (path_relative_prefix) @punctuation.special)

; Case-based highlighting for imported names
; Lowercase start → variable
((imported_name) @variable
  (#match? @variable "^[a-z_]"))

; Uppercase start → type (PascalCase and ALL_CAPS initially)
((imported_name) @type
  (#match? @type "^[A-Z]"))

; All-caps → constant (wins over @type because it's later)
((imported_name) @constant
  (#match? @constant "^[A-Z][A-Z0-9_]*$"))


;
;
; Declarations
; ————————————————————————

(enum_declaration
  name: (type_identifier) @constructor)

(struct_declaration
  name: (type_identifier) @constructor)


;
;
; Variants
; ————————————————————————

(variant
  "|" @operator
  name: (type_identifier) @constructor)


;
;
; Fields
; ————————————————————————

(struct_field
  name: (identifier) @property
  ":" @punctuation.delimiter)

(named_field
  name: (identifier) @property
  ":" @punctuation.delimiter)


;
;
; Types
; ————————————————————————

(generic_type
  name: (type_identifier) @type)

(maybe_type
  (type_identifier) @type)

(type_arguments
  (type_identifier) @type)

(nested_struct
  (struct_field
    type: (type_identifier) @type))

(variant_params
  (type_identifier) @type)

(struct_field
  type: (type_identifier) @type)

(named_field
  type: (type_identifier) @type)


;
;
; Spread
; ————————————————————————

(spread_type
  "..." @operator
  (type_identifier) @type)


;
;
; Attributes
; ————————————————————————

(attribute "#" @operator)
(attribute (identifier) @attribute)

(attribute
  "(" @punctuation.bracket
  ")" @punctuation.bracket)

(attribute_arg) @property


;
;
; Strings
; ————————————————————————

(string) @string


;
;
; Punctuation
; ————————————————————————

(enum_declaration
  "{" @punctuation.bracket
  "}" @punctuation.bracket)

(struct_declaration
  (struct_body
    "{" @punctuation.bracket
    "}" @punctuation.bracket))

(nested_struct
  "{" @punctuation.bracket
  "}" @punctuation.bracket)

(variant_params
  "(" @punctuation.bracket
  ")" @punctuation.bracket)

(type_arguments
  "<" @punctuation.bracket
  ">" @punctuation.bracket)

"," @punctuation.delimiter


;
;
; Built-in types
; ————————————————————————

((type_identifier) @type.builtin
  (#any-of? @type.builtin
    "String" "Number" "Boolean" "BigInt" "Array" "Dict" "Set" "Tuple"))
