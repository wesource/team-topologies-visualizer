# Team Topologies Visualizer - Backlog

This is the public backlog for ideas, priorities, and possible improvements.

**Status**: Pre-release v1.0 development  
**Last updated**: 2026-01-25

## How to use this backlog

- **Now**: what I personally want to prioritize next (short list)
- **Next**: good candidates after the Now list
- **Later / Maybe**: longer-term ideas and experiments
- For contributions, look for items that are small, well-scoped, and testable.

## Now (top priorities)

Edit this list as your priorities change:

- UX/visual clarity improvements (reduce clutter, better defaults, better affordances)

- Release readiness: 1.0 housekeeping
	- Bump version to `1.0.0` (wherever the canonical version lives) and create a git tag/release.
	- Sanity-check demo mode end-to-end (read-only behavior + banners + snapshot compare) against the current example dataset.

## Next
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
	- What it means: if a Baseline team’s `product_line` is not present in `data/baseline-teams/products.json`, or its `business_stream` is not present in `data/baseline-teams/business-streams.json`, flag it as a validation warning.
	- Why: prevents “silent” typos that create missing lanes / mis-grouped teams in the Baseline views.
	- Acceptance criteria: warning appears in the validation report (and ideally the UI warnings modal) with file + field + bad value; matching should be case/whitespace-normalized.


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


