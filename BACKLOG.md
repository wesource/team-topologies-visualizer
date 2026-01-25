# Team Topologies Visualizer - Backlog

This is the public backlog for ideas, priorities, and possible improvements.

**Status**: Pre-release v1.0 development  
**Last updated**: 2026-01-24

## How to use this backlog

- **Now**: what I personally want to prioritize next (short list)
- **Next**: good candidates after the Now list
- **Later / Maybe**: longer-term ideas and experiments
- For contribution ideas, look for items that are small, well-scoped, and testable.

## Now (top priorities)

Edit this list as your priorities change:

- **Interaction Mode Filtering**: Add UI filters to show/hide specific interaction modes:
  - Filter by X-as-a-Service (show only platform consumption)
  - Filter by Collaboration (show only collaborative relationships)
  - Filter by Facilitating (show only temporary enabling relationships)
  - Toggle individual or combinations of modes
  - Reduce visual clutter when analyzing specific interaction patterns
- **Flow-Aware Auto-Align**: Improve `autoAlignTTDesign()` to consider:
  - Optional `align_hint_x` metadata field (values: left, center, right) for horizontal positioning within groupings
  - Optional `align_hint_y` metadata field (values: top, bottom) for vertical positioning of groupings
  - Both fields are optional - defaults work for most cases
  - Defaults based on team_type: platform→left, stream-aligned→right
  - Defaults based on grouping: platform_grouping→bottom, value_stream→top
  - Philosophy: "algorithm makes best guesses, user provides hints only when needed"
  - For precise positioning: users just drag teams manually on canvas- Data modeling: keep narrative text separate from resolvable relationship targets (Baseline dependencies + TT interaction tables)
	- Ensure `dependencies` and `interaction_modes` reference real teams only (no pseudo-targets like “All platform teams”).
	- Store narrative/context separately (e.g., `dependency_notes` already exists; consider an equivalent for interaction mode notes if needed).
- UX/visual clarity improvements (reduce clutter, better defaults, better affordances)
- Documentation: keep setup + modeling guides short and drift-resistant

- Release readiness: 1.0 housekeeping
	- Bump version to `1.0.0` (wherever the canonical version lives) and create a git tag/release.
	- Sanity-check demo mode end-to-end (read-only behavior + banners + snapshot compare) against the current example dataset.

## Completed

- ✅ **DONE (2026-01-25)** UI-driven validation rule visibility using Pydantic schemas
	- ✅ Created Pydantic models for all 4 config file types (baseline-team-types, products, business-streams, organization-hierarchy)
	- ✅ Added `/api/schemas` endpoint exposing full JSON Schema with field constraints and descriptions
	- ✅ Updated validation to use Pydantic for config file validation (returns structured field-level errors)
	- ✅ Enhanced validation modal to display config errors separately with field paths
	- ✅ Created schema viewer modal showing field requirements, types, constraints, and examples
	- ✅ Added 6 backend tests for schema validation (all passing)
	- **Benefit**: Self-documenting data format - users can now see exactly what fields are required/optional and what constraints apply
- ✅ **DONE (2026-01-24)** Terminology unification: Renamed all "Pre-TT/current-teams" references to "Baseline/baseline-teams"
	- ✅ Backend: renamed `routes_pre_tt.py` → `routes_baseline.py`, updated API paths `/api/pre-tt/*` → `/api/baseline/*`
	- ✅ Data: renamed `data/current-teams/` → `data/baseline-teams/`, config file `current-team-types.json` → `baseline-team-types.json`
	- ✅ Frontend: updated all API calls, comments, and variable names to use "baseline" terminology
	- ✅ Tests: renamed E2E test files, updated all endpoint paths and test descriptions (82 E2E tests)
	- ✅ Screenshots: renamed all test screenshots from `pre-tt-*` to `baseline-*`
	- ✅ Comments: updated all Python docstrings and comments to use "Baseline" instead of "Pre-TT"
	- **Result**: Eliminated confusion - now using "Baseline" consistently everywhere in code, docs, and UI
- ✅ **DONE (2026-01-25)** Stable team IDs: introduced mandatory `team_id` in YAML everywhere (replaced name-based references in API)
	- ✅ Data model: added `team_id` to TeamData model; enforced uniqueness and slug-safe format
	- ✅ Validation: fail if `team_id` is missing/duplicate/invalid format; parse_team_file validates on every load
	- ✅ Templates + examples: updated all 3 templates; migrated all 41 team files
	- ✅ Migration helper: created `scripts/migrate_add_team_ids.py` with dry-run mode
	- ✅ API routes: updated to use `team_id` parameter instead of name (BREAKING CHANGE)
	- ✅ Frontend: updated to use team_id for all API calls and position updates
	- ✅ Tests: added 16 new team_id tests; fixed all 212 backend + 346 frontend tests
	- **Cleanup opportunities** (optional future work):
		- Consider deprecating `find_team_by_name_or_slug()` and `find_team_by_name()` (no longer used)
		- Consider updating `write_team_file()` to use team_id for filename instead of slug (currently unused)
		- Update `dependencies` and `interaction_modes` arrays to use `team_id` instead of names
		- Add backward-compat warnings when name-based references are detected

