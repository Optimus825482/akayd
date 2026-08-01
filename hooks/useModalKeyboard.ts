import { useCallback, useEffect, useRef } from 'react';

/** Modal/overlay için klavye kapanışı — ESC kapatır, Tab içeride tutar */
export function useModalKeyboard(
  isOpen: boolean,
  onClose: () => void,
  focusFirst?: string // CSS selector for first focusable element
) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && containerRef.current) {
        const focusable = containerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    // Focus first element
    if (focusFirst && containerRef.current) {
      setTimeout(() => {
        const el = containerRef.current?.querySelector<HTMLElement>(focusFirst);
        el?.focus();
      }, 50);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown, focusFirst]);

  return containerRef;
}
