---
team_id: fleet-operations-team
name: Fleet Operations Team
team_type: stream-aligned
position:
  x: 730.0
  y: 725.0
metadata:
  size: 6
  cognitive_load: medium
  established: 2024-03
value_stream: B2B Services
---

# Fleet Operations Team

## Team name and focus
Fleet Operations Team – Owns the DispatchHub application for B2B customers (fleet operators and dispatchers), including real-time fleet tracking, route assignment, driver communication, and load planning tools.

## Team type
stream-aligned

## Part of a value stream?

Yes - B2B Services

This team works within the B2B Services value stream alongside Route Optimization, FleetMonitor, and Enterprise Integration teams, serving fleet operators and dispatchers.

## Services provided (if applicable)
N/A - This is a stream-aligned team that delivers customer-facing features for fleet operators.

## Service-level expectations (SLA)
- DispatchHub availability: 99.95% uptime
- Fleet tracking latency: < 100ms p99
- Route assignment response: < 500ms
- Support response time: < 1 hour (business-critical)

## Software owned and evolved by this team
- DispatchHub Web Application (React + TypeScript)
- Fleet Tracking Service (Node.js)
- Route Assignment API (Node.js)
- Driver-Dispatcher Messaging Service
- Load Planning Tools

## Versioning approaches
- Semantic versioning for DispatchHub API
- Feature flags for dispatcher UX experiments
- Weekly deployment cadence

## Wiki and documentation
- [Team Wiki](https://wiki.logicore.com/teams/fleet-operations)
- [DispatchHub API Docs](https://docs.logicore.com/dispatchhub-api)
- [Dispatcher User Guide](https://docs.logicore.com/dispatcher-guide)

## Glossary and terms ubiquitous language
- **Dispatch**: Assigning delivery routes to drivers
- **Load Planning**: Optimizing vehicle capacity and route sequencing
- **Fleet Tracking**: Real-time visibility of all vehicles and drivers
- **Proof of Delivery (POD)**: Photo/signature confirmation from driver

## Communication
- **Chat**: #fleet-operations
- **Email**: fleet-ops-team@logicore.com

## Daily sync time
9:00 AM daily standup

## What we're currently working on
- Q1 2026: Multi-depot route planning interface
- Q1 2026: Real-time driver location updates (WebSocket)
- Q1 2026: Driver performance dashboard for dispatchers

## Teams we currently interact with

| Team Name | Interaction Mode | Purpose | Duration |
|-----------|------------------|---------|----------|
| Route Optimization Platform Team | X-as-a-Service | Route optimization algorithms | Ongoing |
| Driver Experience Team | Collaboration | Driver-dispatcher communication | Ongoing |
| Data Storage Platform Team | X-as-a-Service | Fleet data persistence | Ongoing |