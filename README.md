# Team Topologies Visualizer

A web application for visualizing and comparing organizational team structures. Visualize both your **current organizational state** and your **Team Topologies vision** side-by-side to plan and communicate transformation initiatives.

> **Note**: This codebase was generated with AI assistance (GitHub Copilot / Claude Sonnet 4) as a learning project. Python and related technology choices were made as an opportunity to explore and learn these tools hands-on.

## Quick Start

### Option 1: Local Python

1. **Setup**
   ```bash
   # Windows
   py -m venv venv
   .\venv\Scripts\activate
   pip install -r requirements.txt
   
   # Linux/Mac
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Run**
   ```bash
   # With activated venv
   python -m uvicorn main:app --reload
   
   # Or direct path (Windows)
   .\venv\Scripts\python.exe -m uvicorn main:app --reload
   ```

3. **Open** http://localhost:8000/static/index.html

### Option 2: Docker/Podman

1. **Build**
   ```bash
   docker build -t team-topologies-viz .
   # or with Podman
   podman build -t team-topologies-viz .
   ```

2. **Run**
   ```bash
   docker run -p 8000:8000 -v ./data:/app/data team-topologies-viz
   # or with Podman
   podman run -p 8000:8000 -v ./data:/app/data:z team-topologies-viz
   ```

3. **Open** http://localhost:8000/static/index.html

The `-v` flag mounts your local `data/` directory so you can edit team files outside the container.

See [SETUP.md](docs/SETUP.md) for detailed installation and configuration instructions.

## Why This Tool?

When adopting Team Topologies, organizations need to:
- **Visualize the current state** - Show how teams are currently organized (often by reporting lines, not value streams)
- **Design the future state** - Plan Team Topologies patterns (stream-aligned, platform, enabling, complicated subsystem)
- **Communicate the transition** - Help stakeholders understand the "before and after"
- **Track progress** - Document the evolution over time

This tool provides dual visualizations to make these conversations easier.

## Key Features

- 📊 **Interactive Canvas** - Drag-and-drop teams, zoom, pan
- 🔄 **Dual Views** - Toggle between "Current State" and "TT Vision"
- 📝 **Git-Friendly Storage** - Teams stored as markdown files with YAML front matter
- 🎨 **Customizable Team Types** - Define your own team classifications and colors via JSON config
- 🏢 **Organizational Context** - Line managers, departments, reporting structures
- 🔍 **Team Details** - Double-click for full team information with rendered markdown
- 📋 **Team API Compatible** - Uses Team Topologies Team API template format
- 📥 **SVG Export** - Export visualizations to SVG for presentations and documentation
- 👁️ **Connection Toggle** - Hide/show communication lines in current state view for clarity

## Design Philosophy

### Structured Yet Simple
- Gather organizational data in a **structured but simple way**
- Easy visualization without complex database setup
- Focus on making data collection painless

### Version Control Friendly
- **Markdown files with YAML front matter** - easy to edit, review, and track changes
- Git-friendly format shows exactly what changed over time
- Human-readable without special tools

### Customizable
- Minimal dependencies (FastAPI, PyYAML, Markdown)
- Easy to fork and adapt for your organization
- Configurable team types and colors via JSON

## Project Structure

```
.
├── main.py                     # FastAPI backend
├── requirements.txt
├── frontend/                   # HTML5 Canvas + vanilla JS
│   ├── index.html
│   ├── styles.css
│   ├── api.js                 # API client layer
│   ├── app.js                 # Main application logic (current view)
│   ├── app-new.js             # TT vision view logic
│   ├── canvas-interactions.js # Canvas event handling
│   ├── renderer-common.js     # Shared rendering utilities
│   └── renderer-current.js    # Current state rendering
├── data/
│   ├── current-teams/         # Your current state
│   │   ├── current-team-types.json    # Team type config
│   │   └── *.md               # Team files
│   └── tt-teams/              # Your TT vision
│       ├── tt-team-types.json         # Team type config
│       └── *.md               # Team files
└── docs/
    ├── SETUP.md               # Detailed setup & configuration
    └── CONCEPTS.md            # TT concepts & example explanation
