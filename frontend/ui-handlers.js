// UI event handlers - manages button clicks and control interactions
import { state, zoomIn, zoomOut, fitToView, getFilteredTeams } from './state-management.js';
import { updateTeamPosition } from './api.js';
import { autoAlignTeamsByManager } from './current-state-alignment.js';
import { autoAlignTTDesign } from './tt-design-alignment.js';
import { exportToSVG } from './svg-export.js';
import { showWarning, showInfo, showSuccess, showError } from './notifications.js';
import { showValidationReport } from './modals.js';

export function handleViewChange(e, loadAllTeams, _draw) {
    const target = e.target;
    state.currentView = target.value;

    // Show/hide perspective selector (Pre-TT only)
    const perspectiveSelector = document.getElementById('perspectiveSelector');
    if (perspectiveSelector) {
        if (state.currentView === 'current') {
            perspectiveSelector.style.display = 'flex';
        } else {
            perspectiveSelector.style.display = 'none';
        }
    }

    // Show/hide the view-specific checkboxes and auto-align button based on view
    const showConnectionsLabel = document.getElementById('showConnectionsLabel');
    const connectionsCognitiveLoadDivider = document.getElementById('connectionsCognitiveLoadDivider');
    if (showConnectionsLabel) {
        if (state.currentView === 'current') {
            showConnectionsLabel.style.display = 'flex';
            if (connectionsCognitiveLoadDivider) {
                connectionsCognitiveLoadDivider.style.display = 'block';
            }
        } else {
            showConnectionsLabel.style.display = 'none';
            if (connectionsCognitiveLoadDivider) {
                connectionsCognitiveLoadDivider.style.display = 'none';
            }
        }
    }

    // Show/hide team type badges checkbox (visible in Pre-TT view)
    const teamTypeBadgesLabel = document.getElementById('teamTypeBadgesLabel');
    const cognitiveLoadBadgesDivider = document.getElementById('cognitiveLoadBadgesDivider');
    if (teamTypeBadgesLabel && cognitiveLoadBadgesDivider) {
        if (state.currentView === 'current') {
            teamTypeBadgesLabel.style.display = 'flex';
            cognitiveLoadBadgesDivider.style.display = 'block';
        } else {
            teamTypeBadgesLabel.style.display = 'none';
            cognitiveLoadBadgesDivider.style.display = 'none';
        }
    }

    const showInteractionModesLabel = document.getElementById('showInteractionModesLabel');
    const modesCognitiveLoadDivider = document.getElementById('modesCognitiveLoadDivider');
    if (showInteractionModesLabel) {
        if (state.currentView === 'tt') {
            showInteractionModesLabel.style.display = 'flex';
            // Show divider when interaction modes is visible
            if (modesCognitiveLoadDivider) {
                modesCognitiveLoadDivider.style.display = 'block';
            }
        } else {
            showInteractionModesLabel.style.display = 'none';
            // Hide divider when interaction modes is hidden
            if (modesCognitiveLoadDivider) {
                modesCognitiveLoadDivider.style.display = 'none';
            }
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

export async function handlePerspectiveChange(e, draw) {
    const target = e.target;
    state.currentPerspective = target.value;

    // Show team type badges checkbox for both Pre-TT perspectives (always visible)
    const teamTypeBadgesLabel = document.getElementById('teamTypeBadgesLabel');
    const cognitiveLoadBadgesDivider = document.getElementById('cognitiveLoadBadgesDivider');
    if (teamTypeBadgesLabel && cognitiveLoadBadgesDivider) {
        // Always show in Pre-TT view (both hierarchy and product-lines)
        teamTypeBadgesLabel.style.display = 'flex';
        cognitiveLoadBadgesDivider.style.display = 'block';
    }

    // Show/hide and enable/disable auto-align based on perspective
    const autoAlignBtn = document.getElementById('autoAlignBtn');
    if (autoAlignBtn) {
        if (state.currentPerspective === 'product-lines') {
            autoAlignBtn.disabled = true;
            autoAlignBtn.style.opacity = '0.5';
            autoAlignBtn.style.cursor = 'not-allowed';
        } else {
            autoAlignBtn.disabled = false;
            autoAlignBtn.style.opacity = '1';
            autoAlignBtn.style.cursor = 'pointer';
        }
    }

    // Load product lines data if switching to that perspective
    if (state.currentPerspective === 'product-lines' && !state.productLinesData) {
        try {
            const { loadProductLines } = await import('./api.js');
            state.productLinesData = await loadProductLines();
        } catch (error) {
            console.error('Failed to load product lines data:', error);
            showError('Failed to load product lines view');
            // Fall back to hierarchy
            document.getElementById('perspectiveHierarchy').checked = true;
            state.currentPerspective = 'hierarchy';
            return;
        }
    }

    draw();
}

export function handleExportSVG() {
    const teamsToExport = getFilteredTeams();
    exportToSVG(state, state.organizationHierarchy, teamsToExport, state.teamColorMap, state.currentView, state.showInteractionModes);
}

export async function handleAutoAlign(draw) {
    if (!state.organizationHierarchy) {
        showWarning('Organization hierarchy not available. Auto-alignment only works in Current State view.');
        return;
    }

    // Perform alignment - use filtered teams if filters are active
    const teamsToAlign = getFilteredTeams();
    const realignedTeams = autoAlignTeamsByManager(teamsToAlign, state.organizationHierarchy);

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
    // Perform alignment for TT Design view - use filtered teams if filters are active
    const teamsToAlign = getFilteredTeams();
    const realignedTeams = autoAlignTTDesign(teamsToAlign);

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

export function setupUIEventListeners(loadAllTeams, draw, openAddTeamModal, closeModal, closeDetailModal, closeInteractionModeModal, handleTeamSubmit, _selectTeam) {
    // UI interactions
    document.querySelectorAll('input[name="view"]').forEach(radio => {
        radio.addEventListener('change', (e) => handleViewChange(e, loadAllTeams, draw));
    });

    // Perspective selector (Pre-TT: Hierarchy vs Product Lines)
    document.querySelectorAll('input[name="perspective"]').forEach(radio => {
        radio.addEventListener('change', (e) => handlePerspectiveChange(e, draw));
    });

    // Add Team functionality removed for cleaner UI

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

    const showTeamTypeBadgesCheckbox = document.getElementById('showTeamTypeBadges');
    if (showTeamTypeBadgesCheckbox) {
        showTeamTypeBadgesCheckbox.addEventListener('change', (e) => {
            state.showTeamTypeBadges = e.target.checked;
            draw();
        });
    }

    // Filter toggle and interactions
    const filterToggleBtn = document.getElementById('filterToggleBtn');
    const filterDropdown = document.getElementById('filterDropdown');

    if (filterToggleBtn && filterDropdown) {
        // Toggle filter dropdown
        filterToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            filterDropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!filterToggleBtn.contains(e.target) && !filterDropdown.contains(e.target)) {
                filterDropdown.classList.remove('show');
            }
        });
    }

    // Apply filters button
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            // Collect selected filters
            const vsCheckboxes = document.querySelectorAll('#valueStreamFilters input[type="checkbox"]:checked');
            const pgCheckboxes = document.querySelectorAll('#platformGroupingFilters input[type="checkbox"]:checked');
            const ungroupedCheckbox = document.getElementById('showUngroupedTeams');

            state.selectedFilters.valueStreams = Array.from(vsCheckboxes).map(cb => cb.value);
            state.selectedFilters.platformGroupings = Array.from(pgCheckboxes).map(cb => cb.value);
            state.selectedFilters.showUngrouped = ungroupedCheckbox ? ungroupedCheckbox.checked : false;

            // Update filter count badge
            const filterCount = document.getElementById('filterCount');
            const total = state.selectedFilters.valueStreams.length +
                         state.selectedFilters.platformGroupings.length +
                         (state.selectedFilters.showUngrouped ? 1 : 0);
            if (filterCount) {
                if (total > 0) {
                    filterCount.textContent = total;
                    filterCount.style.display = 'inline-block';
                } else {
                    filterCount.style.display = 'none';
                }
            }

            // Close dropdown and redraw
            if (filterDropdown) {
                filterDropdown.classList.remove('show');
            }
            draw();
        });
    }

    // Clear all filters button
    const clearAllFiltersBtn = document.getElementById('clearAllFiltersBtn');
    if (clearAllFiltersBtn) {
        clearAllFiltersBtn.addEventListener('click', () => {
            // Uncheck all checkboxes
            document.querySelectorAll('.filter-options input[type="checkbox"]').forEach(cb => {
                cb.checked = false;
            });
        });
    }

    // Clear section filters buttons
    document.querySelectorAll('.filter-clear-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            const selector = type === 'vs' ? '#valueStreamFilters' : '#platformGroupingFilters';
            document.querySelectorAll(`${selector} input[type="checkbox"]`).forEach(cb => {
                cb.checked = false;
            });
        });
    });

    // Zoom controls
    const zoomInBtn = document.getElementById('zoomInBtn');
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', () => zoomIn(() => draw(state)));
    }

    const zoomOutBtn = document.getElementById('zoomOutBtn');
    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', () => zoomOut(() => draw(state)));
    }

    const fitViewBtn = document.getElementById('fitViewBtn');
    if (fitViewBtn) {
        fitViewBtn.addEventListener('click', () => {
            fitToView(state.canvas, state.teams, () => draw(state));
        });
    }

    // Keyboard shortcuts for zoom
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Plus/Equals for zoom in
        if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
            e.preventDefault();
            zoomIn(() => draw(state));
        }
        // Ctrl/Cmd + Minus for zoom out
        if ((e.ctrlKey || e.metaKey) && e.key === '-') {
            e.preventDefault();
            zoomOut(() => draw(state));
        }
        // Ctrl/Cmd + 0 for fit to view
        if ((e.ctrlKey || e.metaKey) && e.key === '0') {
            e.preventDefault();
            fitToView(state.canvas, state.teams, () => draw(state));
        }
    });

    // Team search functionality
    const teamSearch = document.getElementById('teamSearch');
    if (teamSearch) {
        teamSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const teamItems = document.querySelectorAll('.team-item');

            teamItems.forEach(item => {
                const teamName = item.textContent.toLowerCase();
                if (teamName.includes(searchTerm)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });

        // Clear search on Escape
        teamSearch.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                teamSearch.value = '';
                document.querySelectorAll('.team-item').forEach(item => {
                    item.style.display = 'block';
                });
                teamSearch.blur();
            }
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
