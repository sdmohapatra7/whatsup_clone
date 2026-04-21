import { useState, useRef, useEffect } from 'react';

/**
 * ADVANCED HOOK: useThrottle
 * Ensures a function/value is only updated once every 'interval' milliseconds.
 * 
 * Perfect for: Scroll events, resizing, or limiting high-frequency state updates.
 */
export function useThrottle(value, interval) {
    const [throttledValue, setThrottledValue] = useState(value);
    const lastExecuted = useRef(Date.now());

    useEffect(() => {
        const now = Date.now();
        const remainingTime = interval - (now - lastExecuted.current);

        if (remainingTime <= 0) {
            setThrottledValue(value);
            lastExecuted.current = now;
        } else {
            const handler = setTimeout(() => {
                setThrottledValue(value);
                lastExecuted.current = Date.now();
            }, remainingTime);

            return () => clearTimeout(handler);
        }
    }, [value, interval]);

    return throttledValue;
}
