import { useState, useEffect } from 'react';

/**
 * ADVANCED HOOK: useDebounce
 * Delays the execution of a function until after 'delay' milliseconds 
 * have passed since the last time it was invoked.
 * 
 * Perfect for: Search inputs, API calls on typing.
 */
export function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}
