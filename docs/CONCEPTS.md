# Team Topologies Concepts

A short reference for Team Topologies concepts and how they map to this tool.

For authoritative definitions, see the [Team Topologies book](https://teamtopologies.com/) by Matthew Skelton and Manuel Pais.

## The Tool's Two Views

### Baseline View

Your current organization visualized from multiple perspectives:

- **Hierarchy**: Traditional org chart (reporting lines, departments)
- **Product Lines**: Teams grouped by product/project
- **Business Streams**: Teams grouped by customer-facing value streams

> **🧊 "The Rubik's Cube Principle"**: The same teams look different from different angles, but they're still the same teams.

These perspectives reveal misalignments without changing underlying team data.

**Framework mapping**: If you're using scaled agile frameworks, these perspectives roughly map to:
- **Business Streams** ≈ SAFe "Agile Release Trains" (ARTs) or value streams
- **Product Lines** ≈ SAFe "Solutions" or product portfolios
- **Hierarchy** ≈ Traditional org structure (present in all frameworks)

**Note**: Team Topologies intentionally differs from SAFe/LeSS - the Baseline view helps you document your *current* structure (which may follow SAFe/LeSS patterns), while TT Design shows your *intended* Team Topologies evolution.

### TT Design View

Your intentional Team Topologies design showing:
- Team types (4 types)
- Interaction modes (3 modes)
- Value stream groupings
- Platform groupings

## Communication Lines vs. Interaction Modes

**Baseline uses "Communication Lines":**
- Source: `dependencies` list in YAML
- Meaning: "We coordinate with this team"
- Descriptive (shows current reality)

**TT Design uses "Interaction Modes":**
- Source: `interaction_modes` in YAML
- Meaning: Prescribed interaction pattern
- Prescriptive (shows intended design)

## The 4 Team Types

Colors are configurable in `tt-team-types.json`:

- **Stream-aligned**: Aligned to a single stream of work
- **Platform**: Provides internal services to reduce cognitive load
- **Enabling**: Time-boxed coaching and capability building
- **Complicated Subsystem**: Specialist knowledge for complex domains

### Team Shapes in TT Design

Based on [Team Topologies Shape Templates](https://github.com/TeamTopologies/Team-Shape-Templates):

- **Wide teams** (Stream-aligned, Platform): Span ~80% of grouping width
- **Narrow teams** (Enabling, Complicated Subsystem): Standard width in grids

## The 3 Interaction Modes

- **Collaboration**: High-touch, time-boxed joint delivery (solid purple line)
- **X-as-a-Service**: Low-touch self-service consumption (dashed black line)  
- **Facilitating**: Temporary coaching/enablement (dotted green line)

## Team Files (Markdown + YAML)

Teams are stored as markdown files with YAML front matter:

If you haven’t run into it before: **YAML front matter** is a small YAML “metadata header” at the top of a Markdown file, wrapped between `---` lines. It’s commonly used by static site generators and tools to store structured fields (like `name`, `team_type`, and `position`) separately from the human-readable Markdown content below.

**Markdown** is a lightweight plain-text format for writing structured documents (headings, lists, links, tables) that render nicely in tools like GitHub. If you’re new to it, the [CommonMark quick reference](https://commonmark.org/help/) is a great starting point.

```yaml
---
name: Example Team
team_type: stream-aligned
position:
  x: 100
  y: 200
value_stream: E-Commerce
---

# Team description...
```

### Interaction Tables

TT Design teams can include tables like:

```markdown
| Team Name | Interaction Mode | Purpose | Duration |
|-----------|------------------|---------|----------|
| Platform Team | X-as-a-Service | Deployments | Ongoing |
```

The tool parses these and renders them as interaction lines.

## Optional UI Features

### Cognitive Load

Toggle traffic-light indicators (🟢🟡🔴) to visualize team overload.

### Focus Mode

Click a team to highlight it and its direct relationships, dimming everything else.

### Flow Metrics (DORA)

Add optional metrics to team YAML:

```yaml
metadata:
  flow_metrics:
    lead_time_days: 10
    deployment_frequency: weekly
    change_fail_rate: 0.10
    mttr_hours: 3
```

Shows color-coded health indicators and detailed dashboard.

## Platform Groupings

In TT Design, platform teams can be grouped together to show related foundational capabilities.

**Purpose**: Organize related platform teams that provide cohesive infrastructure or services.

**Visual representation**:
- Rendered as light blue background boxes
- Platform teams positioned inside the grouping
- Typically appear below or separate from value stream groupings

**Relationship to value streams**:
- Platform groupings **serve** multiple value stream groupings
- They sit at a foundational layer (not peers to value streams)
- Provide self-service capabilities via X-as-a-Service interaction mode

**Common examples**:
- **Cloud Infrastructure Platform**: CI/CD, deployment, observability, networking
- **Data Platform**: Storage, pipelines, analytics infrastructure
- **Developer Experience Platform**: Local dev tools, testing frameworks, developer portal

**Sizing guidelines**:
- Most organizations have 1-3 platform groupings total
- Each grouping typically contains 2-6 related platform teams
- Avoid over-siloing - too many platform groupings creates coordination overhead

## Value Stream Groupings

In TT Design, stream-aligned teams can be grouped by value stream:

- Rendered as light yellow/orange background boxes
- Contains teams delivering end-to-end customer value
- Typically 3-8 teams per grouping

## Snapshots

Capture immutable "state at a point in time" for your TT Design:

- Click "📸 Create Snapshot" in TT Design view
- Compare snapshots to visualize evolution
- Stored as JSON in `data/tt-snapshots/`

**Best practice**: Create snapshots quarterly with descriptive names.

## Example Data: LogiCore Systems

The repository includes a fictitious organization to demonstrate transformation concepts.

### The Company

**LogiCore Systems** started in 2015 as a small route optimization tool for local delivery companies. After rapid growth driven by the e-commerce boom, they now serve:

- **B2B Services**: DispatchHub, FleetMonitor, RouteOptix for fleet operators
- **B2C Services**: Driver mobile apps, customer delivery tracking, proof of delivery

### The Challenge

Like many successful startups that scaled quickly, LogiCore faces typical organizational challenges:
- Monolithic architecture with component teams by technology layer
- Handoffs creating delays (Dev → QA → Ops)
- Shared service bottlenecks (Database team blocking everyone)
- Weekly "integration meetings" with 15+ people
- Teams owning too many responsibilities (cognitive overload)

Their baseline structure shows **SAFe/LeSS influence** - they attempted to scale using Agile Release Trains and feature teams, but still struggle with coordination overhead and handoffs.

### The Transformation

**Baseline view** (~22 teams):
- Component teams: Backend Services, Web Frontend, Mobile, QA & Testing
- Platform teams: Database, DevOps & Infrastructure
- Organized by function/technology, not value flow

**TT Design view** (~34 teams):
- **Value streams**: B2B Services, B2C Services with dedicated stream-aligned teams
- **Platform grouping**: Cloud Infrastructure Platform Grouping (CI/CD, Observability, API Gateway, etc.)
- **Enabling teams**: DevOps Enablement, Data Engineering Enablement, Security Compliance
- **Complicated Subsystem**: Route Optimization Platform

**Note**: Team count increased because monolithic teams were split into focused, autonomous teams with clear boundaries.

### Disclaimer

All example data (company/team/product names, technical details, organizational structure) is completely fictitious for demonstration purposes only.

## References

- Team Topologies: https://teamtopologies.com/
- Team API Template: https://github.com/TeamTopologies/Team-API-template
- Team Shape Templates: https://github.com/TeamTopologies/Team-Shape-Templates
- Markdown (CommonMark): https://commonmark.org/
- Conway's Law: https://martinfowler.com/bliki/ConwaysLaw.html
