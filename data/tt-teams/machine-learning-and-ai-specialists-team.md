---
name: Machine Learning & AI Specialists Team
team_id: machine-learning-and-ai-specialists-team
team_type: complicated-subsystem
position:
  x: 2120.0
  y: 100.0
metadata:
  size: 6
  cognitive_load: high
  established: 2023-11
value_stream: null
---

# Machine Learning & AI Specialists Team

## Team name and focus

Machine Learning & AI Specialists Team - A complicated-subsystem team dedicated to developing and maintaining machine learning models and AI capabilities for LogiCore's logistics operations, including route optimization algorithms, delivery ETA predictions, demand forecasting, driver behavior analytics, and fleet utilization models that require deep specialized knowledge in data science and ML engineering.

## Team type

complicated-subsystem

## Part of a value stream?

No

Serves both B2B Services and B2C Services.

This team provides specialized ML/AI capabilities across multiple value streams:
- **B2B Services**: Route optimization algorithms, fleet utilization forecasting, demand prediction, load planning optimization
- **B2C Services**: Delivery ETA predictions, driver behavior analytics, delivery time window optimization, customer demand patterns

**Why complicated-subsystem?** Logistics ML/AI work requires deep technical expertise (data science, operations research, model training, feature engineering, model deployment, A/B testing, monitoring for drift) that would create excessive cognitive load for stream-aligned teams. The complexity and specialization justify a dedicated team serving multiple value streams.

## Services provided (if applicable)

- Route optimization and vehicle routing algorithms
- Delivery ETA prediction models
- Demand forecasting and capacity planning
- Driver behavior analytics and scoring
- Fleet utilization optimization
- Technical guidance on AI/ML best practices

## Service-level expectations (SLA)
- Model API uptime: 99.9%
- Model update frequency: Monthly or as needed
- Support requests: Response within 1 business day

## Software owned and evolved by this team
- Model training pipelines (Kubeflow, MLflow)
- Model serving APIs (FastAPI, TensorFlow Serving)
- Feature stores
- A/B testing platform for ML

## Versioning approaches
- Semantic versioning for model APIs and artifacts
- Breaking changes announced 2 weeks in advance

## Wiki and documentation
- [Team Wiki](https://wiki.company.com/teams/ml-specialists)
- [API Docs](https://docs.company.com/ml-specialists)

## Glossary and terms ubiquitous language
- **AUC**: Area Under the Curve (model accuracy metric)
- **Feature engineering**: Creating input variables for ML models
- **Model drift**: Degradation of model performance over time

## Communication
- **Chat**: #ml-specialists
- **Email**: ml-specialists@company.com

## Daily sync time
10:30 AM daily standup

## What we're currently working on
- Q1 2026: Launch new recommendation engine
- Q1 2026: Improve model monitoring and alerting
- Q1 2026: Expand NLP capabilities

## Teams we currently interact with
| Team Name | Interaction Mode | Purpose | Duration |
|-----------|------------------|---------|----------|
| Data Engineering Enablement Team | Collaboration | Feature engineering, data pipelines | Ongoing |
| Data Pipeline Platform Team | X-as-a-Service | Model deployment infrastructure | Ongoing |
| Fleet Monitor Team | Collaboration | Integrate recommendations | 3 months |

## Teams we expect to interact with soon
| Team Name | Interaction Mode | Purpose | Expected Duration |
|-----------|------------------|---------|-------------------|
| Driver Experience Team | Collaboration | Mobile recommendations | 2 months |