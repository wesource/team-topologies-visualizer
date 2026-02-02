/**
 * Text rendering utilities: text wrapping and measurement
 * Extracted from renderer-common.js for better modularity
 */

/**
 * Wrap text to fit within a maximum width
 * @param {CanvasRenderingContext2D} ctx - Canvas context for text measurement
 * @param {string} text - Text to wrap
 * @param {number} maxWidth - Maximum width in pixels
 * @returns {Array<string>} Array of wrapped text lines
 */
export function wrapText(ctx, text, maxWidth) {
    // Handle non-string text
    if (!text || typeof text !== 'string') {
        console.warn('wrapText called with non-string text:', text);
        return [''];
    }
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];
    for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + ' ' + words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth) {
            lines.push(currentLine);
            currentLine = words[i];
        } else {
            currentLine = testLine;
        }
    }
    lines.push(currentLine);
    return lines;
}
