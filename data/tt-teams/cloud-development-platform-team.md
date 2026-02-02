---
name: Cloud Development Platform Team
team_id: cloud-development-platform-team
team_type: platform
position:
  x: 1080
  y: 1294
platform_grouping: Cloud Infrastructure Platform Grouping
metadata:
  established: 2024-03
  cognitive_load: medium
dependencies:
- Observability Platform Team
- API Gateway Platform Team
- CI/CD Platform Team
- Developer Portal Team
- Security Compliance Team
interactions:
- team_id: Observability Platform Team
  interaction_mode: x-as-a-service
- team_id: API Gateway Platform Team
  interaction_mode: x-as-a-service
- team_id: CI/CD Platform Team
  interaction_mode: x-as-a-service
- team_id: Developer Portal Team
  interaction_mode: x-as-a-service
- team_id: Security Compliance Team
  interaction_mode: x-as-a-service
---

# Cloud Development Platform Team

> **Note**: This team uses the **Extended Team API Template** to showcase comprehensive platform product thinking.

## Team name and focus

**Cloud Development Platform Team** - Provides AWS-based infrastructure and developer experience as a compelling internal product, enabling LogiCore Systems engineering teams to deploy production services in under 30 minutes without manual approval tickets.

## Team type

platform

## Part of a platform grouping?

Yes - Cloud Infrastructure Platform Grouping (works alongside Observability, CI/CD, API Gateway, Portal, Feature Management teams)

## Code & Artifacts
_[Extended]_

### Runtime Endpoints
- **Developer Portal**: https://developer-portal.company-internal/cloud-resources (Backstage-based)
- **Cost Management API**: https://api.company-internal/cost-insights/v1 (REST API for cost tracking)

### Libraries & Modules
- **Terraform Modules**: https://github.company.com/platform/aws-terraform-modules
  - `terraform-aws-ecs-service` - Standard ECS service with ALB
  - `terraform-aws-lambda-api` - Serverless API Gateway + Lambda
  - `terraform-aws-rds` - RDS database with backup/monitoring
  - 25+ additional modules (S3, SQS, SNS, DynamoDB, etc.)
- **AWS CDK Constructs**: https://github.company.com/platform/aws-cdk-constructs (TypeScript)

### UI/Tools
- **Backstage Portal** - Self-service AWS resource provisioning
- **Cost Explorer Dashboard** - Real-time AWS cost tracking by team/service
- **AWS Landing Zone** - Multi-account setup with AWS Control Tower

## Services provided (if applicable)

- **Self-Service AWS Resources**: Provision ECS clusters, Lambda functions, RDS databases, S3 buckets via portal or Terraform modules
- **AWS Account Management**: Multi-account setup (dev, staging, prod), AWS Organizations, SSO integration
- **Infrastructure-as-Code Templates**: 25+ Terraform modules for common AWS patterns
- **Cost Optimization Service**: Automated FinOps recommendations, budget alerts, cost attribution by team
- **Compliance Guardrails**: AWS Config rules, Security Hub, automated compliance checks
- **Developer Experience Tools**: Cloud9 environments, SSM Session Manager access, AWS CLI helpers

## Service-level expectations (SLA)

- **Portal uptime**: 99.5% (developer portal and self-service APIs)
- **Resource provisioning**: <30 minutes from request to usable (via Terraform modules)
- **Support response**:
  - Slack questions: <2 hours during business hours (Mon-Fri 8am-6pm UTC)
  - Infrastructure incidents (P0/P1): <15 minutes response (24/7 on-call)
  - Feature requests: Acknowledged within 1 business day, triaged weekly
- **Onboarding**: New team gets AWS account + basic resources in <1 hour (automated via portal)
- **Cost reports**: Daily cost updates by 9am UTC, monthly detailed reports

## Software owned and evolved by this team

