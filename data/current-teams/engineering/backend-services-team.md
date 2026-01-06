---
name: Backend Services Team
team_type: feature-team
product_line: DispatchHub
dependencies:
- Database Team
- API Framework Team
interaction_modes:
  Database Team: x-as-a-service
  API Framework Team: x-as-a-service
position:
  x: 80.0
  y: 410.0
metadata:
  size: 8
  department: Engineering
  product: DispatchHub, FleetMonitor, RouteOptix
  established: 2018-06
  cognitive_load: very-high
  cognitive_load_domain: very-high
  cognitive_load_intrinsic: high
  cognitive_load_extraneous: very-high
line_manager: Rachel Martinez
---

# Backend Services Team

The backend monolith team responsible for core logistics services including routing, dispatch, fleet tracking, and customer delivery management. This team owns too much - a classic anti-pattern showing high cognitive load and coordination overhead.

## Responsibilities (TOO MANY - Anti-pattern)
- **Route calculation and optimization** - Core routing algorithms
- **Dispatch management** - Real-time driver assignment
- **Fleet tracking** - Vehicle location and telemetry
- **Delivery management** - Customer delivery tracking
- **Backend API services** - REST APIs for all products
- **Integration layer** - Enterprise customer integrations
- **Data processing** - ETL and batch jobs
- **Monolith maintenance** - Legacy codebase evolution

## Technologies
- **Backend**: Node.js, Python
- **APIs**: REST, GraphQL
- **Database**: PostgreSQL (via Database Team)
- **Message Queue**: RabbitMQ
- **Infrastructure**: AWS (EC2, ECS)
- **CI/CD**: Jenkins (manual deployment)

## Team Structure
- 5 Backend Engineers (Node.js/Python)
- 2 API Developers
- 1 Integration Specialist

## Current Problems
- **Cognitive Overload**: Team owns routing + dispatch + tracking + delivery - far too much
- **Handoffs**: Must coordinate with QA Team before any release
- **Dependencies**: Blocked by Database Team for schema changes
- **Coordination**: Weekly integration meetings with 4+ other teams
- **Monolith**: Difficult to deploy, test, and evolve
- **Unclear Boundaries**: Multiple teams want changes to shared services