```

## Documentation

- **[SETUP.md](docs/SETUP.md)** - Installation, configuration, API reference, customization guide
- **[CONCEPTS.md](docs/CONCEPTS.md)** - Team Topologies concepts, example data explanation, use cases

## Quick Customization

1. **Edit team type definitions**: `data/current-teams/current-team-types.json`
2. **Add/edit teams**: Create or modify `*.md` files in `data/current-teams/` or `data/tt-teams/`
3. **Configure colors**: Update the `color` field in team type configs
4. **Drag teams on canvas**: Positions auto-save

See [SETUP.md](docs/SETUP.md) for detailed customization instructions.

## Current Limitations

- No create/update/delete via UI (intentional - edit markdown files directly)
- No authentication (single-user tool)
- No database (file-based storage)
- No automatic layout algorithm

These limitations keep the tool simple and git-friendly. Perfect for:
- Small to medium organizations
- Documentation and visualization
- Version-controlled team data
- Local exploration of Team Topologies

## Future Enhancements

### Architecture Visualization with Conway's Law
Integrate draw.io (or similar) based architecture diagrams to show:
- **Current technical architecture** alongside current organizational structure
- **Future technical architecture** alongside Team Topologies vision
- **Conway's Law relationships** - visual connections showing how team boundaries align (or misalign) with system boundaries
- **Transformation roadmap** - how organizational changes enable architectural changes and vice versa

This would help teams:
- Identify Conway's Law violations (team boundaries cutting across system boundaries)
- Plan aligned organizational and architectural transformations
- Communicate the relationship between team structure and system design
- Visualize the impact of Team Topologies patterns on technical architecture

## Example Data

The repository includes a **fictitious organization** (LogiTech Solutions) for demonstration:
- 7 teams in traditional structure (Current State)
- SAFe/LeSS-inspired team classifications
- TT vision showing reorganized structure

**Disclaimer**: All example data is entirely fictitious. The author has never worked in the logistics software industry. Technical details are made up for realistic demonstration purposes.

See [CONCEPTS.md](docs/CONCEPTS.md) for detailed explanation of the example organization and Team Topologies concepts.

## Technologies

- **Backend**: Python 3.8+, FastAPI, uvicorn
- **Frontend**: HTML5 Canvas, vanilla JavaScript, CSS
- **Data**: Markdown files with YAML front matter
- **No database required**

## Usage

### Visualizing Teams

- The canvas displays all teams with color-coded boxes based on their type
- **Drag teams** to reposition them (positions are auto-saved)
- **Double-click teams** to view full details including description, dependencies, and metadata
- **Click teams** in the sidebar to select them
- **Zoom** using mouse wheel
- **Connections** between teams show interaction modes with different line styles

### Team Files

Teams are stored as markdown files with YAML front matter. Team types, colors, and descriptions are defined in prefixed configuration files within each view directory.

**Team Type Configuration** (`data/current-teams/current-team-types.json` or `data/tt-teams/tt-team-types.json`):
```json
{
  "team_types": [
    {
      "id": "feature-team",
      "name": "Feature Team",
      "description": "Small, cross-functional teams that own and deliver complete product features end-to-end.",
      "color": "#3498db"
    },
    {
      "id": "platform-team",
      "name": "Platform Team",
      "description": "Teams that own shared/core components and maintain the common foundation.",
      "color": "#27ae60"
    }
  ]
}
```

**Current State teams** (`data/current-teams/`) include:
```yaml
---
name: Core Product Team
team_type: feature-team            # Must match an id from current-team-types.json or tt-team-types.json
line_manager: Marcus Thompson      # Reports to (org hierarchy)
dependencies:
  - Database Platform Team
interaction_modes:
  Database Platform Team: collaboration
position:
  x: 300
  y: 200
metadata:
  size: 6
  department: Engineering
  product: RouteOptix
---

# Team description in markdown...
```

**Team Topologies teams** (`data/tt-teams/`) include:
```yaml
---
name: Mobile App Team
team_type: stream-aligned          # TT team type
dependencies:
  - Platform Team
interaction_modes:
  Platform Team: x-as-a-service    # TT interaction mode
position:
  x: 100
  y: 100
metadata:
  size: 8
---

