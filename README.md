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
- Limited unit test coverage (UI tests with Playwright in progress)

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

## License

MIT

## References

- [Team Topologies book](https://teamtopologies.com/) by Matthew Skelton and Manuel Pais
- [Team API Template](https://github.com/TeamTopologies/Team-API-template)
- [Scaled Agile Framework (SAFe)](https://scaledagileframework.com/)

### Visualizing Teams

- The canvas displays all teams with color-coded boxes based on their type
- **Drag teams** to reposition them (positions are auto-saved)
- **Double-click teams** to view full details including description, dependencies, and metadata
- **Click teams** in the sidebar to select them
- **Zoom** using mouse wheel
- **Connections** between teams show interaction modes with different line styles

### Adding Teams

1. Click the **"+ Add Team"** button
2. Fill in team details:
   - Name
   - Team Type
   - Description
3. Click **Save**

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

## Current Limitations

This tool is designed as a **simple, lightweight visualization and documentation tool**. The following limitations are intentional to keep the solution maintainable and encourage proper data management:

- **No create/update/delete API**: Team management is done by editing markdown files directly, not through the web UI
- **No authentication**: Not designed for multi-user scenarios or production deployment
- **No database**: File-based storage keeps things simple but limits scalability
- **Manual position management**: Team positions on canvas are saved, but there's no automatic layout algorithm

These limitations make the tool ideal for:
- Small to medium-sized organizations
- Single-user or small team documentation efforts
- Version-controlled team data (Git-friendly markdown files)
- Local development and exploration of Team Topologies concepts

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

## Team Topologies Concepts

### The 4 Fundamental Team Types
- **Stream-aligned** (Blue): Aligned to a single, valuable stream of work (e.g., a specific user journey, product, or feature set)
- **Platform** (Green): Provides internal services to reduce cognitive load of stream-aligned teams (e.g., APIs, infrastructure)
- **Enabling** (Orange): Helps stream-aligned teams overcome obstacles and adopt new technologies (e.g., coaching, mentoring)
- **Complicated Subsystem** (Purple): Deals with complex technical domains requiring specialist knowledge (e.g., ML, video processing)

### The 3 Interaction Modes
- **Collaboration** (Solid red line): Two teams working together for a defined period (high interaction, discovery phase)
- **X-as-a-Service** (Dashed teal line): One team provides a service with minimal collaboration (clear API contract)
- **Facilitating** (Dotted green line): One team helps another team learn or adopt new approaches (enabling team pattern)

### Key Principles
- **Team Cognitive Load**: Limit the amount of responsibility a single team handles
- **Team API**: Clear interfaces between teams (dependencies, communication patterns, responsibilities)
- **Fast Flow**: Optimize for rapid delivery of value to customers
- **Team-first Approach**: Teams are the fundamental unit of delivery, not individuals

## About the Example Data

### Current State: Traditional Team Classifications
The included example (`data/current-teams/`) represents a **fictive traditional organization** that uses common team classification patterns found in scaled agile frameworks like **LeSS (Large-Scale Scrum)**, **SAFe (Scaled Agile Framework)**, and **Spotify model**.

#### Background: De-facto Team Types in Industry
Many organizations classify their engineering teams using patterns like:

- **Feature Teams** (LeSS/Scrum at Scale): Small, cross-functional teams that own and deliver complete product features end-to-end
- **Platform Teams** (SAFe/Spotify): Teams that own shared/core components and maintain the common foundation other teams build on
- **Enabling/Support Teams** (various frameworks): Teams that support other teams with specialized skills, coaching, or specialist work (e.g., architects, testing specialists, documentation)

**Your Current State Should Reflect Your Reality**: The tool is designed to be flexible. Document whatever team classification and organizational structure you currently have, whether it follows SAFe, LeSS, Spotify, or your own custom approach. The value is in visualizing your actual starting point before designing the Team Topologies vision.

#### Example Organization: LogiTech Solutions
For demonstration purposes, this repository includes a fictive company setup:

- **Context**: LogiTech Solutions, a logistics software company
- **Product**: RouteOptix (route optimization and delivery planning)
- **Setup**: Originally structured around 2 Agile Release Trains (ARTs) with SAFe influence
- **Pattern**: "Dual Operating Model" concept (operational hierarchy + agile ways of working)

**Team Type Mapping** (fictional company naming):

| Generic Classification | This Example Uses | Common Alternatives |
|----------------------|------------------|-------------------|
| Feature Team | "Product Team" (Core Product, Web Product, ML Product) | Development Team, Scrum Team, Delivery Team |
| Platform Team | "Platform Team" (Database Platform, Build & Integration) | Shared Services, Foundation Team, Infrastructure Team |
| Enabling/Support Team | "Architecture Team", "Testing Team" | Enablement Team, Center of Excellence, Guild, Chapter |

**Current Issues in Example**:
- ❌ Component teams organized by technology layer (backend, frontend, ML, QA)
- ❌ Heavy dependencies and coordination overhead between teams
- ❌ Handoffs between teams (dev → QA)
- ❌ Unclear team purposes and boundaries
- ❌ Cognitive overload on some teams

**7 Teams in Current State:**
1. Core Product Team (6) - Backend monolith (C++/Python) - *Feature Team*
2. Web Product Team (3) - Frontend (Angular) - *Feature Team*
3. ML Product Team (4) - Data science & ML - *Feature Team*
4. Integration Testing Team (5) - QA - *Enabling/Support Team*
5. Database Platform Team (3) - Oracle/ORM/Flyway - *Platform Team*
6. Build & Integration Team (4) - CI/CD & infrastructure - *Platform Team*
7. Enterprise Architecture Team (3) - Governance & strategy - *Enabling/Support Team*

**Characteristics of this setup:**
- ❌ Teams organized by function, not value stream
- ❌ Heavy dependencies and coordination overhead
- ❌ Handoffs between teams (dev → QA)
- ❌ Unclear team purposes and boundaries
- ❌ Cognitive overload on some teams

### Team Topologies Vision
The TT vision (`data/tt-teams/`) shows how these same capabilities could be reorganized according to Team Topologies principles for better flow and autonomy.

## Disclaimer

**Important**: The example data in this repository (LogiTech Solutions, RouteOptix product, team structures, technical details, etc.) is entirely fictitious and created for demonstration purposes only. The author has never worked in the logistics software industry or domain represented in these examples. All technical details, responsibilities, team sizes, technology stacks, and organizational patterns are made up to provide realistic working examples for learning Team Topologies concepts.

If you recognize patterns similar to your organization, it's because many companies face common organizational challenges - not because this data represents any specific real-world company.

## Customizing for Your Organization

This is a **generic example** suitable for learning and demonstration. To use this for your own organization:

1. **Fork/clone this repository**
2. **Customize team type classifications**: Edit `data/current-teams/current-team-types.json` to match your organization's team categories
   - Define your own team type IDs (e.g., "feature-team", "platform-team", "support-team")
   - Set colors that make sense for your context
   - Write descriptions that reflect your organizational language
3. **Document current state**: Replace team markdown files in `data/current-teams/`
   - Use your actual team names and structures
   - Document reporting lines (line_manager field)
   - Capture real dependencies
4. **Design TT vision**: Customize `data/tt-teams/tt-team-types.json` if needed (default uses standard TT colors)
   - Create target team structures in `data/tt-teams/`
   - Define interaction modes between teams
5. **Iterate**: Use the visualization to communicate and refine the transformation

### Customizing Team Types

Both views support customizable team type definitions via JSON configuration:

**File**: `data/current-teams/current-team-types.json` or `data/tt-teams/tt-team-types.json`

```json
{
  "team_types": [
    {
      "id": "your-team-type-id",
      "name": "Display Name",
      "description": "What this team type means in your context",
      "color": "#hexcolor"
    }
  ]
}
```

- **id**: Used in team markdown files (`team_type: your-team-type-id`)
- **name**: Displayed in the legend
- **description**: Shown as tooltip on hover
- **color**: Hex color for the team boxes on canvas

The tool is designed to help facilitate conversations about:
- Where are our current bottlenecks?
- Which teams have too much cognitive load?
- How can we reduce dependencies?
- What team types do we need?
- How should teams interact?

## Use Cases

### Organizational Assessment & Discovery
This tool supports the **"sensing organization"** approach from Team Topologies:

- **Consolidate fragmented information** - Gather team data scattered across PowerPoints, wikis, SharePoint, etc. into one coherent view
- **Create single source of truth** - Document current team structures, dependencies, and interaction patterns
- **Facilitate informed discussions** - Use visualization to align stakeholder understanding
- **Identify pain points** - Make bottlenecks, handoffs, and cognitive overload visible

### Team Topologies Adoption Pattern
Follows the recommended **incremental adoption approach**:

1. **Start with one value stream** - Document and optimize one product area first
2. **Document current reality** - Understand "as-is" before designing "to-be"
3. **Design TT vision** - Collaborate with architects, product managers, and teams
4. **Identify platform needs** - Determine what shared capabilities are needed
5. **Prove the concept** - Show value in one area before expanding
6. **Scale gradually** - Extend patterns to other value streams

This approach is recommended by the Team Topologies authors as a way to reduce risk and build organizational buy-in through demonstrated success.

### Transformation Planning
- Plan incremental changes rather than big-bang reorganizations
- Visualize both current and future states to communicate the journey
- Track progress over time as teams evolve
- Identify which platform services are needed to enable stream-aligned teams

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

## Current Limitations & Roadmap

### Not Yet Implemented

**Hierarchical Visualization for Current State**
- The current view should show an **org chart style** with reporting lines to managers
- Similar to the "actual lines of communication" diagram in the Team Topologies book
- Should visually group teams by line manager
- Currently shows team dependencies but not organizational hierarchy

**Manager Groupings**
- Marcus Thompson manages 3 product teams (Core, Web, ML)
- Robert Miller manages 2 platform teams (Database, Build & Integration)
- Visual indication of these reporting structures needs to be added

**Additional Features Planned**
- Timeline/history view showing organizational evolution
- Export diagrams as PNG/SVG
- Cognitive load indicators per team
- Team health metrics visualization

### Known Issues
- Some team markdown files may have naming inconsistencies
- SAFe context (2 ARTs, dual operating model) is mentioned but not fully detailed
- Current state visualization treats dependencies like TT interactions (should show hierarchy instead)

## Development

The server runs with hot-reload enabled, so changes to Python files will automatically restart the server.

For frontend changes, simply refresh your browser (hard refresh with Ctrl+Shift+R to bypass cache).

## Contributing

Contributions are welcome! This tool is designed to be extended and customized. Ideas for enhancements:
- Additional visualization layouts (hierarchical tree, circle packing)
- Team health indicators and metrics
- Export diagrams as images or PDF
- Import/export team data
- Timeline view showing evolution over time
- Cognitive load visualization

## References

### Team Topologies Resources
- [Team Topologies book](https://teamtopologies.com/) by Matthew Skelton and Manuel Pais
- [Team API Template](https://github.com/TeamTopologies/Team-API-template)
- [Team Topologies adoption guidance](https://teamtopologies.com/key-concepts) - Recommends starting with one value stream
- [Sensing Organizations](https://teamtopologies.com/blog) - Understanding current state before transformation

### Related Frameworks
- [Scaled Agile Framework (SAFe)](https://scaledagileframework.com/)

### Key Blog Posts & Talks
- Matthew Skelton: "Start with sensing the organization" - assess current state first
- Manuel Pais: "Team-first thinking" - teams as fundamental units of delivery
- Team Topologies community: Incremental adoption patterns and case studies

## License

This project is open source and available under the MIT License.

---

**Note**: This is a generic example with fictive data. The "Current State" represents a SAFe-inspired organization structure for demonstration purposes. Adapt the data to your own organization's context for real-world use.

This project is open source and available under the MIT License.

## References

- [Team Topologies book](https://teamtopologies.com/)
- [Team API Template](https://github.com/TeamTopologies/Team-API-template)
