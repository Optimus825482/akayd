import { useEffect } from 'react';

/** Body scroll kilidi — mobil menü/modal açıkken arka plan kaydırmasını engeller */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [locked]);
}
