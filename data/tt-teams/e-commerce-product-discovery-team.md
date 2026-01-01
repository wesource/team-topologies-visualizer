---
name: E-commerce Product Discovery Team
team_type: stream-aligned
dependencies:
- Search Platform Team
- Core Platform Team
interaction_modes:
  Search Platform Team: x-as-a-service
  Core Platform Team: x-as-a-service
  ML Recommendations Team: collaboration
position:
  x: 1054.0
  y: 360.0
metadata:
  size: 6
  value_stream: E-commerce Experience
  cognitive_load: medium
  cognitive_load_domain: medium
  cognitive_load_intrinsic: medium
  cognitive_load_extraneous: low
  platform_dependencies: 2
  responsibilities:
  - Product catalog browsing
  - Search experience
  - Product recommendations
  - Filtering and sorting
  established: 2025-01
---

# E-commerce Product Discovery Team

Stream-aligned team owning how customers discover and find products they want to purchase.

## Value Stream
**E-commerce Experience** - Part of the same value stream as Checkout team, focused on the discovery phase.

## Cognitive Load Assessment
- **Overall**: Medium (well-supported by platforms)
- **Domain complexity**: Medium (search, recommendations, personalization)
- **Intrinsic complexity**: Medium (search algorithms, ranking)
- **Extraneous complexity**: Low (platforms handle infrastructure)

## Responsibilities
- Product catalog browsing and navigation
- Search experience and autocomplete
- Product filtering and sorting
- Category pages
- Product recommendations integration
- Recently viewed products
- Wishlist functionality

## Platform Dependencies
- **Search Platform**: Elasticsearch indexing, search APIs, relevance tuning
- **Core Platform**: Product data, user preferences, A/B testing framework

## Current Collaboration
- **ML Recommendations Team**: Temporary collaboration (3 months) to integrate new recommendation engine

## Technologies
- React (frontend)
- Node.js (BFF)
- GraphQL
- Algolia (search - considering migration to internal platform)

## Team Composition
- 1 Product Lead
- 1 Tech Lead
- 3 Full-stack Engineers
- 1 UX Designer

## Flow Metrics (Target)
- Lead time: < 2 days
- Deployment frequency: Daily
- Change fail rate: < 5%