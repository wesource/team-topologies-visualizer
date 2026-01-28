# <img src="frontend/rubiks-cube-logo.svg" alt="Rubik's cube" width="36" style="vertical-align: middle;" /> Team Topologies Visualizer

A web app for visualizing team structures using **Team Topologies (TT)** concepts.

Two complementary views:
- **Baseline**: your current/reference structure before Team Topologies transformation
- **TT Design**: your evolving Team Topologies design — a living design you keep refining (team types, interaction modes, groupings)

See [docs/concepts.md](docs/concepts.md#the-tools-two-views) for view details and the Rubik's cube metaphor.

This tool is inspired by **Team Topologies** by Matthew Skelton and Manuel Pais — see https://teamtopologies.com/key-concepts for a summary of key concepts, and more references at the end of this README.

> **Note**: This project was built with extensive AI assistance (GitHub Copilot + Claude). As a non-native Python and JavaScript developer, this AI-driven co-creation approach enabled me to use tools and techniques — including Python tooling/libraries, Canvas rendering, and comprehensive test automation — in ways that would have taken much longer solo.

## Why This Tool?

What I wanted from a tool like this was something that helps when adopting Team Topologies:

- **Consolidate scattered information**: unify team data from slides, docs, and spreadsheets into a structured, git-friendly Markdown format
- **Visualize the baseline**: capture the "before" from multiple perspectives
- **Design the future state**: model team types, interaction modes, and groupings
- **Communicate (and keep evolving) the transition**: make the “before vs after” easy to discuss and iterate on continuously over time (snapshots + git history)

## Screenshots

<div align="center">
  <table>
    <tr>
      <td width="62%" valign="top">
        <a href="docs/screenshots/tt-visualizer-tt-design.png">
          <img src="docs/screenshots/tt-visualizer-tt-design.png" alt="TT Design View" width="100%" />
        </a>
      </td>
      <td width="38%" valign="top">
        <a href="docs/screenshots/tt-visualizer-baseline-hierarchy.png">
          <img src="docs/screenshots/tt-visualizer-baseline-hierarchy.png" alt="Baseline View" width="100%" />
        </a>
        <br/>
        <a href="docs/screenshots/tt-visualizer-tt-comparison.png">
          <img src="docs/screenshots/tt-visualizer-tt-comparison.png" alt="TT Comparison View" width="100%" />
        </a>
      </td>
    </tr>
  </table>
  <em>Click any screenshot to view full size</em>
</div>

## Quick Start

**Note**: This tool was developed on Windows. Command examples use Windows syntax, but macOS/Linux equivalents are shown where they differ (e.g., venv activation).

### Local Python

```bash
# Windows
py -m venv venv
.\venv\Scripts\activate
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload

# Linux/Mac  
source venv/bin/activate
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload
```

Open http://localhost:8000/static/index.html

### Docker/Podman

```bash
docker build -t team-topologies-viz .
docker run -p 8000:8000 -v ./data:/app/data team-topologies-viz
```

Open http://localhost:8000/static/index.html

**Full setup instructions**: See [docs/setup.md](docs/setup.md) for detailed installation, configuration, Docker/Podman options, demo mode, and TT design variants.

## Key Features

### Two Complementary Views
- **Baseline**: Visualize your current organization structure from three perspectives:
  - **Hierarchy**: classic org chart with reporting lines
  - **Product lines**: product lanes + shared/platform teams
  - **Business streams**: swimlanes grouped by business value streams, or what SAFe refers to as ARTs or "trains"
- **TT Design**: Model your target Team Topologies structure with:
  - Four team types (Stream-aligned, Platform, Enabling, Complicated Subsystem)
  - Three interaction modes (Collaboration, X-as-a-Service, Facilitating)
  - Value stream groupings and platform groupings

**Interactive Visualization:**
- Drag-and-drop teams, zoom, pan, fit-to-view
- Auto-align with intelligent positioning based on flow of change
- Open full team information with rendered Markdown
- Export views as SVG for documentation and presentations

**Git as Source of Truth:**
- All team data stored as [Markdown](https://commonmark.org/help/) files with [YAML front matter](docs/concepts.md#team-files-markdown--yaml)
- Version control your team topology evolution with git
- Snapshots capture point-in-time states for comparison
- Side-by-side snapshot comparison shows changes over time
- Team API compatible - aligned to [Team API template](https://github.com/TeamTopologies/Team-API-template)

**Flexible & Validated:**
- Adapt team types, colors, and org structures to your context
- YAML error checking and consistency validation
- Optional cognitive load indicators and DORA-style flow metrics

## Documentation

**Root folder** = quick reference (README, CONTRIBUTING)  
**docs/ folder** = in-depth guides and documentation:

| Document | Description |
|----------|-------------|
| [docs/setup.md](docs/setup.md) | Installation, configuration, Docker/Podman, demo mode, TT variants |
| [docs/usage.md](docs/usage.md) | UI walkthrough (views, dragging/zooming, filters, validation) |
| [docs/concepts.md](docs/concepts.md) | Team Topologies concepts and how they map to the tool |
| [docs/example_data.md](docs/example_data.md) | Example organization, transformation story, dataset variants |
| [docs/auto-align.md](docs/auto-align.md) | Auto-align feature, alignment hints, 3×2 grid layout |
| [docs/development.md](docs/development.md) | Developer workflow, testing, linting |
| [docs/testing.md](docs/testing.md) | Testing guide (pytest, Vitest, Playwright) |
| [docs/architecture.md](docs/architecture.md) | Technical architecture and code structure |
| [docs/dependencies.md](docs/dependencies.md) | Full dependency list and rationale |
| [docs/backlog.md](docs/backlog.md) | Feature ideas and priorities |

## Quick Customization

```bash
# Edit team files
data/baseline-teams/**/*.md   # Baseline teams
data/tt-teams/**/*.md         # TT design teams (or tt-teams-initial/)

# Configure team types and colors
data/baseline-teams/baseline-team-types.json
data/tt-teams/tt-team-types.json
```

Want to understand the team Markdown/YAML structure (or create your own starting from [templates/](templates/))? See [docs/setup.md](docs/setup.md#data-organization).

## Example Data

Includes a fictitious organization (**LogiCore Systems**) to illustrate typical “before vs after” patterns during a Team Topologies adoption.

**Two TT design variants**: Mid-stage transformation (default, ~34 teams) and first-step transformation (optional, ~20 teams) showing realistic progression.

See **[docs/example_data.md](docs/example_data.md)** for the complete story, how to switch variants, and detailed comparison.

**Data Management**: All team data is stored as markdown files in `data/`. Use git for version control and backup - commit regularly to preserve your team topology designs.

**Disclaimer**: All example data (company/team/product names, technical details) is entirely fictitious for demonstration purposes.

## Testing

```bash
# Run all tests (Windows PowerShell)
pwsh ./scripts/run-all-tests.ps1
```

The test suite includes backend (pytest), frontend (Vitest), and E2E (Playwright) tests.

**Detailed test instructions**: See [development.md](docs/development.md#testing) for individual test commands, coverage options, and Windows-specific notes.

## Linting

```bash
# Python (Ruff)
python -m ruff check backend/ tests_backend/ main.py --fix

# JavaScript (ESLint)
cd frontend && npm run lint -- --fix
```

## Technologies

- **Backend**: Python 3.10+, FastAPI
- **Frontend**: HTML5 Canvas, Vanilla JavaScript (no build step)
- **Testing**: pytest, Vitest, Playwright
- **Data**: Markdown with YAML front matter

**Full dependency list and rationale**: See [dependencies.md](docs/dependencies.md)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT License - see [LICENSE](LICENSE).

## Acknowledgments

This tool applies Team Topologies concepts by Matthew Skelton and Manuel Pais.

- Book information and additional resources - https://teamtopologies.com/
- Team API Template: https://github.com/TeamTopologies/Team-API-template
- Team Shape Templates: https://github.com/TeamTopologies/Team-Shape-Templates
