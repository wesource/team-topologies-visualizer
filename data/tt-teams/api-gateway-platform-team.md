---
team_id: api-gateway-platform-team
name: API Gateway Platform Team
team_type: stream-aligned
position:
  x: 204.0
  y: 2095.0
metadata:
  size: 6
  cognitive_load: medium
  established: 2023-11
  flow_metrics:
    lead_time_days: 5
    deployment_frequency: daily
    change_fail_rate: 0.08
    mttr_hours: 1.5
platform_grouping: Cloud Infrastructure Platform Grouping
---

# API Gateway Platform Team

## Team name and focus
API Gateway Platform Team – Stream-aligned team delivering API gateway as a product experience for API consumers, focusing on developer experience, API documentation, and service reliability within the platform grouping.

## Team type
stream-aligned

## Part of a platform grouping?
Yes – Cloud Infrastructure Platform Grouping (stream-aligned team delivering internal API product, similar to Developer Portal Team)

## Services provided (if applicable)
N/A - This is a stream-aligned team delivering API gateway as a product experience.

## Service-level expectations (SLA)
- API gateway availability: 99.95% (measured monthly)
- P99 latency overhead: < 5ms
- Time to expose new API: < 2 hours
- Services using service mesh: 85%
- mTLS adoption: 100% of production services

## Software owned and evolved by this team
...existing code...
- Kong Gateway / AWS API Gateway
- Istio / Linkerd
- Envoy proxy
- Cert-manager
- AWS WAF, Shield
- HashiCorp Vault
## Versioning approaches
- Semantic versioning for API gateway configs
- Breaking changes announced 2 weeks in advance
## Wiki and documentation
- [Team Wiki](https://wiki.company.com/teams/api-gateway)
- [API Docs](https://docs.company.com/api-gateway)
## Glossary and terms ubiquitous language
- **API Gateway**: Manages ingress traffic, authentication, and routing
- **Service Mesh**: Manages service-to-service communication, security, and observability
## Communication
- **Chat**: #api-gateway-platform
- **Email**: api-gateway@company.com
## Daily sync time
10:00 AM daily standup
## What we're currently working on
- Q1 2026: Simplify service mesh onboarding
- Q1 2026: Automate WAF policy management
- Q1 2026: Improve API analytics dashboards
## Teams we currently interact with
| Team Name | Interaction Mode | Purpose | Duration |
|-----------|------------------|---------|----------|
| Security Compliance Team | Collaboration | Define compliance policies | Ongoing |
| Developer Portal Team | X-as-a-Service | Expose API metrics | Ongoing |
| All platform teams | Collaboration | Service mesh integration | Ongoing |
## Teams we expect to interact with soon
| Team Name | Interaction Mode | Purpose | Expected Duration |
|-----------|------------------|---------|-------------------|
| Billing Team | X-as-a-Service | New API onboarding | 2 months |
| Fraud Detection and Risk Modeling Team | Collaboration | Secure fraud APIs | 3 months |

## X-as-a-Service Offerings
- Self-service API route configuration
- Automatic TLS certificate provisioning
- Pre-configured rate limit templates
- Service mesh sidecar injection (automatic)
- Traffic policy templates (canary, blue/green)
- API usage analytics dashboards

## Interaction Patterns
- **X-as-a-Service**: Default mode - teams configure routes via GitOps
- **Collaboration**: Security team on WAF rules, compliance requirements (ongoing)
- **Facilitating**: Help teams adopt service mesh patterns (2-3 week engagement)

## Service Mesh Benefits
- **Zero code changes**: Automatic traffic encryption, observability
- **Policy enforcement**: Consistent security across all services
- **Resilience**: Circuit breakers, retries without app logic
- **Traffic control**: Canary releases, A/B testing at infrastructure level

## Success Metrics
- API gateway availability: 99.95% (measured monthly)
- P99 latency overhead: < 5ms
- Time to expose new API: < 2 hours
- Services using service mesh: 85%
- mTLS adoption: 100% of production services

## Current Challenges
- **Cognitive load**: Service mesh complexity requires ongoing education
- **Solution**: Creating simplified, opinionated patterns and runbooks
- **Collaboration with Security team**: Defining compliance policies as code