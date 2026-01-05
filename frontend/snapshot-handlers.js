/**
 * Snapshot UI handlers and interactions
 */
import { state } from './state-management.js';
import { createSnapshot, loadSnapshots, loadSnapshot } from './api.js';
import { showError, showSuccess, showInfo } from './notifications.js';
import { draw } from './renderer.js';

let timelinePanelOpen = false;

/**
 * Initialize snapshot UI event handlers
 */
export function initSnapshotHandlers() {
    // Show/hide buttons based on view
    document.getElementById('viewCurrent').addEventListener('change', updateSnapshotButtonVisibility);
    document.getElementById('viewTT').addEventListener('change', updateSnapshotButtonVisibility);
    
    // Create snapshot button
    document.getElementById('createSnapshotBtn').addEventListener('click', openCreateSnapshotModal);
    
    // Timeline button
    document.getElementById('timelineBtn').addEventListener('click', toggleTimelinePanel);
    
    // Create snapshot modal handlers
    document.getElementById('createSnapshotModalClose').addEventListener('click', closeCreateSnapshotModal);
    document.getElementById('cancelSnapshotBtn').addEventListener('click', closeCreateSnapshotModal);
    document.getElementById('createSnapshotForm').addEventListener('submit', handleCreateSnapshot);
    
    // Timeline panel handlers
    document.getElementById('closeTimelineBtn').addEventListener('click', closeTimelinePanel);
    
    // Return to live view
    document.getElementById('returnToLiveBtn').addEventListener('click', returnToLiveView);
    
    // Initial visibility
    updateSnapshotButtonVisibility();
}

/**
 * Update button visibility based on current view
 */
function updateSnapshotButtonVisibility() {
    const isTTView = state.currentView === 'tt';
    const isViewingSnapshot = state.isViewingSnapshot;
    
    document.getElementById('createSnapshotBtn').style.display = isTTView && !isViewingSnapshot ? 'inline-block' : 'none';
    document.getElementById('timelineBtn').style.display = isTTView ? 'inline-block' : 'none';
}

/**
 * Open create snapshot modal
 */
async function openCreateSnapshotModal() {
    const modal = document.getElementById('createSnapshotModal');
    const preview = document.getElementById('snapshotPreview');
    
    // Auto-suggest name
    const today = new Date().toISOString().split('T')[0];
    const suggestedName = `TT Design v1.0 - ${today}`;
    document.getElementById('snapshotName').value = suggestedName;
    
    // Load preview data
    preview.innerHTML = 'Loading preview...';
    
    try {
        const teams = state.teams;
        const stats = calculateStats(teams);
        
        preview.innerHTML = `
            <strong>Preview:</strong><br>
            This will capture ${stats.total} teams across ${stats.valueStreams} value streams and ${stats.platformGroupings} platform groupings.
            <br><br>
            <strong>Team types:</strong> 
            ${stats.streamAligned} stream-aligned, 
            ${stats.platform} platform, 
            ${stats.enabling} enabling, 
            ${stats.complicatedSubsystem} complicated subsystem
        `;
    } catch (error) {
        preview.innerHTML = '<span style="color: #dc3545;">Failed to load preview</span>';
    }
    
    modal.style.display = 'block';
}

/**
 * Close create snapshot modal
 */
function closeCreateSnapshotModal() {
    document.getElementById('createSnapshotModal').style.display = 'none';
    document.getElementById('createSnapshotForm').reset();
}

/**
 * Handle create snapshot form submission
 */
async function handleCreateSnapshot(event) {
    event.preventDefault();
    
    const name = document.getElementById('snapshotName').value.trim();
    const description = document.getElementById('snapshotDescription').value.trim();
    const author = document.getElementById('snapshotAuthor').value.trim();
    
    if (!name) {
        showError('Please enter a snapshot name');
        return;
    }
    
    try {
        showInfo('Creating snapshot...');
        const snapshot = await createSnapshot(name, description, author);
        
        closeCreateSnapshotModal();
        showSuccess(`Snapshot created: ${snapshot.name}`);
        
        // Refresh timeline if open
        if (timelinePanelOpen) {
            await refreshTimelinePanel();
        }
    } catch (error) {
        showError(`Failed to create snapshot: ${error.message}`);
    }
}

/**
 * Calculate statistics for preview
 */
function calculateStats(teams) {
    const stats = {
        total: teams.length,
        streamAligned: 0,
        platform: 0,
        enabling: 0,
        complicatedSubsystem: 0,
        valueStreams: new Set(),
        platformGroupings: new Set()
    };
    
    teams.forEach(team => {
        if (team.team_type === 'stream-aligned') stats.streamAligned++;
        else if (team.team_type === 'platform') stats.platform++;
        else if (team.team_type === 'enabling') stats.enabling++;
        else if (team.team_type === 'complicated-subsystem') stats.complicatedSubsystem++;
        
        if (team.value_stream) stats.valueStreams.add(team.value_stream);
        if (team.platform_grouping) stats.platformGroupings.add(team.platform_grouping);
    });
    
    return {
        ...stats,
        valueStreams: stats.valueStreams.size,
        platformGroupings: stats.platformGroupings.size
    };
}

/**
 * Toggle timeline panel
 */
async function toggleTimelinePanel() {
    if (timelinePanelOpen) {
        closeTimelinePanel();
    } else {
        await openTimelinePanel();
    }
}

/**
 * Open timeline panel
 */
async function openTimelinePanel() {
    const panel = document.getElementById('timelinePanel');
    panel.style.display = 'flex';
    timelinePanelOpen = true;
    
    await refreshTimelinePanel();
}

/**
 * Close timeline panel
 */
