# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **TT Teams Initial Variant (2026-01-10)**: Created simplified "first step" TT transformation example for educational purposes
  - **Directory**: `data/tt-teams-initial/` - Realistic 3-6 month transformation from Pre-TT baseline
  - **Teams**: 5 focused teams representing initial transformation:
    - 2 stream-aligned teams (Dispatch & Fleet, Delivery & Routing) - Split from Backend Services monolith
    - 1 platform team (Cloud Platform) - Transformed from DevOps bottleneck using Thinnest Viable Platform approach
    - 1 enabling team (DevOps Enablement) - New team to accelerate cloud-native adoption (time-boxed engagements)
    - 1 complicated-subsystem team (Route Optimization Platform) - Kept clear boundary from baseline
  - **Traceability**: Each team includes `origin_team` or `origin_teams` field in YAML for transformation tracking
  - **Documentation**: Comprehensive README.md with:
    - Transformation strategy and design philosophy
    - Origin mapping table (baseline → TT teams)
    - Success criteria and flow metrics improvements
    - Phase 2 roadmap for continued evolution
    - Usage instructions (directory renaming until demo toggle implemented)
  - **Rationale**: Current `tt-teams/` represents mid-stage transformation - too complex for "first step" examples. This variant shows realistic initial transformation focusing on highest-pain areas first.
  - **Future enhancement**: Add UI toggle to switch between "First Step" and "Mid-Stage" examples without renaming directories

### Fixed
- **LogiCore naming consistency (2026-01-10)**: Normalized remaining legacy company-name references to "LogiCore" in example datasets and docs
  - Ensures the baseline and TT-design narratives refer to the same fictional company
  - Corrected a couple of Pre-TT `line_manager` metadata mismatches to align with `organization-hierarchy.json`
  - Kept Pre-TT `business_stream` names intentionally not 1:1 with TT `value_stream` names (per modeling intent)
- **TT dataset coherence (2026-01-10)**: Aligned TT markdown narrative sections with YAML metadata
  - Added missing "Part of a platform grouping?" sections where `platform_grouping` is set
  - Normalized a few TT team headings/labels to match the canonical YAML `name`

### Removed
- **Dead code cleanup (2026-01-08)**: Removed `backend/routes.py` (286 lines) - file was not imported anywhere in codebase after routing architecture split into `routes_tt.py` and `routes_pre_tt.py`

### Added
- **Demo Mode (2026-01-08)**: Read-only mode for public demonstrations and workshops
  - **Backend**: `READ_ONLY_MODE` environment variable blocks writes (403 Forbidden)
    - Position updates blocked for both Pre-TT and TT Design teams
    - Snapshot creation blocked
    - `/api/config` endpoint exposes demo mode status to frontend
  - **Frontend**: Purple gradient banner when in demo mode
    - Animated slideDown entrance with pulsing icon
    - Clear messaging: "Feel free to explore. Changes won't be saved"
  - **Convenience scripts**: `start-demo.ps1` (Windows) and `start-demo.sh` (Linux/Mac)
  - **Docker support**: `-e READ_ONLY_MODE=true` flag
  - **Tests**: 5 backend tests + 1 E2E test for demo mode functionality
  - **Rationale**: Enable safe public hosting where users can interact without persisting changes or corrupting shared data

### Removed
- **Dead code cleanup (2026-01-08)**: Removed `backend/routes.py` (286 lines) - file was not imported anywhere in codebase after routing architecture split into `routes_tt.py` and `routes_pre_tt.py`

### Added
- **Test coverage improvements (2026-01-08)**: Added 27 new tests for previously untested features
  - `test_dependency_parsing.py`: 12 tests for Pre-TT dependency parsing from markdown bullet lists
  - `test_routes_tt.py`: 15 tests for TT Design API endpoints (team-types, teams, position updates, validation)
  - `renderer-common.test.js`: 12 tests for line thickness and corner radius rendering
  - **Total test count**: 544 tests (133 backend, 329 frontend, 82 E2E)
