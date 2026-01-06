---
name: CI/CD Platform Team
team_type: platform
position:
  x: 204.0
  y: 2375.0
metadata:
  size: 7
  cognitive_load: medium
  established: 2024-05
platform_grouping: Cloud Infrastructure Platform Grouping
---

# CI/CD Platform Team

- **Reusable GitHub Actions Workflows** (https://github.company.com/platform/gha-workflows) - Build, test, deploy workflows (YAML)
- **ArgoCD Applications** (https://github.company.com/platform/argocd-apps) - GitOps manifests (Helm, Kustomize)
- **CI/CD Platform Infrastructure** (https://github.company.com/platform/cicd-infra) - Terraform for runners, ArgoCD clusters
- **Deployment CLI Tools** (https://github.company.com/platform/deployment-cli) - Go CLI for advanced deployments (canary, blue-green)

## Versioning approaches

- **Reusable Workflows**: Semantic versioning with Git tags (e.g., `deploy-ecs@v2.1.0`), pin to major version in consuming repos
- **Breaking changes**: Announce 1 month in advance, provide migration guides, support old version for 6 months
- **ArgoCD Applications**: GitOps by design - all changes via pull requests, reviewed before merge
- **CLI tools**: Semantic versioning, distributed via internal package registry

## Wiki and documentation

- **CI/CD User Guide**: https://docs.company-internal/platforms/cicd - Main documentation
- **5-Minute Setup Guide**: https://docs.company-internal/platforms/cicd/quickstart - Add CI/CD to your service
- **Workflow Library**: https://docs.company-internal/platforms/cicd/workflows - Browse all available workflows
- **Advanced Deployments**: https://docs.company-internal/platforms/cicd/advanced - Canary, blue-green, progressive delivery
- **Troubleshooting Guide**: https://docs.company-internal/platforms/cicd/troubleshooting - Common pipeline failures

## Glossary and terms ubiquitous language

- **Golden Path**: Recommended CI/CD pattern for each service type (use this for 90% of services)
- **Reusable Workflow**: GitHub Actions workflow that can be called from other workflows (DRY principle)
- **GitOps**: Deployment approach where Git is source of truth - push to `main` = deploy to prod
- **Canary Deployment**: Gradual rollout (5% → 25% → 100%) with automatic rollback if metrics degrade
- **DORA Metrics**: Deployment frequency, lead time, change failure rate, recovery time (we track all 4)

## Communication

- **Slack (primary)**:
  - #platform-cicd - General questions, support, pipeline failures
  - #cicd-incidents - P0/P1 pipeline issues (monitored 24/7)
  - #deployment-notifications - Automated deployment alerts (read-only, high volume)
- **Office Hours**:
  - Tuesday 1pm-2pm UTC - CI/CD pipeline troubleshooting
  - Thursday 4pm-5pm UTC - Advanced topics (canary, blue-green, progressive delivery)
- **Email**: cicd-platform-team@company.com (prefer Slack)
- **Video**: Zoom for complex debugging or workflow design sessions

## Daily sync time

9:15 AM UTC daily standup (15 minutes)

**Team availability**: Core hours 9am-6pm UTC Monday-Friday, 24/7 on-call rotation for blocking pipeline issues

## What we're currently working on

### Q1 2026 Priorities

**High Priority:**
- **Progressive Delivery (Flagger)** - Automated canary deployments with metrics-based promotion/rollback
- **Build Cache Optimization** - Reduce average build time from 12 minutes to 8 minutes (Docker layer caching improvements)
- **Multi-Region Deployments** - Deploy to US-East, EU-West, APAC in parallel with region-specific rollback

**Medium Priority:**
- **Pull Request Previews** - Ephemeral environments for every PR (integrate with Cloud Development Platform)
- **DORA Metrics Dashboard v2** - Add change failure rate and recovery time tracking
- **Pipeline Security Scanning** - Integrate Snyk/Trivy for vulnerability scanning in all build pipelines

**Ongoing:**
- **Workflow library expansion** - Add 2-3 new workflows per quarter based on team requests
- **Documentation updates** - Expand advanced deployment patterns guides
- **Performance monitoring** - Continuously optimize build times

## Teams we currently interact with

| Team Name | Interaction Mode | Purpose | Duration |
|-----------|------------------|---------|----------|
| Cloud Development Platform Team | X-as-a-Service | Pipelines deploy to their AWS infrastructure (ECS, Lambda, EKS) | Ongoing |
| Observability Platform Team | X-as-a-Service | Send pipeline metrics to Prometheus, deployment events to Grafana | Ongoing |
| Developer Portal Team | X-as-a-Service | CI/CD status displayed in portal | Ongoing |
| API Gateway Platform Team | X-as-a-Service | Automated deployment to API Gateway routes | Ongoing |
| All stream-aligned teams | X-as-a-Service | Consume CI/CD pipelines for deployments | Ongoing |

## Teams we expect to interact with soon

| Team Name | Interaction Mode | Purpose | Expected Duration |
|-----------|------------------|---------|-------------------|
| Mobile App Experience Team | Collaboration | Build iOS/Android pipelines with App Store/Play Store automation | 6 weeks |
| Data Engineering Team | Collaboration | Custom pipelines for Airflow DAG deployments, Spark job CI/CD | 4 weeks |
| ML Recommendations Team | Collaboration | ML model deployment pipelines (train, test, deploy to SageMaker) | 8 weeks |

**Platform Metrics (Q4 2025):**
- **NPS Score**: 8.7/10 (CI/CD is critical for developer velocity)
- **Platform adoption**: 95% of services (38 out of 40 teams)
- **Self-service rate**: 92% of pipelines created without our help
- **Build-to-prod time**: 12 minutes average (target: <10 min)
- **Pipeline success rate**: 94.2%
- **Deployments per team per week**: 18 average (elite: 40+)
- **Lead time for changes**: 2.1 hours (commit to production)
- **Rollback rate**: 2.3% (well-tested pipelines)