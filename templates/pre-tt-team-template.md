---
# REQUIRED FIELDS
name: [Your Team Name]  # Team name as shown in visualizations
team_type: [feature-team | platform-team | support-team | undefined]  # Current team classification
position:  # Canvas position (auto-managed when dragging)
  x: 100
  y: 100

# OPTIONAL FIELDS (but recommended for full visualization features)
product_line: [Product Name]  # Groups teams in Product Lines view (e.g., DispatchHub, RouteOptix)
value_stream: [Value Stream Name]  # Groups teams in Business Streams view (e.g., B2B Fleet Management, B2C Driver Experience)
dependencies: []  # Teams this team depends on - creates communication lines (e.g., [Database Team, API Framework Team])
metadata:
  size: 7  # Number of team members - used for display and validation warnings
  department: [Department]  # e.g., Engineering, Product Management, Customer Solutions
  line_manager: [Manager Name]  # Direct reporting manager
  established: 2024-01  # YYYY-MM format - shows team age/maturity in modal
  cognitive_load: medium  # low | medium | high | very-high - shows in visualization indicator
---

# [Your Team Name]

Brief description of what this team does and their current responsibilities.

## Responsibilities

- [Primary responsibility 1]
- [Primary responsibility 2]
- [Primary responsibility 3]

## Dependencies

**Teams We Depend On**:
- [Team Name 1] - [Why we depend on them]
- [Team Name 2] - [Why we depend on them]

## Current Challenges

**Cognitive Load**: [low | medium | high | very-high]

- **Domain Complexity**: [e.g., Managing multiple customer integrations]
- **Technical Complexity**: [e.g., Maintaining legacy systems]
- **Coordination Overhead**: [e.g., Frequent handoffs with multiple teams]

## [Optional] Technologies

- **Technology 1**: [Description]
- **Technology 2**: [Description]

## [Optional] Key Customers/Users

- [Customer/User 1]
- [Customer/User 2]
