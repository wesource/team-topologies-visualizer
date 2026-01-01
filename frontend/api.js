// API communication module
const API_BASE = 'http://localhost:8001/api';
export async function loadTeamTypes(view) {
    const response = await fetch(`${API_BASE}/team-types?view=${view}`);
    return await response.json();
}
export async function loadOrganizationHierarchy() {
    const response = await fetch(`${API_BASE}/organization-hierarchy`);
    return await response.json();
}
export async function loadTeams(view) {
    const response = await fetch(`${API_BASE}/teams?view=${view}`);
    return await response.json();
}
export async function loadTeamDetails(teamName, view) {
    const response = await fetch(`${API_BASE}/teams/${teamName}?view=${view}`);
    return await response.json();
}
export async function updateTeamPosition(teamName, x, y, view) {
    const response = await fetch(`${API_BASE}/teams/${teamName}/position?view=${view}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x, y })
    });
    return response.ok;
}
