// src/utils/logger.ts

export const logger = {
    info: (...args: any[]) => {
        console.log("[INFO]", ...args);
    },
    warn: (...args: any[]) => {
        console.warn("[WARN]", ...args);
    },
    error: (...args: any[]) => {
        console.error("[ERROR]", ...args);
    },
    debug: (...args: any[]) => {
        if (__DEV__) { // Only log debug messages in development
            console.log("[DEBUG]", ...args);
        }
    },
};
