---
team_id: devops-and-infrastructure-team
name: DevOps & Infrastructure Team
team_type: platform-team
position:
  x: 595.0
  y: 410.0
metadata:
  size: 4
  department: Engineering
  line_manager: Robert Miller
  established: 2018-09
  cognitive_load: high
---

# DevOps & Infrastructure Team

Manages CI/CD pipelines, AWS infrastructure, and deployment processes for LogiCore's logistics platform.

## Responsibilities

**CI/CD Pipelines**:
- Jenkins pipeline development and maintenance
- Build automation for backend (Node.js/Python), web (React), mobile (iOS/Android)
- Automated testing integration
- Release automation and deployment scripts
- Artifact repository management

**Infrastructure Management**:
- AWS infrastructure provisioning (EC2, RDS, S3, CloudFront)
- Kubernetes cluster management (production and staging)
- Monitoring and alerting (Prometheus, Grafana, PagerDuty)
- Log aggregation (ELK stack)
- SSL certificate management and renewal

**Deployment Coordination**:
- Production deployment execution (manual, scheduled releases)
- Environment management (dev, staging, QA, pre-prod, prod)
- Database migration execution (coordinated with Database Team)
- Rollback procedures and incident response

## Technologies
- **CI/CD**: Jenkins, GitHub Actions, Bash scripting
- **Cloud**: AWS (EC2, RDS, S3, CloudFront, ELB, Route53)
- **Containers**: Docker, Kubernetes (EKS)
- **IaC**: Terraform, Ansible
- **Monitoring**: Prometheus, Grafana, ELK, PagerDuty
- **Version Control**: Git, GitHub

## Team Structure
- 1 DevOps Lead
- 2 DevOps Engineers (AWS, Kubernetes)
- 1 Build Engineer (CI/CD pipelines)

## Current Challenges (Pre-TT Dysfunction)

**Deployment Bottleneck Anti-Pattern**:
- ALL production deployments go through DevOps Team (manual, ticket-based)
- Scheduled release windows: Tuesday/Thursday only, 6-8pm (off-hours)
- Deployment request via Jira ticket (3-5 day lead time)
- Development teams cannot deploy independently - must wait for DevOps
- Only 2 DevOps engineers qualified to deploy - single person can delay entire release

**Reactive Support Not Self-Service**:
- Teams cannot provision their own infrastructure (must request via Jira)
- No self-service CI/CD - DevOps must create and maintain ALL pipelines
- Infrastructure changes (scaling, new services) require DevOps ticket (1-2 weeks)
- Developers don't have AWS console access (security policy)
- Cannot debug production issues - only DevOps has access to logs and metrics

**Cognitive Overload**:
- Responsible for infrastructure of ALL teams (Backend, Web, Mobile, Route Optimization)
- Must understand deployment requirements for every tech stack (Node.js, Python, React, Swift, Kotlin)
- On-call rotation burned out (3-5 incidents per week, many false alarms)
- Too many manual processes - automation backlog of 20+ items

**Coordination Overhead**:
- Weekly "Release Planning" meeting with all dev teams (2 hours)
- Daily "Deployment Requests" triage (30 minutes)
- Monthly "Infrastructure Review" to discuss resource needs (90 minutes)
- Constant interruptions: "Can you deploy this?" "Why is staging down?" "I need prod access"

**Unclear Boundaries**:
- Some teams have their own deployment scripts (inconsistent, undocumented)
- Mobile App Team deploys to App Store themselves (but backend must be deployed by DevOps first)
- Route Optimization Team has Docker containers but DevOps must deploy them
- Confusion over who owns monitoring dashboards (DevOps or development teams)

## Services Provided (Ticket-Based)
- Production deployments (3-5 day lead time, Tuesday/Thursday only)
- Infrastructure provisioning (1-2 weeks)
- CI/CD pipeline creation (1 week)
- Production access requests (requires approval, 2-3 days)
- Incident response and rollback (emergency only)

## Deployment Metrics
- Deployment frequency: 2-3 per week (scheduled windows only)
- Lead time for deployment: 3-5 days (from request to production)
- Change failure rate: ~20% (rollbacks common due to untested changes)
- Mean time to recovery (MTTR): 2-4 hours (depends on DevOps availability)

## Infrastructure Challenges
- AWS costs growing 15% per month (no cost optimization)
- Kubernetes cluster complexity (only 2 people understand it)
- Prod vs staging environment drift (different configurations)
- Monitoring alert fatigue (too many false positives)

## Transformation Opportunities

**In TT-Design, evolve toward enabling platform team**:
- Provide self-service deployment platform (teams deploy themselves)
- Infrastructure-as-code templates for common patterns
- Automated CI/CD pipeline generation
- Observability platform (logs, metrics, traces) with team-owned dashboards
- Enable development teams to own their deployments end-to-end
- DevOps provides platform, tooling, and expertise (enabling role)
- Stream-aligned teams responsible for their own deployment and uptime