# Usage Guide

This guide focuses on how to use the UI once the app is running.

- Setup/run instructions: see [SETUP.md](SETUP.md#running-the-application)
- Team file format: see [SETUP.md](SETUP.md#data-organization)

## Switching Between Views

Use the radio buttons in the header to switch between:

- **Baseline**: visualizes your current organization from three perspectives:
  - **Hierarchy**: classic org chart (line managers, departments)
  - **Product Lines**: vertical product lanes + a shared teams row
  - **Business Streams**: swimlanes grouped by business streams (nested products)
- **TT Design**: visualizes your Team Topologies design (team types + interaction modes)

**Perspective Selector** (Baseline only):

- Located below the main view toggle
- Switches between **Hierarchy / Product Lines / Business Streams**
- Same teams, different visual groupings
- Useful to spot misalignments between reporting structure, products, and business streams

## Visualizing Teams

- The canvas displays teams as color-coded boxes (based on team type)
- **Drag teams** to reposition them (positions are auto-saved)
  - Dragging is available in **Baseline → Hierarchy** and **TT Design**
  - Product Lines / Business Streams are layout views, so dragging is disabled there
- **Double-click teams** to view full details (rendered Markdown)
- **Click teams** in the sidebar to select them
- **Zoom** using the mouse wheel
- **Refresh** reloads team markdown files + config from disk (keeps your current zoom/pan)

### Connection Lines

- **Show Communication Lines** (Baseline view): toggles dependency/coordination lines
  - Hidden by default for a cleaner hierarchy/org chart
  - These are organic dependencies that exist today
- **Show Interaction Modes** (TT Design view): toggles interaction mode lines
  - These are designed interaction modes, not organic dependencies

## Validating Team Files

After manually editing team markdown files, use validation to catch issues before they cause rendering/API problems:

1. Click **Validate Files** in the toolbar
2. Review the report (summary + per-file issues)
3. Fix issues in the markdown files
4. Re-run validation to confirm

Common checks include:

- YAML syntax errors or duplicate front matter blocks
- Missing required fields (e.g., `team_id`, `name`, `team_type`, `position`)
- Invalid `team_type` values (must match the relevant `*-team-types.json`)
- Filename mismatches (e.g., file named `team.md` but team name is "Platform Team")
- Invalid position coordinates
- Team size outside the recommended range (5–9 people)
- Malformed interaction tables (TT view only)

Validation endpoints:

- Baseline view: `GET /api/validate?view=current`
- TT Design view: `GET /api/validate?view=tt`

## Creating Teams from Templates

See [SETUP.md](SETUP.md#using-team-templates) for the available templates and the recommended copy → edit → validate workflow.

For a deeper overview of the team file format, see [concepts.md](concepts.md).