# Example Data: LogiCore Systems

The repository includes fictitious example data to demonstrate Team Topologies transformation concepts.

## The Fictitious Company

**LogiCore Systems** started in 2015 as a small route optimization tool for local delivery companies. After rapid growth driven by the e-commerce boom, they now serve:

- **B2B Services**: DispatchHub, FleetMonitor, RouteOptix for fleet operators
- **B2C Services**: Driver mobile apps, customer delivery tracking, proof of delivery

## The Challenge

Like many successful startups that scaled quickly, LogiCore faces typical organizational challenges:
- Monolithic architecture with component teams organized by technology layer
- Handoffs creating delays (Dev → QA → Ops)
- Shared service bottlenecks (Database team blocking everyone)
- Weekly "integration meetings" with 15+ people
- Teams owning too many responsibilities (cognitive overload)

Their baseline structure shows **SAFe/LeSS influence** - they attempted to scale using Agile Release Trains and feature teams, but still struggle with coordination overhead and handoffs.

## Two TT Design Variants

The repository includes **two example TT designs** representing different stages of transformation:

### 1. First-Step Transformation (Initial)

**Location**: `data/tt-teams-initial/`

**Stage**: First 3-6 months of transformation

**Philosophy**:
- Start small, learn fast
- Focus on highest-pain areas first
- Establish patterns before scaling
- Build organizational muscle memory

**Key Changes from Baseline**:
- Split the Backend Services monolith into focused teams (Dispatch & Fleet, Orders & Delivery)
- Create initial Platform grouping (Cloud Infrastructure Platform)
- Introduce first Enabling team (DevOps Enablement)
- Establish X-as-a-Service interactions with platform teams
- Fewer teams (~20), simpler structure

**Best for**: Workshops, explaining "how to start", showing realistic first steps

### 2. Mid-Stage Transformation (Default)

**Location**: `data/tt-teams/`

**Stage**: 6-12 months into transformation

**Philosophy**:
- Patterns established and working
- Expanded coverage of value streams
- Mature platform capabilities
- Full team interaction mode modeling

**Key Changes from First-Step**:
- More stream-aligned teams organized by value streams (B2B Services, B2C Services)
- Comprehensive Platform grouping with multiple platform teams (CI/CD, Observability, API Gateway, etc.)
- Multiple Enabling teams (DevOps, Data Engineering, Security Compliance)
- Complicated Subsystem team (Route Optimization Platform)
- Well-defined interaction modes across all teams
- More teams (~34), richer structure

**Best for**: Demonstrating mature TT design, showing full capability model

## How to Switch Between Variants

By default, the app loads the mid-stage variant. To use the first-step variant:

**Local (Linux/Mac):**
```bash
export TT_TEAMS_VARIANT=tt-teams-initial
python -m uvicorn main:app --reload
```

**Local (Windows PowerShell):**
```powershell
$env:TT_TEAMS_VARIANT="tt-teams-initial"
python -m uvicorn main:app --reload
```

**Docker/Podman:**
```bash
docker run -p 8000:8000 -e TT_TEAMS_VARIANT=tt-teams-initial team-topologies-viz
```

To switch back to mid-stage, unset the variable or set it to `tt-teams`.

## Baseline View (Pre-TT)

**Location**: `data/current-teams/`

The baseline shows LogiCore's structure **before** Team Topologies transformation:
- ~22 teams organized by function/technology
- Component teams: Backend Services, Web Frontend, Mobile, QA & Testing
- Platform teams: Database, DevOps & Infrastructure
- Product lines: DispatchHub, FleetMonitor, RouteOptix, Driver App, Customer Portal
- Business streams: Fleet Operations, Last Mile Delivery, Data & Analytics

Three visualization perspectives:
- **Hierarchy**: Classic org chart (reporting lines)
- **Product Lines**: Product lanes + shared teams
- **Business Streams**: Swimlanes grouped by business value streams

## Transformation Story Summary

| Stage | Teams | Key Pattern | Purpose |
|-------|-------|-------------|---------|
| **Baseline (Pre-TT)** | ~22 | Component teams by technology | Show typical scaling pain |
| **First-Step** | ~20 | Split biggest bottleneck, basic platform | Start small, learn patterns |
| **Mid-Stage** | ~34 | Full value streams, mature platform | Show evolved TT design |

**Note**: Team count increased because monolithic teams were split into focused, autonomous teams with clear boundaries and reduced cognitive load.

## Disclaimer

All example data (company name, team names, product names, technical details, organizational structure) is **completely fictitious** for demonstration purposes only. Any resemblance to real companies or products is coincidental.

## Using This for Your Organization

