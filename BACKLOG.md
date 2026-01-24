# Team Topologies Visualizer - Backlog

This is the public backlog for ideas, priorities, and possible improvements.

**Status**: Pre-release v1.0 development  
**Last updated**: 2026-01-24

## How to use this backlog

- **Now**: what I personally want to prioritize next (short list)
- **Next**: good candidates after the Now list
- **Later / Maybe**: longer-term ideas and experiments
- For contribution ideas, look for items that are small, well-scoped, and testable.

**Context note**: The tool defaults to "TT Design" view. The other view is "Pre-TT" (previously "Current State") and represents the baseline/starting point before TT transformation.

## Now (top priorities)

Edit this list as your priorities change:

- (Soon) Terminology unification: Rename code/data folders to use "baseline" consistently
	- Change: `data/current-teams/` → `data/baseline-teams/`, `routes_pre_tt.py` → `routes_baseline.py`, API paths `/api/pre-tt/*` → `/api/baseline/*`
	- Update: All documentation references (README, CONCEPTS, SETUP, DEVELOPMENT) to use "Baseline" as the canonical term
	- Benefit: Eliminates confusion between "Pre-TT", "Current State", and "Baseline" - one term everywhere
- (Soon) UI-driven validation rule visibility: Make Python code own the complete validation spec and expose it via API
	- Goal: When users click "Validate", show not just errors but also what *should* be valid (field constraints, allowed values, relationship rules)
	- Implementation: Define validation schema in Python (e.g., Pydantic or custom spec), expose via `/api/validation-schema` endpoint, render in UI modal
	- Benefit: Self-documenting data format, reduces documentation drift, helps users fix errors faster
- (Soon) Stable team IDs: introduce mandatory `team_id` in YAML and use it everywhere (replace name-based references)
	- Data model: add `team_id` to every team markdown file; keep `name` for display; enforce uniqueness and slug-safe format.
	- References: update `dependencies` and `interaction_modes` (and any other cross-team links) to use `team_id` as the canonical reference.
	- Backward-compat approach (minimal + practical): support resolving legacy name-based references during a transition, but normalize to IDs and surface clear warnings; once templates + sample data + docs are updated, make it a hard validation error.
	- Validation: fail if `team_id` is missing/duplicate; fail if references can’t be resolved to an existing `team_id`; detect ambiguous team names to prevent silent mis-links.
	- Templates + examples: update `templates/` and ALL markdown examples/snippets (including code blocks in docs) to include `team_id` and to reference teams by ID.
	- Migration helper: add a small script/command to (a) add `team_id` (default derived from filename), and (b) rewrite references from names → IDs; support a dry-run mode.
	- Tests: add unit tests covering parsing, normalization, migration behavior, and validation errors/warnings.
- Data modeling: keep narrative text separate from resolvable relationship targets (Baseline dependencies + TT interaction tables)
	- Ensure `dependencies` and `interaction_modes` reference real teams only (no pseudo-targets like “All platform teams”).
	- Store narrative/context separately (e.g., `dependency_notes` already exists; consider an equivalent for interaction mode notes if needed).
- UX/visual clarity improvements (reduce clutter, better defaults, better affordances)
- Documentation: keep setup + modeling guides short and drift-resistant

- Release readiness: 1.0 housekeeping
	- Bump version to `1.0.0` (wherever the canonical version lives) and create a git tag/release.
	- Sanity-check demo mode end-to-end (read-only behavior + banners + snapshot compare) against the current example dataset.

## Next
- Flow of change arrows in TT Design view
	- Add optional "Flow of change" visualization as described in https://teamtopologies.com/key-concepts
	- Implementation: checkbox option (default off) in TT Design view to show directional arrows indicating flow between teams
	- Export: include flow arrows in SVG export when enabled
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

