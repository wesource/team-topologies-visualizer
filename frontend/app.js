// Main application - refactored with modular structure
import { loadTeamTypes, loadOrganizationHierarchy, loadTeams, loadTeamDetails, updateTeamPosition } from './api.js';
import { drawCurrentStateView } from './renderer-current.js';
import { drawTeam, drawConnections, wrapText, initCanvasPolyfills, drawValueStreamGroupings, drawPlatformGroupings, darkenColor } from './renderer-common.js';
import { CanvasInteractionHandler } from './canvas-interactions.js';
import { exportToSVG } from './svg-export.js';
import { autoAlignTeamsByManager } from './current-state-alignment.js';
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
    showCognitiveLoad: false, // Cognitive load indicators disabled by default
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
    
    // Interaction mode modal
    const interactionModeModalClose = document.getElementById('interactionModeModalClose');
    if (interactionModeModalClose)
        interactionModeModalClose.addEventListener('click', closeInteractionModeModal);
    
    const showConnectionsCheckbox = document.getElementById('showConnections');
    if (showConnectionsCheckbox) {
        showConnectionsCheckbox.addEventListener('change', (e) => {
            state.showConnections = e.target.checked;
            draw();
        });
    }    
    const showInteractionModesCheckbox = document.getElementById('showInteractionModes');
    if (showInteractionModesCheckbox) {
        showInteractionModesCheckbox.addEventListener('change', (e) => {
            state.showInteractionModes = e.target.checked;
            draw();
        });
    }    const showCognitiveLoadCheckbox = document.getElementById('showCognitiveLoad');
    if (showCognitiveLoadCheckbox) {
        showCognitiveLoadCheckbox.addEventListener('change', (e) => {
            state.showCognitiveLoad = e.target.checked;
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
    
    // Show/hide the view-specific checkboxes and auto-align button based on view
    const showConnectionsLabel = document.getElementById('showConnectionsLabel');
    if (showConnectionsLabel) {
        if (state.currentView === 'current') {
            showConnectionsLabel.style.display = 'flex';
        } else {
            showConnectionsLabel.style.display = 'none';
        }
    }
    
    const showInteractionModesLabel = document.getElementById('showInteractionModesLabel');
    if (showInteractionModesLabel) {
        if (state.currentView === 'tt') {
            showInteractionModesLabel.style.display = 'flex';
        } else {
            showInteractionModesLabel.style.display = 'none';
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
    
    // Book-accurate SVG shapes for TT Design team types
    const ttDesignShapes = {
        'stream-aligned': `<svg width="50" height="18" viewBox="0 0 220 70" style="display: block;"><rect x="10" y="20" width="200" height="30" rx="12" ry="12" fill="#F9E2A0" stroke="#E3B23C" stroke-width="2"></rect></svg>`,
        'platform': `<svg width="50" height="23" viewBox="0 0 220 100" style="display: block;"><rect x="10" y="20" width="200" height="60" rx="14" ry="14" fill="#9fd3e8" stroke="#4fa3c7" stroke-width="2"></rect></svg>`,
        'enabling': `<svg width="28" height="64" viewBox="0 0 140 180" style="display: block;"><rect x="30" y="30" width="80" height="120" rx="14" ry="14" fill="#b7a6d9" stroke="#7a5fa6" stroke-width="2"></rect></svg>`,
        'complicated-subsystem': `<svg width="32" height="32" viewBox="0 0 140 140" style="display: block;"><path d="M40 20 H100 L120 40 V100 L100 120 H40 L20 100 V40 Z" fill="#f4b183" stroke="#c97a2b" stroke-width="2"></path></svg>`
    };
    
    // Build legend from team type config
    let legendHTML = '<h4>Team Types</h4>';
    state.teamTypeConfig.team_types.forEach((type) => {
        // Use book-accurate shapes for TT Design, colored boxes for Current State
        const displaySymbol = state.currentView === 'tt' && ttDesignShapes[type.id]
            ? ttDesignShapes[type.id]
            : `<span style="width: 20px; height: 20px; background: ${type.color}; border: 2px solid ${darkenColor(type.color, 0.7)}; border-radius: 3px; display: inline-block;"></span>`;
        
        // Only show info icon for TT Design view (Team Topologies concepts have educational modals)
        const infoIcon = state.currentView === 'tt' ? '<span style="color: #999; font-size: 0.9rem; margin-left: 0.5rem;">ℹ️</span>' : '';
        const clickableStyle = state.currentView === 'tt' ? 'cursor: pointer;' : '';
        const hoverEffect = state.currentView === 'tt' ? 'onmouseover="this.style.background=\'rgba(200, 200, 200, 0.1)\'" onmouseout="this.style.background=\'transparent\'"' : '';
        
        legendHTML += `
            <div class="legend-item team-type-item" data-team-type="${type.id}" style="${clickableStyle} padding: 0.3rem; border-radius: 4px; transition: background 0.2s; display: flex; align-items: center; gap: 0.5rem;" ${hoverEffect}>
                <span style="flex-shrink: 0;">${displaySymbol}</span>
                <span style="flex: 1;">${type.name}</span>
                ${infoIcon}
            </div>
        `;
    });
    
    // Add view-specific legend items
    if (state.currentView === 'current') {
        // Current State view shows dependencies (Actual Comms)
        legendHTML += `
            <h4 style="margin-top: 1.5rem;">Connections</h4>
            <div class="legend-item" style="align-items: center; padding: 0.3rem;">
                <div style="flex: 1;">
                    <strong>Actual Comms</strong>
                    <div style="margin-top: 4px;">
                        <svg width="70" height="16" viewBox="0 0 70 16">
                            <line x1="8" y1="8" x2="62" y2="8" stroke="#666" stroke-width="4"/>
                            <polygon points="70,8 62,4 62,12" fill="#666"/>
                            <polygon points="0,8 8,4 8,12" fill="#666"/>
                        </svg>
                    </div>
                    <div style="font-size: 0.85rem; color: #666; margin-top: 2px;">Dependencies between teams</div>
                </div>
            </div>
        `;
    } else if (state.currentView === 'tt') {
        // TT Design view shows interaction modes (book-accurate symbols)
        legendHTML += `
            <h4 style="margin-top: 1.5rem;">Interaction Modes</h4>
            <div class="legend-item interaction-mode-item" data-mode="collaboration" style="align-items: center; cursor: pointer; padding: 0.3rem; border-radius: 4px; transition: background 0.2s;" onmouseover="this.style.background='rgba(122, 95, 166, 0.1)'" onmouseout="this.style.background='transparent'">
                <svg width="40" height="20" viewBox="0 0 200 100" style="margin-right: 0.5rem; flex-shrink: 0;">
                    <defs>
                        <pattern id="crossHatchLegend" width="12" height="12" patternUnits="userSpaceOnUse">
                            <path d="M0 12 L12 0" stroke="#7a5fa6" stroke-width="1"></path>
                            <path d="M0 0 L12 12" stroke="#7a5fa6" stroke-width="1"></path>
                        </pattern>
                    </defs>
                    <rect x="10" y="20" width="180" height="60" rx="8" ry="8" fill="#b7a6d9" stroke="#7a5fa6" stroke-width="2"></rect>
                    <rect x="10" y="20" width="180" height="60" rx="8" ry="8" fill="url(#crossHatchLegend)"></rect>
                </svg>
                <div style="flex: 1;">
                    <strong>Collaboration</strong>
                    <div style="margin-top: 2px;">
                        <svg width="60" height="10" viewBox="0 0 60 10">
                            <line x1="0" y1="5" x2="60" y2="5" stroke="#7a5fa6" stroke-width="3"/>
                            <polygon points="60,5 55,2 55,8" fill="#7a5fa6"/>
                        </svg>
                    </div>
                </div>
                <span style="color: #999; font-size: 0.9rem; margin-left: 0.5rem;">ℹ️</span>
            </div>
            <div class="legend-item interaction-mode-item" data-mode="x-as-a-service" style="align-items: center; cursor: pointer; padding: 0.3rem; border-radius: 4px; transition: background 0.2s; margin-top: 0.5rem;" onmouseover="this.style.background='rgba(34, 34, 34, 0.05)'" onmouseout="this.style.background='transparent'">
                <svg width="40" height="20" viewBox="0 0 200 100" style="margin-right: 0.5rem; flex-shrink: 0;">
                    <path d="M80 30 C60 30, 60 30, 60 50 C60 70, 60 70, 80 70" fill="none" stroke="#222222" stroke-width="6" stroke-linecap="round"></path>
                    <path d="M120 30 C140 30, 140 30, 140 50 C140 70, 140 70, 120 70" fill="none" stroke="#222222" stroke-width="6" stroke-linecap="round"></path>
                </svg>
                <div style="flex: 1;">
                    <strong>X-as-a-Service</strong>
                    <div style="margin-top: 2px;">
                        <svg width="60" height="10" viewBox="0 0 60 10">
                            <line x1="0" y1="5" x2="60" y2="5" stroke="#222222" stroke-width="3" stroke-dasharray="10,5"/>
                            <polygon points="60,5 55,2 55,8" fill="#222222"/>
                        </svg>
                    </div>
                </div>
                <span style="color: #999; font-size: 0.9rem; margin-left: 0.5rem;">ℹ️</span>
            </div>
            <div class="legend-item interaction-mode-item" data-mode="facilitating" style="align-items: center; cursor: pointer; padding: 0.3rem; border-radius: 4px; transition: background 0.2s; margin-top: 0.5rem;" onmouseover="this.style.background='rgba(111, 169, 140, 0.1)'" onmouseout="this.style.background='transparent'">
                <svg width="24" height="24" viewBox="0 0 120 120" style="margin-right: 0.5rem; flex-shrink: 0;">
                    <defs>
                        <pattern id="dotPatternLegend" width="8" height="8" patternUnits="userSpaceOnUse">
                            <circle cx="2" cy="2" r="1.5" fill="#6fa98c"></circle>
                        </pattern>
                    </defs>
                    <circle cx="60" cy="60" r="45" fill="#9fd0b5" stroke="#6fa98c" stroke-width="2"></circle>
                    <circle cx="60" cy="60" r="45" fill="url(#dotPatternLegend)"></circle>
                </svg>
                <div style="flex: 1;">
                    <strong>Facilitating</strong>
                    <div style="margin-top: 2px;">
                        <svg width="60" height="10" viewBox="0 0 60 10">
                            <line x1="0" y1="5" x2="60" y2="5" stroke="#6fa98c" stroke-width="2" stroke-dasharray="5,5"/>
                            <polygon points="60,5 56,2 56,8" fill="#6fa98c"/>
                        </svg>
                    </div>
                </div>
                <span style="color: #999; font-size: 0.9rem; margin-left: 0.5rem;">ℹ️</span>
            </div>
        `;
        
        // Add grouping explanations (fractal patterns from 2nd edition)
        const valueStreams = getValueStreamNames(state.teams);
        if (valueStreams.length > 0) {
            legendHTML += `
                <h4 style="margin-top: 1.5rem;">Groupings</h4>
                <div class="legend-item grouping-item" data-grouping="value-stream" style="cursor: pointer; padding: 0.3rem; border-radius: 4px; transition: background 0.2s;" onmouseover="this.style.background='rgba(255, 200, 130, 0.1)'" onmouseout="this.style.background='transparent'">
                    <span class="legend-grouping-box value-stream"></span>
                    <span style="flex: 1;"><strong>Value Stream</strong></span>
                    <span style="color: #999; font-size: 0.9rem; margin-left: 0.5rem;">ℹ️</span>
                </div>
                <div class="legend-item grouping-item" data-grouping="platform-grouping" style="cursor: pointer; padding: 0.3rem; border-radius: 4px; transition: background 0.2s; margin-top: 0.5rem;" onmouseover="this.style.background='rgba(126, 200, 227, 0.1)'" onmouseout="this.style.background='transparent'">
                    <span class="legend-grouping-box platform"></span>
                    <span style="flex: 1;"><strong>Platform Grouping</strong></span>
                    <span style="color: #999; font-size: 0.9rem; margin-left: 0.5rem;">ℹ️</span>
                </div>
            `;
        }
    }
    
    legendDiv.innerHTML = legendHTML;
    
    // Add event listeners to all info items
    const interactionModeItems = document.querySelectorAll('.interaction-mode-item');
    interactionModeItems.forEach(item => {
        item.addEventListener('click', () => {
            const mode = item.getAttribute('data-mode');
            if (mode) {
                showInfoModal('interaction-mode', mode);
            }
        });
    });
    
    const teamTypeItems = document.querySelectorAll('.team-type-item');
    teamTypeItems.forEach(item => {
        item.addEventListener('click', () => {
            const teamType = item.getAttribute('data-team-type');
            if (teamType) {
                showInfoModal('team-type', teamType);
            }
        });
    });
    
    const groupingItems = document.querySelectorAll('.grouping-item');
    groupingItems.forEach(item => {
        item.addEventListener('click', () => {
            const grouping = item.getAttribute('data-grouping');
            if (grouping) {
                showInfoModal('grouping', grouping);
            }
        });
    });
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
        drawConnections(state.ctx, teamsToRender, state.currentView, state.showInteractionModes);
    }
    // Draw teams
    teamsToRender.forEach(team => drawTeam(state.ctx, team, state.selectedTeam, state.teamColorMap, (text, maxWidth) => wrapText(state.ctx, text, maxWidth), state.currentView, state.showCognitiveLoad));
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

function closeInteractionModeModal() {
    const modal = document.getElementById('interactionModeModal');
    if (modal)
        modal.style.display = 'none';
}

function showInfoModal(type, id) {
    const modal = document.getElementById('interactionModeModal');
    const content = document.getElementById('interactionModeContent');
    
    if (!modal || !content) return;
    
    let info = null;
    
    if (type === 'interaction-mode') {
        const interactionModes = {
            'collaboration': {
                title: 'Collaboration',
                symbol: `<svg width="200" height="100" viewBox="0 0 200 100"><defs><pattern id="crossHatchModal" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M0 12 L12 0" stroke="#7a5fa6" stroke-width="1"></path><path d="M0 0 L12 12" stroke="#7a5fa6" stroke-width="1"></path></pattern></defs><rect x="10" y="20" width="180" height="60" rx="8" ry="8" fill="#b7a6d9" stroke="#7a5fa6" stroke-width="2"></rect><rect x="10" y="20" width="180" height="60" rx="8" ry="8" fill="url(#crossHatchModal)"></rect></svg>`,
                line: `<svg width="200" height="20" viewBox="0 0 200 20"><line x1="10" y1="10" x2="190" y2="10" stroke="#7a5fa6" stroke-width="4"/><polygon points="190,10 180,5 180,15" fill="#7a5fa6"/></svg>`,
                description: '<strong>Close, temporary joint effort</strong> between two teams to solve a specific problem or deliver a feature.',
                characteristics: ['Teams work together closely for a limited time', 'Shared responsibility and high cognitive load', 'Used for discovery, rapid learning, or tackling novel problems', 'Should be time-boxed (typically 3-6 months)', 'Often transitions to X-as-a-Service or dissolves'],
                whenToUse: 'When teams need to work intensively together to solve complex problems, share knowledge rapidly, or explore new technical domains.'
            },
            'x-as-a-service': {
                title: 'X-as-a-Service',
                symbol: `<svg width="200" height="100" viewBox="0 0 200 100"><path d="M80 30 C60 30, 60 30, 60 50 C60 70, 60 70, 80 70" fill="none" stroke="#222222" stroke-width="6" stroke-linecap="round"></path><path d="M120 30 C140 30, 140 30, 140 50 C140 70, 140 70, 120 70" fill="none" stroke="#222222" stroke-width="6" stroke-linecap="round"></path></svg>`,
                line: `<svg width="200" height="20" viewBox="0 0 200 20"><line x1="10" y1="10" x2="190" y2="10" stroke="#222222" stroke-width="4" stroke-dasharray="10,5"/><polygon points="190,10 180,5 180,15" fill="#222222"/></svg>`,
                description: '<strong>One team provides a service</strong> to other teams through a well-defined interface (API, platform capability, etc.).',
                characteristics: ['Clear service boundary with minimal interaction', 'Consumer team uses the service without deep collaboration', 'Provider team owns the service end-to-end', 'Low cognitive load for consumer teams', 'Stable, predictable interaction pattern'],
                whenToUse: 'When a capability is mature, well-defined, and can be consumed through clear interfaces. Typical for platform teams serving stream-aligned teams.'
            },
            'facilitating': {
                title: 'Facilitating',
                symbol: `<svg width="120" height="120" viewBox="0 0 120 120"><defs><pattern id="dotPatternModal" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="#6fa98c"></circle></pattern></defs><circle cx="60" cy="60" r="45" fill="#9fd0b5" stroke="#6fa98c" stroke-width="2"></circle><circle cx="60" cy="60" r="45" fill="url(#dotPatternModal)"></circle></svg>`,
                line: `<svg width="200" height="20" viewBox="0 0 200 20"><line x1="10" y1="10" x2="190" y2="10" stroke="#6fa98c" stroke-width="3" stroke-dasharray="5,5"/><polygon points="190,10 182,5 182,15" fill="#6fa98c"/></svg>`,
                description: '<strong>Enabling team helps another team</strong> by providing coaching, guidance, or removing obstacles.',
                characteristics: ['Advisory and coaching relationship', 'Enabling team does not take ownership of the work', 'Focused on upskilling and capability building', 'Light overlap - support without dependency', 'Temporary engagement to build team capabilities'],
                whenToUse: 'When teams need to adopt new technologies, practices, or overcome technical obstacles. Enabling teams help stream-aligned teams become more effective.'
            }
        };
        info = interactionModes[id];
    } else if (type === 'team-type') {
        const teamTypes = {
            'stream-aligned': {
                title: 'Stream-Aligned Team',
                color: '#F9E2A0',
                description: '<strong>Aligned to a single, valuable stream of work</strong> — typically a user journey, product line, or feature set that delivers value directly to customers.',
                characteristics: ['Primary team type that delivers value end-to-end', 'Owns the full lifecycle of their flow', 'Minimal hand-offs to other teams', 'Autonomous and empowered to deliver quickly', 'Half-height horizontal box (book-accurate — emphasizes flow)'],
                whenToUse: 'The default team type for most product delivery. Every organization should have multiple stream-aligned teams focused on different value streams.',
                examples: ['E-commerce Checkout Team', 'Mobile App Experience Team', 'Customer Onboarding Team']
            },
            'platform': {
                title: 'Platform Team',
                color: '#9ED3E6',
                description: '<strong>Provides internal services to reduce cognitive load</strong> of stream-aligned teams — APIs, infrastructure, deployment pipelines, and other capabilities.',
                characteristics: ['Makes stream-aligned teams more effective and autonomous', 'Treats other teams as customers', 'Provides X-as-a-Service to consumer teams', 'Focus on Thinnest Viable Platform (TVP)', 'Full-height horizontal box (book-accurate — emphasizes foundation)'],
                whenToUse: 'When capabilities are needed by multiple stream-aligned teams and benefit from centralization (e.g., CI/CD, observability, data platform).',
                examples: ['API Gateway Platform Team', 'Observability Platform Team', 'Data Engineering Platform Team']
            },
            'enabling': {
                title: 'Enabling Team',
                color: '#C5B3E6',
                description: '<strong>Helps stream-aligned teams overcome obstacles</strong> and adopt new technologies, practices, or approaches through coaching and facilitation.',
                characteristics: ['Focuses on upskilling other teams', 'Does not take ownership of work', 'Temporary engagements (typically weeks or months)', 'Spreads knowledge and best practices', 'Vertical box (book-accurate — emphasizes support alongside)'],
                whenToUse: 'When teams need to adopt new technologies, practices, or overcome skill gaps. Enabling teams build capability, then move on.',
                examples: ['DevOps Enablement Team', 'Security Engineering Enablement Team', 'Cloud Migration Enablement Team']
            },
            'complicated-subsystem': {
                title: 'Complicated Subsystem Team',
                color: '#F4B183',
                description: '<strong>Handles complex technical domains</strong> requiring specialist knowledge — ML algorithms, video codecs, mathematical models, or other high-complexity systems.',
                characteristics: ['Deep expertise in a specialized area', 'Reduces cognitive load on stream-aligned teams', 'Provides services to other teams via clean interfaces', 'Small team with specialized skills', 'Octagon shape (book-accurate — emphasizes internal complexity)'],
                whenToUse: 'Only when the subsystem complexity is too high for stream-aligned teams to own. Use sparingly — most complexity should be hidden in platforms.',
                examples: ['ML Recommendations Team', 'Fraud Detection & Risk Modeling Team', 'Video Encoding Optimization Team']
            }
        };
        info = teamTypes[id];
        if (info) {
            // Team types now use book-accurate SVG shapes
            const shapes = {
                'stream-aligned': `<svg width="220" height="70" viewBox="0 0 220 70"><rect x="10" y="20" width="200" height="30" rx="12" ry="12" fill="#F9E2A0" stroke="#E3B23C" stroke-width="2"></rect></svg>`,
                'platform': `<svg width="220" height="100" viewBox="0 0 220 100"><rect x="10" y="20" width="200" height="60" rx="14" ry="14" fill="#9fd3e8" stroke="#4fa3c7" stroke-width="2"></rect></svg>`,
                'enabling': `<svg width="140" height="180" viewBox="0 0 140 180"><rect x="30" y="30" width="80" height="120" rx="14" ry="14" fill="#b7a6d9" stroke="#7a5fa6" stroke-width="2"></rect></svg>`,
                'complicated-subsystem': `<svg width="140" height="140" viewBox="0 0 140 140"><path d="M40 20 H100 L120 40 V100 L100 120 H40 L20 100 V40 Z" fill="#f4b183" stroke="#c97a2b" stroke-width="2"></path></svg>`
            };
            info.shape = shapes[id];
        }
    } else if (type === 'grouping') {
        const groupings = {
            'value-stream': {
                title: 'Value Stream Grouping',
                symbol: `<div style="width: 200px; height: 100px; border: 2px solid rgba(255, 200, 130, 0.8); background: rgba(255, 245, 215, 0.5); border-radius: 10px;"></div>`,
                description: '<strong>Groups stream-aligned teams</strong> serving the same customer journey or value flow.',
                characteristics: ['End-to-end customer experience focus', 'Minimizes dependencies across value streams', 'Clear ownership of customer outcomes', 'Flow metrics tracked per value stream', 'Visual grouping shows organizational flow'],
                whenToUse: 'To visualize how teams are organized around customer value flows. Helps identify dependencies and optimize for fast flow.',
                examples: ['E-commerce value stream (Product Discovery → Cart → Checkout → Fulfillment)', 'Mobile App value stream', 'Enterprise Sales Portal value stream']
            },
            'platform-grouping': {
                title: 'Platform Grouping (Team-of-Teams)',
                symbol: `<div style="width: 200px; height: 100px; border: 2px solid rgba(74, 159, 216, 0.8); background: rgba(126, 200, 227, 0.2); border-radius: 10px;"></div>`,
                description: '<strong>Team-of-teams pattern</strong> — multiple platform teams providing related capabilities as a cohesive platform offering.',
                characteristics: ['Fractal pattern from Team Topologies 2nd edition', 'Coordinates multiple platform capabilities', 'Reduces cognitive load through clear boundaries', 'Each sub-team owns specific capabilities', 'Provides unified service to stream-aligned teams'],
                whenToUse: 'When a platform grows beyond what one team can handle. Instead of one large team, create a grouping of smaller specialized platform teams.',
                examples: ['Data Platform Grouping (Ingestion + Processing + Analytics)', 'Developer Experience Grouping (CI/CD + Observability + Testing)', 'ML Platform Grouping (Training + Serving + Feature Store)']
            }
        };
        info = groupings[id];
    }
    
    if (!info) return;
    
    // Build modal content based on type
    let visualSection = '';
    if (type === 'interaction-mode') {
        visualSection = `
            <div style="display: flex; justify-content: center; align-items: center; gap: 2rem; margin-bottom: 1rem;">
                <div>
                    <p style="font-size: 0.85rem; color: #666; margin-bottom: 0.5rem;">Symbol</p>
                    ${info.symbol}
                </div>
                <div>
                    <p style="font-size: 0.85rem; color: #666; margin-bottom: 0.5rem;">Connection Line</p>
                    ${info.line}
                </div>
            </div>
        `;
    } else if (type === 'team-type') {
        visualSection = `
            <div style="display: flex; justify-content: center; margin-bottom: 1rem;">
                ${info.shape}
            </div>
        `;
    } else if (type === 'grouping') {
        visualSection = `
            <div style="display: flex; justify-content: center; margin-bottom: 1rem;">
                ${info.symbol}
            </div>
        `;
    }
    
    content.innerHTML = `
        <div style="text-align: center; margin-bottom: 1.5rem;">
            <h2 style="margin-bottom: 1rem; color: #333;">${info.title}</h2>
            ${visualSection}
        </div>
        
        <div style="text-align: left;">
            <p style="font-size: 1rem; line-height: 1.6; margin-bottom: 1rem;">${info.description}</p>
            
            <h3 style="font-size: 0.95rem; margin-top: 1.5rem; margin-bottom: 0.75rem; color: #555;">Key Characteristics:</h3>
            <ul style="margin-left: 1.5rem; line-height: 1.8;">
                ${info.characteristics.map(c => `<li>${c}</li>`).join('')}
            </ul>
            
            <h3 style="font-size: 0.95rem; margin-top: 1.5rem; margin-bottom: 0.75rem; color: #555;">When to Use:</h3>
            <p style="line-height: 1.6;">${info.whenToUse}</p>
            
            ${info.examples ? `
                <h3 style="font-size: 0.95rem; margin-top: 1.5rem; margin-bottom: 0.75rem; color: #555;">Examples:</h3>
                <ul style="margin-left: 1.5rem; line-height: 1.8;">
                    ${info.examples.map(ex => `<li>${ex}</li>`).join('')}
                </ul>
            ` : ''}
        </div>
    `;
    
    modal.style.display = 'block';
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
                // Separate cognitive load fields from other metadata
                const cognitiveLoadFields = ['cognitive_load', 'cognitive_load_domain', 'cognitive_load_intrinsic', 'cognitive_load_extraneous'];
                const otherMetadata = Object.entries(teamData.metadata)
                    .filter(([key]) => !cognitiveLoadFields.includes(key));
                
                // Check if we have cognitive load data
                const cognitiveLoad = teamData.metadata.cognitive_load;
                
                // Insert cognitive load section if it exists
                if (cognitiveLoad) {
                    // Remove existing cognitive load section if any
                    const existingCogLoad = document.getElementById('detailCognitiveLoadSection');
                    if (existingCogLoad) existingCogLoad.remove();
                    
                    // Create cognitive load section
                    const cogLoadSection = document.createElement('div');
                    cogLoadSection.id = 'detailCognitiveLoadSection';
                    cogLoadSection.className = 'detail-section';
                    cogLoadSection.style.background = '#f8f9fa';
                    cogLoadSection.style.padding = '15px';
                    cogLoadSection.style.borderRadius = '8px';
                    cogLoadSection.style.marginBottom = '20px';
                    
                    // Format cognitive load level
                    const loadLevel = cognitiveLoad.toString()
                        .split('-')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join('-');
                    
                    // Get traffic light indicator
                    import('./renderer-common.js').then(module => {
                        const indicator = module.getCognitiveLoadIndicator(cognitiveLoad);
                        const emoji = indicator ? indicator.emoji : '';
                        
                        cogLoadSection.innerHTML = `
                            <h3>Cognitive Load ${emoji}</h3>
                            <div style="font-size: 18px; font-weight: bold; color: #333; margin: 10px 0;">
                                ${loadLevel}
                            </div>
                        `;
                        
                        // Add breakdown if available
                        const domain = teamData.metadata.cognitive_load_domain;
                        const intrinsic = teamData.metadata.cognitive_load_intrinsic;
                        const extraneous = teamData.metadata.cognitive_load_extraneous;
                        
                        if (domain || intrinsic || extraneous) {
                            const breakdownHtml = `
                                <div style="margin-top: 15px; font-size: 14px;">
                                    <div style="margin-bottom: 8px;"><strong>Breakdown:</strong></div>
                                    ${domain ? `<div style="margin-left: 10px;">• Domain complexity: <strong>${domain}</strong></div>` : ''}
                                    ${intrinsic ? `<div style="margin-left: 10px;">• Intrinsic complexity: <strong>${intrinsic}</strong></div>` : ''}
                                    ${extraneous ? `<div style="margin-left: 10px;">• Extraneous load: <strong>${extraneous}</strong></div>` : ''}
                                </div>
                            `;
                            cogLoadSection.innerHTML += breakdownHtml;
                        }
                    });
                    
                    // Insert before metadata section
                    metadataSection.parentNode.insertBefore(cogLoadSection, metadataSection);
                }
                
                // Show remaining metadata (excluding cognitive load fields)
                if (otherMetadata.length > 0) {
                    metadataDiv.innerHTML = otherMetadata
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
    exportToSVG(state, state.organizationHierarchy, state.teams, state.teamColorMap, state.currentView, state.showInteractionModes);
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
