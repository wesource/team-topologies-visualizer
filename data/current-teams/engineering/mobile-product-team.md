---
name: Mobile Product Team
team_type: feature-team
position:
  x: 410.0
  y: 530.0
metadata:
  size: 6
  department: Engineering
  product: RouteOptix Mobile
  established: 2021-09
line_manager: Michael Chen
---

# Mobile Product Team

Cross-functional team building and maintaining the RouteOptix mobile applications for iOS and Android, used by delivery drivers in the field for real-time route execution, package scanning, and proof of delivery.

## Responsibilities
- Native iOS and Android app development
- Driver mobile experience (route execution, navigation integration)
- Package scanning and barcode reading functionality
- Electronic proof of delivery (signatures, photos)
- Offline-first architecture for connectivity loss scenarios
- Real-time location tracking and status updates
- Push notifications for route changes and updates
- Mobile app performance optimization and battery management
- App store management (releases, beta testing, reviews)
- Mobile backend-for-frontend (BFF) services

## Technologies
- **iOS**: Swift, SwiftUI, UIKit, CoreLocation, AVFoundation
- **Android**: Kotlin, Jetpack Compose, Room, CameraX
- **Cross-platform tooling**: Shared design system, common API contracts
- **Backend**: Node.js (BFF layer)
- **APIs**: REST, WebSocket (for real-time updates)
- **CI/CD**: Fastlane, GitHub Actions
- **Analytics**: Firebase, Crashlytics
- **Maps**: Google Maps SDK, Apple MapKit

## Team Structure
- 2 iOS Engineers (Swift)
- 2 Android Engineers (Kotlin)
- 1 Backend Engineer (Node.js/BFF)
- 1 QA Engineer (Mobile testing specialist)

## Key Workflows
- Dual-platform feature development with platform-specific implementations
- Coordinated release cycles across iOS and Android
- Shared design system and UX patterns
- Beta testing through TestFlight and Google Play Console
- Regular driver feedback sessions and field testing

## Cognitive Load Considerations
The team manages both platforms but mitigates cognitive load through:
- Platform specialists (dedicated iOS and Android engineers)
- Shared backend/API layer reduces duplication
- Common design system and product requirements
- Cross-platform knowledge sharing and pairing

*Note: If mobile user base grows significantly (>500K active users) or platforms diverge in features, consider splitting into dedicated iOS and Android teams.*