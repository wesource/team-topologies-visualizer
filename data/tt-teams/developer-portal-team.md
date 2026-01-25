---
team_id: developer-portal-team
name: Developer Portal Team
team_type: stream-aligned
position:
  x: 1280.0
  y: 1714.0
metadata:
  size: 6
  cognitive_load: medium
  established: 2023-09
platform_grouping: Cloud Infrastructure Platform Grouping
---

# Developer Portal Team

## Team name and focus
Developer Portal Team – Provides a unified developer portal (Backstage-based) as the "single pane of glass" for LogiCore Systems engineers, aggregating service catalogs, documentation, deployment status, cost insights, and onboarding workflows in one self-service hub.

## Team type
stream-aligned

## Part of a platform grouping?
Yes – Cloud Infrastructure Platform Grouping (stream-aligned team delivering internal product within the platform grouping)

## Services provided (if applicable)
- Developer Portal (Backstage): Unified web portal at https://portal.company-internal
- Service Catalog: Searchable catalog of all 120+ services at LogiCore with owners, dependencies, SLOs
- Software Templates (Scaffolder): "Create New Service" wizard - generates repo, CI/CD, monitoring in <15 minutes
- Tech Docs: Documentation auto-synced from GitHub repos, searchable in portal
- Deployment Dashboard: Real-time deployment status, history, rollback buttons
- Cost Visibility: AWS cost breakdown by service/team (integrates with Cloud Development Platform)
- On-Call Schedules: PagerDuty integration showing who's on-call for each service
- Onboarding Workflows: "New Engineer" checklist automates first-week setup

## Service-level expectations (SLA)

- **Portal uptime**: 99.9% (portal and APIs)
- **Portal performance**: <1 second page load for catalog, <2 seconds for dashboards
- **Support response**: 
  - Slack questions: <2 hours during business hours (Mon-Fri 8am-6pm UTC)
  - Portal outages (P0/P1): <20 minutes response (24/7 on-call)
  - Feature requests: Acknowledged within 2 business days, triaged weekly
- **Onboarding**: New engineer gets portal access via SSO on day 1 (automatic)
- **Service registration**: Pull requests to catalog reviewed within 1 business day

## Software owned and evolved by this team

- **Developer Portal** (https://github.company.com/portal/backstage-app) - Main Backstage application (TypeScript, React)
- **Custom Backstage Plugins** (https://github.company.com/portal/plugins) - LogiCore-specific plugins:
  - Cost Dashboard plugin (integrates with AWS Cost Explorer)
  - Deployment Status plugin (GitHub Actions + ArgoCD)
  - On-Call widget plugin (PagerDuty)
- **Service Catalog Data** (https://github.company.com/portal/catalog) - 120+ `catalog-info.yaml` files
- **Software Templates** (https://github.company.com/portal/templates) - Scaffolder templates for new services

## Versioning approaches

- **Backstage Core**: Follow Backstage's monthly release cycle, upgrade within 1 month of new releases
- **Custom Plugins**: Semantic versioning (e.g., `cost-plugin@2.1.0`), changelog in each plugin repo
- **Breaking changes**: Announce 2 weeks in advance via #developer-portal Slack channel, provide migration guides
- **Template versions**: Software templates are versioned (v1, v2) - old versions supported for 6 months after new version released

## Wiki and documentation

- **Portal User Guide**: https://docs.company-internal/portal - How to use the developer portal
- **Getting Started (5 minutes)**: https://docs.company-internal/portal/quickstart - New team onboarding to portal
- **Service Registration Guide**: https://docs.company-internal/portal/register-service - How to add your service to catalog
- **Plugin Development Guide**: https://docs.company-internal/portal/plugins - Build custom Backstage plugins
- **Software Templates Guide**: https://docs.company-internal/portal/templates - How to use scaffolder

## Glossary and terms ubiquitous language

- **Service Catalog**: Inventory of all services at LogiCore with metadata (owners, SLOs, dependencies)
- **catalog-info.yaml**: YAML file in each service's repo describing the service (auto-discovered by portal)
- **Software Template (Scaffolder)**: "Create new X" wizards that generate boilerplate (repos, CI/CD, monitoring)
- **Tech Docs**: Documentation-as-code (Markdown in repos, rendered in portal)
- **Backstage Entity**: Any item in the catalog (service, team, API, library, resource)

## Communication

- **Slack (primary)**: 
  - #developer-portal - General questions, feature requests, feedback
  - #portal-incidents - P0/P1 portal issues (monitored 24/7)
- **Office Hours**:
  - Monday 3pm-4pm UTC - Plugin development help
  - Thursday 11am-12pm UTC - Onboarding workflow customization
- **Email**: developer-portal-team@company.com (prefer Slack)
- **Video**: Zoom for pairing on custom plugins or complex integrations

## Daily sync time

10:00 AM UTC daily standup (15 minutes)

**Team availability**: Generally available 9am-6pm UTC Monday-Friday

## What we're currently working on

### Q1 2026 Priorities

**High Priority:**
- **Slack Integration Plugin** - Notify teams in Slack when their services are deployed, have incidents, or fail CI checks
- **Service Health Score** - Calculate health score (uptime + deploy frequency + SLO adherence) for each service, show in catalog
- **Mobile App Support** - Extend portal to show mobile app builds (iOS/Android) from CI/CD Platform

**Medium Priority:**
- **Search Improvements** - Better full-text search across docs, services, and dependencies
- **Cost Optimization Recommendations** - Surface AWS cost savings opportunities from Cloud Platform team

**Ongoing:**
- **Documentation improvements** - Expand getting started guides, video tutorials
- **Portal performance optimization** - Reduce load times, optimize database queries

## Teams we currently interact with

| Team Name | Interaction Mode | Purpose | Duration |
|-----------|------------------|---------|----------|
| Cloud Development Platform Team | X-as-a-Service | Portal runs on their AWS infrastructure, integrates their cost APIs | Ongoing |
| Observability Platform Team | X-as-a-Service | Display Grafana dashboards and PagerDuty on-call schedules in portal | Ongoing |
| CI/CD Platform Team | X-as-a-Service | Show deployment status from GitHub Actions + ArgoCD | Ongoing |
| API Gateway Platform Team | X-as-a-Service | Display API Gateway metrics and service mesh topology | Ongoing |

## Teams we expect to interact with soon

| Team Name | Interaction Mode | Purpose | Expected Duration |
|-----------|------------------|---------|-------------------|
| Data Engineering Enablement Team | Collaboration | Build Airflow DAG catalog plugin - show data pipelines in portal | 6 weeks |
| Machine Learning & AI Specialists Team | Collaboration | Add ML model catalog - track model versions, performance metrics | 8 weeks |
| Security Compliance Team | X-as-a-Service | Integrate security scan results (vulnerabilities, compliance status) in service catalog | Ongoing |

**Portal Metrics (Q4 2025):**
- **Daily active users**: 180 out of 200 engineers (90% adoption)
- **Service catalog coverage**: 95% of production services (114 out of 120)
- **Scaffolder usage**: 78% of new services created via portal templates
- **NPS Score**: 8.5/10 (measured quarterly)
- **Onboarding time**: 2 days (down from 5 days before portal existed)