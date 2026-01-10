---
name: Enterprise CRM Integration Team
team_type: stream-aligned
position:
  x: 204.0
  y: 970.0
metadata:
  size: 6
  cognitive_load: high
  established: 2024-02
  flow_metrics:
    lead_time_days: 35
    deployment_frequency: monthly
    change_fail_rate: 0.22
    mttr_hours: 6
value_stream: B2B Services
---

# Enterprise CRM Integration Team

## Team name and focus
Enterprise CRM Integration Team – Owns integrations with enterprise CRM systems (Salesforce, HubSpot, Dynamics) enabling LogiCore Platform to sync with B2B customer systems for seamless fleet management data flow.

## Team type
stream-aligned

## Part of a value stream?

Yes - B2B Services

This team works within the B2B Services value stream alongside Enterprise Reporting and Fleet Operations teams, serving enterprise fleet operators.

## Services provided (if applicable)
N/A - This is a stream-aligned team that delivers customer-facing integration features for B2B clients.

## Service-level expectations (SLA)
- Integration availability: 99.5% uptime
- Data sync latency: < 5 minutes
- Support response: < 2 hours (business-critical for enterprise customers)

## Software owned and evolved by this team
- CRM Integration Service (Python)
- Webhook Processing Engine
- Enterprise API Gateway

## Versioning approaches
- Semantic versioning for integration APIs
- Feature flags for new integrations

## Wiki and documentation
- [Team Wiki](https://wiki.company.com/teams/crm-integration)
- [Integration API Docs](https://docs.company.com/crm-api)

## Glossary and terms ubiquitous language
- **CRM Sync**: Bidirectional data synchronization
- **Webhook**: Event-driven integration callback

## Communication
- **Chat**: #enterprise-crm-integration
- **Email**: crm-integration@company.com

## Daily sync time
9:30 AM daily standup

## What we're currently working on
- Q1 2026: Dynamics 365 integration
- Q1 2026: Real-time sync improvements

## Teams we currently interact with

| Team Name | Interaction Mode | Purpose | Duration |
|-----------|------------------|---------|----------|
| Enterprise Fleet Portal Team | Collaboration | Shared enterprise customer context | Ongoing |
| DevOps Enablement Team | Facilitating | Infrastructure-as-code, GitOps workflows | 10 weeks (ending Mar 2026) |
| Data Storage Platform Team | X-as-a-Service | Data persistence | Ongoing |
| API Gateway Platform Team | x-as-a-service | API routing and authentication |
| Data Pipeline Platform Team | x-as-a-service | Data synchronization |