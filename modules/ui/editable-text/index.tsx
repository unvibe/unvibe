import clsx from 'clsx';
import type { Dispatch, SetStateAction } from 'react';
import { useRef, useState, useCallback } from 'react';

function getNodeLinesCount(node?: HTMLElement) {
  if (!node) return 1;

  const divHeight = node.offsetHeight;
  const lineHeight = Number(
    getComputedStyle(node).lineHeight.replace('px', '')
  );
  return divHeight / lineHeight;
}

export interface EditableTextProps {
  onChange: (title: string) => void;
  onClick?: () => void;
  onEnter?: () => void;
  onBlur?: () => void;
  onEscape?: () => void;
  inputClassName?: string;
  sharedClassName?: string;
  textClassName?: string;
  initialState?: boolean;
  inputPlaceholder?: string;
  value: string;
  children?: React.ReactNode;
  isEdit: boolean;
  setIsEdit: Dispatch<SetStateAction<boolean>>;
}

function getCaretCharacterOffsetFromPoint(
  element: HTMLElement,
  x: number,
  y: number
): number {
  let range;
  const textNode = element.firstChild;
  if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
    return 0;
  }
  if (document.caretPositionFromPoint) {
    const pos = document.caretPositionFromPoint(x, y);
    if (pos && pos.offset != null) return pos.offset;
  } else if (document.caretRangeFromPoint) {
    range = document.caretRangeFromPoint(x, y);
    if (range && range.startOffset != null) return range.startOffset;
  }
  const text = textNode.textContent || '';
  for (let i = 1; i <= text.length; i++) {
    const span = document.createElement('span');
    span.textContent = text.slice(0, i);
    element.appendChild(span);
    const rect = span.getBoundingClientRect();
    element.removeChild(span);
    if (x < rect.right) return i - 1;
  }
  return text.length;
}

function Core({
  onChange,
  onEnter,
  inputClassName,
  textClassName,
  sharedClassName,
  inputPlaceholder,
  onClick,
  onBlur,
  value,
  children,
  isEdit,
  setIsEdit,
}: EditableTextProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [lines, setLines] = useState(1);
  const selectionState = useRef<{
    pos: number | null;
  }>({ pos: null });

  const setupInput = useCallback((node: HTMLTextAreaElement | null) => {
    if (!node) return;

    const pos =
      selectionState.current.pos !== null
        ? selectionState.current.pos
        : node.value.length;

    node.setSelectionRange(pos, pos);
    node.focus();
  }, []);

  if (isEdit) {
    return (
      <textarea
        ref={setupInput}
        value={value}
        rows={lines}
        placeholder={inputPlaceholder}
        className={clsx(
          'w-full resize-none flex !m-0 p-0 appearance-none bg-transparent border-0 rounded-none focus:outline-none focus:ring-0',
          sharedClassName,
          inputClassName
        )}
        onBlur={() => {
          if (value) setIsEdit(false);
          onBlur?.();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.getModifierState('Shift')) {
            if (value) setIsEdit(false);
            onEnter?.();
          }

          if (e.key === 'Enter' && e.getModifierState('Shift')) {
            setLines((prev) => prev + 1);
          }

          if (e.key === 'Escape') {
            setIsEdit(false);
            onBlur?.();
          }
        }}
        onChange={(e) => {
          onChange(e.target.value);
        }}
      />
    );
  }
  return (
    <button
      type='button'
      ref={buttonRef}
      className={clsx(
        'w-full appearance-none text-start whitespace-pre-wrap',
        sharedClassName,
        textClassName
      )}
      onClick={(event) => {
        onClick?.();
        setLines(getNodeLinesCount(event.currentTarget));
        let offset = 0;
        try {
          offset = getCaretCharacterOffsetFromPoint(
            event.currentTarget,
            event.clientX,
            event.clientY
          );
        } catch {
          offset = value.length;
        }
        selectionState.current = { pos: offset };
        setIsEdit(true);
      }}
    >
      {children || value}
    </button>
  );
}

export function EditableText(props: EditableTextProps) {
  return (
    <div className='focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-4 ring-offset-background'>
      <Core {...props} />
    </div>
  );
}
