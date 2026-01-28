---
team_id: web-frontend-team
name: Web Frontend Team
team_type: feature-team
position:
  x: -35.0
  y: 410.0
metadata:
  size: 6
  department: Engineering
  line_manager: Michael Chen
  established: 2019-06
  cognitive_load: high
product_line: DispatchHub
business_stream: B2B Fleet Management
---

# Web Frontend Team

Develops web-based user interfaces for both B2B dispatchers and B2C customers in LogiCore's logistics platform.

## Responsibilities

**Dispatcher Portal (B2B)**:
- Real-time fleet tracking dashboard with live map view
- Route assignment and optimization interface
- Driver communication and messaging tools
- Load planning and scheduling features
- Fleet analytics and performance reporting

**Customer Portal (B2C)**:
- Delivery tracking for end-customers
- Proof of delivery viewing (photos, signatures)
- Shipment history and status updates
- Customer support ticket submission

## Technologies
- **Frontend**: React 18, TypeScript, Redux
- **Maps**: Mapbox GL JS for route visualization
- **Real-time**: WebSocket for live updates
- **Build Tools**: Vite, npm
- **API**: REST (waiting for GraphQL migration)
- **Deployment**: Docker

## Team Structure
- 1 Lead Frontend Developer
- 4 Frontend Developers (React/TypeScript)
- 1 UX Designer (shared 50% with Mobile App Team)

## Current Challenges

**Handoff Anti-Pattern**:
- Must wait for Backend Services Team to implement APIs (2-3 sprint delays typical)
- Cannot deploy independently - backend must deploy first
- API contracts change without notice, breaking frontend
- No cross-functional ownership of features end-to-end

**Technology Silo**:
- Separate from Mobile App Team despite similar responsibilities
- Duplicate feature implementation across web and mobile
- Inconsistent UX between platforms for same user journeys
- Shared UX designer split 50/50 causes context switching

**Cognitive Overload**:
- Responsible for 5 user personas: dispatchers, fleet managers, drivers (web), customers, support staff
- Owns too many distinct product areas (B2B enterprise tools + B2C consumer apps)
- Context switching between complex dispatcher workflows and simple customer tracking

**Shared Service Bottleneck**:
- Blocked waiting for API Framework Team API design approvals (1-2 weeks)
- Database Team must create materialized views for performance (Jira ticket, 3-5 days)
- Cannot experiment with new real-time features without Architecture Team approval

## Dependencies
- **Backend Services Team**: All business logic and data access
- **Database Team**: Read replicas, reporting queries, view optimization
- **API Framework Team**: API patterns, authentication changes

## Coordination Overhead
- Weekly "Frontend-Backend Sync" meeting (90 minutes)
- Bi-weekly "API Council" review with API Framework Team
- Monthly "Cross-Platform UX" meeting with Mobile App Team

## Transformation Opportunities

**In TT-Design, split into**:
- **Fleet Operations UI Team**: B2B dispatcher portal (stream-aligned to Fleet Operations value stream)
- **Customer Experience Web Team**: B2C customer portal (stream-aligned to Customer Delivery value stream)
- Each team cross-functional with backend engineers
- Thin BFF pattern enables independent deployment