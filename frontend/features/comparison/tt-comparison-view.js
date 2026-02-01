/**
 * Side-by-Side Snapshot Comparison View
 * Displays two snapshots side-by-side with visual comparison
 */

import { drawTeam, drawConnections, drawValueStreamGroupings, drawPlatformGroupings, drawValueStreamInnerGroupings, drawPlatformInnerGroupings } from '../../rendering/renderer-common.js';
import { getValueStreamGroupings, getValueStreamInnerGroupings } from '../../tt-concepts/tt-value-stream-grouping.js';
import { getPlatformGroupings, getPlatformInnerGroupings } from '../../tt-concepts/tt-platform-grouping.js';

class ComparisonView {
    constructor() {
        this.modal = null;
        this.beforeCanvas = null;
        this.afterCanvas = null;
        this.beforeCtx = null;
        this.afterCtx = null;
        this.beforeSnapshot = null;
        this.afterSnapshot = null;
        this.comparison = null;

        // Visibility toggles (default: all enabled)
        this.showGroupings = true;
        this.showInteractions = true;
        this.showBadges = true;

        // Separate view state for each canvas
        this.beforeView = {
            offsetX: 0,
            offsetY: 0,
            scale: 1,
            isPanning: false,
            lastMouseX: 0,
            lastMouseY: 0
        };

        this.afterView = {
            offsetX: 0,
            offsetY: 0,
            scale: 1,
            isPanning: false,
            lastMouseX: 0,
            lastMouseY: 0
        };
    }

