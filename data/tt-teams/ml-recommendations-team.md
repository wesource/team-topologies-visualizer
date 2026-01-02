---
name: ML Recommendations Team
team_type: complicated-subsystem
dependencies:
- Data Engineering Team
interaction_modes:
  Data Engineering Team: x-as-a-service
  E-commerce Product Discovery Team: collaboration
position:
  x: 1473.8271604938273
  y: 1300.9259259259259
metadata:
  size: 5
  cognitive_load: high
  cognitive_load_domain: very-high
  cognitive_load_intrinsic: very-high
  cognitive_load_extraneous: low
  specialist_domain: Machine Learning & Recommendations
  platform_grouping: Data Platform Grouping
  established: 2024-09
---

# ML Recommendations Team

Complicated Subsystem team building machine learning models for product recommendations and personalization.

## Team Type: Complicated Subsystem
This is a **Complicated Subsystem** team because:
- Requires deep mathematical and ML expertise
- High cognitive load that would overwhelm stream-aligned teams
- Narrow focus on complex technical domain
- Reduces cognitive burden on stream-aligned teams by hiding ML complexity

## Cognitive Load Assessment
- **Overall**: High (expected and appropriate for complicated subsystem)
- **Domain complexity**: Very high (ML algorithms, model training, feature engineering)
- **Specialist knowledge required**: Yes (data scientists, ML engineers)
- **Why this is OK**: This complexity is contained - stream-aligned teams just consume recommendations API

## Responsibilities
- Product recommendation algorithms
- Personalization models
- User behavior prediction
- A/B testing of recommendation strategies
- Model training and evaluation
- Feature engineering from user behavior data
- Recommendation serving infrastructure

## Why Not a Platform Team?
While this team provides services to others, it's a **Complicated Subsystem** because:
1. Primary focus is on the complex mathematical/ML domain, not on being a service provider
2. Requires specialist ML expertise
3. Less emphasis on "product" mindset and self-service
4. More focus on getting the algorithms right than on API usability

(However, there's some overlap - could be argued either way)

## Current Collaboration
- **E-commerce Product Discovery Team**: 3-month collaboration to integrate new recommendation engine into product pages
- **Mobile App Experience Team**: Will start collaboration next quarter for mobile recommendations

## Platform Grouping
**Data Platform Grouping** - Works alongside Data Engineering and Search Platform teams in a coordinated data capability grouping.

## Technologies
- Python (scikit-learn, TensorFlow, PyTorch)
- Apache Spark (data processing)
- MLflow (experiment tracking)
- Kubernetes (model serving)
- Redis (feature store)

## Team Composition
- 1 ML Lead / Research Scientist
- 2 ML Engineers
- 1 Data Scientist
- 1 ML Platform Engineer (model serving)

## Success Metrics
- Recommendation click-through rate: 12.5%
- Model accuracy: 87%
- Recommendation latency: < 50ms p99
- A/B test lift: +8% conversion rate
- Model training time: < 4 hours

## Collaboration Pattern
When working with stream-aligned teams:
1. **Discovery phase** (2-4 weeks): Collaboration mode
   - Understand requirements
   - Design integration approach
   - Prototype together
2. **Integration phase** (4-8 weeks): Collaboration mode
   - Stream-aligned team integrates recommendations
   - ML team provides support
3. **Steady state** (ongoing): X-as-a-Service mode
   - Stream-aligned team consumes recommendation API
   - ML team focuses on improving models
   - Minimal coordination needed