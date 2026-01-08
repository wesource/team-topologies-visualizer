---
# Minimal YAML front matter - only what the visualization tool needs
# Everything else is in the markdown body for human readability
name: [Your Team Name]
team_type: [stream-aligned | platform | enabling | complicated-subsystem | undefined]
position:
  x: 100
  y: 100
metadata:
  size: 7  # Number of people on the team (5-9 recommended)
  cognitive_load: medium  # low | medium | high | very-high
  established: 2024-01  # YYYY-MM format - shows team age/maturity in modal
  flow_metrics:  # Optional: DORA metrics for team performance
    lead_time_days: 10  # Median days from commit to production
    deployment_frequency: weekly  # daily | weekly | monthly | quarterly
    change_fail_rate: 0.10  # 0.0 to 1.0 (e.g., 0.10 = 10%)
    mttr_hours: 3  # Mean time to recovery in hours
value_stream: [Value Stream Name]  # Optional: Grouping by value stream
platform_grouping: [Platform Grouping Name]  # Optional: Grouping by platform or capability area
---

# [Your Team Name]

> **Template Type**: Extended Team API Template
>
> **Base**: Follows the official [Team Topologies Team API Template](https://github.com/TeamTopologies/Team-API-template) (CC BY-SA 4.0)
>
> **Extensions**: Includes additional fields from Team Topologies book (2nd edition, 2025) and presentation materials. Extended sections are marked with _[Extended]_.
>
> **Instructions**: Replace all `[bracketed placeholders]` with your team's information. Delete this instruction block when done.

## Team name and focus

[Your Team Name] - [One-sentence description of your team's mission and primary focus area, capturing the team's purpose]

**Examples:**
- "Identity Management API Team - Provides secure authentication and authorization services for all product teams"
- "E-commerce Checkout Team - Owns the complete checkout flow from cart to payment confirmation"
- "DevOps Enablement Team - Helps stream-aligned teams adopt cloud-native practices and CI/CD pipelines"

## Team type

[stream-aligned | platform | enabling | complicated-subsystem | undefined]

**Guidelines:**
- **stream-aligned**: Aligned to a flow of work from a segment of the business domain (e.g., checkout, search, mobile app)
- **platform**: Provides internal services to reduce cognitive load (e.g., deployment platform, API gateway, data platform)
- **enabling**: Helps other teams overcome obstacles and adopt new technologies (e.g., DevOps enablement, architecture coaching)
- **complicated-subsystem**: Handles complex technical domains requiring specialist knowledge (e.g., ML algorithms, video processing)
- **undefined**: Team in transition or not yet assigned a type

## Part of a platform grouping?

[Yes - [Platform Grouping Name] | No]

**Note**: Only relevant for platform teams. Platform groupings are collections of related platform teams (e.g., "Data Platform Grouping", "Cloud Infrastructure Grouping")

## Code & Artifacts
_[Extended: Not part of official Team API template, but useful for clarity about team outputs]_

[Describe the runtime endpoints, libraries, clients, UI, and other code artifacts your team produces]

**Examples:**
- **Runtime endpoints**: 
  - Production: https://api.company.com/identity
  - Staging: https://api-staging.company.com/identity
- **Libraries**: 
  - `@company/identity-client` (npm) - JavaScript client library
  - `company-identity-sdk` (Python) - Python SDK
- **UI Components**: 
  - Identity Admin Dashboard at https://identity-admin.company.com
  - Login Widget embedded in all product UIs
- **CLI Tools**:
  - `company-auth` CLI for token management

## Services provided (if applicable)

[List the key services, APIs, or capabilities your team provides to other teams]

**Examples:**
- Authentication API (OAuth2, SAML, LDAP integration)
- User profile management service
- Session management and SSO
- API keys and service account management
- Multi-factor authentication (MFA)

## Service-level expectations (SLA)

[Describe uptime commitments, response time expectations, support hours, and how you handle requests]

**Examples:**
- "99.9% uptime for production APIs, < 100ms p95 latency"
- "Support requests: Critical (1 hour), High (4 hours), Normal (1 business day)"
- "New team onboarding completed within 1 week of request"
- "Pull request reviews within 1 business day"

## Software owned and evolved by this team

[List the main software systems, services, or codebases your team owns]

**Examples:**
- Identity Service (Node.js microservice)
- Auth Gateway (Kong API Gateway configuration)
- User Profile Database (PostgreSQL)
- Admin Dashboard (React SPA)
- Identity Client Libraries (TypeScript, Python, Go)

## Versioning approaches

[Describe how you version your APIs, libraries, and services. How do you communicate breaking changes?]

**Examples:**
- "Semantic versioning (SemVer) for all APIs and libraries as a 'team promise' not to break dependents"
- "API v2 supported for 6 months after v3 release"
- "Breaking changes announced 1 month in advance via #api-announcements channel"
- "Deprecation policy: 90-day notice with migration guide"

## Testing Approach
_[Extended: Not part of official Team API template, but useful for understanding team quality standards]_

[Describe how your team tests code and services, and what quality standards you maintain]

**Examples:**
- **Unit tests**: Required for all business logic (80%+ coverage)
- **Integration tests**: All API endpoints covered with contract tests
- **Load testing**: Before major releases (1000 req/s baseline)
- **Security testing**: Monthly penetration tests and automated vulnerability scans
- **Deployment strategy**: Blue-green deployments with automatic rollback
- **Testing environments**: Dev, staging (production mirror), production
- **Quality gates**: All tests pass + security scan + performance benchmarks before production

## Wiki and documentation

[Provide links to your team's documentation, how-to guides, runbooks, and knowledge base]

**Examples:**
- [Team Wiki](https://wiki.company.com/teams/identity)
- [API Documentation](https://docs.company.com/identity-api)
- [Getting Started Guide](https://wiki.company.com/identity/getting-started)
- [Integration Examples](https://wiki.company.com/identity/examples)
- [Troubleshooting Runbook](https://wiki.company.com/identity/troubleshooting)
- [Architecture Decision Records](https://wiki.company.com/identity/adr)

## Glossary and terms ubiquitous language

[Define key terms, concepts, and domain language your team uses that others need to understand]

**Examples:**
- **Principal**: A user or service account that can be authenticated
- **Claim**: An assertion about a principal (e.g., email, role, permissions)
- **Token lifetime**: How long an access token remains valid (default: 1 hour)
- **Service-to-service auth**: Authentication between backend services using mTLS
- **SSO**: Single Sign-On - users authenticate once and access multiple services

## Practices & Principles
_[Extended: Not part of official Team API template, but helps clarify team working practices]_

[Describe your team's working practices and technical principles that affect how other teams interact with you]

**Examples:**
- **Infrastructure as Code**: All infrastructure managed via Terraform in git
- **"You build it, you run it"**: Team owns production operations 24/7
- **Blameless postmortems**: All incidents followed by learning-focused retrospectives
- **Tech debt budget**: 20% of capacity dedicated to technical improvements
- **API-first design**: All features exposed via API before UI implementation
- **Documentation-driven development**: API docs written before code
- **Open source friendly**: Internal tools open-sourced when possible
- **Weekly demos**: Fridays at 3pm - showcase new features to interested teams

## Communication Preferences
_[Extended: Not part of official Team API template, but important for effective team collaboration]_

[Detailed communication preferences including async/sync balance, response times, and collaboration expectations]

**Examples:**
- **Chat (primary)**: 
  - #identity-team (team questions and updates)
  - #identity-support (user issues and troubleshooting)
  - #identity-announcements (breaking changes and releases)
- **Email**: identity-team@company.com (formal requests, security issues)
- **Video**: 
  - Zoom for pairing sessions and complex troubleshooting
  - Prefer async for simple questions and updates
- **Office hours**: 
  - Wednesdays 2-3pm EST - drop-in for any questions (no appointment needed)
  - Fridays 3-4pm EST - live demos and Q&A
- **Pull request expectations**: 
  - Review within 1 business day
  - Feedback-friendly - suggestions welcome from any team
  - Required: Tests, documentation, and changelog entry
- **Response time expectations**:
  - Chat: Best effort during business hours (9am-5pm EST)
  - Email: Within 1 business day
  - Urgent/outage: Page on-call engineer via PagerDuty
- **Async-first**: Written updates preferred over meetings

## Daily sync time

[When does your team have standups or daily syncs? When are you generally available?]

**Examples:**
- "9:30 AM EST daily standup (15 minutes, zoom link: [link])"
- "Async standup in #identity-team at 9am EST (no meeting)"
- "Team core hours: 10am-4pm EST (flexible lunch)"
- "Remote-friendly: No expectation of immediate responses outside core hours"

## Roadmap & Current Priorities
_[Extended: Not part of official Team API template, but helps with team transparency and planning]_

### Currently working on (Q1 2026)

[List your current quarter priorities - what the team is actively building or improving]

**Examples:**
- **OAuth2 support for mobile apps** (high priority, shipping Feb 2026)
  - Mobile-specific token refresh flows
  - Biometric authentication support
- **Multi-factor authentication (MFA) rollout** (high priority, ongoing)
  - SMS, TOTP, and hardware key support
  - Admin tools for MFA enforcement policies
- **Identity API v3 migration** (medium priority, Q1-Q2)
  - GraphQL support alongside REST
  - Improved error responses
- **Documentation improvements** (ongoing, 10% of capacity)
  - Interactive API playground
  - More code examples in Python and Go

### Medium-term roadmap (Q2-Q3 2026)

[What's coming next? Help other teams plan their own work]

**Examples:**
- **Passwordless authentication** (Q2) - WebAuthn support for web and mobile
- **Advanced audit logging** (Q2) - Compliance requirements for SOC2
- **Identity federation** (Q3) - Connect external identity providers (Google, Microsoft)
- **Performance optimization** (Q3) - Target < 50ms p95 latency

### Long-term vision (2026+)

[Optional: Where is the team headed? What big changes are on the horizon?]

**Examples:**
- Zero-trust architecture migration
- Self-service identity management for external partners
- AI-powered fraud detection in authentication

## What we're currently working on

[Alternative to Roadmap section above - use if you prefer simpler format]

**Example:**
- **Q1 2026 Priorities**:
  - OAuth2 support for mobile apps (high priority)
  - Multi-factor authentication (MFA) rollout (high priority)
  - Identity API v3 migration (medium priority)
  - Documentation improvements (ongoing)

## Teams we currently interact with

| Team Name | Interaction Mode | Purpose | Duration |
|-----------|------------------|---------|----------|
| [Team Name] | [Collaboration \| X-as-a-Service \| Facilitating] | [Why you're interacting] | [Ongoing \| X months] |

**Example:**
| Team Name | Interaction Mode | Purpose | Duration |
|-----------|------------------|---------|----------|
| E-commerce Checkout | X-as-a-Service | Provide authentication for checkout flow | Ongoing |
| Mobile App Team | Collaboration | Build mobile-specific auth features (OAuth2, biometrics) | 3 months |
| DevOps Enablement | Facilitating | Learn Kubernetes deployment patterns and observability | 2 months |
| Security & Compliance | Collaboration | Add audit logging and SOC2 compliance features | Ongoing |

**Interaction Mode Guidelines:**
- **Collaboration**: Working closely together with high interaction and joint responsibility (should be temporary)
- **X-as-a-Service**: One team consumes services from another with minimal collaboration (stable, ongoing)
- **Facilitating**: One team helps another adopt practices or technologies (always temporary)

## Teams we expect to interact with soon

| Team Name | Interaction Mode | Purpose | Expected Duration |
|-----------|------------------|---------|-------------------|
| [Team Name] | [Collaboration \| X-as-a-Service \| Facilitating] | [Why you expect to interact] | [Ongoing \| X months] |

**Example:**
| Team Name | Interaction Mode | Purpose | Expected Duration |
|-----------|------------------|---------|-------------------|
| Enterprise Sales Portal | X-as-a-Service | New consumer of identity APIs for B2B customers | Ongoing |
| Data Platform Team | Collaboration | Add identity data to analytics warehouse | 2 months |
| External Partners Integration | Facilitating | Help integrate third-party identity providers | 3 months |

## Platform Product Metrics
_[Extended: Not part of github team api template, but inspired by "Platform as a Product" thinking from Team Topologies]_

**Note**: Especially relevant for platform teams. Skip this section if you're a stream-aligned team without internal customers.

[Describe how you measure the success of your platform as an internal product. Focus on customer satisfaction, adoption, performance, and efficiency metrics.]

**Guidelines:**
- **Customer Satisfaction**: NPS scores, satisfaction surveys, feedback sessions
- **Adoption & Usage**: % of teams using the platform, active users, feature adoption rates
- **Performance & Reliability**: Time-to-value, platform uptime, SLA adherence
- **Self-Service Rate**: % of requests handled without manual intervention
- **Support Load**: Response times, escalation rates, ticket volume trends

**Example for a Platform Team:**

### Customer Satisfaction
- **NPS Score**: 8.2/10 (measured quarterly via internal surveys)
- **Target**: Maintain >8.0 (internal platform benchmark)

### Adoption & Usage
- **Platform adoption**: 85% of engineering teams (34 out of 40 teams)
- **Self-service rate**: 90% of requests handled without manual intervention
- **Target adoption**: 95% by Q3 2026

### Performance & Reliability
- **Time-to-first-deployment**: 4 hours average (from new team onboarding to first prod deployment)
- **Platform uptime**: 99.7% (across all platform APIs)
- **Target**: 99.9% uptime, <2 hour time-to-deployment

### Efficiency Metrics
- **Cost savings**: 23% reduction in infrastructure costs year-over-year through automation
- **Developer velocity**: Teams using platform deploy 3x more frequently than before
- **Support efficiency**: Median response time 1.2 hours, 92% resolved without escalation

## Customer Problems We Solve
_[Extended: Not part of github team api template, but valuable for "Platform as a Product" and customer empathy]_

**Note**: Especially powerful for platform teams to articulate value. Can also be used by stream-aligned teams to clarify their business value.

[Describe the specific problems your team solves for your customers (internal teams or external users). Focus on pain points and how your services address them.]

### Primary Problem
[Describe the main problem in the customer's words, not technical jargon]

**Example:**
"Deploying a new microservice to production takes 2 weeks of manual infrastructure setup, security reviews, and configuration. We can't iterate fast enough to compete in the market."

### How We Solve It
[Describe your solution and the impact]

**Example:**
- **Self-service infrastructure**: Terraform modules + portal = provision resources in <30 minutes
- **Pre-approved patterns**: Common patterns (web service, worker, API) are security-approved by default
- **Automated compliance**: Security checks baked into templates, no manual reviews needed
- **Cost transparency**: Real-time cost dashboards prevent surprise bills

**Result**: Reduced infrastructure provisioning from 10 days to 4 hours, teams deploy 5x more frequently.

### Secondary Problems
[List 2-4 additional problems you solve]

**Examples:**
- **Cloud costs out of control** → Automated cost optimization recommendations, budget alerts
- **Inconsistent infrastructure** → Standardized modules, 80% reuse across teams
- **Security vulnerabilities** → Automated scanning, patch management, compliance guardrails

## Team Members
_[Extended: Optional section for transparency and contact routing]_

[List team members with roles. Helps other teams know who to contact for specific topics.]

**Format suggestion**: Keep it simple, update quarterly or when members change.

**Example:**
- **Product Manager**: Jordan Lee (platform strategy, roadmap prioritization)
- **Tech Lead**: Sarah Mitchell (architecture, technical decisions, escalations)
- **Senior Engineer**: Marcus Chen (infrastructure-as-code, AWS expertise)
- **Engineer**: Emily Rodriguez (developer portal, self-service UI)
- **SRE**: David Kim (reliability, on-call, incident response)
- **Technical Writer**: Rachel Patel (documentation, runbooks, tutorials)

**Note**: Consider omitting this section if your team prefers not to single out individuals. Alternative: "Our team of 6 engineers rotates on-call and responds collectively to #identity-team channel."

---

## How to Use This Extended Template

1. **Choose template type**: Use this extended template if your team has complex interfaces, is a platform team, or wants maximum clarity. Use the base template for simpler cases.
2. **Copy this file** to `data/tt-teams/[your-team-name].md`
3. **Update the YAML front matter** (name, team_type, position, metadata)
4. **Fill in each section** with your team's information
   - Core sections (from GitHub template): Required for all teams
   - Extended sections: Optional but recommended for platform teams
5. **Delete placeholder text** and examples
6. **Review and publish** - make sure other teams can find this!
7. **Keep it updated** - treat this as a living document, not a one-time exercise

## Tips for Writing a Great Extended Team API

- **Be specific**: "Support requests answered within 4 hours" beats "We respond quickly"
- **Show evolution**: Update roadmap section quarterly to keep teams informed
- **Make practices visible**: Other teams should understand how you work to collaborate effectively
- **Link generously**: Every tool, doc, and system should have a clickable link
- **Test usability**: Ask a team unfamiliar with your services to read this - is everything clear?
- **Balance detail with readability**: Extended ≠ bloated. Every section should add value.
- **Use extended sections wisely**: Don't fill them out just because they exist - only if they help other teams

## Extended vs Base Template: When to Use Which?

**Use Extended Template when:**
- Your team is a platform team serving many consumers
- You have complex SLAs, testing approaches, or deployment processes
- Other teams frequently ask about your practices and principles
- You want to reduce ambiguity and repetitive questions
- Your team has a product mindset (roadmap, user feedback, adoption metrics)

**Use Base Template when:**
- Your team is just starting with Team APIs
- You have a simple, focused interface
- You're a stream-aligned team with few dependencies
- You want to start minimal and expand later

**Remember**: You can start with the base template and evolve to extended as your team matures!

## License

This template extends the [Team Topologies Team API Template](https://github.com/TeamTopologies/Team-API-template) and is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

Extended sections are based on Team Topologies book (2nd edition, 2025, chapters on Team APIs) and presentation materials.
