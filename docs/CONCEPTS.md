# Team Topologies Concepts and Examples

## Team Topologies Fundamentals

### The 4 Fundamental Team Types
- **Stream-aligned** (Blue): Aligned to a single, valuable stream of work (e.g., a specific user journey, product, or feature set). Primary team type that delivers value directly to customers.
- **Platform** (Green): Provides internal services to reduce cognitive load of stream-aligned teams (e.g., APIs, infrastructure, deployment pipelines). Enables stream-aligned teams to deliver faster.
- **Enabling** (Orange): Helps stream-aligned teams overcome obstacles and adopt new technologies (e.g., coaching, mentoring, new practices). Temporary collaboration to upskill other teams.
- **Complicated Subsystem** (Purple): Deals with complex technical domains requiring specialist knowledge (e.g., ML algorithms, video processing, mathematical models). Reduces cognitive load on stream-aligned teams.

### The 3 Interaction Modes
- **Collaboration** (Solid red line): Two teams working together for a defined period (high interaction, discovery phase)
- **X-as-a-Service** (Dashed teal line): One team provides a service with minimal collaboration (clear API contract)
- **Facilitating** (Dotted green line): One team helps another team learn or adopt new approaches (enabling team pattern)

### Key Principles
- **Team Cognitive Load**: Limit the amount of responsibility a single team handles
- **Team API**: Clear interfaces between teams (dependencies, communication patterns, responsibilities)
- **Fast Flow**: Optimize for rapid delivery of value to customers
- **Team-first Approach**: Teams are the fundamental unit of delivery, not individuals

## About the Example Data

### Current State: Traditional Team Classifications

The included example (`data/current-teams/`) represents a **fictive traditional organization** that uses common team classification patterns found in scaled agile frameworks like **LeSS (Large-Scale Scrum)**, **SAFe (Scaled Agile Framework)**, and **Spotify model**.

#### Background: De-facto Team Types in Industry

Many organizations classify their engineering teams using patterns like:

- **Feature Teams** (LeSS/Scrum at Scale): Small, cross-functional teams that own and deliver complete product features end-to-end
- **Platform Teams** (SAFe/Spotify): Teams that own shared/core components and maintain the common foundation other teams build on
- **Enabling/Support Teams** (various frameworks): Teams that support other teams with specialized skills, coaching, or specialist work (e.g., architects, testing specialists, documentation)

**Your Current State Should Reflect Your Reality**: The tool is designed to be flexible. Document whatever team classification and organizational structure you currently have, whether it follows SAFe, LeSS, Spotify, or your own custom approach. The value is in visualizing your actual starting point before designing the Team Topologies vision.

#### Example Organization: LogiTech Solutions

For demonstration purposes, this repository includes a fictive company setup:

- **Context**: LogiTech Solutions, a logistics software company
- **Product**: RouteOptix (route optimization and delivery planning)
- **Setup**: Originally structured around 2 Agile Release Trains (ARTs) with SAFe influence
- **Pattern**: "Dual Operating Model" concept (operational hierarchy + agile ways of working)

**Team Type Mapping** (fictional company naming):

| Generic Classification | This Example Uses | Common Alternatives |
|----------------------|------------------|-------------------|
| Feature Team | "Product Team" (Core Product, Web Product, ML Product) | Development Team, Scrum Team, Delivery Team |
| Platform Team | "Platform Team" (Database Platform, Build & Integration) | Shared Services, Foundation Team, Infrastructure Team |
| Enabling/Support Team | "Architecture Team", "Testing Team" | Enablement Team, Center of Excellence, Guild, Chapter |

**Current Issues in Example**:
- ❌ Component teams organized by technology layer (backend, frontend, ML, QA)
- ❌ Heavy dependencies and coordination overhead between teams
- ❌ Handoffs between teams (dev → QA)
- ❌ Unclear team purposes and boundaries
- ❌ Cognitive overload on some teams

**7 Teams in Current State:**
1. Core Product Team (6) - Backend monolith (C++/Python) - *Feature Team*
2. Web Product Team (3) - Frontend (Angular) - *Feature Team*
3. ML Product Team (4) - Data science & ML - *Feature Team*
4. Integration Testing Team (5) - QA - *Enabling/Support Team*
5. Database Platform Team (3) - Oracle/ORM/Flyway - *Platform Team*
6. Build & Integration Team (4) - CI/CD & infrastructure - *Platform Team*
7. Enterprise Architecture Team (3) - Governance & strategy - *Enabling/Support Team*

**Characteristics of this setup:**
- ❌ Teams organized by function, not value stream
- ❌ Heavy dependencies and coordination overhead
- ❌ Handoffs between teams (dev → QA)
- ❌ Unclear team purposes and boundaries
- ❌ Cognitive overload on some teams

### Team Topologies Vision

The TT vision (`data/tt-teams/`) shows how these same capabilities could be reorganized according to Team Topologies principles for better flow and autonomy.

## Disclaimer

**Important**: The example data in this repository (FleetFlow Systems, RouteOptix product, team structures, technical details, etc.) is entirely fictitious and created for demonstration purposes only. The author has never worked in the logistics software industry or domain represented in these examples. All technical details, responsibilities, team sizes, technology stacks, and organizational patterns are made up to provide realistic working examples for learning Team Topologies concepts.

If you recognize patterns similar to your organization, it's because many companies face common organizational challenges - not because this data represents any specific real-world company.

## Use Cases

### Organizational Assessment & Discovery

This tool supports the **"sensing organization"** approach from Team Topologies:

- **Consolidate fragmented information** - Gather team data scattered across PowerPoints, wikis, SharePoint, etc. into one coherent view
- **Create single source of truth** - Document current team structures, dependencies, and interaction patterns
- **Facilitate informed discussions** - Use visualization to align stakeholder understanding
- **Identify pain points** - Make bottlenecks, handoffs, and cognitive overload visible

### Team Topologies Adoption Pattern

Follows the recommended **incremental adoption approach**:

1. **Start with one value stream** - Pick one product or business capability
2. **Sense the current organization** - Document current teams, dependencies, pain points (this tool!)
3. **Design TT vision** - Apply TT patterns to that one area
4. **Identify platform needs** - What platforms would reduce stream-aligned team cognitive load?
5. **Prove the concept** - Implement in one area, measure outcomes
6. **Scale gradually** - Apply learnings to other value streams

This approach minimizes disruption and builds organizational capability incrementally.

### Transformation Planning

Use the dual visualization to:
- **Compare before/after** - Side-by-side view of current vs future state
- **Plan the transition** - Identify which teams need to evolve and how
- **Communicate change** - Show stakeholders the rationale for reorganization
- **Track progress** - Version control the markdown files to see evolution over time

## References

### Team Topologies Resources
- [Team Topologies book](https://teamtopologies.com/) by Matthew Skelton and Manuel Pais
- [Team API Template](https://github.com/TeamTopologies/Team-API-template)
- [Team Topologies adoption guidance](https://teamtopologies.com/key-concepts) - Recommends starting with one value stream
- [Sensing Organizations](https://teamtopologies.com/blog) - Understanding current state before transformation

### Related Frameworks
- [Scaled Agile Framework (SAFe)](https://scaledagileframework.com/)

### Key Blog Posts & Talks
- Matthew Skelton: "Start with sensing the organization" - assess current state first
- Manuel Pais: "Team-first thinking" - teams as fundamental units of delivery
- Team Topologies community: Incremental adoption patterns and case studies
