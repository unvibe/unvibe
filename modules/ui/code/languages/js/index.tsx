import { Code } from '../../base';
import type { TokenizerOptions } from '@/lib/core/string/tokenizer';
import { tokenize, toStringHTML } from '@/lib/core/string/tokenizer';

const src = `import { Avatar } from '@super-simple/core-ui/components/avatar';

function MyComponent(props: { name: string }) {
  return (
    <div>
      <Avatar letter={props.name[0]} className='w-10 h-10' />
      <span>{props.name}</span>
    </div>
  );
}
`;

const js: TokenizerOptions<'jsxIntrinsic' | 'builtin' | 'keyword'> = {
  convertHTMLEntites: true,
  extend: {
    // jsx intrinsic elements
    jsxIntrinsic: {
      category: 'identifier',
      rule: /\b(?:div|span|button|input|label|img|a|p|ul|ol|li|table|tr|td|th|thead|tbody|tfoot|form|select|option|textarea|header|footer|section|article|aside|nav|main|header|footer|h1|h2|h3|h4|h5|h6|strong|em|b|i|u|s|code|pre|blockquote|hr|br)\b/g,
    },
    // builtin types
    builtin: {
      category: 'identifier',
      rule: /\b(?:string|number|boolean|object|symbol|undefined|null)\b/g,
    },
    // here we want a regular expression to get all the js keywords
    keyword: {
      category: 'identifier',
      rule: /\b(?:import|from|function|return|const|let|var|if|else|while|for|in|of|new|class|extends|super|this|static|async|await|try|catch|throw|finally|break|continue|switch|case|default|export|as|with|delete|typeof|instanceof|void|null|undefined|true|false|get|set|constructor|arguments|eval|yield|implements|interface|package|private|protected|public|abstract|enum|type|declare|namespace|module|require|global|process|console|window|document|navigator|location|history|localStorage|sessionStorage|setTimeout|setInterval|clearTimeout|clearInterval|addEventListener|removeEventListener|dispatchEvent|fetch|XMLHttpRequest|Promise|then|reject|resolve|Symbol|Map|Set|WeakMap|WeakSet|Array|Object|Function|String|Number|Boolean|Date|RegExp|Error|EvalError|RangeError|ReferenceError|SyntaxError|TypeError|URIError|JSON|Math)\b/g,
    },
  },
};

const styleMap: Parameters<typeof toStringHTML>[1] = {
  identifier: 'text-foreground',
  symbol: 'text-foreground',
  keyword: 'text-foreground theme-red',
  number: 'text-foreground-4 theme-blue',
  string: 'text-foreground-2 theme-green',
  builtin: 'text-foreground-2 theme-yellow',
  // @ts-expect-error -- todo
  jsxIntrinsic: 'text-foreground-4 theme-purple',
};

export function CodeViewer() {
  return (
    <div className='grid gap-4'>
      <Code
        beforeBaseTransform={(src) => {
          const tokens = tokenize(src, js);
          return toStringHTML(tokens, styleMap);
        }}
        code={src}
      />
    </div>
  );
}
