---
# Pre-TT Team Template - Current Organizational State
# This template captures your current team structure BEFORE applying Team Topologies patterns
# Use this for teams in data/current-teams/

name: [Your Team Name]
team_type: [feature-team | platform-team | support-team | undefined]  # Current organizational team type
product_line: [Product or Initiative Name]  # Optional: For Product Lines view grouping
dependencies: []  # List of teams this team depends on (for communication lines)
position:
  x: 100
  y: 100
metadata:
  size: 7  # Number of people on the team
  department: [Department Name]  # e.g., Engineering, Product, Customer Solutions
  product: [Product/Service Name]  # What products/services this team works on
  established: YYYY-MM  # When the team was formed
  cognitive_load: medium  # low | medium | high | very-high (current state)
  cognitive_load_domain: medium  # Domain complexity
  cognitive_load_intrinsic: medium  # Technical complexity
  cognitive_load_extraneous: medium  # Process/coordination overhead
line_manager: [Manager Name]  # Direct reporting manager
---

# [Your Team Name]

> **Template Type**: Pre-TT (Current State) Team Template
>
> **Purpose**: Document your organization's current team structure before Team Topologies transformation.
>
> **Instructions**: Replace all `[bracketed placeholders]` with your team's actual information. Delete this instruction block when done.

## Team Overview

**Mission**: [One-sentence description of what this team does today - their current responsibilities]

**Current Focus**: [Brief description of the team's day-to-day work, main projects, and deliverables]

**Examples:**
- "The Backend Services Team maintains the core API services for DispatchHub, FleetMonitor, and RouteOptix products."
- "The Mobile App Team develops and maintains driver and customer mobile applications across iOS and Android platforms."
- "The European Transport Solutions Team customizes and implements transport management solutions for European enterprise customers."

## Team Structure

**Size**: [Number] people

**Department**: [Department name, e.g., Engineering, Product Management, Customer Solutions]

**Line Manager**: [Manager name]

**Established**: [YYYY-MM]

## Products / Services

**Primary Products**: [List the main products or services this team works on]

**Key Responsibilities**:
- [Responsibility 1]
- [Responsibility 2]
- [Responsibility 3]

## Dependencies

**Teams We Depend On**:
[List teams this team regularly needs to coordinate with or depends on for their work. These will show as communication lines in the visualization.]

- [Team Name 1] - [Brief explanation of the dependency]
- [Team Name 2] - [Brief explanation of the dependency]

**Examples:**
- "Backend Services Team - We consume their REST APIs for data access"
- "DevOps & Infrastructure Team - We depend on them for deployment pipeline support"
- "Database Team - We coordinate with them for schema changes and database performance"

## Current Challenges

**Cognitive Load**: [low | medium | high | very-high]

**Key Challenges**:
[Describe current pain points, blockers, or areas of high complexity]

- **Domain Complexity**: [e.g., "Managing integrations with 5+ different customer-specific systems"]
- **Technical Complexity**: [e.g., "Maintaining legacy monolith while building new microservices"]
- **Process Overhead**: [e.g., "Frequent context switching between 3 different products"]
- **Communication Burden**: [e.g., "Coordinating with 8+ teams for releases"]

## Team Communication

**Primary Channels**:
- Slack: [#team-channel]
- Email: [team-email@company.com]
- Meetings: [e.g., "Daily standup 9am UTC, Weekly planning Fridays"]

**Key Contacts**:
- **Team Lead**: [Name]
- **Product Owner**: [Name]
- **Technical Lead**: [Name]

## Additional Notes

[Any other relevant information about the current state of this team - history, ongoing transitions, planned changes, etc.]

---

## Pre-TT Template Fields Reference

### YAML Front Matter (Required)
- `name` - Team name as shown in visualizations
- `team_type` - Current organizational classification (feature-team, platform-team, support-team, undefined)
- `product_line` - (Optional) Groups teams into product lanes in Product Lines view
- `dependencies` - List of team names this team depends on (creates communication lines)
- `position` - Canvas position (set automatically when dragging teams)
- `metadata.size` - Number of team members
- `metadata.department` - Organizational department
- `metadata.product` - Products/services the team works on
- `metadata.established` - When the team was formed (YYYY-MM format)
- `metadata.cognitive_load` - Overall cognitive load assessment
- `metadata.cognitive_load_domain` - Domain/business logic complexity
- `metadata.cognitive_load_intrinsic` - Technical complexity
- `metadata.cognitive_load_extraneous` - Process/coordination overhead
- `line_manager` - Direct reporting manager name

### Pre-TT vs TT-Design Differences

**Pre-TT (this template)** focuses on:
- Current organizational reality
- Reporting structures (`line_manager`, `department`)
- Actual dependencies between teams
- Current pain points and challenges
- Product-oriented grouping (`product_line`)

**TT-Design templates** focus on:
- Future desired state with Team Topologies patterns
- Team API interface for interactions
- Designed interaction modes (collaboration, x-as-a-service, facilitating)
- Value stream alignment
- Platform groupings
- Service-level expectations

Use Pre-TT templates for `data/current-teams/` and TT-Design templates for `data/tt-teams/`.
