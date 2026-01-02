# Team Topologies Visualizer - Development Backlog

**Status**: Pre-release v1.0 development
**Last updated**: 2026-01-02

**Note**: The tool now defaults to "TT Design" view. The other view is called "Pre-TT" (previously "Current State") to represent the baseline/starting point before TT transformation.

This backlog tracks enhancements for iterative development. Items are organized by priority and theme.

---

## � Recently Completed (v1.0)

✅ **Value Stream Visual Grouping** - Subtle visual grouping rectangles, filter dropdown, legend  
✅ **Platform Grouping Visualization** - Team-of-teams pattern with very light blue background  
✅ **Book-Accurate Team Shapes** - Wide horizontal boxes for stream-aligned and platform teams  
✅ **Auto-align for TT Design** - One-click positioning within groupings with book-accurate layout  
✅ **Auto-align for Current State** - Org-chart layout under line managers  
✅ **Example Platform Teams** - Realistic platform teams with capabilities and consumers  
✅ **Unified Groupings Filter** - Single dropdown for both value stream and platform grouping filtering  
✅ **"TT Design" Naming** - Changed from "Team Topologies Vision" to "TT Design"  
✅ **Cognitive Load Indicators** - Traffic light visualization (🟢🟡🔴) with toggle control, detailed breakdown in team modal  
✅ **Team Interaction Mode Visual System** - Book-accurate colors, SVG legend symbols, view-specific connection rendering  
✅ **Platform Grouping Bounding Box Fix** - Stale position detection prevents oversized grouping boxes on refresh

---

## 🚀 Current Sprint - Quick Wins

These are the immediate priorities to improve visualization usability and align with Team Topologies 2nd edition.

### 1. Book-Accurate Team Shapes in Canvas & SVG Export ⭐ HIGH PRIORITY
**Goal**: Render Enabling and Complicated-Subsystem teams with authentic Team Topologies 2nd edition shapes

**Context**: 
- Info modals now display book-accurate SVG shapes for all 4 team types
- Canvas rendering still uses simple rectangles for all teams
- Book specifies: Enabling = vertical rectangle (80×120), Complicated-Subsystem = octagon
- Reference SVG files in `docs/svgs/`: `enabling-team.svg`, `complicated-subsystem-team.svg`

**Tasks**:
- [ ] Update `renderer-common.js` `drawTeamBox()` to support team type shapes
  - Enabling: Vertical rounded rectangle (80×120 proportions)
  - Complicated-Subsystem: Octagon path (multi-sided = internal complexity)
  - Stream-aligned: Keep current horizontal (200×30 proportions)
  - Platform: Keep current horizontal (200×60 proportions)
- [ ] Update connection anchor points for new shapes
  - Octagon needs 8 anchor points (one per side)
  - Vertical rectangles need adjusted anchor calculations
- [ ] Update `svg-export.js` to generate shape-specific SVG elements
  - Enabling: `<rect>` with vertical dimensions
  - Complicated-Subsystem: `<path>` with octagon geometry
- [ ] Update hit detection in `canvas-interactions.js` for octagon shape
- [ ] Add visual tests comparing rendered shapes to book diagrams
- [ ] Update CHANGELOG with book-accurate canvas rendering

**Technical Notes**:
- Enabling SVG: `<rect x="30" y="30" width="80" height="120" rx="14" fill="#b7a6d9" stroke="#7a5fa6"/>`
- Complicated-Subsystem SVG: `<path d="M40 20 H100 L120 40 V100 L100 120 H40 L20 100 V40 Z" fill="#f4b183" stroke="#c97a2b"/>`
- Consider text wrapping adjustments for narrow Enabling teams
- Octagon may need larger canvas footprint than current rectangles

**Definition of Done**:
- Enabling teams render as vertical rectangles on canvas
- Complicated-Subsystem teams render as octagons on canvas
- Exported SVG files show correct team shapes
- Connection lines properly anchor to new shapes
- Drag-and-drop works correctly with new shapes
- All existing tests pass, new visual tests added

---

### 2. ✅ Add "Undefined" Team Type for TT Design ⭐ TEAM TOPOLOGIES PATTERN
**Status**: COMPLETED 2026-01-02

