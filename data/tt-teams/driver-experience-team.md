---
team_id: driver-experience-team
name: Driver Experience Team
team_type: stream-aligned
position:
  x: 1730.0
  y: 413.0
metadata:
  size: 8
  cognitive_load: medium
  established: 2023-11
value_stream: B2C Services
---

# Driver Experience Team

## Team name and focus
Driver Experience Team – Delivers native mobile applications (iOS and Android) for delivery drivers, including route navigation, proof-of-delivery, driver-dispatcher messaging, and offline-first capabilities.

## Team type
stream-aligned

## Part of a value stream?

Yes - B2C Services

This team serves delivery drivers (B2C end-users) with mobile-first experiences for executing deliveries efficiently.

## Services provided (if applicable)
N/A - This is a stream-aligned team delivering customer-facing features for drivers.

## Service-level expectations (SLA)
- App availability: 99.95% uptime (critical for driver operations)
- App performance: < 2s launch time
- Offline mode: Full functionality without network
- Support response: < 1 hour (business-critical)

## Software owned and evolved by this team
- Driver Mobile App iOS (Swift + SwiftUI)
- Driver Mobile App Android (Kotlin + Jetpack Compose)
- Proof-of-Delivery Service (photo/signature capture)
- Offline Data Sync Engine
- Driver-Dispatcher Messaging
- Route Navigation Integration (Mapbox, Google Maps)

## Versioning approaches
- Semantic versioning for app versions
- Weekly app store releases (iOS/Android coordinated)
- Feature flags for gradual rollouts to drivers
- Beta testing program with volunteer drivers

## Wiki and documentation
- [Team Wiki](https://wiki.logicore.com/teams/driver-experience)
- [Driver App User Guide](https://docs.logicore.com/driver-app)
- [Mobile Development Standards](https://docs.logicore.com/mobile-dev)

## Glossary and terms ubiquitous language
- **Proof of Delivery (POD)**: Photo/signature confirmation
- **Offline-first**: App works without network connection
- **Route Manifest**: Daily list of deliveries assigned to driver
- **Status Update**: Driver marks arrived/departed/delivered

## Communication
- **Chat**: #driver-experience
- **Email**: driver-experience-team@logicore.com

## Daily sync time
9:00 AM daily standup

## What we're currently working on
- Q1 2026: Enhanced offline mode (store 7 days of routes locally)
- Q1 2026: Barcode scanning for package verification
- Q1 2026: Driver earnings and performance dashboard
- Q2 2026: In-app navigation improvements

## Teams we currently interact with

| Team Name | Interaction Mode | Purpose | Duration |
|-----------|------------------|---------|----------|
| Mobile Platform Team | X-as-a-Service | CI/CD, push notifications, app analytics | Ongoing |
| Fleet Operations Team | Collaboration | Driver-dispatcher communication | Ongoing |
| Route Optimization Platform Team | X-as-a-Service | Route data and turn-by-turn directions | Ongoing |
| Driver Feedback Team | Collaboration | Driver ratings and feedback visibility | Ongoing |
| Observability Platform Team | X-as-a-Service | Mobile app monitoring and crash reporting | Ongoing |

## Technologies
- **iOS**: Swift 5, SwiftUI, Combine, CoreLocation, AVFoundation (camera), MapKit
- **Android**: Kotlin, Jetpack Compose, Coroutines, CameraX, Google Maps SDK
- **Offline**: SQLite local database, background sync
- **Backend**: Mobile BFF (Backend-for-Frontend) in Node.js
- **CI/CD**: Fastlane, GitHub Actions

## Team Composition
- 1 Product Lead (driver experience focus)
- 1 Tech Lead (mobile architecture)
- 3 iOS Engineers (Swift/SwiftUI)
- 3 Android Engineers (Kotlin/Compose)
- 1 Mobile QA Engineer

## Flow Metrics (Current vs Target)
- Lead time: 3 days (target: < 2 days)
- Deployment frequency: Weekly (iOS and Android coordinated)
- Change fail rate: 4% (target: < 5%) ✅
- MTTR: 2 hours (target: < 4 hours) ✅