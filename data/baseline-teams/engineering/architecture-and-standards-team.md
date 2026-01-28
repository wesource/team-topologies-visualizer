---
team_id: architecture-and-standards-team
name: Architecture & Standards Team
team_type: support-team
position:
  x: 385.0
  y: 410.0
metadata:
  size: 3
  department: Engineering
  line_manager: Jennifer Williams
  established: 2017-01
  cognitive_load: medium
---

# Architecture & Standards Team

Defines architectural governance, technical strategy, and standards for LogiCore's logistics platform.

## Responsibilities

**Architectural Governance**:
- Define and maintain enterprise architecture standards
- Architecture review board (ARB) for major technical decisions
- Technology evaluation and approval
- Cross-team architectural decision making
- Technical debt management strategy

**Technical Strategy**:
- Monolith decomposition and microservices roadmap
- Cloud migration planning (AWS adoption)
- API strategy and design patterns
- Data architecture and governance
- Security and compliance standards

**Standards & Best Practices**:
- Coding standards and conventions
- Integration patterns (REST, messaging, events)
- Performance and scalability guidelines
- Documentation templates and practices

**Enabling Activities**:
- Architecture mentoring and guidance
- Proof of concepts for new technologies
- Technical training and workshops (quarterly)
- Architecture documentation (Confluence, C4 diagrams)

## Technologies
- **Architecture Tools**: C4 Model, Mermaid, Draw.io
- **Documentation**: Confluence, Markdown, ADRs (Architecture Decision Records)
- **Analysis**: Various (depends on evaluation)
- **Diagrams**: PlantUML, Lucidchart

## Team Structure
- 1 Chief Architect / Enterprise Architect
- 1 Solutions Architect
- 1 Technical Architect

## Current Challenges

**Limited Enabling, Too Much Governance**:
- Architecture Review Board (ARB) required for "any significant technical decision"
- ARB meets bi-weekly (teams wait 1-2 weeks for approval)
- More focused on compliance and standards than enabling teams
- Teams feel "governed" not "enabled" - architecture is seen as bottleneck
- Quarterly training sessions insufficient for continuous learning

**Mandated Standards Anti-Pattern**:
- "Must use our approved tech stack" policy (limits experimentation)
- 40-page "Architecture Standards" document (rarely read, hard to follow)
- Teams circumvent standards or ignore them (governance without buy-in)
- Standards defined top-down without team input
- No clear rationale: "Because architecture team says so"

**Ivory Tower Problem**:
- Architecture team doesn't write production code (disconnected from reality)
- Designs and strategies created in isolation from development teams
- PoCs done by architects, then "thrown over wall" to dev teams to implement
- Limited understanding of day-to-day development challenges
- Proposed microservices strategy too ambitious (teams lack skills to implement)

**Cognitive Overload**:
- Responsible for architecture across ALL domains (fleet, routing, delivery, customer experience)
- Must review technical decisions for 4-5 development teams
- Too many competing priorities (monolith decomposition, cloud migration, standards enforcement)
- Cannot be experts in everything - becoming generalists without depth

**Coordination Overhead**:
- Bi-weekly Architecture Review Board meetings (2 hours, 10+ people)
- Monthly "Architecture Town Hall" (90 minutes, entire engineering org)
- Quarterly "Tech Radar" review to update approved technologies
- Weekly "Architecture Office Hours" for team consultations (underutilized)

**Unclear Boundaries**:
- API Framework Team also defines API standards (overlap with Architecture Team)
- DevOps Team makes infrastructure decisions (sometimes conflicts with architecture strategy)
- Tension: Who decides tech stack? Architecture Team or development teams?

## Key Focus Areas (Planned but Slow Progress)
- Monolith decomposition strategy (discussed for 2 years, little progress)
- Microservices transition roadmap (ambitious, teams overwhelmed)
- Event-driven architecture (PoC done but not adopted)
- API-first design (mandated but not supported with tooling)
- GraphQL migration (planned but stalled)

## Transformation Opportunities

**In TT-Design, evolve toward true enabling team**:
- Shift from governance to enablement (help teams make good decisions)
- Embed architects into stream-aligned teams temporarily (build capability)
- Architecture as facilitators not gatekeepers
- Enable teams to experiment and learn (bounded innovation)
- Replace ARB approval process with lightweight decision framework (ADRs)
- Architects write code alongside teams (stay connected to reality)
- Reduce standards document from 40 pages to 10 guiding principles
- Team autonomy within clear architectural guardrails