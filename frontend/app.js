// Main application - refactored with modular structure
import { loadTeamTypes, loadOrganizationHierarchy, loadTeams, loadTeamDetails, updateTeamPosition } from './api.js';
import { drawCurrentStateView } from './renderer-current.js';
import { drawTeam, drawConnections, wrapText, initCanvasPolyfills, drawValueStreamGroupings, drawPlatformGroupings } from './renderer-common.js';
import { CanvasInteractionHandler } from './canvas-interactions.js';
import { exportToSVG } from './svg-export.js';
import { autoAlignTeamsByManager } from './team-alignment.js';
import { autoAlignTTDesign } from './tt-design-alignment.js';
import { showError, showSuccess, showInfo, showWarning } from './notifications.js';
import { getValueStreamGroupings, getValueStreamNames, filterTeamsByValueStream } from './value-stream-grouping.js';
import { getPlatformGroupings, getPlatformGroupingNames, filterTeamsByPlatformGrouping } from './platform-grouping.js';
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
    onTeamDoubleClick: null,
    showConnections: false,
    selectedGrouping: 'all' // Format: 'all', 'vs:ValueStreamName', 'pg:PlatformGroupingName'
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
    if (state.canvas && state.ctx) {
        interactionHandler = new CanvasInteractionHandler(state.canvas, state, draw);
        state.onTeamDoubleClick = showTeamDetails;
    }
    // UI interactions
    document.querySelectorAll('input[name="view"]').forEach(radio => {
        radio.addEventListener('change', handleViewChange);
    });
    const addTeamBtn = document.getElementById('addTeamBtn');
    if (addTeamBtn)
        addTeamBtn.addEventListener('click', openAddTeamModal);
    const exportSVGBtn = document.getElementById('exportSVGBtn');
    if (exportSVGBtn)
        exportSVGBtn.addEventListener('click', handleExportSVG);
    const autoAlignBtn = document.getElementById('autoAlignBtn');
    if (autoAlignBtn)
        autoAlignBtn.addEventListener('click', handleAutoAlign);
    const autoAlignTTBtn = document.getElementById('autoAlignTTBtn');
    if (autoAlignTTBtn)
        autoAlignTTBtn.addEventListener('click', handleAutoAlignTT);
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn)
        refreshBtn.addEventListener('click', () => loadAllTeams());
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn)
        cancelBtn.addEventListener('click', closeModal);
    const teamForm = document.getElementById('teamForm');
    if (teamForm)
        teamForm.addEventListener('submit', handleTeamSubmit);
    const closeBtn = document.querySelector('.close');
    if (closeBtn)
        closeBtn.addEventListener('click', closeModal);
    const detailModalClose = document.getElementById('detailModalClose');
    if (detailModalClose)
        detailModalClose.addEventListener('click', closeDetailModal);
    const showConnectionsCheckbox = document.getElementById('showConnections');
    if (showConnectionsCheckbox) {
        showConnectionsCheckbox.addEventListener('change', (e) => {
            state.showConnections = e.target.checked;
            draw();
        });
    }
    const groupingFilter = document.getElementById('groupingFilter');
    if (groupingFilter) {
        groupingFilter.addEventListener('change', (e) => {
            state.selectedGrouping = e.target.value;
            draw();
        });
    }
    // Show the hide connections checkbox and auto-align button since default view is "current"
    const showConnectionsLabel = document.getElementById('showConnectionsLabel');
    if (showConnectionsLabel) {
        showConnectionsLabel.style.display = 'flex';
    }
    const autoAlignBtnInit = document.getElementById('autoAlignBtn');
    if (autoAlignBtnInit) {
        autoAlignBtnInit.style.display = 'inline-block';
    }
    // Load initial data
    loadAllTeams();
}
function resizeCanvas() {
    if (!state.canvas)
        return;
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
        state.teamTypeConfig.team_types.forEach((type) => {
            if (type.id) {
                state.teamColorMap[type.id] = type.color;
            }
        });
        // Load organization hierarchy if in current view
        if (state.currentView === 'current') {
            try {
                state.organizationHierarchy = await loadOrganizationHierarchy();
            }
            catch (error) {
                console.warn('Failed to load organization hierarchy:', error);
                state.organizationHierarchy = null;
            }
        }
        else {
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
        updateGroupingFilter();
        draw();
    }
    catch (error) {
        console.error('Failed to load teams:', error);
    }
}
function handleViewChange(e) {
    const target = e.target;
    state.currentView = target.value;
    
    // Show/hide the "Show Communication Lines" checkbox and auto-align button based on view
    const showConnectionsLabel = document.getElementById('showConnectionsLabel');
    if (showConnectionsLabel) {
        if (state.currentView === 'current') {
            showConnectionsLabel.style.display = 'flex';
        } else {
            showConnectionsLabel.style.display = 'none';
        }
    }
    
    const autoAlignBtnView = document.getElementById('autoAlignBtn');
    if (autoAlignBtnView) {
        if (state.currentView === 'current') {
            autoAlignBtnView.style.display = 'inline-block';
        } else {
            autoAlignBtnView.style.display = 'none';
        }
    }
    
    const autoAlignTTBtnView = document.getElementById('autoAlignTTBtn');
    if (autoAlignTTBtnView) {
        if (state.currentView === 'tt') {
            autoAlignTTBtnView.style.display = 'inline-block';
        } else {
            autoAlignTTBtnView.style.display = 'none';
        }
    }
    
    // Show/hide grouping filter based on view
    const groupingFilterContainer = document.getElementById('groupingFilterContainer');
    if (groupingFilterContainer) {
        if (state.currentView === 'tt') {
            groupingFilterContainer.style.display = 'flex';
        } else {
            groupingFilterContainer.style.display = 'none';
        }
    }
    
    loadAllTeams();
}
function updateTeamList() {
    const teamList = document.getElementById('teamList');
    if (!teamList)
        return;
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
    if (!legendDiv)
        return;
    // Build legend from team type config
    let legendHTML = '<h4>Team Types</h4>';
    state.teamTypeConfig.team_types.forEach((type) => {
        legendHTML += `
            <div class="legend-item" title="${type.description || ''}">
                <span class="legend-color" style="background: ${type.color};"></span>
                <span>${type.name}</span>
            </div>
        `;
    });
    
    // Add grouping explanations in TT Design view (fractal patterns from 2nd edition)
    if (state.currentView === 'tt') {
        const valueStreams = getValueStreamNames(state.teams);
        if (valueStreams.length > 0) {
            legendHTML += `
                <h4 style="margin-top: 1.5rem;">Groupings</h4>
                <div class="legend-item" style="align-items: flex-start;">
                    <span class="legend-grouping-box value-stream"></span>
                    <span style="line-height: 1.4;"><strong>Value Stream:</strong> Groups stream-aligned teams serving the same customer flow (e.g., ${valueStreams[0]})</span>
                </div>
                <div class="legend-item" style="align-items: flex-start; margin-top: 0.5rem;">
                    <span class="legend-grouping-box platform"></span>
                    <span style="line-height: 1.4;"><strong>Platform Grouping:</strong> Team-of-teams providing related capabilities (fractal pattern)</span>
                </div>
            `;
        }
    }
    
    legendDiv.innerHTML = legendHTML;
}
function updateGroupingFilter() {
    const filterSelect = document.getElementById('groupingFilter');
    if (!filterSelect) return;
    
    // Get unique value streams and platform groupings from current teams
    const valueStreams = getValueStreamNames(state.teams);
    const platformGroupings = getPlatformGroupingNames(state.teams);
    
    // Clear existing options
    filterSelect.innerHTML = '<option value="all">All Teams</option>';
    
    // Add value stream options
    if (valueStreams.length > 0) {
        const vsOptGroup = document.createElement('optgroup');
        vsOptGroup.label = 'Value Streams';
        valueStreams.forEach(vs => {
            const option = document.createElement('option');
            option.value = `vs:${vs}`;
            option.textContent = vs;
            vsOptGroup.appendChild(option);
        });
        filterSelect.appendChild(vsOptGroup);
    }
    
    // Add platform grouping options
    if (platformGroupings.length > 0) {
        const pgOptGroup = document.createElement('optgroup');
        pgOptGroup.label = 'Platform Groupings';
        platformGroupings.forEach(pg => {
            const option = document.createElement('option');
            option.value = `pg:${pg}`;
            option.textContent = pg;
            pgOptGroup.appendChild(option);
        });
        filterSelect.appendChild(pgOptGroup);
    }
    
    // Reset selection to "all" when updating
    state.selectedGrouping = 'all';
    filterSelect.value = 'all';
}
function draw() {
    if (!state.ctx || !state.canvas)
        return;
    state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
    state.ctx.save();
    state.ctx.translate(state.viewOffset.x, state.viewOffset.y);
    state.ctx.scale(state.scale, state.scale);
    
    // Filter teams by selected grouping (only in TT Design view)
    let teamsToRender = state.teams;
    if (state.currentView === 'tt' && state.selectedGrouping !== 'all') {
        if (state.selectedGrouping.startsWith('vs:')) {
            // Filter by value stream
            const valueStream = state.selectedGrouping.substring(3);
            teamsToRender = filterTeamsByValueStream(state.teams, valueStream);
        } else if (state.selectedGrouping.startsWith('pg:')) {
            // Filter by platform grouping
            const platformGrouping = state.selectedGrouping.substring(3);
            teamsToRender = filterTeamsByPlatformGrouping(state.teams, platformGrouping);
        }
    }
    
    // Draw organization hierarchy if in current view
    if (state.currentView === 'current' && state.organizationHierarchy) {
        drawCurrentStateView(state.ctx, state.organizationHierarchy, teamsToRender, (text, maxWidth) => wrapText(state.ctx, text, maxWidth));
    }
    // Draw value stream groupings (only in TT Design view)
    if (state.currentView === 'tt') {
        const valueStreamGroupings = getValueStreamGroupings(teamsToRender);
        drawValueStreamGroupings(state.ctx, valueStreamGroupings);
        
        // Draw platform groupings
        const platformGroupings = getPlatformGroupings(teamsToRender);
        drawPlatformGroupings(state.ctx, platformGroupings);
    }
    // Draw connections first (only if enabled in current view)
    if (!(state.currentView === 'current' && !state.showConnections)) {
        drawConnections(state.ctx, teamsToRender, state.currentView);
    }
    // Draw teams
    teamsToRender.forEach(team => drawTeam(state.ctx, team, state.selectedTeam, state.teamColorMap, (text, maxWidth) => wrapText(state.ctx, text, maxWidth), state.currentView));
    state.ctx.restore();
}
function selectTeam(team) {
    state.selectedTeam = team;
    draw();
}
function openAddTeamModal() {
    showInfo('This functionality isn\'t implemented yet to keep the solution as simple as possible.\n\nInstead, it\'s recommended to update the .md files under /data/current-teams and /data/tt-teams manually.');
}
function closeModal() {
    const modal = document.getElementById('teamModal');
    if (modal)
        modal.style.display = 'none';
}
function closeDetailModal() {
    const modal = document.getElementById('detailModal');
    if (modal)
        modal.style.display = 'none';
}
async function showTeamDetails(team) {
    try {
        const teamData = await loadTeamDetails(team.name, state.currentView);
        // Set team name and type
        const detailTeamName = document.getElementById('detailTeamName');
        if (detailTeamName)
            detailTeamName.textContent = teamData.name;
        const typeBadge = document.getElementById('detailTeamType');
        if (typeBadge) {
            typeBadge.textContent = teamData.team_type.replace('-', ' ');
            typeBadge.className = `team-badge ${teamData.team_type}`;
        }
        // Render description as HTML (simple markdown-like rendering)
        const detailDescription = document.getElementById('detailDescription');
        if (detailDescription) {
            detailDescription.innerHTML = renderMarkdown(teamData.description || 'No description available.');
        }
        // Dependencies
        const depList = document.getElementById('detailDependencies');
        if (depList) {
            if (teamData.dependencies && teamData.dependencies.length > 0) {
                depList.innerHTML = teamData.dependencies.map((dep) => `<li>${dep}</li>`).join('');
            }
            else {
                depList.innerHTML = '<li style="color: #999; font-style: italic;">No dependencies</li>';
            }
        }
        // Interaction modes
        const intList = document.getElementById('detailInteractions');
        if (intList) {
            if (teamData.interaction_modes && Object.keys(teamData.interaction_modes).length > 0) {
                intList.innerHTML = Object.entries(teamData.interaction_modes)
                    .map(([team, mode]) => `<li>${team}<span class="interaction-mode">${mode}</span></li>`)
                    .join('');
            }
            else {
                intList.innerHTML = '<li style="color: #999; font-style: italic;">No interactions defined</li>';
            }
            // Line manager (for current org view)
            if (state.currentView === 'current' && teamData.line_manager) {
                const managerItem = document.createElement('li');
                managerItem.innerHTML = `<strong>Reports to:</strong> ${teamData.line_manager}`;
                managerItem.style.background = '#e3f2fd';
                intList.insertBefore(managerItem, intList.firstChild);
            }
        }
        // Metadata
        const metadataSection = document.getElementById('detailMetadataSection');
        const metadataDiv = document.getElementById('detailMetadata');
        if (metadataSection && metadataDiv) {
            if (teamData.metadata && Object.keys(teamData.metadata).length > 0) {
                metadataDiv.innerHTML = Object.entries(teamData.metadata)
                    .map(([key, value]) => `
                        <div class="metadata-item">
                            <div class="label">${key}</div>
                            <div class="value">${value}</div>
                        </div>
                    `).join('');
                metadataSection.style.display = 'block';
            }
            else {
                metadataSection.style.display = 'none';
            }
        }
        // Show modal
        const detailModal = document.getElementById('detailModal');
        if (detailModal)
            detailModal.style.display = 'block';
    }
    catch (error) {
        console.error('Failed to load team details:', error);
        showError('Failed to load team details');
    }
}
function renderMarkdown(text) {
    if (!text)
        return '';
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
        if (!p.trim())
            return '';
        if (p.startsWith('<h') || p.startsWith('<ul') || p.startsWith('<pre'))
            return p;
        return `<p>${p}</p>`;
    }).join('\n');
    return html;
}
async function handleTeamSubmit(e) {
    e.preventDefault();
    alert('Create team functionality is disabled. Please edit files manually.');
}
function handleExportSVG() {
    exportToSVG(state, state.organizationHierarchy, state.teams, state.teamColorMap, state.currentView);
}
async function handleAutoAlign() {
    if (!state.organizationHierarchy) {
        showWarning('Organization hierarchy not available. Auto-alignment only works in Current State view.');
        return;
    }
    
    // Perform alignment
    const realignedTeams = autoAlignTeamsByManager(state.teams, state.organizationHierarchy);
    
    if (realignedTeams.length === 0) {
        showInfo('No teams needed realignment. Teams are already properly positioned.');
        return;
    }
    
    // Save all updated positions to backend
    try {
        const updatePromises = realignedTeams.map(team => 
            updateTeamPosition(team.name, team.position.x, team.position.y, state.currentView)
        );
        
        await Promise.all(updatePromises);
        
        // Redraw canvas with new positions
        draw();
        
        showSuccess(`Successfully aligned ${realignedTeams.length} team(s) under their line managers.`);
    } catch (error) {
        console.error('Failed to save team positions:', error);
        showError('Failed to save team positions. Please try again.');
    }
}

async function handleAutoAlignTT() {
    // Perform alignment for TT Design view
    const realignedTeams = autoAlignTTDesign(state.teams);
    
    if (realignedTeams.length === 0) {
        showInfo('No teams needed realignment. Teams are already properly positioned.');
        return;
    }
    
    // Save all updated positions to backend
    try {
        const updatePromises = realignedTeams.map(team => 
            updateTeamPosition(team.name, team.position.x, team.position.y, state.currentView)
        );
        
        await Promise.all(updatePromises);
        
        // Redraw canvas with new positions
        draw();
        
        showSuccess(`Successfully aligned ${realignedTeams.length} team(s) within their groupings.`);
    } catch (error) {
        console.error('Failed to save team positions:', error);
        showError('Failed to save team positions. Please try again.');
    }
}
