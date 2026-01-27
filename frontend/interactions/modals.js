/**
 * Modal Management
 * Handles all modal dialogs (team details, educational info, etc.)
 */

import { loadTeamDetails } from '../api/api.js';
import { showError } from '../ui/notifications.js';
import { getCognitiveLoadIndicator } from '../rendering/renderer-common.js';
import { calculatePlatformConsumers } from '../tt-concepts/platform-metrics.js';
// marked.js v14.1.3 - Markdown parser for team detail modals
// Loaded from jsDelivr CDN (pinned version for stability)
import { marked } from 'https://cdn.jsdelivr.net/npm/marked@14.1.3/+esm';

// Configure marked with safe defaults
marked.setOptions({
    gfm: true, // GitHub Flavored Markdown
    breaks: false,
    headerIds: false,
    mangle: false
});

// Setup ESC key listener to close modals
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        closeDetailModal();
        closeInteractionModeModal();
        closeKeyboardShortcutsModal();
    }
    // Show keyboard shortcuts on '?' key
    if (e.key === '?' && !isInputFocused()) {
        e.preventDefault();
        openKeyboardShortcutsModal();
    }
});

// Helper to check if an input element is focused
function isInputFocused() {
    const activeElement = document.activeElement;
    return activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.isContentEditable
    );
}

/**
 * Open add team modal (currently disabled)
 */
export function openAddTeamModal() {
    // Modal functionality disabled - teams managed via files
    const modal = document.getElementById('teamModal');
    if (modal) modal.style.display = 'block';
}

/**
 * Close team edit/add modal
 */
export function closeModal() {
    const modal = document.getElementById('teamModal');
    if (modal) modal.style.display = 'none';
}

/**
 * Close team detail modal
 */
export function closeDetailModal() {
    const modal = document.getElementById('detailModal');
    if (modal) {
        // Close any open <details> elements (e.g., flow metrics)
        modal.querySelectorAll('details[open]').forEach(details => {
            details.removeAttribute('open');
        });
        modal.style.display = 'none';
    }
}

/**
 * Close interaction mode/educational modal
 */
export function closeInteractionModeModal() {
    const modal = document.getElementById('interactionModeModal');
    if (modal) modal.style.display = 'none';
}

/**
 * Show educational modal for Team Topologies concepts
 * @param {string} type - 'interaction-mode', 'team-type', or 'grouping'
 * @param {string} id - Specific ID (e.g., 'collaboration', 'stream-aligned')
 */
