// Unified notification system for user feedback
// Replaces inconsistent alert() and console.error() calls

/**
 * Show an error notification to the user
 * @param {string} message - Error message to display
 * @param {Error} [error] - Optional error object for logging
 */
export function showError(message, error = null) {
    if (error) {
        console.error(message, error);
    } else {
        console.error(message);
    }
    alert(`❌ Error: ${message}`);
}

/**
 * Show a success notification to the user
 * @param {string} message - Success message to display
 */
export function showSuccess(message) {
    console.log(`✓ ${message}`);
    alert(`✓ ${message}`);
}

/**
 * Show an info notification to the user
 * @param {string} message - Info message to display
 */
export function showInfo(message) {
    console.info(message);
    alert(`ℹ️ ${message}`);
}

/**
 * Show a warning notification
 * @param {string} message - Warning message to display
 */
export function showWarning(message) {
    console.warn(message);
    alert(`⚠️ ${message}`);
}

/**
 * Log an error without showing to user (for non-critical issues)
 * @param {string} message - Error message to log
 * @param {Error} [error] - Optional error object
 */
export function logError(message, error = null) {
    if (error) {
        console.error(message, error);
    } else {
        console.error(message);
    }
}
