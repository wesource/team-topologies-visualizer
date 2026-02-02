/**
 * Grouping rendering utilities for Team Topologies visualizations
 * Handles drawing value stream and platform groupings (outer and inner)
 */

// Value stream grouping style
const VALUE_STREAM_STYLE = {
    fillColor: 'rgba(255, 245, 215, 0.4)', // Very light yellow/orange background
    strokeColor: 'rgba(255, 200, 130, 0.5)', // Light orange border
    strokeWidth: 2,
    borderRadius: 0,
    labelFont: 'bold 16px sans-serif',
    labelColor: '#666',
    labelPadding: 10
};

// Platform grouping style (from TT 2nd edition - fractal pattern)
const PLATFORM_GROUPING_STYLE = {
    fillColor: 'rgba(126, 200, 227, 0.15)', // Very light blue background (lighter than platform teams)
    strokeColor: 'rgba(74, 159, 216, 0.4)', // Light blue border
    strokeWidth: 2,
    borderRadius: 0,
    labelFont: 'bold 16px sans-serif',
    labelColor: '#666',
    labelPadding: 10
};

// Inner grouping styles (darker than outer groupings, per TT book)
const VALUE_STREAM_INNER_STYLE = {
    fillColor: 'rgba(255, 210, 120, 0.4)', // Lighter orange/yellow (less brown, more vibrant)
    strokeColor: 'rgba(240, 180, 90, 0.6)', // Lighter orange border
    strokeWidth: 1.5, // Thinner stroke (reduced from 2)
    borderRadius: 0,
    labelFont: '13px sans-serif', // Smaller, non-bold font (reduced from bold 16px)
    labelColor: '#666', // Medium gray
    labelPadding: 3 // Much smaller gap between label and first team (reduced from 8)
};

const PLATFORM_GROUPING_INNER_STYLE = {
    fillColor: 'rgba(90, 170, 210, 0.3)', // Lighter blue (less saturated)
    strokeColor: 'rgba(70, 150, 200, 0.5)', // Lighter blue border
    strokeWidth: 1.5, // Thinner stroke (reduced from 2)
    borderRadius: 0,
    labelFont: '13px sans-serif', // Smaller, non-bold font (reduced from bold 16px)
    labelColor: '#666', // Medium gray
    labelPadding: 3 // Much smaller gap between label and first team (reduced from 8)
};

/**
 * Draws value stream grouping rectangles behind teams
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} groupings - Array of grouping objects from getValueStreamGroupings
 */
export function drawValueStreamGroupings(ctx, groupings) {
    if (!groupings || groupings.length === 0) {
        return;
    }

    groupings.forEach(grouping => {
        // Skip ungrouped teams (they don't get a visual grouping)
        if (grouping.name === '(Ungrouped)') {
            return;
        }

        const { x, y, width, height } = grouping.bounds;

        // Draw background rectangle
        ctx.fillStyle = VALUE_STREAM_STYLE.fillColor;
        ctx.strokeStyle = VALUE_STREAM_STYLE.strokeColor;
        ctx.lineWidth = VALUE_STREAM_STYLE.strokeWidth;

        ctx.beginPath();
        ctx.roundRect(x, y, width, height, VALUE_STREAM_STYLE.borderRadius);
        ctx.fill();

        const canSave = typeof ctx.save === 'function' && typeof ctx.restore === 'function';
        const previousLineCap = ctx.lineCap;
        if (canSave) ctx.save();
        if (typeof ctx.setLineDash === 'function') ctx.setLineDash([1, 4]);
        ctx.lineCap = 'round';
        ctx.stroke();
        if (typeof ctx.setLineDash === 'function') ctx.setLineDash([]);
        ctx.lineCap = previousLineCap;
        if (canSave) ctx.restore();

        // Draw label at top-center (banner style)
        ctx.fillStyle = VALUE_STREAM_STYLE.labelColor;
        ctx.font = VALUE_STREAM_STYLE.labelFont;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const labelX = x + width / 2;
        const labelY = y + VALUE_STREAM_STYLE.labelPadding;

        ctx.fillText(grouping.name, labelX, labelY);
    });
}

/**
 * Draws platform grouping rectangles behind teams
 * Platform Grouping is a fractal pattern from TT 2nd edition representing a team-of-teams
 * structure where multiple platform teams work together to provide capabilities.
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} groupings - Array of grouping objects (similar structure to value stream groupings)
 */
