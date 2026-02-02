/**
 * Color manipulation utilities
 * Extracted from renderer-common.js for better modularity
 */

/**
 * Darken a hex color by a factor
 * @param {string} hex - Hex color code (e.g., '#FF5733')
 * @param {number} factor - Darkening factor (0-1, default 0.7)
 * @returns {string} Darkened hex color
 */
export function darkenColor(hex, factor = 0.7) {
    if (!hex || typeof hex !== 'string') return '#333'; // Default dark color
    const rgb = parseInt(hex.slice(1), 16);
    const r = Math.floor(((rgb >> 16) & 255) * factor);
    const g = Math.floor(((rgb >> 8) & 255) * factor);
    const b = Math.floor((rgb & 255) * factor);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/**
 * Get cognitive load indicator color and emoji
 * @param {string} level - Cognitive load level (low, low-medium, medium, high, very-high)
 * @returns {Object|null} { color, emoji } for the cognitive load level
 */
export function getCognitiveLoadIndicator(level) {
    if (!level) return null;

    const normalized = level.toLowerCase().trim();

    // Traffic light colors: green (low), yellow (medium), red (high)
    const indicators = {
        'low': { color: '#4CAF50', emoji: '🟢' },
        'low-medium': { color: '#8BC34A', emoji: '🟢' },
        'medium': { color: '#FFC107', emoji: '🟡' },
        'high': { color: '#FF5722', emoji: '🔴' },
        'very-high': { color: '#D32F2F', emoji: '🔴' }
    };

    return indicators[normalized] || null;
}
