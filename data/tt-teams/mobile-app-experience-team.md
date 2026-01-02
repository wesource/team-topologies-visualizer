---
name: Mobile App Experience Team
team_type: stream-aligned
dependencies:
- Mobile Platform Team
- Core Platform Team
interaction_modes:
  Mobile Platform Team: x-as-a-service
  Core Platform Team: x-as-a-service
position:
  x: 1054.0
  y: 670.0
metadata:
  size: 8
  value_stream: Mobile Experience
  cognitive_load: high
  cognitive_load_domain: high
  cognitive_load_intrinsic: high
  cognitive_load_extraneous: medium
  platform_dependencies: 2
  responsibilities:
  - Native iOS app
  - Native Android app
  - Mobile-specific features
  - App store management
  established: 2024-09
---

# Mobile App Experience Team

Stream-aligned team responsible for native mobile applications (iOS and Android).

## Value Stream
**Mobile Experience** - Separate value stream from web, serving mobile-first customers.

## Cognitive Load Assessment
- **Overall**: HIGH ⚠️ (approaching overload - consider splitting or adding platform support)
- **Domain complexity**: High (2 native platforms, app store processes, mobile-specific patterns)
- **Intrinsic complexity**: High (native development, performance optimization, offline support)
- **Extraneous complexity**: Medium (some infrastructure still manual)

## Responsibilities
- iOS native app (Swift)
- Android native app (Kotlin)
- Push notification handling
- Offline functionality
- App store submissions and compliance
- Mobile-specific features (camera, location, biometrics)
- Performance optimization

## Platform Dependencies
- **Mobile Platform**: Push notifications, mobile analytics, crash reporting, feature flags
- **Core Platform**: API gateway, authentication, user data

## Cognitive Load Concerns
⚠️ **Team is at capacity**. Opportunities to reduce load:
1. Mobile Platform Team could take on more (CI/CD for mobile, automated testing infrastructure)
2. Consider splitting into iOS and Android teams if value stream justifies it
3. Enabling team could help with mobile testing practices

## Technologies
- iOS: Swift, SwiftUI, Combine
- Android: Kotlin, Jetpack Compose, Coroutines
- Firebase (mobile platform services)
- GraphQL

## Team Composition
- 1 Product Lead
- 1 Tech Lead (mobile architecture)
- 3 iOS Engineers
- 3 Android Engineers

## Flow Metrics (Current vs Target)
- Lead time: 5 days (target: < 3 days)
- Deployment frequency: Weekly (target: multiple per week)
- Change fail rate: 8% (target: < 5%)
- **Note**: Metrics show team is struggling with current cognitive load