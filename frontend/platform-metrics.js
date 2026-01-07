/**
 * Platform Metrics Module
 *
 * Calculates platform consumption metrics to identify adoption patterns and bottlenecks.
 * Only applicable to TT-Design view where teams have interaction_modes.
 */

/**
 * Calculate platform consumers for a given team.
 *
 * @param {string} teamName - The platform team name to analyze
 * @param {Array} allTeams - All teams in the current view
 * @returns {Object} - Platform consumption metrics
 * @returns {Array} returns.consumers - Array of consuming teams with details
 * @returns {number} returns.totalCount - Total number of consuming teams
 * @returns {Object} returns.byValueStream - Breakdown by value stream
 * @returns {string} returns.adoptionLevel - 'light', 'moderate', or 'heavy'
 * @returns {boolean} returns.isOverloaded - True if >15 consumers
 */
export function calculatePlatformConsumers(teamName, allTeams) {
    if (!teamName || !allTeams) {
        return {
            consumers: [],
            totalCount: 0,
            byValueStream: {},
            adoptionLevel: 'light',
            isOverloaded: false
        };
    }

    const consumers = [];
    const byValueStream = {};

    allTeams.forEach(team => {
        // Skip self
        if (team.name === teamName) {
            return;
        }

        // Check if this team depends on the platform
        const interactionMode = team.interaction_modes?.[teamName];
        if (interactionMode) {
            const consumer = {
                name: team.name,
                mode: interactionMode,
                valueStream: team.value_stream || 'Unassigned',
                teamType: team.team_type
            };

            consumers.push(consumer);

            // Count by value stream
            const vs = consumer.valueStream;
            byValueStream[vs] = (byValueStream[vs] || 0) + 1;
        }
    });

    const totalCount = consumers.length;
    let adoptionLevel = 'light';
    let isOverloaded = false;

    if (totalCount >= 16) {
        adoptionLevel = 'heavy';
        isOverloaded = true;
    } else if (totalCount >= 11) {
        adoptionLevel = 'moderate';
    }

    return {
        consumers,
        totalCount,
        byValueStream,
        adoptionLevel,
        isOverloaded
    };
}

/**
 * Calculate dependency metrics for a team (both consumers and dependencies).
 *
 * @param {string} teamName - The team to analyze
 * @param {Array} allTeams - All teams in the current view
 * @returns {Object} - Dependency metrics
 * @returns {Array} returns.consumers - Teams that depend on this team
 * @returns {Array} returns.dependencies - Teams this team depends on
 * @returns {number} returns.consumerCount - Number of consumers
 * @returns {number} returns.dependencyCount - Number of dependencies
 */
export function calculateDependencyMetrics(teamName, allTeams) {
    if (!teamName || !allTeams) {
        return {
            consumers: [],
            dependencies: [],
            consumerCount: 0,
            dependencyCount: 0
        };
    }

    const team = allTeams.find(t => t.name === teamName);
    if (!team) {
        return {
            consumers: [],
            dependencies: [],
            consumerCount: 0,
            dependencyCount: 0
        };
    }

    // Get consumers (who depends on this team)
    const platformMetrics = calculatePlatformConsumers(teamName, allTeams);
    const consumers = platformMetrics.consumers;

    // Get dependencies (who this team depends on)
    const dependencies = [];
    if (team.interaction_modes) {
        Object.keys(team.interaction_modes).forEach(depTeamName => {
            const depTeam = allTeams.find(t => t.name === depTeamName);
            if (depTeam) {
                dependencies.push({
                    name: depTeamName,
                    mode: team.interaction_modes[depTeamName],
                    teamType: depTeam.team_type
                });
            }
        });
    }

    return {
        consumers,
        dependencies,
        consumerCount: consumers.length,
        dependencyCount: dependencies.length
    };
}
