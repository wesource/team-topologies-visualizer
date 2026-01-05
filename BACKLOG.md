# Team Topologies Visualizer - Development Backlog

**Status**: Pre-release v1.0 development
**Last updated**: 2026-01-05

**Note**: The tool now defaults to "TT Design" view. The other view is called "Pre-TT" (previously "Current State") to represent the baseline/starting point before TT transformation.

This backlog tracks enhancements for iterative development. Items are organized by priority, focusing on business value and usability for v1.0 release.

**Recent Expert Reviews**: See `EXPERT-REVIEW.md` and `TT-EXPERT-REVIEW.md` for detailed analysis from platform engineering and Team Topologies perspectives. Key themes: Team APIs need more detail, organizational sensing is missing, platform product thinking needs improvement.

---

## ✅ Recently Completed

### 1. Implement Full Team API Structure ⭐⭐⭐⭐⭐ CRITICAL - **✅ COMPLETED 2026-01-05**
**Impact**: HIGH | **Effort**: 3-4 hours | **From**: Both expert reviews + TT Book 2nd Edition

**Status**: ✅ **COMPLETED** - All components implemented and working

**What Was Delivered**:
- ✅ Backend models support full Team API structure (`backend/models.py`)
- ✅ Backend parses interaction tables from markdown (`backend/services.py`)
- ✅ Frontend modal displays Team API with rich formatting and clickable links (`frontend/modals.js`)
- ✅ All 34 tt-teams updated to use Team API format (mix of base and extended templates)
- ✅ Two templates created: base (GitHub strict) and extended (with book additions)
- ✅ CONCEPTS.md documents Team API vs Team Agreement distinction
- ✅ Example teams: `observability-platform-team.md`, `cloud-development-platform-team.md`, etc.

**User Value Achieved**:
- Teams know exactly who to contact, what SLAs to expect
- New teams can discover services without lengthy meetings
- Communication norms and interaction patterns are explicit
- Roadmap visibility helps teams plan dependencies

---

## 🎯 v1.0 Release - Must Have (Current Sprint)

These items are critical for v1.0 release. They address core business value gaps identified in expert reviews.

### 2. Show Dependency & Consumer Counts (Bottleneck Detection) ⭐⭐⭐⭐⭐ CRITICAL
**Impact**: HIGH | **Effort**: 2 hours | **From**: Expert Review - "No organizational sensing"

**Why This Matters**:
> "Blocking Dependencies: 'Team X is a dependency for 12 other teams - BOTTLENECK ALERT'" - DevOps Expert Review

**Solution**: Calculate and display dependency counts to identify bottlenecks

**Visual Indicators**:
- Badge on canvas: "Consumed by: 8 teams"
- Warning if >7 consumers: ⚠️ BOTTLENECK RISK
- Color coding: 🟢 0-3, 🟡 4-7, 🔴 8+
- Detail modal: Full dependency breakdown

**Tasks**:
- [ ] Add `calculateDependencyMetrics()` function
- [ ] Display consumer count on team cards
- [ ] Show bottleneck warning icon
- [ ] Full breakdown in detail modal:
  - "Consumed by X teams" (list them, clickable)
  - "Depends on Y teams" (list them, clickable)
  - Bottleneck warning if applicable
- [ ] Add legend entry for dependency colors
- [ ] Unit tests

**User Value**:
- Immediately see "Payment platform consumed by 15 teams - overwhelmed!"
- Identify structural problems visually

**Definition of Done**:
- Consumer count on all teams
- Bottleneck warnings appear
- Color coding works
- Tests cover edge cases

---

### 4. Team Size Validation Warnings ⭐⭐⭐⭐ HIGH
**Impact**: HIGH | **Effort**: 1 hour | **From**: TT Expert Review

**Why This Matters**:
> "Teams can have any size. TT Guidance: 5-9 people (Dunbar's number). Fix: Warn if < 5 or > 9"

**Solution**: Visual warnings for teams outside 5-9 range

**Implementation**:
- [ ] Warning in detail modal if size <5 or >9:
  ```
  ⚠️ Team size is 12 people (recommended: 5-9)
  Consider: Splitting into 2 teams or reducing scope
  ```
- [ ] Yellow border on canvas for out-of-range teams
- [ ] Update CONCEPTS.md with Dunbar's number explanation

**Definition of Done**:
- Warnings in modals
- Visual indicators on canvas
- Docs explain rationale

---

### 5. Add "Established" Date to Teams ⭐⭐⭐ MEDIUM
**Impact**: MEDIUM | **Effort**: 30 minutes | **From**: DevOps Expert Review

**Why This Matters**:
> "No way to show 'this team was just formed' vs 'this team has been stable for 2 years'"

**Solution**: Add `established` date, show team age

```yaml
metadata:
  established: "2023-11"  # YYYY-MM format
```

**Display**:
- Detail modal: "Established: November 2023 (2 years ago)"
- Badge for new teams (<3 months): "🆕 New team"

**Tasks**:
- [ ] Add `established` to all example teams
- [ ] Calculate and display age in modal
- [ ] "New Team" badge for <3 months
- [ ] Add to templates

**Definition of Done**:
- All examples have dates
- Age displays correctly
- New team badges appear

---

## 🚀 v1.1 - Quick Wins (Post-Release)

These are high-value features for v1.1, identified in expert reviews.

### Platform Service Count Badge
**Impact**: MEDIUM | **Effort**: 1 hour

- [ ] Count services in `metadata.services_provided`
- [ ] Badge: "5 services"
- [ ] Warning if >10: "⚠️ Platform bloat risk"
- [ ] Color coding: 🟢 1-5, 🟡 6-10, 🔴 11+

---

### 4. TT Evolution Snapshots & Timeline View ⭐⭐⭐⭐⭐ CRITICAL
**Impact**: HIGH | **Effort**: 5-6 hours | **From**: TT Expert Review - "Static visualization trap"

**Status**: 🟡 Ready to start after Team API implementation

**Why This Matters**:
> "⚠️ **Static visualization trap** - Tool encourages 'set it and forget it' org chart mentality" - TT Expert Review
>
> "Team structures MUST evolve over time. This tool treats team topologies as static designs rather than living, adapting organisms." - TT Expert Review
>
> "Your tool encourages thinking of TT transformation as a **one-time project** ('We'll move from Pre-TT to TT Design and be done'). This is antithetical to Team Topologies thinking." - TT Expert Review

**Problem**: Organizations create beautiful TT visualizations, put them on the wall, and 3 months later they're completely outdated. Teams have changed, new dependencies appeared, and nobody bothered to update the diagram. Tool needs to **show evolution over time**, not just static snapshots.

**Solution**: Implement snapshot system that captures TT Design state at specific points in time, allowing:
- "Before and after" comparisons
- Tracking transformation progress over quarters/years
- Historical view: "What did our structure look like 6 months ago?"
- Planned transitions: "Here's where we are now, here's where we're going"

**User Workflow**:
1. Organization designs TT structure in tool (tt-design view)
2. Click "📸 Create Snapshot" button
3. Name snapshot: "TT Design v1.0 - 2026-01-15 (Initial Design)"
4. Tool saves condensed copy of all tt-teams markdown files
5. Continue evolving the live tt-design structure
6. Create another snapshot: "TT Design v1.1 - 2026-04-01 (Q1 Progress)"
7. Use timeline slider to compare: v1.0 vs v1.1 vs Current
8. Show transformation journey to stakeholders

**Snapshot Data Format** (Condensed JSON):
```json
{
  "snapshot_id": "tt-design-v1.0-2026-01-15",
  "created_at": "2026-01-15T10:30:00Z",
  "name": "TT Design v1.0 - Initial Design",
  "description": "First TT structure after 6-week design workshops. Focus: Establish platform teams and clear value streams.",
  "author": "Jane Smith <jane@company.com>",
  "teams": [
    {
      "name": "E-commerce Checkout Team",
      "team_type": "stream-aligned",
      "position": {"x": 500, "y": 200},
      "value_stream": "E-commerce Experience",
      "dependencies": ["Payment Platform Team", "API Gateway Platform Team"],
      "interaction_modes": {
        "Payment Platform Team": "x-as-a-service",
        "Mobile App Experience Team": "collaboration"
      },
      "metadata": {
        "size": 7,
        "cognitive_load": "medium",
        "established": "2025-11"
      },
      "team_api_summary": {
        "purpose": "Own end-to-end checkout experience for web and mobile customers",
        "services": ["Checkout API", "Cart Service", "Promo Engine"],
        "contact": "#checkout-team"
      }
    }
    // ... all other teams in condensed format
  ],
  "statistics": {
    "total_teams": 28,
    "stream_aligned": 15,
    "platform": 10,
    "enabling": 2,
    "complicated_subsystem": 1,
    "value_streams": 4,
    "platform_groupings": 3
  }
}
```

