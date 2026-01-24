---
name: Delivery & Routing Team
team_id: delivery-and-routing-team
team_type: stream-aligned
position:
  x: 204.0
  y: 165.0
metadata:
  size: 6
  cognitive_load: medium
  established: 2026-01
value_stream: B2B Fleet Management
---

# Delivery & Routing Team

## Team name and focus

Delivery & Routing Team – Stream-aligned team owning delivery management and route integration for LogiCore's B2B fleet management platform.

## Team type

stream-aligned

## Part of a value stream?

Yes - B2B Fleet Management

This team delivers capabilities for managing deliveries and integrating with route optimization.

## Origin Story

**Created**: January 2026 (First TT transformation step)

**Split from**: Backend Services Team (former monolith)

**Why split?**: The Backend Services Team was overloaded with too many responsibilities (very-high cognitive load). In our first transformation step, we split it into two focused teams.

This team took: Delivery management + route integration (customer-facing delivery features)

## Services provided (if applicable)

N/A - Stream-aligned teams deliver customer value, not internal services.

## Service-level expectations (SLA)

- Delivery API availability: 99.9% uptime
- Route updates: < 5 second propagation
- Delivery proof upload: < 30 seconds

## Software owned and evolved by this team

- Delivery Management Service (microservice extracted from monolith)
- Route Integration Service (microservice, integrates with Route Optimization Platform)
- Customer API (REST API for customer tracking)
- Delivery Status Dashboard (React web app)

## Technologies

- **Backend**: Python 3.11, FastAPI
- **Database**: PostgreSQL (RDS), Redis cache
- **Infrastructure**: AWS ECS, managed by Cloud Platform Team
- **Monitoring**: Prometheus, Grafana (platform-provided)

## Dependencies and interaction modes

| Team | Interaction Mode | Purpose | Duration |
|------|------------------|---------|----------|
| Cloud Platform Team | X-as-a-Service | AWS infrastructure, CI/CD pipelines | Ongoing |
| DevOps Enablement Team | Facilitating | Learning microservices testing strategies | 6 weeks (ending Feb 2026) |
| Dispatch & Fleet Team | Collaboration | Defining API contract for dispatch → delivery flow | 8 weeks (ending Mar 2026) |
| Route Optimization Platform Team | X-as-a-Service | Route calculation and optimization algorithms | Ongoing |

## Flow Metrics

### Deployment Frequency
- **Current**: 2-3 times per week
- **Goal**: Daily deployments by Q2 2026
- **Baseline (monolith)**: Once every 2 weeks

### Lead Time for Changes
- **Current**: 5 days (code commit to production)
- **Goal**: < 2 days
- **Baseline (monolith)**: 12 days

### Change Failure Rate
- **Current**: 10% (learning phase)
- **Goal**: < 5%
- **Baseline (monolith)**: 15%

### Time to Restore Service
- **Current**: 50 minutes (can fix independently)
- **Goal**: < 30 minutes
- **Baseline (monolith)**: 4 hours

## Cognitive Load Assessment

- **Overall**: Medium (healthy for stream-aligned team)
- **Down from**: Very-high (in monolith days)

**What reduced the load**:
- Focused scope (delivery + routing integration only)
- Self-service platform (no tickets to DevOps or Database teams)
- Clear API contract with Route Optimization Platform Team
- Own our tests and deployments

## Team Composition

- 1 Tech Lead (former Backend Services Team)
- 2 Senior Backend Engineers (from monolith split)
- 2 Full-Stack Engineers (backend + customer dashboard)
- 1 Product Owner (embedded)

## Current Challenges

**Monolith Migration**:
- Still extracting delivery code from old monolith (40% complete)
- Untangling dependencies on old routing code

**Learning Phase**:
- Figuring out testing strategy for distributed system
- Establishing ownership boundaries with Dispatch team

**Platform Integration**:
- Learning to consume Route Optimization Platform's APIs
- Understanding X-as-a-Service expectations

## Success So Far (1 Month In)

✅ Extracted Delivery Management Service from monolith
✅ Integrated with Route Optimization Platform Team (clean API)
✅ Faster iteration on customer-facing delivery features
✅ Team ownership clear (no more "who's responsible?" confusion)

## Contact

- **Slack**: #delivery-routing-team
- **Team Lead**: Michael Torres (michael.torres@logicore.com)
- **On-call**: PagerDuty rotation