**Goal**: Support teams that are not yet designed or categorized in TT Design view

**Implementation Summary**:
- ✅ Shared "undefined" team type in both Pre-TT and TT Design views
- ✅ Light gray fill (`#E8E8E8`) with darker gray dashed border (`#666666`, 8px dash, 4px gap)
- ✅ Rounded corners (8px radius) matching other team shapes
- ✅ Canvas rendering with proper hit detection and visual styling
- ✅ SVG export with `stroke-dasharray="8,4"` and `rx="8"`
- ✅ Auto-align treats undefined teams as narrow/ungrouped teams
- ✅ Example teams in both views: `example-undefined-team.md`
- ✅ Based on official TT guidance: https://teamtopologies.com/key-concepts-content/team-interaction-modeling-with-team-topologies

**Original Context**:
- During TT transformation, some teams may not yet be classified into the 4 fundamental types
- Official TT guidance mentions "undefined" team type for teams in transition
- Reference: https://teamtopologies.com/key-concepts-content/team-interaction-modeling-with-team-topologies
- Helps visualize current state of transformation (which teams still need design)

**Visual Style**:
- **Shape**: Standard rectangle (not wide like stream-aligned/platform)
- **Border**: Dashed border to indicate "not yet defined"
- **Color**: Light gray (#CCCCCC) to show neutral/undefined state
- **Label**: "Undefined" or "Not Yet Classified"

**Tasks**:
- [ ] Add "undefined" team type to `data/tt-teams/tt-team-types.json`
  - ID: "undefined"
  - Name: "Undefined"
  - Description: "Teams not yet classified into one of the 4 fundamental team types. Used during TT transformation planning."
  - Color: "#CCCCCC" (light gray)
- [ ] Update `renderer-common.js` to render undefined teams with dashed border
  - Check for team_type === 'undefined'
  - Use `ctx.setLineDash([5, 5])` for border
  - Use standard width (not wide like stream-aligned/platform)
- [ ] Update legend.js to show "Undefined" team type in TT Design view
  - Show dashed border in legend SVG
  - Add info modal explaining when to use undefined type
- [ ] Update CONCEPTS.md documentation
  - Explain undefined team type usage
  - When to use: during initial TT assessment, teams in transition
  - Goal: minimize undefined teams as transformation progresses
- [ ] Add example undefined team to tt-teams data
  - Demonstrate usage pattern
  - Show in documentation

**Use Cases**:
- **Initial Assessment**: Mark all teams as "undefined" when starting TT transformation
- **Gradual Classification**: Convert teams from undefined → stream-aligned/platform/enabling/complicated subsystem as design decisions are made
- **Progress Tracking**: Count of undefined teams shows transformation progress
- **Discussion Tool**: Undefined teams highlight areas needing design decisions

**Definition of Done**:
- Undefined team type added to config
- Dashed border rendering works correctly
- Legend shows undefined type with proper styling
- Documentation explains usage pattern
- Example undefined team in data

---

### 3. Create 2 Simple Template Files for Quick Start ⭐ USABILITY
**Goal**: Provide 2 essential template files to help users quickly create their own team data

**Context**:
- Users need to understand the file structure to add their own teams
- Start with minimal templates for v1.0 - just the essentials
- Keep it simple: 2 templates (Current State team + TT Design team)
- More comprehensive templates can come in a follow-up (see item #7)

**Tasks**:
- [ ] Create `templates/` directory at project root
- [ ] Create Current State team template: `templates/current-state-team-template.md`
  - Include all YAML front matter fields with comments
  - Example line_manager, department, dependencies
  - Placeholder markdown content with structure suggestions
  - Comments explaining each field's purpose
- [ ] Create TT Design team template: `templates/tt-design-team-template.md`
  - Include TT-specific fields (value_stream, platform_grouping)
  - Example interaction modes (collaboration, x-as-a-service, facilitating)
  - Cognitive load fields (domain_complexity, intrinsic_complexity, extraneous_complexity)
  - Team API-inspired sections (purpose, responsibilities, communications)
- [ ] Update SETUP.md with template usage instructions
  - How to copy templates to `data/current-teams/` or `data/tt-teams/`
  - Step-by-step guide for creating first custom team
  - Link to templates in "Quick Customization" section

**Definition of Done**:
- 2 team template markdown files created with helpful comments
- Templates include all supported fields
- SETUP.md references templates with usage examples
- Templates are git-friendly and easy to copy/modify
├── organization-hierarchy-template.json
├── current-team-types-template.json
└── tt-team-types-template.json
```

**Definition of Done**:
- All template files created with helpful comments
- Templates include all supported fields
- SETUP.md references templates with usage examples
- Templates are git-friendly and easy to copy/modify
- README.md in templates directory explains each file

---

### 4. Backend File Format Validation Report ⭐ DATA QUALITY
**Goal**: Provide validation warnings for team data files to catch manual editing errors

**Context**:
- **Users edit markdown and JSON files directly** in Git or on disk (by design)
- Manual editing is error-prone: typos in field names, invalid values, filename mismatches
- Filename mismatches can cause 404 errors when updating team positions
- Missing required fields can cause rendering issues or incomplete data
- Invalid references (non-existent teams, wrong interaction modes) cause silent failures
- Validation tool helps users catch errors before they cause problems
- Should be easy to run: `python validate.py` or similar

**User Workflow**:
1. User manually edits team markdown files or config JSON
2. User runs validation tool: `python -m backend.validation --all`
3. Tool reports errors and warnings with clear explanations
4. User fixes issues and re-validates
5. Clean validation = safe to commit changes

**Tasks**:
- [ ] Create `backend/validation.py` module for validation logic
- [ ] Implement filename consistency validation
  - Check if filename matches team name (lowercase, spaces→hyphens, &→and)
  - Report mismatches with suggested filename
- [ ] Implement required fields validation
  - YAML front matter: name, team_type, position (x, y)
  - Optional but recommended: dependencies, interaction_modes, metadata
  - Check for valid team_type values from config
- [ ] Implement data quality checks
  - Position coordinates should be numeric and positive
  - Dependencies should reference existing teams
  - Interaction modes should use valid mode names (collaboration, x-as-a-service, facilitating)
  - Cognitive load values should be valid (low, medium, high, etc.)
- [ ] Add CLI command for validation report
  - `python -m backend.validation --view tt` for TT Design teams
  - `python -m backend.validation --view current` for Current State teams
  - `python -m backend.validation --all` for both views
  - Easy to remember and run after manual edits
  - Exit code 0 if valid, 1 if errors found (for CI/CD integration)
- [ ] Add API endpoint `/api/validate` for real-time validation
  - Returns JSON with warnings and errors
  - Can be called from frontend to show warnings in UI
  - Optional: Add "Validate Files" button in UI
- [ ] Add validation to README.md Quick Start section
  - Document validation as part of manual editing workflow
  - Example: "After editing team files, run `python -m backend.validation --all`"
- [ ] Add unit tests for validation logic

**Output Format**:
```
Team Data Validation Report
============================

Validating: data/tt-teams/ (20 files)
Validating: data/current-teams/ (12 files)

ERRORS (must fix before using):
  ❌ data/tt-teams/my-team.md
     - Missing required field: team_type
     - Invalid position: x coordinate must be numeric (got "abc")

WARNINGS (recommended fixes):
  ⚠️  data/tt-teams/aws-developer-platform-team.md
     - Was: platform-team.md (filename mismatch)
     - Team name is "AWS Developer Platform Team"
     - Suggested rename: mv platform-team.md aws-developer-platform-team.md
  ⚠️  data/tt-teams/sales-team.md
     - Dependency references non-existent team: "Marketing Team"
     - Check spelling or add Marketing Team file
  ⚠️  data/tt-teams/product-team.md
     - Interaction mode uses invalid value: "sometimes-collaborates"
     - Valid modes: collaboration, x-as-a-service, facilitating

INFO (good practices):
  ℹ️  5 teams missing cognitive_load metadata
  ℹ️  3 teams missing value_stream grouping

Summary: 2 errors, 3 warnings, 3 info messages across 32 files
❌ Validation failed - please fix errors before proceeding
```

**User-Friendly Error Messages**:
- Clear explanation of what's wrong
- Suggestion for how to fix it
- File path and line number when possible
- Links to documentation for complex issues

**Definition of Done**:
- Validation module with comprehensive checks
- CLI tool that's easy for users to run after manual edits
- Clear, actionable error messages with fix suggestions
- API endpoint for real-time validation (optional UI integration)
- Exit codes for CI/CD integration
- Tests covering all validation rules
- Documentation in README.md for validation workflow
- Documentation in SETUP.md for detailed validation rules

---

### 5. Multi-Select Groupings Filter ⭐ USABILITY
**Goal**: Allow selecting multiple value streams and/or platform groupings simultaneously in TT Design view

**Context**:
- Current groupings dropdown only allows "All" or one specific grouping
- Users want to focus on subset of groupings without showing everything
- Example: Show only "E-commerce Experience" + "Enterprise Sales" value streams
- Example: Show "Cloud Infrastructure" + "Data Platform" groupings together

**Tasks**:
- [ ] Replace single-select dropdown with multi-select UI component
  - Consider checkbox list or multi-select dropdown
  - Maintain "All" option for convenience
  - Show selected count in collapsed state (e.g., "3 groupings selected")
- [ ] Update `filters.js` `getFilteredTeams()` to handle array of selected groupings
  - Currently checks `selectedGrouping.startsWith('vs:')` or `'pg:'`
  - Update to check if team's value stream or platform grouping is in selection array
- [ ] Update `legend.js` `updateGroupingFilter()` to populate multi-select component
- [ ] Update state management in `state-management.js`
  - Change `selectedGrouping` from string to array
  - Handle backwards compatibility for saved positions
- [ ] Ensure legend updates correctly when multiple groupings selected
- [ ] Update URL persistence if implemented (for sharing filtered views)

**UI Considerations**:
- Keep interface simple and intuitive
- Preserve "All" as quick reset option
- Show visual feedback of selection count
- Consider "None" option to hide all teams temporarily

**Definition of Done**:
- Can select multiple value streams simultaneously
- Can select multiple platform groupings simultaneously
- Can mix value streams and platform groupings in selection
- Filtering works correctly with multiple selections
- Legend reflects current selection
- "All" option clears selection and shows everything

---

### 6. Review Team Topologies Official Interaction Modeling Content ⭐ LOW PRIORITY

**Reference**: https://teamtopologies.com/key-concepts-content/team-interaction-modeling-with-team-topologies

**Tasks**:
- [ ] Review official page for terminology updates
  - Check if both "platform team" and "platform group" should be used in descriptions
  - Verify if platform grouping (team-of-teams) has specific guidance
- [ ] Check for alternative interaction mode symbols
  - Verify if 2nd edition introduces new or updated visual symbols
  - Compare current SVG symbols with any official diagrams
  - Assess if modal info content needs updates
- [ ] Update documentation if needed
  - Align terminology with official guidance
  - Update visual symbols if alternatives are recommended
  - Ensure consistency across modals, legend, and docs

---

### 6. Review Team Topologies Official Interaction Modeling Content ⭐ LOW PRIORITY
**Goal**: Ensure visualizer aligns with latest official Team Topologies guidance

**Reference**: https://teamtopologies.com/key-concepts-content/team-interaction-modeling-with-team-topologies

**Tasks**:
- [ ] Review official page for terminology updates
  - Check if both "platform team" and "platform group" should be used in descriptions
  - Verify if platform grouping (team-of-teams) has specific guidance
- [ ] Check for alternative interaction mode symbols
  - Verify if 2nd edition introduces new or updated visual symbols
  - Compare current SVG symbols with any official diagrams
  - Assess if modal info content needs updates
- [ ] Update documentation if needed
  - Align terminology with official guidance
  - Update visual symbols if alternatives are recommended
  - Ensure consistency across modals, legend, and docs

**Definition of Done**:
- Official content reviewed and documented
- Any terminology/symbol discrepancies identified
- Updates applied if needed, or backlog item closed as "aligned"

---

### 7. Comprehensive Template Library (Follow-up to #3) 📚 DOCUMENTATION
**Goal**: Expand template collection beyond the 2 essential team templates from item #3

**Context**:
- Item #3 provides 2 simple markdown templates for quick start (v1.0)
- This item adds comprehensive templates for configuration files and advanced use cases
- For users who want deeper customization of departments, team types, and structure

**Tasks**:
- [ ] Create department/org hierarchy template: `templates/organization-hierarchy-template.json`
  - Example structure with managers and departments
  - Comments explaining hierarchy relationships
  - Sample data for 2-3 levels (executives, directors, managers)
- [ ] Create team types config template: `templates/team-types-template.json`
  - Example team types with IDs, names, descriptions, colors
  - Comments explaining when to use each team type
  - Separate examples for Current State (functional teams) vs TT Design (4 fundamental types)
- [ ] Create platform capabilities template
  - Example platform with detailed capabilities and consumers
  - Demonstrate platform grouping membership
- [ ] Create value stream template
  - Example value stream configuration
  - Team assignments and flow metrics structure
- [ ] Add templates README: `templates/README.md`
  - Explain purpose of each template
  - Usage examples and customization tips
  - Link to main SETUP.md documentation

**Definition of Done**:
- All advanced template files created with helpful comments
- Templates cover JSON configuration files and specialized use cases
- README.md in templates directory explains all files
- SETUP.md links to template library for advanced users

---

### 8. Platform Capabilities Display ⭐ MEDIUM PRIORITY
**Goal**: Show what services platforms provide

**Tasks**:
- [ ] Add "capabilities" section to platform team cards
- [ ] List key platform services on canvas (compact view)
- [ ] Show number of consumer teams
- [ ] Link to detailed capability list in team detail modal
- [ ] Visual indicator for platform groupings

**Sample data ready**: Platform teams have `metadata.capabilities` and `metadata.consumers`

**Definition of Done**:
- Platform teams show 2-3 key capabilities on card
- Full capability list in detail modal
- Visual distinction for platform grouping membership

---

## 📋 Backlog - Prioritized Features

### Theme: Value Stream Management

#### Value Stream Flow Metrics
**Priority**: High
**Effort**: Large

- [ ] Add flow metrics to value stream groupings
  - Lead time per value stream
  - Deployment frequency
  - Change fail rate
  - MTTR (Mean Time To Restore)
- [ ] Visual indicators for flow health (🟢🟡🔴)
- [ ] Trend indicators (improving/declining)
- [ ] Link to external metrics dashboards

**Sample data**: Add `flow_metrics` to value stream metadata

---

#### Value Stream Dependencies
**Priority**: Medium
**Effort**: Medium

- [ ] Visualize dependencies between value streams
- [ ] Highlight problematic cross-value-stream dependencies
- [ ] Show wait time on dependencies
- [ ] Suggest opportunities to reduce coupling

---

#### Value Stream Ownership
**Priority**: Low
**Effort**: Small

- [ ] Add value stream executive sponsor/owner
- [ ] Show on canvas or in detail view
- [ ] Accountability for value stream health

---

#### Value Stream / SAFe Train Grouping in Current State View
**Priority**: High
**Effort**: Medium

**Context**: Organizations often organize around value streams or SAFe Agile Release Trains (ARTs) rather than traditional org-chart hierarchies. Current State view currently groups teams by line manager (org-chart structure), but this may not reflect the actual value delivery structure.

**Goal**: Provide alternative grouping option for Current State view based on value stream/train membership rather than org-chart hierarchy.

**Tasks**:
- [ ] Add `value_stream` or `train` metadata to team YAML files
  - Support multiple trains per team (some teams serve multiple value streams)
- [ ] Add view mode toggle or layout option for Current State view
  - "Org Chart" (current default - by line manager)
  - "Value Streams" (group by train/value stream)
- [ ] Design visual representation for value stream grouping
  - Horizontal swim lanes per value stream?
  - Vertical columns per train?
  - Colored backgrounds similar to TT Design view?
  - Department labels vs Train labels
- [ ] Update auto-align logic to position teams within train groupings
- [ ] Consider cross-train team visualization (teams in multiple trains)
- [ ] Add filter dropdown for specific trains (similar to current grouping filter)

**Visual Design Questions**:
- Should trains be visualized as swim lanes (horizontal bands)?
- Should department structure still be visible within trains?
- How to show teams that span multiple trains?
- Should "Actual Comms" lines cross train boundaries differently?

**Sample Data Needed**:
```yaml
# Example team metadata additions
metadata:
  value_stream: "E-commerce Platform"  # or SAFe train name
  # OR support multiple:
  value_streams:
    - "E-commerce Platform"
    - "Customer Experience"
```

**Definition of Done**:
- Teams can be tagged with value stream/train membership
- Current State view has toggle between "Org Chart" and "Value Streams" layouts
- Auto-align works for train-based grouping
- Visual distinction between trains (swim lanes, colors, or labels)
- Documentation updated with value stream grouping explanation
- Sample data demonstrates multi-train organization

---

### Theme: Cognitive Load Management

#### Cognitive Load Heatmap View
**Priority**: High
**Effort**: Medium

- [ ] Alternative view mode showing cognitive load heatmap
- [ ] Color-code entire canvas by team cognitive load
- [ ] Quick identification of struggling teams
- [ ] Filter to show only high-load teams

---

#### Responsibility Tracking
**Priority**: Medium
**Effort**: Medium

- [ ] List all team responsibilities on team card (expandable)
- [ ] Count of responsibilities per team
- [ ] Flag teams with too many responsibilities
- [ ] Suggest simplification opportunities

**Sample data**: Teams have `metadata.responsibilities` array

---

#### Cognitive Load Recommendations
**Priority**: Low
**Effort**: Large

- [ ] Suggest when teams should be split
- [ ] Recommend platform services to reduce load
- [ ] Identify enabling team opportunities
- [ ] AI-powered cognitive load analysis

---

### Theme: Platform Engineering

#### Thinnest Viable Platform (TVP) Maturity
**Priority**: Medium
**Effort**: Medium

- [ ] Add maturity indicator to platform teams
  - MVP (just started)
  - Growing (adding capabilities)
  - Mature (stable, well-adopted)
  - Legacy (needs modernization)
- [ ] Show platform evolution over time
- [ ] Track platform adoption metrics

---

#### Platform Consumer Relationships
**Priority**: Medium
**Effort**: Small

- [ ] Visual lines from platforms to consumer teams
- [ ] Show which teams consume which platforms
- [ ] Highlight teams not using available platforms
- [ ] Platform adoption metrics

---

#### Platform NPS / Satisfaction
**Priority**: Low
**Effort**: Small

- [ ] Add internal NPS score for platforms
- [ ] Collect feedback from consumer teams
- [ ] Display satisfaction indicator on platform cards

**Sample data**: Platforms can have `metadata.consumer_nps`

---

### Theme: Team Interaction Evolution

#### Interaction Timeline
**Priority**: High
**Effort**: Large

- [ ] Git history integration to show team structure evolution
- [ ] Timeline scrubber to view past states
- [ ] Show how interaction modes changed over time
  - Collaboration → X-as-a-Service transitions
  - Team splits and merges
- [ ] Animated transitions between states

---

#### Temporary vs Permanent Interactions
**Priority**: High
**Effort**: Medium

- [ ] Visual distinction for temporary collaborations
- [ ] Show end date for temporary interactions
- [ ] Flag overdue "temporary" collaborations that became permanent
- [ ] Suggest when collaboration should transition to X-as-a-Service

**Sample data**: Add duration to interaction_modes: `"Team A": {"mode": "collaboration", "duration": "3 months", "end_date": "2026-03-01"}`

---

#### Interaction Mode Recommendations
**Priority**: Low
**Effort**: Large

- [ ] Suggest when teams should collaborate
- [ ] Identify when X-as-a-Service is more appropriate
- [ ] Flag too many collaboration relationships (team overload)
- [ ] Conway's Law violation detection

---

### Theme: Architecture & Conway's Law

#### Architecture Diagram Integration
**Priority**: Medium
**Effort**: Large

- [ ] Import draw.io or other architecture diagrams
- [ ] Side-by-side: team structure + system architecture
- [ ] Visual connections showing team-to-component ownership
- [ ] Conway's Law violation highlighting
  - Team boundaries cutting across system boundaries
  - Multiple teams owning one component

---

#### System Ownership Mapping
**Priority**: Medium
**Effort**: Medium

- [ ] Tag teams with systems/services they own
- [ ] Show service architecture on canvas (simplified)
- [ ] Visualize which team owns which services
- [ ] Identify orphaned services (no clear owner)

---

### Theme: Sensing & Adaptation

#### Problem Identification View
**Priority**: High
**Effort**: Medium

- [ ] "Problems" overlay showing pain points
  - Overloaded teams (red)
  - Blocking dependencies (red lines)
  - Slow flow (metrics-based)
- [ ] Actionable recommendations
- [ ] Priority ranking of issues

---

#### Bottleneck Detection
**Priority**: High
**Effort**: Medium

- [ ] Identify teams that are dependencies for many others
- [ ] Show dependency count per team
- [ ] Visualize dependency chains (A → B → C → D)
- [ ] Suggest platform extraction opportunities

---

#### Feedback Loop Visualization
**Priority**: Low
**Effort**: Medium

- [ ] Document team feedback mechanisms
- [ ] Show sensing loops (how teams detect change)
- [ ] Adaptation history (how teams evolved)

---

### Theme: User Experience

#### Visibility Controls ✅ Already in Future Enhancements
**Priority**: Medium
**Effort**: Small

- [ ] Toggle visibility of individual teams
- [ ] Hide/show departments in Current State view
- [ ] Hide/show value streams in TT Design view
- [ ] Save visibility preferences

---

#### High-Resolution Display Support
**Priority**: Medium
**Effort**: Medium

**Known Limitation**: Canvas scaling and visualization need review for high-resolution displays (40+ inch monitors, 4K/5K displays)

**Issues**:
- [ ] Canvas may not scale properly on very large/high-DPI displays
- [ ] Scroll bars behavior on large screens
- [ ] Viewport sizing and initial zoom level for different display sizes
- [ ] Team box sizes and text readability at different resolutions
- [ ] Auto-align calculations for different canvas dimensions

**Possible Solutions**:
- Detect display size and adjust initial zoom/scale
- Implement responsive canvas sizing based on viewport
- Add min/max zoom limits appropriate for display size
- Consider CSS-based scaling alternatives to manual canvas calculations

---

#### Multiple Layout Options
**Priority**: Low
**Effort**: Large

- [ ] Value stream swim lanes layout
- [ ] Radial platform grouping layout
- [ ] Hierarchical tree layout
- [ ] Circle packing layout
- [ ] Let user choose preferred layout per view

---

#### Mobile/Tablet Support
**Priority**: Low
**Effort**: Large

- [ ] Responsive design for tablets
- [ ] Touch-friendly interactions
- [ ] View-only mode for mobile phones

---

#### Collaboration Features
**Priority**: Low
**Effort**: X-Large

- [ ] Real-time multi-user editing
- [ ] Comments and annotations
- [ ] Change proposals and reviews
- [ ] Export to shareable link

---

### Theme: Data Integration

#### Import from External Sources
**Priority**: Medium
**Effort**: Large

- [ ] Import team data from:
  - JIRA / Azure DevOps (teams, assignments)
  - ServiceNow (team records, dependencies)
  - Confluence / Notion (team documentation)
  - GitHub org structure (repository owners)
- [ ] Automatic team discovery
- [ ] Sync external changes

---

#### Flow Metrics Integration
**Priority**: High
**Effort**: Large

- [ ] Connect to:
  - DORA metrics sources
  - CI/CD systems (deployment frequency)
  - Incident management (MTTR)
  - Version control (lead time)
- [ ] Real-time metrics display
- [ ] Historical trends

---

#### Export Enhancements
**Priority**: Low
**Effort**: Small

- [ ] Export to PowerPoint/Keynote
- [ ] Export to PDF with multiple pages
- [ ] ASCII art export for documentation
- [ ] Export to PNG/JPEG

---

## 🧹 Technical Debt & Improvements

### Code Quality
- [ ] Add TypeScript (evaluate if worth it)
- [ ] Improve test coverage (currently basic)
- [ ] Add E2E tests for new features
- [ ] Refactor large components

### Known Issues

#### Current State Connection Arrows Not Visible 🐛
**Priority**: Low (UX/Nice-to-have)
**Effort**: Medium (needs investigation)

**Problem**: Bidirectional arrow triangles at ends of "Actual Comms" lines in Current State view are not rendering on canvas, despite working perfectly in legend SVG.

**Symptoms**:
- Legend shows arrows correctly (70px SVG with triangles at both ends)
- Canvas only shows fat gray line without arrow triangles
- Code appears correct: `ctx.fill()` with proper triangle geometry

**Attempted Fixes**:
1. ✗ Reordered drawing (arrows after line) to avoid overlap
2. ✗ Shortened line by arrow length to prevent covering
3. ✗ Increased arrow size from 10px → 16px → 20px
4. ✗ Changed from stroke to fill with `ctx.fill()` + `ctx.stroke()`
5. ✗ Added `ctx.save()`/`ctx.restore()` for context isolation
6. ✗ Set explicit `fillStyle` and `strokeStyle` for arrows
7. ✗ Reduced line width to 1px (debugging) - still no arrows visible
8. ✗ Changed angle from π/7 to π/6 for wider triangles

**Code Location**: `frontend/renderer-common.js` - `drawActualCommsConnection()` function (lines ~197-255)

**Hypotheses to Explore**:
- Canvas z-index or layering issue (team boxes drawn after connections?)
- Global canvas transform/clip affecting arrow rendering
- Arrow coordinates landing outside visible canvas area
- Browser rendering quirk with canvas fill operations
- Need to call `ctx.beginPath()` before each triangle separately

**Workaround**: Legend clearly shows the connection type, so functionality is not impaired.

**Next Steps**:
- Add console.log to verify arrow coordinates are reasonable
- Try drawing test rectangles at arrow positions to verify visibility
- Check if team boxes or other elements are obscuring arrows
- Review canvas rendering order in renderer-current.js

### Performance
- [ ] Optimize canvas rendering for 50+ teams
- [ ] Lazy loading for team details
- [ ] Virtualization for large team lists

### Developer Experience
- [ ] Hot module reload
- [ ] Better error messages
- [ ] Development mode with mock data
- [ ] API client generation

---

## 📚 Documentation Improvements

- [ ] Video walkthrough / tutorial
- [ ] Team Topologies concepts primer
- [ ] Example use cases and scenarios
- [ ] Migration guide (from other tools)
- [ ] API documentation improvements
- [ ] Contributing guide expansion

---

## 🎯 v1.0 Release Checklist

**Target**: Q1 2026

Must-haves for v1.0:
- [x] Change to "TT Design" naming
- [x] Value stream visual grouping
- [x] Platform grouping visualization
- [x] Book-accurate team shapes
- [x] Auto-align for both views
- [ ] Cognitive load indicators
- [ ] Platform capabilities display
- [x] Comprehensive sample data
- [ ] User documentation improvements
- [ ] Demo video
- [ ] GitHub release notes

---

## 💡 Ideas for Future Consideration

These are interesting ideas but not prioritized yet:

- AI-powered team topology recommendations
- Integration with Team API template repositories
- Team health assessment framework
- Multi-organization / portfolio view
- Team interaction cost calculator
- Gamification (team topology maturity score)
- Community template library
- Plugin architecture for extensibility

---

## 📝 Notes

### Prioritization Criteria
1. **User Value**: Does this help users make better decisions?
2. **TT Alignment**: Does this align with Team Topologies principles (especially 2nd edition)?
3. **Effort**: Can we deliver this incrementally?
4. **Dependencies**: What else needs to be done first?
5. **Sample Data**: Do we have realistic sample data to test with?

### Review Cadence
- Review backlog every 2 weeks
- Re-prioritize based on learning
- Archive or remove items that no longer make sense

### Definition of Done
- Feature implemented and tested
- Sample data updated to demonstrate feature
- Documentation updated
- User can use feature without explanation
