---
team_id: api-framework-team
name: API Framework Team
team_type: platform-team
position:
  x: 805.0
  y: 410.0
metadata:
  size: 4
  department: Engineering
  line_manager: Sarah Johnson
  established: 2019-11
  cognitive_load: medium
---

# API Framework Team

A component team that creates and enforces API standards and shared libraries across LogiCore Systems. This team represents a common anti-pattern: **mandated shared libraries** rather than self-service platform capabilities.

## Responsibilities
- **API Standards**: Define REST/GraphQL standards for all teams
- **Shared Libraries**: Maintain API client libraries (Node.js, Python, Swift, Kotlin)
- **Code Generation**: OpenAPI/Swagger codegen tools
- **Documentation**: API documentation templates
- **Governance**: Review and approve API designs
- **Support**: Help teams adopt framework

## Technologies
- **Languages**: TypeScript, Python
- **Tools**: OpenAPI, Swagger, Postman
- **Libraries**: Express.js wrappers, FastAPI extensions
- **Documentation**: Swagger UI, ReDoc

## Team Structure
- 2 API Architects
- 2 Developer Experience Engineers

## Current Problems (Anti-patterns)
- **Mandated Adoption**: Teams forced to use framework, not self-service
- **Bottleneck**: API design reviews slow down teams
- **Not a True Platform**: Doesn't provide running services, just libraries
- **Coupling**: Changes to framework require coordinated updates across teams
- **Coordination Overhead**: Weekly "API Council" meetings with 10+ people
- **Unclear Value**: Teams question whether framework helps or hinders

## Transformation Opportunity
This team should either:
1. Evolve into a true **API Gateway Platform Team** (self-service, running infrastructure)
2. **Dissolve** - Let stream-aligned teams own their own API standards
3. Become an **Enabling Team** - Temporary coaching rather than permanent governance