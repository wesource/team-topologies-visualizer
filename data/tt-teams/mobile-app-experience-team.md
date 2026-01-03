---
name: Mobile App Experience Team
team_type: stream-aligned
position:
  x: 1800.0
  y: 2080.0
metadata:
  size: 7
  cognitive_load: medium
  established: 2023-11
---

# Mobile App Experience Team

**Team name and focus**

Mobile App Experience Team – A stream-aligned team responsible for delivering and evolving the native mobile applications (iOS and Android), ensuring a seamless, high-quality experience for mobile-first customers.

## Team type

stream-aligned

## Value Stream

Mobile Experience – Focused on the end-to-end customer journey for mobile users, separate from the web experience.

## Cognitive Load Assessment
- **Overall**: Medium (well-balanced, but growing scope)
- **Domain complexity**: High (multiple platforms, app store processes, mobile-specific patterns)
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