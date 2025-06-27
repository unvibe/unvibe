import { escapeHTML, unEscapeHTML } from '@/lib/core/string/escapeHTML';

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

type Tokens =
  | Whitespace
  | Identifier
  | Symbols
  | NumberToken
  | StringToken
  | Keyword
  | Builtins;

export interface TokenizerOptions<E extends string> {
  convertHTMLEntites?: boolean;
  extend?: Record<E, { category: Tokens['type']; rule: RegExp }>;
}

export function tokenize<E extends string>(
  _code: string,
  options?: TokenizerOptions<E>
): Tokens[] {
  const tokens: Tokens[] = [];
  let cursor = 0;
  const code = options?.convertHTMLEntites ? unEscapeHTML(_code) : _code;

  const extensions = Object.entries(options?.extend || {}).map(
    ([newExtensionKey, extensionConfig]) => {
      return {
        key: newExtensionKey,
        config: extensionConfig as {
          category: Tokens['type'];
          rule: RegExp;
        },
      };
    }
  );

  while (cursor < code.length) {
    const char = code[cursor];

    if (char === ' ' || char === '\n' || char === '\t') {
      tokens.push({ type: 'whitespace', value: char });
      cursor++;
      continue;
    }

    if (char.match(/[a-zA-Z_]/)) {
      let value = char;
      cursor++;
      while (cursor < code.length && code[cursor].match(/[a-zA-Z0-9_]/)) {
        value += code[cursor];
        cursor++;
      }

      const token: Identifier = { type: 'identifier', value };

      const childCategories = extensions.filter((newCategory) => {
        return newCategory.config.category === 'identifier';
      });

      for (const category of childCategories) {
        if (token.value.toString().match(category.config.rule)) {
          token.type = category.key as Identifier['type'];
        }
      }

      tokens.push(token);
      continue;
    }

    if (char.match(/[(){}[\],;:.!?+-/*%&|^~=<>]/)) {
      tokens.push({ type: 'symbol', value: char as Symbols['value'] });
      cursor++;
      continue;
    }

    if (char.match(/["'`]/)) {
      let value = char;
      cursor++;
      while (cursor < code.length && code[cursor] !== char) {
        value += code[cursor];
        cursor++;
      }
      value += code[cursor];
      tokens.push({ type: 'string', value });
      cursor++;
      continue;
    }

    if (char.match(/[0-9]/)) {
      let value = parseInt(char, 10);
      cursor++;
      while (cursor < code.length && code[cursor].match(/[0-9]/)) {
        value = value * 10 + parseInt(code[cursor], 10);
        cursor++;
      }
      tokens.push({ type: 'number', value });
      continue;
    }

    throw new Error(`Unexpected character: ${char}`);
  }

  return tokens;
}

type StyleMap = Partial<Record<Tokens['type'], string>>;

const wrapElement = (tokenValue: string, className: string) =>
  `<span class="${className}">${tokenValue}</span>`;

function applyRule(token: Tokens, styleMap: StyleMap) {
  const classNames = styleMap[token.type];
  return classNames
    ? wrapElement(escapeHTML(token.value.toString()), classNames)
    : escapeHTML(token.value.toString());
}

export function toStringHTML<S extends StyleMap>(
  tokens: Tokens[],
  styleMap: S
) {
  return tokens.map((token) => applyRule(token, styleMap)).join('');
}
