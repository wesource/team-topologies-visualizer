// Configuration
const API_BASE = 'http://localhost:8000/api';

// Team type configurations (loaded from API)
let teamTypeConfig = { team_types: [] };
let teamColorMap = {};

// Department colors (for Current State - legacy, kept for backward compatibility)
const DEPARTMENT_COLORS = {
    'Engineering': '#3498db',
    'Customer Solutions': '#e74c3c',
    'Product Management': '#9b59b6',
    'Support': '#f39c12',
    'Infrastructure': '#1abc9c',
    'Data & Analytics': '#34495e',
    'Leadership': '#95a5a6'
};

// Interaction mode styles
const INTERACTION_STYLES = {
    'collaboration': { dash: [], width: 3, color: '#FF6B6B' },
    'x-as-a-service': { dash: [10, 5], width: 2, color: '#4ECDC4' },
    'facilitating': { dash: [5, 5], width: 2, color: '#95E1D3' }
};

// Canvas and state
let canvas, ctx;
let teams = [];
let organizationHierarchy = null;
let selectedTeam = null;
let draggedTeam = null;
let dragOffset = { x: 0, y: 0 };
let dragStartPosition = null;
let hasDragged = false;
let viewOffset = { x: 0, y: 0 };
let scale = 1;
let currentView = 'current';  // 'current' or 'tt'

// Initialize
document.addEventListener('DOMContentLoaded', init);

function init() {
    canvas = document.getElementById('teamCanvas');
    ctx = canvas.getContext('2d');

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Canvas interactions
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('dblclick', handleDoubleClick);
    canvas.addEventListener('wheel', handleWheel);

    // UI interactions
    document.querySelectorAll('input[name="view"]').forEach(radio => {
        radio.addEventListener('change', handleViewChange);
    });
    document.getElementById('addTeamBtn').addEventListener('click', openAddTeamModal);
    document.getElementById('refreshBtn').addEventListener('click', loadTeams);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('teamForm').addEventListener('submit', handleTeamSubmit);
    document.querySelector('.close').addEventListener('click', closeModal);
    document.getElementById('detailModalClose').addEventListener('click', closeDetailModal);

    // Load initial data
    loadTeams();
}

function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    draw();
}

async function loadTeams() {
    try {
        // Load team type configuration first
        const configResponse = await fetch(`${API_BASE}/team-types?view=${currentView}`);
        teamTypeConfig = await configResponse.json();

        // Build color map from config
        teamColorMap = {};
        teamTypeConfig.team_types.forEach(type => {
            teamColorMap[type.id] = type.color;
        });

        // Load organization hierarchy if in current view
        if (currentView === 'current') {
            try {
                const hierarchyResponse = await fetch(`${API_BASE}/organization-hierarchy`);
                organizationHierarchy = await hierarchyResponse.json();
            } catch (error) {
                console.warn('Failed to load organization hierarchy:', error);
                organizationHierarchy = null;
            }
        } else {
            organizationHierarchy = null;
        }

        // Load teams
        const response = await fetch(`${API_BASE}/teams?view=${currentView}`);
        teams = await response.json();

        // Assign random positions if not set
        teams.forEach((team, index) => {
            if (!team.position || (team.position.x === 0 && team.position.y === 0)) {
                team.position = {
                    x: 100 + (index % 3) * 250,
                    y: 100 + Math.floor(index / 3) * 150
                };
            }
        });

        updateTeamList();
        updateLegend();
        draw();
    } catch (error) {
        console.error('Failed to load teams:', error);
    }
}

function handleViewChange(e) {
    currentView = e.target.value;
    loadTeams();
}

function updateTeamList() {
    const teamList = document.getElementById('teamList');
    teamList.innerHTML = '';

    teams.forEach(team => {
        const item = document.createElement('div');
        item.className = `team-item ${team.team_type}`;
        item.textContent = team.name;
        item.addEventListener('click', () => selectTeam(team));
        teamList.appendChild(item);
    });
}

