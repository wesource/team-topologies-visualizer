# Team Topologies Concepts

A short reference for Team Topologies concepts and how they map to this tool.

For authoritative definitions, see the [Team Topologies book](https://teamtopologies.com/) by Matthew Skelton and Manuel Pais.

## The Tool's Two Views

**Why these names?**
- **Baseline** is a reference point for comparison ("where we started / what we’re comparing against"), even if you’re years into adoption.
- **TT Design** is intentionally not a “final target state” — it’s a living design you keep refining.

### Baseline View

Your current organization visualized from multiple perspectives:

- **Hierarchy**: Traditional org chart (reporting lines, departments)
- **Product Lines**: Teams grouped by product/project
- **Business Streams**: Teams grouped by customer-facing value streams

> **"The Rubik's Cube Principle"**: The same teams look different from different angles, but they're still the same teams.

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

Teams are stored as markdown files with YAML front matter.

**Templates**: See [`templates/`](../templates/) directory for annotated examples:
- [`pre-tt-team-template.md`](../templates/pre-tt-team-template.md) - Baseline teams
- [`tt-design-team-api-template-base.md`](../templates/tt-design-team-api-template-base.md) - TT teams (minimal)
- [`tt-design-team-api-template-extended.md`](../templates/tt-design-team-api-template-extended.md) - TT teams (full)

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

Toggle simple green/yellow/red indicators to visualize team overload.

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

**Modeling note**: A platform grouping can include platform teams, enabling teams, and (sometimes) stream-aligned teams that deliver an internal product (e.g., a Developer Portal). The `team_type` should reflect the team’s primary Team Topologies type, not the name of the grouping it sits in.

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

- Click "Create Snapshot" in TT Design view
- Compare snapshots to visualize evolution
- Stored as JSON in `data/tt-snapshots/`

**Best practice**: Create snapshots quarterly with descriptive names.

## Example Data: LogiCore Systems

The repository includes a fictitious organization (**LogiCore Systems**) to demonstrate transformation concepts. The example shows a delivery/logistics tech company transitioning from component teams to Team Topologies design.

Two dataset variants are available:
- **First-step transformation** (~20 teams) - Initial 3-6 months
- **Mid-stage transformation** (~34 teams, default) - More mature design

For the complete story, transformation details, and how to switch between variants, see **[EXAMPLE_DATA.md](EXAMPLE_DATA.md)**.

## References

- Team Topologies: https://teamtopologies.com/
- Team API Template: https://github.com/TeamTopologies/Team-API-template
- Team Shape Templates: https://github.com/TeamTopologies/Team-Shape-Templates
- Markdown (CommonMark): https://commonmark.org/
- Conway's Law: https://martinfowler.com/bliki/ConwaysLaw.html
