import { escapeHTML } from '@/lib/core/string/escapeHTML';
import type { Tokens } from './types';

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
