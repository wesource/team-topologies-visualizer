# Architecture + Team Topologies Review (2026-01-18)

This document is a combined:
- **Architecture review** of the application (backend + frontend + data model)
- **Agile/organization coaching review** of how the product supports Team Topologies discovery + design work
- **Test + sample data review** (quality, consistency, maintainability)
- **Documentation review** for README and docs/CONCEPTS

Scope: review only (no code changes proposed here), with **actionable improvements**.

---

## Executive summary

### What’s strong
- **Clear split between Baseline and TT Design**: two mental models supported by distinct API prefixes and UI behaviors.
- **Git-first data model** (Markdown + YAML front matter) is a strong fit for org design work: reviewable, diffable, workshop-friendly.
- **Three baseline perspectives** (Hierarchy / Product Lines / Business Streams) is a differentiator: it operationalizes the “Rubik’s Cube” idea from Team Topologies.
- **Good testing discipline**: meaningful backend unit tests + a large, stable frontend suite + E2E coverage.

### Main risks / friction points
- **Name-based references are brittle**: dependencies + interaction_modes rely on exact team name strings.
- **Sample data mixes “data” and “narrative” in dependency lists**, producing noise and confusing users.
- **Baseline vs TT semantics are slightly blurred** in a couple of places (e.g., team types in sample TT data, and interaction mode parsing/validation semantics).
- **Docs are excellent in content, but long and not easily scannable**; key workflows are buried.

### Highest-leverage improvements (shortlist)
1. **Introduce stable IDs** for team references (keep names as display strings).
2. **Separate “dependency targets” from “dependency notes”** (or support “virtual nodes” explicitly).
3. **Use configs to drive ordering/structure in baseline perspectives** (products and business streams).
4. **Restructure README + CONCEPTS with a “Start here” + “How to model” + “How to facilitate” flow.

---

## Application review (functions and flows)

### User-facing capabilities (as implemented)

**Baseline (Pre-TT/current):**
- Hierarchy view rendered from `organization-hierarchy.json` + per-team positions.
- Product lines view rendered from `products.json` + `product_line` fields.
- Business streams view rendered from `business-streams.json` + `business_stream` + `product_line` fields.
- Optional “communication lines” rendered from `dependencies`.

**TT Design:**
- Value stream groupings + platform groupings rendered from per-team metadata.
- Interaction modes rendered from `interaction_modes`.
- Snapshots (create/list/load/compare) for evolution tracking.
- Optional overlays and analysis (platform consumers, cognitive load, flow metrics).

**Cross-cutting UX:**
- Canvas: pan/zoom/fit-to-view.
- Modals: educational concepts + detailed team view (markdown rendering).
- Read-only “Demo mode”: API writes blocked + banner.

### Architecture (backend)

**What’s good**
- The backend is thin and focused: file-backed “domain model” with FastAPI endpoints.
- Pre-TT vs TT is clearly separated by routers (`/api/pre-tt/*` and `/api/tt/*`).
- There is a service layer (`backend/services.py`) that contains parsing and file IO.
- There is dedicated validation logic and good unit test coverage for it.

**Key design constraint**
- The system is fundamentally **file-centric**. This is correct for the purpose, but it creates constraints:
  - Concurrency (multiple editors) can lead to overwrites.
  - Names/filenames must remain stable for referential integrity.

**Potential architectural improvement (non-invasive)**
- Add a concept of **"team_id"** that is stable and slug-safe (or a UUID).
  - Keep `name` for display.
  - References should use IDs.
  - Backward compatible: still accept name-based references, but normalize into IDs.

### Architecture (frontend)

**What’s good**
- Modular layout: `api.js`, `state-management.js`, `renderer*.js`, `canvas-interactions.js`, `modals.js`.
- There is a reasonably clear dataflow: `app.js` loads data → updates state → renderer draws.
- The app supports multiple rendering strategies (hierarchy vs product lanes vs nested swimlanes).

**UX/interaction note**
- The click detection uses perspective-specific position maps for non-standard layouts (product-lines / business-streams). That’s the right approach.

**Security note (front-end)**
- The modal markdown uses `marked` from CDN and renders HTML. You set safe defaults (no header IDs, mangle false), but you may still want to ensure HTML sanitization is explicit if user-supplied content is expected.

---

