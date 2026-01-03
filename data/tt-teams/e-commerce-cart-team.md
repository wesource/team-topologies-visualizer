---
name: E-Commerce Cart Team
team_type: stream-aligned
position:
  x: 204.0
  y: 1170.0
metadata:
  size: 6
  cognitive_load: medium
  established: 2024-03
value_stream: E-Commerce
---

# E-Commerce Cart Team

## Team name and focus
E-Commerce Cart Team – Owns the shopping cart experience, including add-to-cart, cart management, saved carts, and cart optimization features.

## Team type
stream-aligned

## Part of a value stream?

Yes - E-Commerce

This team works within the E-Commerce value stream alongside Checkout, Product Discovery, Search, and Recommendations teams.

## Services provided (if applicable)
N/A - This is a stream-aligned team that delivers customer-facing features.

## Service-level expectations (SLA)
- Cart service availability: 99.9% uptime
- Add-to-cart latency: < 200ms p99
- Cart persistence: 30 days for logged-in users
- Support response time: < 2 hours

## Software owned and evolved by this team
- Shopping Cart Service (Node.js)
- Cart UI Components (React)
- Cart Abandonment Service

## Versioning approaches
- Semantic versioning for Cart API
- Feature flags for cart experiments

## Wiki and documentation
- [Team Wiki](https://wiki.company.com/teams/cart)
- [Cart API Docs](https://docs.company.com/cart-api)

## Glossary and terms ubiquitous language
- **Cart Abandonment**: User adds items but doesn't complete checkout
- **Saved Cart**: Cart preserved across sessions

## Communication
- **Chat**: #ecommerce-cart
- **Email**: cart-team@company.com

## Daily sync time
10:30 AM daily standup

## What we're currently working on
- Q1 2026: Cart recommendations
- Q1 2026: Cart abandonment emails

## Teams we currently interact with

| Team Name | Interaction Mode | Purpose | Duration |
|-----------|------------------|---------|----------|
| E-Commerce Checkout Team | Collaboration | Seamless cart-to-checkout handoff | Ongoing |
| Data Storage Platform Team | X-as-a-Service | Cart persistence | Ongoing |