function updateLegend() {
    const legendDiv = document.querySelector('.legend');

    // Build legend from team type config
    let legendHTML = '<h4>' + (currentView === 'current' ? 'Team Types' : 'Team Types') + '</h4>';

    teamTypeConfig.team_types.forEach(type => {
        legendHTML += `
            <div class="legend-item" title="${type.description}">
                <span class="legend-color" style="background: ${type.color};"></span>
                <span>${type.name}</span>
            </div>
        `;
    });

    legendDiv.innerHTML = legendHTML;
}

function getTeamColor(team) {
    // Try to get color from team type config
    if (team.team_type && teamColorMap[team.team_type]) {
        return teamColorMap[team.team_type];
    }

    // Fallback to department colors if in current view
    if (currentView === 'current' && team.metadata?.department) {
        return DEPARTMENT_COLORS[team.metadata.department] || '#95a5a6';
    }

    // Final fallback
    return '#95a5a6';
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(viewOffset.x, viewOffset.y);
    ctx.scale(scale, scale);

    // Draw organization hierarchy if in current view
    if (currentView === 'current' && organizationHierarchy) {
        drawOrganizationHierarchy();
    }

    // Draw connections first
    drawConnections();

    // Draw teams
    teams.forEach(team => drawTeam(team));

    ctx.restore();
}

function drawOrganizationHierarchy() {
    const startX = 50;
    const startY = 50;
    const levelHeight = 120;
    const boxWidth = 200;
    const boxHeight = 60;

    // Draw company leadership
    const company = organizationHierarchy.company;
    drawHierarchyBox(company.name, startX + 400, startY, boxWidth + 100, boxHeight, '#34495e', 'white', true);

    // Draw departments
    const deptCount = company.children.length;
    const deptSpacing = 250;
    const deptStartX = startX + 50;

    company.children.forEach((dept, index) => {
        const deptX = deptStartX + index * deptSpacing;
        const deptY = startY + levelHeight;

        // Draw line from company to department
        drawHierarchyLine(startX + 400 + (boxWidth + 100) / 2, startY + boxHeight, deptX + boxWidth / 2, deptY);

        // Draw department box
        drawHierarchyBox(dept.name, deptX, deptY, boxWidth, boxHeight, '#2c3e50', 'white', false);

        // If it's engineering, draw the VP and line managers
        if (dept.id === 'engineering-dept' && dept.manager && dept.line_managers) {
            const vpY = deptY + levelHeight;
            const vpX = deptX;

            // Draw line from department to VP
            drawHierarchyLine(deptX + boxWidth / 2, deptY + boxHeight, vpX + boxWidth / 2, vpY);

            // Draw VP box
            drawHierarchyBox(dept.manager.name, vpX, vpY, boxWidth, boxHeight, '#16a085', 'white', false);

            // Draw line managers
            const lmCount = dept.line_managers.length;
            const lmSpacing = 220;
            const lmStartX = vpX - ((lmCount - 1) * lmSpacing) / 2;

            dept.line_managers.forEach((lm, lmIndex) => {
                const lmX = lmStartX + lmIndex * lmSpacing;
                const lmY = vpY + levelHeight;

                // Draw line from VP to line manager
                drawHierarchyLine(vpX + boxWidth / 2, vpY + boxHeight, lmX + boxWidth / 2, lmY);

                // Draw line manager box
                drawHierarchyBox(lm.name, lmX, lmY, boxWidth, boxHeight - 10, '#27ae60', 'white', false);

                // Draw teams under line manager
                lm.teams.forEach((teamName, teamIndex) => {
                    const team = teams.find(t => t.name === teamName);
                    if (team) {
                        const teamY = lmY + levelHeight;

                        // Update team position to align under line manager
                        // Only update if team hasn't been manually positioned (very far from default)
                        const defaultY = 100 + Math.floor(teams.indexOf(team) / 3) * 150;
                        if (Math.abs(team.position.y - defaultY) < 200) {
                            team.position.x = lmX + (teamIndex * 20);
                            team.position.y = teamY;
                        }

                        // Draw line from line manager to team
                        drawHierarchyLine(lmX + boxWidth / 2, lmY + boxHeight - 10, team.position.x + 90, team.position.y);
                    }
                });
            });
        }
    });
}