export function showInfoModal(type, id) {
    const modal = document.getElementById('interactionModeModal');
    const content = document.getElementById('interactionModeContent');

    if (!modal || !content) return;

    let info = null;

    if (type === 'interaction-mode') {
        const interactionModes = {
            'collaboration': {
                title: 'Collaboration',
                symbol: '<svg width="200" height="100" viewBox="0 0 200 100"><defs><pattern id="crossHatchModal" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M0 12 L12 0" stroke="#7a5fa6" stroke-width="1"></path><path d="M0 0 L12 12" stroke="#7a5fa6" stroke-width="1"></path></pattern></defs><rect x="10" y="20" width="180" height="60" rx="8" ry="8" fill="#b7a6d9" stroke="#7a5fa6" stroke-width="2"></rect><rect x="10" y="20" width="180" height="60" rx="8" ry="8" fill="url(#crossHatchModal)"></rect></svg>',
                line: '<svg width="200" height="20" viewBox="0 0 200 20"><line x1="10" y1="10" x2="190" y2="10" stroke="#7a5fa6" stroke-width="4"/><polygon points="190,10 180,5 180,15" fill="#7a5fa6"/></svg>',
                description: '<strong>Close, temporary joint effort</strong> between two teams to solve a specific problem or deliver a feature.',
                characteristics: ['Teams work together closely for a limited time', 'Shared responsibility and high cognitive load', 'Used for discovery, rapid learning, or tackling novel problems', 'Should be time-boxed (typically 3-6 months)', 'Often transitions to X-as-a-Service or dissolves'],
                whenToUse: 'When teams need to work intensively together to solve complex problems, share knowledge rapidly, or explore new technical domains.'
            },
            'x-as-a-service': {
                title: 'X-as-a-Service',
                symbol: '<svg width="200" height="100" viewBox="0 0 200 100"><path d="M80 30 C60 30, 60 30, 60 50 C60 70, 60 70, 80 70" fill="none" stroke="#222222" stroke-width="6" stroke-linecap="round"></path><path d="M120 30 C140 30, 140 30, 140 50 C140 70, 140 70, 120 70" fill="none" stroke="#222222" stroke-width="6" stroke-linecap="round"></path></svg>',
                line: '<svg width="200" height="20" viewBox="0 0 200 20"><line x1="10" y1="10" x2="190" y2="10" stroke="#222222" stroke-width="4" stroke-dasharray="10,5"/><polygon points="190,10 180,5 180,15" fill="#222222"/></svg>',
                description: '<strong>One team provides a service</strong> to other teams through a well-defined interface (API, platform capability, etc.).',
                characteristics: ['Clear service boundary with minimal interaction', 'Consumer team uses the service without deep collaboration', 'Provider team owns the service end-to-end', 'Low cognitive load for consumer teams', 'Stable, predictable interaction pattern'],
                whenToUse: 'When a capability is mature, well-defined, and can be consumed through clear interfaces. Typical for platform teams serving stream-aligned teams.'
            },
            'facilitating': {
                title: 'Facilitating',
                symbol: '<svg width="120" height="120" viewBox="0 0 120 120"><defs><pattern id="dotPatternModal" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="#6fa98c"></circle></pattern></defs><circle cx="60" cy="60" r="45" fill="#9fd0b5" stroke="#6fa98c" stroke-width="2"></circle><circle cx="60" cy="60" r="45" fill="url(#dotPatternModal)"></circle></svg>',
                line: '<svg width="200" height="20" viewBox="0 0 200 20"><line x1="10" y1="10" x2="190" y2="10" stroke="#6fa98c" stroke-width="3" stroke-dasharray="5,5"/><polygon points="190,10 182,5 182,15" fill="#6fa98c"/></svg>',
                description: '<strong>Enabling team helps another team</strong> by providing coaching, guidance, or removing obstacles.',
                characteristics: ['Advisory and coaching relationship', 'Enabling team does not take ownership of the work', 'Focused on upskilling and capability building', 'Light overlap - support without dependency', 'Temporary engagement to build team capabilities'],
                whenToUse: 'When teams need to adopt new technologies, practices, or overcome technical obstacles. Enabling teams help stream-aligned teams become more effective.'
            }
        };
        info = interactionModes[id];
    } else if (type === 'team-type') {
        const teamTypes = {
            'stream-aligned': {
                title: 'Stream-Aligned Team',
                color: '#F9E2A0',
                description: '<strong>Aligned to a single, valuable stream of work</strong> — typically a user journey, product line, or feature set that delivers value directly to customers.',
                characteristics: ['Primary team type that delivers value end-to-end', 'Owns the full lifecycle of their flow', 'Minimal hand-offs to other teams', 'Autonomous and empowered to deliver quickly', 'Half-height horizontal box (book-accurate — emphasizes flow)'],
                whenToUse: 'The default team type for most product delivery. Every organization should have multiple stream-aligned teams focused on different value streams.',
                examples: ['E-commerce Checkout Team', 'Mobile App Experience Team', 'Customer Onboarding Team']
            },
            'platform': {
                title: 'Platform Team',
                color: '#9ED3E6',
                description: '<strong>Provides internal services to reduce cognitive load</strong> of stream-aligned teams — APIs, infrastructure, deployment pipelines, and other capabilities.',
                characteristics: ['Makes stream-aligned teams more effective and autonomous', 'Treats other teams as customers', 'Provides X-as-a-Service to consumer teams', 'Focus on Thinnest Viable Platform (TVP)', 'Full-height horizontal box (book-accurate — emphasizes foundation)'],
                whenToUse: 'When capabilities are needed by multiple stream-aligned teams and benefit from centralization (e.g., CI/CD, observability, data platform).',
                examples: ['API Gateway Platform Team', 'Observability Platform Team', 'Data Engineering Platform Team']
            },
            'enabling': {
                title: 'Enabling Team',
                color: '#C5B3E6',
                description: '<strong>Helps stream-aligned teams overcome obstacles</strong> and adopt new technologies, practices, or approaches through coaching and facilitation.',
                characteristics: ['Focuses on upskilling other teams', 'Does not take ownership of work', 'Temporary engagements (typically weeks or months)', 'Spreads knowledge and best practices', 'Vertical box (book-accurate — emphasizes support alongside)'],
                whenToUse: 'When teams need to adopt new technologies, practices, or overcome skill gaps. Enabling teams build capability, then move on.',
                examples: ['DevOps Enablement Team', 'Security Engineering Enablement Team', 'Cloud Migration Enablement Team']
            },
            'complicated-subsystem': {
                title: 'Complicated Subsystem Team',
                color: '#F4B183',
                description: '<strong>Handles complex technical domains</strong> requiring specialist knowledge — ML algorithms, video codecs, mathematical models, or other high-complexity systems.',
                characteristics: ['Deep expertise in a specialized area', 'Reduces cognitive load on stream-aligned teams', 'Provides services to other teams via clean interfaces', 'Small team with specialized skills', 'Octagon shape (book-accurate — emphasizes internal complexity)'],
                whenToUse: 'Only when the subsystem complexity is too high for stream-aligned teams to own. Use sparingly — most complexity should be hidden in platforms.',
                examples: ['ML Recommendations Team', 'Fraud Detection & Risk Modeling Team', 'Video Encoding Optimization Team']
            }
        };
        info = teamTypes[id];
        if (info) {
            // Team types now use book-accurate SVG shapes
            const shapes = {
                'stream-aligned': '<svg width="220" height="70" viewBox="0 0 220 70"><rect x="10" y="20" width="200" height="30" rx="12" ry="12" fill="#F9E2A0" stroke="#E3B23C" stroke-width="2"></rect></svg>',
                'platform': '<svg width="220" height="100" viewBox="0 0 220 100"><rect x="10" y="20" width="200" height="60" rx="14" ry="14" fill="#9fd3e8" stroke="#4fa3c7" stroke-width="2"></rect></svg>',
                'enabling': '<svg width="140" height="180" viewBox="0 0 140 180"><rect x="30" y="30" width="80" height="120" rx="14" ry="14" fill="#b7a6d9" stroke="#7a5fa6" stroke-width="2"></rect></svg>',
                'complicated-subsystem': '<svg width="140" height="140" viewBox="0 0 140 140"><path d="M40 20 H100 L120 40 V100 L100 120 H40 L20 100 V40 Z" fill="#f4b183" stroke="#c97a2b" stroke-width="2"></path></svg>'
            };
            info.shape = shapes[id];
        }
    } else if (type === 'grouping') {
        const groupings = {
            'value-stream': {
                title: 'Value Stream Grouping',
                symbol: '<div style="width: 200px; height: 100px; border: 2px solid rgba(255, 200, 130, 0.8); background: rgba(255, 245, 215, 0.5); border-radius: 10px;"></div>',
                description: '<strong>Groups stream-aligned teams</strong> serving the same customer journey or value flow.',
                characteristics: ['End-to-end customer experience focus', 'Minimizes dependencies across value streams', 'Clear ownership of customer outcomes', 'Flow metrics tracked per value stream', 'Visual grouping shows organizational flow'],
                whenToUse: 'To visualize how teams are organized around customer value flows. Helps identify dependencies and optimize for fast flow.',
                examples: ['E-commerce value stream (Product Discovery → Cart → Checkout → Fulfillment)', 'Mobile App value stream', 'Enterprise Sales Portal value stream']
            },
            'platform-grouping': {
                title: 'Platform Grouping (Team-of-Teams)',
                symbol: '<div style="width: 200px; height: 100px; border: 2px solid rgba(74, 159, 216, 0.8); background: rgba(126, 200, 227, 0.2); border-radius: 10px;"></div>',
                description: '<strong>Team-of-teams pattern</strong> — multiple platform teams providing related capabilities as a cohesive platform offering.',
                characteristics: ['Fractal pattern from Team Topologies 2nd edition', 'Coordinates multiple platform capabilities', 'Reduces cognitive load through clear boundaries', 'Each sub-team owns specific capabilities', 'Provides unified service to stream-aligned teams'],
                whenToUse: 'When a platform grows beyond what one team can handle. Instead of one large team, create a grouping of smaller specialized platform teams.',
                examples: ['Data Platform Grouping (Ingestion + Processing + Analytics)', 'Developer Experience Grouping (CI/CD + Observability + Testing)', 'ML Platform Grouping (Training + Serving + Feature Store)']
            }
        };
        info = groupings[id];
    }

    if (!info) return;

    // Build modal content based on type
    let visualSection = '';
    if (type === 'interaction-mode') {
        visualSection = `
            <div style="display: flex; justify-content: center; align-items: center; gap: 2rem; margin-bottom: 1rem;">
                <div>
                    <p style="font-size: 0.85rem; color: #666; margin-bottom: 0.5rem;">Symbol</p>
                    ${info.symbol}
                </div>
                <div>
                    <p style="font-size: 0.85rem; color: #666; margin-bottom: 0.5rem;">Connection Line</p>
                    ${info.line}
                </div>
            </div>
        `;
    } else if (type === 'team-type') {
        visualSection = `
            <div style="display: flex; justify-content: center; margin-bottom: 1rem;">
                ${info.shape}
            </div>
        `;
    } else if (type === 'grouping') {
        visualSection = `
            <div style="display: flex; justify-content: center; margin-bottom: 1rem;">
                ${info.symbol}
            </div>
        `;
    }

    content.innerHTML = `
        <div style="text-align: center; margin-bottom: 1.5rem;">
            <h2 style="margin-bottom: 1rem; color: #333;">${info.title}</h2>
            ${visualSection}
        </div>
        
        <div style="text-align: left;">
            <p style="font-size: 1rem; line-height: 1.6; margin-bottom: 1rem;">${info.description}</p>
            
            <h3 style="font-size: 0.95rem; margin-top: 1.5rem; margin-bottom: 0.75rem; color: #555;">Key Characteristics:</h3>
            <ul style="margin-left: 1.5rem; line-height: 1.8;">
                ${info.characteristics.map(c => `<li>${c}</li>`).join('')}
            </ul>
            
            <h3 style="font-size: 0.95rem; margin-top: 1.5rem; margin-bottom: 0.75rem; color: #555;">When to Use:</h3>
            <p style="line-height: 1.6;">${info.whenToUse}</p>
            
            ${info.examples ? `
                <h3 style="font-size: 0.95rem; margin-top: 1.5rem; margin-bottom: 0.75rem; color: #555;">Examples:</h3>
                <ul style="margin-left: 1.5rem; line-height: 1.8;">
                    ${info.examples.map(ex => `<li>${ex}</li>`).join('')}
                </ul>
            ` : ''}
        </div>
    `;

    modal.style.display = 'block';
}