## Next
- **Improved auto-align in TT Design view** (PRIORITY: Better default positioning)
	- **Problem**: Current auto-align doesn't consider Team Topologies visual conventions when positioning teams and groupings
	- **Solution**: Simple, pragmatic auto-align improvements with optional user hints
	- **Implementation**:
		1. Add optional `alignment_hint` field to team metadata for positioning hints
		2. Auto-align uses best-guess logic based on:
		   - Grouping type (`value_stream` vs `platform_grouping`)
		   - Team type (`platform`, `stream-aligned`, etc.)
		   - Optional `alignment_hint` when user wants to override defaults
		3. Keep it simple: let users express intent, algorithm does its best
	- **Alignment hint values** (all optional):
		- `top | bottom` - for grouping vertical positioning
		- `left | center | right` - for team horizontal positioning within grouping
		- Combined format: `bottom-left`, `top-right`, etc.
		- Or just `left`, `right` if vertical doesn't matter
	- **Benefits**: 
		- Simple and flexible - doesn't over-prescribe "the right way"
		- Users can override defaults when needed
		- Algorithm learns from real usage patterns
		- Easy to understand and document
	- **References**: 
		- Team Shape Templates: "left to right flow of change"
		- Real-world examples (Docker, etc.) for default heuristics
	- **Tests**: Update tt-design-alignment.test.js to verify improved positioning
	- **Data migration**: `alignment_hint` is optional, no migration needed
- Flow of change arrows in TT Design view
	- Add optional "Flow of change" visualization as described in https://teamtopologies.com/key-concepts
	- Implementation: checkbox option (default off) in TT Design view to show directional arrows indicating flow between teams
	- Export: include flow arrows in SVG export when enabled
	- **Note**: Build on top of flow-aware auto-align (teams already positioned by flow direction)
- Review Team Shape Templates alignment
	- Review https://github.com/TeamTopologies/Team-Shape-Templates to ensure visual consistency
	- Check: should platform boxes have rounded corners in TT Design view, or should they follow the standard rectangular style from the official templates?
	- Goal: align visual representation with canonical Team Topologies design patterns
- X-as-a-Service interaction visualization options
	- Support different visual styles for X-as-a-Service connections, including the triangle shape from Team Shape Templates
	- Triangle benefits: (1) shows direction - points towards the "customer" team, (2) easier to recreate in other diagramming tools
	- Implementation: add option to toggle between current style (two white bars) and triangle style; default could follow Team Shape Templates convention
	- Note: Team Shape Templates uses grey triangle pointing toward customer instead of the two-bar connector shown in the book
- Validation: Baseline config mismatch warnings (product lines + business streams)
	- What it means: if a Baseline team’s `product_line` is not present in `data/current-teams/products.json`, or its `business_stream` is not present in `data/current-teams/business-streams.json`, flag it as a validation warning.
	- Why: prevents “silent” typos that create missing lanes / mis-grouped teams in the Baseline views.
	- Acceptance criteria: warning appears in the validation report (and ideally the UI warnings modal) with file + field + bad value; matching should be case/whitespace-normalized.
- Refactor frontend file structure into subfolders (DX improvement)
- Config-driven ordering/completeness in baseline perspectives (products/business streams)

## Later / Maybe
- TT Design Overview document (per dataset)
	- Add support for a `tt-design-overview.md` file in TT design data folders (e.g., `data/tt-teams/`, `data/tt-teams-initial/`)
	- Purpose: Let users document high-level design decisions, current state narrative, and potential next steps for their TT design
	- Content ideas: transformation philosophy, what changed and why, what's working well, known pain points, planned next phases
	- Could be displayed in UI (e.g., info panel, design notes modal) or kept as git-tracked documentation
	- Benefit: Keeps context and rationale close to the data, helps teams communicate design evolution- Baseline: network-style “team coordination” view (dependencies + coordination overhead)
- Flow metrics: aggregated metrics at grouping level (TT Design)
	- Show rollups for value stream groupings and platform groupings (e.g., average/median lead time, deployment frequency distribution, combined flow health indicators).
	- Goal: make it easy to compare groupings at a glance without clicking into each individual team.
- “Virtual nodes” / constraint cards (e.g., release gates, compliance constraints)
- Model quality: “Health Check” / anti-pattern detection report
	- Add a one-click report that flags common Team Topologies smells (too many dependencies, bottleneck platforms, orphaned teams, long-running collaboration, undersized/oversized teams).
	- Output could live in the existing validation modal (errors/warnings/info), plus optional on-canvas highlighting for teams with issues.
- Interaction mode evolution history (optional)
	- Allow documenting and visualizing how interactions changed over time (e.g., collaboration → X-as-a-Service), including maturity markers and “stale collaboration” warnings.
- Data entry helpers (keep git-first)
	- Add a “Team wizard” that generates YAML + markdown (copy-to-clipboard) and/or a simple questionnaire to help set cognitive load consistently.
- Security hardening: sanitize Markdown-rendered HTML in modals
	- Add HTML sanitization (e.g., DOMPurify) on the output of `marked.parse()` before injecting into the DOM.
	- Consider disallowing raw HTML in markdown (or stripping it) and add tests for basic XSS payloads.
	- Optionally self-host pinned frontend runtime deps (or add CSP) to reduce supply-chain and CDN risks.
- Import/export tooling (onboarding helpers)
	- Provide a simple way to generate starter team files and configs from CSV/JSON (and optionally export the current dataset back out).
	- Goal: help new users bootstrap data quickly without hand-writing dozens of markdown files.
- Demo mode polish (guided tour + better story)
	- Add lightweight in-app guidance (tooltips/info boxes) to help first-time users understand what they’re seeing.
	- Improve the built-in demo narrative with stronger before/after snapshot examples (clear “why this is better” story).
	- Optional: allow switching between multiple demo datasets/stages (e.g., initial vs mid-transformation).
- More platform-as-a-product indicators (maturity, adoption funnel, pain points)
- Diff-style views for snapshots (beyond side-by-side)

