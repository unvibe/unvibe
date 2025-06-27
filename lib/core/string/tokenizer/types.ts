interface Whitespace {
  type: 'whitespace';
  value: ' ' | '\n' | '\t';
}

interface NumberToken {
  type: 'number';
  value: number;
}

interface Identifier {
  type: 'identifier';
  value: string;
}

interface Keyword {
  type: 'keyword';
  value: Identifier['value'];
}

interface Builtins {
  type: 'builtin';
  value: Identifier['value'];
}

interface Symbols {
  type: 'symbol';
  value:
    | '('
    | ')'
    | '{'
    | '}'
    | '['
    | ']'
    | ','
    | ';'
    | ':'
    | '.'
    | '!'
    | '?'
    | '+'
    | '-'
    | '*'
    | '/'
    | '%'
    | '&'
    | '|'
    | '^'
    | '~'
    | '='
    | '<'
    | '>';
}

interface StringToken {
  type: 'string';
  value: string;
}

export interface TokensMap {
  Whitespace: Whitespace;
  NumberToken: NumberToken;
  Identifier: Identifier;
  Keyword: Keyword;
  Builtins: Builtins;
  Symbols: Symbols;
  StringToken: StringToken;
}

export type Tokens =
  | Whitespace
  | Identifier
  | Symbols
  | NumberToken
  | StringToken
  | Keyword
  | Builtins;
