import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'emsa7_waiter_cooldown_until';
const COOLDOWN_DURATION_MS = 120 * 1000; // 2 minutes

export function useWaiterCooldown() {
  const getRemainingSeconds = (): number => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return 0;
      const until = parseInt(stored, 10);
      const remaining = Math.ceil((until - Date.now()) / 1000);
      return remaining > 0 ? remaining : 0;
    } catch {
      return 0;
    }
  };

  const [remainingSeconds, setRemainingSeconds] = useState<number>(getRemainingSeconds);

  useEffect(() => {
    const checkTime = () => {
      const rem = getRemainingSeconds();
      setRemainingSeconds(rem);
    };

    checkTime();

    const interval = setInterval(checkTime, 1000);

    const handleCustomUpdate = () => {
      checkTime();
    };

    window.addEventListener('storage', handleCustomUpdate);
    window.addEventListener('emsa7_waiter_cooldown_change', handleCustomUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleCustomUpdate);
      window.removeEventListener('emsa7_waiter_cooldown_change', handleCustomUpdate);
    };
  }, []);

  const startCooldown = useCallback(() => {
    try {
      const until = Date.now() + COOLDOWN_DURATION_MS;
      localStorage.setItem(STORAGE_KEY, until.toString());
      setRemainingSeconds(120);
      window.dispatchEvent(new Event('emsa7_waiter_cooldown_change'));
    } catch {
      // Fallback
    }
  }, []);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return {
    isCooldown: remainingSeconds > 0,
    remainingSeconds,
    formattedTime,
    startCooldown,
  };
}
