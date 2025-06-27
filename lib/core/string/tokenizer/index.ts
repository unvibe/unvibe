import type { Tokens, TokensMap } from './types';
import { unEscapeHTML } from '@/lib/core/string/escapeHTML';

export { toStringHTML } from './utils';

export interface TokenizerOptions<E extends string> {
  convertHTMLEntites?: boolean;
  extend?: Record<E, { category: Tokens['type']; rule: RegExp }>;
}

function applyConfig<E extends string>(
  _code: string,
  options?: TokenizerOptions<E>
) {
  const _ext = Object.entries(options?.extend || {}).map(
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

  return {
    code: options?.convertHTMLEntites ? unEscapeHTML(_code) : _code,
    extensions: _ext,
    expand<T extends Tokens>(token: T) {
      const childCategories = _ext.filter((newCategory) => {
        return newCategory.config.category === token.type;
      });

      for (const category of childCategories) {
        if (token.value.toString().match(category.config.rule)) {
          token.type = category.key as T['type'];
        }
      }

      return token;
    },
  };
}

export function tokenize<E extends string>(
  _code: string,
  options?: TokenizerOptions<E>
): Tokens[] {
  const { code, expand } = applyConfig(_code, options);

  const tokens: Tokens[] = [];
  let cursor = 0;

  while (cursor < code.length) {
    const char = code[cursor];

    // whitespace
    if (char === ' ' || char === '\n' || char === '\t') {
      tokens.push({ type: 'whitespace', value: char });
      cursor++;
      continue;
    }

    // identifier
    if (char.match(/[a-zA-Z_]/)) {
      let value = char;
      cursor++;
      while (cursor < code.length && code[cursor].match(/[a-zA-Z0-9_]/)) {
        value += code[cursor];
        cursor++;
      }

      tokens.push(expand({ type: 'identifier', value }));
      continue;
    }

    // symbol
    if (char.match(/[(){}[\],;:.!?+-/*%&|^~=<>]/)) {
      tokens.push({
        type: 'symbol',
        value: char as TokensMap['Symbols']['value'],
      });
      cursor++;
      continue;
    }

    // string
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

    // number
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
