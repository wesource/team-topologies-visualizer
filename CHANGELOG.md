# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- 📐 **Book-Accurate Team Shapes in Canvas & SVG Export** (TT Design view):
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
- Example data for fictitious company (FleetFlow Systems)
- Documentation (README.md, SETUP.md, CONCEPTS.md)

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
