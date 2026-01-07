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
  established: 2024-01  # YYYY-MM format (when team was formed)
  flow_metrics:  # Optional: DORA metrics for team performance
    lead_time_days: 10  # Median days from commit to production
    deployment_frequency: weekly  # daily | weekly | monthly | quarterly
    change_fail_rate: 0.10  # 0.0 to 1.0 (e.g., 0.10 = 10%)
    mttr_hours: 3  # Mean time to recovery in hours
value_stream: [Value Stream Name]  # Optional: Grouping by value stream
platform_grouping: [Platform Grouping Name]  # Optional: Grouping by platform or capability area
---

# [Your Team Name]

> **Template Source**: This template follows the official [Team Topologies Team API Template](https://github.com/TeamTopologies/Team-API-template) (CC BY-SA 4.0)
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

## Services provided (if applicable)

[List the key services, APIs, or capabilities your team provides to other teams]

**Examples:**
- Authentication API (OAuth2, SAML)
- User profile management service
- CI/CD pipeline templates
- Coaching on Kubernetes best practices

## Service-level expectations (SLA)

[Describe uptime commitments, response time expectations, support hours, and how you handle requests]

**Examples:**
- "99.9% uptime for production APIs, < 100ms p95 latency"
- "Support requests answered within 4 business hours during 9am-5pm EST"
- "New team onboarding completed within 1 week of request"
- "Pull request reviews within 1 business day"

## Software owned and evolved by this team

[List the main software systems, services, or codebases your team owns]

**Examples:**
- Identity Service (Node.js microservice)
- Auth Gateway (Kong API Gateway)
- User Profile Database (PostgreSQL)
- Admin Dashboard (React SPA)

## Versioning approaches

[Describe how you version your APIs, libraries, and services. How do you communicate breaking changes?]

**Examples:**
- "Semantic versioning (SemVer) for all APIs and libraries as a 'team promise' not to break dependents"
- "API v2 supported for 6 months after v3 release"
- "Breaking changes announced 1 month in advance via #api-announcements channel"

## Wiki and documentation

[Provide links to your team's documentation, how-to guides, runbooks, and knowledge base]

**Examples:**
- [Team Wiki](https://wiki.company.com/teams/identity)
- [API Documentation](https://docs.company.com/identity-api)
- [Getting Started Guide](https://wiki.company.com/identity/getting-started)
- [Troubleshooting Runbook](https://wiki.company.com/identity/troubleshooting)

## Glossary and terms ubiquitous language

[Define key terms, concepts, and domain language your team uses that others need to understand]

**Examples:**
- **Principal**: A user or service account that can be authenticated
- **Claim**: An assertion about a principal (e.g., email, role, permissions)
- **Token lifetime**: How long an access token remains valid (default: 1 hour)
- **Service-to-service auth**: Authentication between backend services using mTLS

## Communication

[How do teams contact you? What are your preferred communication channels?]

**Examples:**
- **Chat (primary)**: #identity-team (team questions), #identity-support (user issues)
- **Email**: identity-team@company.com
- **Video**: Zoom for pairing sessions and troubleshooting
- **Office hours**: Wednesdays 2-3pm EST - drop-in for any questions

## Daily sync time

[When does your team have standups or daily syncs? When are you generally available?]

**Examples:**
- "9:30 AM EST daily standup (15 minutes)"
- "Async standup in #identity-team at 9am EST (no meeting)"
- "Team available 10am-4pm EST with flexible lunch"

## What we're currently working on

[List your current priorities and what the team is actively building or improving]

**Format suggestion**: Use bullet points or a simple table

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
| Mobile App Team | Collaboration | Build mobile-specific auth features | 3 months |
| DevOps Enablement | Facilitating | Learn Kubernetes deployment patterns | 2 months |

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
| Enterprise Sales Portal | X-as-a-Service | New consumer of identity APIs | Ongoing |
| Security & Compliance | Collaboration | Add audit logging and compliance features | 4 months |

---

## How to Use This Template

1. **Copy this file** to `data/tt-teams/[your-team-name].md`
2. **Update the YAML front matter** (name, team_type, position, metadata)
3. **Fill in each section** with your team's information
4. **Delete placeholder text** and examples
5. **Review and publish** - make sure other teams can find this!
6. **Keep it updated** - treat this as a living document, not a one-time exercise

## Need More Sections?

This base template follows the official GitHub Team API structure. However, you may want additional sections for your context:

- **Extended template available**: See `templates/team-api-template-extended.md` for additional well-thought-out sections like:
  - Code & Artifacts
  - Testing Approach
  - Practices & Principles
  - Communication Preferences (detailed)
  - Roadmap & Current Priorities
  - Platform Product Metrics (for platform teams)
  - Customer Problems We Solve
  - Team Members

- **Create your own company-specific template**: It's perfectly fine to add sections relevant to your organization. Consider:
  - Regulatory/compliance requirements specific to your industry
  - Company-specific tooling or processes
  - Cultural practices or communication norms
  - Custom metrics your organization tracks

**Example**: A healthcare tech company might add "HIPAA Compliance Notes" or "Patient Data Handling", while a financial services company might add "SOC2 Controls" or "Audit Trail Requirements".

## Example Team APIs

See real examples in this repository:
- **Base template example**: `data/tt-teams/observability-platform-team.md` - Platform team using base template with clear, focused sections
- **Extended template example**: `data/tt-teams/cloud-development-platform-team.md` - Comprehensive platform team with full metrics, roadmap, and customer problem focus

## Tips for Writing a Great Team API

- **Be specific**: "Support requests answered within 4 hours" beats "We respond quickly"
- **Keep it current**: Update when your services, SLAs, or communication channels change
- **Make it discoverable**: Link from your team chat channel, wiki, and codebase README
- **Use it in onboarding**: New team members and partner teams should read this first
- **Review quarterly**: Team APIs should evolve as your team and services mature
- **Get feedback**: Ask teams who interact with you if your Team API is clear and accurate

## License

This template is based on the [Team Topologies Team API Template](https://github.com/TeamTopologies/Team-API-template) and is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

The YAML front matter extensions (metadata fields like cognitive_load, flow_metrics, value_stream, platform_grouping) are based on Team Topologies book (2nd edition, 2025) and presentation materials.