export function drawPlatformGroupings(ctx, groupings) {
    if (!groupings || groupings.length === 0) {
        return;
    }

    groupings.forEach(grouping => {
        // Skip ungrouped teams
        if (grouping.name === '(Ungrouped)') {
            return;
        }

        // Skip groupings with stale positions (teams too spread out)
        if (grouping.bounds.stale || grouping.bounds.width === 0 || grouping.bounds.height === 0) {
            return;
        }

        const { x, y, width, height } = grouping.bounds;

        // Draw background rectangle with platform grouping style
        ctx.fillStyle = PLATFORM_GROUPING_STYLE.fillColor;
        ctx.strokeStyle = PLATFORM_GROUPING_STYLE.strokeColor;
        ctx.lineWidth = PLATFORM_GROUPING_STYLE.strokeWidth;

        ctx.beginPath();
        ctx.roundRect(x, y, width, height, PLATFORM_GROUPING_STYLE.borderRadius);
        ctx.fill();

        const canSave = typeof ctx.save === 'function' && typeof ctx.restore === 'function';
        const previousLineCap = ctx.lineCap;
        if (canSave) ctx.save();
        if (typeof ctx.setLineDash === 'function') ctx.setLineDash([1, 4]);
        ctx.lineCap = 'round';
        ctx.stroke();
        if (typeof ctx.setLineDash === 'function') ctx.setLineDash([]);
        ctx.lineCap = previousLineCap;
        if (canSave) ctx.restore();

        // Draw label at top-center (banner style)
        ctx.fillStyle = PLATFORM_GROUPING_STYLE.labelColor;
        ctx.font = PLATFORM_GROUPING_STYLE.labelFont;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const labelX = x + width / 2;
        const labelY = y + PLATFORM_GROUPING_STYLE.labelPadding;

        ctx.fillText(grouping.name, labelX, labelY);
    });
}

/**
 * Draws value stream inner grouping rectangles (nested boxes)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} groupings - Array of inner grouping objects from getValueStreamInnerGroupings
 */
export function drawValueStreamInnerGroupings(ctx, groupings) {
    if (!groupings || groupings.length === 0) {
        return;
    }

    groupings.forEach(grouping => {
        const { x, y, width, height } = grouping.bounds;

        // Draw background rectangle with inner grouping style (lighter/subtler)
        ctx.fillStyle = VALUE_STREAM_INNER_STYLE.fillColor;
        ctx.strokeStyle = VALUE_STREAM_INNER_STYLE.strokeColor;
        ctx.lineWidth = VALUE_STREAM_INNER_STYLE.strokeWidth;

        ctx.beginPath();
        ctx.roundRect(x, y, width, height, VALUE_STREAM_INNER_STYLE.borderRadius);
        ctx.fill();

        const canSave = typeof ctx.save === 'function' && typeof ctx.restore === 'function';
        const previousLineCap = ctx.lineCap;
        if (canSave) ctx.save();
        if (typeof ctx.setLineDash === 'function') ctx.setLineDash([1, 4]);
        ctx.lineCap = 'round';
        ctx.stroke();
        if (typeof ctx.setLineDash === 'function') ctx.setLineDash([]);
        ctx.lineCap = previousLineCap;
        if (canSave) ctx.restore();

        // Draw label at top-center (smaller font, lighter)
        ctx.fillStyle = VALUE_STREAM_INNER_STYLE.labelColor;
        ctx.font = VALUE_STREAM_INNER_STYLE.labelFont;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const labelX = x + width / 2;
        const labelY = y + VALUE_STREAM_INNER_STYLE.labelPadding;

        ctx.fillText(grouping.name, labelX, labelY);
    });
}

/**
 * Draws platform inner grouping rectangles (nested boxes)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} groupings - Array of inner grouping objects from getPlatformInnerGroupings
 */
export function drawPlatformInnerGroupings(ctx, groupings) {
    if (!groupings || groupings.length === 0) {
        return;
    }

    groupings.forEach(grouping => {
        const { x, y, width, height } = grouping.bounds;

        // Draw background rectangle with inner grouping style (lighter/subtler)
        ctx.fillStyle = PLATFORM_GROUPING_INNER_STYLE.fillColor;
        ctx.strokeStyle = PLATFORM_GROUPING_INNER_STYLE.strokeColor;
        ctx.lineWidth = PLATFORM_GROUPING_INNER_STYLE.strokeWidth;

        ctx.beginPath();
        ctx.roundRect(x, y, width, height, PLATFORM_GROUPING_INNER_STYLE.borderRadius);
        ctx.fill();

        const canSave = typeof ctx.save === 'function' && typeof ctx.restore === 'function';
        const previousLineCap = ctx.lineCap;
        if (canSave) ctx.save();
        if (typeof ctx.setLineDash === 'function') ctx.setLineDash([1, 4]);
        ctx.lineCap = 'round';
        ctx.stroke();
        if (typeof ctx.setLineDash === 'function') ctx.setLineDash([]);
        ctx.lineCap = previousLineCap;
        if (canSave) ctx.restore();

        // Draw label at top-center (smaller font, lighter)
        ctx.fillStyle = PLATFORM_GROUPING_INNER_STYLE.labelColor;
        ctx.font = PLATFORM_GROUPING_INNER_STYLE.labelFont;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const labelX = x + width / 2;
        const labelY = y + PLATFORM_GROUPING_INNER_STYLE.labelPadding;

        ctx.fillText(grouping.name, labelX, labelY);
    });
}
