---
name: Security Engineering Enablement Team
team_type: enabling
dependencies: []
interaction_modes:
  API Gateway Platform Team: facilitating
  AWS Developer Platform Team: facilitating
position:
  x: 1777.5582990397804
  y: 645.2674897119342
metadata:
  size: 4
  focus: Security practices, threat modeling, secure coding
  cognitive_load: medium
  engagement_model: Time-boxed enablement missions (4-8 weeks)
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