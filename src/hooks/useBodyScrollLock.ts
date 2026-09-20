import { useEffect } from 'react';

let lockCount = 0;

/**
 * Custom hook to lock body scrolling when a modal, drawer, or overlay is open.
 * Uses a global reference counter to safely support nested / simultaneous modal scroll locks.
 * Guarantees document.body.style.overflow is reset to '' when all active modal locks are released.
 */
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;

    lockCount++;
    document.body.style.overflow = 'hidden';

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        document.body.style.overflow = '';
      }
    };
  }, [isLocked]);
}
