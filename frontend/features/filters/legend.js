// Legend rendering and interaction - manages visual legend UI
import { state } from '../../core/state-management.js';
import { showInfoModal } from '../../interactions/modals.js';
import { darkenColor } from '../../rendering/renderer-common.js';
import { getValueStreamNames } from '../../tt-concepts/tt-value-stream-grouping.js';
import { getPlatformGroupingNames } from '../../tt-concepts/tt-platform-grouping.js';

export function updateLegend() {
    const legendDiv = document.querySelector('.legend');
    if (!legendDiv)
        return;

    // Book-accurate SVG shapes for TT Design team types
    const ttDesignShapes = {
        'stream-aligned': '<svg width="50" height="18" viewBox="0 0 220 70" style="display: block;"><rect x="10" y="20" width="200" height="30" rx="12" ry="12" fill="#F9E2A0" stroke="#E3B23C" stroke-width="2"></rect></svg>',
        'platform': '<svg width="50" height="23" viewBox="0 0 220 100" style="display: block;"><rect x="10" y="20" width="200" height="60" rx="14" ry="14" fill="#9fd3e8" stroke="#4fa3c7" stroke-width="2"></rect></svg>',
        'enabling': '<svg width="28" height="64" viewBox="0 0 140 180" style="display: block;"><rect x="30" y="30" width="80" height="120" rx="14" ry="14" fill="#b7a6d9" stroke="#7a5fa6" stroke-width="2"></rect></svg>',
        'complicated-subsystem': '<svg width="32" height="32" viewBox="0 0 140 140" style="display: block;"><path d="M40 20 H100 L120 40 V100 L100 120 H40 L20 100 V40 Z" fill="#f4b183" stroke="#c97a2b" stroke-width="2"></path></svg>'
    };

    // Build legend from team type config
    let legendHTML = '<div class="legend-section"><h4>Team Types</h4>';
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
            <div class="legend-item team-type-item" data-team-type="${type.id}" style="${clickableStyle} padding: 0.3rem; border-radius: 4px; transition: background 0.2s;" ${hoverEffect}>
                <div class="legend-symbol">${displaySymbol}</div>
                <div class="legend-text">
                    <span style="flex: 1;">${type.name}</span>
                    ${infoIcon}
                </div>
            </div>
        `;
    });
    legendHTML += '</div>';

    // Add view-specific legend items
    if (state.currentView === 'current') {
        // Current State view shows dependencies (Actual Comms)
        legendHTML += `
            <div class="legend-section">
                <h4>Connections</h4>
                <div class="legend-item" style="padding: 0.3rem;">
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
            </div>
        `;
    } else if (state.currentView === 'tt') {
        // TT Design view shows interaction modes (book-accurate symbols)
        legendHTML += `
            <div class="legend-section">
                <h4>Interaction Modes</h4>
                <div class="legend-item interaction-mode-item" data-mode="collaboration" style="cursor: pointer; padding: 0.3rem; border-radius: 4px; transition: background 0.2s;" onmouseover="this.style.background='rgba(122, 95, 166, 0.1)'" onmouseout="this.style.background='transparent'">
                    <div class="legend-symbol">
                        <svg width="40" height="20" viewBox="0 0 200 100">
                            <defs>
                                <pattern id="crossHatchLegend" width="12" height="12" patternUnits="userSpaceOnUse">
                                    <path d="M0 12 L12 0" stroke="#7a5fa6" stroke-width="1"></path>
                                    <path d="M0 0 L12 12" stroke="#7a5fa6" stroke-width="1"></path>
                                </pattern>
                            </defs>
                            <rect x="10" y="20" width="180" height="60" rx="8" ry="8" fill="#b7a6d9" stroke="#7a5fa6" stroke-width="2"></rect>
                            <rect x="10" y="20" width="180" height="60" rx="8" ry="8" fill="url(#crossHatchLegend)"></rect>
                        </svg>
                    </div>
                    <div class="legend-text">
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
                </div>
            <div class="legend-item interaction-mode-item" data-mode="x-as-a-service" style="cursor: pointer; padding: 0.3rem; border-radius: 4px; transition: background 0.2s; margin-top: 0.5rem;" onmouseover="this.style.background='rgba(34, 34, 34, 0.05)'" onmouseout="this.style.background='transparent'">
                <div class="legend-symbol">
                    <svg width="40" height="20" viewBox="0 0 200 100">
                        <path d="M80 30 C60 30, 60 30, 60 50 C60 70, 60 70, 80 70" fill="none" stroke="#222222" stroke-width="6" stroke-linecap="round"></path>
                        <path d="M120 30 C140 30, 140 30, 140 50 C140 70, 140 70, 120 70" fill="none" stroke="#222222" stroke-width="6" stroke-linecap="round"></path>
                    </svg>
                </div>
                <div class="legend-text">
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
            </div>
            <div class="legend-item interaction-mode-item" data-mode="facilitating" style="cursor: pointer; padding: 0.3rem; border-radius: 4px; transition: background 0.2s; margin-top: 0.5rem;" onmouseover="this.style.background='rgba(111, 169, 140, 0.1)'" onmouseout="this.style.background='transparent'">
                <div class="legend-symbol">
                    <svg width="24" height="24" viewBox="0 0 120 120">
                    <defs>
                        <pattern id="dotPatternLegend" width="8" height="8" patternUnits="userSpaceOnUse">
                            <circle cx="2" cy="2" r="1.5" fill="#6fa98c"></circle>
                        </pattern>
                    </defs>
                    <circle cx="60" cy="60" r="45" fill="#9fd0b5" stroke="#6fa98c" stroke-width="2"></circle>
                    <circle cx="60" cy="60" r="45" fill="url(#dotPatternLegend)"></circle>
                    </svg>
                </div>
                <div class="legend-text">
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
            </div>
            </div>
        `;

        // Add grouping explanations (fractal patterns from 2nd edition)
        const valueStreams = getValueStreamNames(state.teams);
        if (valueStreams.length > 0) {
            legendHTML += `
                <div class="legend-section">
                <h4>Groupings</h4>
                <div class="legend-item grouping-item" data-grouping="value-stream" style="cursor: pointer; padding: 0.3rem; border-radius: 4px; transition: background 0.2s;" onmouseover="this.style.background='rgba(255, 200, 130, 0.1)'" onmouseout="this.style.background='transparent'">
                    <div class="legend-symbol">
                        <span class="legend-grouping-box value-stream"></span>
                    </div>
                    <div class="legend-text">
                        <span style="flex: 1;"><strong>Value Stream</strong></span>
                        <span style="color: #999; font-size: 0.9rem; margin-left: 0.5rem;">ℹ️</span>
                    </div>
                </div>
                <div class="legend-item grouping-item" data-grouping="platform-grouping" style="cursor: pointer; padding: 0.3rem; border-radius: 4px; transition: background 0.2s; margin-top: 0.5rem;" onmouseover="this.style.background='rgba(126, 200, 227, 0.1)'" onmouseout="this.style.background='transparent'">
                    <div class="legend-symbol">
                        <span class="legend-grouping-box platform"></span>
                    </div>
                    <div class="legend-text">
                        <span style="flex: 1;"><strong>Platform Grouping</strong></span>
                        <span style="color: #999; font-size: 0.9rem; margin-left: 0.5rem;">ℹ️</span>
                    </div>
                </div>
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

export function updateGroupingFilter() {
    const vsContainer = document.getElementById('valueStreamFilters');
    const pgContainer = document.getElementById('platformGroupingFilters');

    if (!vsContainer || !pgContainer) return;

    // Get unique value streams and platform groupings from current teams
    const valueStreams = getValueStreamNames(state.teams);
    const platformGroupings = getPlatformGroupingNames(state.teams);

    // Populate value stream checkboxes
    vsContainer.innerHTML = '';
    if (valueStreams.length === 0) {
        vsContainer.innerHTML = '<div class="filter-empty">No value streams</div>';
    } else {
        valueStreams.forEach(vs => {
            const label = document.createElement('label');
            label.className = 'filter-checkbox-label';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = vs;
            checkbox.dataset.filterType = 'vs';
            checkbox.checked = state.selectedFilters.valueStreams.includes(vs);

            const span = document.createElement('span');
            span.textContent = vs;

            label.appendChild(checkbox);
            label.appendChild(span);
            vsContainer.appendChild(label);
        });
    }

    // Populate platform grouping checkboxes
    pgContainer.innerHTML = '';
    if (platformGroupings.length === 0) {
        pgContainer.innerHTML = '<div class="filter-empty">No platform groupings</div>';
    } else {
        platformGroupings.forEach(pg => {
            const label = document.createElement('label');
            label.className = 'filter-checkbox-label';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = pg;
            checkbox.dataset.filterType = 'pg';
            checkbox.checked = state.selectedFilters.platformGroupings.includes(pg);

            const span = document.createElement('span');
            span.textContent = pg;

            label.appendChild(checkbox);
            label.appendChild(span);
            pgContainer.appendChild(label);
        });
    }

    updateFilterCount();
}

// Update the filter count badge
function updateFilterCount() {
    const filterCount = document.getElementById('filterCount');
    if (!filterCount) return;

    const total = state.selectedFilters.valueStreams.length +
                  state.selectedFilters.platformGroupings.length;

    if (total > 0) {
        filterCount.textContent = total;
        filterCount.style.display = 'inline-block';
    } else {
        filterCount.style.display = 'none';
    }
}
