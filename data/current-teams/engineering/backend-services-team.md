---
name: Backend Services Team
team_type: feature-team
position:
  x: 80.0
  y: 410.0
metadata:
  size: 8
  department: Engineering
  line_manager: Rachel Martinez
  established: 2018-06
  cognitive_load: very-high
value_stream: B2B Fleet Management
---

# Backend Services Team

The backend monolith team responsible for core logistics services including routing, dispatch, fleet tracking, and customer delivery management. This team owns too much - a classic anti-pattern showing high cognitive load and coordination overhead.

## Responsibilities

- Route calculation and optimization - Core routing algorithms
- Dispatch management - Real-time driver assignment
- Fleet tracking - Vehicle location and telemetry
- Delivery management - Customer delivery tracking
- Backend API services - REST APIs for all products
- Integration layer - Enterprise customer integrations
- Data processing - ETL and batch jobs
- Monolith maintenance - Legacy codebase evolution

## Dependencies

**Teams We Depend On**:
- Database Team - Schema changes, database performance tuning
- API Framework Team - Shared API infrastructure and standards

## Current Challenges

**Cognitive Load**: very-high

- **Cognitive Overload**: Team owns routing + dispatch + tracking + delivery - far too much
- **Handoffs**: Must coordinate with QA Team before any release
- **Dependencies**: Blocked by Database Team for schema changes
- **Coordination**: Weekly integration meetings with 4+ other teams
- **Monolith**: Difficult to deploy, test, and evolve
- **Unclear Boundaries**: Multiple teams want changes to shared services