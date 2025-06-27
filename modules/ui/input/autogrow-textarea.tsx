import React, { useRef, useLayoutEffect, useState } from 'react';

export interface AutogrowTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minRows?: number;
  maxRows?: number;
}

/**
 * A textarea that grows with newlines, fully transparent/borderless, with scroll at maxRows.
 */
export const AutogrowTextarea: React.FC<AutogrowTextareaProps> = ({
  minRows = 1,
  maxRows = 6,
  style,
  ...props
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [overflowY, setOverflowY] = useState<'hidden' | 'auto'>('hidden');

  const resize = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const computed = window.getComputedStyle(textarea);
    let lineHeight = parseFloat(computed.lineHeight);
    if (isNaN(lineHeight)) lineHeight = 24;
    textarea.style.height = 'auto';
    const boxSizing = computed.boxSizing;
    const borderHeight =
      boxSizing === 'border-box'
        ? (parseFloat(computed.borderTopWidth) || 0) +
          (parseFloat(computed.borderBottomWidth) || 0)
        : 0;
    const paddingHeight =
      (parseFloat(computed.paddingTop) || 0) +
      (parseFloat(computed.paddingBottom) || 0);
    const minHeight = minRows * lineHeight + paddingHeight + borderHeight;
    const maxHeight = maxRows * lineHeight + paddingHeight + borderHeight;

    const targetHeight = Math.max(
      minHeight,
      Math.min(maxHeight, textarea.scrollHeight)
    );
    textarea.style.height = targetHeight + 'px';

    // Enable scroll only if content exceeds max
    if (textarea.scrollHeight > maxHeight) {
      setOverflowY('auto');
    } else {
      setOverflowY('hidden');
    }
  };

  useLayoutEffect(() => {
    resize();
    // Only on remount/value change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.value]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    resize();
    if (props.onChange) props.onChange(e);
  };

  return (
    <textarea
      {...props}
      ref={textareaRef}
      rows={minRows}
      onInput={handleInput}
      className={
        (props.className ? props.className + ' ' : '') +
        'outline-none resize-none w-full bg-transparent border-none p-0 m-0 shadow-none appearance-none focus:ring-0 focus:outline-none text-inherit font-inherit placeholder:text-foreground-3'
      }
      style={{
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        overflowY,
        resize: 'none',
        ...style,
      }}
    />
  );
};

export default AutogrowTextarea;
