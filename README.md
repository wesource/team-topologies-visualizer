# <img src="frontend/rubiks-cube-logo.svg" alt="Rubik's cube" width="36" style="vertical-align: middle;" /> Team Topologies Visualizer

A web app for visualizing team structures using **Team Topologies (TT)** concepts.

Two complementary views:
- **Baseline**: your current/reference structure before Team Topologies transformation
- **TT Design**: your target Team Topologies design (team types, interaction modes, groupings)

See [docs/CONCEPTS.md](docs/CONCEPTS.md#the-tools-two-views) for view details and why these names.

This tool is inspired by **Team Topologies** by Matthew Skelton and Manuel Pais — especially the concepts summarized at https://teamtopologies.com/key-concepts (more references at the end of this README).

> **Note**: This project was built with extensive AI assistance (GitHub Copilot + Claude). As a non-native Python and JavaScript developer, this AI-driven co-creation approach enabled me to use tools and techniques — including FastAPI, Canvas rendering, and comprehensive test automation — in ways that would have taken much longer solo.

## Documentation Organization

**Root folder** = quick reference (README, CONTRIBUTING, DEVELOPMENT)  
**docs/ folder** = in-depth guides (SETUP, CONCEPTS, ARCHITECTURE, TESTING)

This keeps the root clean while providing detailed documentation for those who need it.

## Why This Tool?

What I wanted from a tool like this was something that helps when adopting Team Topologies:

- **Consolidate scattered information**: unify team data from slides, docs, and spreadsheets into a structured, git-friendly Markdown format
- **Visualize the baseline**: capture the “before” (pre-TT) from multiple perspectives
- **Design the future state**: model team types, interaction modes, and groupings
- **Communicate (and keep evolving) the transition**: make the “before vs after” easy to discuss and iterate on continuously over time (snapshots + git history)

## Screenshots

<div align="center">
  <a href="tests/screenshots/current-state-view.png">
    <img src="tests/screenshots/current-state-view.png" alt="Baseline View" width="45%" />
  </a>
  <a href="tests/screenshots/tt-vision-view.png">
    <img src="tests/screenshots/tt-vision-view.png" alt="TT Design View" width="45%" />
  </a>
  <br/>
  <em>Baseline (org hierarchy) and TT Design (value streams & platform groupings)</em>
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

**Full setup instructions**: See [docs/SETUP.md](docs/SETUP.md) for detailed installation, configuration, Docker/Podman options, demo mode, and TT design variants.

## Key Features

- **Two views**: Baseline (pre-transformation) and TT design
- **Baseline views** (pre-TT):
  - **Hierarchy**: classic org chart (reporting lines)
  - **Product lines**: product lanes + shared teams
  - **Business streams**: swimlanes grouped by business value streams (e.g., SAFe “trains”)
- **TT model**: team types (Stream-aligned, Platform, Enabling, Complicated Subsystem) + interaction modes (Collaboration, X-as-a-Service, Facilitating)
- **Interactive canvas**: drag-and-drop teams; zoom, pan, fit-to-view
- **Team details**: open full team information with rendered Markdown
- **Groupings (TT 2nd ed.)**: value stream groupings and platform groupings
- **Customizable**: adapt team types/colors and org structures to your context
- **Team API compatible**: Markdown + YAML front matter, aligned to the [Team API template](https://github.com/TeamTopologies/Team-API-template)
- **Snapshots**: save versions of your TT design to track progress over time, compare points in time, and share the journey from “before” to “after”
- **Export**: export to SVG for docs/presentations
- **Quality checks**: validation for YAML errors and basic consistency
- **Optional indicators**: cognitive load and DORA-style flow metrics

## Documentation

- **[docs/SETUP.md](docs/SETUP.md)**: Installation, configuration, demo mode, TT design variants
- **[docs/CONCEPTS.md](docs/CONCEPTS.md)**: Team Topologies concepts and how they map to the tool
- **[DEVELOPMENT.md](DEVELOPMENT.md)**: Developer workflow and testing

## Quick Customization

```bash
# Edit team files
data/current-teams/**/*.md    # Baseline teams
data/tt-teams/**/*.md         # TT design teams (or tt-teams-initial/)

# Configure team types and colors
data/current-teams/current-team-types.json
data/tt-teams/tt-team-types.json
```

Want to understand the team Markdown/YAML structure (or create your own starting from [templates/](templates/))? See [docs/SETUP.md](docs/SETUP.md#data-organization).

## Example Data

Includes a fictitious organization (**LogiCore Systems**) to illustrate typical “before vs after” patterns during a Team Topologies adoption.

- **Baseline view**: a pre-transformation structure with common scaling pain (technology component teams, handoffs, shared-service bottlenecks)
- **TT Design view**: a Team Topologies-inspired design with stream-aligned teams, platform capabilities, enabling support, and clearer ownership

More context and details: [docs/CONCEPTS.md](docs/CONCEPTS.md#example-data-logicore-systems)
**Data Management**: All team data is stored as markdown files in `data/`. Use git for version control and backup - commit regularly to preserve your team topology designs.
**Disclaimer**: All example data (company/team/product names, technical details) is entirely fictitious for demonstration purposes.

## Testing

```bash
# Run all tests (Windows PowerShell)
pwsh ./scripts/run-all-tests.ps1
```

The test suite includes backend (pytest), frontend (Vitest), and E2E (Playwright) tests.

**Detailed test instructions**: See [DEVELOPMENT.md](DEVELOPMENT.md#testing) for individual test commands, coverage options, and Windows-specific notes.

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

**Full dependency list and rationale**: See [DEPENDENCIES.md](DEPENDENCIES.md)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT License - see [LICENSE](LICENSE).

## Acknowledgments

This tool applies Team Topologies concepts by Matthew Skelton and Manuel Pais.

- Book information and additional resources - https://teamtopologies.com/
- Team API Template: https://github.com/TeamTopologies/Team-API-template
- Team Shape Templates: https://github.com/TeamTopologies/Team-Shape-Templates
