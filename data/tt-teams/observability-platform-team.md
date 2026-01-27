---
team_id: observability-platform-team
name: Observability Platform Team
team_type: platform
position:
  x: 1080.0
  y: 1978.0
metadata:
  size: 5
  cognitive_load: medium
  established: 2023-09
platform_grouping: Cloud Infrastructure Platform Grouping
---

# Observability Platform Team

## Team name and focus

**Observability Platform Team** - Provides self-service monitoring, logging, and tracing as a compelling internal product, enabling LogiCore Systems engineering teams to debug production issues in under 5 minutes without manual log access requests or tribal knowledge.

## Team type

platform

## Part of a platform grouping?

Yes - Cloud Infrastructure Platform Grouping (works alongside Cloud Development, CI/CD, Portal teams)

## Services provided (if applicable)

- **Metrics Platform (Prometheus + Grafana)**: https://grafana.company-internal - Self-service dashboards, 50+ pre-built templates
- **Distributed Tracing (Jaeger)**: https://jaeger.company-internal - Trace search, performance analysis, 7-day retention
- **Log Aggregation (Loki)**: https://loki.company-internal - LogQL queries, 14-day retention, integration with Grafana
- **OpenTelemetry SDKs**: Pre-configured libraries for Python, Node.js, Java, Go with LogiCore defaults
- **Alerting (AlertManager + PagerDuty)**: SLO-based alerting, on-call rotation management
- **Dashboard Templates**: 50+ Jsonnet templates for common patterns (web service, worker, database, cache)

## Service-level expectations (SLA)

- **Platform uptime**: 99.9% (Grafana, Prometheus, Jaeger availability)
- **Metrics latency**: <30 seconds from event to visible in Grafana
- **Trace availability**: 100% of traces captured (with sampling for high-volume services)
- **Support response**:
  - Slack questions: <1 hour during business hours (Mon-Fri 8am-6pm UTC)
  - Platform outages (P0/P1): <10 minutes response (24/7 on-call)
  - Dashboard/alert customization: <4 hours for requests
- **Onboarding**: New service gets basic monitoring in <10 minutes (using templates)
- **SLO setup help**: Attend Friday office hours, we'll help define your first SLO (30 min session)

## Software owned and evolved by this team

- **Observability Platform Infrastructure** (https://github.company.com/platform/observability) - Terraform + Helm for Prometheus, Grafana, Jaeger, Loki
- **Dashboard Template Library** (https://github.company.com/platform/grafana-templates) - 50+ Jsonnet/Grafonnet dashboards
- **OpenTelemetry SDK Wrappers** (https://github.company.com/platform/otel-sdks) - LogiCore-specific instrumentation libraries
- **Alerting Rules & Runbooks** (https://github.company.com/platform/alerting) - Shared Prometheus alerting rules, linked runbooks

## Versioning approaches

- **Prometheus/Grafana**: Follow upstream releases, upgrade quarterly (announce 2 weeks in advance)
- **Dashboard templates**: Semantic versioning (v2.1.0), backwards compatible unless marked breaking
- **OpenTelemetry SDKs**: Semantic versioning, breaking changes supported for 6 months alongside new version
- **Alerting rules**: Versioned by date (2026-01-rules.yaml), teams can pin to specific versions

## Wiki and documentation

- **Observability User Guide**: https://docs.company-internal/platforms/observability - Main documentation
- **5-Minute Setup Guide**: https://docs.company-internal/platforms/observability/quickstart - Add monitoring to your service
- **SLO Guide**: https://docs.company-internal/sre/slo-guide - How to define and track SLOs
- **Dashboard Template Catalog**: https://grafana-templates.company-internal - Browse and copy templates
- **Troubleshooting Runbooks**: https://runbooks.company-internal/observability - Common issues and fixes

## Glossary and terms ubiquitous language

- **SLI (Service Level Indicator)**: Quantitative measure of service health (e.g., latency, error rate, availability)
- **SLO (Service Level Objective)**: Target value for an SLI (e.g., "99.9% uptime", "p95 latency <200ms")
- **Error Budget**: Amount of downtime allowed before violating SLO (e.g., 0.1% downtime = 43 minutes/month)
- **MTTD (Mean Time To Detection)**: How fast we detect incidents (target: <2 minutes for P0)
- **TVP (Thinnest Viable Platform)**: Minimum observability tooling needed - we avoid overwhelming teams

## Communication

- **Slack (primary)**:
  - #platform-observability - General questions, support, feedback
  - #alerts-critical - P0/P1 platform alerts (monitored 24/7)
  - #observability-feedback - Feature requests, improvements
- **Office Hours**:
  - Wednesday 2pm-3pm UTC - Dashboard and alerting help
  - Friday 10am-11am UTC - SRE practices workshop (SLOs, error budgets, incident response)
- **Email**: observability-team@company.com (prefer Slack)
- **Video**: Zoom for complex debugging sessions or custom integrations

## Daily sync time

9:30 AM UTC daily standup (15 minutes)

**Team availability**: Core hours 9am-6pm UTC Monday-Friday, 24/7 on-call rotation for platform incidents

## What we're currently working on

### Q1 2026 Priorities

**High Priority:**
- **SLO Coverage Initiative** - Help 20 more teams define SLOs (currently 72% coverage, targeting 90%)
- **Grafana 11.0 Upgrade** - New visualization features, improved performance
- **Distributed Tracing for Mobile Apps** - Extend OpenTelemetry to iOS/Android apps

**Medium Priority:**
- **Log Cost Optimization** - Reduce Loki storage costs by 30% through better retention policies
- **Custom Metrics Exporter** - Allow teams to export business metrics (revenue, signups) alongside technical metrics

**Ongoing:**
- **Dashboard template updates** - Add 5 new templates per quarter based on team requests
- **Runbook improvements** - Link every alert to actionable runbook
- **Documentation** - Expand SRE best practices guides

## Teams we currently interact with

| Team Name | Interaction Mode | Purpose | Duration |
|-----------|------------------|---------|----------|
| Cloud Development Platform Team | X-as-a-Service | Run on their AWS/Kubernetes infrastructure | Ongoing |
| API Gateway Platform Team | X-as-a-Service | Monitor API Gateway metrics and traces | Ongoing |
| CI/CD Platform Team | X-as-a-Service | Monitor build/deploy pipelines, track deployment frequency | Ongoing |

## Teams we expect to interact with soon

| Team Name | Interaction Mode | Purpose | Expected Duration |
|-----------|------------------|---------|-------------------|
| Driver Experience Team | Collaboration | Add mobile app observability (crash reporting, performance monitoring) | 8 weeks |
| Data Engineering Enablement Team | Collaboration | Custom dashboards for Airflow DAG monitoring | 4 weeks |
| Security Compliance Team | X-as-a-Service | Integrate security audit logs into observability platform | Ongoing |

**Platform Metrics (Q4 2025):**
- **NPS Score**: 7.8/10 (industry avg for internal platforms: 6.5)
- **Platform adoption**: 100% of production services (all 40 teams)
- **SLO coverage**: 72% of services have ≥1 SLO defined
- **Time-to-first-dashboard**: 8 minutes average
- **Self-service rate**: 88% dashboards created without our help
- **MTTD**: 3.2 minutes average for P0 incidents