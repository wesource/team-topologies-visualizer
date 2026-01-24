---
name: Route Optimization Platform Team
team_id: route-optimization-platform-team
team_type: complicated-subsystem
position:
  x: 1960.0
  y: 260.0
metadata:
  size: 4
  cognitive_load: high
  established: 2024-06
interactions:
- team: Dispatch & Fleet Team
  mode: x-as-a-service
  purpose: Providing route calculation API for real-time dispatch optimization
- team: Delivery & Routing Team
  mode: x-as-a-service
  purpose: Providing route calculation API for delivery planning
---

# Route Optimization Platform Team

## Team name and focus

Route Optimization Platform Team – Complicated-subsystem team owning the route calculation and optimization algorithms that require deep operations research expertise.

## Team type

complicated-subsystem

## Part of a value stream?

No - Complicated-subsystem teams provide specialized capabilities to stream-aligned teams. We are not delivering directly to customers.

## Origin Story

**Created**: June 2024 (before full TT transformation)

**Previously**: Feature team called "Route Optimization Team" in Pre-TT baseline

**Why complicated-subsystem?**: Route optimization is mathematically complex:
- Operations research algorithms (vehicle routing problem, VRP)
- Multi-objective optimization (time, cost, capacity constraints)
- Real-time re-optimization based on traffic
- Requires specialized expertise (math PhDs, OR specialists)

**Decision**: This complexity should be **encapsulated** behind a clean API so stream-aligned teams don't need to understand it. Let the specialists own it.

**What changed in Jan 2026 TT transformation**: Renamed from "Route Optimization Team" to "Route Optimization **Platform** Team" to clarify role as internal service provider.

## Services provided (if applicable)

**Route Calculation and Optimization API** (internal platform):

1. **Calculate optimal route**: Given list of stops, vehicle constraints → optimal route
2. **Re-optimize route**: Adjust existing route based on traffic/delays
3. **Multi-route optimization**: Fleet-wide optimization (multiple vehicles)
4. **What-if analysis**: Test different scenarios

**API characteristics**:
- RESTful HTTP API
- < 500ms response time (P95)
- 99.9% availability
- Versioned (backward compatibility guaranteed)

## Service-level expectations (SLA)

- **API availability**: 99.9% uptime
- **Response time**: < 500ms (P95) for single-route optimization
- **Response time**: < 2 seconds (P95) for fleet-wide optimization
- **Support**: Slack channel, 4-hour response during business hours

## Software owned and evolved by this team

- **Route Optimization Engine**: Core algorithms (Python, OR-Tools, CPLEX)
- **Route API Service**: RESTful API wrapper (FastAPI)
- **Route Simulation Tools**: What-if analysis and testing
- **Algorithm Performance Dashboard**: Metrics on route quality

## Technologies

- **Algorithms**: OR-Tools (Google), CPLEX (IBM), custom heuristics
- **Backend**: Python 3.11, FastAPI, Cython (performance-critical paths)
- **Math Libraries**: NumPy, SciPy, NetworkX
- **Database**: PostgreSQL (road network data), Redis (caching)
- **Infrastructure**: AWS ECS (managed by Cloud Platform Team)

## Dependencies and interaction modes

| Team | Interaction Mode | Purpose | Duration |
|------|------------------|---------|----------|
| Delivery & Routing Team | X-as-a-Service | Providing route calculation API | Ongoing |
| Cloud Platform Team | X-as-a-Service | AWS infrastructure, CI/CD | Ongoing |

**Why X-as-a-Service**:
- Stream-aligned teams consume our API (they don't need to understand algorithms)
- Clear interface (RESTful API, versioned)
- We own reliability and performance
- Minimal coupling (API contract only)

## Flow Metrics

### API Performance
- **P50 response time**: 180ms
- **P95 response time**: 420ms (under 500ms SLA)
- **P99 response time**: 850ms
- **Availability**: 99.95% (exceeds 99.9% SLA)

### Deployment Frequency
- **Current**: Once per week (algorithm changes are infrequent)
- **Goal**: Not pushing for more frequent (algorithms stable)

### Algorithm Quality
- **Route efficiency**: 15% improvement over naive routing (average)
- **Cost savings**: $50K/month in fuel costs (estimated)

## Cognitive Load Assessment

- **Overall**: High (appropriate for complicated-subsystem team)

**Why high**:
- Deep mathematical complexity (VRP is NP-hard)
- Requires specialized expertise (operations research)
- Performance optimization (sub-second response times)
- Algorithm research (continuous improvement)

**Managed by**:
- Team has specialized expertise (2 OR specialists)
- Clear API boundary (complexity hidden from consumers)
- Not responsible for customer features (focused on algorithms only)

## Team Composition

- 1 Tech Lead (PhD in Operations Research)
- 1 Senior OR Specialist (optimization algorithms)
- 1 Backend Engineer (API, infrastructure)
- 1 Performance Engineer (profiling, optimization)

**Specialized skills**:
- Operations Research (2 team members)
- Algorithm design and analysis
- Performance optimization (Cython, profiling)

## Current Challenges

**Algorithm Evolution**:
- Balancing accuracy vs speed (more complex = slower)
- Adding new constraints (e.g., electric vehicle charging)
- Research vs production (trying new algorithms safely)

**Platform Integration**:
- Learning Cloud Platform's deployment tools (new in Jan 2026)
- Moving from manual infrastructure to self-service

**API Evolution**:
- Maintaining backward compatibility (Delivery & Routing Team depends on us)
- Versioning strategy for breaking changes

## Success So Far

✅ 99.95% API availability (rock solid)
✅ Sub-500ms response times (meets SLA)
✅ 15% route efficiency improvement over baseline
✅ Clean API abstraction (Delivery & Routing Team doesn't need OR expertise)

## Why Complicated-Subsystem?

**Could this be stream-aligned?** No.

Reasons:
1. **Deep specialization required**: Operations research expertise (PhD-level)
2. **Split would harm it**: Breaking up OR algorithms across teams = ineffective
3. **Reusable capability**: Multiple teams need route optimization
4. **Complexity encapsulation**: Stream-aligned teams shouldn't need OR expertise

**Test**: If we split this team, would the resulting teams be effective? No - you'd lose the specialized expertise concentration needed for high-quality algorithms.

## Contact

- **Slack**: #route-optimization-platform
- **API Docs**: https://platform.logicore.com/route-api
- **Team Lead**: Dr. Rachel Kim (rachel.kim@logicore.com)
- **Support**: #route-api-support (4-hour response SLA)