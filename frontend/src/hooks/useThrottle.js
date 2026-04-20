import { useState, useEffect, useRef } from 'react';

/**
 * ADVANCED HOOK: useThrottle
 * Ensures that a function is called at most once every 'interval' milliseconds.
 * 
 * Perfect for: Window resize, Scroll events, High-frequency UI feedback.
 */
export function useThrottle(value, interval) {
    const [throttledValue, setThrottledValue] = useState(value);
    const lastExecuted = useRef(Date.now());

    useEffect(() => {
        if (Date.now() >= lastExecuted.current + interval) {
            lastExecuted.current = Date.now();
            setThrottledValue(value);
        } else {
            const timerId = setTimeout(() => {
                lastExecuted.current = Date.now();
                setThrottledValue(value);
            }, interval);

            return () => clearTimeout(timerId);
        }
    }, [value, interval]);

    return throttledValue;
}
