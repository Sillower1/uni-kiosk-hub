import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type Editable = HTMLInputElement | HTMLTextAreaElement | (HTMLElement & { isContentEditable: boolean });

function isEditable(el: Element | null): el is Editable {
  if (!el) return false;
  const tag = el.tagName?.toLowerCase();
  if (tag === 'input') {
    const type = (el as HTMLInputElement).type;
    return !['checkbox', 'radio', 'submit', 'button', 'file', 'range', 'color'].includes(type);
  }
  if (tag === 'textarea') return true;
  const anyEl = el as any;
  return !!anyEl?.isContentEditable;
}

function insertText(target: Editable, text: string) {
  const input = target as HTMLInputElement | HTMLTextAreaElement;
  if (typeof (input as any).setRangeText === 'function' && input.selectionStart != null) {
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    input.setRangeText(text, start, end, 'end');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    return;
  }
  // contentEditable fallback
  try {
    document.execCommand('insertText', false, text);
  } catch {
    // noop
  }
}

function backspace(target: Editable) {
  const input = target as HTMLInputElement | HTMLTextAreaElement;
  if (typeof (input as any).setRangeText === 'function' && input.selectionStart != null) {
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    if (start !== end) {
      input.setRangeText('', start, end, 'end');
    } else if (start > 0) {
      input.setRangeText('', start - 1, start, 'end');
    }
    input.dispatchEvent(new Event('input', { bubbles: true }));
    return;
  }
  try {
    document.execCommand('delete');
  } catch {
    // noop
  }
}

const ROWS: Array<Array<string | { key: string; wide?: boolean }>> = [
  ['q','w','e','r','t','y','u','i','o','p'],
  ['a','s','d','f','g','h','j','k','l','ı','i'],
  ['z','x','c','v','b','n','m','ö','ç','ş'],
];

export function OnScreenKeyboard() {
  const [visible, setVisible] = useState(false);
  const [shift, setShift] = useState(false);
  const activeRef = useRef<Editable | null>(null);

  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      const target = e.target as Element | null;
      if (isEditable(target)) {
        activeRef.current = target;
        setVisible(true);
      }
    };
    const onFocusOut = (e: FocusEvent) => {
      const related = (e.relatedTarget as Element | null) || document.activeElement;
      if (!isEditable(related)) {
        // Delay to allow clicks on keyboard to keep focus behavior
        setTimeout(() => {
          const stillActive = document.activeElement;
          if (!isEditable(stillActive)) {
            activeRef.current = null;
            setVisible(false);
          }
        }, 50);
      }
    };
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    return () => {
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
    };
  }, []);

  const handleKey = (k: string) => {
    const target = activeRef.current;
    if (!target) return;
    insertText(target, shift ? k.toUpperCase() : k);
  };

  if (!visible) return null;

  return (
    <div className={cn(
      'fixed inset-x-0 bottom-20 z-50',
      'mx-auto max-w-5xl w-full px-2'
    )}>
      <div className="rounded-xl shadow-lg bg-background border border-border p-2">
        <div className="flex flex-col gap-2 select-none">
          {ROWS.map((row, idx) => (
            <div key={idx} className="flex gap-1 justify-center">
              {row.map((k) => {
                const key = typeof k === 'string' ? k : k.key;
                return (
                  <button
                    key={key}
                    type="button"
                    className="px-3 py-2 rounded-md bg-muted hover:bg-muted/80 text-sm font-medium"
                    onMouseDown={(e) => { e.preventDefault(); handleKey(key); }}
                  >
                    {shift ? key.toUpperCase() : key}
                  </button>
                );
              })}
            </div>
          ))}
          <div className="flex gap-1 justify-center">
            <button
              type="button"
              className={cn('px-3 py-2 rounded-md bg-muted hover:bg-muted/80 text-sm font-medium', shift && 'bg-primary text-primary-foreground')}
              onMouseDown={(e) => { e.preventDefault(); setShift((s) => !s); }}
            >
              Shift
            </button>
            <button
              type="button"
              className="px-3 py-2 rounded-md bg-muted hover:bg-muted/80 text-sm font-medium"
              onMouseDown={(e) => { e.preventDefault(); const t = activeRef.current; if (t) backspace(t); }}
            >
              ←
            </button>
            <button
              type="button"
              className="flex-1 px-3 py-2 rounded-md bg-muted hover:bg-muted/80 text-sm font-medium"
              onMouseDown={(e) => { e.preventDefault(); const t = activeRef.current; if (t) insertText(t, ' '); }}
            >
              Space
            </button>
            <button
              type="button"
              className="px-3 py-2 rounded-md bg-muted hover:bg-muted/80 text-sm font-medium"
              onMouseDown={(e) => { e.preventDefault(); const t = activeRef.current; if (t) insertText(t, '\n'); }}
            >
              Enter
            </button>
            <button
              type="button"
              className="px-3 py-2 rounded-md bg-muted hover:bg-muted/80 text-sm font-medium"
              onMouseDown={(e) => { e.preventDefault(); setVisible(false); }}
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnScreenKeyboard;


