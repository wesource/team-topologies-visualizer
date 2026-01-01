---
name: API Gateway Platform Team
team_type: platform
dependencies: []
interaction_modes:
  Security & Compliance Team: collaboration
position:
  x: 204.0
  y: 1220.0
metadata:
  size: 6
  focus: API gateway, service mesh, traffic management
  platform_grouping: Cloud Infrastructure Platform Grouping
  cognitive_load: medium-high
  established: 2023-11
---

# API Gateway Platform Team

Provides API gateway and service mesh infrastructure as a compelling internal product, managing all ingress traffic and inter-service communication.

## Platform Grouping
**Cloud Infrastructure Platform Grouping** - Core infrastructure team working alongside AWS and Observability platform teams.

## Responsibilities

### API Gateway (North-South Traffic)
- Kong / AWS API Gateway management
- Rate limiting and throttling policies
- API versioning and routing
- Request/response transformation
- API documentation generation (OpenAPI/Swagger)
- Developer portal for external APIs

### Service Mesh (East-West Traffic)
- Istio / Linkerd deployment and management
- mTLS between services (zero-trust networking)
- Traffic splitting and canary routing
- Fault injection for chaos testing
- Circuit breakers and retry policies
- Service-to-service authentication

### Traffic Management
- Load balancing strategies (round-robin, least-connection, consistent hashing)
- Geographic routing
- Blue/green and canary deployment patterns
- Header-based routing (A/B testing support)
- Path-based routing and rewriting

### Security & Compliance
- OAuth2 / JWT validation
- API key management
- IP allowlisting / denylisting
- DDoS protection (AWS Shield, Cloudflare)
- WAF rule management
- PCI-DSS compliance for payment APIs

## Technologies
- Kong Gateway / AWS API Gateway
- Istio / Linkerd (service mesh)
- Envoy proxy
- Cert-manager (TLS certificate automation)
- AWS WAF, Shield
- HashiCorp Vault (secrets for mTLS)

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