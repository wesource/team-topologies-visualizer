---
team_id: customer-delivery-tracking-team
name: Customer Delivery Tracking Team
team_type: stream-aligned
position:
  x: 2430.0
  y: 165.0
metadata:
  size: 7
  cognitive_load: medium
  established: 2023-11
value_stream: B2C Services
---

# Customer Delivery Tracking Team

## Team name and focus
Customer Delivery Tracking Team – Develops native mobile apps and web interfaces for end-customers to track their deliveries in real-time, view ETAs, and communicate with drivers.

## Team type
stream-aligned

## Part of a value stream?

Yes - B2C Services

This team serves end-customers (B2C) with real-time delivery tracking and status updates.

## Services provided (if applicable)
N/A - This is a stream-aligned team delivering customer-facing features.

## Service-level expectations (SLA)
- App availability: 99.9% uptime
- Real-time tracking updates: < 30 second latency
- ETA accuracy: Within 15 minutes of actual delivery
- App store rating: > 4.3 stars

## Software owned and evolved by this team
- Customer Tracking iOS App (Swift)
- Customer Tracking Android App (Kotlin)
- Customer Tracking Web App (React)
- Real-Time Tracking Service (WebSocket)
- ETA Prediction Integration
- Delivery Status Notifications

## Versioning approaches
- Semantic versioning for app releases
- Weekly app store submissions
- Feature flags for gradual rollouts

## Wiki and documentation
- [Team Wiki](https://wiki.logicore.com/teams/customer-delivery-tracking)
- [Customer Tracking API Docs](https://docs.logicore.com/customer-tracking-api)
- [Customer App User Guide](https://docs.logicore.com/customer-tracking-guide)

## Glossary and terms ubiquitous language
- **Live Tracking**: Real-time driver location on map
- **ETA**: Estimated Time of Arrival for delivery
- **Delivery Window**: Customer-selected time range for delivery
- **Proof of Delivery**: Photo/signature confirmation shown to customer

## Communication
- **Chat**: #customer-delivery-tracking
- **Email**: customer-tracking-team@logicore.com

## Daily sync time
9:30 AM daily standup

## What we're currently working on
- Q1 2026: Live chat with driver (in-app messaging)
- Q1 2026: Delivery preferences (leave at door, signature required)
- Q1 2026: Proactive delay notifications

## Teams we currently interact with

| Team Name | Interaction Mode | Purpose | Duration |
|-----------|------------------|---------|----------|
| Driver Experience Team | Collaboration | Driver-customer communication | Ongoing |
| Delivery Notifications Team | Collaboration | Push notifications for delivery updates | Ongoing |
| Mobile Platform Team | X-as-a-Service | CI/CD, analytics, crash reporting | Ongoing |
| Route Optimization Platform Team | X-as-a-Service | ETA predictions | Ongoing |
| Feature Management Platform Team | X-as-a-Service | Gradual rollout of map features | Ongoing |