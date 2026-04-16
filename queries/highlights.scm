
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

(attribute
  "#" @operator
  (identifier) @attribute)

(attribute
  "(" @punctuation.bracket
  ")" @punctuation.bracket)


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
