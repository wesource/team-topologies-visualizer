---
# Baseline Team Template
# Captures your current organization structure before Team Topologies transformation

# REQUIRED
team_id: [unique-team-identifier]  # Unique slug-safe ID (e.g., "mobile-app-team", "api-platform-team")
name: [Your Team Name]  # Display name in all views
team_type: [feature-team | platform-team | support-team | undefined]  # Current classification
position:  # Canvas coordinates (auto-updated when dragging teams)
  x: 100
  y: 100

# RECOMMENDED (enables all visualization perspectives)
product_line: [Product Name]  # For Product Lines view - must match data/baseline-teams/products.json
business_stream: [Business Stream Name]  # For Business Streams view - must match data/baseline-teams/business-streams.json
dependencies: []  # List of team names this team coordinates with (e.g., [Database Team, API Framework Team])
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
