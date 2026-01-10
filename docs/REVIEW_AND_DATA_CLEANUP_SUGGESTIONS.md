# Review & Concrete Cleanup Suggestions (Jan 10, 2026)

This document summarizes a hands-on review of:
- App docs: README + docs
- Backend (FastAPI) + frontend (vanilla JS)
- Example datasets: `data/current-teams` (Baseline) and `data/tt-teams` (TT Design)

The goal is to highlight **specific gaps** and provide a **file-by-file cleanup checklist** to make the project clearer and the demo data feel like a single, coherent “real company” moving through an early Team Topologies journey.

---

## 1) Documentation & Implementation Gaps

### 1.1 Snapshots: conceptual mismatch in API routing + docs

**Observed behavior (actual code):**
- Snapshots are created from **TT teams**: `find_all_teams(view="tt")` in `backend/snapshot_services.py`.
- Snapshot files are stored under: `data/tt-snapshots/`.
- Snapshot API routes are exposed under **Pre-TT**: `/api/pre-tt/snapshots/*` in `backend/routes_pre_tt.py`.
- Frontend calls the Pre-TT snapshot routes in `frontend/api.js`.

**Why this is a gap:**
- It is cognitively confusing: “Pre-TT router” is hosting “TT Design snapshots”.
- README and docs also mention `data/snapshots/` in some places, while the code uses `data/tt-snapshots/`.

**Concrete cleanup (recommended):**
- Move snapshot routes to `/api/tt/snapshots/*` **or** to a neutral `/api/snapshots/*`.
- Update docs to state the real storage directory (`data/tt-snapshots/`) and the real endpoints.

**Files to touch:**
- `backend/routes_pre_tt.py` (move endpoints)
- `backend/routes_tt.py` (add endpoints)
- `frontend/api.js` (update URLs)
- `README.md`, `docs/SETUP.md`, `docs/CONCEPTS.md` (align words + paths)

---

### 1.2 Test counts differ across docs

Different documents cite different totals (e.g., 112 vs 332 vs 544 tests).

**Concrete cleanup:**
- Either remove exact totals (keep just commands) **or** define a single source of truth (recommended: README).

**Files:**
- `README.md`
- `DEVELOPMENT.md`
- `docs/SETUP.md`

---

### 1.3 Business Streams config implies features the backend doesn’t implement

`data/current-teams/business-streams.json` contains per-stream `products` lists.

**Observed behavior:**
- The backend groups by `team.business_stream` and `team.product_line`.
- It does not use the `products` list in the business-streams config for mapping.

**Concrete cleanup options:**
- **Option A (simplest):** update docs to reflect reality; treat `products` list as narrative-only.
- **Option B (more powerful):** implement a mapping fallback: if a team has `product_line` but no `business_stream`, infer its stream from config.

**Files:**
- Docs: `docs/CONCEPTS.md`
- Backend (if Option B): `backend/routes_pre_tt.py`

---

### 1.4 Filename slug logic: one helper doesn’t match the canonical slug

`backend/services.py`:
- Canonical slug: `team_name_to_slug()`.
- `write_team_file()` uses `lower().replace(' ', '-')` (does not handle `/` or `&` like the slug does).

**Concrete cleanup:**
- Either delete `write_team_file()` if unused OR change it to use `team_name_to_slug()`.

---

## 2) Example Data Review: Baseline (`data/current-teams`)

### 2.1 Does it feel like a real company?

**Yes, mostly.** The baseline dataset uses realistic, common pre-TT dysfunction patterns:
- Overloaded monolith/back-end team
- Ticket-based DevOps and DBA bottlenecks
- Architecture governance “approval board” dynamics
- API standards teams creating friction vs enabling flow

This is a credible baseline narrative.

### 2.2 Concrete data inconsistencies to fix

#### A) Line manager mismatches (engineering)

Two baseline engineering team files disagree with `organization-hierarchy.json`.

**Mismatch 1:**
- Team: `Web Frontend Team`
- In hierarchy: `Michael Chen`
- In team file YAML: `Marcus Thompson`
- File: `data/current-teams/engineering/web-frontend-team.md`

**Mismatch 2:**
- Team: `Route Optimization Team`
- In hierarchy: `Rachel Martinez`
- In team file YAML: `Marcus Thompson`
- File: `data/current-teams/engineering/route-optimization-team.md`

**Concrete cleanup (choose ONE approach):**
- **Approach A (recommended):** Make `metadata.line_manager` match `organization-hierarchy.json` for the baseline engineering teams.
- **Approach B:** Remove `metadata.line_manager` from baseline team YAML entirely and treat `organization-hierarchy.json` as the single source of truth.

#### B) Customer Solutions teams are not represented in the org hierarchy as line managers

`organization-hierarchy.json` contains regions for Customer Solutions teams but does not encode a line manager relationship.

**Concrete cleanup:**
- Either (1) remove `metadata.line_manager` from Customer Solutions teams to avoid implying a reporting hierarchy not modeled, OR (2) extend `organization-hierarchy.json` to include customer solutions line managers.

---

### 2.3 Baseline structural improvements (to feel “more real”)

