# Team Topologies Visualizer

A web app for visualizing organizational team structures using **Team Topologies (TT)** concepts, to help you plan and communicate your organization's transformation journey.

Supports two complementary views:
- **Baseline**: your baseline reference point (typically pre-TT), captured from multiple perspectives: hierarchy, product lines, business streams — e.g., value streams / SAFe “trains”
- **TT Design**: your Team Topologies design (team types + interaction modes + groupings)

**View naming (why “Baseline” and “TT Design”?)**

- **Baseline** is a reference point for comparison. Even years into a TT adoption, it’s still useful as the “where we started / what we’re comparing against”.
- **TT Design** is intentionally not a “final target state” — it’s a living design you keep refining over time.

> **Note**: This project was built with AI assistance to explore Team Topologies hands-on and experiment with webapp development in VS Code.

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

### Local Python

```bash
# Windows
py -m venv venv
.\venv\Scripts\activate
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload
```

Open http://localhost:8000/static/index.html

### Docker/Podman

```bash
# Build
docker build -t team-topologies-viz .
# or with Podman
podman build -t team-topologies-viz .

# Run (Linux/Mac)
docker run -p 8000:8000 -v ./data:/app/data team-topologies-viz

# Run (Windows PowerShell with Podman)
podman run -p 8000:8000 -v ${PWD}/data:/app/data team-topologies-viz
```

The `-v` flag mounts your local `data/` directory for editing team files outside the container.

Open http://localhost:8000/static/index.html

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

- **[docs/SETUP.md](docs/SETUP.md)**: Installation, configuration, API reference, customization
- **[docs/CONCEPTS.md](docs/CONCEPTS.md)**: Team Topologies concepts and how they map to the tool
- **[DEVELOPMENT.md](DEVELOPMENT.md)**: Developer workflow and testing

## TT Design Variants

The repo includes two example TT designs:

- **Mid-Stage Transformation** (default): [data/tt-teams/](data/tt-teams/)
- **First-Step Transformation** (optional): [data/tt-teams-initial/](data/tt-teams-initial/) (see [data/tt-teams-initial/README.md](data/tt-teams-initial/README.md))

To switch variants via `TT_TEAMS_VARIANT`, see [docs/SETUP.md](docs/SETUP.md#tt-design-variants).

## Quick Customization

```bash
# Edit team files
data/current-teams/**/*.md    # Baseline teams
data/tt-teams/**/*.md         # TT design teams (or tt-teams-initial/)

# Configure team types and colors
data/current-teams/current-team-types.json
data/tt-teams/tt-team-types.json
```

## Example Data

Includes a fictitious organization (**LogiCore Systems**) - a logistics software company that grew from a small route optimization startup to serving both B2B (fleet operators) and B2C (drivers/customers) markets.

**Baseline view** shows their pre-transformation structure with typical scaling anti-patterns:
- Component teams organized by technology (Backend, Frontend, Mobile, QA)
- Handoffs between teams (Dev → QA → Ops)
- Shared service bottlenecks (Database team everyone waits for)
- ~22 teams with unclear boundaries and coordination overhead

**TT Design view** shows reorganization using Team Topologies principles:
- Stream-aligned teams for B2B Services and B2C Services value streams
- True platform teams providing self-service capabilities
- Enabling teams for capability building
- ~34 teams with clear ownership and reduced dependencies

**Disclaimer**: All example data (company names, products, technical details) is entirely fictitious for demonstration purposes.

## Testing

```bash
.\run-all-tests.ps1               # Run all tests
.\venv\Scripts\python.exe -m pytest tests_backend/ -v   # Backend only
cd frontend; npm test             # Frontend only
cd tests; npx playwright test     # E2E only
```

**Test Coverage**: 544 total tests (133 backend + 329 frontend + 82 E2E)

## Linting

```bash
# Python (Ruff)
python -m ruff check backend/ tests_backend/ main.py --fix

# JavaScript (ESLint)
cd frontend
npm run lint -- --fix
```

## Technologies

- **Backend**: Python 3.8+, FastAPI, PyYAML, Markdown
- **Frontend**: HTML5 Canvas, Vanilla JavaScript (no build step)
- **Testing**: pytest, Vitest, Playwright
- **Data Format**: Markdown with YAML front matter

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT License - see [LICENSE](LICENSE).

## Acknowledgments

This tool applies Team Topologies concepts by Matthew Skelton and Manuel Pais.

- Book information and additional resources - https://teamtopologies.com/
- Team API Template: https://github.com/TeamTopologies/Team-API-template
- Team Shape Templates: https://github.com/TeamTopologies/Team-Shape-Templates
