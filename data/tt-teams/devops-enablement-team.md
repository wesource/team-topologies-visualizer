---
team_id: devops-enablement-team
name: DevOps Enablement Team
team_type: enabling
position:
  x: 670.0
  y: 869.0
metadata:
  size: 4
  cognitive_load: medium
  established: 2024-02
value_stream: B2B Services
---

# DevOps Enablement Team

## Team name and focus
DevOps Enablement Team – Currently embedded with the B2B Services value stream teams to help them transform to cloud-native practices, CI/CD pipelines, and infrastructure-as-code. Temporary engagement (8-12 weeks) to upskill teams on DevOps practices with the goal of the Enterprise Sales teams becoming autonomous in cloud deployments.

## Team type
enabling

## Part of a value stream?

Yes - B2B Services

Temporary engagement.

This enabling team is currently focused on helping B2B Services teams (Enterprise Fleet Portal, Enterprise CRM Integration, Enterprise Reporting) transition from traditional deployment models to cloud-native CI/CD practices. Once these teams are autonomous, the enabling team will move to help another value stream.

## Services provided (if applicable)
Our enabling team provides coaching and knowledge transfer, not long-term services:
- DevOps practices coaching: CI/CD, infrastructure-as-code, GitOps, deployment strategies for enterprise B2B workloads
- Cloud-native patterns guidance: Kubernetes, containers, serverless, microservices architectures
- Tooling adoption support: Help teams adopt GitHub Actions, Terraform, ArgoCD, Helm in fleet management context
- Pair programming sessions: Hands-on coding together on team's actual problems
- Workshops and training: Custom workshops based on B2B Services team needs (2-4 hour sessions)
- Architecture reviews: Review team's infrastructure and deployment architecture, provide feedback

## Service-level expectations (SLA)

**Engagement model**: Temporary collaboration (6-12 weeks typical), then teams should be autonomous

- **Initial consultation**: Within 3 business days of request
- **Engagement capacity**: Work with 2-3 teams simultaneously (we're a small team)
- **Time commitment**: 4-8 hours per week per team during engagement
- **Availability**: Flexible scheduling, prefer morning pairing sessions (9am-12pm UTC)
- **Follow-up support**: Slack support for 1 month after engagement ends, then team should be self-sufficient

**Success criteria**: Team can confidently operate their DevOps tooling without our help after engagement ends.

## Software owned and evolved by this team

We don't own production systems - we help teams own theirs. We maintain:

- **DevOps Playbooks** (https://github.company.com/enablement/devops-playbooks) - Best practices, patterns, anti-patterns documentation
- **Workshop Materials** (https://github.company.com/enablement/workshops) - Training slides, hands-on exercises, labs
- **Reference Implementations** (https://github.company.com/enablement/reference-apps) - Example apps with CI/CD, IaC, observability best practices

## Versioning approaches

Our playbooks and workshop materials follow semantic versioning:
- Major version (2.0) = significant methodology changes (e.g., GitOps → FluxCD)
- Minor version (1.3) = new patterns added, existing content enhanced
- Patch version (1.2.1) = typo fixes, minor corrections

Announce major updates via #devops-enablement Slack channel.

## Wiki and documentation

- **DevOps Playbooks**: https://devops-playbooks.company-internal - Our canonical best practices guide
- **Workshop Catalog**: https://workshops.company-internal/devops - Available workshops and how to book them
- **Engagement Process**: https://devops-playbooks.company-internal/how-to-engage - How to request our help
- **Success Stories**: https://devops-playbooks.company-internal/case-studies - Past engagements and outcomes

## Glossary and terms ubiquitous language

- **Enabling engagement**: A time-boxed (6-12 week) collaboration where we upskill a team on DevOps practices
- **Pair programming session**: 2-4 hour hands-on coding session with team members (not just advice)
- **Autonomy readiness**: When a team can operate their DevOps tooling without ongoing help from us
- **Golden path**: The recommended way to do something (e.g., "Golden path for deploying a microservice")
- **Thinnest Viable Platform (TVP)**: Minimum set of platform capabilities needed (we help teams avoid over-engineering)

## Communication

- **Slack (primary)**: #devops-enablement - Ask questions, request engagements, discuss patterns
- **Booking office hours**: https://calendar.company-internal/devops-enablement - 30-minute consultation slots
- **Email**: devops-enablement@company.com (we prefer Slack)
- **Video**: Zoom/Google Meet for pairing sessions and workshops

**Response times**:
- Slack questions: <4 hours during business hours (Mon-Fri 9am-5pm UTC)
- Engagement requests: Initial response within 3 business days
- Workshop bookings: 2-week lead time preferred

## Daily sync time

9:00 AM UTC daily standup (15 minutes, team-only)

**Team availability**: Generally available 9am-5pm UTC Monday-Friday, flexible for pairing sessions scheduled in advance.

## What we're currently working on

### Q1 2026 Active Engagements
- **Driver Experience Team** (Week 4 of 8): Kubernetes adoption, Helm charts, GitOps with ArgoCD
- **Fraud Detection & Risk Modeling Team** (Week 2 of 10): ML model deployment pipelines, SageMaker CI/CD
- **Data Engineering Enablement Team** (Starting Week 1): Airflow DAG testing, infrastructure-as-code for data pipelines

### Upcoming Workshops (Open to All Teams)
- **"GitOps Fundamentals with ArgoCD"** - Jan 15, 2026, 10am-1pm UTC (3 hours)
- **"Terraform Testing with Terratest"** - Jan 29, 2026, 2pm-4pm UTC (2 hours)

### Internal Team Projects
- Updating DevOps Playbooks with LogiCore Systems' patterns (learned from past 10 engagements)
- Creating "Self-Assessment Quiz" - teams can evaluate their DevOps maturity before engaging us

## Teams we currently interact with

| Team Name | Interaction Mode | Purpose | Duration |
|-----------|------------------|---------|----------|
| Enterprise Fleet Portal Team | Facilitating | Cloud-native deployment patterns, CI/CD setup | 8 weeks (ending Feb 2026) |
| Enterprise CRM Integration Team | Facilitating | Infrastructure-as-code, GitOps workflows | 10 weeks (ending Mar 2026) |
| Enterprise Reporting Team | Facilitating | Containerization, Kubernetes deployment | 8 weeks (ending Mar 2026) |

## Teams we expect to interact with soon

| Team Name | Interaction Mode | Purpose | Expected Duration |
|-----------|------------------|---------|-------------------|
| Fleet Monitor Team | Facilitating | Advanced Kubernetes (HPA, resource limits, cost optimization) | 6 weeks |
| Machine Learning & AI Specialists Team | Facilitating | MLOps practices, model versioning, A/B testing infrastructure | 10 weeks |
| Enterprise Fleet Portal Team | Facilitating | Blue-green deployments, canary releases, progressive delivery | 6 weeks |

**Note**: As an enabling team, we're designed to be temporary collaborators. If your team is repeatedly asking us for help with the same topics, it's a signal that we haven't successfully enabled autonomy yet - let's discuss how to adjust our approach!