**Storage Location**:
- `data/snapshots/tt-design-v1.0-2026-01-15.json`
- `data/snapshots/tt-design-v1.1-2026-04-01.json`
- `data/snapshots/tt-design-v2.0-2026-07-15.json`
- Git-tracked, version controlled
- Immutable once created (frozen state)

**UI Components**:

**1. Create Snapshot Button**
- [ ] Add "📸 Create Snapshot" button to toolbar (TT Design view only)
- [ ] Modal dialog:
  - Snapshot name (auto-suggests: "TT Design vX.X - YYYY-MM-DD")
  - Description (multi-line text)
  - Author (from git config or manual entry)
  - Preview: "This will capture 28 teams, 4 value streams, 3 platform groupings"
- [ ] Progress indicator while saving
- [ ] Success notification: "Snapshot saved: data/snapshots/tt-design-v1.0-2026-01-15.json"

**2. Timeline/Snapshot Browser**
- [ ] "🕐 Timeline" button in toolbar
- [ ] Side panel showing available snapshots:
  ```
  📸 Snapshots (3 saved):
  ━━━━━━━━━━━━━━━━━━━━━━━
  ▶ Current (Live)
    28 teams, last updated 2026-01-15
  
  📸 TT Design v1.1 (2026-04-01)
    32 teams, Q1 Progress
  
  📸 TT Design v1.0 (2026-01-15)
    28 teams, Initial Design
  ```
- [ ] Click snapshot → Load frozen view
- [ ] Banner: "📸 Viewing Snapshot: TT Design v1.0 (2026-01-15) - Read-only"
- [ ] "Return to Live View" button

**3. Snapshot Comparison View** (Future Enhancement)
- [ ] Split screen: v1.0 vs v1.1 side-by-side
- [ ] Highlight changes:
  - 🟢 New teams (4 added)
  - 🔴 Removed teams (0 removed)
  - 🟡 Moved teams (5 repositioned)
  - 🔵 Changed interactions (3 mode changes)
- [ ] Summary: "From Q1 to Q2: Added 4 teams, split Platform Team into 2, transitioned 3 collaborations to X-as-a-Service"

**4. Export Snapshot Timeline** (Future Enhancement)
- [ ] Export to PowerPoint: Multi-slide timeline showing evolution
- [ ] Export to PDF: "Our 18-Month TT Transformation Journey"
- [ ] Export to GIF: Animated transition from v1.0 → v1.1 → v2.0

**Implementation Tasks**:
- [ ] Backend: `POST /api/snapshots/create` endpoint
  - Read all tt-teams markdown files
  - Parse and condense to JSON format
  - Generate snapshot ID and metadata
  - Write to `data/snapshots/` directory
  - Return snapshot summary
- [ ] Backend: `GET /api/snapshots` endpoint
  - List all available snapshots (sorted by date)
  - Return metadata for each
- [ ] Backend: `GET /api/snapshots/:id` endpoint
  - Load specific snapshot JSON
  - Return team data in same format as live view
- [ ] Frontend: "Create Snapshot" button and modal
  - Name, description, author inputs
  - Preview summary
  - Success/error handling
- [ ] Frontend: Timeline/snapshot browser panel
  - List snapshots with metadata
  - Click to load snapshot
  - "Viewing Snapshot" banner
  - Return to live view
- [ ] Frontend: Snapshot view mode
  - Read-only canvas (no drag-and-drop)
  - Visual indicator (banner, watermark)
  - Disable edit operations
- [ ] Update CONCEPTS.md: Document snapshot workflow
- [ ] Update README.md: Highlight evolution tracking feature
- [ ] Add to .gitignore: `data/snapshots/*.json` (optional, or track them)

**Best Practices Documentation**:
```markdown
### When to Create Snapshots

**Quarterly Snapshots** (recommended minimum):
- End of each quarter to track transformation progress
- Name: "TT Design Q1 2026", "TT Design Q2 2026", etc.

**Milestone Snapshots**:
- After major organizational changes (team splits, new platforms)
- Before/after executive presentations
- When entering new transformation phase

**Experiment Snapshots**:
- Before trying structural experiments
- "TT Design - Experiment: Split Platform Team"
- Easy rollback if experiment fails

**Avoid**:
- Creating snapshots daily (too granular)
- Never creating snapshots (defeats the purpose)
- Treating snapshots as backups (use git for that)
```

**Definition of Done**:
- Create Snapshot button saves condensed JSON
- Snapshots listed in timeline browser
- Click snapshot → Load frozen view
- Frozen view is read-only (no edits)
- Banner indicates snapshot mode
- Return to live view works
- Snapshots tracked in git (or gitignored per user choice)
- Documentation explains snapshot workflow
- Tests: Create snapshot, load snapshot, list snapshots

**User Value**:
- **Combat "set it and forget it"**: Regular snapshots encourage ongoing evolution
- **Show progress**: "We started with 25 undefined teams, now have 15 stream-aligned + 8 platform teams"
- **Stakeholder communication**: Visual timeline of transformation journey
- **Experimentation**: Try structural changes, snapshot, evaluate, iterate
- **Historical analysis**: "When did we split the Platform Team? How did that work out?"
- **Regulatory compliance**: Some industries require org structure audit trail

**Future Enhancements** (v1.2+):
- Snapshot comparison view (side-by-side diff)
- Animated transitions between snapshots
- Automatic snapshot scheduling (monthly, quarterly)
- Snapshot annotations and comments
- Team-level history: "This team was undefined in Q1, became stream-aligned in Q3"
- Integration with git commits: Auto-snapshot on major git changes

---

### 5. Enhanced Validation ⭐⭐⭐⭐ HIGH
**Impact**: HIGH (increased from MEDIUM) | **Effort**: 4-5 hours | **From**: User request + Expert reviews

**Status**: 🟢 Core validation implemented, additional features available for future enhancement

**Why This Matters**:
> "Users edit markdown and YAML files directly (by design). Manual editing is error-prone: typos, invalid values, filename mismatches, missing required fields. With Team API implementation, validation becomes CRITICAL to ensure data quality."

**Context**:
- Tool relies on human-edited markdown files with YAML front matter
- Team API implementation adds complexity: more fields, interaction tables, markdown sections
- Invalid data causes:
  - 404 errors when updating positions (filename mismatches)
  - Silent rendering failures (invalid references)
  - Broken visualization (missing required fields)
  - Confusion about what's required vs optional
- Validation catches errors BEFORE they cause problems

**Implemented Features** ✅:
- API endpoint: `GET /api/validate?view={tt|current}`
- Frontend "✓ Validate Files" button with modal display
- YAML structure validation (syntax, duplicate blocks)
- Required fields validation (name, team_type)
- Valid team_type values check
- Filename consistency checks
- Position coordinate validation
- Team size recommendations (5-9 people)
- Interaction table format validation (TT view)
- Color-coded results (errors vs warnings)
- Summary statistics display

**Validation Checks**:

**1. YAML Front Matter Structure (Both Views)**
- [x] Valid YAML syntax (parseable)
- [x] Required fields present:
  - `name` (string, 1-100 chars)
  - `team_type` (valid type from config)
  - `position` (object with x, y numeric)
  - `metadata.size` (optional but recommended, 1-20)
  - `metadata.cognitive_load` (optional, valid value if present)
- [x] Data types correct:
  - `position.x` and `position.y` are numbers, not strings
  - `metadata.size` is integer if present
