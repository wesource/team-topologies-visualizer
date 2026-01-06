/**
 * Modal Management
 * Handles all modal dialogs (team details, educational info, etc.)
 */

import { loadTeamDetails } from './api.js';
import { showError } from './notifications.js';
import { getCognitiveLoadIndicator } from './renderer-common.js';
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
    if (modal) modal.style.display = 'none';
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
 */
export async function showTeamDetails(team, currentView) {
    try {
        const teamData = await loadTeamDetails(team.name, currentView);

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

            // Insert after type badge, before description
            const detailTeamName = document.getElementById('detailTeamName');
            if (detailTeamName && detailTeamName.parentNode) {
                detailTeamName.parentNode.insertBefore(establishedSection, detailTeamName.nextSibling);
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
                const otherMetadata = Object.entries(teamData.metadata)
                    .filter(([key]) => !cognitiveLoadFields.includes(key));

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
        const prefix = view === 'current' ? '/pre-tt' : '/tt';
        const response = await fetch(`/api${prefix}/validate`);
        const report = await response.json();

        // Build report HTML
        let html = '<div class="validation-summary">';
        html += '<h3>Summary</h3>';
        html += '<div class="summary-grid">';
        html += `<div class="summary-item"><strong>Total Files:</strong> ${report.total_files}</div>`;
        html += `<div class="summary-item valid"><strong>✓ Valid:</strong> ${report.valid_files}</div>`;
        html += `<div class="summary-item warning"><strong>⚠ Warnings:</strong> ${report.files_with_warnings}</div>`;
        html += `<div class="summary-item error"><strong>✗ Errors:</strong> ${report.files_with_errors}</div>`;
        html += '</div></div>';

        if (report.issues.length === 0) {
            html += '<div class="validation-success">🎉 All files are valid! No issues found.</div>';
        } else {
            html += '<h3>Issues Found</h3>';
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
    }
});

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