- Add 1–2 concrete teams in:
  - Product Management (e.g., “Product Discovery Team”, “Portfolio & Roadmapping Team”)
  - Support (e.g., “Customer Support Operations Team”)
  This improves cross-functional realism and helps show why stream-aligned teams need boundaries.

- Align naming consistently: use **LogiCore Systems** everywhere (baseline + TT design).

**Concrete cleanup:**
- Normalize the entire dataset to a single company name (**LogiCore Systems**) so the baseline and TT design read as one coherent story.

---

## 3) Example Data Review: TT Design (`data/tt-teams`)

### 3.1 Does it feel like a “first step” in a TT journey?

**Partly, but it currently reads like a later/mid-stage topology.**
You have:
- Many stream-aligned teams across multiple value streams
- A broad platform ecosystem (cloud, CI/CD, observability, portal, feature mgmt, data platform, etc.)

That can be realistic, but it’s a **big jump** compared to the baseline set of engineering teams.

If your intention is “first step”, reduce scope and make the mapping explicit (see §3.4).

---

### 3.2 Concrete inconsistencies to fix

#### A) Company name consistency

Ensure TT team content uses the same company name as baseline (**LogiCore Systems**) so the transformation narrative stays coherent.

#### B) Platform grouping mismatch (YAML vs narrative)

Example:
- `data/tt-teams/observability-platform-team.md`
  - YAML: `platform_grouping: Cloud Infrastructure Platform Grouping`
  - Narrative: “Yes - Developer Experience Platform Grouping …”

Similarly, `feature-management-platform-team.md` uses Cloud Infrastructure in YAML but Developer Experience in narrative.

**Concrete cleanup:**
- Choose one naming scheme for platform groupings and use it consistently.
  - Option 1: Keep only **Cloud Infrastructure Platform Grouping**.
  - Option 2: Split into two groupings:
    - Cloud Infrastructure Platform Grouping
    - Developer Experience Platform Grouping
  If you split, update YAML `platform_grouping` fields accordingly.

---

### 3.3 Data-model realism improvements (TT)

- Add explicit interaction evolution guidance for collaboration links:
  - If Collaboration is “Ongoing”, it reads like permanent coupling.
  - Team Topologies guidance is that Collaboration is usually time-bounded.

**Concrete cleanup:**
- Update tables to include realistic durations:
  - e.g., “8 weeks”, “3 months”, “until API stabilizes”, then evolve to XaaS.

---

### 3.4 Make the baseline → TT story coherent (recommended)

If the dataset is intended to show a **first step**, make it explicit and smaller.

#### A) Create a TT Step 1 subset (minimal viable re-org)

**Suggested “Step 1” TT design characteristics:**
- 2–4 stream-aligned teams (split from baseline monolith/back-end + overloaded UX)
- 1 thin platform team (TVP) created from DevOps/DB bottleneck
- 1 enabling team to accelerate adoption
- Keep the complicated subsystem boundary clear (route optimization or ML)

#### B) Add explicit origin mapping

Add a simple field to TT team YAML, e.g.:
- `origin_team: Backend Services Team`
- `origin_teams: ["Backend Services Team", "Web Frontend Team"]`

Even if the app does not render it, this makes the dataset understandable for humans.

#### C) Provide a mapping table in docs

Add a short section in `docs/CONCEPTS.md` or a dedicated doc explaining:
- Baseline team → TT teams created
- Teams retained (renamed)
- Teams dissolved or merged

---

## 4) Concrete Cleanup Checklist (Actionable)

### Quick wins (1–2 hours)

1) Fix baseline line manager mismatches:
- Update `metadata.line_manager` in:
  - `data/current-teams/engineering/web-frontend-team.md` to `Michael Chen`
  - `data/current-teams/engineering/route-optimization-team.md` to `Rachel Martinez`

2) Normalize company name in baseline department docs:
- Ensure baseline department docs use the canonical company name (LogiCore Systems) in:
  - `data/current-teams/support/support-dept.md`
  - `data/current-teams/product-management/product-management-dept.md`
  - `data/current-teams/infrastructure/infrastructure-dept.md`

3) Normalize company name in TT docs:
- Ensure TT team markdown uses the canonical company name (LogiCore Systems) consistently.

4) Fix platform grouping narrative mismatch:
- For `data/tt-teams/observability-platform-team.md` and `data/tt-teams/feature-management-platform-team.md`, make the narrative “Part of a platform grouping?” match the YAML `platform_grouping` value.

### Medium effort (half day)

5) Snapshots consistency refactor:
- Move snapshot routes out of `/api/pre-tt/*` into `/api/tt/*` or `/api/snapshots/*`.
- Align docs and storage paths.

6) Docs consistency pass:
- Unify test-count statements or remove precise totals.

### Higher leverage (1–2 days)

7) Make the demo story explicitly “first step”:
- Add a “TT Step 1” dataset variant (either separate folder, or a smaller set of TT team files).
- Add origin mapping fields and a mapping table doc.

---

## 5) Notes on “Potentially Real Company” Plausibility

**Baseline:** credible, with a few concrete inconsistencies to fix.

**TT design:** credible, but currently feels like a more mature state than “first step”. If you want it to read as “first TT iteration”, reduce scope and add explicit mapping.