## Team Topologies & org-coaching review (how well the tool supports the practice)

### What the tool enables well

1. **Baseline truth-telling**
   - The baseline views let teams and leadership see current coupling and handoffs.
   - The communication lines (dependencies) help surface coordination overhead.

2. **Designing “better interfaces”**
   - TT Design’s interaction modes are a strong coaching aid: you can guide teams from collaboration → XaaS.

3. **Evolution and storytelling**
   - Snapshots + comparisons are powerful for exec storytelling: “we reduced coupling and increased flow.”

4. **Outcome orientation**
   - Flow metrics and cognitive load indicators encourage discussion beyond org charts.

### Where the tool could align even more tightly with Team Topologies

1. **Distinguish “current dependencies” vs “designed interactions” even more sharply**
   - In the sample data, dependencies sometimes include narrative statements and pseudo-nodes.
   - Recommendation: model this explicitly (see Data improvements).

2. **Make “team boundaries” and “team cognitive load” a first-class coaching flow**
   - Consider making “cognitive load” and “flow metrics” more visible in the baseline view too.
   - Even if not present, show an “unknown” state; that drives data completion.

3. **Platform as a product**
   - Platform consumer dashboards are good; consider adding:
     - “Top 3 consumer pain points” (text field)
     - “Golden path maturity” (enum)
     - “Adoption funnel” concept (teams onboarding / active / blocked)

---

## Sample and test data review

### Current (Baseline) data model

**Strengths**
- The baseline sample data is rich and tells a story (bottlenecks, handoffs, overloaded QA).
- The three perspectives are fed by simple fields (`line_manager`, `product_line`, `business_stream`).

**Key issue: dependencies contain non-team targets**
- Example patterns:
  - `All Development Teams`
  - Narrative like `Blocks all teams from releasing (must wait for QA approval)`

This is meaningful story content, but it creates two problems:
1. The renderer can’t resolve it to an actual node.
2. The UI logs warnings (or requires warning suppression).

**Recommended fix options (choose one)**
- **Option A (recommended): Split dependencies into two fields**
  - `dependencies`: list of team IDs/names only
  - `dependency_notes`: free text or markdown list
- **Option B: Support “virtual nodes”**
  - Allow dependencies to reference `virtual:` nodes (e.g., `virtual:Release Approval Gate`)
  - Render virtual nodes as small “constraint cards” rather than teams
- **Option C: Allow inline description but parse only the target**
  - Example: `- QA & Testing Team: requires approval before release`
  - This keeps narrative while keeping the target resolvable.

Option A is the cleanest for long-term maintainability.

### TT Design data model

**Strengths**
- Team API-like documents encourage healthy team boundary thinking.
- Flow metrics are structured and validated.

**Potential confusing point in sample TT data**
- Some teams named like platform teams appear as `team_type: stream-aligned`.
  - This can be valid if the “platform” is treated as an internal product with a stream-aligned team.
  - However, it can confuse readers expecting “platform team == team_type: platform”.

**Recommendation**
- Add a short "modeling note" in docs explaining that:
  - A platform grouping can include platform teams, enabling teams, and (sometimes) stream-aligned internal-product teams.
  - But a team’s `team_type` should reflect its primary TT type.

### Referential integrity

**Risk**: Name-based linking
- Dependencies and interaction modes are fragile because they depend on exact string match.

**Recommendation**
- Adopt stable **team IDs** and reference by ID.
  - Keep backward compatibility by auto-resolving names to IDs.
  - Update validation to detect ambiguous name collisions.

### Config-driven structure

- `products.json` and `business-streams.json` contain metadata and intended ordering.
- Current backend grouping logic is primarily field-driven and does not fully use config for ordering or completeness checks.

**Recommendation**
- Treat config as the “source of truth” for ordering and optionally completeness:
  - Warn if a team uses a product/business stream not in config.
  - Show empty lanes/swimlanes for configured items with zero teams (useful for planning).

---

## Test suite review

### What’s strong
- Backend tests cover:
  - Validation rules
  - Parsing (interaction tables, dependency bullets)
  - Snapshot logic
  - Read-only mode behavior
- Frontend tests cover rendering and UI logic at a good granularity.
- E2E coverage demonstrates confidence in user flows.

### Observed testing/ops gotcha
- Environment variables (READ_ONLY_MODE) can bleed into test runs when running demo mode in the same shell.

