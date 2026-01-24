---
name: Cloud Platform Team
team_type: platform
position:
  x: 121.0
  y: 634.0
metadata:
  size: 5
  cognitive_load: medium
  established: 2026-01
value_stream: N/A (enables all stream-aligned teams)
---

# Cloud Platform Team

## Team name and focus

Cloud Platform Team – Platform team (using Thinnest Viable Platform approach) providing self-service AWS infrastructure and CI/CD capabilities to stream-aligned teams.

## Team type

platform

## Part of a value stream?

No - Platform teams accelerate multiple stream-aligned teams across different value streams.

## Origin Story

**Created**: January 2026 (First TT transformation step)

**Transformed from**: DevOps & Infrastructure Team

**Why transform?**: The old DevOps team was a bottleneck - every deployment required a ticket, every database change needed manual provisioning. Stream-aligned teams were blocked waiting for infrastructure.

**Platform Philosophy - Thinnest Viable Platform (TVP)**:
- Start small: Focus on most painful bottleneck (deployments)
- Self-service: Teams provision their own resources
- Treat platform as a product: Stream-aligned teams are our customers
- Measure adoption: If teams aren't using it, we failed

## Services provided (if applicable)

**Self-Service Platform Capabilities** (not ticket-driven):

1. **CI/CD Pipelines**: GitHub Actions templates for automated deployments
2. **AWS Infrastructure**: Terraform modules for ECS, RDS, S3, CloudFront
3. **Databases**: Self-service PostgreSQL provisioning (RDS)
4. **Monitoring**: Pre-configured Prometheus + Grafana dashboards
5. **Documentation**: Platform runbooks and getting-started guides

## Service-level expectations (SLA)

- **Self-service availability**: 99.5% uptime
- **Support response**: < 2 hours during business hours
- **New team onboarding**: < 1 day (self-service)
- **Platform bug fixes**: < 1 week

**NOT ticket-driven**:
- No "request deployment" tickets
- No "provision database" tickets
- Teams deploy independently using our tools

## Software owned and evolved by this team

- **Infrastructure-as-Code**: Terraform modules (AWS ECS, RDS, S3, networking)
- **CI/CD Templates**: GitHub Actions workflows
- **Platform CLI**: Internal tool for provisioning resources
- **Documentation Portal**: Hugo-based docs site
- **Monitoring Stack**: Prometheus, Grafana, Loki

## Technologies

- **IaC**: Terraform, Terragrunt
- **CI/CD**: GitHub Actions
- **Cloud**: AWS (ECS, RDS, S3, CloudFront, Route53)
- **Monitoring**: Prometheus, Grafana, Loki
- **Documentation**: Hugo, Markdown

## Dependencies and interaction modes

| Team | Interaction Mode | Purpose | Duration |
|------|------------------|---------|----------|
| Dispatch & Fleet Team | X-as-a-Service | Consuming platform (infrastructure, CI/CD) | Ongoing |
| Delivery & Routing Team | X-as-a-Service | Consuming platform (infrastructure, CI/CD) | Ongoing |
| Route Optimization Platform Team | X-as-a-Service | Consuming platform (infrastructure, CI/CD) | Ongoing |
| DevOps Enablement Team | Collaboration | Defining best practices for platform adoption | 4 weeks (ending Feb 2026) |

**X-as-a-Service means**:
- Stream-aligned teams self-service our platform
- No tickets required for standard operations
- Clear documentation and APIs
- We support, not gate-keep

## Flow Metrics

### Platform Adoption
- **Teams onboarded**: 3 out of 3 initial teams (100%)
- **Self-service usage**: 85% of deployments done without platform team involvement
- **Ticket reduction**: 90% fewer tickets than old DevOps model

### Platform Reliability
- **Availability**: 99.7% (exceeds 99.5% SLA)
- **Deployment success rate**: 94%
- **Time to provision new service**: < 1 hour (was 3 days with tickets)

### Customer Satisfaction
- **Stream-aligned team feedback**: 8/10 (was 4/10 under old DevOps model)
- **Time saved per team**: ~10 hours/week (no waiting for tickets)

## Cognitive Load Assessment

- **Overall**: Medium (appropriate for platform team)
- **Down from**: High (old ticket-driven DevOps model)

**What reduced the load**:
- Self-service removes toil (no more manual provisioning tickets)
- Focus on thin platform (not trying to support everything)
- Clear boundaries (we do AWS infrastructure, not application code)

## Team Composition

- 1 Platform Lead (former DevOps Team Lead)
- 2 Infrastructure Engineers (Terraform, AWS)
- 1 CI/CD Engineer (GitHub Actions, automation)
- 1 Technical Writer (platform docs, onboarding guides)

## Current Challenges

**Early Days (Month 1)**:
- Building trust with stream-aligned teams (old "ticket DevOps" habits)
- Finding right abstractions (too much vs too little self-service)
- Documentation gaps (teams asking same questions)

**Platform Adoption**:
- Some teams hesitant to use self-service (prefer tickets - old habits!)
- Educating teams on platform capabilities
- Balancing flexibility vs standardization

## Success So Far (1 Month In)

✅ All 3 teams onboarded and deploying independently
✅ 90% reduction in infrastructure tickets
✅ Stream-aligned teams report faster deployments
✅ Platform documentation site launched

## Thinnest Viable Platform (TVP) in Practice

**What we built (Jan 2026)**:
- ✅ CI/CD pipelines (biggest pain point)
- ✅ Basic AWS infrastructure (ECS, RDS)
- ✅ Monitoring stack (Prometheus + Grafana)

**What we deliberately did NOT build**:
- ❌ Secret management (using AWS Secrets Manager directly for now)
- ❌ Service mesh (too complex for 3 teams)
- ❌ Custom Kubernetes platform (ECS is simpler)

**Principle**: Only build what stream-aligned teams actually need, not what we think they might need.

## Contact

- **Slack**: #cloud-platform-team
- **Platform Docs**: https://platform.logicore.com
- **Team Lead**: James Rodriguez (james.rodriguez@logicore.com)
- **Support**: #platform-support (2-hour response SLA)