function drawHierarchyBox(text, x, y, width, height, bgColor, textColor, isLeadership) {
    const radius = 5;

    // Draw box
    ctx.fillStyle = bgColor;
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.fill();
    ctx.stroke();

    // Draw text
    ctx.fillStyle = textColor;
    ctx.font = isLeadership ? 'bold 14px sans-serif' : '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const lines = wrapText(text, width - 20);
    lines.forEach((line, i) => {
        ctx.fillText(line, x + width / 2, y + height / 2 - (lines.length - 1) * 7 + i * 14);
    });
}

function drawHierarchyLine(x1, y1, x2, y2) {
    ctx.strokeStyle = '#7f8c8d';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.moveTo(x1, y1);

    // Draw a vertical then horizontal line for cleaner org chart look
    const midY = (y1 + y2) / 2;
    ctx.lineTo(x1, midY);
    ctx.lineTo(x2, midY);
    ctx.lineTo(x2, y2);

    ctx.stroke();
}

function drawTeam(team) {
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
    ctx.fillStyle = getTeamColor(team);
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

function drawConnections() {
    teams.forEach(team => {
        if (team.interaction_modes) {
            Object.entries(team.interaction_modes).forEach(([targetName, mode]) => {
                const target = teams.find(t => t.name === targetName);
                if (target) {
                    drawConnection(team, target, mode);
                }
            });
        }
    });
}

function drawConnection(from, to, mode) {
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

function wrapText(text, maxWidth) {
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

function getTeamAtPosition(x, y) {
    const worldX = (x - viewOffset.x) / scale;
    const worldY = (y - viewOffset.y) / scale;

    return teams.find(team =>
        worldX >= team.position.x &&
        worldX <= team.position.x + 180 &&
        worldY >= team.position.y &&
        worldY <= team.position.y + 80
    );
}

function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const team = getTeamAtPosition(x, y);
    if (team) {
        draggedTeam = team;
        dragStartPosition = { x: team.position.x, y: team.position.y };
        hasDragged = false;
        dragOffset = {
            x: (x - viewOffset.x) / scale - team.position.x,
            y: (y - viewOffset.y) / scale - team.position.y
        };
        selectedTeam = team;
        draw();
    }
}

function handleMouseMove(e) {
    if (draggedTeam) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const newX = (x - viewOffset.x) / scale - dragOffset.x;
        const newY = (y - viewOffset.y) / scale - dragOffset.y;

        const deltaX = Math.abs(newX - dragStartPosition.x);
        const deltaY = Math.abs(newY - dragStartPosition.y);

        // Check if actually moved (threshold of 2 pixels)
        if (deltaX > 2 || deltaY > 2) {
            hasDragged = true;
            draggedTeam.position.x = newX;
            draggedTeam.position.y = newY;
            draw();
        }
    }
}

async function handleMouseUp(e) {
    if (draggedTeam && hasDragged) {
        // Only save position (PATCH endpoint for position updates only)
        try {
            await fetch(`${API_BASE}/teams/${draggedTeam.name}/position?view=${currentView}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    x: draggedTeam.position.x,
                    y: draggedTeam.position.y
                })
            });
        } catch (error) {
            console.error('Failed to update team position:', error);
        }
    }

    draggedTeam = null;
    dragStartPosition = null;
    hasDragged = false;
}

function handleWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    scale *= delta;
    scale = Math.max(0.1, Math.min(3, scale));
    draw();
}

function handleDoubleClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const team = getTeamAtPosition(x, y);
    if (team) {
        showTeamDetails(team);
    }
}

function selectTeam(team) {
    selectedTeam = team;
    draw();
}

function openAddTeamModal() {
    alert('This functionality isn\'t implemented yet to keep the solution as simple as possible.\n\nInstead, it\'s recommended to update the .md files under /data/current-teams and /data/tt-teams manually.');
}

function closeModal() {
    document.getElementById('teamModal').style.display = 'none';
}

function closeDetailModal() {
    document.getElementById('detailModal').style.display = 'none';
}

async function showTeamDetails(team) {
    // Fetch fresh data from API to get full details
    try {
        const response = await fetch(`${API_BASE}/teams/${team.name}?view=${currentView}`);
        const teamData = await response.json();

        // Set team name and type
        document.getElementById('detailTeamName').textContent = teamData.name;
        const typeBadge = document.getElementById('detailTeamType');
        typeBadge.textContent = teamData.team_type.replace('-', ' ');
        typeBadge.className = `team-badge ${teamData.team_type}`;

        // Render description as HTML (simple markdown-like rendering)
        document.getElementById('detailDescription').innerHTML = renderMarkdown(teamData.description || 'No description available.');

        // Dependencies
        const depList = document.getElementById('detailDependencies');
        if (teamData.dependencies && teamData.dependencies.length > 0) {
            depList.innerHTML = teamData.dependencies.map(dep => `<li>${dep}</li>`).join('');
        } else {
            depList.innerHTML = '<li style="color: #999; font-style: italic;">No dependencies</li>';
        }

        // Interaction modes
        const intList = document.getElementById('detailInteractions');
        if (teamData.interaction_modes && Object.keys(teamData.interaction_modes).length > 0) {
            intList.innerHTML = Object.entries(teamData.interaction_modes)
                .map(([team, mode]) => `<li>${team}<span class="interaction-mode">${mode}</span></li>`)
                .join('');
        } else {
            intList.innerHTML = '<li style="color: #999; font-style: italic;">No interactions defined</li>';
        }

        // Line manager (for current org view)
        if (currentView === 'current' && teamData.line_manager) {
            const managerItem = document.createElement('li');
            managerItem.innerHTML = `<strong>Reports to:</strong> ${teamData.line_manager}`;
            managerItem.style.background = '#e3f2fd';
            intList.insertBefore(managerItem, intList.firstChild);
        }

        // Metadata
        const metadataSection = document.getElementById('detailMetadataSection');
        const metadataDiv = document.getElementById('detailMetadata');
        if (teamData.metadata && Object.keys(teamData.metadata).length > 0) {
            metadataDiv.innerHTML = Object.entries(teamData.metadata)
                .map(([key, value]) => `
                    <div class="metadata-item">
                        <div class="label">${key}</div>
                        <div class="value">${value}</div>
                    </div>
                `).join('');
            metadataSection.style.display = 'block';
        } else {
            metadataSection.style.display = 'none';
        }

        // Show modal
        document.getElementById('detailModal').style.display = 'block';
    } catch (error) {
        console.error('Failed to load team details:', error);
        alert('Failed to load team details');
    }
}

function renderMarkdown(text) {
    if (!text) return '';

    // Simple markdown-like rendering
    let html = text;

    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Bold and italic
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    html = html.replace(/`(.+?)`/g, '<code>$1</code>');

    // Lists
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Paragraphs
    html = html.split('\n\n').map(p => {
        if (!p.trim()) return '';
        if (p.startsWith('<h') || p.startsWith('<ul') || p.startsWith('<pre')) return p;
        return `<p>${p}</p>`;
    }).join('\n');

    return html;
}

async function handleTeamSubmit(e) {
    e.preventDefault();

    const teamData = {
        name: document.getElementById('teamName').value,
        team_type: document.getElementById('teamType').value,
        description: document.getElementById('teamDescription').value,
        dependencies: [],
        interaction_modes: {},
        position: {
            x: 100 + teams.length * 50,
            y: 100 + teams.length * 50
        }
    };

    try {
        const response = await fetch(`${API_BASE}/teams?view=${currentView}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(teamData)
        });

        if (response.ok) {
            closeModal();
            await loadTeams();
        } else {
            alert('Failed to create team');
        }
    } catch (error) {
        console.error('Failed to create team:', error);
        alert('Failed to create team');
    }
}

// Polyfill for roundRect (older browsers)
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
