---
name: Data Storage Platform Team
team_type: platform
dependencies: []
interaction_modes: {}
position:
  x: 204.0
  y: 180.0
metadata:
  size: 7
  value_stream: E-Commerce Experience
  platform_grouping: null
  cognitive_load: medium
  capabilities:
  - PostgreSQL managed service
  - Redis caching clusters
  - Elasticsearch search infrastructure
  - Database migration tooling
  - Data backup and disaster recovery
  consumers: 6 teams
  established: 2024-06
---

# Data Storage Platform Team

Platform team providing managed data storage services, functioning as an **inner platform team** within the E-Commerce Experience value stream.

## Inner Platform Team (2nd Edition Concept)
This team operates within the E-Commerce Experience value stream boundary, providing specialized database and caching capabilities for e-commerce stream-aligned teams.

## Cognitive Load Assessment
- **Overall**: Medium (focused on data infrastructure)
- **Scope**: Multiple storage technologies but cohesive domain
- **Specialization**: Database performance, reliability, scaling

## Platform Capabilities (Thinnest Viable Platform approach)

### 1. PostgreSQL Managed Service
- Automated provisioning and configuration
- High-availability clusters with failover
- Read replicas for scaling
- Automated backups and point-in-time recovery
- Performance monitoring and query optimization
- **Consumers**: Checkout, Product Discovery, User Profile services

### 2. Redis Caching Infrastructure
- Multi-tenant Redis clusters
- Session storage and caching patterns
- Rate limiting infrastructure
- Real-time leaderboards and counters
- **Consumers**: All stream-aligned teams

### 3. Elasticsearch / OpenSearch
- Full-text search infrastructure
- Log aggregation (application logs)
- Analytics data storage
- Index management and optimization
- **Consumers**: Search, Product Discovery, Customer Support

### 4. Database Migration & Schema Management
- Liquibase / Flyway integration
- Schema versioning and rollback capabilities
- Zero-downtime migration patterns
- Development/staging environment parity

### 5. Backup & Disaster Recovery
- Automated backup schedules
- Cross-region replication
- Disaster recovery runbooks
- Backup testing and validation
- **Consumers**: All stream-aligned teams

### 3. User Profile Service
- User account management
- Profile data storage
- Preferences management
- **Consumers**: E-commerce teams, Mobile team, Enterprise team

### 4. Notification Service
- Email delivery (transactional, marketing)
- SMS notifications
- Push notifications (mobile)
- Notification preferences
- **Consumers**: All stream-aligned teams

### 5. Feature Flags
- Feature toggle management
- Gradual rollout controls
- A/B testing framework
- **Consumers**: All stream-aligned teams

## Platform as a Product
- **Product Manager**: 1 dedicated PM treating internal teams as customers
- **Developer Experience focus**: Easy-to-use APIs, great documentation, fast onboarding
- **SLA commitments**: 99.9% uptime, < 100ms p99 latency
- **Self-service**: Teams can integrate without Platform Team involvement

## Technologies
- Kubernetes
- Kong API Gateway
- Auth0
- PostgreSQL
- RabbitMQ
- LaunchDarkly (feature flags)

## Team Composition
- 1 Platform Product Manager
- 1 Tech Lead / Architect
- 5 Platform Engineers
- 1 SRE
- 1 DevRel / Developer Experience Engineer

## Platform Metrics
- Number of consumers: 8 teams
- API request volume: 10M requests/day
- Time to onboard new team: < 1 day (self-service docs)
- Support tickets: Declining trend (good docs!)
- Platform NPS from consumer teams: 72 (promoter zone)

## Future Evolution
Monitoring for signals to split into specialized teams:
- **Auth & Identity Team** (if auth complexity grows)
- **API Infrastructure Team** (if gateway becomes more complex)
- **Developer Experience Team** (if dev tooling needs grow)