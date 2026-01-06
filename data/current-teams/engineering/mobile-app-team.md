---
name: Mobile App Team
team_type: feature-team
product_line: Driver Mobile Apps
dependencies:
- Backend Services Team
- API Framework Team
position:
  x: 300.0
  y: 530.0
metadata:
  size: 8
  department: Engineering
  product: Driver Mobile Apps, Customer Mobile Apps
  established: 2020-01
  cognitive_load: high
  cognitive_load_domain: very-high
  cognitive_load_intrinsic: very-high
  cognitive_load_extraneous: very-high
line_manager: Michael Chen
---

# Mobile App Team

Develops native mobile applications for drivers and end-customers in LogiCore's logistics platform.

## Responsibilities

**Driver Apps (iOS and Android)**:
- Turn-by-turn navigation and route execution
- Proof-of-delivery: photo capture, digital signatures
- Real-time status updates (arrived, departed, delivered)
- Driver-to-dispatcher messaging
- Daily trip manifests and route optimization
- Package scanning and barcode reading
- Offline-first architecture for connectivity loss

**Customer Apps (iOS and Android)**:
- Real-time delivery tracking with map view
- Push notifications for delivery status changes
- Delivery time window updates and ETAs
- Feedback and ratings for delivery experience
- Order history and tracking

## Technologies
- **iOS**: Swift 5, SwiftUI, Combine, CoreLocation, MapKit, AVFoundation
- **Android**: Kotlin, Jetpack Compose, Coroutines, Google Maps SDK, CameraX
- **APIs**: REST, WebSocket (real-time updates)
- **Push**: Firebase Cloud Messaging
- **CI/CD**: Fastlane, GitHub Actions
- **Analytics**: Firebase, Crashlytics

## Team Structure
- 1 Mobile Engineering Lead
- 3 iOS Developers (Swift)
- 3 Android Developers (Kotlin)
- 1 UX Designer (shared 50% with Web Frontend Team)

## Current Challenges (Pre-TT Dysfunction)

**Technology Silo Anti-Pattern**:
- Separate iOS and Android sub-teams (3 iOS devs, 3 Android devs)
- Features implemented twice - first on one platform, then ported to other
- Platform parity issues - iOS typically 2-4 weeks ahead of Android
- Cannot share code or collaborate across platform boundaries
- Duplicate bugs requiring duplicate fixes

**Handoff Anti-Pattern**:
- Must wait for Backend Services Team to implement APIs before mobile work
- API changes discovered late when integrating
- Cannot deploy app updates without backend coordination
- App Store review (2-7 days) complicates deployment timing

**Shared Service Bottleneck**:
- QA and Testing Team must manually test on both platforms
- Testing bottleneck delays releases by 1-2 weeks
- Cannot release iOS and Android independently due to backend dependencies

**Cognitive Overload**:
- Responsible for 2 user personas with very different needs (drivers vs customers)
- Driver app requires offline-first, customer app mostly online
- Too many product areas: navigation, delivery, messaging, ratings, scanning

**Unclear Boundaries**:
- Web Frontend Team also building web driver tools - duplication
- Inconsistent UX between mobile and web for same journeys
- Confusion over "mobile web" vs "native app" ownership

## Dependencies
- **Backend Services Team**: All business logic, delivery data, real-time updates
- **API Framework Team**: Mobile SDK, authentication, push notifications
- **QA and Testing Team**: Manual device testing before release

## Coordination Overhead
- Weekly "Mobile-Backend Sync" meeting (90 minutes)
- Bi-weekly "Platform Parity Review" to track iOS vs Android gaps
- Monthly "Cross-Platform UX" meeting with Web Frontend Team
- Quarterly "App Store Strategy" with Product and Marketing

## Platform Fragmentation
- Supporting iOS 14+ (85% users) and Android 10+ (78% users)
- 50+ device models in testing matrix
- iOS releases every 2-3 weeks, Android every 4-6 weeks (testing bottleneck)

## Transformation Opportunities

**In TT-Design, split into**:
- **Driver Experience Team**: Cross-functional (iOS+Android+Backend) for driver apps
- **Customer Delivery Tracking Team**: Cross-functional for customer apps
- Each team builds for both platforms simultaneously
- Mobile BFF pattern enables independent deployment
- iOS and Android developers work together on same features instead of serial implementation