- **Toolbar UI Improvements (2026-01-06)**: Enhanced visual separation and clarity of view selectors
  - Added pipe separators (`|`) between all radio button options:
    - Between "Pre-TT" and "TT Design" view selector
    - Between "Hierarchy", "Product Lines", and "Value Streams" perspective selector
  - Added framed styling to perspective selector:
    - Light gray background (#f8f9fa)
    - Border with rounded corners
    - Subtle inset shadow for depth
    - Padding for better spacing
  - **Rationale**: Improved visual hierarchy and clarity, making selector groups more distinct and easier to scan
  - **Files**: `frontend/index.html`, `frontend/styles.css`
- **Pre-TT Team Template (2026-01-06)**: Created comprehensive template for current organizational state
  - New `templates/pre-tt-team-template.md` with fields for Pre-TT teams (dependencies, product_line, line_manager, department)
  - Renamed existing templates: `tt-design-team-api-template-base.md` and `tt-design-team-api-template-extended.md`
  - Updated README.md with clear Pre-TT vs TT-Design template guidance
  - **Rationale**: Clear separation between current state (Pre-TT) and designed future state (TT-Design) documentation
- **Product Lines View Phase 1 (2026-01-06)**: ✅ COMPLETE - Full-featured Pre-TT product visualization
  - **Core Features**:
    - Hybrid layout: Vertical product lanes + horizontal shared teams row
    - Sharp corners throughout (matching hierarchy view styling)
    - Darker borders with darkenColor (0.7) for visual weight
    - Cognitive load indicators (top-right position, circle with white outline)
    - Communication lines showing team dependencies
    - Team type badges (optional, toggled via checkbox)
    - Team selection highlighting (4px black border)
    - Drag prevention with throttled notification
    - SVG export with all features (communication lines, proper font sizes, 11px text)
  - **UI/UX Improvements**:
    - Modal content padding (2rem left/right margins for readability)
    - Removed redundant "Description" header from team detail modal
    - SVG export z-layering: Communication lines above product boxes, below team cards
  - **Data Cleanup**: Removed `interaction_modes` from all Pre-TT teams
    - Pre-TT uses only `dependencies` (simple team dependencies, not TT patterns)
    - TT-Design keeps `interaction_modes` (collaboration, x-as-a-service, facilitating)
    - **Rationale**: Interaction modes are Team Topologies design patterns, not organic dependencies
  - **Files**: `renderer-product-lines.js`, `svg-export.js`, 12 current-teams markdown files updated

### Changed
- **🏗️ Backend Refactoring (2026-01-06)**: Split routes by concern (Pre-TT vs TT-Design)
  - **New API Structure**: Clear separation between Pre-TT and TT-Design endpoints
    - `/api/pre-tt/*` - Pre-TT (current-teams) endpoints: teams, product-lines, organization-hierarchy, snapshots
    - `/api/tt/*` - TT-Design (tt-teams) endpoints: teams, team-types, validate
  - **Files Changed**:
    - Split `backend/routes.py` → `backend/routes_pre_tt.py` + `backend/routes_tt.py`
    - Updated `main.py` to include both routers with prefixes
    - Updated `frontend/api.js` to use view-based prefixes
    - Updated `frontend/modals.js` validation endpoint call
  - **Rationale**: Self-documenting API structure, clearer separation of concerns, enables independent evolution
  - **models.py remains shared**: `TeamData` works for both views with optional fields
- **🔧 Naming Convention Consistency (2026-01-06)**: Unified all config files to use `snake_case`
  - Fixed `current-team-types.json`: Changed `teamTypes` → `team_types` (matches TT config)
  - Fixed structure: Changed from object `{"team_types": {key: {...}}}` to array `{"team_types": [{id: "...", ...}]}`
  - **Rationale**: Array structure matches `tt-team-types.json` format, enables consistent frontend parsing
  - Fixed `backend/validation.py`: Updated to parse array format with `id` field
  - All config properties now consistent: `team_type`, `team_types`, `interaction_modes`, etc.
- **TT-Design Team Migrations to LogiCore Systems (2026-01-06)**: Completed logistics domain migration
  - Updated 12+ stream-aligned teams from E-Commerce/Mobile to B2B/B2C Services logistics content
  - Renamed files to match updated content (e.g., e-commerce-cart-team.md → fleet-operations-team.md)
  - DevOps Enablement Team: Updated from "Enterprise Sales" to "B2B Services" value stream (reflects current embedding)
  - ML/AI Specialists Team: Removed value_stream (now serves both B2B and B2C, true complicated-subsystem pattern)
  - Updated team descriptions, services, and interaction patterns for logistics operations

### Added
- **Pre-TT Interaction Data (2026-01-06)**: Added `dependencies` and `interaction_modes` to all 9 Pre-TT engineering teams
  - Enables visualization of interaction lines in Pre-TT view
  - Shows Pre-TT dysfunction: handoffs, bottlenecks, coordination overhead
  - Current approach: YAML frontmatter storage (vs TT-Design markdown tables)
  - Future enhancement: May migrate to markdown table format for consistency (see BACKLOG.md)
- **Product Lines View Foundation (2026-01-06)**: Phase 1 COMPLETE ✅ - Multi-perspective Pre-TT visualization
  - **Data Model**: Added `product_line` field to 9 Pre-TT teams:
    - **DispatchHub** (2 teams): Backend Services, Web Frontend
    - **Driver Mobile Apps** (1 team): Mobile App
    - **RouteOptix** (1 team): Route Optimization
    - **Customer Solutions** (5 teams): European Transport/Logistics/Retail, Americas E-Commerce/Supply Chain
  - **Shared Teams** (5 teams without product_line): Database, DevOps, QA, API Framework, Architecture
  - **Configuration**: `products.json` defines 4 products with colors and metadata
  - **Backend API**: New `/api/pre-tt/product-lines` endpoint groups teams by product
    - Added `product_line: str | None` field to `TeamData` Pydantic model
  - **Frontend Implementation**:
    - **Perspective Selector UI**: Radio buttons toggle between "📊 Hierarchy" and "🏭 Product Lines" (Pre-TT only)
    - **Hybrid Renderer** (`renderer-product-lines.js`): Vertical product lanes + horizontal shared teams row
      - Vertical lanes: Teams stacked within each product with color-coded headers
      - Horizontal row: Shared/Platform teams displayed side-by-side at bottom
      - Product colors from products.json, team cards show name and type badge
    - **State Management**: Added `state.currentPerspective` and `state.productLinesData`
    - **Smart Loading**: Product lines data loaded on-demand when switching perspectives
  - **Next Phases**: Phase 2 (Value Stream swimlanes), Phase 3 (Alignment scoring/recommendations)
  - See `pre-tt-view-improvements-solution.md` for design rationale

### Fixed
- **🐛 Product Lines View Rendering (2026-01-06)**: Fixed double-rendering bug
  - Teams from hierarchy view were still visible when switching to product lines perspective
  - Solution: Skip standard team drawing loop when in product-lines perspective (teams already rendered in lanes)
  - Canvas now properly clears and redraws when switching perspectives
- **🎨 Unified Team Styling (2026-01-06)**: Team boxes now consistent across all Pre-TT perspectives
  - Product Lines view now uses team-type colors (from teamColorMap) instead of product colors
  - Applies "Rubik's cube" principle: same teams look the same from any perspective
  - Cleaner, non-rounded rectangular cards with white text on colored backgrounds
  - Lane backgrounds neutral gray (#f8f9fa) to avoid color confusion
- **🐛 Frontend Variable Name (2026-01-06)**: Fixed `interactionHandler` undefined error
  - Changed `_interactionHandler` → `interactionHandler` for consistency
  - Pre-TT view now loads without console errors
- **📊 Snapshot Comparison View**: Side-by-side comparison of snapshots to visualize Team Topologies evolution
  - **Split-Screen Canvas**: Independent before/after canvases with separate zoom/pan controls
    - Click "Compare" button on any two snapshots in Timeline panel
    - Two HTML5 canvases render snapshots side-by-side
    - Each canvas has independent view state (scale, offsetX, offsetY, panning)
  - **Independent Controls**: Full interactive control for each snapshot view
    - Mouse wheel zoom on each canvas (0.1x to 3.0x scale)
    - Click-and-drag panning per canvas
    - Six zoom buttons: +/-/Reset for before and after views
    - Center-based zoom maintains focal point during scale changes
  - **Visibility Toggles**: Three checkboxes control visual layers on both canvases
    - Show/Hide Groupings (value streams, platform groupings) - default ON
    - Show/Hide Interactions (collaboration, X-as-a-Service, facilitating lines) - default ON
    - Show/Hide Change Badges (new/moved/changed indicators) - default ON
    - All toggles affect both canvases simultaneously for consistent comparison
  - **Change Detection & Badges**: Visual indicators highlight differences between snapshots
    - 🟢 NEW badge (green #4CAF50): Teams added in "after" snapshot
    - 🟡 MOVED badge (yellow #ffc107): Teams repositioned between snapshots
    - 🔵 CHANGED badge (blue #17a2b8): Teams with type/metadata changes
    - Two-pass rendering ensures badges always appear on top (not covered by team boxes)
    - Only displayed on "after" canvas (right side)
  - **Four-Layer Rendering**: Proper z-ordering for complex visualizations
    1. Grouping boxes (value streams, platform groupings) - background layer
    2. Connection lines (interaction modes) - behind teams
    3. Team boxes - middle layer
    4. Change badges - always on top
  - **Team Dimensions**: Hardcoded dimensions prevent NaN scale bug
    - Stream-aligned/Platform: 200×60 pixels
    - Enabling/Complicated-subsystem: 100×80 pixels
    - Cannot use LAYOUT constants (org-chart specific)
  - **Canvas Interactions**: Proper event handling with CSS pointer-events
    - Controls container: `pointer-events: none` (mouse-transparent)
    - Buttons: `pointer-events: auto` (clickable overlays)
    - Prevents controls from blocking canvas mouse events
  - **Modal Timing**: `requestAnimationFrame` ensures proper canvas sizing
    - Waits for modal to be visible before measuring canvas dimensions
    - Prevents getBoundingClientRect() errors with hidden elements
  - **Implementation**: New `comparison-view.js` module (602 lines)
    - `ComparisonView` class with full lifecycle management
    - Integration with `snapshot-handlers.js` for timeline UI
    - Shared rendering functions from `renderer-common.js`
    - Independent from main canvas rendering pipeline
  - **Testing**: 51 new tests ensuring quality and correctness
    - 43 unit tests (Vitest): visibility toggles, zoom calculations, pan calculations, fit-to-view, badge detection, rendering conditions, team dimensions, view state management
    - 8 E2E tests (Playwright): comparison opening, toggle controls, zoom controls, modal interactions
  - **Documentation**: Comprehensive guides for all users
    - README.md: "Comparing Snapshots" usage guide (50+ lines) with workflows, badge meanings, interactive features, use cases
    - CONCEPTS.md: Deep-dive "Comparing Snapshots" section (150+ lines) with visual layers, change detection, patterns, best practices, DO/DON'T guidelines
  - **Use Cases**:
    - Track transformation progress: "Q1 had 28 teams, Q2 added 4 platform teams"
    - Stakeholder communication: Visual before/after for executive presentations
    - Audit trails: Regulatory compliance with visual evidence of changes
    - Pattern recognition: Identify consolidation, platform emergence, team maturation
    - Strategic planning: Forecast future states based on past evolution patterns
- **Vertical Text for Enabling Teams**: Enabling teams now display their name vertically rotated to visually distinguish their temporary/facilitating role
  - Canvas rendering: Teams with type "enabling" display vertical text rotation
  - SVG export: Vertical text preserved in exported SVG files
  - Visual consistency: Both canvas and SVG share same rotation logic
- **Ungrouped Teams Filter**: New "Show Ungrouped Teams" checkbox allows hiding/showing teams without value stream assignments
  - Filter state persisted across view switches
  - SVG export respects filter state (ungrouped teams hidden if filter disabled)
  - Test coverage: Added Playwright E2E test for filtered SVG export
- **Test Coverage Improvements**: Comprehensive test additions across all test suites
  - Frontend: Added tests for filtered SVG export functionality
  - E2E: Added Playwright test validating SVG export with ungrouped filter disabled
  - Test count: 95 total tests (10 backend + 62 frontend + 23 E2E)

### Fixed
- **Height Calculation Consistency**: Fixed all height calculations to use `getTeamBoxHeight()` instead of hardcoded values
  - Bounding box calculations now use actual team heights (80px stream-aligned, 100px complicated-subsystem, 140px enabling)
  - Ungrouped narrow teams positioning fixed to use correct team heights
  - Reduced vertical spacing for wide teams from 100px to 60px (75% of box height for better density)
  - Fixed 4 test failures in height expectations to match new calculation logic

### Changed
- **Upgraded Dependencies**: Updated to latest stable versions
  - FastAPI: 0.115.0 → 0.128.0 (latest)
  - Uvicorn: 0.32.0 → 0.40.0 (latest)
  - PyYAML: 6.0.2 → 6.0.3 (latest)
  - Markdown: 3.10 (already latest)
  - All 35 backend tests still passing ✅

### Added
- **🎉 Evolution Tracking with Snapshots**: Major new feature for tracking Team Topologies transformation over time
  - **The Problem**: Addresses the "static visualization trap" where TT designs are created once and never updated, becoming outdated within months
  - **Create Snapshots**: Capture the current TT Design state as an immutable JSON snapshot
    - Click "📸 Create Snapshot" button (only visible in TT Design view)
    - Modal with name (auto-suggested: "TT Design vX.X - YYYY-MM-DD"), description, and author fields
    - Preview shows team count, value streams, and platform groupings before creating
    - Condensed JSON format (not full markdown) for efficient storage
    - Snapshots saved to `data/snapshots/` directory with timestamp-based IDs
  - **Timeline Browser**: View and navigate all historical snapshots
    - Click "🕐 Timeline" button to open side panel
    - Lists all snapshots sorted by date (newest first)
    - Shows "▶ Current (Live)" for current editable state
    - Each snapshot displays: name, date/time, author, team counts, statistics, and description
    - Click any snapshot to load frozen view
  - **Snapshot View Mode**: Browse historical states in read-only mode
    - Banner shows "📸 Viewing Snapshot: [name] ([date])" at top
    - Canvas becomes fully read-only (no drag-and-drop editing)
    - Panning, zooming, and team details still work
    - "Return to Live View" button switches back to editable current state
  - **Snapshot Statistics**: Each snapshot includes pre-calculated statistics
    - Total teams, team types (stream-aligned, platform, enabling, complicated subsystem)
    - Value stream count, platform grouping count
    - Used for quick filtering and reporting
  - **Git-Friendly Storage**: Snapshots stored as JSON files, trackable in version control
    - `.gitignore` includes commented-out option to exclude snapshots if desired
    - Default: snapshots tracked in git for team-wide audit trail
    - Alternative: gitignore snapshots for personal experimentation
  - **Backend**: 
    - New `backend/snapshot_services.py` module with snapshot creation, listing, and loading
    - New API endpoints: `POST /api/snapshots/create`, `GET /api/snapshots`, `GET /api/snapshots/:id`
    - 6 new Pydantic models: `Snapshot`, `SnapshotMetadata`, `SnapshotTeamCondensed`, `SnapshotStatistics`, `CreateSnapshotRequest`, `SnapshotTeamAPIInfo`
    - Team condensation logic to convert full `TeamData` to storage-efficient format
    - Automatic statistics calculation (team counts, value streams, platform groupings)
    - Snapshot ID generation with timestamp for uniqueness
  - **Frontend**:
    - New `frontend/snapshot-handlers.js` module (370+ lines) handling all snapshot UI
    - Two new toolbar buttons: "📸 Create Snapshot" and "🕐 Timeline" (TT Design view only)
    - Create Snapshot modal with form validation and preview
    - Timeline browser panel with slide-in animation
    - Snapshot view banner with gradient background
    - Read-only mode enforcement in canvas interactions
    - State management: `isViewingSnapshot`, `currentSnapshot`, `snapshotMetadata`
    - 200+ lines of CSS for snapshot UI components
  - **Testing**: 9 comprehensive pytest tests covering snapshot creation, listing, loading, immutability, and accuracy
  - **Documentation**:
    - Extensive "Evolution Tracking with Snapshots" section in `docs/CONCEPTS.md` (250+ lines)
    - Best practices for when to create snapshots (quarterly, milestones, experiments, compliance)
    - Example workflows showing snapshot naming and descriptions
    - Data format explanation with JSON examples
    - Git workflow guidance (tracked vs gitignored snapshots)
    - DO/DON'T guidelines for snapshot usage
    - Future enhancement ideas (comparison view, animated transitions, auto-scheduling)
    - README.md updated with snapshot feature highlight
  - **Use Cases**:
    - Track quarterly transformation progress ("Q1 2026" → "Q2 2026" → "Q3 2026")
    - Show stakeholders "before and after" comparisons
    - Create milestone snapshots for major org changes (team splits, new platforms)
    - Experiment safely (snapshot current state, try changes, revert if needed)
    - Maintain audit trail for regulatory compliance
    - Communicate transformation journey to executives

- **Comprehensive UX Improvements**: Major enhancement to user experience with multiple new features
  - **Multi-Select Filters**: Checkbox-based filter system for value streams and platform groupings
    - Click "🔍 Filters" button to open filter panel
    - Select multiple filters simultaneously (OR logic - show teams matching ANY filter)
    - Filter count badge shows active filter count
    - "Clear All" button to reset filters
    - Auto-align respects filtered teams
  - **Team Search**: Instant search box in sidebar to filter teams by name (Esc to clear)
  - **Zoom Controls**: Visual controls with keyboard shortcuts
    - +/- buttons for zoom in/out
    - Zoom percentage display
    - Fit-to-view button (⊡) centers all teams with optimal zoom (Ctrl+0)
    - Mouse wheel zoom support
    - Keyboard: Ctrl+/- to zoom, Ctrl+0 to fit
  - **Right-Click Panning**: Pan canvas by right-clicking and dragging
  - **Toolbar Reorganization**: Two-row header layout with visual grouping
    - Removed "+Add Team" button (simplification)
    - Controls grouped in bordered boxes with better spacing
    - Zoom controls right-aligned for ergonomic access
    - Inline dividers between related controls
  - **Legend Improvements**: Enhanced visual alignment with dividers between sections
  - **Sidebar Refinements**: 
    - Reduced team list font size (0.85rem) for better density
    - Dynamic team colors loaded from JSON (removed 30+ lines of hardcoded CSS)
  - Technical: Fixed fit-to-view to account for 250px sidebar width

- **Multi-Select Filters with Checkboxes**: Replaced single-select dropdown with modern checkbox-based filter system
  - Click "🔍 Filters" button to open filter dropdown panel
  - Separate sections for Value Streams and Platform Groupings
  - Select multiple filters simultaneously (OR logic within category, AND logic between categories)
  - Filter count badge shows number of active filters
  - Individual "Clear" buttons for each section plus "Clear All" button
  - Updated `state.selectedFilters` to track arrays: `valueStreams[]` and `platformGroupings[]`
  - Updated `getFilteredTeams()` to support multi-select filtering
  - Better UX than single-select dropdown for complex filtering scenarios

- **Team Search in Sidebar**: Quick search box to filter teams by name
  - Added search input at top of sidebar with 🔍 icon
  - Instant filtering as you type
  - Technical: Fixed fit-to-view to account for 250px sidebar width

### Changed
- **Filter Logic**: Changed from AND to OR logic - teams shown if they match ANY selected filter (not all)
- **Team Colors**: Removed 30+ lines of hardcoded CSS, now dynamically loaded from JSON config files
- **Auto-align**: Updated to respect filtered teams in both TT Design and Pre-TT views
- **Code Quality**: Removed all debug console.log statements added during filter debugging

### Fixed
- Filter system not working - teams showing "VS: undefined PG: undefined" (moved from metadata to top-level fields)
- Auto-align ignoring active filters
- Fit-to-view not centering properly (added sidebar width offset calculation)
- Duplicate code in auto-align handlers
- Import errors in renderer.js (switched to state-management.js for getFilteredTeams)

- **File Validation Report**: New validation system to catch errors in team markdown files
  - Created `backend/validation.py` module (161 lines) extracted from `services.py` for better organization
  - API endpoint: `GET /api/validate?view={tt|current}` returns comprehensive validation report
  - Frontend: "✓ Validate Files" button in toolbar with modal display
  - Validation checks:
    - YAML front matter structure (presence, duplicate blocks, valid syntax)
    - Required fields: `name`, `team_type`
    - Valid team_type values against configuration
    - Filename consistency (slug matches team name)
    - Position coordinates (valid numbers)
    - Team size recommendations (5-9 people, warns if outside range)
    - Interaction table format (TT view only)
  - Color-coded results: errors (red) vs warnings (yellow)
  - Summary statistics: total files, valid files, files with warnings/errors
  - Successfully validated 31 files in TT view with detailed issue reporting
  - Fixed 5 files with duplicate YAML front matter errors found by validation
  - Added check to skip hidden directories (`.pytest_cache`, `.git`, etc.) in team parsing
  - Reduced `services.py` from 433 to 291 lines (-33%) through validation extraction
- **Team API Backend Support (Step 1 of 5)**: Enhanced backend to support full Team API structure
  - Added `TeamAPI` submodel in `backend/models.py` for structured Team API fields (purpose, services, contact, SLA, etc.)
  - Extended `TeamData` model with optional Team API fields (roadmap, current_work, software_owned, testing_approach, etc.)
  - Implemented automatic interaction table parsing from Team API markdown content
  - New `_parse_interaction_tables()` function extracts dependencies and interaction modes from "Teams we currently interact with" tables
  - Dependencies and interaction modes now automatically populated from Team API markdown (not stored in YAML)
  - Added 8 comprehensive tests for interaction table parsing (all passing)
  - Backend tests: 25/25 passing (up from 17)

- **Team API UI Display (Step 2 of 5)**: Enhanced modal to display Team API content with rich formatting
  - Upgraded `renderMarkdown()` function with proper table, list, link, and code rendering
  - Added `renderMarkdownTables()` function to parse markdown tables into HTML tables with styling
  - Added `renderMarkdownLists()` function for ordered and unordered list support
  - Auto-linkification of Slack channels (#platform-team), email addresses, and URLs
  - Added comprehensive Team API CSS styling in `frontend/styles.css`:
    - `.team-api-content` styles for headers, paragraphs, lists, code blocks
    - `.team-api-table` styles for interaction tables with hover effects
    - Slack link styling with Team Topologies purple color
    - Improved readability for long descriptions
  - Added 8 tests for markdown rendering concepts (frontend tests: 92/93 passing, up from 84/85)
  - Team detail modal now displays Team API sections with proper formatting:
    - Services provided with bullet lists
    - SLA expectations in formatted text
    - Communication channels with clickable Slack/email links
    - Interaction tables rendered as HTML tables
    - Roadmap and current priorities

- **Team API Content Enrichment (Step 3 of 5)**: Comprehensive content updates across all 28 teams
  - Enriched 18 teams with full Team API content (up from initial 10 teams)
  - Added Team Interaction Tables to all 28 teams following Team API template format
  - Created 4 new teams to improve team topology structure:
    - Security Engineering Enablement Team (Enabling) - Filling security enablement gap
    - Mobile Platform Team (Platform) - Supporting mobile development teams
    - E-commerce Infrastructure Team (Platform) - Backend infrastructure for E-commerce
    - Enterprise Sales Portal Team (Stream-aligned) - Part of Enterprise Sales value stream
  - Restructured team composition to match Team Topologies patterns:
    - 17 stream-aligned teams (60.7% - aligns with recommended 6:1:1 ratio)
    - 7 platform teams (25%)
    - 3 enabling teams (10.7%)
    - 1 complicated subsystem team (3.6%)
  - Implemented pattern examples from Team Topologies 2nd Edition:
    - Mobile Inner Platform Team: Platform team within Value Stream Grouping (mobile experience)
    - API Gateway Platform Team: Stream-aligned team within Platform Grouping (demonstrates flexible topology)
  - All teams now have:
    - Team Interaction Tables with proper columns (Team Name, Interaction Mode, Purpose, Duration)
    - Defined services and SLAs where applicable
    - Communication channels (Slack, email)
    - Dependencies and interaction modes

- **Team API Documentation (Step 4 of 5)**: Added comprehensive Team Interaction Tables guidance to CONCEPTS.md
  - New "Team Interaction Tables" section documents:
    - Standard table format and required columns
    - Interaction mode detection and visualization
    - Rich markdown support in tables
    - Best practices for maintaining tables
    - Examples and syntax
  - Guidance helps users understand how tables drive canvas visualization
  - Documents automatic interaction mode detection and connection rendering

- **Markdown Table Rendering Fix**: Fixed critical bug where markdown tables rendered as raw text in team detail modal
  - Root cause: Regex pattern `|[-: ]+|` didn't include pipe character, failing to match multi-column separator rows like `|-----------|------------------|---------|----------|`
  - Solution: Updated regex to `|[-: |]+|` to allow pipes within separator line
  - Added comprehensive test suite with 7 test cases covering:
    - Simple 2-column tables
    - 4-column tables with multiple pipes in separator
    - Tables with blank lines before them
    - Alignment markers (`:---`, `:---:`, `---:`)
    - Multiple tables in same text
    - Empty cells
  - All 99 frontend tests passing (up from 92)
  - Exported `renderMarkdownTables()` function for testability

### Fixed
- **Critical Bug**: Application no longer corrupts team markdown files when dragging teams on canvas
  - Removed `dependencies: []` and `interaction_modes: {}` from being written to YAML front matter
  - These fields were being added to files every time a team position was updated
  - The write function now only persists template-compliant fields: `name`, `team_type`, `position`, `metadata`, and optional fields like `platform_grouping`, `established`, `cognitive_load`
  - Fields still exist in backend model for runtime use (rendering connections) but are never persisted to files
- **Team Markdown Files**: Comprehensive cleanup and validation of all 23 team files in `data/tt-teams`
  - Fixed 3 files with duplicate YAML front matter blocks (api-gateway, ci-cd, cloud-development platform teams)
  - Fixed 5 files with malformed YAML outside front matter (mobile-app, mobile-platform, observability, payment, security-compliance teams)
  - Removed duplicate content sections in 4 files (data-storage, feature-management, mobile-app-experience, search platform teams)
  - Fixed machine-learning-and-ai-specialists-team.md: changed team_type from `stream-aligned` to `complicated-subsystem` (correct classification), added proper metadata and Team API sections
  - Removed invalid YAML fields from all files (only machine-learning file actually had them in previous commit)
  - All files now strictly conform to Team API base or extended template structure
  - Backend validation tests pass (17/17)
- **E2E Tests**: Updated default view expectations to match "TT Design" as default
  - 4 E2E tests updated to expect TT Design view as default instead of Pre-TT view
  - All 23 E2E tests now passing
  - Test expectations aligned with default view change made previously

### Changed
- Default application view confirmed as "TT Design" (Team Topologies future state)
  - Pre-TT view represents baseline/starting point before transformation
  - E2E tests now reflect this as the expected default behavior

### Added

### Removed
- Audited and updated all team markdown files in `data/tt-teams` to strictly follow the Team API base/extended templates.
- Removed duplicate YAML front matter and ensured only a single, correctly delimited (`---`) YAML block at the top of each file.
- Standardized YAML delimiters across all files.
- Fixed metadata fields (e.g., `team_type`, `established`, `cognitive_load`) for accuracy and template compliance.
- Cleaned up duplicate or conflicting metadata entries.
- No changes to team content or structure beyond template and metadata alignment.

### Changed
- Strict Team API template alignment: All team markdown files now strictly follow the base Team API template section order and structure, including new product thinking sections where relevant.
- Data & ML Platform Grouping and Payment & Fraud Platform Grouping teams updated for template alignment and product thinking.

### Removed
- Unwanted files: EXPERT-REVIEW.md, TT-EXPERT-REVIEW.md, TT-TEAMS-IMPROVEMENT-PLAN.md deleted from working directory and git staging.

### Fixed
- Platform grouping logic: Platform grouping boxes now always render and dynamically resize, even when teams are dragged far apart (removed stale position check).
- 404 errors for teams with special characters in their names (e.g. CI/CD Platform Team) are fixed via slug system.
- Filename consistency: All team markdown files now use the slug format for filenames (e.g. `ci-cd-platform-team.md`).
- URL-safe team names: Both backend and frontend use the same slug logic for team names.
- New backend tests: 3 new tests for URL safety and slug logic (test_url_safe_team_names.py).
- Removed files not intended for commit: EXPERT-REVIEW.md, TT-EXPERT-REVIEW.md, TT-TEAMS-IMPROVEMENT-PLAN.md.

### Fixed
- Platform grouping boxes now always render and dynamically resize, even when teams are dragged far apart (removed stale position check).
- 404 errors for teams with special characters in their names (e.g. CI/CD Platform Team) are fixed via slug system.
- Removed files not intended for commit: EXPERT-REVIEW.md, TT-EXPERT-REVIEW.md, TT-TEAMS-IMPROVEMENT-PLAN.md.
- � **"Undefined" Team Type for Both Views**:
  - Added shared "undefined" team type for teams not yet classified/designed
  - **TT Design view**: Teams not yet designed into one of the 4 fundamental team types (stream-aligned, platform, enabling, complicated-subsystem)
  - **Pre-TT view**: Teams not yet classified into organizational team types
  - Based on official Team Topologies guidance for transformation planning
  - Visual styling:
    - Light gray fill color (`#E8E8E8`) for neutral/uncertain state
    - **Dashed border** (8px dash, 4px gap) with medium gray (`#666666`) - book-accurate
    - Rounded corners (8px radius) matching other team shapes
    - Darker gray border (`#333333`) when selected (no red - maintains neutral appearance)
  - Works in both canvas and SVG export
  - Auto-align treats undefined teams as narrow/ungrouped teams (like enabling and complicated-subsystem)
  - Example teams: `data/current-teams/example-undefined-team.md` and `data/tt-teams/example-undefined-team.md`
  - Use cases: Initial TT assessment, gradual classification during transformation, progress tracking

- �📐 **Book-Accurate Team Shapes in Canvas & SVG Export** (TT Design view):
  - **Enabling teams**: Now render as vertical rounded rectangles (80×120px, tall and narrow orientation)
  - **Complicated-Subsystem teams**: Now render as octagons (8-sided polygon representing internal complexity)
  - Stream-aligned and Platform teams continue using wide horizontal boxes
  - Matches authentic Team Topologies 2nd edition book visualizations
  - Canvas rendering:
    - Enabling: Vertical rectangle with 14px corner radius
    - Complicated-Subsystem: Octagon with chamfered corners (20px corner cuts)
    - Smart hit detection: Octagon shape properly detects clicks/drags in all 8 sides
  - SVG export:
    - Enabling: `<rect>` element with vertical dimensions (rx="14")
    - Complicated-Subsystem: `<path>` element with octagon geometry
    - Connection anchor points automatically adjust to team shape dimensions
  - Pre-TT view continues using standard rectangles for all team types
  - **Dimension refinements** (based on book accuracy and readability testing):
    - Enabling teams: Final dimensions 60×140px (width ~2× stream-aligned height for book accuracy)
    - Complicated-Subsystem teams: Final dimensions 100×100px (compact octagon)
    - Text color: Changed to dark gray (`#222222`) for better readability on lighter team colors
    - Iterative refinement process validated visual accuracy against Team Topologies book

### Changed
- 🎯 **TT Design View Now Default**:
  - Application now opens in "TT Design" view instead of "Pre-TT" (formerly "Current State")
  - Reflects the tool's primary focus on Team Topologies design patterns
  - Users can still toggle to Pre-TT view to see org-chart baseline

- 📝 **View Naming: "Current State" → "Pre-TT"**:
  - Renamed view to better represent baseline before TT transformation
  - Acknowledges that transformation happens over time
  - More accurate for organizations mid-transformation journey
  - Opens door for future variants (SAFe trains, value streams, etc.)

- 🗂️ **File Organization - TT-Prefixed Files**:
  - Renamed TT Design-specific files with `tt-` prefix for clarity:
    - `value-stream-grouping.js` → `tt-value-stream-grouping.js`
    - `platform-grouping.js` → `tt-platform-grouping.js`
    - `value-stream-grouping.test.js` → `tt-value-stream-grouping.test.js`
  - Makes it immediately clear which files are specific to TT Design view
  - Prepares codebase for future subfolder organization

### Fixed
- 🐛 **Platform Grouping Bounding Box with Variable Team Heights**:
  - Fixed platform grouping boxes cutting off taller teams (enabling 140px, complicated-subsystem 100px)
  - Updated `calculateGroupingBoundingBox()` to use actual team height via `getTeamBoxHeight()` instead of fixed 30px
  - Ensures proper spacing below all team types regardless of their dimensions

- 🐛 **Auto-Align Button Visibility on Startup**:
  - Fixed TT Design auto-align button not appearing on initial load (was showing Pre-TT button instead)
  - Updated initialization in `ui-handlers.js` to match new default view (TT Design)
  - Correct controls now shown on startup: TT auto-align button, interaction modes checkbox, grouping filter

- 🐛 **Platform Grouping Bounding Box Overflow**:
  - Fixed issue where platform grouping boxes became oversized after refresh or view switching
  - Root cause: Teams had stale position data from disk (spread 1200+ pixels apart vertically)
  - Solution: Detect vertical spread > 800px and skip rendering until teams properly aligned
  - Prevents visual overlap between groupings
  - Teams positions now correctly recalculated after auto-align

- 🔍 **Backend: Content-Based Team Name Search**:
  - Fixed 404 errors when updating team positions via drag-and-drop
  - Old implementation searched by filename, failed when filenames didn't match team names
  - New implementation parses all team files and matches by `name` field in YAML front matter
  - More resilient to filename variations and manual editing

- 📛 **Filename Consistency**:
  - Fixed 4 team files where filename didn't match team name convention:
    - `platform-team.md` → `aws-developer-platform-team.md`
    - `core-platform-team.md` → `data-storage-platform-team.md`
    - `fraud-detection-risk-modeling-team.md` → `fraud-detection-and-risk-modeling-team.md`
    - `build-integration-team.md` → `build-and-integration-team.md`
  - Added backend tests to enforce naming convention going forward
  - Prevents future 404 errors and improves file discoverability

### Added
- 👁️ **Show Interaction Modes Toggle** (TT Design view):
  - New checkbox to show/hide interaction mode lines (collaboration, X-as-a-Service, facilitating)
  - Default: enabled (lines visible)
  - Allows users to focus on team structure without visual clutter from connection lines
  - Mirrors "Show Communication Lines" checkbox functionality from Current State view
  - SVG export respects toggle state - exported diagrams only include interaction lines if checkbox is enabled
  - Provides consistent UX pattern across both visualization views

### Fixed
- 🎨 **Current State Legend Display**:
  - Restored colored boxes for team types in Current State view legend (were missing)
  - Team type info modals now work correctly in Current State view (click ℹ️ icon)
  - TT Design view continues using book-accurate SVG shapes
  - Current State view uses simple colored boxes with borders matching their team colors
  
- 🎨 **Book-Accurate Team Type Colors** (both views):
  - Updated all team type colors to match Team Topologies book exactly
  - **Stream-aligned**: `#F9E2A0` (light yellow) with `#E3B23C` border
  - **Platform**: `#9ED3E6` (light blue) with `#5BA8C9` border
  - **Complicated Subsystem**: `#F4B183` (light orange) with `#D97A2B` border
  - **Enabling**: `#C5B3E6` (light purple) with `#7A5FA8` border
  - Colors extracted from official Team Topologies 2nd edition materials
- 🔗 **Interaction Mode Legend with Book-Accurate Symbols** (TT Design view):
  - Added visual legend showing 3 interaction modes with book-accurate SVG symbols
  - **Collaboration**: Cross-hatched purple rounded rectangle (lavender `#b7a6d9` with `#7a5fa6` pattern)
  - **X-as-a-Service**: Mirrored bracket glyph (near-black `#222222`, stroke-only)
  - **Facilitating**: Dotted green circle (mint `#9fd0b5` with `#6fa98c` polka dots)
  - SVG symbols embedded inline in HTML legend, scaled for compact display
  - Line colors updated to match interaction mode symbols
  - **Line type visualization**: Each legend item shows actual connection line style beside symbol
    - Collaboration: Solid purple line with arrow
    - X-as-a-Service: Dashed black line with arrow
    - Facilitating: Dotted green line with arrow
  - **Interactive info modals**: Click any interaction mode (ℹ️ icon) to open detailed modal with:
    - Large version of the symbol
    - Full connection line example
    - Team Topologies book description
    - Key characteristics
    - When to use guidelines
  - Hover effects on legend items for better discoverability
- 📚 **Educational Info Modals for All Legend Items**:
  - **Team Types** (4 types): Click any team type in legend to learn:
    - Stream-Aligned: Primary value delivery teams
    - Platform: Internal service providers reducing cognitive load
    - Enabling: Coaching teams that build capabilities
    - Complicated Subsystem: Specialist teams for high-complexity domains
    - Each modal includes: color square, description, characteristics, when to use, examples
  - **Groupings** (2 types): Click any grouping in legend to learn:
    - Value Stream: Groups teams serving same customer journey
    - Platform Grouping: Team-of-teams fractal pattern (TT 2nd edition)
    - Each modal includes: visual representation, TT 2nd edition concepts, examples
  - **Cleaner legend**: Grouping section simplified to just symbol + name + ℹ️
  - **Unified modal system**: All info modals use same clean, consistent design
  - **Learning tool**: Users discover Team Topologies concepts by exploring the legend
- 🔄 **Current State "Actual Comms" Connections**:
  - Current State view now shows simple bidirectional fat arrows from `dependencies` field
  - Gray (`#666666`) 4px lines with arrows on both ends
  - Represents realistic communication patterns, not designed TT interaction modes
  - Separate from TT Design view which shows designed interaction modes
- 🎯 **View-Specific Connection Rendering**:
  - `drawConnections()` now distinguishes between Current State and TT Design views
  - Current State: uses `dependencies` array → "Actual Comms" style
  - TT Design: uses `interaction_modes` object → book-accurate mode styles
  - Implementation keeps concerns separated and data models clear

### Changed
- **Grouping Label Spacing Optimized**: Reduced `labelHeight` from 50px to 35px for better visual balance between grouping labels and first team in TT Design view
- **SVG Export Font Sizes Increased**: Team names now use 16px/18px fonts (up from 12px/14px) to match grouping label proportions (16px) for improved readability in exported SVG files

### Added
- 📐 **Team Topologies Book-Accurate Team Shapes** (TT Design view):
  - **Stream-aligned and Platform teams** now render as wide horizontal boxes (~80% of grouping width)
    - Reflects Team Topologies book visualization: teams supporting "whole flow of change"
    - Stack vertically within groupings to show flow alignment
    - Based on official [Team Topologies Shape Templates](https://github.com/TeamTopologies/Team-Shape-Templates)
  - **Enabling and Complicated Subsystem teams** remain narrow (current size)
    - Grid layout (3 per row) positioned below wide teams
  - **Dynamic width calculation**: `getTeamBoxWidth()` in renderer-common.js
  - **Updated auto-align**: Wide teams stack at 10% margin from left/right, narrow teams in grid below
  - **Click detection** updated to handle variable widths
  - **Connections** now use dynamic team centers (wide teams have wider span)
  - **SVG export** includes value stream and platform groupings as background rectangles
  - **Documentation**: Added "Team Shape Visualization" section to CONCEPTS.md explaining design rationale
  - **Design rationale**: "Stream-aligned and Platform teams will typically be re-sized horizontally" (TT Shape Templates guidelines)
  - 12 unit tests (10 updated + 2 new mixed-team tests) verifying vertical stacking and grid layout
- 📚 **Realistic Example Platform Teams**:
  - **Renamed generic teams** for clarity:
    - "Platform Team" → "AWS Developer Platform Team" (cloud infrastructure, developer tooling)
    - "Core Platform Team" → "Data Storage Platform Team" (PostgreSQL, Redis, Elasticsearch specialists)
  - **New platform teams added**:
    - **Observability Platform Team**: Prometheus, Grafana, OpenTelemetry, distributed tracing
    - **Feature Management Platform Team**: Feature flags, A/B testing, experimentation (inner platform team)
    - **API Gateway Platform Team**: Kong, Istio service mesh, traffic management
  - **New enabling team**:
    - **Security Engineering Enablement Team**: Threat modeling, secure coding, compliance facilitation
  - **New complicated subsystem team**:
    - **Fraud Detection & Risk Modeling Team**: ML-based fraud detection, real-time risk scoring
  - **Platform grouping**: AWS, Observability, and API Gateway teams form "Cloud Infrastructure Platform Grouping"
  - All teams include detailed responsibilities, technologies, interaction patterns, and success metrics
- ⚡ **Auto-align Teams for TT Design View**:
  - One-click automatic positioning of teams within their groupings
  - Organizes teams with book-accurate layout: wide teams stacked, narrow teams in grid
  - Handles ungrouped teams separately in designated area
  - Groupings positioned in rows (2 per row) on canvas
  - New button "⚡ Auto-align Teams" visible only in TT Design view
  - **Implementation**:
    - New `frontend/tt-design-alignment.js` module with `autoAlignTTDesign()` function
    - 10 unit tests covering various scenarios (value streams, platform groupings, ungrouped teams, mixed scenarios)
    - Saves all updated positions to backend via API
    - Pattern similar to Current State auto-align but optimized for grouping-based layout
  - **Use case**: Quickly organize overlapping teams after adding grouping metadata to multiple teams
  - Only realigns teams if position changed >5px (avoids unnecessary API calls)
- 🎯 **Platform Grouping** (Team Topologies 2nd edition fractal pattern):
  - Added visual grouping for platform teams working together as a team-of-teams
  - Very light blue background (rgba(126, 200, 227, 0.15)) to distinguish from individual platform teams
  - Updated platform team color from light blue (#7EC8E3) to darker blue (#4A9FD8) for better differentiation
  - **Unified Groupings Filter dropdown**: Renamed from "Value Stream" to "Groupings" - now supports both:
    - Value Stream filtering (vs:Name format)
    - Platform Grouping filtering (pg:Name format)
    - Organized with optgroups for clear categorization
  - **Legend updated**: "Groupings" section now includes both:
    - Value Stream Grouping (light yellow/orange) - for stream-aligned teams
    - Platform Grouping (very light blue) - for platform team-of-teams
  - **Inner Platform Teams**: Supports platform teams operating within value streams (e.g., Core Platform Team in E-Commerce Experience)
  - **Example data updated**:
    - Core Platform Team: Now an inner platform team within E-Commerce Experience value stream
    - Mobile Platform Team: Now an inner platform team within Mobile Experience value stream
    - Payment Platform Team + Platform Team: Part of "Financial Services Platform Grouping"
  - **Conceptual basis**: Platform Grouping represents multiple platform teams collaborating to provide related capabilities (fractal organizational pattern)
  - New `drawPlatformGroupings()` function in `renderer-common.js` with matching style constants
  - New `frontend/platform-grouping.js` module with helper functions (getPlatformGroupingNames, filterTeamsByPlatformGrouping)
  - CSS classes: `.legend-grouping-box.value-stream` and `.legend-grouping-box.platform`
- 🎯 **Value Stream Visual Grouping** in TT Design view:
  - Subtle light yellow/orange background rectangles group teams by value stream (e.g., "E-commerce Experience", "Mobile Experience")
  - Top-center banner-style labels for each value stream grouping
  - **Value Stream Filter dropdown**: Filter canvas to show only teams from selected value stream
    - Dropdown automatically populated with available value streams
    - Only visible in TT Design view
    - Filters teams, connections, and groupings dynamically
  - **Design decisions**:
    - Used subtle light yellow/orange (rgba(255, 245, 215, 0.4)) instead of gray for better visual distinction from platform groupings
    - Label positioned at top-center per Team Topologies book 2nd edition visualization style
    - Ungrouped teams (no value_stream metadata) intentionally skip visual grouping to avoid clutter
  - **Legend updated**: Shows grouping rectangle indicators with explanations in TT Design view
  - **Implementation**: 
    - `frontend/value-stream-grouping.js` with helper functions (getValueStreamNames, filterTeamsByValueStream)
    - 17 unit tests total (grouping calculation + filtering)
    - `frontend/renderer-value-stream.test.js` with 6 rendering tests
  - Automatic bounding box calculation with 20px padding around team positions
  - Only visible in "TT Design" view, not in "Current State" view
  - **Definition of Done achieved**: ✅ Visual grouping, ✅ Filter by value stream, ✅ Clear visual distinction
- ⚡ **Auto-align Teams** feature: One-click automatic positioning of teams under line managers in org-chart layout (Current State view only)
- **Org-chart style visual hierarchy**: Vertical lines from line managers connect to horizontally-aligned teams
- **current-state-alignment.js** module with comprehensive test coverage (7 tests)
- **Show Communication Lines** checkbox to toggle dependency lines (hidden by default for cleaner org charts)
- **Refresh button** documentation clarification
- Lighter department box colors for better visual hierarchy (#5D6D7E for company, #566573 for departments)
- **Backend modularization**: Split main.py (229 lines) into focused modules:
  - `backend/models.py` - Pydantic data models (TeamData, PositionUpdate)
  - `backend/services.py` - File operations and business logic
  - `backend/routes.py` - FastAPI router with all API endpoints
  - `main.py` - Application setup (now 42 lines)
- **Frontend utility modules**:
  - `frontend/constants.js` - Shared layout constants for consistent positioning
  - `frontend/config.js` - API configuration with getApiUrl helper
  - `frontend/notifications.js` - Unified notification system (showError, showSuccess, showInfo, showWarning)
  - `frontend/layout-utils.js` - Shared position calculation functions

### Changed
- **Team type colors updated** to match Team Topologies book 2nd edition:
  - Stream-aligned: #4A90E2 (blue) → #FF9E4A (orange)
  - Platform: #7ED321 (green) → #7EC8E3 (baby-blue) → #4A9FD8 (darker blue for differentiation from Platform Grouping)
  - Enabling: #F5A623 (orange) → #B57EDC (purple)
  - Complicated Subsystem: #BD10E0 (purple) → #FF8B8B (light red)
  - Value stream grouping background: gray → light yellow/orange (rgba(255, 245, 215, 0.4))
- Team box borders increased from 2px to 3px for better visibility
- Team box width reduced to 144px (from 180px) for improved spacing in org-chart layout
- Communication lines now hidden by default in Current State view (toggle to show)
- Team list items in sidebar made more compact (reduced padding and margins)
- SVG export updated to match canvas rendering (3px borders, 144px width, org-chart lines)
- Renamed company from "LogiTech Solutions" to "FleetFlow Systems" to avoid confusion with real company
- **JavaScript chosen over TypeScript** - Documented decision in README (no build step, simpler for single-maintainer project)
- All magic numbers replaced with LAYOUT constants from constants.js
- Replaced inconsistent alert() calls with notification system
- Backend tests updated to use new module imports

### Fixed
- Build & Integration Team position corrected to align properly under Robert Miller
- Duplicate variable declarations in auto-align button initialization
- Duplicate darkenColor() functions consolidated (3 instances → 1 shared)
- Team box width inconsistency corrected (180px references → 144px everywhere)
- **Code quality improvements**:
  - Removed duplicate `darkenColor()` functions (was in 3 files, now shared from renderer-common.js)
  - Extracted magic numbers to shared constants file (no more hardcoded 180px, 120px, etc.)
  - Fixed team box width inconsistency in alignment logic (now uses correct 144px)
  - All layout calculations now use LAYOUT constants for maintainability

## [1.0.0] - 2025-12-31

### Added
- Initial implementation of Team Topologies Visualizer
- Dual-view canvas: Current State (organizational hierarchy) and TT Vision
- HTML5 Canvas-based interactive visualization with drag-and-drop
- FastAPI backend with REST API endpoints
- Markdown file-based storage with YAML frontmatter
- Configurable team types via JSON (current-team-types.json, tt-team-types.json)
- Organization hierarchy visualization with departments, line managers, and regional structure
- Comprehensive test suite (56 tests total):
  - Backend unit tests (pytest, 10 tests)
  - Frontend unit tests (Vitest, 23 tests)
  - End-to-end tests (Playwright, 23 tests)
- ESLint configuration for JavaScript code quality
- Docker/Podman containerization support
- Example data for fictitious company (LogiCore Systems)
- Documentation (README.md, SETUP.md, CONCEPTS.md)
- Example data for fictitious company (LogiCore Systems)

### Changed
- Refactored frontend from monolithic app.js (694 lines) into 5 modular files
- Anonymized example data (removed potentially identifiable names)

### Technical Details
- Python 3.14.2 with FastAPI 0.115.0
- Vanilla JavaScript (ES6 modules)
- HTML5 Canvas for visualization
- File-based storage (no database)
- Git-friendly markdown format

---

## Release History

_No releases yet. This is the initial development version._
