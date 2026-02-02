// API communication module
import { getApiUrl } from '../core/config.js';

/**
 * Get the API prefix based on view (Baseline or TT-Design)
 */
function getViewPrefix(view) {
    return view === 'baseline' ? '/baseline' : '/tt';
}

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
    const prefix = getViewPrefix(view);
    const response = await fetch(getApiUrl(`${prefix}/team-types`));
    if (!response.ok) {
        throw new Error(`Failed to load team types: ${response.status} ${response.statusText}`);
    }
    return await response.json();
}

export async function loadOrganizationHierarchy() {
    const response = await fetch(getApiUrl('/baseline/organization-hierarchy'));
    if (!response.ok) {
        throw new Error(`Failed to load organization hierarchy: ${response.status} ${response.statusText}`);
    }
    return await response.json();
}

export async function loadProductLines() {
    const response = await fetch(getApiUrl('/baseline/product-lines'));
    if (!response.ok) {
        throw new Error(`Failed to load product lines: ${response.status} ${response.statusText}`);
    }
    return await response.json();
}

export async function loadBusinessStreams() {
    const response = await fetch(getApiUrl('/baseline/business-streams'));
    if (!response.ok) {
        throw new Error(`Failed to load business streams: ${response.status} ${response.statusText}`);
    }
    return await response.json();
}

export async function loadTeams(view) {
    const prefix = getViewPrefix(view);
    const response = await fetch(getApiUrl(`${prefix}/teams`));
    if (!response.ok) {
        throw new Error(`Failed to load teams: ${response.status} ${response.statusText}`);
    }
    return await response.json();
}

export async function loadTeamDetails(teamId, view) {
    const prefix = getViewPrefix(view);
    // Use team_id directly (already slug-safe)
    const response = await fetch(getApiUrl(`${prefix}/teams/${teamId}`));
    if (!response.ok) {
        throw new Error(`Failed to load team details: ${response.status} ${response.statusText}`);
    }
    return await response.json();
}

export async function updateTeamPosition(teamId, x, y, view) {
    const prefix = getViewPrefix(view);
    // Use team_id directly (already slug-safe)
    const response = await fetch(getApiUrl(`${prefix}/teams/${teamId}/position`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x, y })
    });
    if (!response.ok) {
        throw new Error(`Failed to update team position: ${response.status} ${response.statusText}`);
    }
    return response.ok;
}

// Snapshot API functions (TT Design evolution tracking)
export async function createSnapshot(name, description = '', author = '', teamNames = undefined) {
    const body = { name, description, author };

    // Only include team_names if provided (for filtered snapshots)
    if (teamNames !== undefined) {
        body.team_names = teamNames;
    }

    const response = await fetch(getApiUrl('/tt/snapshots/create'), {
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
    const response = await fetch(getApiUrl('/tt/snapshots'));
    if (!response.ok) {
        throw new Error(`Failed to load snapshots: ${response.status} ${response.statusText}`);
    }
    return await response.json();
}

export async function loadSnapshot(snapshotId) {
    const response = await fetch(getApiUrl(`/tt/snapshots/${snapshotId}`));
    if (!response.ok) {
        throw new Error(`Snapshot not found: ${snapshotId}`);
    }
    return await response.json();
}

export async function compareSnapshots(beforeId, afterId) {
    const response = await fetch(getApiUrl(`/tt/snapshots/compare/${beforeId}/${afterId}`));
    if (!response.ok) {
        throw new Error('Failed to compare snapshots');
    }
    return await response.json();
}
