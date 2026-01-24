---
name: Dispatch & Fleet Team
team_type: stream-aligned
position:
  x: 126.0
  y: 336.0
metadata:
  size: 6
  cognitive_load: medium
  established: 2026-01
value_stream: B2B Fleet Management
---

# Dispatch & Fleet Team

## Team name and focus

Dispatch & Fleet Team – Stream-aligned team owning real-time dispatch and fleet tracking capabilities for LogiCore's B2B fleet management platform.

## Team type

stream-aligned

## Part of a value stream?

Yes - B2B Fleet Management

This team delivers capabilities for enterprise fleet operators to manage their daily operations.

## Origin Story

**Created**: January 2026 (First TT transformation step)

**Split from**: Backend Services Team (former monolith)

**Why split?**: The Backend Services Team had very-high cognitive load - they owned routing + dispatch + tracking + delivery + APIs. This was unsustainable. In our first TT step, we split the monolith into two focused stream-aligned teams based on natural capability boundaries.

This team took: Real-time dispatch + fleet tracking (tightly coupled capabilities)

## Services provided (if applicable)

N/A - Stream-aligned teams deliver customer value, not internal services.

## Service-level expectations (SLA)

- Dispatch API availability: 99.9% uptime
- Real-time tracking updates: < 3 second lag
- Driver assignment: < 500ms response time

## Software owned and evolved by this team

- Dispatch Management Service (microservice extracted from monolith)
- Fleet Tracking Service (microservice extracted from monolith)
- Driver Mobile API (REST API for driver app)
- Fleet Monitoring Dashboard (React web app)

## Technologies

- **Backend**: Python 3.11, FastAPI
- **Database**: PostgreSQL (RDS), Redis cache
- **Real-time**: WebSockets for live updates
- **Infrastructure**: AWS ECS, managed by Cloud Platform Team
- **Monitoring**: Prometheus, Grafana (platform-provided)

## Dependencies and interaction modes

| Team | Interaction Mode | Purpose | Duration |
|------|------------------|---------|----------|
| Cloud Platform Team | X-as-a-Service | AWS infrastructure, CI/CD pipelines | Ongoing |
| DevOps Enablement Team | Facilitating | Learning cloud-native deployment patterns | 6 weeks (ending Feb 2026) |
| Delivery & Routing Team | Collaboration | Defining API contract for route → dispatch handoff | 8 weeks (ending Mar 2026) |

## Flow Metrics

### Deployment Frequency
- **Current**: 2-3 times per week
- **Goal**: Daily deployments by Q2 2026
- **Baseline (monolith)**: Once every 2 weeks

### Lead Time for Changes
- **Current**: 4 days (code commit to production)
- **Goal**: < 2 days
- **Baseline (monolith)**: 12 days

### Change Failure Rate
- **Current**: 8% (learning new deployment patterns)
- **Goal**: < 5%
- **Baseline (monolith)**: 15%

### Time to Restore Service
- **Current**: 45 minutes (can deploy fix independently now!)
- **Goal**: < 30 minutes
- **Baseline (monolith)**: 4 hours (coordination with multiple teams)

## Cognitive Load Assessment

- **Overall**: Medium (appropriate for stream-aligned team)
- **Down from**: Very-high (in monolith days)

**What reduced the load**:
- Clear team boundary (dispatch + tracking, nothing else)
- No dependency on Database Team for every change (platform provides databases)
- No coordination with QA Team (we test our own code)
- Fast deployments (no monolith coordination)

## Team Composition

- 1 Tech Lead (former Backend Services Team)
- 2 Senior Backend Engineers (from monolith split)
- 2 Full-Stack Engineers (backend + frontend for dashboard)
- 1 Product Owner (embedded)

## Current Challenges

**Early Days**:
- Still extracting code from old monolith (30% complete)
- Learning microservices patterns (DevOps Enablement helping)
- Establishing contract with Delivery & Routing Team

**Platform Adoption**:
- Learning to use Cloud Platform Team's self-service tools
- Getting comfortable with deployment autonomy

## Success So Far (1 Month In)

✅ Deployed first independent microservice (Dispatch Management)
✅ Reduced deployment friction (no more tickets to DevOps)
✅ Team morale improved (clear ownership, faster feedback)
✅ Response time improved (< 500ms for dispatch decisions)

## Contact

- **Slack**: #dispatch-fleet-team
- **Team Lead**: Sarah Chen (sarah.chen@logicore.com)
- **On-call**: PagerDuty rotation