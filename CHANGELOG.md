# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- ⚡ **Auto-align Teams** feature: One-click automatic positioning of teams under line managers in org-chart layout (Current State view only)
- **Org-chart style visual hierarchy**: Vertical lines from line managers connect to horizontally-aligned teams
- **team-alignment.js** module with comprehensive test coverage (7 tests)
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
