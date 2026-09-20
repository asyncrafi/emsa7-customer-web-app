import { useEffect } from 'react';

/**
 * Custom hook to lock body scrolling when a modal, drawer, or overlay is open.
 * Prevents background content from scrolling or being interacted with underneath.
 */
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;

    // Save previous inline styles
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;

    // Lock body scrolling
    document.body.style.overflow = 'hidden';

    return () => {
      // Restore previous inline styles when modal closes
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [isLocked]);
}
