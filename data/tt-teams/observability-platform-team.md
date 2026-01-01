---
name: Observability Platform Team
team_type: platform
dependencies: []
interaction_modes:
  DevOps Enablement Team: facilitating
position:
  x: 204.0
  y: 1400.0
metadata:
  size: 6
  focus: Monitoring, logging, tracing, and alerting infrastructure
  platform_grouping: Cloud Infrastructure Platform Grouping
  cognitive_load: medium
  established: 2024-03
---

# Observability Platform Team

Provides comprehensive observability tooling and practices as an internal product, enabling stream-aligned teams to understand system behavior.

## Platform Grouping
**Cloud Infrastructure Platform Grouping** - Works alongside AWS Developer Platform Team to provide full infrastructure capabilities.

## Mission
Empower development teams with self-service observability through a Thinnest Viable Platform (TVP) approach - providing just enough tooling and patterns without overwhelming cognitive load.

## Responsibilities

### Metrics & Monitoring
- Prometheus / Victoria Metrics infrastructure
- Grafana dashboards and templates
- PromQL query library and patterns
- Alerting rules and runbooks (AlertManager)
- Service-level indicators (SLIs) and objectives (SLOs)

### Distributed Tracing
- Jaeger / Tempo deployment
- OpenTelemetry collector infrastructure
- Trace context propagation patterns
- Performance profiling tools

### Logging
- Centralized log aggregation (Loki, ELK)
- Log retention policies
- Log parsing and enrichment
- Log-based alerting

### Self-Service Capabilities
- Grafana template dashboards (service overview, DB performance, cache metrics)
- Pre-configured alert templates
- SLO/SLA tracking dashboards
- Cost visibility dashboards

## Technologies
- Prometheus, Victoria Metrics
- Grafana, Grafana Loki
- OpenTelemetry
- Jaeger / Tempo
- PagerDuty integration
- AWS CloudWatch (hybrid approach)

## X-as-a-Service Offerings
Stream-aligned teams consume:
- Pre-configured monitoring for common patterns (web service, worker, scheduled job)
- Automatic metric scraping (service discovery)
- Log shipping agents
- Distributed tracing SDKs with sensible defaults
- On-call rotation management (PagerDuty)

## Interaction Patterns
- **X-as-a-Service**: Teams self-serve dashboards and alerts
- **Facilitating**: Help teams adopt SRE practices (error budgets, SLOs)
- **Collaboration**: Work with teams on complex observability requirements (temporary, 2-4 weeks)

## Success Metrics
- Time to create first dashboard: < 10 minutes
- % of services with SLOs defined: Target 80%
- Mean time to detection (MTTD): < 5 minutes
- Internal NPS score from stream-aligned teams: > 40