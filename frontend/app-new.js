// Main application - refactored with modular structure
import { loadTeamTypes, loadOrganizationHierarchy, loadTeams, loadTeamDetails } from './api.js';
import { drawCurrentStateView } from './renderer-current.js';
import { drawTeam, drawConnections, wrapText, initCanvasPolyfills } from './renderer-common.js';
import { CanvasInteractionHandler } from './canvas-interactions.js';

// Application state
const state = {
    canvas: null,
    ctx: null,
    teams: [],
    organizationHierarchy: null,
    selectedTeam: null,
    viewOffset: { x: 0, y: 0 },
    scale: 1,
    currentView: 'current',
    teamTypeConfig: { team_types: [] },
    teamColorMap: {},
    onTeamDoubleClick: null
};

let interactionHandler = null;

// Initialize
document.addEventListener('DOMContentLoaded', init);

function init() {
    state.canvas = document.getElementById('teamCanvas');
    state.ctx = state.canvas.getContext('2d');

    initCanvasPolyfills();

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Setup interaction handler
    interactionHandler = new CanvasInteractionHandler(state.canvas, state, draw);
    state.onTeamDoubleClick = showTeamDetails;

    // UI interactions
    document.querySelectorAll('input[name="view"]').forEach(radio => {
        radio.addEventListener('change', handleViewChange);
    });
    document.getElementById('addTeamBtn').addEventListener('click', openAddTeamModal);
    document.getElementById('refreshBtn').addEventListener('click', () => loadAllTeams());
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('teamForm').addEventListener('submit', handleTeamSubmit);
    document.querySelector('.close').addEventListener('click', closeModal);
    document.getElementById('detailModalClose').addEventListener('click', closeDetailModal);

    // Load initial data
    loadAllTeams();
}

function resizeCanvas() {
    state.canvas.width = state.canvas.offsetWidth;
    state.canvas.height = state.canvas.offsetHeight;
    draw();
}

async function loadAllTeams() {
    try {
        // Load team type configuration first
        state.teamTypeConfig = await loadTeamTypes(state.currentView);

        // Build color map from config
        state.teamColorMap = {};
        state.teamTypeConfig.team_types.forEach(type => {
            state.teamColorMap[type.id] = type.color;
        });

        // Load organization hierarchy if in current view
        if (state.currentView === 'current') {
            try {
                state.organizationHierarchy = await loadOrganizationHierarchy();
            } catch (error) {
                console.warn('Failed to load organization hierarchy:', error);
                state.organizationHierarchy = null;
            }
        } else {
            state.organizationHierarchy = null;
        }

        // Load teams
        state.teams = await loadTeams(state.currentView);

        // Assign random positions if not set
        state.teams.forEach((team, index) => {
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
    state.currentView = e.target.value;
    loadAllTeams();
}

function updateTeamList() {
    const teamList = document.getElementById('teamList');
    teamList.innerHTML = '';

    state.teams.forEach(team => {
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
    let legendHTML = '<h4>Team Types</h4>';

    state.teamTypeConfig.team_types.forEach(type => {
        legendHTML += `
            <div class="legend-item" title="${type.description}">
                <span class="legend-color" style="background: ${type.color};"></span>
                <span>${type.name}</span>
            </div>
        `;
    });

    legendDiv.innerHTML = legendHTML;
}

function draw() {
    state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);

    state.ctx.save();
    state.ctx.translate(state.viewOffset.x, state.viewOffset.y);
    state.ctx.scale(state.scale, state.scale);

    // Draw organization hierarchy if in current view
    if (state.currentView === 'current' && state.organizationHierarchy) {
        drawCurrentStateView(state.ctx, state.organizationHierarchy, state.teams, (text, maxWidth) => wrapText(state.ctx, text, maxWidth));
    }

    // Draw connections first
    drawConnections(state.ctx, state.teams);

    // Draw teams
    state.teams.forEach(team => drawTeam(state.ctx, team, state.selectedTeam, state.teamColorMap, (text, maxWidth) => wrapText(state.ctx, text, maxWidth)));

    state.ctx.restore();
}

function selectTeam(team) {
    state.selectedTeam = team;
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
    try {
        const teamData = await loadTeamDetails(team.name, state.currentView);

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
        if (state.currentView === 'current' && teamData.line_manager) {
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
    alert('Create team functionality is disabled. Please edit files manually.');
}
