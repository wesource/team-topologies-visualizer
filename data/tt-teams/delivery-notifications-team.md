---
team_id: delivery-notifications-team
name: Delivery Notifications Team
team_type: stream-aligned
position:
  x: 2130.0
  y: 289.0
metadata:
  size: 5
  cognitive_load: medium
  established: 2024-05
value_stream: B2C Services
---

# Delivery Notifications Team

## Team name and focus
Delivery Notifications Team – Owns multi-channel delivery notifications (push, SMS, email) for B2C customers, providing real-time updates on delivery status, ETAs, and driver location.

## Team type
stream-aligned

## Part of a value stream?

Yes - B2C Services

This team ensures customers stay informed about their delivery status through timely, personalized notifications.

## Services provided (if applicable)
N/A - This is a stream-aligned team that delivers customer-facing notification features.

## Service-level expectations (SLA)
- Notification delivery: 99.9% uptime
- Delivery latency: < 10 seconds for time-sensitive updates
- SMS delivery: < 30 seconds
- Email delivery: < 2 minutes

## Software owned and evolved by this team
- Notification Orchestration Service (Node.js)
- Multi-Channel Delivery Engine (push, SMS, email)
- Notification Preferences Management
- Delivery Analytics Dashboard
- Notification Templates and Personalization

## Versioning approaches
- Semantic versioning for notification API
- Feature flags for notification experiments
- A/B testing for message content and timing

## Wiki and documentation
- [Team Wiki](https://wiki.logicore.com/teams/delivery-notifications)
- [Notification API Docs](https://docs.logicore.com/delivery-notifications-api)
- [Notification Templates](https://docs.logicore.com/notification-templates)

## Glossary and terms ubiquitous language
- **Delivery Event**: Status change triggering notification (out for delivery, delivered, delayed)
- **Multi-Channel**: Push, SMS, email notification delivery
- **Notification Preferences**: Customer settings for notification types and channels
- **Engagement Rate**: % of customers who tap/open notifications

## Communication
- **Chat**: #delivery-notifications
- **Email**: delivery-notifications@logicore.com

## Daily sync time
10:00 AM daily standup

## What we're currently working on
- Q1 2026: Proactive delay notifications (predict delays before they occur)
- Q1 2026: Rich push notifications with driver photo and live map
- Q1 2026: SMS delivery for customers without app installed

## Teams we currently interact with

| Team Name | Interaction Mode | Purpose | Duration |
|-----------|------------------|---------|----------|
| Customer Delivery Tracking Team | Collaboration | In-app notification integration | Ongoing |
| Driver Experience Team | Collaboration | Driver status triggers notifications | Ongoing |
| Mobile Platform Team | X-as-a-Service | Push infrastructure (FCM, APNs) | Ongoing |
| Route Optimization Platform Team | X-as-a-Service | ETA updates for notifications | Ongoing |
| Feature Management Platform Team | X-as-a-Service | Progressive rollout of notification types | Ongoing |