# Team description in markdown...
```

## API Endpoints

The API provides **read-only endpoints** for visualization purposes:

- `GET /api/teams?view=current` - List all teams in current state
- `GET /api/teams?view=tt` - List all teams in TT vision
- `GET /api/teams/{name}?view=current` - Get a specific team
- `PATCH /api/teams/{name}/position?view=current` - Update team position on canvas (drag-and-drop)

**Note**: Create, update, and delete operations for team data are intentionally not implemented via API. Teams should be managed by editing the markdown files directly in `data/current-teams/` and `data/tt-teams/` folders. The PATCH position endpoint is the only write operation and only updates the x/y coordinates for canvas positioning.

## Testing

The project includes three layers of automated tests to ensure quality during development:

### Backend Unit Tests (Fast)
Tests core Python functions in isolation. Run these frequently during backend development.

```bash
# Run all backend unit tests (with activated venv)
pytest tests_backend/ -v

# Or Windows direct path
.\venv\Scripts\python.exe -m pytest tests_backend/ -v

# With coverage
pytest tests_backend/ --cov=main
```

**Coverage**: 10 tests covering parse_team_file(), get_data_dir(), and data validation
**Speed**: ~0.5s

### Frontend Unit Tests (Fast)
Tests JavaScript modules (wrapText, API functions, etc.) in isolation. Run these during frontend development.

```bash
# From frontend directory
cd frontend
npm test

# Watch mode (re-runs on file changes)
npm run test:watch

# Lint JavaScript files (catches syntax errors)
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

**Coverage**: 23 tests covering renderer-common.js, api.js
**Speed**: ~1.7s
**Linting**: ESLint catches syntax errors, formatting issues, unused variables

### End-to-End Tests (Slow, Comprehensive)
Full application tests using Playwright. Run these before commits to verify everything works together.

```bash
# From tests directory - requires server running on localhost:8000
cd tests
npm test

# Run with UI for debugging
npm run test:ui

# Run specific test file
npx playwright test visualizer.spec.ts
npx playwright test backend-validation.spec.ts
```

**Coverage**: 
- 14 UI/integration tests (application load, view switching, canvas, API integration)
- 9 backend validation tests (data structure, hierarchy validation, API responses)
**Speed**: ~3-5s (23 tests total)

### Test Strategy
- **Unit tests** (backend + frontend): Run frequently, catch issues early (~2s total)
- **E2E tests**: Run before commits, ensure full system works (~5s)
- Focus on fast feedback - unit tests are optimized for speed

## Development

The server runs with hot-reload enabled, so changes to Python files will automatically restart the server.

For frontend changes, simply refresh your browser (hard refresh with Ctrl+Shift+R to bypass cache).

## Example Data

The repository includes a **fictitious organization** (LogiTech Solutions) for demonstration:
- Current state with traditional team structure (7 teams)
- Team Topologies vision showing reorganization
- SAFe/LeSS-inspired classifications in current state

See [CONCEPTS.md](docs/CONCEPTS.md) for detailed explanation of Team Topologies fundamentals and the example organization.

## Technologies

- **Backend**: FastAPI (Python)
- **Frontend**: HTML5 Canvas, Vanilla JavaScript
- **Data Storage**: Markdown files with YAML front matter
- **Visualization**: Interactive canvas with drag-and-drop
- **Dependencies**: uvicorn, pyyaml, markdown

### Why These Technologies?

**Python/FastAPI** was chosen for the backend primarily as a **learning exercise** and for its quick setup. FastAPI provides:
- Easy to get up and running quickly
- Automatic API documentation
- Simple file handling for markdown storage
- Great for prototyping and iteration

**Note**: The implementation may evolve in the future. The architecture is designed to be flexible, and the backend could be replaced with other technologies (Node.js, Go, etc.) while keeping the same file-based storage approach.

**Markdown storage** was chosen for:
- Human-readable and editable
- Git-friendly (easy to track changes)
- No database setup required
- Compatible with Team API template format

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## License

MIT - see [LICENSE](LICENSE) file for details.

## References

- [Team Topologies book](https://teamtopologies.com/) by Matthew Skelton and Manuel Pais
- [Team API Template](https://github.com/TeamTopologies/Team-API-template)
- [Team Topologies Key Concepts](https://teamtopologies.com/key-concepts)
