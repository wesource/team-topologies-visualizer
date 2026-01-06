---
name: Route Optimization Team
team_type: feature-team
product_line: RouteOptix
dependencies:
- Backend Services Team
- Database Team
- DevOps & Infrastructure Team
interaction_modes:
  Backend Services Team: collaboration
  Database Team: x-as-a-service
  DevOps & Infrastructure Team: x-as-a-service
position:
  x: 80.0
  y: 530.0
metadata:
  size: 5
  department: Engineering
  product: RouteOptix Core Algorithms
  established: 2016-03
  cognitive_load: very-high
  cognitive_load_domain: very-high
  cognitive_load_intrinsic: very-high
  cognitive_load_extraneous: high
line_manager: Marcus Thompson
---

# Route Optimization Team

Develops vehicle routing and delivery optimization algorithms for LogiCore's logistics platform.

## Responsibilities

**Core Algorithms**:
- Vehicle routing problem (VRP) solvers with time windows
- Dynamic route re-optimization for real-time changes
- Multi-depot route planning for fleet operators
- Load balancing and driver assignment optimization
- Traffic pattern analysis and ETA prediction

**Algorithm Types**:
- Batch overnight planning for next-day routes (500-1000 routes)
- Real-time route adjustments for new orders (200-800ms response)
- What-if scenario planning for dispatchers
- Historical route analysis and optimization recommendations

## Technologies
- **Python 3.11**: Algorithm development
- **Google OR-Tools**: Vehicle routing optimization library
- **NumPy/Pandas**: Data processing and analysis
- **PostgreSQL**: Route history and parameters storage
- **Redis**: Caching for real-time optimization requests
- **Docker**: Algorithm deployment containers

## Team Structure
- 1 Lead Optimization Engineer (Operations Research PhD)
- 3 Algorithm Engineers (Python, OR-Tools, optimization)
- 1 Data Scientist (traffic patterns, ETA prediction)

## Current Challenges (Pre-TT Dysfunction)

**Complicated Subsystem Candidate**:
- Highly specialized - routing optimization requires operations research expertise
- Other teams don't understand algorithm internals (black box)
- Very high cognitive load: VRP algorithms, constraint programming, heuristics
- **Could be a Complicated Subsystem Team in TT-Design** providing optimization-as-a-service

**Handoff Anti-Pattern**:
- Backend Services Team must implement API endpoints calling algorithms
- Cannot deploy improvements without backend deployment coordination
- Requests go through Backend's REST API - no direct access
- No ownership of production runtime - just provides "algorithm library"

**Shared Service Bottleneck**:
- Database Team controls access to production route history for training
- Must request data exports via Jira (2-5 day turnaround)
- Cannot query production DB directly due to performance concerns
- DevOps Team deploys container updates (1-2 week release cycle)

**Unclear Boundaries**:
- Backend Services has "simple routing logic" duplicated in their code
- Confusion: which team owns "basic routing" vs "advanced optimization"?
- Product unsure whether to request features from Backend or Optimization team

## Dependencies
- **Backend Services Team**: API integration, deployment, algorithm invocation
- **Database Team**: Route history, customer delivery data, traffic patterns
- **DevOps and Infrastructure Team**: Docker deployment, scaling, monitoring

## Coordination Overhead
- Weekly "Algorithm Integration" meeting with Backend Services (review API changes)
- Monthly "Data Access Review" with Database Team (justify data needs)
- Quarterly "Algorithm Performance Review" with entire engineering org (30+ people)

## Algorithm Performance
- Batch optimization: 500-1000 routes overnight (3-6 hours processing)
- Real-time: 200-800ms response for route adjustments
- 15% reduction in total route distance vs manual planning
- **Issues**: Memory spikes during large optimizations, occasional timeouts

## Integration Complexity
- Backend calls algorithms via Python subprocess (not HTTP API)
- Runs in-process with backend (memory and CPU contention)
- No independent scaling - backend servers sized for optimization workload
- Failed algorithm runs can crash backend processes

## Transformation Opportunities

**In TT-Design, become Complicated Subsystem Team**:
- Provide routing optimization as self-service API/platform
- Own full optimization service end-to-end (API, deployment, monitoring)
- Enable Fleet Operations, Customer Delivery, Dispatch teams to call directly
- Clear interface: "Give us locations + constraints → get optimized routes"
- Independent deployment and scaling
- Focus purely on algorithm quality, not API integration complexity