    /**
     * Initialize the comparison view
     */
    init() {
        this.modal = document.getElementById('comparisonViewModal');
        this.beforeCanvas = document.getElementById('comparisonBeforeCanvas');
        this.afterCanvas = document.getElementById('comparisonAfterCanvas');

        if (!this.beforeCanvas || !this.afterCanvas) {
            console.error('Comparison canvases not found');
            return;
        }

        this.beforeCtx = this.beforeCanvas.getContext('2d');
        this.afterCtx = this.afterCanvas.getContext('2d');

        // Setup event listeners
        document.getElementById('closeComparisonViewBtn').addEventListener('click', () => this.close());

        // Setup canvas interactions
        this.setupCanvasInteractions(this.beforeCanvas, this.beforeView);
        this.setupCanvasInteractions(this.afterCanvas, this.afterView);

        // Setup zoom control buttons
        this.setupZoomControls();

        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    /**
     * Setup zoom control buttons
     */
    setupZoomControls() {
        // Before canvas controls
        document.getElementById('beforeZoomIn').addEventListener('click', () => {
            this.zoom(this.beforeView, this.beforeCanvas, 1.2);
        });
        document.getElementById('beforeZoomOut').addEventListener('click', () => {
            this.zoom(this.beforeView, this.beforeCanvas, 0.8);
        });
        document.getElementById('beforeResetView').addEventListener('click', () => {
            this.fitSnapshotToView(this.beforeSnapshot, this.beforeView, this.beforeCanvas);
            this.renderBefore();
        });

        // After canvas controls
        document.getElementById('afterZoomIn').addEventListener('click', () => {
            this.zoom(this.afterView, this.afterCanvas, 1.2);
        });
        document.getElementById('afterZoomOut').addEventListener('click', () => {
            this.zoom(this.afterView, this.afterCanvas, 0.8);
        });
        document.getElementById('afterResetView').addEventListener('click', () => {
            this.fitSnapshotToView(this.afterSnapshot, this.afterView, this.afterCanvas);
            this.renderAfter();
        });
    }

    /**
     * Setup visibility toggle controls
     */
    setupViewControls() {
        const groupingsCheckbox = document.getElementById('showGroupingsComparison');
        const interactionsCheckbox = document.getElementById('showInteractionsComparison');

        if (groupingsCheckbox) {
            groupingsCheckbox.checked = this.showGroupings;
            groupingsCheckbox.addEventListener('change', (e) => {
                this.showGroupings = e.target.checked;
                this.renderBefore();
                this.renderAfter();
            });
        }

        if (interactionsCheckbox) {
            interactionsCheckbox.checked = this.showInteractions;
            interactionsCheckbox.addEventListener('change', (e) => {
                this.showInteractions = e.target.checked;
                this.renderBefore();
                this.renderAfter();
            });
        }

        const badgesCheckbox = document.getElementById('showBadgesComparison');
        if (badgesCheckbox) {
            badgesCheckbox.checked = this.showBadges;
            badgesCheckbox.addEventListener('change', (e) => {
                this.showBadges = e.target.checked;
                this.renderBefore();
                this.renderAfter();
            });
        }
    }

    /**
     * Zoom in/out on a canvas
     */
    zoom(viewState, canvas, factor) {
        // Zoom towards center of canvas (use CSS dimensions, not scaled canvas dimensions)
        const centerX = canvas.clientWidth / 2;
        const centerY = canvas.clientHeight / 2;

        // Calculate world position of center before zoom
        const worldX = (centerX - viewState.offsetX) / viewState.scale;
        const worldY = (centerY - viewState.offsetY) / viewState.scale;

        // Apply zoom
        viewState.scale *= factor;
        viewState.scale = Math.max(0.1, Math.min(3, viewState.scale));

        // Adjust offset to keep center point fixed
        viewState.offsetX = centerX - worldX * viewState.scale;
        viewState.offsetY = centerY - worldY * viewState.scale;

        // Render
        this.renderCanvas(canvas, viewState);
    }

    /**
     * Setup canvas pan and zoom interactions
     */
    setupCanvasInteractions(canvas, viewState) {
        // Mouse down
        canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0 || e.button === 2) { // Left or right click
                viewState.isPanning = true;
                viewState.lastMouseX = e.clientX;
                viewState.lastMouseY = e.clientY;
                e.preventDefault();
            }
        });

        // Mouse move
        canvas.addEventListener('mousemove', (e) => {
            if (viewState.isPanning) {
                const dx = e.clientX - viewState.lastMouseX;
                const dy = e.clientY - viewState.lastMouseY;
                viewState.offsetX += dx;
                viewState.offsetY += dy;
                viewState.lastMouseX = e.clientX;
                viewState.lastMouseY = e.clientY;
                this.renderCanvas(canvas, viewState);
            }
        });

        // Mouse up
        canvas.addEventListener('mouseup', () => {
            viewState.isPanning = false;
        });

        // Mouse leave
        canvas.addEventListener('mouseleave', () => {
            viewState.isPanning = false;
        });

        // Wheel zoom
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            viewState.scale *= delta;
            viewState.scale = Math.max(0.1, Math.min(3, viewState.scale));
            this.renderCanvas(canvas, viewState);
        }, { passive: false });

        // Prevent context menu
        canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    /**
     * Open the comparison view with given snapshots and comparison data
     */
    open(beforeSnapshot, afterSnapshot, comparison) {
        this.beforeSnapshot = beforeSnapshot;
        this.afterSnapshot = afterSnapshot;
        this.comparison = comparison;

        // Set snapshot names and dates
        document.getElementById('comparisonBeforeName').textContent = beforeSnapshot.name;
        document.getElementById('comparisonAfterName').textContent = afterSnapshot.name;
        document.getElementById('comparisonBeforeDate').textContent =
            new Date(beforeSnapshot.created_at).toLocaleString();
        document.getElementById('comparisonAfterDate').textContent =
            new Date(afterSnapshot.created_at).toLocaleString();

        // Populate changes summary
        this.populateChangesSummary();

        // Show modal FIRST so dimensions are correct
        this.modal.style.display = 'flex';

        // Setup visibility toggle controls
        this.setupViewControls();

        // Defer sizing until after modal is rendered (display: flex)
        setTimeout(() => {
            // Size canvases
            this.resizeCanvases();

            // Reset view states and fit to view
            this.fitSnapshotToView(this.beforeSnapshot, this.beforeView, this.beforeCanvas);
            this.fitSnapshotToView(this.afterSnapshot, this.afterView, this.afterCanvas);

            // Render both canvases
            this.renderBefore();
            this.renderAfter();
        }, 0);
    }

    /**
     * Close the comparison view
     */
    close() {
        this.modal.style.display = 'none';
        this.beforeSnapshot = null;
        this.afterSnapshot = null;
        this.comparison = null;
    }

    /**
     * Populate the changes summary panel
     */
    populateChangesSummary() {
        const summary = this.comparison.changes.summary;
        const changes = this.comparison.changes;

        // Calculate interaction mode counts (with null safety)
        const beforeInteractions = this.countInteractionModes(this.beforeSnapshot?.teams || []);
        const afterInteractions = this.countInteractionModes(this.afterSnapshot?.teams || []);

        // Interaction modes comparison table (at the top)
        let html = `
            <div class="change-details" style="margin-bottom: 15px;">
                <h4>📊 Interaction Modes</h4>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <thead>
                        <tr style="border-bottom: 2px solid #ddd;">
                            <th style="text-align: left; padding: 6px;">Mode</th>
                            <th style="text-align: center; padding: 6px;">Before</th>
                            <th style="text-align: center; padding: 6px;">After</th>
                            <th style="text-align: center; padding: 6px;">Δ</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 6px;">🟣 Collaboration</td>
                            <td style="text-align: center; padding: 6px;">${beforeInteractions.collaboration}</td>
                            <td style="text-align: center; padding: 6px;">${afterInteractions.collaboration}</td>
                            <td style="text-align: center; padding: 6px; font-weight: bold; color: ${this.getDeltaColor(afterInteractions.collaboration - beforeInteractions.collaboration)}">${this.formatDelta(afterInteractions.collaboration - beforeInteractions.collaboration)}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 6px;">⚫ X-as-a-Service</td>
                            <td style="text-align: center; padding: 6px;">${beforeInteractions['x-as-a-service']}</td>
                            <td style="text-align: center; padding: 6px;">${afterInteractions['x-as-a-service']}</td>
                            <td style="text-align: center; padding: 6px; font-weight: bold; color: ${this.getDeltaColor(afterInteractions['x-as-a-service'] - beforeInteractions['x-as-a-service'])}">${this.formatDelta(afterInteractions['x-as-a-service'] - beforeInteractions['x-as-a-service'])}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px;">🟢 Facilitating</td>
                            <td style="text-align: center; padding: 6px;">${beforeInteractions.facilitating}</td>
                            <td style="text-align: center; padding: 6px;">${afterInteractions.facilitating}</td>
                            <td style="text-align: center; padding: 6px; font-weight: bold; color: ${this.getDeltaColor(afterInteractions.facilitating - beforeInteractions.facilitating)}">${this.formatDelta(afterInteractions.facilitating - beforeInteractions.facilitating)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
        `;

        // Team change statistics
        html += `
            <div class="change-stat added">
                <span>🟢 Added</span>
                <strong>${summary.added_count}</strong>
            </div>
            <div class="change-stat removed">
                <span>🔴 Removed</span>
                <strong>${summary.removed_count}</strong>
            </div>
            <div class="change-stat moved">
                <span>🟡 Moved</span>
                <strong>${summary.moved_count}</strong>
            </div>
            <div class="change-stat changed">
                <span>🔵 Type Changed</span>
                <strong>${summary.type_changed_count}</strong>
            </div>
        `;

        // Added teams
        if (changes.added_teams.length > 0) {
            html += '<div class="change-details"><h4>🟢 Added Teams:</h4><ul>';
            changes.added_teams.forEach(name => {
                html += `<li>${name}</li>`;
            });
            html += '</ul></div>';
        }

        // Removed teams
        if (changes.removed_teams.length > 0) {
            html += '<div class="change-details"><h4>🔴 Removed Teams:</h4><ul>';
            changes.removed_teams.forEach(name => {
                html += `<li>${name}</li>`;
            });
            html += '</ul></div>';
        }

        // Moved teams
        if (changes.moved_teams.length > 0) {
            html += '<div class="change-details"><h4>🟡 Moved Teams:</h4><ul>';
            changes.moved_teams.forEach(team => {
                html += `<li>${team.name}</li>`;
            });
            html += '</ul></div>';
        }

        // Type changed teams
        if (changes.type_changed_teams.length > 0) {
            html += '<div class="change-details"><h4>🔵 Type Changed:</h4><ul>';
            changes.type_changed_teams.forEach(team => {
                html += `<li>${team.name}</li>`;
            });
            html += '</ul></div>';
        }

        document.getElementById('comparisonChangesSummary').innerHTML = html;
    }

    /**
     * Resize canvases to fit their containers
     */
    resizeCanvases() {
        const panels = document.querySelectorAll('.comparison-panel');
        panels.forEach((panel, index) => {
            const canvas = index === 0 ? this.beforeCanvas : this.afterCanvas;
            const ctx = index === 0 ? this.beforeCtx : this.afterCtx;
            const rect = panel.getBoundingClientRect();

            const displayWidth = rect.width - 4; // Account for border
            const displayHeight = rect.height - 50; // Account for header

            // High-DPI support: Scale canvas for sharp text on retina displays
            const dpr = window.devicePixelRatio || 1;
            canvas.width = displayWidth * dpr;
            canvas.height = displayHeight * dpr;

            // Set CSS size to maintain correct display size
            canvas.style.width = `${displayWidth}px`;
            canvas.style.height = `${displayHeight}px`;

            // Scale context to match device pixel ratio
            ctx.scale(dpr, dpr);
        });
    }

    /**
     * Handle window resize
     */
    handleResize() {
        if (this.modal.style.display === 'flex') {
            this.resizeCanvases();
            this.renderBefore();
            this.renderAfter();
        }
    }

    /**
     * Render the before snapshot
     */
    renderBefore() {
        this.renderSnapshot(this.beforeCanvas, this.beforeCtx, this.beforeSnapshot, this.beforeView);
    }

    /**
     * Render the after snapshot
     */
    renderAfter() {
        this.renderSnapshot(this.afterCanvas, this.afterCtx, this.afterSnapshot, this.afterView);
    }

    /**
     * Fit snapshot to view by calculating bounds and scaling appropriately
     */
    fitSnapshotToView(snapshot, viewState, canvas) {
        console.log('[ComparisonView] fitSnapshotToView called:', {
            hasSnapshot: !!snapshot,
            teamCount: snapshot?.teams?.length,
            canvasWidth: canvas.width,
            canvasHeight: canvas.height,
            viewStateBefore: { ...viewState }
        });

        if (!snapshot || !snapshot.teams || snapshot.teams.length === 0) {
            viewState.offsetX = 0;
            viewState.offsetY = 0;
            viewState.scale = 1;
            console.log('[ComparisonView] No teams, reset to default view state');
            return;
        }

        // Calculate bounding box of all teams
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        snapshot.teams.forEach(team => {
            const x = team.position.x;
            const y = team.position.y;

            // Get team dimensions - use proper LAYOUT property names
            let width = 200;  // Default width for stream-aligned/platform
            let height = 60;  // Default height

            if (team.team_type === 'enabling' || team.team_type === 'complicated-subsystem') {
                width = 100;   // Narrow width
                height = 80;   // Taller height
            }

            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x + width);
            maxY = Math.max(maxY, y + height);
        });

        console.log('[ComparisonView] Bounding box:', { minX, minY, maxX, maxY });

        // Add padding around teams
        const padding = 50;
        const contentWidth = maxX - minX + (padding * 2);
        const contentHeight = maxY - minY + (padding * 2);

        console.log('[ComparisonView] Content dimensions:', { contentWidth, contentHeight, padding });

        // Calculate scale to fit content in canvas (use CSS dimensions, not scaled canvas dimensions)
        const scaleX = canvas.clientWidth / contentWidth;
        const scaleY = canvas.clientHeight / contentHeight;
        const scale = Math.min(scaleX, scaleY, 1.0); // Don't scale up beyond 1.0

        console.log('[ComparisonView] Scale calculation:', { scaleX, scaleY, finalScale: scale });

        // Calculate offset to center content (use CSS dimensions, not scaled canvas dimensions)
        const scaledContentWidth = contentWidth * scale;
        const scaledContentHeight = contentHeight * scale;
        const offsetX = (canvas.clientWidth - scaledContentWidth) / 2 - (minX - padding) * scale;
        const offsetY = (canvas.clientHeight - scaledContentHeight) / 2 - (minY - padding) * scale;

        console.log('[ComparisonView] Offset calculation:', { offsetX, offsetY });

        // Apply to view state
        viewState.scale = scale;
        viewState.offsetX = offsetX;
        viewState.offsetY = offsetY;

        console.log('[ComparisonView] View state after fit:', {
            scale: viewState.scale,
            offsetX: viewState.offsetX,
            offsetY: viewState.offsetY
        });
    }

    /**
     * Render a snapshot on a canvas
     */
    renderSnapshot(canvas, ctx, snapshot, viewState) {
        // Clear canvas (use CSS dimensions, not scaled canvas dimensions)
        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

        // Save context
        ctx.save();

        // Apply transformations
        ctx.translate(viewState.offsetX, viewState.offsetY);
        ctx.scale(viewState.scale, viewState.scale);

        // Build team color map from snapshot statistics (if available)
        const teamColorMap = {};
        if (snapshot.statistics && snapshot.statistics.team_types) {
            // Snapshot has team type info embedded
            Object.keys(snapshot.statistics.team_types).forEach(teamTypeName => {
                const teamTypeInfo = snapshot.statistics.team_types[teamTypeName];
                if (teamTypeInfo && teamTypeInfo.color) {
                    teamColorMap[teamTypeName] = teamTypeInfo.color;
                }
            });
        }

        // If no color map from snapshot stats, use hardcoded TT Design defaults (from tt-team-types.json)
        if (Object.keys(teamColorMap).length === 0) {
            teamColorMap['stream-aligned'] = '#FFEDB8';
            teamColorMap['platform'] = '#B7CDF1';
            teamColorMap['enabling'] = '#DFBDCF';
            teamColorMap['complicated-subsystem'] = '#FFC08B';
            teamColorMap['undefined'] = '#EBEBEF';
        }

        // Draw groupings if enabled
        if (this.showGroupings) {
            // Calculate groupings from snapshot data
            const valueStreamGroupings = getValueStreamGroupings(snapshot.teams);
            const platformGroupings = getPlatformGroupings(snapshot.teams);
            const valueStreamInnerGroupings = getValueStreamInnerGroupings(snapshot.teams);
            const platformInnerGroupings = getPlatformInnerGroupings(snapshot.teams);

            // Draw value stream groupings (behind teams)
            if (valueStreamGroupings.length > 0) {
                drawValueStreamGroupings(ctx, valueStreamGroupings);
            }

            // Draw platform groupings (behind teams)
            if (platformGroupings.length > 0) {
                drawPlatformGroupings(ctx, platformGroupings);
            }

            // Draw inner groupings (on top of outer groupings, behind teams)
            if (valueStreamInnerGroupings.length > 0) {
                drawValueStreamInnerGroupings(ctx, valueStreamInnerGroupings);
            }
            if (platformInnerGroupings.length > 0) {
                drawPlatformInnerGroupings(ctx, platformInnerGroupings);
            }
        }

        // Draw connections/interactions if enabled (behind teams)
        if (this.showInteractions) {
            drawConnections(ctx, snapshot.teams, {
                currentView: 'tt',
                showInteractionModes: true
            });
        }

        // Draw teams (on top of interactions) - without badges first
        snapshot.teams.forEach(team => {
            // Draw team boxes without comparison badges
            drawTeam(
                ctx,
                team,
                {
                    selectedTeam: null, // selectedTeam
                    teamColorMap, // Team colors
                    wrapText: (text, maxWidth) => this.wrapText(ctx, text, maxWidth), // wrapText function
                    currentView: 'tt', // currentView - snapshots are TT Design
                    showCognitiveLoad: false, // showCognitiveLoad
                    comparisonData: null // No comparison data for first pass (no badges)
                }
            );
        });

        // Draw comparison badges on top of all team boxes (second pass)
        const isAfterSnapshot = (snapshot === this.afterSnapshot);
        if (this.showBadges && isAfterSnapshot && this.comparison && this.comparison.changes) {
            const changes = this.comparison.changes;

            snapshot.teams.forEach(team => {
                // Check if this team has changes
                let badge = null;
                if (changes.added_teams?.includes(team.name)) {
                    badge = { type: 'added', color: '#4CAF50', emoji: '🟢', label: 'NEW' };
                } else if (changes.moved_teams?.some(t => t.name === team.name)) {
                    badge = { type: 'moved', color: '#ffc107', emoji: '🟡', label: 'MOVED' };
                } else if (changes.type_changed_teams?.some(t => t.name === team.name)) {
                    badge = { type: 'changed', color: '#17a2b8', emoji: '🔵', label: 'CHANGED' };
                }

                if (badge) {
                    // Get team dimensions for badge positioning
                    const isWideTeam = team.team_type === 'stream-aligned' || team.team_type === 'platform';
                    const width = isWideTeam ? 200 : 100;
                    const _height = isWideTeam ? 60 : 80;

                    // Draw badge above team box
                    const badgeHeight = 20;
                    const badgeY = team.position.y - badgeHeight - 5;

                    // Background
                    ctx.fillStyle = badge.color;
                    ctx.fillRect(team.position.x, badgeY, width, badgeHeight);

                    // Text
                    ctx.fillStyle = '#fff';
                    ctx.font = 'bold 11px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(`${badge.emoji} ${badge.label}`, team.position.x + width / 2, badgeY + badgeHeight / 2);
                }
            });
        }

        // Restore context
        ctx.restore();
    }

    /**
     * Render canvas with current view state
     */
    renderCanvas(canvas, _viewState) {
        if (canvas === this.beforeCanvas) {
            this.renderBefore();
        } else {
            this.renderAfter();
        }
    }

    /**
     * Wrap text to fit width
     */
    wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        words.forEach(word => {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const metrics = ctx.measureText(testLine);

            if (metrics.width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        });

        if (currentLine) {
            lines.push(currentLine);
        }

        return lines;
    }

    /**
     * Count interaction modes in a snapshot
     * @param {Array} teams - Array of team objects
     * @returns {Object} - Counts for each interaction mode
     */
    countInteractionModes(teams) {
        const counts = {
            'collaboration': 0,
            'x-as-a-service': 0,
            'facilitating': 0
        };

        teams.forEach(team => {
            if (team.interaction_modes) {
                Object.values(team.interaction_modes).forEach(mode => {
                    if (Object.hasOwn(counts, mode)) {
                        counts[mode]++;
                    }
                });
            }
        });

        return counts;
    }

    /**
     * Format delta value with sign
     */
    formatDelta(delta) {
        if (delta === 0) return '–';
        return delta > 0 ? `+${delta}` : `${delta}`;
    }

    /**
     * Get color for delta value
     */
    getDeltaColor(delta) {
        if (delta === 0) return '#999';
        return delta > 0 ? '#28a745' : '#dc3545';
    }
}

// Export singleton instance
export const comparisonView = new ComparisonView();
