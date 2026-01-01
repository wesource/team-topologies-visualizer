# Team Topologies Concepts and Examples

## Team Topologies Fundamentals

> **Note**: This section provides a brief overview of Team Topologies concepts. For comprehensive details and authoritative definitions, see the [Team Topologies book](https://teamtopologies.com/) by Matthew Skelton and Manuel Pais. Additional resources and references are available at the [bottom of this document](#references).

### The 4 Fundamental Team Types
- **Stream-aligned** (Blue): Aligned to a single, valuable stream of work (e.g., a specific user journey, product, or feature set). Primary team type that delivers value directly to customers.
- **Platform** (Green): Provides internal services to reduce cognitive load of stream-aligned teams (e.g., APIs, infrastructure, deployment pipelines). Enables stream-aligned teams to deliver faster.
- **Enabling** (Orange): Helps stream-aligned teams overcome obstacles and adopt new technologies (e.g., coaching, mentoring, new practices). Temporary collaboration to upskill other teams.
- **Complicated Subsystem** (Purple): Deals with complex technical domains requiring specialist knowledge (e.g., ML algorithms, video processing, mathematical models). Reduces cognitive load on stream-aligned teams.

### Team Shape Visualization (TT Design View)

Based on the [official Team Topologies Shape Templates](https://github.com/TeamTopologies/Team-Shape-Templates), teams are rendered with different widths to reflect their relationship to the flow of change:

#### Wide Teams (Stream-aligned & Platform)
- **Visual style**: Wide horizontal boxes (~80% of grouping width) stacked vertically
- **Rationale**: These teams support the **"whole flow of change"** from idea to production
  - **Stream-aligned teams** own end-to-end slices of the business domain with no hand-offs
  - **Platform teams** provide foundational services that accelerate multiple streams
- **From TT Shape Templates**: "Stream-aligned and Platform teams will typically be re-sized horizontally. They may increase in size vertically to indicate the size of the team relative to others."
- **Key insight**: The wide shape emphasizes these teams' responsibility for complete, autonomous delivery

#### Narrow Teams (Enabling & Complicated Subsystem)
- **Visual style**: Standard-width boxes arranged in a grid (3 per row)
- **Rationale**: These teams have **focused, specialized responsibilities**
  - **Enabling teams** provide temporary, focused support to specific teams
  - **Complicated Subsystem teams** handle specific complex domains
- **Positioning**: Located below wide teams to show their supporting nature

This visualization directly reflects the Team Topologies book's diagrams where stream-aligned teams span horizontally across value streams, while enabling and subsystem teams are positioned around them as needed.

### The 3 Interaction Modes
- **Collaboration** (Solid red line): Two teams working together for a defined period (high interaction, discovery phase)
- **X-as-a-Service** (Dashed teal line): One team provides a service with minimal collaboration (clear API contract)
- **Facilitating** (Dotted green line): One team helps another team learn or adopt new approaches (enabling team pattern)

### Fractal Organizational Patterns (2nd Edition)

The Team Topologies 2nd edition introduces **fractal organizational patterns** that extend the team-of-teams concept to higher levels:

#### Value Stream Grouping
- **Definition**: A collection of stream-aligned teams working together to deliver a complete customer-facing flow of value
- **Purpose**: Organize multiple stream-aligned teams serving the same value stream (e.g., "E-commerce Experience", "Mobile Experience")
- **Visual representation**: Light yellow/orange background grouping in this tool
- **Benefits**: 
  - Clear end-to-end ownership of customer value flows
  - Reduced cross-value-stream dependencies
  - Executive sponsorship alignment
  - Value stream-level metrics (lead time, deployment frequency)

#### Platform Grouping
- **Definition**: A team-of-teams structure where multiple platform teams collaborate to provide related capabilities
- **Purpose**: Group platform teams that work together to deliver a cohesive set of services (e.g., "Data Platform Grouping", "Cloud Infrastructure Grouping")
- **Visual representation**: Very light blue background grouping in this tool
- **Benefits**:
  - Clear platform ownership and governance
  - Coordinated capability evolution
  - Thinnest Viable Platform (TVP) focus
  - Internal platform team collaboration patterns

These fractal patterns help organizations scale Team Topologies principles beyond individual teams to higher-level organizational structures.

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

### TT Design (Team Topologies Target Design)

The TT Design view (`data/tt-teams/`) shows how these same capabilities could be reorganized according to Team Topologies principles for better flow and autonomy.

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
- [Team Topologies book and website](https://teamtopologies.com/) by Matthew Skelton and Manuel Pais - Book information and additional resources
- [Team API Template](https://github.com/TeamTopologies/Team-API-template)
- [Team Topologies Key Concepts](https://teamtopologies.com/key-concepts) - Core principles and patterns
- [Team Topologies Blog](https://teamtopologies.com/blog) - Latest insights and case studies

### Related Frameworks
- [Scaled Agile Framework (SAFe)](https://scaledagileframework.com/)
- [Large-Scale Scrum (LeSS)](https://less.works/) - Scaling Scrum while keeping simplicity
- [Spotify Engineering Culture](https://engineering.atspotify.com/2014/03/spotify-engineering-culture-part-1/) - Squads, tribes, chapters, and guilds model

### Key Blog Posts & Talks
- [Sensing Organizations](https://teamtopologies.com/blog/2019/09/17/what-is-a-sensing-organization) by Matthew Skelton - Understanding current state before transformation
- [Team Cognitive Load](https://teamtopologies.com/key-concepts-content/what-is-cognitive-load) - Managing team complexity and responsibility
- [The Four Fundamental Team Types](https://teamtopologies.com/key-concepts-content/what-are-the-four-fundamental-team-types) - Deep dive into stream-aligned, platform, enabling, and complicated subsystem teams
- [Team Interaction Modes](https://teamtopologies.com/key-concepts-content/what-are-the-three-team-interaction-modes) - Collaboration, X-as-a-Service, and Facilitating explained
- [Henrik Kniberg: Spotify Engineering Culture (Video)](https://www.youtube.com/watch?v=4GK1NDTWbkY) - Part 1 of the original Spotify model presentation
- [Conway's Law](https://martinfowler.com/bliki/ConwaysLaw.html) by Martin Fowler - How organizational structure influences system architecture
