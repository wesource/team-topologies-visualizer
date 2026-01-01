---
name: Fraud Detection & Risk Modeling Team
team_type: complicated-subsystem
dependencies:
  - team: Data Engineering Team
    interaction: x-as-a-service
position:
  x: 650.0
  y: 800.0
metadata:
  size: 7
  focus: Machine learning models for fraud detection, risk scoring
  cognitive_load: high
  specialization: Data science, statistical modeling, real-time ML
  established: 2023-09
---

# Fraud Detection & Risk Modeling Team

Complicated Subsystem team with deep expertise in statistical modeling, machine learning, and fraud detection algorithms. Shields stream-aligned teams from the complexity of fraud prevention.

## Team Type: Complicated Subsystem
Exists because the domain is **too complex** for stream-aligned teams to handle alongside their other responsibilities:
- Requires specialist knowledge (data science, statistics, ML engineering)
- High cognitive load to maintain and evolve
- Critical for business (revenue protection, regulatory compliance)
- Better handled by dedicated specialists

## Why This is a Complicated Subsystem
- **Mathematical complexity**: Bayesian models, ensemble methods, neural networks
- **Real-time constraints**: Fraud scoring in < 100ms while maintaining accuracy
- **Data engineering**: Handling millions of transactions, feature engineering at scale
- **Adversarial environment**: Fraudsters constantly evolve tactics, models must adapt
- **Regulatory compliance**: PSD2 SCA, PCI-DSS fraud prevention requirements

## Responsibilities

### Fraud Detection Models
- Real-time transaction risk scoring (0-1000 scale)
- Account takeover detection
- Payment fraud patterns (card testing, BIN attacks)
- Synthetic identity detection
- Merchant fraud and chargeback prediction

### Machine Learning Operations
- Model training pipeline (weekly retraining)
- A/B testing for model versions
- Feature store management (150+ features)
- Model performance monitoring (precision, recall, false positives)
- Explainability for fraud analysts (SHAP values, LIME)

### Risk Rules Engine
- Rules-based fraud checks (complement ML models)
- Velocity checks (transaction frequency, amounts)
- Geolocation risk scoring
- Device fingerprinting
- Behavioral biometrics analysis

### Integration & APIs
- **Synchronous API**: Real-time risk scoring (< 100ms SLA)
- **Asynchronous queue**: Batch risk assessment for lower-priority transactions
- Fraud analyst dashboard (manual review interface)
- Webhooks for high-risk alerts

## Technologies
- Python (scikit-learn, XGBoost, LightGBM, PyTorch)
- Feature store: Feast / Tecton
- Model registry: MLflow
- Real-time inference: TensorFlow Serving, Seldon Core
- Data pipeline: Apache Kafka, Spark Streaming
- Monitoring: Evidently AI, WhyLabs

## X-as-a-Service Offerings
Stream-aligned teams (Checkout, Payment Platform) consume fraud detection as a service:
- `/api/v1/risk/score` endpoint (synchronous, sub-100ms)
- Risk score interpretation: 0-200 (low risk), 201-600 (medium), 601-1000 (high)
- Fraud reason codes (e.g., "SUSPICIOUS_LOCATION", "VELOCITY_EXCEEDED")
- No ML expertise required by consuming teams

## Success Metrics
- **Model performance**: AUC-ROC > 0.95, Precision @ 5% FPR > 80%
- **Latency**: P99 < 100ms for risk scoring API
- **False positive rate**: < 2% (minimize good customer friction)
- **Fraud detection rate**: > 85% of fraudulent transactions caught
- **Revenue protection**: $2M+ prevented losses per year
- **Chargeback rate**: < 0.5% (well below Visa/Mastercard thresholds)

## Interaction with Stream-Aligned Teams
- **X-as-a-Service (default)**: Teams call API, no collaboration needed
- **Collaboration (rare)**: When fraud patterns specific to a new feature emerge
  - Example: New Buy Now Pay Later feature - collaborate 3 weeks to tune risk models
  - Once stable, return to X-as-a-Service mode

## Team Composition
- 2 Senior Data Scientists (ML model development)
- 2 ML Engineers (productionization, infrastructure)
- 1 Data Engineer (feature pipelines, data quality)
- 1 Fraud Analyst (domain expert, pattern recognition)
- 1 Engineering Manager

## Cognitive Load Management
High cognitive load is acceptable because:
- Team is **specialists** in this domain
- Domain is **narrowly scoped** (fraud/risk only)
- Clear boundaries - not responsible for:
  - ❌ Payment processing (Payment Platform Team)
  - ❌ Customer identity verification (Security & Compliance Team)
  - ❌ General analytics (Data Engineering Team)

## Future Evolution
- Exploring real-time feature computation (streaming features)
- Graph neural networks for network fraud detection
- Federated learning for cross-merchant fraud patterns
