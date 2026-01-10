---
name: Mobile Platform Team
team_type: platform
position:
  x: 1054.0
  y: 1110.0
metadata:
  size: 6
  cognitive_load: medium
  established: 2023-10
  flow_metrics:
    lead_time_days: 10
    deployment_frequency: daily
    change_fail_rate: 0.05
    mttr_hours: 2
value_stream: Mobile Experience
---

# Mobile Inner Platform Team

## Team name and focus
Mobile Inner Platform Team – An **inner platform team** within the Mobile Experience value stream (2nd Edition concept), providing mobile-specific infrastructure to reduce cognitive load for mobile stream-aligned teams.

## Team type
platform

## Part of a value stream?

Yes - Mobile Experience (inner platform serving mobile stream-aligned teams)

This demonstrates the 2nd Edition pattern where platform teams can exist within value streams to serve domain-specific needs.

## Part of a platform grouping?

No - This is an inner platform within Mobile Experience value stream, not part of Cloud Infrastructure Platform Grouping.

## Services provided (if applicable)
- Mobile CI/CD pipelines (iOS, Android)
- Push notification infrastructure (FCM, APNs)
- Mobile analytics and crash reporting
- Feature flags and A/B testing for mobile
- App store automation

## Service-level expectations (SLA)
- CI/CD build time: < 10 minutes
- Crash-free rate: > 99.5%
- Push notification delivery: > 98%
- Platform support response: < 4 hours

## Software owned and evolved by this team
- Mobile CI/CD pipelines (fastlane, GitHub Actions)
- Push notification backend
- Mobile SDK integrations
- Analytics dashboards

## Versioning approaches
- Semantic versioning for mobile SDKs
- Breaking changes announced 1 month ahead

## Wiki and documentation
- [Team Wiki](https://wiki.company.com/teams/mobile-platform)
- [Mobile Platform Docs](https://docs.company.com/mobile-platform)
- [SDK Documentation](https://sdk-docs.company.com/mobile)

## Glossary and terms ubiquitous language
- **Inner Platform**: Platform team within a value stream
- **FCM**: Firebase Cloud Messaging
- **APNs**: Apple Push Notification service
- **Fastlane**: iOS/Android automation tool

## Communication
- **Chat**: #mobile-platform
- **Email**: mobile-platform@company.com

## Daily sync time
9:00 AM daily standup

## What we're currently working on
- Q1 2026: Automated mobile testing infrastructure
- Q1 2026: Performance monitoring dashboards
- Q2 2026: Mobile security scanning

## Teams we currently interact with

| Team Name | Interaction Mode | Purpose | Duration |
|-----------|------------------|---------|----------|
| Driver Experience Team | X-as-a-Service | Provide CI/CD, analytics, crash reporting | Ongoing |
| Driver Feedback Team | X-as-a-Service | Provide CI/CD, push, analytics | Ongoing |
| Delivery Notifications Team | X-as-a-Service | Provide push infrastructure | Ongoing |
| Cloud Development Platform Team | X-as-a-Service | Run on their AWS/Kubernetes infrastructure | Ongoing |