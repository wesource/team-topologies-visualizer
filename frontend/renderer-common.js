// Common rendering functions for teams and connections

// Interaction mode styles
export const INTERACTION_STYLES = {
    'collaboration': { dash: [], width: 3, color: '#FF6B6B' },
    'x-as-a-service': { dash: [10, 5], width: 2, color: '#4ECDC4' },
    'facilitating': { dash: [5, 5], width: 2, color: '#95E1D3' }
};

export function drawTeam(ctx, team, selectedTeam, teamColorMap, wrapText) {
    const x = team.position.x;
    const y = team.position.y;
    const width = 180;
    const height = 80;
    const radius = 8;

    // Shadow
    if (selectedTeam === team) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;
    }

    // Background
    ctx.fillStyle = getTeamColor(team, teamColorMap);
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.fill();

    ctx.shadowColor = 'transparent';

    // Border for selected team
    if (selectedTeam === team) {
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    // Team name
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const lines = wrapText(team.name, width - 20);
    lines.forEach((line, i) => {
        ctx.fillText(line, x + width / 2, y + height / 2 - (lines.length - 1) * 8 + i * 16);
    });
}

export function drawConnections(ctx, teams) {
    teams.forEach(team => {
        if (team.interaction_modes) {
            Object.entries(team.interaction_modes).forEach(([targetName, mode]) => {
                const target = teams.find(t => t.name === targetName);
                if (target) {
                    drawConnection(ctx, team, target, mode);
                }
            });
        }
    });
}

function drawConnection(ctx, from, to, mode) {
    const style = INTERACTION_STYLES[mode] || INTERACTION_STYLES['collaboration'];

    const fromX = from.position.x + 90;
    const fromY = from.position.y + 40;
    const toX = to.position.x + 90;
    const toY = to.position.y + 40;

    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.width;
    ctx.setLineDash(style.dash);

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Arrow
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const arrowLength = 10;
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
        toX - arrowLength * Math.cos(angle - Math.PI / 6),
        toY - arrowLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(toX, toY);
    ctx.lineTo(
        toX - arrowLength * Math.cos(angle + Math.PI / 6),
        toY - arrowLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();

    ctx.setLineDash([]);
}

function getTeamColor(team, teamColorMap) {
    // Try to get color from team type config
    if (team.team_type && teamColorMap[team.team_type]) {
        return teamColorMap[team.team_type];
    }

    // Final fallback
    return '#95a5a6';
}

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

export function getTeamAtPosition(teams, x, y, viewOffset, scale) {
    const worldX = (x - viewOffset.x) / scale;
    const worldY = (y - viewOffset.y) / scale;

    return teams.find(team =>
        worldX >= team.position.x &&
        worldX <= team.position.x + 180 &&
        worldY >= team.position.y &&
        worldY <= team.position.y + 80
    );
}

// Polyfill for roundRect (older browsers)
export function initCanvasPolyfills() {
    if (!CanvasRenderingContext2D.prototype.roundRect) {
        CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
            if (w < 2 * r) r = w / 2;
            if (h < 2 * r) r = h / 2;
            this.moveTo(x + r, y);
            this.arcTo(x + w, y, x + w, y + h, r);
            this.arcTo(x + w, y + h, x, y + h, r);
            this.arcTo(x, y + h, x, y, r);
            this.arcTo(x, y, x + w, y, r);
            this.closePath();
            return this;
        };
    }
}
