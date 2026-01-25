# Architecture

Technical design and implementation details for the Team Topologies Visualizer.

## Technology Stack

See [DEPENDENCIES.md](DEPENDENCIES.md) for full list of dependencies and rationale.

**Key Technologies**:
- Python 3.10+ with FastAPI (backend)
- Vanilla JavaScript with HTML5 Canvas (frontend)
- pytest, Vitest, Playwright (testing)
- Markdown + YAML (data storage)

## Backend (Python + FastAPI)

Modular architecture with clear separation of concerns:

- **main.py** - FastAPI app setup, static file serving, router inclusion
- **backend/models.py** - Pydantic models for request/response validation
- **backend/schemas.py** - Schema and domain helpers used by the API and parsers
- **backend/services.py** - File operations and core business logic (team parsing, CRUD)
- **backend/snapshot_services.py** - Snapshot read/write helpers
- **backend/validation.py** - Data validation helpers and endpoints
- **backend/routes_baseline.py** - Baseline (Pre-TT) API routes
- **backend/routes_tt.py** - TT Design API routes
- **backend/routes_schemas.py** - Schema/config routes used by the frontend
- **backend/comparison.py** - Snapshot comparison helpers

## Frontend (Vanilla JavaScript ES6 Modules)

**Core modules**:
- **constants.js** - Shared layout constants (LAYOUT object with dimensions, spacing, offsets)
- **config.js** - API configuration (API_BASE_URL, getApiUrl helper)
- **notifications.js** - Unified notification system (showError, showSuccess, showInfo, showWarning)
- **layout-utils.js** - Shared position calculation functions

**Feature modules**:
- **api.js** - API client layer for backend communication
- **app.js** - Main application orchestration and initialization
- **canvas-interactions.js** - Canvas event handling (drag, zoom, pan, click)
- **state-management.js** - App state + view actions (e.g. fit-to-view)
- **renderer-common.js** - Shared rendering utilities (drawTeam, wrapText, darkenColor)
- **renderer.js** - Main render loop and view orchestration
- **renderer-current.js** - Current State org-chart view rendering
- **baseline-hierarchy-alignment.js** - Baseline view auto-alignment
- **tt-design-alignment.js** - TT Design auto-alignment
- **svg-export.js** - SVG export functionality
- **ui-handlers.js** - UI wiring and event handlers

Additional renderers (e.g. product lines, value streams) live under `frontend/renderer-*.js`.

**Why Vanilla JavaScript?**
- No build step required - simplicity for straightforward visualization app
- Direct browser execution - edit and refresh workflow
- Lower learning curve for contributors
- TypeScript was evaluated but added more complexity than value for single-maintainer learning project

## Data Storage

- **Markdown files with YAML front matter** - Human-readable, git-friendly team data
- **JSON configuration files** - Team type definitions with colors and descriptions
- **No database** - Keeps the solution simple and version-control friendly

## Performance Considerations

This app is optimized for local use and workshops (not massive scale). If you ever need to scale it up (many users / 100+ teams), these are the main levers:

- **Rendering**: avoid unnecessary redraws; keep draw work proportional to what changed
- **Data loading**: cache loaded team data and refresh explicitly
- **Interactions**: keep pan/zoom/drag handlers lightweight

## Future Improvements

Some power-user features already exist (e.g., undo/redo and keyboard shortcuts). Remaining ideas (if you want to grow scope):

- **Mobile support**: Touch-optimized interactions
- **Dark mode**: Alternative color scheme
- **Real-time collaboration**: Multiple users editing simultaneously
- **Alternative storage**: optional DB backend for very large org models

### Technical Debt

- Consider adding integration tests for API endpoints
- Improve error handling in frontend (more specific error messages)
- Add input validation for manual JSON/YAML editing
- Consider adding a proper state management solution if complexity grows
