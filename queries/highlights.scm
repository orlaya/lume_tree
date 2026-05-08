
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
"required" @keyword
"import" @keyword
"const" @keyword
"fn" @keyword
"mutable" @keyword
(visibility) @keyword
(publish_statement "publish" @keyword)


;
;
; Imports
; ————————————————————————

(import_statement "::" @operator)
(import_statement "{" @punctuation.bracket)
(import_statement "}" @punctuation.bracket)
(import_statement "," @punctuation.delimiter)

(publish_statement "::" @operator)
(publish_statement "{" @punctuation.bracket)
(publish_statement "}" @punctuation.bracket)
(publish_statement "," @punctuation.delimiter)

(import_path
  (path_body
    (path_segment) @string.special))

(import_path
  (path_body
    "/" @punctuation.delimiter))

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

(imported_attribute_namespace "#" @operator)
(imported_attribute_namespace
  (attribute_name) @attribute)


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

(required_type
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

(attribute_value
  (type_identifier) @type)


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
(attribute_name) @attribute
(builtin_attribute_name) @attribute

(attribute_arguments
  "(" @punctuation.bracket
  ")" @punctuation.bracket)

(attribute_arg) @property
(attribute_list_delimiter) @punctuation.delimiter


;
;
; Strings
; ————————————————————————

(string) @string


;
;
; Punctuation
; ————————————————————————

(enum_body
  "{" @punctuation.bracket)

(enum_body
  "}" @punctuation.bracket)

(struct_body
  "{" @punctuation.bracket)

(struct_body
  "}" @punctuation.bracket)

(nested_struct
  "{" @punctuation.bracket)

(nested_struct
  "}" @punctuation.bracket)

(variant_params
  "{" @punctuation.bracket)

(variant_params
  "}" @punctuation.bracket)

(type_arguments
  "<" @punctuation.bracket)

(type_arguments
  ">" @punctuation.bracket)

"," @punctuation.delimiter
"|" @operator


;
;
; Built-in types
; ————————————————————————

((type_identifier) @type.builtin
  (#any-of? @type.builtin
    "String" "Number" "Boolean" "BigInt" "Array" "PairsOf" "Set" "Tuple"))