- **AWS Terraform Modules** (https://github.company.com/platform/aws-terraform-modules) - 25+ reusable modules with tests
- **Developer Portal** (https://github.company.com/platform/developer-portal) - Backstage app with AWS integration
- **Cost Optimization Engine** (https://github.company.com/platform/cost-optimizer) - Python service analyzing AWS costs
- **AWS Landing Zone** (https://github.company.com/platform/aws-landing-zone) - Terraform for AWS Control Tower setup

## Versioning approaches

- **Terraform Modules**: Semantic versioning with Git tags (e.g., `v2.1.0`), pin to major version in consuming code
- **Breaking changes**: Announce 1 month in advance via #platform-cloud-dev, provide migration guides, support old version for 6 months
- **AWS Landing Zone**: Quarterly updates aligned with AWS Control Tower releases, tested in dev account first
- **Portal**: Follow Backstage release cycle, upgrade monthly with 1-week testing period

## Testing Approach
_[Extended]_

- **Terraform modules**: 100% test coverage with Terratest (Go), automated tests on every PR
- **Integration testing**: Weekly tests of full module stack in dedicated test AWS account
- **Cost validation**: Every module tested for cost efficiency before release
- **Security scanning**: Checkov scans all Terraform code for security/compliance issues
- **Portal**: Unit tests (Jest), E2E tests (Playwright) for critical user flows

## Wiki and documentation

- **Cloud Platform Docs**: https://docs.company-internal/platforms/cloud-dev - Main documentation
- **Quickstart (5 minutes)**: https://docs.company-internal/platforms/cloud-dev/quickstart - Deploy first service
- **Terraform Module Catalog**: https://modules.company-internal/aws - Browse all 25+ modules with examples
- **Cost Optimization Guide**: https://docs.company-internal/platforms/cloud-dev/finops - Best practices for cost savings
- **Runbooks**: https://runbooks.company-internal/cloud-platform - Incident response procedures

## Glossary and terms ubiquitous language

- **Golden Path**: Recommended way to deploy each service type (ECS microservice, Lambda API, etc.)
- **Self-Service**: Teams provision resources themselves via portal/Terraform (no manual tickets)
- **FinOps**: Financial operations - cost optimization, budget management, cost attribution
- **AWS Landing Zone**: Multi-account AWS setup with governance, security, networking
- **Thinnest Viable Platform (TVP)**: We provide just enough AWS abstractions without overwhelming teams

## Practices & Principles
_[Extended]_

- **"Paved Road" approach**: Make the easy path the right path (secure, compliant, cost-effective by default)
- **Self-service first**: 90% of requests should be automated (no human in the loop)
- **Platform as a Product**: Treat internal teams as customers, measure NPS, gather feedback
- **Cost transparency**: Every team sees their AWS spend in real-time (no surprises)
- **Security by default**: Compliance guardrails baked into modules (not bolted on later)
- **Iterate based on feedback**: Monthly customer feedback sessions with 5-6 rotating teams

## Communication Preferences
_[Extended]_

### Primary Channels
- **Slack**: #platform-cloud-dev (questions, support, announcements)
- **Slack**: #platform-cloud-incidents (P0/P1 infrastructure issues, monitored 24/7)
- **Slack**: #platform-cloud-feedback (feature requests, improvement suggestions)

### Meetings & Office Hours
- **Tuesday 10am-11am UTC**: Open office hours (drop-in for any questions via Zoom)
- **Thursday 3pm-4pm UTC**: "Ask Me Anything" session for complex AWS architecture questions

### Async Communication
- **Response time**: Slack questions <2 hours during business hours (8am-6pm UTC Mon-Fri)
- **Incident response**: <15 minutes for P0/P1 (24/7 on-call rotation)
- **GitHub PRs**: Terraform module PRs reviewed within 1 business day

### Documentation
- **Everything documented**: All decisions, patterns, and runbooks written down
- **"Write it down first"**: Create docs before announcing new features
- **Living documentation**: Docs updated within 1 week of changes

## Daily sync time

9:30 AM UTC daily standup (15 minutes, team-only)

**Team availability**: Core hours 10am-4pm UTC Monday-Friday, flexible for global LogiCore offices (Americas, Europe, APAC)

## Roadmap & Current Priorities
_[Extended]_

### Currently working on (Q1 2026)

**High Priority:**
- **Multi-Region Support** - Enable deploying services to US-East-1, EU-West-1, AP-Southeast-1 (currently US-only)
- **Spot Instance Optimization** - Automated Spot/On-Demand mixing for cost savings (target: 30% cost reduction)
- **Kubernetes EKS Expansion** - Expand from 20% to 60% of services on EKS (vs ECS)

**Medium Priority:**
- **Serverless Framework Integration** - Better support for AWS SAM/Serverless Framework alongside Terraform
- **Cost Anomaly Detection** - ML-based alerting for unusual spend patterns (before bills arrive)
- **Developer Portal v2** - Redesign UX based on 8 months of feedback

### Medium-term roadmap (Q2-Q3 2026)

- **FinOps Dashboard Expansion** - Add carbon footprint tracking (AWS Sustainability Dashboard)
- **Infrastructure Drift Detection** - Alert when manual AWS console changes differ from Terraform state
- **CI/CD Integration Deepening** - Tighter integration with CI/CD Platform for infrastructure changes
- **Disaster Recovery Automation** - One-click regional failover for critical services

### Long-term vision (2026+)

- **Multi-Cloud Support** - Add Azure/GCP modules (some customers require multi-cloud)
- **AI-Assisted Infrastructure** - Copilot for infrastructure ("create a high-availability API service")
- **Platform-of-Platforms** - Help other platform teams build on our foundation (e.g., Data Platform on our S3/EMR modules)

## What we're currently working on

See "Roadmap & Current Priorities" above for Q1 2026 focus areas.

**This week's sprint** (Jan 3-12, 2026):
- Complete multi-region Terraform module testing in dev account
- Ship Spot Instance optimization for ECS services (beta release)
- Onboard 2 new teams (E-commerce Product Discovery, Enterprise Sales Portal)
- Cost optimization review with 3 high-spend teams

## Teams we currently interact with

| Team Name | Interaction Mode | Purpose | Duration |
|-----------|------------------|---------|----------|
| Observability Platform Team | X-as-a-Service | They run on our AWS infrastructure, use our Kubernetes clusters | Ongoing |
| API Gateway Platform Team | X-as-a-Service | Deploy API Gateway on our AWS accounts | Ongoing |
| CI/CD Platform Team | X-as-a-Service | Pipelines deploy to our AWS infrastructure | Ongoing |
| Developer Portal Team | X-as-a-Service | Portal runs on our ECS clusters, integrates our cost APIs | Ongoing |
| Security Compliance Team | X-as-a-Service | AWS guardrails and compliance automation | Ongoing |

## Teams we expect to interact with soon

| Team Name | Interaction Mode | Purpose | Expected Duration |
|-----------|------------------|---------|-------------------|
| Data Engineering Enablement Team | Collaboration | Build S3 Data Lake modules, EMR/Athena patterns | 8 weeks |
| Machine Learning & AI Specialists Team | Collaboration | SageMaker infrastructure patterns, model hosting | 6 weeks |
| Driver Experience Team | X-as-a-Service | Backend AWS resources for mobile APIs | Ongoing |

## Platform Product Metrics
_[Extended]_

### Customer Satisfaction
- **NPS Score**: 8.2/10 (measured quarterly via internal surveys to stream-aligned teams)
- **Target**: Maintain >8.0 (internal platform benchmark at LogiCore)
- **Trend**: Improved from 7.1 in Q2 2024 to 8.2 in Q4 2025 (steady growth)

### Adoption & Usage
- **Platform adoption**: 85% of engineering teams (34 out of 40 teams)
  - **Not using us**: 6 teams (5 legacy teams on old datacenter, 1 team experimenting with Azure)
- **Self-service rate**: 90% of resource requests handled without manual intervention
- **Target adoption**: 95% by Q3 2026 (migrate remaining 5 legacy teams)
- **Active users**: 170 developers using portal monthly (out of 200 total engineers)

### Performance & Reliability
- **Time-to-first-deployment**: 4 hours average (from new team onboarding to first production deployment)
  - **Best**: 45 minutes (experienced team using standard microservice module)
  - **Worst**: 12 hours (complex multi-region data pipeline)
  - **Target**: <2 hours by Q2 2026
- **Platform uptime**: 99.7% (developer portal + cost APIs + Terraform module hosting)
- **Target**: 99.9% uptime

### Efficiency Metrics
- **AWS cost reduction**: 23% year-over-year through FinOps recommendations
  - **Rightsizing instances**: 12% savings
  - **Reserved Instance optimization**: 8% savings
  - **S3 lifecycle policies**: 3% savings
- **Module reuse**: 67% of teams use ≥5 standard modules (vs custom Terraform from scratch)
- **Target cost reduction**: 30% YoY by Q4 2026

### Support Load
- **Median response time**: 1.2 hours for Slack questions (during business hours)
- **Escalation rate**: 8% (92% of issues resolved by our team without involving AWS support or other teams)
- **Ticket volume**: 45 Slack questions per week (down from 80 in Q2 2024 - better docs + self-service)

## Customer Problems We Solve
_[Extended]_

### Primary Problem

**"Getting production infrastructure takes weeks of manual approvals, tickets, and back-and-forth with platform teams. We can't move fast enough to meet customer demands in the competitive logistics software market. Our competitors ship features 3x faster than us."**

This was the state at LogiCore Systems in early 2024 before this platform team was formed.

### How We Solve It

- **Self-service AWS resources**: Terraform modules + Backstage portal = provision ECS clusters, RDS databases, S3 buckets in <30 minutes (down from 10 days)
- **Pre-approved patterns**: Common patterns (microservice on ECS, serverless API, data lake S3 setup) are security-approved by default (no manual reviews)
- **Cost transparency**: Real-time cost dashboards prevent surprise bills, teams own their AWS budgets (CFO no longer blocks AWS spend due to lack of visibility)
- **Guardrails, not gates**: AWS Config rules prevent misconfigurations automatically (no manual approval tickets needed)

**Result**: Reduced infrastructure provisioning from 10 days to 4 hours average. Teams now deploy 18x per week (up from 3x per week in early 2024). LogiCore's logistics platform releases new features weekly instead of quarterly.

### Secondary Problems

1. **"Cloud costs spiraling out of control - we got a $45K surprise AWS bill last quarter"**
   - **Solution**: Automated FinOps recommendations, budget alerts at 80% threshold, cost attribution by team/service
   - **Result**: 23% cost reduction YoY, zero surprise bills (teams see costs in real-time)

2. **"Every team builds AWS infrastructure differently - it's chaos to maintain"**
   - **Solution**: Standardized Terraform modules, 67% module reuse across teams
   - **Result**: Consistent patterns, easier debugging, knowledge sharing across teams

3. **"AWS complexity overwhelming developers - too many services, options, settings"**
   - **Solution**: Simplified abstractions (e.g., "create microservice" = ECS + ALB + RDS in one module with sensible defaults)
   - **Result**: Developers provision production-grade infrastructure without AWS expertise

4. **"Security compliance is manual and slow - takes weeks to pass security review"**
   - **Solution**: Automated compliance checks (AWS Security Hub, Config), baked into templates
   - **Result**: 90% of services pass security review automatically (no manual process)

## Team Members
_[Extended]_

- **Product Manager**: Jordan Lee (platform product strategy, roadmap prioritization, customer feedback)
- **Tech Lead**: Sarah Mitchell (AWS architecture, Terraform design, technical decisions)
- **Senior Platform Engineer**: Marcus Chen (IaC modules, AWS Landing Zone, multi-account setup)
- **Platform Engineer**: Emily Rodriguez (developer portal, Backstage plugins, self-service UI)
- **Platform Engineer**: Alex Thompson (cost optimization, FinOps automation, AWS Cost Explorer API)
- **Senior SRE**: David Kim (platform reliability, 24/7 on-call, incident response, runbooks)
- **SRE**: Rachel Patel (monitoring, alerting, SLO tracking, AWS service health)
- **Full-Stack Developer**: James Wilson (developer portal UI/UX, self-service workflows, React frontend)

**Team formation**: This team was established in March 2024 as part of LogiCore Systems' Team Topologies transformation. Previously, AWS infrastructure was managed by a centralized "Cloud Ops" team (15 people, ticket-based, 2-week lead times). The transformation to a self-service platform team reduced time-to-infrastructure from 10 days to 4 hours and improved developer satisfaction (NPS) from 4.2 to 8.2.

**Platform Philosophy**: We believe infrastructure should be invisible to developers - provision in <30 minutes, scales automatically, costs are predictable, security is default. Our measure of success is how rarely teams need to talk to us.
