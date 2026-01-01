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
        CURRENT: 'current',
        TT: 'tt'
    }
};

// Helper to build full API URLs
export function getApiUrl(endpoint) {
    return `${CONFIG.API_BASE_URL}${CONFIG.API_PREFIX}${endpoint}`;
}
