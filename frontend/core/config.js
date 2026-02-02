// Application configuration
// Centralized configuration for API endpoints, ports, and other settings

export const CONFIG = {
    // API Configuration
    API_BASE_URL: window.location.origin, // Use same origin as the app
    API_PREFIX: '/api',

    // Default port (for documentation purposes)
    DEFAULT_PORT: 8001,

    // Canvas settings
    CANVAS_WIDTH: 2000,
    CANVAS_HEIGHT: 1500,

    // Auto-save delays
    POSITION_SAVE_DEBOUNCE_MS: 500,

    // Tolerance for position changes (px)
    POSITION_CHANGE_TOLERANCE: 5,

    // View names
    VIEWS: {
        CURRENT: 'baseline',
        TT: 'tt'
    },

    // Debug mode (enables verbose console logging)
    // Set to true to see detailed rendering and connection logs
    DEBUG_MODE: false
};

/**
 * Debug logger - only logs when DEBUG_MODE is enabled
 * @param {...any} args - Arguments to log
 */
export function debugLog(...args) {
    if (CONFIG.DEBUG_MODE) {
        console.log(...args);
    }
}

/**
 * Enable/disable debug mode at runtime
 * Usage in browser console:
 *   - enableDebugMode()  to turn on
 *   - disableDebugMode() to turn off
 */
if (typeof window !== 'undefined') {
    window.enableDebugMode = () => {
        CONFIG.DEBUG_MODE = true;
        console.log('✅ Debug mode enabled - you will now see detailed console outputs');
    };
    window.disableDebugMode = () => {
        CONFIG.DEBUG_MODE = false;
        console.log('❌ Debug mode disabled');
    };
}

// Helper to build full API URLs
export function getApiUrl(endpoint) {
    return `${CONFIG.API_BASE_URL}${CONFIG.API_PREFIX}${endpoint}`;
}
