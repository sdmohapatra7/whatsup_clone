/**
 * ADVANCED PERFORMANCE UTILITIES
 * Standard JavaScript implementations for Debounce and Throttle
 * used for event handlers and high-frequency function calls.
 */

export const debounce = (fn, delay) => {
    let timeoutId;
    return (...args) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            fn(...args);
        }, delay);
    };
};

export const throttle = (fn, interval) => {
    let lastTime = 0;
    return (...args) => {
        const now = Date.now();
        if (now - lastTime >= interval) {
            fn(...args);
            lastTime = now;
        }
    };
};