To replace with your own data:

1. **Backup the examples**: Copy `data/` folder elsewhere if you want to reference it later
2. **Start with templates**: Use files in `templates/` directory
3. **Document your baseline**: Create team files in `data/current-teams/`
4. **Design your TT structure**: Create team files in `data/tt-teams/`
5. **Iterate**: Use snapshots to track your design evolution

See [SETUP.md](SETUP.md#data-organization) for detailed data structure documentation.

### Interaction Formats

The tool supports **two formats** for documenting team interactions:

**YAML Array (Recommended)**:
```yaml
---
name: My Team
interactions:
  - team: Platform Team
    mode: x-as-a-service
    purpose: Using CI/CD pipeline
  - team: Partner Team
    mode: collaboration
    purpose: Building shared feature
---
```

**Advantages**: Cleaner, structured, less parsing errors, easier to edit  
**Used in**: tt-teams-initial example dataset

**Markdown Table (Alternative)**:
```markdown
## Teams we currently interact with

| Team Name | Interaction Mode | Purpose | Duration |
|-----------|------------------|---------|----------|
| Platform Team | X-as-a-Service | Using CI/CD pipeline | Ongoing |
| Partner Team | Collaboration | Building shared feature | 3 months |
```

**Advantages**: Visible in rendered markdown, familiar table format  
**Used in**: tt-teams (mid-stage) example dataset

Both formats are validated and render identically in the visualization.

## References

- Team Topologies book: https://teamtopologies.com/
- Key concepts: https://teamtopologies.com/key-concepts
- Team API Template: https://github.com/TeamTopologies/Team-API-template
- Team Shape Templates: https://github.com/TeamTopologies/Team-Shape-Templates

---

## Appendix: First-Step Transformation Details

This section provides deeper insight into the first-step (initial) transformation design.

### Design Philosophy

The first-step transformation represents the **first 3-6 months** of adopting Team Topologies:
- Start small, learn fast
- Focus on highest-pain areas first
- Establish patterns before scaling
- Build organizational muscle memory

### What Changed From Baseline?

#### 1. Split the Monolith (Backend Services Team)

**Problem**: Backend Services Team had very-high cognitive load (routing + dispatch + tracking + delivery + APIs)

**Solution**: Split into 2 focused stream-aligned teams:
- **Dispatch & Fleet Team** - Real-time dispatch and fleet tracking
- **Delivery & Routing Team** - Route optimization and customer delivery

#### 2. Create Thinnest Viable Platform

**Problem**: DevOps Team was a bottleneck (ticket-based, manual deployments)

**Solution**: Transform to thin platform team:
- **Cloud Platform Team** - Self-service AWS infrastructure and CI/CD

#### 3. Add Enabling Team for Adoption

**Problem**: Teams need help adopting new patterns (platform, stream-aligned ways of working)

**Solution**: Create temporary enabling team:
- **DevOps Enablement Team** - Help teams adopt cloud-native practices (6-8 week engagements)

#### 4. Keep Complicated Subsystem Clear

**Retained**: Route Optimization Team stays as complicated subsystem (specialized OR expertise)

### What We Didn't Change (Yet)

- Mobile App Team - Keep as-is for now (will tackle in Phase 2)
- Web Frontend Team - Keep as-is (will align in Phase 2)
- Database Team - Still a bottleneck, but addressing platform first
- QA Team - Still separate, will tackle testing-in-teams later
- Architecture Team - Still governance-focused, will evolve to enabling

### Origin Mapping

| TT Team (Initial) | Origin (Baseline) | Notes |
|-------------------|-------------------|-------|
| Dispatch & Fleet Team | Backend Services Team (split) | Real-time dispatch + fleet tracking |
| Delivery & Routing Team | Backend Services Team (split) | Route optimization + customer delivery |
| Cloud Platform Team | DevOps & Infrastructure Team | Transformed to platform |
| DevOps Enablement Team | *New* | Created to help adoption |
| Route Optimization Platform Team | Route Optimization Team | Kept as complicated subsystem |

### Success Criteria (First 6 Months)

- ✅ Reduce cognitive load on former Backend Services engineers
- ✅ Eliminate DevOps ticket queue (self-service platform adoption)
- ✅ Deploy independently (no shared monolith releases)
- ✅ Measure: Deployment frequency, lead time, team satisfaction

### Next Steps (Phase 2)

After 6 months, evaluate and consider:
- Split Mobile App Team into iOS/Android stream-aligned teams
- Transform Database Team to data platform
- Evolve Architecture Team to enabling team
- Add more stream-aligned teams as needed
- Scale platform team if adoption requires it