/**
 * Show comprehensive team details in modal
 * @param {Object} team - Team object to show details for
 * @param {string} currentView - Current view ('current' or 'tt-design')
 * @param {Array} allTeams - All teams (for platform consumer calculation)
 */
export async function showTeamDetails(team, currentView, allTeams = []) {
    try {
        console.log('showTeamDetails called with currentView:', currentView);
        // Use team_id for API lookup (stable across name changes)
        const teamData = await loadTeamDetails(team.team_id, currentView);

        // Set team name and type
        const detailTeamName = document.getElementById('detailTeamName');
        if (detailTeamName) detailTeamName.textContent = teamData.name;

        const typeBadge = document.getElementById('detailTeamType');
        if (typeBadge) {
            typeBadge.textContent = teamData.team_type.replace('-', ' ');
            typeBadge.className = `team-badge ${teamData.team_type}`;
        }

        // Show established date if available
        const established = teamData.metadata?.established;
        if (established) {
            // Remove existing established section if any
            const existingEstablished = document.getElementById('detailEstablishedSection');
            if (existingEstablished) existingEstablished.remove();

            const establishedSection = document.createElement('div');
            establishedSection.id = 'detailEstablishedSection';
            establishedSection.style.cssText = 'margin: 15px 0; padding: 10px; background: #f0f7ff; border-left: 3px solid #4a9fd8; border-radius: 4px;';

            const age = calculateTeamAge(established);
            const isNew = age.totalMonths < 3;
            const badgeEmoji = isNew ? '🆕 ' : '📅 ';
            const ageText = formatTeamAge(age);

            establishedSection.innerHTML = `
                <div style="font-size: 13px; color: #555;">
                    <strong>${badgeEmoji}Established:</strong> ${formatEstablishedDate(established)} ${ageText}
                </div>
            `;

            // Insert after detail-header div (contains team name and type badge)
            const detailHeader = document.querySelector('#teamDetails .detail-header');
            if (detailHeader && detailHeader.nextSibling) {
                detailHeader.parentNode.insertBefore(establishedSection, detailHeader.nextSibling);
            }
        } else {
            // Remove established section if no date
            const existingEstablished = document.getElementById('detailEstablishedSection');
            if (existingEstablished) existingEstablished.remove();
        }

        // Always remove existing flow metrics section first (cleanup from previous team)
        const existingFlowMetrics = document.getElementById('detailFlowMetricsSection');
        if (existingFlowMetrics) existingFlowMetrics.remove();

        // Flow metrics section - INSERT EARLY (outcomes are most important)
        if (teamData.flow_metrics) {

            const flowMetricsSection = document.createElement('div');
            flowMetricsSection.id = 'detailFlowMetricsSection';
            flowMetricsSection.style.cssText = 'background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 15px -20px 20px -20px; border-left: 4px solid #0ea5e9; width: calc(100% + 40px);';

            const metrics = teamData.flow_metrics;

            // Build summary one-liner
            const summaryParts = [];
            if (metrics.lead_time_days !== undefined && metrics.lead_time_days !== null) {
                const icon = metrics.lead_time_days <= 14 ? '🟢' : metrics.lead_time_days <= 30 ? '🟡' : '🔴';
                summaryParts.push(`${icon} ${metrics.lead_time_days}d lead time`);
            }
            if (metrics.deployment_frequency) {
                const freq = metrics.deployment_frequency.toLowerCase();
                summaryParts.push(`${freq} deploys`);
            }
            if (metrics.change_fail_rate !== undefined && metrics.change_fail_rate !== null) {
                const percentage = (metrics.change_fail_rate * 100).toFixed(1);
                summaryParts.push(`${percentage}% fail rate`);
            }
            if (metrics.mttr_hours !== undefined && metrics.mttr_hours !== null) {
                summaryParts.push(`${metrics.mttr_hours}h MTTR`);
            }
            const summaryText = summaryParts.join(' • ');

            // Build detailed view
            let detailsHtml = '';

            // Lead time
            if (metrics.lead_time_days !== undefined && metrics.lead_time_days !== null) {
                const leadTimeWarning = metrics.lead_time_days > 30 ?
                    ' <span style="color: #ff6b6b;">⚠️ Slow delivery - aim for &lt;14 days</span>' :
                    metrics.lead_time_days <= 14 ? ' <span style="color: #51cf66;">✅</span>' : '';
                detailsHtml += `<div style="margin: 8px 0;"><strong>Lead Time:</strong> ${metrics.lead_time_days} days${leadTimeWarning}</div>`;
            }

            // Deployment frequency
            if (metrics.deployment_frequency) {
                const freq = metrics.deployment_frequency.toLowerCase();
                const freqWarning = (freq === 'monthly' || freq === 'quarterly') ?
                    ' <span style="color: #ff6b6b;">⚠️ Infrequent deployments - aim for daily</span>' :
                    freq === 'daily' ? ' <span style="color: #51cf66;">✅</span>' : '';
                const freqDisplay = freq.charAt(0).toUpperCase() + freq.slice(1);
                detailsHtml += `<div style="margin: 8px 0;"><strong>Deployment Frequency:</strong> ${freqDisplay}${freqWarning}</div>`;
            }

            // Change fail rate
            if (metrics.change_fail_rate !== undefined && metrics.change_fail_rate !== null) {
                const percentage = (metrics.change_fail_rate * 100).toFixed(1);
                const failWarning = metrics.change_fail_rate > 0.15 ?
                    ' <span style="color: #ff6b6b;">⚠️ High risk - aim for &lt;15%</span>' :
                    ' <span style="color: #51cf66;">✅</span>';
                detailsHtml += `<div style="margin: 8px 0;"><strong>Change Fail Rate:</strong> ${percentage}%${failWarning}</div>`;
            }

            // MTTR
            if (metrics.mttr_hours !== undefined && metrics.mttr_hours !== null) {
                const mttrWarning = metrics.mttr_hours > 4 ?
                    ' <span style="color: #ff6b6b;">⚠️ Slow recovery - aim for &lt;2 hours</span>' :
                    metrics.mttr_hours <= 2 ? ' <span style="color: #51cf66;">✅</span>' : '';
                detailsHtml += `<div style="margin: 8px 0;"><strong>MTTR:</strong> ${metrics.mttr_hours} hours${mttrWarning}</div>`;
            }

            // Collapsible flow metrics with one-liner summary
            flowMetricsSection.innerHTML = `
                <h3>📊 Flow Metrics</h3>
                <div style="display: flex; align-items: center; justify-content: space-between; margin: 10px 0;">
                    <div style="font-size: 14px; color: #333; font-weight: 500;">
                        ${summaryText}
                    </div>
                    <details style="margin: 0; position: relative;">
                        <summary style="cursor: pointer; font-weight: bold; padding: 6px 12px; background: rgba(14, 165, 233, 0.1); border-radius: 4px; font-size: 13px; list-style: none;">
                            View details
                        </summary>
                        <div style="position: absolute; top: calc(100% + 8px); right: 0; background: white; border: 2px solid #0ea5e9; border-radius: 12px; padding: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); z-index: 10000; min-width: 450px; max-width: 600px;">
                            <div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #f0f9ff;">
                                <h4 style="margin: 0; color: #0ea5e9;">📊 Detailed Flow Metrics</h4>
                            </div>
                            ${detailsHtml}
                        </div>
                    </details>
                </div>
            `;

            // Insert before description section
            const detailDescription = document.getElementById('detailDescription');
            if (detailDescription && detailDescription.parentNode) {
                detailDescription.parentNode.insertBefore(flowMetricsSection, detailDescription);
            }
        }

        // Render description as HTML with Team API formatting
        const detailDescription = document.getElementById('detailDescription');
        if (detailDescription) {
            const description = teamData.description || 'No description available.';

            // Use marked.js to parse markdown
            const renderedHtml = marked.parse(description);

            // Apply Team API specific styling
            detailDescription.innerHTML = `<div class="team-api-content">${renderedHtml}</div>`;

            // Add team-api-table class to tables for styling
            detailDescription.querySelectorAll('table').forEach(table => {
                table.classList.add('team-api-table');
            });

            // Only process text nodes for Slack channels (don't touch already-converted HTML)
            detailDescription.querySelectorAll('li, p').forEach(el => {
                // Process text content only, avoiding existing links
                const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
                const textNodes = [];
                let node;
                while ((node = walker.nextNode())) {
                    textNodes.push(node);
                }

                textNodes.forEach(textNode => {
                    const text = textNode.textContent;
                    // Only convert Slack channels that aren't already in links
                    if (text.includes('#') && !textNode.parentElement?.tagName?.match(/^(A|CODE|PRE)$/)) {
                        const span = document.createElement('span');
                        span.innerHTML = text.replace(/#([a-z0-9-]+)/g,
                            '<a href="slack://channel?team=YOUR_TEAM&id=$1" class="slack-link">#$1</a>');
                        textNode.replaceWith(...span.childNodes);
                    }
                });
            });
        }

        // Dependencies
        const depList = document.getElementById('detailDependencies');
        if (depList) {
            if (teamData.dependencies && teamData.dependencies.length > 0) {
                depList.innerHTML = teamData.dependencies.map((dep) => `<li>${dep}</li>`).join('');
            } else {
                depList.innerHTML = '<li style="color: #999; font-style: italic;">No dependencies</li>';
            }
        }

        // Interaction modes
        const intList = document.getElementById('detailInteractions');
        if (intList) {
            if (teamData.interaction_modes && Object.keys(teamData.interaction_modes).length > 0) {
                intList.innerHTML = Object.entries(teamData.interaction_modes)
                    .map(([team, mode]) => `<li>${team}<span class="interaction-mode">${mode}</span></li>`)
                    .join('');
            } else {
                intList.innerHTML = '<li style="color: #999; font-style: italic;">No interactions defined</li>';
            }

            // Line manager (for current org view)
            if (currentView === 'current' && teamData.line_manager) {
                const managerItem = document.createElement('li');
                managerItem.innerHTML = `<strong>Reports to:</strong> ${teamData.line_manager}`;
                managerItem.style.background = '#e3f2fd';
                intList.insertBefore(managerItem, intList.firstChild);
            }
        }

        // Metadata
        const metadataSection = document.getElementById('detailMetadataSection');
        const metadataDiv = document.getElementById('detailMetadata');
        if (metadataSection && metadataDiv) {
            if (teamData.metadata && Object.keys(teamData.metadata).length > 0) {
                // Separate cognitive load fields from other metadata
                const cognitiveLoadFields = ['cognitive_load', 'cognitive_load_domain', 'cognitive_load_intrinsic', 'cognitive_load_extraneous'];
                const flowMetricsFields = ['flow_metrics'];
                const otherMetadata = Object.entries(teamData.metadata)
                    .filter(([key]) => !cognitiveLoadFields.includes(key) && !flowMetricsFields.includes(key));

                // Check if we have cognitive load data
                const cognitiveLoad = teamData.metadata.cognitive_load;

                // Insert cognitive load section if it exists
                if (cognitiveLoad) {
                    // Remove existing cognitive load section if any
                    const existingCogLoad = document.getElementById('detailCognitiveLoadSection');
                    if (existingCogLoad) existingCogLoad.remove();

                    // Create cognitive load section
                    const cogLoadSection = document.createElement('div');
                    cogLoadSection.id = 'detailCognitiveLoadSection';
                    cogLoadSection.className = 'detail-section';
                    cogLoadSection.style.background = '#f8f9fa';
                    cogLoadSection.style.padding = '15px';
                    cogLoadSection.style.borderRadius = '8px';
                    cogLoadSection.style.marginBottom = '20px';

                    // Format cognitive load level
                    const loadLevel = cognitiveLoad.toString()
                        .split('-')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join('-');

                    // Get traffic light indicator
                    const indicator = getCognitiveLoadIndicator(cognitiveLoad);
                    const emoji = indicator ? indicator.emoji : '';

                    cogLoadSection.innerHTML = `
                        <h3>Cognitive Load ${emoji}</h3>
                        <div style="font-size: 18px; font-weight: bold; color: #333; margin: 10px 0;">
                            ${loadLevel}
                        </div>
                    `;

                    // Add breakdown if available
                    const domain = teamData.metadata.cognitive_load_domain;
                    const intrinsic = teamData.metadata.cognitive_load_intrinsic;
                    const extraneous = teamData.metadata.cognitive_load_extraneous;

                    if (domain || intrinsic || extraneous) {
                        const breakdownHtml = `
                            <div style="margin-top: 15px; font-size: 14px;">
                                <div style="margin-bottom: 8px;"><strong>Breakdown:</strong></div>
                                ${domain ? `<div style="margin-left: 10px;">• Domain complexity: <strong>${domain}</strong></div>` : ''}
                                ${intrinsic ? `<div style="margin-left: 10px;">• Intrinsic complexity: <strong>${intrinsic}</strong></div>` : ''}
                                ${extraneous ? `<div style="margin-left: 10px;">• Extraneous load: <strong>${extraneous}</strong></div>` : ''}
                            </div>
                        `;
                        cogLoadSection.innerHTML += breakdownHtml;
                    }

                    // Insert before metadata section
                    metadataSection.parentNode.insertBefore(cogLoadSection, metadataSection);
                }

                // Platform Consumer Dashboard (TT Design view only)
                if (currentView === 'tt' && allTeams.length > 0) {
                    const platformMetrics = calculatePlatformConsumers(teamData.name, allTeams);

                    if (platformMetrics.totalCount > 0) {
                        // Remove existing platform section if any
                        const existingPlatform = document.getElementById('detailPlatformSection');
                        if (existingPlatform) existingPlatform.remove();

                        // Create platform consumer section
                        const platformSection = document.createElement('div');
                        platformSection.id = 'detailPlatformSection';
                        platformSection.className = 'detail-section';
                        platformSection.style.cssText = 'background: #f0f7ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #4a9fd8;';

                        const overloadWarning = platformMetrics.isOverloaded ?
                            '<div style="background: #fff3cd; border: 1px solid #ff9800; padding: 10px; border-radius: 4px; margin: 10px 0;"><strong>⚠️ Platform Overload Warning</strong><br>This platform is serving many teams. Consider splitting into multiple platforms or adding capacity.</div>' :
                            '';

                        // Create value stream breakdown
                        const vsBreakdown = Object.entries(platformMetrics.byValueStream)
                            .sort((a, b) => b[1] - a[1])
                            .map(([vs, count]) => {
                                const barWidth = Math.min((count / platformMetrics.totalCount) * 100, 100);
                                return `
                                    <div style="margin: 8px 0;">
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                            <span style="font-size: 13px;">${vs}</span>
                                            <span style="font-weight: bold; font-size: 13px;">${count} team${count !== 1 ? 's' : ''}</span>
                                        </div>
                                        <div style="background: #e0e0e0; height: 8px; border-radius: 4px; overflow: hidden;">
                                            <div style="background: #4a9fd8; height: 100%; width: ${barWidth}%;"></div>
                                        </div>
                                    </div>
                                `;
                            }).join('');

                        // Create consumer list
                        const consumerList = platformMetrics.consumers
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map(consumer => `
                                <li style="margin: 6px 0; font-size: 13px;">
                                    <span>${consumer.name}</span>
                                    <span style="color: #666; font-size: 11px; margin-left: 8px;">(${consumer.mode})</span>
                                </li>
                            `).join('');

                        platformSection.innerHTML = `
                            <h3>Platform Consumers</h3>
                            <div style="font-size: 20px; font-weight: bold; color: #1976d2; margin: 10px 0;">
                                ${platformMetrics.totalCount} team${platformMetrics.totalCount !== 1 ? 's' : ''}
                            </div>
                            ${overloadWarning}
                            ${vsBreakdown ? `
                                <div style="margin: 15px 0;">
                                    <div style="font-weight: bold; margin-bottom: 10px; font-size: 14px;">By Value Stream:</div>
                                    ${vsBreakdown}
                                </div>
                            ` : ''}
                            <details style="margin-top: 15px;">
                                <summary style="cursor: pointer; font-weight: bold; padding: 8px; background: rgba(74, 159, 216, 0.1); border-radius: 4px; font-size: 14px;">
                                    View all consuming teams
                                </summary>
                                <ul style="margin: 10px 0; padding-left: 20px; max-height: 200px; overflow-y: auto;">
                                    ${consumerList}
                                </ul>
                            </details>
                        `;

                        // Insert before metadata section
                        metadataSection.parentNode.insertBefore(platformSection, metadataSection);
                    }
                }

                // Show remaining metadata (excluding cognitive load fields)
                if (otherMetadata.length > 0) {
                    metadataDiv.innerHTML = otherMetadata
                        .map(([key, value]) => `
                            <div class="metadata-item">
                                <div class="label">${key}</div>
                                <div class="value">${value}</div>
                            </div>
                        `).join('');
                    metadataSection.style.display = 'block';
                } else {
                    metadataSection.style.display = 'none';
                }
            } else {
                metadataSection.style.display = 'none';
            }
        }

        // Show modal
        const detailModal = document.getElementById('detailModal');
        if (detailModal) detailModal.style.display = 'block';
    } catch (error) {
        console.error('Failed to load team details:', error);
        showError('Failed to load team details');
    }
}

