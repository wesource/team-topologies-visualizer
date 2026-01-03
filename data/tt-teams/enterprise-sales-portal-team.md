---
name: Enterprise Sales Portal Team
team_type: stream-aligned
dependencies:
- Core Platform Team
interaction_modes:
  Core Platform Team: x-as-a-service
  Data Engineering Team: collaboration
position:
  x: 112.0
  y: 758.0
metadata:
  size: 5
  value_stream: Enterprise Sales
  cognitive_load: low
  cognitive_load_domain: medium
  cognitive_load_intrinsic: low
  cognitive_load_extraneous: low
  platform_dependencies: 1
  responsibilities:
  - Sales portal application
  - Customer account management
  - Analytics dashboards
  - Quote generation
  established: 2024-11
---

# Enterprise Sales Portal Team

Stream-aligned team serving the B2B/Enterprise sales organization.

## Value Stream
**Enterprise Sales** - Distinct value stream serving internal sales teams and enterprise customers.

## Cognitive Load Assessment
- **Overall**: Low 🟢 (healthy, team has capacity for innovation)
- **Domain complexity**: Medium (CRM integration, quote generation, account hierarchies)
- **Intrinsic complexity**: Low (CRUD application with reporting)
- **Extraneous complexity**: Low (excellent platform support)

## Responsibilities
- Sales portal web application
- Enterprise customer account management
- Sales analytics and dashboards
- Quote and proposal generation
- Contract management
- Customer onboarding workflows

## Platform Dependencies
- **Core Platform**: Authentication (SSO), APIs, data access, hosting

## Current Collaboration
- **Data Engineering Team**: 2-month collaboration to build new analytics features using data warehouse

## Technologies
- Vue.js (frontend)
- Python FastAPI (backend)
- PostgreSQL
- Salesforce integration

## Team Composition
- 1 Product Lead (part-time, split with operations)
- 1 Tech Lead
- 2 Full-stack Engineers
- 1 Data Analyst (embedded from Data Engineering for analytics work)

## Flow Metrics (Current)
- Lead time: < 2 days
- Deployment frequency: 2-3 times per week
- Change fail rate: 2%
- **Note**: Team is performing well with room for innovation time

## Innovation Capacity
Team has ~20% time for experimentation:
- Exploring AI-assisted quote generation
- Improving analytics UX
- Contributing back to Core Platform (authentication improvements)