- [x] No duplicate YAML front matter blocks
- [ ] No unknown fields (warn, don't error - allows extensibility)

**2. Filename Consistency (Both Views)**
- [x] Filename matches team name:
  - Lowercase conversion
  - Spaces → hyphens
  - `&` → `and`
  - Special chars removed
- [x] Example:
  - Team name: "API Gateway Platform Team"
  - Expected file: `api-gateway-platform-team.md`
  - Actual file: `platform-team.md` ❌
  - Error message shows expected filename

**3. Team API Validation (TT Teams Only)**
- [x] Interaction tables: Valid markdown table syntax
- [ ] If markdown contains Team API sections, validate:
  - "Team name and focus" section present
  - "Team type" section matches YAML `team_type`
  - Contact info (if present): Valid email format, Slack channel format
  - Referenced teams in tables exist
  - Interaction modes valid (collaboration, x-as-a-service, facilitating)
- [ ] Warn if Team API incomplete:
  - Has "Services provided" but no "SLA"
  - Has SLA but no "Contact" section
  - Missing "What we're currently working on"
- [ ] Extended template fields marked correctly:
  - `[Extended: Not part of github team api template...]` present

**4. Reference Validation (Both Views)**
- [ ] Dependencies reference existing teams:
  - Check if team name exists in same view
  - Suggest similar names if typo detected (fuzzy match)
- [ ] Interaction modes reference existing teams
- [ ] Platform grouping membership valid (if specified)
- [ ] Value stream membership valid (if specified)
- [ ] Circular dependency detection (warn, not error)

**5. Team Topologies Best Practices (TT Teams)**
- [x] Team size 5-9 recommended (warn if outside range)
- [ ] Stream-aligned teams should have value_stream (warn if missing)
- [ ] Platform teams should have platform_grouping (warn if missing)
- [ ] Collaboration interactions: Warn if no duration/end_date (should be temporary)
- [ ] Undefined teams: Info message suggesting classification

**6. Data Quality Checks (Both Views)**
- [x] Position coordinates reasonable (0-3000 range)
- [ ] No overlapping positions (warn if too close)
- [x] Team size reasonable (1-20 people)
- [ ] Cognitive load valid values: low, medium, high, very-high
- [ ] Established date valid format: YYYY-MM (if present)
- [ ] Established date not in future

**Output Format**:
```
Team Data Validation Report
============================
Validating: data/tt-teams/ (25 files)
Validating: data/current-teams/ (18 files)

❌ ERRORS (must fix):
  data/tt-teams/my-team.md
    • Missing required field: team_type
    • Invalid position.x: must be number (got "abc")
    • Filename mismatch: Should be "my-new-team.md" for team "My New Team"

⚠️  WARNINGS (recommended fixes):
  data/tt-teams/api-gateway-platform-team.md
    • Team size is 12 (recommended: 5-9 for effective collaboration)
    • Missing SLA section (has Services but no SLA expectations)
    
  data/tt-teams/checkout-team.md
    • Dependency "Payment Team" not found. Did you mean "Payment Platform Team"?
    • Interaction mode "sometimes-works-with" invalid. 
      Valid modes: collaboration, x-as-a-service, facilitating

ℹ️  INFO (best practices):
  • 5 teams missing cognitive_load metadata (optional but recommended)
  • 3 stream-aligned teams missing value_stream assignment
  • 2 platform teams missing platform_grouping
  • 8 teams missing "established" date

✅ VALID TEAMS: 38/43
❌ VALIDATION FAILED: 2 errors, 4 warnings

Run with --fix-filenames to auto-rename mismatched files.
Run with --interactive to fix errors one by one.
```

**Implementation Tasks**:
- [x] Create `backend/validation.py` module
- [x] Implement core validation logic (YAML structure, required fields, filename consistency, team size, position coordinates, interaction tables)
- [x] User-friendly error messages with suggestions
- [x] Color-coded output (red errors, yellow warnings)
- [x] Summary statistics at end
- [x] `GET /api/validate` - Returns validation report as JSON
- [x] Frontend "✓ Validate Files" button in UI with modal display
- [ ] Fuzzy matching for typo detection in team references
- [ ] Optional `--fix-filenames` flag to auto-rename files
- [ ] Reference validation (check dependencies/interactions point to real teams)
- [ ] Circular dependency detection
- [ ] Position overlap detection
- [ ] Unit tests for each validation rule
- [ ] Integration test with sample invalid files
- [ ] Real-time validation warnings in team edit modal

**User Value**:
- **Catch errors early**: Before they cause rendering issues or 404s
- **Learn by doing**: Validation messages teach TT best practices
- **Confidence in manual edits**: Know your changes are valid
- **Team onboarding**: New contributors get immediate feedback
- **CI/CD integration**: Block invalid PRs automatically
- **Data quality**: Maintain high-quality team data over time

---

### Multi-Select Groupings Filter
**Impact**: LOW-MEDIUM | **Effort**: 2 hours

- [ ] Replace dropdown with multi-select
- [ ] Select multiple value streams + platform groupings
- [ ] Show "3 groupings selected"
- [ ] Update filtering logic

---

## 📋 v1.2+ - Future Enhancements

### Organizational Sensing (Major Feature)
**From Expert Reviews**: "Tool doesn't help detect when structures need to change"

- [ ] Integration with metrics (lead time, deployment frequency)
- [ ] Conway's Law violation detection
- [ ] Flow efficiency analysis
- [ ] Temporal evolution view (timeline slider)

---

### Platform Product Metrics
**From DevOps Expert**: "Platform teams without metrics aren't treating platform as product"

- [ ] Internal NPS score
- [ ] Adoption rate (% of eligible teams)
- [ ] Time-to-value (onboarding speed)
- [ ] Support burden (% requiring intervention)

---

### Team API Deep Integration
**From TT Expert**: "Full Team API template integration"

- [ ] Software/systems owned
- [ ] Versioning approaches
- [ ] Daily sync meeting times
- [ ] Communication channels
- [ ] Current work (services, systems, improvements)

---

### 1. Expand Team API Metadata Fields ⭐⭐⭐⭐⭐ CRITICAL PRIORITY
**Impact**: HIGH | **Effort**: 1-2 hours | **From**: TT Expert Review - "Team APIs are cosmetic, not functional"

**Problem**: 
> "Team APIs are about reducing ambiguity and explicit expectations between teams. Your tool shows pretty arrows labeled 'X-as-a-Service' but doesn't tell anyone: What the service actually provides, What the SLA is, How to contact the team, Where documentation lives"

**Solution**: Add Team API fields to YAML front matter that teams actually need:

```yaml
# Example: API Gateway Platform Team
name: API Gateway Platform Team
team_type: platform

# NEW: Team API fields
team_api:
  purpose: "Provide API gateway and service mesh as internal platform"
  
  services_provided:
    - "Kong API Gateway (https://api-gateway.internal)"
    - "Istio Service Mesh (mTLS, traffic management)"
  
  contact:
    slack: "#platform-api-gateway"
    email: "api-gateway@company.com"
    wiki: "https://wiki.company.com/api-gateway"
  
  sla: "99.9% uptime, <100ms P95 latency, 4-hour incident response"
  
  consumers:
    - "E-commerce Checkout Team"
    - "Mobile App Team"
  
  working_hours: "9am-5pm EST, on-call rotation for P1 incidents"
```

**Implementation Tasks**:
- [ ] Add `team_api` section to backend models (optional field in TeamData)
- [ ] Update team detail modal to show Team API info prominently:
  - "Purpose" at top (one-liner, bold text)
  - "Contact" section with clickable Slack/email/wiki links
  - "Services Provided" as bullet list
  - "SLA" as badge/callout box
  - "Consumers" as linked list (clickable to jump to consumer teams)
  - "Working Hours" with on-call info
- [ ] Update 2 example teams to demonstrate full Team API:
  - 1 platform team (e.g., API Gateway Platform Team)
  - 1 stream-aligned team showing how they interact with platforms
- [ ] Update template files (`templates/tt-design-team-template.md`) with Team API section
- [ ] Add to CONCEPTS.md explaining Team API fields and best practices
- [ ] Update README.md to highlight improved Team API support

**User Value**: 
- "I need rate limiting - who provides that? API Gateway team, #platform-api-gateway"
- "What's the SLA for the payment platform? 99.9% with 4-hour response"
- Clear expectations reduce cross-team friction and coordination overhead

**Definition of Done**:
- Team API fields render in detail modal with proper formatting
- Contact links are clickable (open Slack, email client, wiki)
- Template files include Team API examples with helpful comments
- 2 example teams demonstrate complete Team API
- CONCEPTS.md documents Team API best practices
- All existing tests pass

---

### 2. Add "Purpose" One-Liner to Teams ⭐⭐⭐⭐ HIGH PRIORITY
**Impact**: MEDIUM-HIGH | **Effort**: 30 minutes | **From**: TT Expert Review - "What does this team actually do?"

**Problem**: 
> "Teams need clear purpose statements. Tool shows team types but not what the team's actual mission is."

**Solution**: Add `purpose` field to all teams (one-sentence mission statement)

**Implementation**:
```yaml
name: E-commerce Checkout Team
team_type: stream-aligned
purpose: "Own end-to-end checkout experience for web and mobile customers"
# ... rest of metadata
```

**Display**:
- Show purpose prominently at top of team detail modal (large text, before metadata)
- Consider showing truncated purpose in hover tooltip on canvas
- Makes it immediately clear what each team does

**Implementation Tasks**:
- [ ] Add `purpose` field to backend models (optional string, max ~120 chars recommended)
- [ ] Display in team detail modal (large text at top, after team name)
- [ ] Add to all example teams (write clear, concise one-liners):
  - Stream-aligned teams: Value they deliver to customers
  - Platform teams: Internal services they provide
  - Enabling teams: Capabilities they help build
  - Complicated Subsystem teams: Complex domain they handle
- [ ] Add to template files with examples and guidance
- [ ] Update CONCEPTS.md with purpose statement best practices:
  - Keep to one sentence
  - Focus on outcomes, not activities
  - Answer "why does this team exist?"

**Example Purpose Statements**:
- **Stream-aligned**: "Own end-to-end checkout experience for e-commerce customers"
- **Platform**: "Provide API gateway and service mesh to accelerate stream-aligned teams"
- **Enabling**: "Coach teams on DevOps practices and cloud-native patterns"
- **Complicated Subsystem**: "Build ML recommendation algorithms for product discovery"

**User Value**:
- "What does the API Gateway team do?" → Read the purpose statement
- Clear mission statements improve team clarity and alignment
- Helps new people understand organization quickly
- Facilitates discussions about team scope and boundaries

**Definition of Done**:
- Purpose field renders prominently in team detail modal
- All example teams have clear, concise purpose statements
- Template includes purpose with good examples and guidance
- CONCEPTS.md documents purpose statement best practices
- Hover tooltip shows truncated purpose on canvas (optional, if time permits)

---

### 3. Book-Accurate Team Shapes in Canvas & SVG Export ⭐ HIGH PRIORITY
**Goal**: Render Enabling and Complicated-Subsystem teams with authentic Team Topologies 2nd edition shapes

**Context**: 
- Info modals now display book-accurate SVG shapes for all 4 team types
- Canvas rendering still uses simple rectangles for all teams
- Book specifies: Enabling = vertical rectangle (80×120), Complicated-Subsystem = octagon
- Reference SVG files in `docs/svgs/`: `enabling-team.svg`, `complicated-subsystem-team.svg`

**Tasks**:
- [ ] Update `renderer-common.js` `drawTeamBox()` to support team type shapes
  - Enabling: Vertical rounded rectangle (80×120 proportions)
  - Complicated-Subsystem: Octagon path (multi-sided = internal complexity)
  - Stream-aligned: Keep current horizontal (200×30 proportions)
  - Platform: Keep current horizontal (200×60 proportions)
- [ ] Update connection anchor points for new shapes
  - Octagon needs 8 anchor points (one per side)
  - Vertical rectangles need adjusted anchor calculations
- [ ] Update `svg-export.js` to generate shape-specific SVG elements
  - Enabling: `<rect>` with vertical dimensions
  - Complicated-Subsystem: `<path>` with octagon geometry
- [ ] Update hit detection in `canvas-interactions.js` for octagon shape
- [ ] Add visual tests comparing rendered shapes to book diagrams
- [ ] Update CHANGELOG with book-accurate canvas rendering

**Technical Notes**:
- Enabling SVG: `<rect x="30" y="30" width="80" height="120" rx="14" fill="#b7a6d9" stroke="#7a5fa6"/>`
- Complicated-Subsystem SVG: `<path d="M40 20 H100 L120 40 V100 L100 120 H40 L20 100 V40 Z" fill="#f4b183" stroke="#c97a2b"/>`
- Consider text wrapping adjustments for narrow Enabling teams
- Octagon may need larger canvas footprint than current rectangles

**Definition of Done**:
- Enabling teams render as vertical rectangles on canvas
- Complicated-Subsystem teams render as octagons on canvas
- Exported SVG files show correct team shapes
- Connection lines properly anchor to new shapes
- Drag-and-drop works correctly with new shapes
- All existing tests pass, new visual tests added

---

### 2. ✅ Add "Undefined" Team Type for TT Design ⭐ TEAM TOPOLOGIES PATTERN
**Status**: COMPLETED 2026-01-02

**Goal**: Support teams that are not yet designed or categorized in TT Design view

**Implementation Summary**:
- ✅ Shared "undefined" team type in both Pre-TT and TT Design views
- ✅ Light gray fill (`#E8E8E8`) with darker gray dashed border (`#666666`, 8px dash, 4px gap)
- ✅ Rounded corners (8px radius) matching other team shapes
- ✅ Canvas rendering with proper hit detection and visual styling
- ✅ SVG export with `stroke-dasharray="8,4"` and `rx="8"`
- ✅ Auto-align treats undefined teams as narrow/ungrouped teams
- ✅ Example teams in both views: `example-undefined-team.md`
- ✅ Based on official TT guidance: https://teamtopologies.com/key-concepts-content/team-interaction-modeling-with-team-topologies

**Original Context**:
- During TT transformation, some teams may not yet be classified into the 4 fundamental types
- Official TT guidance mentions "undefined" team type for teams in transition
- Reference: https://teamtopologies.com/key-concepts-content/team-interaction-modeling-with-team-topologies
- Helps visualize current state of transformation (which teams still need design)

**Visual Style**:
- **Shape**: Standard rectangle (not wide like stream-aligned/platform)
- **Border**: Dashed border to indicate "not yet defined"
- **Color**: Light gray (#CCCCCC) to show neutral/undefined state
- **Label**: "Undefined" or "Not Yet Classified"

**Tasks**:
- [ ] Add "undefined" team type to `data/tt-teams/tt-team-types.json`
  - ID: "undefined"
  - Name: "Undefined"
  - Description: "Teams not yet classified into one of the 4 fundamental team types. Used during TT transformation planning."
  - Color: "#CCCCCC" (light gray)
- [ ] Update `renderer-common.js` to render undefined teams with dashed border
  - Check for team_type === 'undefined'
  - Use `ctx.setLineDash([5, 5])` for border
  - Use standard width (not wide like stream-aligned/platform)
- [ ] Update legend.js to show "Undefined" team type in TT Design view
  - Show dashed border in legend SVG
  - Add info modal explaining when to use undefined type
- [ ] Update CONCEPTS.md documentation
  - Explain undefined team type usage
  - When to use: during initial TT assessment, teams in transition
  - Goal: minimize undefined teams as transformation progresses
- [ ] Add example undefined team to tt-teams data
  - Demonstrate usage pattern
  - Show in documentation

**Use Cases**:
- **Initial Assessment**: Mark all teams as "undefined" when starting TT transformation
- **Gradual Classification**: Convert teams from undefined → stream-aligned/platform/enabling/complicated subsystem as design decisions are made
- **Progress Tracking**: Count of undefined teams shows transformation progress
- **Discussion Tool**: Undefined teams highlight areas needing design decisions

**Definition of Done**:
- Undefined team type added to config
- Dashed border rendering works correctly
- Legend shows undefined type with proper styling
- Documentation explains usage pattern
- Example undefined team in data

---

### 3. Create 2 Simple Template Files for Quick Start ⭐ USABILITY
**Goal**: Provide 2 essential template files to help users quickly create their own team data

**Context**:
- Users need to understand the file structure to add their own teams
- Start with minimal templates for v1.0 - just the essentials
- Keep it simple: 2 templates (Current State team + TT Design team)
- More comprehensive templates can come in a follow-up (see item #7)

**Tasks**:
- [ ] Create `templates/` directory at project root
- [ ] Create Current State team template: `templates/current-state-team-template.md`
  - Include all YAML front matter fields with comments
  - Example line_manager, department, dependencies
  - Placeholder markdown content with structure suggestions
  - Comments explaining each field's purpose
- [ ] Create TT Design team template: `templates/tt-design-team-template.md`
  - Include TT-specific fields (value_stream, platform_grouping)
  - Example interaction modes (collaboration, x-as-a-service, facilitating)
  - Cognitive load fields (domain_complexity, intrinsic_complexity, extraneous_complexity)
  - Team API-inspired sections (purpose, responsibilities, communications)
- [ ] Update SETUP.md with template usage instructions
  - How to copy templates to `data/current-teams/` or `data/tt-teams/`
  - Step-by-step guide for creating first custom team
  - Link to templates in "Quick Customization" section

**Definition of Done**:
- 2 team template markdown files created with helpful comments
- Templates include all supported fields
- SETUP.md references templates with usage examples
- Templates are git-friendly and easy to copy/modify
├── organization-hierarchy-template.json
├── current-team-types-template.json
└── tt-team-types-template.json
```

**Definition of Done**:
- All template files created with helpful comments
- Templates include all supported fields
- SETUP.md references templates with usage examples
- Templates are git-friendly and easy to copy/modify
- README.md in templates directory explains each file

---

### 4. Backend File Format Validation Report ⭐ DATA QUALITY
**Goal**: Provide validation warnings for team data files to catch manual editing errors

**Context**:
- **Users edit markdown and JSON files directly** in Git or on disk (by design)
- Manual editing is error-prone: typos in field names, invalid values, filename mismatches
- Filename mismatches can cause 404 errors when updating team positions
- Missing required fields can cause rendering issues or incomplete data
- Invalid references (non-existent teams, wrong interaction modes) cause silent failures
- Validation tool helps users catch errors before they cause problems
- Should be easy to run: `python validate.py` or similar

**User Workflow**:
1. User manually edits team markdown files or config JSON
2. User runs validation tool: `python -m backend.validation --all`
3. Tool reports errors and warnings with clear explanations
4. User fixes issues and re-validates
5. Clean validation = safe to commit changes

**Tasks**:
- [ ] Create `backend/validation.py` module for validation logic
- [ ] Implement filename consistency validation
  - Check if filename matches team name (lowercase, spaces→hyphens, &→and)
  - Report mismatches with suggested filename
- [ ] Implement required fields validation
  - YAML front matter: name, team_type, position (x, y)
  - Optional but recommended: dependencies, interaction_modes, metadata
  - Check for valid team_type values from config
- [ ] Implement data quality checks
  - Position coordinates should be numeric and positive
  - Dependencies should reference existing teams
  - Interaction modes should use valid mode names (collaboration, x-as-a-service, facilitating)
  - Cognitive load values should be valid (low, medium, high, etc.)
- [ ] Add CLI command for validation report
  - `python -m backend.validation --view tt` for TT Design teams
  - `python -m backend.validation --view current` for Current State teams
  - `python -m backend.validation --all` for both views
  - Easy to remember and run after manual edits
  - Exit code 0 if valid, 1 if errors found (for CI/CD integration)
- [ ] Add API endpoint `/api/validate` for real-time validation
  - Returns JSON with warnings and errors
  - Can be called from frontend to show warnings in UI
  - Optional: Add "Validate Files" button in UI
- [ ] Add validation to README.md Quick Start section
  - Document validation as part of manual editing workflow
  - Example: "After editing team files, run `python -m backend.validation --all`"
- [ ] Add unit tests for validation logic

**Output Format**:
```
Team Data Validation Report
============================

Validating: data/tt-teams/ (20 files)
Validating: data/current-teams/ (12 files)

ERRORS (must fix before using):
  ❌ data/tt-teams/my-team.md
     - Missing required field: team_type
     - Invalid position: x coordinate must be numeric (got "abc")

WARNINGS (recommended fixes):
  ⚠️  data/tt-teams/aws-developer-platform-team.md
     - Was: platform-team.md (filename mismatch)
     - Team name is "AWS Developer Platform Team"
     - Suggested rename: mv platform-team.md aws-developer-platform-team.md
  ⚠️  data/tt-teams/sales-team.md
     - Dependency references non-existent team: "Marketing Team"
     - Check spelling or add Marketing Team file
  ⚠️  data/tt-teams/product-team.md
     - Interaction mode uses invalid value: "sometimes-collaborates"
     - Valid modes: collaboration, x-as-a-service, facilitating

INFO (good practices):
  ℹ️  5 teams missing cognitive_load metadata
  ℹ️  3 teams missing value_stream grouping

Summary: 2 errors, 3 warnings, 3 info messages across 32 files
❌ Validation failed - please fix errors before proceeding
```

**User-Friendly Error Messages**:
- Clear explanation of what's wrong
- Suggestion for how to fix it
- File path and line number when possible
- Links to documentation for complex issues

**Definition of Done**:
- Validation module with comprehensive checks
- CLI tool that's easy for users to run after manual edits
- Clear, actionable error messages with fix suggestions
- API endpoint for real-time validation (optional UI integration)
- Exit codes for CI/CD integration
- Tests covering all validation rules
- Documentation in README.md for validation workflow
- Documentation in SETUP.md for detailed validation rules

---

### 5. Multi-Select Groupings Filter ⭐ USABILITY
**Goal**: Allow selecting multiple value streams and/or platform groupings simultaneously in TT Design view

**Context**:
- Current groupings dropdown only allows "All" or one specific grouping
- Users want to focus on subset of groupings without showing everything
- Example: Show only "E-commerce Experience" + "Enterprise Sales" value streams
- Example: Show "Cloud Infrastructure" + "Data Platform" groupings together

**Tasks**:
- [ ] Replace single-select dropdown with multi-select UI component
  - Consider checkbox list or multi-select dropdown
  - Maintain "All" option for convenience
  - Show selected count in collapsed state (e.g., "3 groupings selected")
- [ ] Update `filters.js` `getFilteredTeams()` to handle array of selected groupings
  - Currently checks `selectedGrouping.startsWith('vs:')` or `'pg:'`
  - Update to check if team's value stream or platform grouping is in selection array
- [ ] Update `legend.js` `updateGroupingFilter()` to populate multi-select component
- [ ] Update state management in `state-management.js`
  - Change `selectedGrouping` from string to array
  - Handle backwards compatibility for saved positions
- [ ] Ensure legend updates correctly when multiple groupings selected
- [ ] Update URL persistence if implemented (for sharing filtered views)

**UI Considerations**:
- Keep interface simple and intuitive
- Preserve "All" as quick reset option
- Show visual feedback of selection count
- Consider "None" option to hide all teams temporarily

**Definition of Done**:
- Can select multiple value streams simultaneously
- Can select multiple platform groupings simultaneously
- Can mix value streams and platform groupings in selection
- Filtering works correctly with multiple selections
- Legend reflects current selection
- "All" option clears selection and shows everything

---

## 🎯 Quick Wins - High Impact, Low Effort (From TT Expert Review)

These items address critical gaps identified in the TT expert review while being easy to implement. Focus here for maximum user value with minimal development time.

---

### QW1. Expand Team API Metadata Fields ⭐⭐⭐⭐⭐ CRITICAL QUICK WIN
**Impact**: HIGH | **Effort**: 1-2 hours | **Addresses**: "Team APIs are cosmetic, not functional"

**Problem from Review**: 
> "Team APIs are about reducing ambiguity and explicit expectations between teams. Your tool shows pretty arrows labeled 'X-as-a-Service' but doesn't tell anyone: What the service actually provides, What the SLA is, How to contact the team, Where documentation lives"

**Solution**: Add Team API fields to YAML front matter that teams actually need:

```yaml
# Example: API Gateway Platform Team
name: API Gateway Platform Team
team_type: platform

# NEW: Team API fields
team_api:
  purpose: "Provide API gateway and service mesh as internal platform"
  
  services_provided:
    - "Kong API Gateway (https://api-gateway.internal)"
    - "Istio Service Mesh (mTLS, traffic management)"
  
  contact:
    slack: "#platform-api-gateway"
    email: "api-gateway@company.com"
    wiki: "https://wiki.company.com/api-gateway"
  
  sla: "99.9% uptime, <100ms P95 latency, 4-hour incident response"
  
  consumers:
    - "E-commerce Checkout Team"
    - "Mobile App Team"
  
  working_hours: "9am-5pm EST, on-call rotation for P1 incidents"
```

**Implementation Tasks**:
- [ ] Add `team_api` section to backend models (optional field)
- [ ] Update team detail modal to show Team API info prominently
  - "Purpose" at top (one-liner)
  - "Contact" section with clickable Slack/email links
  - "Services Provided" as bullet list
  - "SLA" as badge/callout
  - "Consumers" as linked list
- [ ] Update 2 example teams to demonstrate full Team API
  - Pick 1 platform team + 1 stream-aligned team
- [ ] Update template files with Team API section
- [ ] Add to CONCEPTS.md explaining Team API fields

**User Value**: 
- "I need rate limiting - who provides that? API Gateway team, #platform-api-gateway"
- "What's the SLA for the payment platform? 99.9% with 4-hour response"
- Clear expectations reduce cross-team friction

**Definition of Done**:
- Team API fields render in detail modal
- Contact links are clickable (open Slack, email client, wiki)
- Template files include Team API examples with comments
- 2 example teams demonstrate complete Team API

---

### QW2. Show Dependency & Consumer Counts (Detect Bottlenecks) ⭐⭐⭐⭐⭐ CRITICAL QUICK WIN
**Impact**: HIGH | **Effort**: 2-3 hours | **Addresses**: "No organizational sensing capability"

**Problem from Review**:
> "Blocking Dependencies: 'Team X is a dependency for 12 other teams - BOTTLENECK ALERT'"

**Solution**: Calculate and display dependency/consumer counts to identify bottlenecks

**Implementation**:
```javascript
// Calculate for each team
function calculateTeamMetrics(team, allTeams) {
  const inboundDeps = allTeams.filter(t => 
    t.dependencies?.includes(team.name)
  ).length;
  
  const outboundDeps = team.dependencies?.length || 0;
  
  return {
    consumedBy: inboundDeps,  // How many teams depend on me
    dependsOn: outboundDeps    // How many teams I depend on
  };
}
```

**Visual Indicators**:
- Badge on team card: "Consumed by: 12 teams"
- Warning icon if consumed by > 8 teams (bottleneck risk)
- Color coding: 🟢 0-3, 🟡 4-7, 🔴 8+ consumers
- Show in team detail modal: "⚠️ This team is a dependency for 12 other teams - BOTTLENECK RISK"

**Implementation Tasks**:
- [ ] Add `calculateDependencyMetrics()` function in renderer-common.js
- [ ] Display consumer count badge on team cards (small text below team name)
- [ ] Add warning icon for teams with >8 consumers
- [ ] Show full dependency analysis in team detail modal:
  - "Consumed by X teams" (list them)
  - "Depends on Y teams" (list them)
  - Bottleneck warning if applicable
- [ ] Add legend entry explaining dependency count colors
- [ ] Add unit tests for dependency calculation

**User Value**:
- "Oh, our payment platform is consumed by 15 teams - that's why they're overwhelmed!"
- "Team X depends on 9 other teams - massive cognitive load"
- Identifies structural problems immediately

**Definition of Done**:
- Consumer count displayed on all team cards
- Bottleneck warnings appear for high-dependency teams
- Team detail modal shows full dependency breakdown
- Visual color coding works (green/yellow/red)
- Tests cover edge cases (circular deps, no deps)

---

### QW3. Team Size Validation Warnings ⭐⭐⭐⭐ HIGH IMPACT
**Impact**: MEDIUM-HIGH | **Effort**: 1 hour | **Addresses**: "No validation for Dunbar's number"

**Problem from Review**:
> "Teams can have any size in metadata. TT Guidance: 5-9 people per team (Dunbar's number). Fix: Warn if team_size < 5 or > 9"

**Solution**: Add validation warnings for team size in UI

**Implementation**:
- [ ] In team detail modal, show warning if size < 5 or > 9:
  ```
  ⚠️ Team size is 12 people (recommended: 5-9 for effective collaboration)
  Consider: Splitting into 2 teams or reducing scope
  ```
- [ ] Visual indicator on canvas: Yellow border if size outside 5-9 range
- [ ] Add to validation report (backend/validation.py if you implement it)
- [ ] Update CONCEPTS.md with Dunbar's number explanation

**User Value**:
- Catches teams that are too large to be effective
- Educational: "Why is 5-9 the right size?"
- Prevents common anti-pattern (10+ person teams)

**Definition of Done**:
- Warning shows in team modal for teams outside 5-9 range
- Visual indicator on canvas (yellow border)
- CONCEPTS.md explains Dunbar's number
- Example team demonstrates warning (create 12-person team)

---

### QW4. Add "Purpose" One-Liner to Teams ⭐⭐⭐⭐ HIGH IMPACT
**Impact**: MEDIUM-HIGH | **Effort**: 30 minutes | **Addresses**: "What does this team actually do?"

**Problem from Review**:
> "Teams need clear purpose statements. Tool shows team types but not what the team's actual mission is."

**Solution**: Add `purpose` field to all teams (one-sentence mission)

**Implementation**:
```yaml
name: E-commerce Checkout Team
team_type: stream-aligned
purpose: "Own end-to-end checkout experience for web and mobile customers"
# ... rest of metadata
```

**Display**:
- Show purpose prominently at top of team detail modal
- Consider showing truncated purpose on canvas (hover tooltip)
- Makes it immediately clear what each team does

**Implementation Tasks**:
- [ ] Add `purpose` field to backend models (optional string)
- [ ] Display in team detail modal (large text at top)
- [ ] Add to all example teams (write clear one-liners)
- [ ] Add to template files with examples
- [ ] Update CONCEPTS.md with purpose statement guidance

**User Value**:
- "What does the API Gateway team do?" → Read the purpose
- Clear mission statements improve team clarity
- Helps new people understand organization quickly

**Definition of Done**:
- Purpose field renders in team detail modal
- All example teams have clear purpose statements
- Template includes purpose with good examples

---

### QW5. Platform Service Count Badge ⭐⭐⭐ MEDIUM IMPACT
**Impact**: MEDIUM | **Effort**: 1 hour | **Addresses**: "No TVP tracking, platform bloat"

**Problem from Review**:
> "Thinnest Viable Platform (TVP) Tracking - No indication of platform maturity (nascent, viable, bloated?), No tracking of 'platform capability footprint' (how many services?)"

**Solution**: Count and display number of services each platform team provides

**Implementation**:
```yaml
# Platform team metadata
metadata:
  services_provided:
    - "Kong API Gateway"
    - "Istio Service Mesh"
    - "mTLS certificate management"
  # Auto-calculated: service_count = 3
```

**Visual Display**:
- Badge on platform teams: "3 services"
- Warning if > 10 services: "⚠️ 12 services - consider splitting platform"
- Color coding: 🟢 1-5, 🟡 6-10, 🔴 11+

**Implementation Tasks**:
- [ ] Add service count badge to platform team cards
- [ ] Show warning in detail modal if > 10 services
- [ ] Add "Platform Bloat Warning" to CONCEPTS.md
- [ ] Create example platform team with 12+ services showing warning

**User Value**:
- "Our core platform has 15 services - time to split"
- Prevents platform teams from becoming new monoliths
- Early warning before platforms become bottlenecks

**Definition of Done**:
- Service count badge appears on platform teams
- Warning shows for platforms with >10 services
- Example demonstrates bloat warning

---

### QW6. Add "Established" Date to All Teams ⭐⭐⭐ MEDIUM IMPACT
**Impact**: MEDIUM | **Effort**: 30 minutes | **Addresses**: "No team stability tracking"

**Problem from Review**:
> "Team Stability: No way to show 'this team was just formed' vs 'this team has been stable for 2 years'"

**Solution**: Add `established` date to all teams, show age in detail modal

**Implementation**:
```yaml
metadata:
  established: "2023-11"  # or "2025-01" for new teams
```

**Display**:
- Show in detail modal: "Established: November 2023 (2 years ago)"
- Badge for new teams (<3 months): "🆕 New team"
- Helps understand team maturity and stability

**Implementation Tasks**:
- [ ] Add `established` to all example teams (backdate appropriately)
- [ ] Calculate and display team age in detail modal
- [ ] Show "New Team" badge for teams <3 months old
- [ ] Add to template files

**User Value**:
- "This team is brand new, expect some instability"
- "This team has been stable for 3 years, high trust/performance"
- Context for team effectiveness discussions

**Definition of Done**:
- All example teams have established dates
- Team age displays in detail modal
- New team badge appears for recent teams

---

### QW7. Add Anti-Pattern Warnings to Detail Modal ⭐⭐⭐ MEDIUM IMPACT
**Impact**: MEDIUM | **Effort**: 2 hours | **Addresses**: "No organizational sensing"

**Problem from Review**:
> "Your tool should warn about anti-patterns before they happen"

**Solution**: Detect and display common anti-patterns in team detail modal

**Anti-Patterns to Detect**:
```javascript
// When viewing a team, check for:
1. Stream-aligned team providing X-as-a-Service (should go through platform)
2. Team depends on >5 other teams (high coupling)
3. Platform team has >10 services (bloat risk)
4. Team size <5 or >9 (Dunbar's number violation)
5. Collaboration interaction lasting >6 months (should transition)
```

**Display**:
Show in team detail modal warnings section:
```
⚠️ Anti-Pattern Warnings:
• This stream-aligned team provides X-as-a-Service to 3 teams. 
  Consider: Route through a platform team instead.
• This team depends on 8 other teams (recommended: <5).
  Consider: Reducing dependencies or extracting platform.
```

**Implementation Tasks**:
- [ ] Create `detectAntiPatterns()` function
- [ ] Add warnings section to team detail modal
- [ ] Implement 5 basic anti-pattern checks
- [ ] Add educational tooltips (why is this an anti-pattern?)
- [ ] Add to CONCEPTS.md documenting each anti-pattern

**User Value**:
- Proactive warnings before problems become severe
- Educational: "Why is this bad? Here's the TT principle"
- Helps teams course-correct early

**Definition of Done**:
- 5 anti-pattern checks implemented
- Warnings appear in team detail modal
- Tooltips explain why each is a problem
- CONCEPTS.md documents anti-patterns

---

### QW8. Show "Consumer Teams" List for Platform Teams ⭐⭐ LOW-MEDIUM IMPACT
**Impact**: MEDIUM | **Effort**: 30 minutes | **Addresses**: "Who uses this platform?"

**Solution**: In platform team detail modal, list all consumer teams

**Implementation**:
- [ ] Calculate consumers by scanning all teams' dependencies
- [ ] Display in platform team modal: "Consumed by: Team A, Team B, Team C"
- [ ] Make team names clickable (jump to that team)

**User Value**:
- "Which teams use the payment platform? All 8 stream-aligned teams"
- Understand platform impact and importance

---

### 6. Review Team Topologies Official Interaction Modeling Content ⭐ LOW PRIORITY

**Reference**: https://teamtopologies.com/key-concepts-content/team-interaction-modeling-with-team-topologies

**Tasks**:
- [ ] Review official page for terminology updates
  - Check if both "platform team" and "platform group" should be used in descriptions
  - Verify if platform grouping (team-of-teams) has specific guidance
- [ ] Check for alternative interaction mode symbols
  - Verify if 2nd edition introduces new or updated visual symbols
  - Compare current SVG symbols with any official diagrams
  - Assess if modal info content needs updates
- [ ] Update documentation if needed
  - Align terminology with official guidance
  - Update visual symbols if alternatives are recommended
  - Ensure consistency across modals, legend, and docs

---

### 6. Review Team Topologies Official Interaction Modeling Content ⭐ LOW PRIORITY
**Goal**: Ensure visualizer aligns with latest official Team Topologies guidance

**Reference**: https://teamtopologies.com/key-concepts-content/team-interaction-modeling-with-team-topologies

**Tasks**:
- [ ] Review official page for terminology updates
  - Check if both "platform team" and "platform group" should be used in descriptions
  - Verify if platform grouping (team-of-teams) has specific guidance
- [ ] Check for alternative interaction mode symbols
  - Verify if 2nd edition introduces new or updated visual symbols
  - Compare current SVG symbols with any official diagrams
  - Assess if modal info content needs updates
- [ ] Update documentation if needed
  - Align terminology with official guidance
  - Update visual symbols if alternatives are recommended
  - Ensure consistency across modals, legend, and docs

**Definition of Done**:
- Official content reviewed and documented
- Any terminology/symbol discrepancies identified
- Updates applied if needed, or backlog item closed as "aligned"

---

### 7. Comprehensive Template Library (Follow-up to #3) 📚 DOCUMENTATION
**Goal**: Expand template collection beyond the 2 essential team templates from item #3

**Context**:
- Item #3 provides 2 simple markdown templates for quick start (v1.0)
- This item adds comprehensive templates for configuration files and advanced use cases
- For users who want deeper customization of departments, team types, and structure

**Tasks**:
- [ ] Create department/org hierarchy template: `templates/organization-hierarchy-template.json`
  - Example structure with managers and departments
  - Comments explaining hierarchy relationships
  - Sample data for 2-3 levels (executives, directors, managers)
- [ ] Create team types config template: `templates/team-types-template.json`
  - Example team types with IDs, names, descriptions, colors
  - Comments explaining when to use each team type
  - Separate examples for Current State (functional teams) vs TT Design (4 fundamental types)
- [ ] Create platform capabilities template
  - Example platform with detailed capabilities and consumers
  - Demonstrate platform grouping membership
- [ ] Create value stream template
  - Example value stream configuration
  - Team assignments and flow metrics structure
- [ ] Add templates README: `templates/README.md`
  - Explain purpose of each template
  - Usage examples and customization tips
  - Link to main SETUP.md documentation

**Definition of Done**:
- All advanced template files created with helpful comments
- Templates cover JSON configuration files and specialized use cases
- README.md in templates directory explains all files
- SETUP.md links to template library for advanced users

---

### 8. Platform Capabilities Display ⭐ MEDIUM PRIORITY
**Goal**: Show what services platforms provide

**Tasks**:
- [ ] Add "capabilities" section to platform team cards
- [ ] List key platform services on canvas (compact view)
- [ ] Show number of consumer teams
- [ ] Link to detailed capability list in team detail modal
- [ ] Visual indicator for platform groupings

**Sample data ready**: Platform teams have `metadata.capabilities` and `metadata.consumers`

**Definition of Done**:
- Platform teams show 2-3 key capabilities on card
- Full capability list in detail modal
- Visual distinction for platform grouping membership

---

## 📋 Backlog - Prioritized Features

### Theme: Value Stream Management

#### Value Stream Flow Metrics
**Priority**: High
**Effort**: Large

- [ ] Add flow metrics to value stream groupings
  - Lead time per value stream
  - Deployment frequency
  - Change fail rate
  - MTTR (Mean Time To Restore)
- [ ] Visual indicators for flow health (🟢🟡🔴)
- [ ] Trend indicators (improving/declining)
- [ ] Link to external metrics dashboards

**Sample data**: Add `flow_metrics` to value stream metadata

---

#### Value Stream Dependencies
**Priority**: Medium
**Effort**: Medium

- [ ] Visualize dependencies between value streams
- [ ] Highlight problematic cross-value-stream dependencies
- [ ] Show wait time on dependencies
- [ ] Suggest opportunities to reduce coupling

---

#### Value Stream Ownership
**Priority**: Low
**Effort**: Small

- [ ] Add value stream executive sponsor/owner
- [ ] Show on canvas or in detail view
- [ ] Accountability for value stream health

---

#### Value Stream / SAFe Train Grouping in Current State View
**Priority**: High
**Effort**: Medium

**Context**: Organizations often organize around value streams or SAFe Agile Release Trains (ARTs) rather than traditional org-chart hierarchies. Current State view currently groups teams by line manager (org-chart structure), but this may not reflect the actual value delivery structure.

**Goal**: Provide alternative grouping option for Current State view based on value stream/train membership rather than org-chart hierarchy.

**Tasks**:
- [ ] Add `value_stream` or `train` metadata to team YAML files
  - Support multiple trains per team (some teams serve multiple value streams)
- [ ] Add view mode toggle or layout option for Current State view
  - "Org Chart" (current default - by line manager)
  - "Value Streams" (group by train/value stream)
- [ ] Design visual representation for value stream grouping
  - Horizontal swim lanes per value stream?
  - Vertical columns per train?
  - Colored backgrounds similar to TT Design view?
  - Department labels vs Train labels
- [ ] Update auto-align logic to position teams within train groupings
- [ ] Consider cross-train team visualization (teams in multiple trains)
- [ ] Add filter dropdown for specific trains (similar to current grouping filter)

**Visual Design Questions**:
- Should trains be visualized as swim lanes (horizontal bands)?
- Should department structure still be visible within trains?
- How to show teams that span multiple trains?
- Should "Actual Comms" lines cross train boundaries differently?

**Sample Data Needed**:
```yaml
# Example team metadata additions
metadata:
  value_stream: "E-commerce Platform"  # or SAFe train name
  # OR support multiple:
  value_streams:
    - "E-commerce Platform"
    - "Customer Experience"
```

**Definition of Done**:
- Teams can be tagged with value stream/train membership
- Current State view has toggle between "Org Chart" and "Value Streams" layouts
- Auto-align works for train-based grouping
- Visual distinction between trains (swim lanes, colors, or labels)
- Documentation updated with value stream grouping explanation
- Sample data demonstrates multi-train organization

---

### Theme: Cognitive Load Management

#### Cognitive Load Heatmap View
**Priority**: High
**Effort**: Medium

- [ ] Alternative view mode showing cognitive load heatmap
- [ ] Color-code entire canvas by team cognitive load
- [ ] Quick identification of struggling teams
- [ ] Filter to show only high-load teams

---

#### Responsibility Tracking
**Priority**: Medium
**Effort**: Medium

- [ ] List all team responsibilities on team card (expandable)
- [ ] Count of responsibilities per team
- [ ] Flag teams with too many responsibilities
- [ ] Suggest simplification opportunities

**Sample data**: Teams have `metadata.responsibilities` array

---

#### Cognitive Load Recommendations
**Priority**: Low
**Effort**: Large

- [ ] Suggest when teams should be split
- [ ] Recommend platform services to reduce load
- [ ] Identify enabling team opportunities
- [ ] AI-powered cognitive load analysis

---

### Theme: Platform Engineering

#### Thinnest Viable Platform (TVP) Maturity
**Priority**: Medium
**Effort**: Medium

- [ ] Add maturity indicator to platform teams
  - MVP (just started)
  - Growing (adding capabilities)
  - Mature (stable, well-adopted)
  - Legacy (needs modernization)
- [ ] Show platform evolution over time
- [ ] Track platform adoption metrics

---

#### Platform Consumer Relationships
**Priority**: Medium
**Effort**: Small

- [ ] Visual lines from platforms to consumer teams
- [ ] Show which teams consume which platforms
- [ ] Highlight teams not using available platforms
- [ ] Platform adoption metrics

---

#### Platform NPS / Satisfaction
**Priority**: Low
**Effort**: Small

- [ ] Add internal NPS score for platforms
- [ ] Collect feedback from consumer teams
- [ ] Display satisfaction indicator on platform cards

**Sample data**: Platforms can have `metadata.consumer_nps`

---

### Theme: Team Interaction Evolution

#### Interaction Timeline
**Priority**: High
**Effort**: Large

- [ ] Git history integration to show team structure evolution
- [ ] Timeline scrubber to view past states
- [ ] Show how interaction modes changed over time
  - Collaboration → X-as-a-Service transitions
  - Team splits and merges
- [ ] Animated transitions between states

---

#### Temporary vs Permanent Interactions
**Priority**: High
**Effort**: Medium

- [ ] Visual distinction for temporary collaborations
- [ ] Show end date for temporary interactions
- [ ] Flag overdue "temporary" collaborations that became permanent
- [ ] Suggest when collaboration should transition to X-as-a-Service

**Sample data**: Add duration to interaction_modes: `"Team A": {"mode": "collaboration", "duration": "3 months", "end_date": "2026-03-01"}`

---

#### Interaction Mode Recommendations
**Priority**: Low
**Effort**: Large

- [ ] Suggest when teams should collaborate
- [ ] Identify when X-as-a-Service is more appropriate
- [ ] Flag too many collaboration relationships (team overload)
- [ ] Conway's Law violation detection

---

### Theme: Architecture & Conway's Law

#### Architecture Diagram Integration
**Priority**: Medium
**Effort**: Large

- [ ] Import draw.io or other architecture diagrams
- [ ] Side-by-side: team structure + system architecture
- [ ] Visual connections showing team-to-component ownership
- [ ] Conway's Law violation highlighting
  - Team boundaries cutting across system boundaries
  - Multiple teams owning one component

---

#### System Ownership Mapping
**Priority**: Medium
**Effort**: Medium

- [ ] Tag teams with systems/services they own
- [ ] Show service architecture on canvas (simplified)
- [ ] Visualize which team owns which services
- [ ] Identify orphaned services (no clear owner)

---

### Theme: Sensing & Adaptation

#### Problem Identification View
**Priority**: High
**Effort**: Medium

- [ ] "Problems" overlay showing pain points
  - Overloaded teams (red)
  - Blocking dependencies (red lines)
  - Slow flow (metrics-based)
- [ ] Actionable recommendations
- [ ] Priority ranking of issues

---

#### Bottleneck Detection
**Priority**: High
**Effort**: Medium

- [ ] Identify teams that are dependencies for many others
- [ ] Show dependency count per team
- [ ] Visualize dependency chains (A → B → C → D)
- [ ] Suggest platform extraction opportunities

---

#### Feedback Loop Visualization
**Priority**: Low
**Effort**: Medium

- [ ] Document team feedback mechanisms
- [ ] Show sensing loops (how teams detect change)
- [ ] Adaptation history (how teams evolved)

---

### Theme: User Experience

#### Visibility Controls ✅ Already in Future Enhancements
**Priority**: Medium
**Effort**: Small

- [ ] Toggle visibility of individual teams
- [ ] Hide/show departments in Current State view
- [ ] Hide/show value streams in TT Design view
- [ ] Save visibility preferences

---

#### High-Resolution Display Support
**Priority**: Medium
**Effort**: Medium

**Known Limitation**: Canvas scaling and visualization need review for high-resolution displays (40+ inch monitors, 4K/5K displays)

**Issues**:
- [ ] Canvas may not scale properly on very large/high-DPI displays
- [ ] Scroll bars behavior on large screens
- [ ] Viewport sizing and initial zoom level for different display sizes
- [ ] Team box sizes and text readability at different resolutions
- [ ] Auto-align calculations for different canvas dimensions

**Possible Solutions**:
- Detect display size and adjust initial zoom/scale
- Implement responsive canvas sizing based on viewport
- Add min/max zoom limits appropriate for display size
- Consider CSS-based scaling alternatives to manual canvas calculations

---

#### Multiple Layout Options
**Priority**: Low
**Effort**: Large

- [ ] Value stream swim lanes layout
- [ ] Radial platform grouping layout
- [ ] Hierarchical tree layout
- [ ] Circle packing layout
- [ ] Let user choose preferred layout per view

---

#### Mobile/Tablet Support
**Priority**: Low
**Effort**: Large

- [ ] Responsive design for tablets
- [ ] Touch-friendly interactions
- [ ] View-only mode for mobile phones

---

#### Collaboration Features
**Priority**: Low
**Effort**: X-Large

- [ ] Real-time multi-user editing
- [ ] Comments and annotations
- [ ] Change proposals and reviews
- [ ] Export to shareable link

---

### Theme: Data Integration

#### Import from External Sources
**Priority**: Medium
**Effort**: Large

- [ ] Import team data from:
  - JIRA / Azure DevOps (teams, assignments)
  - ServiceNow (team records, dependencies)
  - Confluence / Notion (team documentation)
  - GitHub org structure (repository owners)
- [ ] Automatic team discovery
- [ ] Sync external changes

---

#### Flow Metrics Integration
**Priority**: High
**Effort**: Large

- [ ] Connect to:
  - DORA metrics sources
  - CI/CD systems (deployment frequency)
  - Incident management (MTTR)
  - Version control (lead time)
- [ ] Real-time metrics display
- [ ] Historical trends

---

#### Export Enhancements
**Priority**: Low
**Effort**: Small

- [ ] Export to PowerPoint/Keynote
- [ ] Export to PDF with multiple pages
- [ ] ASCII art export for documentation
- [ ] Export to PNG/JPEG

---

## 🧹 Technical Debt & Improvements

### Code Quality
- [ ] Add TypeScript (evaluate if worth it)
- [ ] Improve test coverage (currently basic)
- [ ] Add E2E tests for new features
- [ ] Refactor large components

### Known Issues

#### Current State Connection Arrows Not Visible 🐛
**Priority**: Low (UX/Nice-to-have)
**Effort**: Medium (needs investigation)

**Problem**: Bidirectional arrow triangles at ends of "Actual Comms" lines in Current State view are not rendering on canvas, despite working perfectly in legend SVG.

**Symptoms**:
- Legend shows arrows correctly (70px SVG with triangles at both ends)
- Canvas only shows fat gray line without arrow triangles
- Code appears correct: `ctx.fill()` with proper triangle geometry

**Attempted Fixes**:
1. ✗ Reordered drawing (arrows after line) to avoid overlap
2. ✗ Shortened line by arrow length to prevent covering
3. ✗ Increased arrow size from 10px → 16px → 20px
4. ✗ Changed from stroke to fill with `ctx.fill()` + `ctx.stroke()`
5. ✗ Added `ctx.save()`/`ctx.restore()` for context isolation
6. ✗ Set explicit `fillStyle` and `strokeStyle` for arrows
7. ✗ Reduced line width to 1px (debugging) - still no arrows visible
8. ✗ Changed angle from π/7 to π/6 for wider triangles

**Code Location**: `frontend/renderer-common.js` - `drawActualCommsConnection()` function (lines ~197-255)

**Hypotheses to Explore**:
- Canvas z-index or layering issue (team boxes drawn after connections?)
- Global canvas transform/clip affecting arrow rendering
- Arrow coordinates landing outside visible canvas area
- Browser rendering quirk with canvas fill operations
- Need to call `ctx.beginPath()` before each triangle separately

**Workaround**: Legend clearly shows the connection type, so functionality is not impaired.

**Next Steps**:
- Add console.log to verify arrow coordinates are reasonable
- Try drawing test rectangles at arrow positions to verify visibility
- Check if team boxes or other elements are obscuring arrows
- Review canvas rendering order in renderer-current.js

### Performance
- [ ] Optimize canvas rendering for 50+ teams
- [ ] Lazy loading for team details
- [ ] Virtualization for large team lists

### Developer Experience
- [ ] Hot module reload
- [ ] Better error messages
- [ ] Development mode with mock data
- [ ] API client generation

---

## 📚 Documentation Improvements

- [ ] Video walkthrough / tutorial
- [ ] Team Topologies concepts primer
- [ ] Example use cases and scenarios
- [ ] Migration guide (from other tools)
- [ ] API documentation improvements
- [ ] Contributing guide expansion

---

## 🎯 v1.0 Release Checklist

**Target**: Q1 2026

Must-haves for v1.0:
- [x] Change to "TT Design" naming
- [x] Value stream visual grouping
- [x] Platform grouping visualization
- [x] Book-accurate team shapes
- [x] Auto-align for both views
- [ ] Cognitive load indicators
- [ ] Platform capabilities display
- [x] Comprehensive sample data
- [ ] User documentation improvements
- [ ] Demo video
- [ ] GitHub release notes

---

## 💡 Ideas for Future Consideration

These are interesting ideas but not prioritized yet:

- AI-powered team topology recommendations
- Integration with Team API template repositories
- Team health assessment framework
- Multi-organization / portfolio view
- Team interaction cost calculator
- Gamification (team topology maturity score)
- Community template library
- Plugin architecture for extensibility

---

## 📝 Notes

### Prioritization Criteria
1. **User Value**: Does this help users make better decisions?
2. **TT Alignment**: Does this align with Team Topologies principles (especially 2nd edition)?
3. **Effort**: Can we deliver this incrementally?
4. **Dependencies**: What else needs to be done first?
5. **Sample Data**: Do we have realistic sample data to test with?

### Review Cadence
- Review backlog every 2 weeks
- Re-prioritize based on learning
- Archive or remove items that no longer make sense

### Definition of Done
- Feature implemented and tested
- Sample data updated to demonstrate feature
- Documentation updated
- User can use feature without explanation
