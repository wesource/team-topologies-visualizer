// Team filtering utilities
import { filterTeamsByValueStream } from '../../tt-concepts/tt-value-stream-grouping.js';
import { filterTeamsByPlatformGrouping } from '../../tt-concepts/tt-platform-grouping.js';

/**
 * Get filtered teams based on current view and selected grouping
 * @param {Array} teams - All teams
 * @param {string} currentView - Current view ('baseline' or 'tt')
 * @param {string} selectedGrouping - Selected grouping filter
 * @returns {Array} Filtered teams
 */
export function getFilteredTeams(teams, currentView, selectedGrouping) {
    // Only filter in TT Design view when a specific grouping is selected
    if (currentView !== 'tt' || selectedGrouping === 'all') {
        return teams;
    }

    if (selectedGrouping.startsWith('vs:')) {
        // Filter by value stream
        const valueStream = selectedGrouping.substring(3);
        return filterTeamsByValueStream(teams, valueStream);
    } else if (selectedGrouping.startsWith('pg:')) {
        // Filter by platform grouping
        const platformGrouping = selectedGrouping.substring(3);
        return filterTeamsByPlatformGrouping(teams, platformGrouping);
    }

    return teams;
}