**Recommendation**
- In docs, call out:
  - “Unset READ_ONLY_MODE before running tests”, or
  - Provide a dedicated test script that explicitly clears it.

---

## Documentation review: README.md (suggestions)

README is already comprehensive. The main improvement is **information architecture** (make it easier to find things).

### Suggested README structure

1. **What is this?** (1–2 paragraphs)
2. **Quick start** (local + Docker)
3. **Conceptual overview (very short)**
   - Baseline vs TT Design
   - Where data lives
4. **How to use (workflows)**
   - Import/create baseline data
   - Iterate TT design
   - Create snapshots
   - Export SVG
5. **How to model teams (data format)**
   - Required YAML fields
   - Optional fields by view
   - How to define dependencies vs interaction modes
6. **Configuration**
   - Team type configs
   - TT variants
   - Demo mode
7. **Testing & contributing** (link out)

### Specific improvements to consider
- Add a **“Start here: 10-minute tour”** section with 5 steps:
  1) Open baseline hierarchy
  2) Toggle communication lines
  3) Switch to product lines
  4) Switch to TT design
  5) Create a snapshot + export SVG

- Add a **“Data authoring tips”** section:
  - Team name stability and slugs
  - Avoid spaces/typos in references
  - Prefer IDs (if you implement them later)

- Add a **“Facilitation recipe”** section for workshops:
  - Baseline session (identify bottlenecks)
  - Design session (pick 1–2 flows, define interaction modes)
  - Leadership session (snapshot comparison story)

- Link to key anchors in CONCEPTS (it’s long; deep-linking is essential).

---

## Documentation review: docs/CONCEPTS.md (suggestions)

CONCEPTS is rich and well-written. The issue is that it’s effectively a book-length guide.

### Suggested improvements

1. **Add a table of contents + navigation**
   - At minimum, add “Start here”, “Baseline modeling”, “TT modeling”, “Snapshots”, “References”.

2. **Make the data model explicit (one canonical section)**
   - Define the schema used by the tool:
     - Baseline fields: `line_manager`, `product_line`, `business_stream`, `dependencies`
     - TT fields: `value_stream`, `platform_grouping`, `interaction_modes`, `team_api`, `flow_metrics`

3. **Clarify the difference between Business Streams and Value Streams**
   - You already explain it; consider summarizing in a single short “rules of thumb” list.

4. **Add “anti-pattern spotlight” callouts**
   - Example callouts:
     - “Central QA as bottleneck”
     - “Shared DevOps queue”
     - “Backend team owns everyone’s deploy”

5. **Make interaction modes operational**
   - Add a mini checklist per mode:
     - Collaboration: entry criteria, exit criteria, timebox
     - XaaS: what documentation is required, what self-service looks like
     - Facilitating: what good looks like, what success metrics are

6. **Add “How to use this tool in a transformation” guide**
   - A transformation playbook section:
     - Start with baseline truth
     - Identify high-coupling areas
     - Choose one stream to improve
     - Introduce enabling work
     - Build TVP
     - Use snapshots quarterly

---

## Product roadmap suggestions (from a TT + architect lens)

### High priority
- Stable team IDs (reduce name fragility)
- Dependency modeling improvements (separate narrative vs resolvable targets)
- Config-driven ordering/completeness for baseline views

### Medium priority
- Add “virtual constraints” / “risk cards” (for compliance gates, release approvals, etc.)
- Add basic “quality of model” indicators (e.g., teams with missing owner, missing interaction modes, missing metrics)

### Lower priority / nice-to-have
- Import/export tooling (CSV/JSON) for initial adoption
- “Diff view” for baseline snapshots (even if not editable) to show org changes

---

## Appendix: quick consistency checklist for sample data

Use this list when curating the sample dataset:
- Do all `dependencies` targets resolve to real teams (or approved virtual nodes)?
- Do all `product_line` values exist in `products.json`?
- Do all `business_stream` values exist in `business-streams.json`?
- Do TT teams with `interaction_modes` reference real TT teams?
- Are `team_type` values consistent with the TT team types config?

---

## Notes

This review was based on:
- Backend routes and service parsing
- Frontend app orchestration + renderer architecture
- Sample data configs and a subset of team markdown files
- README.md and docs/CONCEPTS.md content
