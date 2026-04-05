import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseQuizTimerProps {
  timeLimit: number; // in seconds
  onTimeExpired?: () => void;
  onAutoSave?: () => Promise<void>;
  autoSaveInterval?: number; // in seconds, default 30
}

export interface UseQuizTimerReturn {
  timeRemaining: number;
  isExpired: boolean;
  isPaused: boolean;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  formatTime: (seconds: number) => string;
  timeRemainingFormatted: string;
  isAutoSaving: boolean;
}

/**
 * Hook for managing quiz timer with auto-save functionality
 *
 * Features:
 * - Client-side countdown timer
 * - Auto-save at regular intervals (default 30 seconds)
 * - Pause/resume functionality
 * - Formatted time display (MM:SS)
 * - Auto-submit on timer expiration
 *
 * @param timeLimit - Quiz time limit in seconds
 * @param onTimeExpired - Callback when timer expires
 * @param onAutoSave - Async callback for auto-save (server sync)
 * @param autoSaveInterval - Interval for auto-save in seconds (default 30)
 * @returns Timer state and control functions
 *
 * @example
 * const {
 *   timeRemaining,
 *   isExpired,
 *   timeRemainingFormatted,
 *   pause,
 *   resume,
 *   isAutoSaving
 * } = useQuizTimer({
 *   timeLimit: 3600, // 1 hour
 *   onTimeExpired: handleSubmit,
 *   onAutoSave: saveProgressToServer,
 *   autoSaveInterval: 30
 * });
 */
export function useQuizTimer({
  timeLimit,
  onTimeExpired,
  onAutoSave,
  autoSaveInterval = 30,
}: UseQuizTimerProps): UseQuizTimerReturn {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [isExpired, setIsExpired] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastAutoSaveRef = useRef(0);

  // Format seconds to MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(Math.max(0, seconds) / 60);
    const secs = Math.max(0, seconds) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Main timer effect
  useEffect(() => {
    if (isExpired || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1;

        if (newTime <= 0) {
          setIsExpired(true);
          if (onTimeExpired) {
            onTimeExpired();
          }
          return 0;
        }

        return newTime;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isExpired, isPaused, onTimeExpired]);

  // Auto-save effect (30-second interval)
  useEffect(() => {
    if (isExpired || isPaused || !onAutoSave) {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
        autoSaveIntervalRef.current = null;
      }
      return;
    }

    // Perform initial auto-save after first interval
    autoSaveIntervalRef.current = setInterval(async () => {
      const now = Date.now();
      const timeSinceLastSave = (now - lastAutoSaveRef.current) / 1000;

      // Only save if enough time has passed (avoid rapid consecutive saves)
      if (timeSinceLastSave >= autoSaveInterval) {
        try {
          setIsAutoSaving(true);
          await onAutoSave();
          lastAutoSaveRef.current = now;
        } catch (error) {
          console.error('Auto-save failed:', error);
          // Don't stop the timer on auto-save failure
        } finally {
          setIsAutoSaving(false);
        }
      }
    }, autoSaveInterval * 1000);

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [isExpired, isPaused, onAutoSave, autoSaveInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, []);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const reset = useCallback(() => {
    setTimeRemaining(timeLimit);
    setIsExpired(false);
    setIsPaused(false);
    lastAutoSaveRef.current = 0;
  }, [timeLimit]);

  return {
    timeRemaining,
    isExpired,
    isPaused,
    pause,
    resume,
    reset,
    formatTime,
    timeRemainingFormatted: formatTime(timeRemaining),
    isAutoSaving,
  };
}

/**
 * Hook for display-only timer (no auto-save)
 * Use this for simple countdown displays
 */
export function useSimpleTimer(timeLimit: number, onTimeExpired?: () => void) {
  const { timeRemaining, isExpired, timeRemainingFormatted } = useQuizTimer({
    timeLimit,
    onTimeExpired,
  });

  return { timeRemaining, isExpired, timeRemainingFormatted };
}
