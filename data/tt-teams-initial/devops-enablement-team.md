---
name: DevOps Enablement Team
team_type: enabling
position:
  x: 600.0
  y: 400.0
metadata:
  size: 3
  cognitive_load: medium
  established: 2026-01
value_stream: N/A (enables stream-aligned teams)
origin_teams: ["DevOps & Infrastructure Team", "New hires"]
---

# DevOps Enablement Team

## Team name and focus

DevOps Enablement Team – Enabling team helping stream-aligned teams adopt cloud-native practices, microservices patterns, and the new Cloud Platform.

## Team type

enabling

## Part of a value stream?

No - Enabling teams help stream-aligned teams increase their capabilities. We are temporary collaborators, not permanent dependencies.

## Origin Story

**Created**: January 2026 (First TT transformation step)

**Why created?**: Splitting the monolith and moving to microservices is a big change. Our stream-aligned teams have strong feature development skills, but limited experience with:
- Cloud-native deployment patterns
- Microservices architecture and testing
- Using self-service platforms

Rather than making them figure it out alone (slow, error-prone), we created this temporary enabling team to:
- **Teach**, not do the work for them
- **Embed with teams** for 6-8 weeks
- **Transfer knowledge**, then move to next team

**Team members from**:
- 2 engineers from old DevOps team (cloud expertise)
- 1 new hire (microservices expert)

## Services provided (if applicable)

N/A - Enabling teams don't provide services, they increase capabilities.

## Service-level expectations (SLA)

- **Engagement length**: 6-8 weeks per team
- **Availability**: Embedded full-time during engagement
- **Knowledge transfer**: Documented patterns and runbooks

**Not a permanent dependency**:
- After 6-8 weeks, we move to next team
- Goal is capability increase, not ongoing support

## Software owned and evolved by this team

None - We don't own software. We help other teams improve theirs.

## Technologies

**Expertise in** (what we teach):
- Cloud-native patterns (12-factor apps, microservices)
- Testing strategies (contract testing, service virtualization)
- CI/CD best practices (trunk-based development, feature flags)
- Platform adoption (using Cloud Platform Team's self-service tools)
- Observability (structured logging, distributed tracing)

## Dependencies and interaction modes

| Team | Interaction Mode | Purpose | Duration |
|------|------------------|---------|----------|
| Dispatch & Fleet Team | Facilitating | Teaching cloud-native deployment patterns | 6 weeks (ending Feb 2026) |
| Delivery & Routing Team | Facilitating | Teaching microservices testing strategies | 6 weeks (ending Feb 2026) |
| Cloud Platform Team | Collaboration | Defining best practices for platform adoption | 4 weeks (ending Feb 2026) |

**Future engagements** (planned):
- Mobile App Team (mobile CI/CD patterns) - Mar 2026
- Web Frontend Team (frontend deployment) - Apr 2026

## Flow Metrics

### Enablement Effectiveness
- **Teams enabled**: 2 currently (Dispatch & Fleet, Delivery & Routing)
- **Knowledge transfer success**: Measured by team confidence surveys (target: 7/10)
- **Runbook creation**: 8 documented patterns so far

### Team Capability Increase
**Dispatch & Fleet Team** (5 weeks into engagement):
- Deployment frequency: 1x/week → 2-3x/week
- Team confidence in deployments: 4/10 → 7/10
- Platform self-service adoption: 85%

**Delivery & Routing Team** (4 weeks into engagement):
- Testing confidence: 5/10 → 7/10
- Contract testing adoption: 100% (API tests with Route Optimization Platform)

## Cognitive Load Assessment

- **Overall**: Medium (appropriate for enabling team)

**What creates load**:
- Context switching between teams (2 simultaneous engagements)
- Documenting patterns while teaching
- Balancing hands-on vs hands-off

**What keeps it manageable**:
- Clear engagement timeboxes (6-8 weeks)
- Only 2 teams at once (focus)
- Not responsible for production systems

## Team Composition

- 1 Enablement Lead (former DevOps Team, microservices expert)
- 1 Cloud Engineer (from DevOps Team, AWS expertise)
- 1 Senior Engineer (new hire, microservices testing specialist)

## Current Challenges

**Engagement Management**:
- Knowing when to step back (let teams struggle productively)
- Avoiding "just doing it for them" (defeats purpose)
- Measuring knowledge transfer effectiveness

**Organizational Culture**:
- Some teams expect us to be "permanent consultants" (we're not!)
- Setting expectations: "We're here for 6-8 weeks, then you're on your own"

**Documentation**:
- Capturing patterns while teaching (time constraint)
- Making docs findable after we leave

## Success So Far (1 Month In)

✅ Both current teams progressing (confidence scores increasing)
✅ 8 documented patterns published to platform docs
✅ Teams deploying independently (not waiting for us)
✅ Cloud Platform adoption accelerated (we remove friction)

## Enabling Philosophy

**We teach, not do**:
- Pair programming (not solo coding)
- Reviewing their PRs (not writing code for them)
- Answering questions (not taking over)

**Time-boxed engagements**:
- 6-8 weeks is enough to transfer core capabilities
- Longer risks dependency (they stop learning)
- After engagement: they're on their own (with platform support)

**Measure success by absence**:
- If teams stop asking us questions → success!
- If they deploy confidently without us → success!
- If we become a permanent dependency → failure!

## Contact

- **Slack**: #devops-enablement-team
- **Team Lead**: Lisa Wang (lisa.wang@logicore.com)
- **Request engagement**: Fill out [Enablement Request Form](https://platform.logicore.com/enablement-request)
