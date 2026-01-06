// API communication module
import { getApiUrl } from './config.js';

/**
 * Convert team name to URL-safe slug.
 * Must match backend logic in backend/services.py:team_name_to_slug()
 *
 * Examples:
 *   "CI/CD Platform Team" -> "ci-cd-platform-team"
 *   "Data & Analytics Team" -> "data-and-analytics-team"
 *   "API Gateway Team" -> "api-gateway-team"
 */
export function teamNameToSlug(teamName) {
    let slug = teamName;
    slug = slug.replace(/\//g, '-');  // CI/CD -> CI-CD
    slug = slug.replace(/&/g, 'and');  // & -> and
    slug = slug.replace(/[^\w\s-]/g, '');  // Remove other special chars
    slug = slug.replace(/[-\s]+/g, '-');  // Multiple spaces/dashes -> single dash
    slug = slug.trim().replace(/^-+|-+$/g, '').toLowerCase();  // Trim dashes and lowercase
    return slug;
}

export async function loadTeamTypes(view) {
    const response = await fetch(getApiUrl(`/team-types?view=${view}`));
    return await response.json();
}
export async function loadOrganizationHierarchy() {
    const response = await fetch(getApiUrl('/organization-hierarchy'));
    return await response.json();
}
export async function loadTeams(view) {
    const response = await fetch(getApiUrl(`/teams?view=${view}`));
    return await response.json();
}
export async function loadTeamDetails(teamName, view) {
    // Use URL-safe slug instead of URL-encoding the team name
    const slug = teamNameToSlug(teamName);
    const response = await fetch(getApiUrl(`/teams/${slug}?view=${view}`));
    return await response.json();
}
export async function updateTeamPosition(teamName, x, y, view) {
    // Use URL-safe slug instead of URL-encoding the team name
    const slug = teamNameToSlug(teamName);
    const response = await fetch(getApiUrl(`/teams/${slug}/position?view=${view}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x, y })
    });
    return response.ok;
}

// Snapshot API functions
export async function createSnapshot(name, description = '', author = '', teamNames = undefined) {
    const body = { name, description, author };

    // Only include team_names if provided (for filtered snapshots)
    if (teamNames !== undefined) {
        body.team_names = teamNames;
    }

    const response = await fetch(getApiUrl('/snapshots/create'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create snapshot');
    }
    return await response.json();
}

export async function loadSnapshots() {
    const response = await fetch(getApiUrl('/snapshots'));
    return await response.json();
}

export async function loadSnapshot(snapshotId) {
    const response = await fetch(getApiUrl(`/snapshots/${snapshotId}`));
    if (!response.ok) {
        throw new Error(`Snapshot not found: ${snapshotId}`);
    }
    return await response.json();
}

export async function compareSnapshots(beforeId, afterId) {
    const response = await fetch(getApiUrl(`/snapshots/compare/${beforeId}/${afterId}`));
    if (!response.ok) {
        throw new Error('Failed to compare snapshots');
    }
    return await response.json();
}
