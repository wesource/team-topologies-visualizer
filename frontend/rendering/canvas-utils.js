/**
 * Canvas utilities: polyfills, hit detection, and helper functions
 * Extracted from renderer-common.js for better modularity
 */

/**
 * Polyfill for roundRect (older browsers)
 * Adds roundRect method to CanvasRenderingContext2D if not available
 */
export function initCanvasPolyfills() {
    if (!CanvasRenderingContext2D.prototype.roundRect) {
        CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
            const radius = typeof r === 'number' ? r : r[0];
            let effectiveRadius = radius;
            if (w < 2 * effectiveRadius)
                effectiveRadius = w / 2;
            if (h < 2 * effectiveRadius)
                effectiveRadius = h / 2;
            this.moveTo(x + effectiveRadius, y);
            this.arcTo(x + w, y, x + w, y + h, effectiveRadius);
            this.arcTo(x + w, y + h, x, y + h, effectiveRadius);
            this.arcTo(x, y + h, x, y, effectiveRadius);
            this.arcTo(x, y, x + w, y, effectiveRadius);
            this.closePath();
            return this;
        };
    }
}

/**
 * Get team at given canvas position (hit detection)
 * @param {Array} teams - Array of team objects
 * @param {number} x - Canvas x coordinate
 * @param {number} y - Canvas y coordinate
 * @param {Object} viewOffset - View offset {x, y}
 * @param {number} scale - View scale
 * @param {string} currentView - Current view ('current' or 'tt')
 * @param {string} currentPerspective - Current perspective ('hierarchy', 'product-lines', etc.)
 * @param {Map} customTeamPositions - Custom positions for teams (for special layouts)
 * @param {Function} getTeamBoxWidth - Function to get team box width
 * @param {Function} getTeamBoxHeight - Function to get team box height
 * @returns {Object|undefined} Team object if found
 */
export function getTeamAtPosition(teams, x, y, viewOffset, scale, currentView = 'current', currentPerspective = 'hierarchy', customTeamPositions = null, getTeamBoxWidth, getTeamBoxHeight) {
    const worldX = (x - viewOffset.x) / scale;
    const worldY = (y - viewOffset.y) / scale;

    // Special handling for product-lines, value-streams, and business-streams perspectives: check tracked positions
    if (currentView === 'current' && (currentPerspective === 'product-lines' || currentPerspective === 'value-streams' || currentPerspective === 'business-streams') && customTeamPositions) {
        // Check each team in the positions map
        for (const [teamName, bounds] of customTeamPositions.entries()) {
            if (worldX >= bounds.x && worldX <= bounds.x + bounds.width &&
                worldY >= bounds.y && worldY <= bounds.y + bounds.height) {
                // Find the full team object by name
                const team = teams.find(t => t.name === teamName);
                if (team) return team;
            }
        }
        return null;
    }

    // Standard hit detection using team.position
    return teams.find(team => {
        const teamWidth = getTeamBoxWidth(team, currentView);
        const teamHeight = getTeamBoxHeight(team, currentView);

        // Special hit detection for complicated-subsystem (octagon) in TT Design view
        if (currentView === 'tt' && team.team_type === 'complicated-subsystem') {
            return isPointInOctagon(worldX, worldY, team.position.x, team.position.y, teamWidth, teamHeight);
        }

        // Default: rectangular hit detection
        return worldX >= team.position.x &&
            worldX <= team.position.x + teamWidth &&
            worldY >= team.position.y &&
            worldY <= team.position.y + teamHeight;
    });
}

/**
 * Check if point is inside an octagon
 * Uses simplified approach: check if point is in bounding box minus corner triangles
 * @param {number} px - Point x coordinate
 * @param {number} py - Point y coordinate
 * @param {number} x - Octagon x position
 * @param {number} y - Octagon y position
 * @param {number} width - Octagon width
 * @param {number} height - Octagon height
 * @returns {boolean} True if point is inside octagon
 */
function isPointInOctagon(px, py, x, y, width, height) {
    const cornerSize = width * 0.167;

    // First check: must be in bounding box
    if (px < x || px > x + width || py < y || py > y + height) {
        return false;
    }

    // Check if point is in one of the cut-off corners
    // Top-left corner
    if (px < x + cornerSize && py < y + cornerSize) {
        // Check if below the diagonal line from (x, y+cornerSize) to (x+cornerSize, y)
        const relX = px - x;
        const relY = py - y;
        if (relX + relY < cornerSize) {
            return false;
        }
    }
    // Top-right corner
    if (px > x + width - cornerSize && py < y + cornerSize) {
        const relX = (x + width) - px;
        const relY = py - y;
        if (relX + relY < cornerSize) {
            return false;
        }
    }
    // Bottom-right corner
    if (px > x + width - cornerSize && py > y + height - cornerSize) {
        const relX = (x + width) - px;
        const relY = (y + height) - py;
        if (relX + relY < cornerSize) {
            return false;
        }
    }
    // Bottom-left corner
    if (px < x + cornerSize && py > y + height - cornerSize) {
        const relX = px - x;
        const relY = (y + height) - py;
        if (relX + relY < cornerSize) {
            return false;
        }
    }

    return true;
}
