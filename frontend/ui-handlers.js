// UI event handlers - manages button clicks and control interactions
import { state } from './state-management.js';
import { updateTeamPosition } from './api.js';
import { autoAlignTeamsByManager } from './current-state-alignment.js';
import { autoAlignTTDesign } from './tt-design-alignment.js';
import { exportToSVG } from './svg-export.js';
import { showWarning, showInfo, showSuccess, showError } from './notifications.js';
import { showValidationReport } from './modals.js';

export function handleViewChange(e, loadAllTeams, draw) {
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

export function handleExportSVG() {
    exportToSVG(state, state.organizationHierarchy, state.teams, state.teamColorMap, state.currentView, state.showInteractionModes);
}

export async function handleAutoAlign(draw) {
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

export async function handleAutoAlignTT(draw) {
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

export function setupUIEventListeners(loadAllTeams, draw, openAddTeamModal, closeModal, closeDetailModal, closeInteractionModeModal, handleTeamSubmit, selectTeam) {
    // UI interactions
    document.querySelectorAll('input[name="view"]').forEach(radio => {
        radio.addEventListener('change', (e) => handleViewChange(e, loadAllTeams, draw));
    });
    
    const addTeamBtn = document.getElementById('addTeamBtn');
    if (addTeamBtn)
        addTeamBtn.addEventListener('click', openAddTeamModal);
    
    const exportSVGBtn = document.getElementById('exportSVGBtn');
    if (exportSVGBtn)
        exportSVGBtn.addEventListener('click', handleExportSVG);
    
    const autoAlignBtn = document.getElementById('autoAlignBtn');
    if (autoAlignBtn)
        autoAlignBtn.addEventListener('click', () => handleAutoAlign(draw));
    
    const autoAlignTTBtn = document.getElementById('autoAlignTTBtn');
    if (autoAlignTTBtn)
        autoAlignTTBtn.addEventListener('click', () => handleAutoAlignTT(draw));
    
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
    }
    
    const showCognitiveLoadCheckbox = document.getElementById('showCognitiveLoad');
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
    
    // Show the correct controls for default view (TT Design)
    const showConnectionsLabel = document.getElementById('showConnectionsLabel');
    if (showConnectionsLabel) {
        showConnectionsLabel.style.display = 'none'; // Hidden in TT view
    }
    
    const showInteractionModesLabelInit = document.getElementById('showInteractionModesLabel');
    if (showInteractionModesLabelInit) {
        showInteractionModesLabelInit.style.display = 'flex'; // Shown in TT view
    }
    
    const autoAlignBtnInit = document.getElementById('autoAlignBtn');
    if (autoAlignBtnInit) {
        autoAlignBtnInit.style.display = 'none'; // Hidden in TT view
    }
    
    const autoAlignTTBtnInit = document.getElementById('autoAlignTTBtn');
    if (autoAlignTTBtnInit) {
        autoAlignTTBtnInit.style.display = 'inline-block'; // Shown in TT view
    }
    
    const groupingFilterContainerInit = document.getElementById('groupingFilterContainer');
    if (groupingFilterContainerInit) {
        groupingFilterContainerInit.style.display = 'flex'; // Shown in TT view
    }
    
    // Validate files button
    const validateBtn = document.getElementById('validateBtn');
    if (validateBtn) {
        validateBtn.addEventListener('click', async () => {
            await showValidationReport(state.currentView);
        });
    }
}
