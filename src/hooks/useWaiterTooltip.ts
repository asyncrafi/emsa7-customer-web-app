import { useState, useEffect, useRef } from 'react';

interface UseWaiterTooltipOptions {
  /** How long to show the tooltip on initial page load (ms). Default: 5000ms (5s) */
  initialShowDurationMs?: number;
  /** Interval between periodic reappearances (ms). Default: 120000ms (2 minutes) */
  intervalMs?: number;
  /** How long to remain visible during periodic reappearance (ms). Default: 5000ms (5s) */
  reappearDurationMs?: number;
}

/**
 * Hook to dynamically show/hide the "Call a Waiter" tooltip.
 * Shows initially on mount for a few seconds to introduce the feature,
 * then smoothly hides, and reappears periodically (e.g. every 2 minutes) for 5 seconds.
 * Also supports hover states so desktop users can see it on mouse over.
 */
export function useWaiterTooltip({
  initialShowDurationMs = 5000,
  intervalMs = 120000, // 2 minutes
  reappearDurationMs = 5000,
}: UseWaiterTooltipOptions = {}) {
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // 1. Initial appearance on mount for initialShowDurationMs
    hideTimerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, initialShowDurationMs);

    // 2. Periodic reappearance every intervalMs
    const interval = setInterval(() => {
      setIsVisible(true);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
      hideTimerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, reappearDurationMs);
    }, intervalMs);

    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
      clearInterval(interval);
    };
  }, [initialShowDurationMs, intervalMs, reappearDurationMs]);

  const showTooltip = () => setIsHovered(true);
  const hideTooltip = () => setIsHovered(false);
  const dismissTooltip = () => {
    setIsVisible(false);
    setIsHovered(false);
  };

  return {
    show: isVisible || isHovered,
    onMouseEnter: showTooltip,
    onMouseLeave: hideTooltip,
    dismiss: dismissTooltip,
  };
}