/**
 * Handle team form submit (currently disabled)
 */
export async function handleTeamSubmit(e) {
    e.preventDefault();
    alert('Create team functionality is disabled. Please edit files manually.');
}

/**
 * Show validation report modal
 */
export async function showValidationReport(view) {
    const modal = document.getElementById('validationModal');
    const reportDiv = document.getElementById('validationReport');

    if (!modal || !reportDiv) return;

    // Show loading state
    reportDiv.innerHTML = '<div class="loading">Running validation...</div>';
    modal.style.display = 'block';

    try {
        const prefix = view === 'current' ? '/baseline' : '/tt';
        const response = await fetch(`/api${prefix}/validate`);
        const data = await response.json();

        // Handle new response structure (teams + config_files + team_schema)
        const report = data.teams || data; // Fallback for TT view
        const configReport = data.config_files;
        const teamSchema = data.team_schema;

        // Build report HTML
        let html = '<div class="validation-summary">';
        html += '<h3>Team Files Summary</h3>';
        html += '<div class="summary-grid">';
        html += `<div class="summary-item"><strong>Total Files:</strong> ${report.total_files}</div>`;
        html += `<div class="summary-item valid"><strong>✓ Valid:</strong> ${report.valid_files}</div>`;
        html += `<div class="summary-item warning"><strong>⚠ Warnings:</strong> ${report.files_with_warnings}</div>`;
        html += `<div class="summary-item error"><strong>✗ Errors:</strong> ${report.files_with_errors}</div>`;
        html += '</div>';

        // Add team schema viewer link if available
        if (teamSchema) {
            html += '<div style="margin-top: 15px; font-size: 1.1em; font-weight: 600;">';
            html += `<a href="#" onclick="showValidationSchemas('${teamSchema}'); return false;" style="color: #4CAF50; text-decoration: none;">📋 View team file field requirements</a>`;
            html += '</div>';
        }
        html += '</div>';

        // Add config validation summary if available
        if (configReport) {
            const configErrors = configReport.total_errors || 0;
            const configFilesCount = Object.keys(configReport.config_files || {}).length;
            const validConfigFiles = Object.values(configReport.config_files || {}).filter(f => f.valid).length;

            html += '<div class="validation-summary">';
            html += '<h3>Configuration Files Summary</h3>';
            html += '<div class="summary-grid">';
            html += `<div class="summary-item"><strong>Total Files:</strong> ${configFilesCount}</div>`;
            html += `<div class="summary-item valid"><strong>✓ Valid:</strong> ${validConfigFiles}</div>`;
            html += `<div class="summary-item error"><strong>✗ Errors:</strong> ${configErrors}</div>`;
            html += '</div>';
            html += '<div style="margin-top: 15px; font-size: 1.1em; font-weight: 600;">';
            html += '<a href="#" onclick="showValidationSchemas(); return false;" style="color: #4CAF50; text-decoration: none;">📋 View field requirements and constraints</a>';
            html += '</div></div>';
        }

        if (report.issues.length === 0 && (!configReport || configReport.total_errors === 0)) {
            html += '<div class="validation-success">🎉 All files are valid! No issues found.</div>';
        } else {
            // Show config file issues first
            if (configReport && configReport.total_errors > 0) {
                html += '<h3>Configuration File Issues</h3>';
                html += '<div class="validation-issues">';

                for (const [filename, fileResult] of Object.entries(configReport.config_files)) {
                    if (!fileResult.valid) {
                        html += '<div class="file-issue">';
                        html += `<h4 class="file-path">${filename}</h4>`;
                        html += '<div class="issues-section errors">';
                        html += '<ul>';
                        fileResult.errors.forEach(error => {
                            html += `<li class="error-item">✗ ${error}</li>`;
                        });
                        html += '</ul></div></div>';
                    }
                }
                html += '</div>';
            }

            // Show team file issues
            if (report.issues.length > 0) {
                html += '<h3>Team File Issues</h3>';
                html += '<div class="validation-issues">';

                report.issues.forEach(file => {
                    html += '<div class="file-issue">';
                    html += `<h4 class="file-path">${file.file}</h4>`;

                    if (file.errors.length > 0) {
                        html += '<div class="issues-section errors">';
                        html += '<strong>Errors:</strong>';
                        html += '<ul>';
                        file.errors.forEach(error => {
                            html += `<li class="error-item">✗ ${error}</li>`;
                        });
                        html += '</ul></div>';
                    }

                    if (file.warnings.length > 0) {
                        html += '<div class="issues-section warnings">';
                        html += '<strong>Warnings:</strong>';
                        html += '<ul>';
                        file.warnings.forEach(warning => {
                            html += `<li class="warning-item">⚠ ${warning}</li>`;
                        });
                        html += '</ul></div>';
                    }

                    html += '</div>';
                });

                html += '</div>';
            }
        }

        reportDiv.innerHTML = html;

    } catch (error) {
        reportDiv.innerHTML = `<div class="validation-error">Error running validation: ${error.message}</div>`;
    }
}