function closeTimelinePanel() {
    document.getElementById('timelinePanel').style.display = 'none';
    timelinePanelOpen = false;
}

/**
 * Refresh timeline panel with latest snapshots
 */
async function refreshTimelinePanel() {
    const listElement = document.getElementById('snapshotList');
    listElement.innerHTML = 'Loading snapshots...';
    
    try {
        const snapshots = await loadSnapshots();
        
        if (snapshots.length === 0) {
            listElement.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: #888;">
                    <p style="font-size: 2rem; margin-bottom: 10px;">📸</p>
                    <p>No snapshots yet</p>
                    <p style="font-size: 0.9rem; margin-top: 10px;">Create your first snapshot to start tracking evolution</p>
                </div>
            `;
            return;
        }
        
        // Build HTML
        let html = '';
        
        // Current live view first
        html += `
            <div class="snapshot-item ${!state.isViewingSnapshot ? 'current' : ''}" data-snapshot-id="current">
                <div class="snapshot-name">▶ Current (Live)</div>
                <div class="snapshot-stats">${state.teams.length} teams, last updated ${new Date().toLocaleDateString()}</div>
            </div>
        `;
        
        // Snapshots
        snapshots.forEach(snapshot => {
            const isActive = state.isViewingSnapshot && state.currentSnapshot?.snapshot_id === snapshot.snapshot_id;
            const date = new Date(snapshot.created_at).toLocaleDateString();
            const time = new Date(snapshot.created_at).toLocaleTimeString();
            
            html += `
                <div class="snapshot-item ${isActive ? 'active' : ''}" data-snapshot-id="${snapshot.snapshot_id}">
                    <div class="snapshot-name">📸 ${snapshot.name}</div>
                    <div class="snapshot-meta">${date} at ${time}${snapshot.author ? ` • ${snapshot.author}` : ''}</div>
                    <div class="snapshot-stats">
                        ${snapshot.statistics.total_teams} teams • 
                        ${snapshot.statistics.value_streams} value streams • 
                        ${snapshot.statistics.platform_groupings} platform groupings
                    </div>
                    ${snapshot.description ? `<div class="snapshot-description">${snapshot.description}</div>` : ''}
                </div>
            `;
        });
        
        listElement.innerHTML = html;
        
        // Add click handlers
        listElement.querySelectorAll('.snapshot-item').forEach(item => {
            item.addEventListener('click', () => handleSnapshotClick(item.dataset.snapshotId));
        });
    } catch (error) {
        listElement.innerHTML = `<div style="color: #dc3545; padding: 20px;">Failed to load snapshots: ${error.message}</div>`;
    }
}

/**
 * Handle snapshot item click
 */
async function handleSnapshotClick(snapshotId) {
    if (snapshotId === 'current') {
        returnToLiveView();
        return;
    }
    
    try {
        showInfo('Loading snapshot...');
        const snapshot = await loadSnapshot(snapshotId);
        
        // Update state
        state.isViewingSnapshot = true;
        state.currentSnapshot = snapshot;
        state.snapshotMetadata = {
            snapshot_id: snapshot.snapshot_id,
            name: snapshot.name,
            created_at: snapshot.created_at
        };
        
        // Convert condensed teams to full format for rendering
        state.teams = snapshot.teams.map(team => ({
            name: team.name,
            team_type: team.team_type,
            position: team.position,
            value_stream: team.value_stream,
            platform_grouping: team.platform_grouping,
            dependencies: team.dependencies || [],
            interaction_modes: team.interaction_modes || {},
            metadata: team.metadata || {},
            description: '', // Not stored in snapshots
            cognitive_load: team.metadata?.cognitive_load || null,
            established: team.metadata?.established || null
        }));
        
        // Update UI
        showSnapshotBanner(snapshot.name, snapshot.created_at);
        updateSnapshotButtonVisibility();
        
        // Re-render
        draw(state);
        
        // Refresh timeline to show active state
        await refreshTimelinePanel();
        
        showSuccess(`Loaded snapshot: ${snapshot.name}`);
    } catch (error) {
        showError(`Failed to load snapshot: ${error.message}`);
    }
}

/**
 * Show snapshot banner
 */
function showSnapshotBanner(name, createdAt) {
    const banner = document.getElementById('snapshotBanner');
    const nameEl = document.getElementById('snapshotBannerName');
    const dateEl = document.getElementById('snapshotBannerDate');
    
    nameEl.textContent = name;
    dateEl.textContent = `(${new Date(createdAt).toLocaleString()})`;
    banner.style.display = 'block';
    
    // Adjust container padding to account for banner
    document.querySelector('.container').style.paddingTop = '60px';
}

/**
 * Hide snapshot banner
 */
function hideSnapshotBanner() {
    document.getElementById('snapshotBanner').style.display = 'none';
    document.querySelector('.container').style.paddingTop = '0';
}

/**
 * Return to live view
 */
async function returnToLiveView() {
    if (!state.isViewingSnapshot) return;
    
    try {
        showInfo('Returning to live view...');
        
        // Reset snapshot state
        state.isViewingSnapshot = false;
        state.currentSnapshot = null;
        state.snapshotMetadata = null;
        
        // Hide banner
        hideSnapshotBanner();
        
        // Reload teams from API
        const { loadTeams } = await import('./api.js');
        state.teams = await loadTeams(state.currentView);
        
        // Update UI
        updateSnapshotButtonVisibility();
        
        // Re-render
        draw(state);
        
        // Refresh timeline if open
        if (timelinePanelOpen) {
            await refreshTimelinePanel();
        }
        
        showSuccess('Returned to live view');
    } catch (error) {
        showError(`Failed to return to live view: ${error.message}`);
    }
}
