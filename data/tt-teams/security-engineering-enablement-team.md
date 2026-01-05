---
name: Security Engineering Enablement Team
team_type: enabling
position:
  x: 1800.0
  y: 280.0
metadata:
  size: 4
  cognitive_load: medium
  established: 2024-01
---

# Security Engineering Enablement Team

Helps stream-aligned and platform teams improve security practices through facilitation and temporary collaboration. Not a gatekeeper or approval bottleneck.

## Team Type: Enabling
Enabling teams exist to **increase the autonomy** of stream-aligned teams by:
- Upskilling teams in security practices
- Removing security-related obstacles
- Evangelizing secure-by-default patterns
- **NOT doing the work for teams** - enabling teams teach, don't deliver

## Interaction Mode: Facilitating
Facilitating is about **sensing and reducing obstacles** for other teams:
- Time-boxed engagements (typically 4-8 weeks)
- Knowledge transfer, not long-term dependency
- Move to next team after upskilling
- Track "graduation" - teams become self-sufficient

## Responsibilities

### Threat Modeling Facilitation
- Run threat modeling workshops (STRIDE, Attack Trees)
- Help teams identify security risks early in design
- Document threat models and mitigations
- Train teams to conduct their own threat modeling

### Secure Coding Practices
- Code review mentorship (security perspective)
- Demonstrate OWASP Top 10 mitigations
- Pair programming on security-sensitive code
- Create secure coding guideline examples

### Security Testing Enablement
- Help teams adopt SAST tools (Snyk, SonarQube)
- Demonstrate DAST and dependency scanning
- Set up security test automation in CI/CD
- Interpret security scan results and prioritize fixes

### Compliance Guidance
- Explain GDPR, PCI-DSS, SOC2 requirements
- Map compliance controls to engineering practices
- Help teams design compliance-friendly architectures
- Simplify audit preparation

### Incident Response Training
- Run security incident simulations (game days)
- Teach teams to recognize security events
- Practice incident response runbooks
- Post-incident review facilitation

## Technologies & Tools
- Threat modeling: Microsoft Threat Modeling Tool, OWASP Threat Dragon
- SAST: Snyk, Semgrep, SonarQube
- DAST: OWASP ZAP, Burp Suite
- Secret scanning: GitLeaks, TruffleHog
- Security training: Secure Code Warrior, OWASP WebGoat

## Current Engagements (Q1 2026)
1. **Mobile App Experience Team** (Weeks 4-11): OAuth2 implementation, biometric authentication patterns
2. **API Gateway Platform Team** (Weeks 1-6): WAF rule optimization, DDoS mitigation strategies
3. **Payment Platform Team** (Planning): PCI-DSS v4.0 compliance preparation

## Success Metrics
- Teams self-sufficient in security testing: Target 80%
- Security issues found in development (shift-left): 70% of total
- Time to resolve critical vulnerabilities: < 7 days
- Teams with security champions: 100%

## Anti-Patterns to Avoid
❌ **Security as a Service**: Becoming a long-term dependency  
✅ **Security Enablement**: Teach teams to own their security

❌ **Approval Bottleneck**: Reviewing every change  
✅ **Automation & Guardrails**: Security scans in CI/CD, teams self-verify

❌ **Blame Culture**: Pointing out vulnerabilities harshly  
✅ **Learning Culture**: Treat security findings as learning opportunities

## Collaboration with Security & Compliance Team
- **Security & Compliance Team**: Defines policies, handles audits, incident response
- **Security Engineering Enablement Team**: Helps teams implement policies, upskills on security practices
- Clear division: Policy vs. Practice

## Service-level expectations (SLA)
- Initial consultation: Within 2 business days
- Engagement capacity: 2-3 teams simultaneously
- Follow-up support: 1 month after engagement

## Software owned and evolved by this team
- Security Playbooks & Guides
- Security Workshop Materials
- Threat Modeling Templates

## Versioning approaches
- Semantic versioning for playbooks

## Wiki and documentation
- [Team Wiki](https://wiki.company.com/teams/security-enablement)
- [Security Playbooks](https://playbooks.company.com/security)

## Glossary and terms ubiquitous language
- **Threat Modeling**: Identifying security risks
- **SAST**: Static Application Security Testing
- **Shift-Left**: Finding security issues early

## Communication
- **Chat**: #security-enablement
- **Email**: security-enablement@company.com

## Daily sync time
10:00 AM daily standup

## What we're currently working on
- Q1 2026: OAuth2 implementation coaching (Mobile team)
- Q1 2026: Security workshop series

## Teams we currently interact with

| Team Name | Interaction Mode | Purpose | Duration |
|-----------|------------------|---------|----------|
| Mobile App Experience Team | Facilitating | OAuth2 implementation, biometric auth | 8 weeks (ending Feb 2026) |
| API Gateway Platform Team | Facilitating | WAF optimization, DDoS mitigation | 6 weeks (ending Feb 2026) |