/**
 * Close validation modal
 */
export function closeValidationModal() {
    const modal = document.getElementById('validationModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Setup validation modal close handlers
const validationModalClose = document.getElementById('validationModalClose');
if (validationModalClose) {
    validationModalClose.addEventListener('click', closeValidationModal);
}

/**
 * Open keyboard shortcuts modal
 */
export function openKeyboardShortcutsModal() {
    const modal = document.getElementById('keyboardShortcutsModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

/**
 * Close keyboard shortcuts modal
 */
export function closeKeyboardShortcutsModal() {
    const modal = document.getElementById('keyboardShortcutsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Setup keyboard shortcuts modal close handlers
const keyboardShortcutsModalClose = document.getElementById('keyboardShortcutsModalClose');
if (keyboardShortcutsModalClose) {
    keyboardShortcutsModalClose.addEventListener('click', closeKeyboardShortcutsModal);
}

const keyboardShortcutsBtn = document.getElementById('keyboardShortcutsBtn');
if (keyboardShortcutsBtn) {
    keyboardShortcutsBtn.addEventListener('click', openKeyboardShortcutsModal);
}

window.addEventListener('click', (event) => {
    const validationModal = document.getElementById('validationModal');
    if (event.target === validationModal) {
        closeValidationModal();
    }
});

// Update ESC key handler to include validation modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeValidationModal();
        closeSchemaModal();
    }
});

/**
 * Show validation schemas modal with field requirements
 */
async function showValidationSchemas(specificSchemaName = null) {
    const modal = document.getElementById('schemaModal');
    const content = document.getElementById('schemaContent');

    if (!modal || !content) {
        // Create modal if it doesn't exist
        const modalHTML = `
            <div id="schemaModal" class="modal">
                <div class="modal-content large">
                    <span class="close" onclick="closeSchemaModal()">&times;</span>
                    <h2 id="schemaModalTitle">Configuration File Requirements</h2>
                    <div id="schemaContent" class="schema-content"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    const schemaModal = document.getElementById('schemaModal');
    const schemaContent = document.getElementById('schemaContent');
    const schemaTitle = document.getElementById('schemaModalTitle');

    schemaContent.innerHTML = '<div class="loading">Loading schemas...</div>';
    schemaModal.style.display = 'block';

    try {
        const response = await fetch('/api/schemas');
        const schemas = await response.json();

        let html = '<div class="schemas-list">';

        // If specific schema requested, show only that one
        // Otherwise, filter out team-file schemas (those should only be shown via team file link)
        let schemasToShow;
        if (specificSchemaName) {
            schemasToShow = { [specificSchemaName]: schemas[specificSchemaName] };
        } else {
            // Filter out team-file schemas when showing config file requirements
            schemasToShow = Object.fromEntries(
                Object.entries(schemas).filter(([name, _data]) => !name.includes('team-file'))
            );
        }

        // Update modal title based on context
        if (specificSchemaName) {
            if (specificSchemaName.includes('team-file')) {
                schemaTitle.textContent = 'Team File Field Requirements';
            } else {
                schemaTitle.textContent = 'Configuration File Requirements';
            }
        } else {
            schemaTitle.textContent = 'Configuration File Requirements';
            html += '<p style="margin-bottom: 20px; color: #666;">This shows the required and optional fields for each configuration file, along with validation rules.</p>';
        }

        for (const [_schemaName, schemaData] of Object.entries(schemasToShow)) {
            html += '<div class="schema-section">';
            html += `<h3>${schemaData.title}</h3>`;

            // Extract field information from JSON schema
            const schema = schemaData.schema;
            if (schema.properties) {
                html += '<h4>YAML Frontmatter Fields:</h4>';
                html += '<table class="schema-table">';
                html += '<thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>';
                html += '<tbody>';

                const resolveRef = (ref) => {
                    // Resolve $ref like "#/$defs/TeamTypeConfig"
                    const parts = ref.split('/');
                    let current = schema;
                    for (const part of parts) {
                        if (part === '#') continue;
                        current = current[part];
                    }
                    return current;
                };

                const renderFields = (properties, required = [], prefix = '') => {
                    for (const [fieldName, fieldDef] of Object.entries(properties)) {
                        const isRequired = required.includes(fieldName);
                        const fieldPath = prefix ? `${prefix}.${fieldName}` : fieldName;

                        let fieldType = fieldDef.type || 'object';
                        let constraints = [];

                        // Handle array types
                        if (fieldDef.type === 'array' && fieldDef.items) {
                            if (fieldDef.items.$ref) {
                                // Resolve the $ref to get the type name
                                const refParts = fieldDef.items.$ref.split('/');
                                const typeName = refParts[refParts.length - 1];
                                fieldType = `array of ${typeName}`;

                                // Recursively render fields from the referenced type
                                const refDef = resolveRef(fieldDef.items.$ref);
                                if (refDef && refDef.properties) {
                                    renderFields(refDef.properties, refDef.required || [], `${fieldPath}[]`);
                                }
                            } else {
                                fieldType = `array of ${fieldDef.items.type || 'object'}`;
                            }
                            if (fieldDef.minItems) {
                                constraints.push(`min: ${fieldDef.minItems}`);
                            }
                        }

                        // Add constraints
                        if (fieldDef.pattern) {
                            constraints.push(`pattern: ${fieldDef.pattern}`);
                        }
                        if (fieldDef.minLength !== undefined) {
                            constraints.push(`min length: ${fieldDef.minLength}`);
                        }
                        if (fieldDef.maxLength !== undefined) {
                            constraints.push(`max length: ${fieldDef.maxLength}`);
                        }
                        if (fieldDef.minimum !== undefined) {
                            constraints.push(`min: ${fieldDef.minimum}`);
                        }
                        if (fieldDef.maximum !== undefined) {
                            constraints.push(`max: ${fieldDef.maximum}`);
                        }

                        if (constraints.length > 0) {
                            fieldType += ` <span style="color: #666; font-size: 0.9em;">(${constraints.join(', ')})</span>`;
                        }

                        html += '<tr>';
                        html += `<td><code>${fieldPath}</code></td>`;
                        html += `<td>${fieldType}</td>`;
                        html += `<td>${isRequired ? '<span class="required">✓ Required</span>' : '<span class="optional">Optional</span>'}</td>`;
                        html += `<td>${fieldDef.description || ''}</td>`;
                        html += '</tr>';
                    }
                };

                renderFields(schema.properties, schema.required || []);

                html += '</tbody></table>';
            }

            // Show description AFTER fields table and format it nicely
            if (schemaData.description) {
                const description = schemaData.description.trim();

                // Check if this is a team file schema with markdown requirements
                if (description.includes('📝 Markdown Section Requirements')) {
                    html += '<div style="margin-top: 2rem; padding: 1.5rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; color: white;">';
                    html += '<h4 style="margin: 0 0 1rem 0; color: white; font-size: 1.1rem;">📝 Markdown Content Requirements</h4>';

                    // Extract the main instruction and table
                    const lines = description.split('\n');
                    let instructionText = '';
                    let tableMarkdown = '';
                    let inTable = false;
                    let sectionHeader = '';
                    let columnsText = '';
                    let warningText = '';

                    for (const line of lines) {
                        const trimmedLine = line.trim();
                        if (trimmedLine.includes('##')) {
                            // Section header
                            sectionHeader = trimmedLine.replace('##', '').trim();
                        } else if (trimmedLine.startsWith('|')) {
                            // Table line
                            inTable = true;
                            tableMarkdown += trimmedLine + '\n';
                        } else if (inTable && !trimmedLine.startsWith('|')) {
                            // End of table
                            inTable = false;
                            if (trimmedLine.includes('Columns:')) {
                                columnsText = trimmedLine;
                            } else if (trimmedLine.includes('⚠️')) {
                                warningText = trimmedLine;
                            } else if (trimmedLine) {
                                instructionText += trimmedLine + ' ';
                            }
                        } else if (trimmedLine && !trimmedLine.includes('YAML frontmatter') && !trimmedLine.includes('📝')) {
                            instructionText += trimmedLine + ' ';
                        }
                    }

                    // Display instruction text
                    if (instructionText.trim()) {
                        html += `<p style="margin: 0 0 1rem 0; font-size: 0.95rem; line-height: 1.5;">${instructionText.trim()}</p>`;
                    }

                    // Display section header
                    if (sectionHeader) {
                        html += '<div style="background: rgba(255,255,255,0.15); padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1rem;">';
                        html += `<strong style="font-size: 1rem;">Recommended Section: ${sectionHeader}</strong>`;
                        html += '</div>';
                    }

                    // Display table markdown as code block
                    if (tableMarkdown) {
                        html += `<pre style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 6px; margin: 1rem 0; overflow-x: auto; font-family: 'Courier New', monospace; font-size: 0.9rem; line-height: 1.4;"><code style="color: #fff;">${tableMarkdown.trim()}</code></pre>`;
                    }

                    // Display column description
                    if (columnsText) {
                        html += `<div style="background: rgba(255,255,255,0.15); padding: 0.75rem 1rem; border-radius: 6px; margin-top: 1rem; font-size: 0.9rem;">${columnsText}</div>`;
                    }

                    // Display warning
                    if (warningText) {
                        html += `<div style="background: rgba(255,193,7,0.2); padding: 0.75rem 1rem; border-radius: 6px; margin-top: 1rem; border-left: 4px solid #ffc107;">${warningText}</div>`;
                    }

                    html += '</div>';
                } else {
                    // Regular description without special formatting
                    html += `<div style="margin-top: 1.5rem; padding: 1rem; background: #f5f5f5; border-left: 3px solid #4CAF50; border-radius: 4px;"><p style="margin: 0; color: #666; line-height: 1.5;">${description}</p></div>`;
                }
            }

            // Show example if available
            if (schemaData.schema.example) {
                html += '<h4>Example:</h4>';
                html += `<pre class="schema-example">${JSON.stringify(schemaData.schema.example, null, 2)}</pre>`;
            }

            html += '</div>';
        }

        html += '</div>';
        schemaContent.innerHTML = html;

    } catch (error) {
        schemaContent.innerHTML = `<div class="error">Error loading schemas: ${error.message}</div>`;
    }
}

