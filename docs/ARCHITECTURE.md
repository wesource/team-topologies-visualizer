# Architecture

Technical design and implementation details for the Team Topologies Visualizer.

## Technology Stack

See [DEPENDENCIES.md](../DEPENDENCIES.md) for full list of dependencies and rationale.

**Key Technologies**:
- Python 3.10+ with FastAPI (backend)
- Vanilla JavaScript with HTML5 Canvas (frontend)
- pytest, Vitest, Playwright (testing)
- Markdown + YAML (data storage)

## Backend (Python + FastAPI)

Modular architecture with clear separation of concerns:

- **main.py** (42 lines) - Application setup, CORS middleware, router inclusion, static file serving
- **backend/models.py** - Pydantic data models (TeamData, PositionUpdate) for type validation
- **backend/services.py** - File operations and business logic (parse_team_file, write_team_file, find_all_teams, etc.)
- **backend/routes_pre_tt.py** - Pre-TT (Baseline) API endpoints
- **backend/routes_tt.py** - TT Design API endpoints

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
- **renderer-common.js** - Shared rendering utilities (drawTeam, wrapText, darkenColor)
- **renderer-current.js** - Current State org-chart view rendering
- **svg-export.js** - SVG export functionality
- **team-alignment.js** - Auto-align teams functionality

**Why Vanilla JavaScript?**
- No build step required - simplicity for straightforward visualization app
- Direct browser execution - edit and refresh workflow
- Lower learning curve for contributors
- TypeScript was evaluated but added more complexity than value for single-maintainer learning project

## Data Storage

- **Markdown files with YAML front matter** - Human-readable, git-friendly team data
- **JSON configuration files** - Team type definitions with colors and descriptions
- **No database** - Keeps the solution simple and version-control friendly

## Key Technical Decisions

### Backend Modularization

**Why**: Original main.py was 229 lines - too large and hard to maintain

**Solution**: Split into focused modules:
- models.py: Data validation with Pydantic
- services.py: Business logic and file operations
- routes_pre_tt.py / routes_tt.py: API endpoint definitions
- main.py: Application setup (now 42 lines)

**Benefits**: 
- Easier to test individual functions
- Clear separation of concerns
- Simpler imports and dependencies

### Frontend Utility Modules

**Why**: Duplicate code (3 darkenColor functions) and magic numbers throughout codebase

**Solution**: Created shared utility modules:
- constants.js: All layout dimensions centralized
- config.js: API configuration in one place
- notifications.js: Consistent user feedback
- layout-utils.js: Shared position calculations

**Benefits**:
- DRY principle (Don't Repeat Yourself)
- Consistent spacing and positioning
- Easy to adjust layout globally
- Better maintainability

### Team Box Dimensions

**Decision**: 144px × 80px with 3px borders

**Rationale**:
- 144px width provides good text wrapping for team names
- 80px height fits name + metadata without crowding
- 3px borders (increased from 2px) improve visibility
- Consistent sizing across all views

### Communication Lines Toggle

**Decision**: Hidden by default in Current State view

**Rationale**:
- Org-chart view focuses on reporting structure
- Too many dependency lines create visual clutter
- Users can toggle on when needed
- TT Vision view has lines enabled by default (shows interaction patterns)

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
