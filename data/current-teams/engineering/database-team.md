---
name: Database Team
team_type: platform-team
position:
  x: 960.0
  y: 530.0
metadata:
  size: 3
  department: Engineering
  established: 2017-09
  cognitive_load: high
  cognitive_load_domain: high
  cognitive_load_intrinsic: high
  cognitive_load_extraneous: medium
line_manager: Robert Miller
---

# Database Team

Provides database administration, schema management, and data infrastructure for LogiCore's logistics platform.

## Responsibilities

**Database Administration**:
- PostgreSQL primary database (delivery data, routes, fleet info)
- MongoDB for driver location history and real-time tracking
- Redis for caching and session management
- Database backup and disaster recovery
- Performance monitoring and capacity planning

**Schema Management**:
- Schema design and optimization
- Migration management (Flyway/Alembic)
- Data modeling and normalization
- Index optimization and query tuning

**Data Access Control**:
- Database security and access permissions
- Production data access approvals
- Data export requests for analytics and ML teams
- Query performance review and optimization

## Technologies
- **Databases**: PostgreSQL 14, MongoDB 6, Redis 7
- **Migrations**: Flyway, Alembic
- **Scripting**: SQL, Python
- **Monitoring**: pgAdmin, MongoDB Compass, Grafana, Prometheus
- **Backup**: pg_dump, mongodump, AWS RDS snapshots

## Team Structure
- 1 Lead DBA (PostgreSQL expert)
- 1 NoSQL Engineer (MongoDB, Redis)
- 1 Database Engineer (migrations, optimization)

## Current Challenges (Pre-TT Dysfunction)

**Shared Service Bottleneck Anti-Pattern**:
- ALL database changes must go through Database Team (single point of failure)
- Schema changes require Jira ticket + DBA review (3-5 day turnaround typical)
- Development teams blocked waiting for index creation, view creation, table changes
- Database Team has 20-30 pending schema change requests at any time
- Production deployments delayed waiting for DB migration approval

**Reactive Not Self-Service**:
- Developers cannot create tables, indexes, or views themselves
- No self-service database provisioning (teams must request via Jira)
- Query optimization requires DBA expertise - teams don't have database skills
- Every schema change requires manual review and approval

**Data Access Bottleneck**:
- Route Optimization Team needs production data for algorithm training (must request exports)
- Data export requests take 2-5 days (manual CSV dumps via DBA)
- Read replicas exist but teams don't have access (security concerns)
- Analytics and reporting queries slow down production database

**Cognitive Overload**:
- Responsible for database needs of ALL teams (Backend, Web, Mobile, Route Optimization)
- Must understand business logic to design optimal schemas
- Too many databases to manage: PostgreSQL (primary), MongoDB (locations), Redis (cache)
- Cannot scale - only 3 people for entire company's data infrastructure

**Coordination Overhead**:
- Weekly "Schema Review" meeting with all development teams (90 minutes, 12+ people)
- Daily "Database Request Triage" to prioritize schema changes
- Monthly "Performance Review" to identify slow queries and optimization opportunities
- Constant interruptions: "Why is my query slow?" "Can you add this index?"

## Services Provided (Ticket-Based)
- Database schema changes (3-5 day turnaround)
- Production data access and exports (2-5 days)
- Query optimization consultancy (schedule 1 week in advance)
- Read replica provisioning (1-2 weeks)
- Database backup/restore (emergency only)

## Performance Issues
- Some queries take 10-30 seconds (missing indexes, poor schema design)
- MongoDB location data growing rapidly (1TB+, no archival strategy)
- Redis cache hit rate only 60% (configuration issues, teams don't understand caching)
- PostgreSQL nightly backup takes 4 hours (blocks some maintenance tasks)

## Transformation Opportunities

**In TT-Design, evolve toward self-service platform**:
- Provide database-as-a-service with self-service provisioning
- Empower teams to own their own schemas and migrations
- Automated schema change pipeline (CI/CD for database changes)
- Self-service read replicas for analytics queries
- Database platform team provides tooling, guardrails, and expertise (enabling role)
- Each stream-aligned team owns their database schema and data model
- Clear service boundaries: teams own their data, platform provides infrastructure