/**
 * Close the schema modal
 */
function closeSchemaModal() {
    const modal = document.getElementById('schemaModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Make functions globally available
window.showValidationSchemas = showValidationSchemas;
window.closeSchemaModal = closeSchemaModal;

/**
 * Calculate team age from established date (YYYY-MM format)
 * @param {string} established - Date in YYYY-MM format (e.g., "2024-03")
 * @returns {Object} Age object with years, months, and totalMonths
 */
function calculateTeamAge(established) {
    const [year, month] = established.split('-').map(Number);
    const establishedDate = new Date(year, month - 1, 1);
    const today = new Date();

    let years = today.getFullYear() - establishedDate.getFullYear();
    let months = today.getMonth() - establishedDate.getMonth();

    if (months < 0) {
        years--;
        months += 12;
    }

    const totalMonths = years * 12 + months;

    return { years, months, totalMonths };
}

/**
 * Format established date from YYYY-MM to "Month Year"
 * @param {string} established - Date in YYYY-MM format
 * @returns {string} Formatted date (e.g., "March 2024")
 */
function formatEstablishedDate(established) {
    const [year, month] = established.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    const monthName = date.toLocaleString('en-US', { month: 'long' });
    return `${monthName} ${year}`;
}

/**
 * Format team age as human-readable text
 * @param {Object} age - Age object from calculateTeamAge
 * @returns {string} Formatted age text (e.g., "(2 years, 3 months ago)")
 */
function formatTeamAge(age) {
    if (age.totalMonths === 0) {
        return '(established this month)';
    } else if (age.totalMonths === 1) {
        return '(1 month ago)';
    } else if (age.years === 0) {
        return `(${age.months} months ago)`;
    } else if (age.months === 0) {
        return age.years === 1 ? '(1 year ago)' : `(${age.years} years ago)`;
    } else {
        const yearText = age.years === 1 ? '1 year' : `${age.years} years`;
        const monthText = age.months === 1 ? '1 month' : `${age.months} months`;
        return `(${yearText}, ${monthText} ago)`;
    }
}
