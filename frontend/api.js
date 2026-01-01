// API communication module
import { getApiUrl } from './config.js';

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
    const response = await fetch(getApiUrl(`/teams/${teamName}?view=${view}`));
    return await response.json();
}
export async function updateTeamPosition(teamName, x, y, view) {
    const response = await fetch(getApiUrl(`/teams/${teamName}/position?view=${view}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x, y })
    });
    return response.ok;
}
