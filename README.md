# AI-Powered Personalized Financial Planning System (Production Hybrid ML)

An enterprise-grade, explainable, and mathematically rigorous **Hybrid AI Financial Planning System**.

Upgraded from a deterministic rule-based allocation prototype into a genuine **production ML decision-support system** integrating:
1. **Calibrated Machine Learning (Multi-Class Suitability Classifier & Continuous Score Regressor)**
2. **Empirical Asset Covariance Portfolio Optimization ($\sigma_p = \sqrt{\mathbf{w}^T \mathbf{\Sigma} \mathbf{w}}$)**
3. **10,000-Run Vectorized Monte Carlo Stochastic Simulations**
4. **Resilient Gemini Generative AI Fiduciary Explanation Layer**
5. **Modern, Responsive Full-Stack Architecture (FastAPI + Node.js/Express + MongoDB + React/Vite)**

---

## 1. System Architecture & Separation of Concerns

```
                                  [ React Frontend (Vite + Tailwind) ]
                                                   │
                                      POST /api/plans (JWT Auth)
                                                   ▼
                                 [ Node.js / Express API Gateway ]
                                                   │
                                      POST /generate-plan
                                                   ▼
                       ┌────────────────────────────────────────────────────────┐
                       │               FastAPI ML & Analytics Engine             │
                       ├────────────────────────────────────────────────────────┤
                       │ 1. Input Validation & Out-Of-Distribution (OOD) Guard  │
                       │ 2. Feature Engineering & Ratio Computation             │
                       │ 3. Trained Hybrid ML Model (Calibrated RF + GBDT)      │
                       │    ├── Continuous Suitability Score (0 - 100)          │
                       │    ├── 5 Calibrated Risk Probabilities                 │
                       │    └── Explainability Engine (Top Driving Factors)     │
                       │ 4. Portfolio Engine (Covariance Volatility wᵀΣw)       │
                       │ 5. 10,000-Run Vectorized Monte Carlo Simulation        │
                       │    └── P10, P25, P50, P75, P90 + Goal Success %        │
                       └────────────────────────────────────────────────────────┘
                                                   │
                                        Authoritative JSON Output
                                                   ▼
                                 [ Gemini Generative AI Service ]
                              (Natural Language Explanation Layer)
                                                   │
                                                   ▼
                                [ Interactive User Dashboard ]
```

### Core Principle: Strict Separation of Responsibilities
* **Machine Learning**: Predicts behavioral and financial risk suitability with calibrated confidence and factor attribution.
* **Quantitative Financial Mathematics**: Determines asset allocation, covariance-based volatility, downside risk (VaR), and compound SIP requirements.
* **Monte Carlo Engine**: Simulates stochastic market paths to quantify uncertainty and empirical goal success probabilities.
* **Generative AI (Gemini)**: Translates authoritative quantitative results into natural-language executive summaries and action plans without inventing or modifying numbers.

---

## 2. Dataset & Target Labeling Strategy

### 2.1 Dataset Audit Findings
* **Customer Dataset**: 500 initial records + 2,500 augmented benchmark records (`customer_financial_profiles_v2.csv`). Zero missing values, zero duplicates, realistic log-normal financial distributions.
* **Historical Asset Dataset**: 500 multi-year macroeconomic cycles (`historical_data.csv`) providing empirical return means and asset covariance matrix $\mathbf{\Sigma}$ across Equity, Debt, Gold, and Fixed Deposits (FD).

### 2.2 Fiduciary Labeling Framework (Option B)
To prevent arbitrary target manufacture, ground-truth suitability is derived via a transparent, dual-pillar framework:
1. **Risk Capacity Score ($C \in [0, 100]$)**: Objective ability to absorb financial loss:
   * Savings Rate ($25\%$ weight)
   * Debt-to-Income / DTI ($20\%$ weight)
   * Liquidity & Emergency Coverage Months ($20\%$ weight)
   * Net Worth & Asset-to-Liability Ratio ($15\%$ weight)
   * Investment Horizon & Human Capital Age Recovery ($20\%$ weight)
2. **Risk Willingness Score ($W \in [0, 100]$)**: Behavioral risk tolerance responses, past investment experience, and financial goal orientation.
3. **Composite Suitability ($S$) & Fiduciary Guards**:
   $$S = 0.55 \times C + 0.45 \times W$$
   * If $\text{DTI} > 50\%$, suitability is conservatively bounded to Moderate ($S \le 50$) to protect cash-strapped borrowers.
   * If $\text{Time Horizon} \le 2\text{ yrs}$, suitability is capped at Moderately Conservative ($S \le 45$).

### 2.3 Calibrated 5 Risk Classes
* **Conservative**: $S \le 30$
* **Moderately Conservative**: $30 < S \le 48$
* **Moderate**: $48 < S \le 68$
* **Moderately Aggressive**: $68 < S \le 84$
* **Aggressive**: $S > 84$

---

## 3. Machine Learning Methodology & Zero Leakage Pipeline

### 3.1 Preprocessing Pipeline
* Scikit-Learn `Pipeline` and `ColumnTransformer` fitted **strictly on training folds only**.
* Domain financial ratios computed dynamically:
  * Savings rate: $\frac{\text{Monthly Savings}}{\text{Monthly Income}}$
  * Debt-to-Income: $\frac{\text{Debt EMI}}{\text{Monthly Income}}$
  * Emergency coverage: $\frac{\text{Cash Savings} + \text{Emergency Fund}}{\text{Monthly Expenses}}$
  * Net Worth & Liquid Net Worth
  * Age $\times$ Horizon interaction terms
* Categorical features encoded with `OneHotEncoder(handle_unknown='ignore')`.
* Numerical features scaled via `RobustScaler()`.

### 3.2 Candidate Algorithm Benchmarks (5-Fold Stratified CV)

| Model | Accuracy (CV) | Macro F1 (CV) | Weighted F1 (CV) | Latency |
| :--- | :---: | :---: | :---: | :---: |
| **Logistic Regression** | 72.15% (±0.031) | 0.6709 | 0.7237 | < 2 ms |
| **Extra Trees** | 77.50% (±0.015) | 0.7485 | 0.7763 | ~ 15 ms |
| **Random Forest (Tuned)** | **85.25% (±0.021)** | **0.7977** | **0.8528** | **~ 18 ms** |
| **Gradient Boosting** | 87.80% (±0.010) | 0.7792 | 0.8760 | ~ 25 ms |
| **HistGradientBoosting** | 87.80% (±0.007) | 0.8236 | 0.8776 | ~ 12 ms |
| **XGBoost** | 88.60% (±0.012) | 0.8143 | 0.8852 | ~ 20 ms |

### 3.3 Probability Calibration & Final Test Set Evaluation
The ensemble model was calibrated using `CalibratedClassifierCV(method='sigmoid')` and evaluated on the **completely isolated held-out test set (20% / 500 samples)**:
* **Test Accuracy**: **86.60%**
* **Macro F1 Score**: **0.7972**
* **Weighted F1 Score**: **0.8646**
* **Multiclass ROC-AUC (OvR)**: **0.9816**
* **Multi-class Brier Score**: **0.1741** (Excellently calibrated probability distribution)
* **Score Regressor $R^2$**: **0.9892** (MAE: **1.08 points**)

---

## 4. Quantitative Portfolio Optimization & Covariance Mathematics

Rather than using arbitrary static asset slices, asset allocations are continuously parameterized by the ML risk score $S \in [0, 100]$:

### 4.1 Covariance-Based Portfolio Volatility
$$\sigma_p = \sqrt{\mathbf{w}^T \mathbf{\Sigma} \mathbf{w}}$$
Where:
* $\mathbf{w} = [w_{\text{equity}}, w_{\text{debt}}, w_{\text{gold}}, w_{\text{fd}}]^T$ satisfying $\sum w_i = 100\%$
* $\mathbf{\Sigma}$ is the empirical covariance matrix of annual asset returns calculated from historical macroeconomic cycles:

$$\mathbf{\Sigma} = \begin{pmatrix}
65.99 & -0.50 & -1.28 & -0.49 \\
-0.50 & 1.34 & 0.29 & 0.78 \\
-1.28 & 0.29 & 16.18 & 0.64 \\
-0.49 & 0.78 & 0.64 & 0.98
\end{pmatrix}$$

### 4.2 Inflation-Adjusted Returns
$$r_{\text{real}} = \frac{1 + r_{\text{nominal}}}{1 + i_{\text{inflation}}} - 1$$

### 4.3 Systematic Investment Plan (SIP) Formulation
$$\text{SIP} = \frac{\text{Net Goal Gap} \times r_m}{(1 + r_m)^{12 \times \text{Years}} - 1}$$

---

## 5. Monte Carlo Simulation Engine (10,000 Runs)

Simulates 10,000 multi-year stochastic return paths governed by monthly geometric Brownian drift and diffusion:
$$r_m \sim \mathcal{N}\left(\frac{\mu_p - 0.5 \sigma_p^2}{12}, \frac{\sigma_p}{\sqrt{12}}\right)$$
$$V_m = V_{m-1} \times (1 + r_m) + \text{Monthly SIP}$$

### Outputs Generated:
* **Goal Achievement Probability**: $P(V_T \ge \text{Goal Amount})$
* **Shortfall Risk**: $100\% - P(V_T \ge \text{Goal})$
* **Percentile Distribution**: $P_{10}$ (Worst 10%), $P_{25}$ (Conservative), $P_{50}$ (Median Expected), $P_{75}$ (Optimistic), $P_{90}$ (Top 10%).
* **Real Purchasing Power**: Inflation-discounted percentile outcomes.

---

## 6. Installation & Execution Guide

### Prerequisites
* **Python**: 3.10+
* **Node.js**: v18+ / v20+
* **MongoDB**: Local or Atlas connection

### 6.1 Setup ML Service (FastAPI)
```bash
cd ml-service
# Activate virtual environment
.\venv\Scripts\Activate.ps1   # (Windows) or source venv/bin/activate (Linux/Mac)

# Install requirements
pip install -r requirements.txt

# Run model training & benchmark script (reproducible)
python training/train_risk_model.py

# Run test suite
pytest tests/

# Start FastAPI ML Service (Port 8000)
uvicorn api:app --reload --port 8000
```

### 6.2 Setup Backend (Node/Express)
```bash
cd backend
npm install
npm start   # Starts on Port 5000
```

### 6.3 Setup Frontend (React/Vite)
```bash
cd frontend
npm install
npm run dev # Starts on Port 5173
```

---

## 7. API Specification

### `POST /predict-risk` (FastAPI ML Service)
**Request Body:**
```json
{
  "age": 30,
  "occupation": "Software Engineer",
  "dependents": 0,
  "monthly_income": 120000,
  "monthly_expenses": 45000,
  "monthly_debt_payment": 10000,
  "cash_savings": 500000,
  "existing_investments": 1000000,
  "property_value": 0,
  "other_assets": 0,
  "total_assets": 1500000,
  "total_liabilities": 300000,
  "emergency_fund": 250000,
  "insurance_coverage": 7500000,
  "credit_score": 760,
  "risk_tolerance": "Moderate",
  "investment_experience": "Intermediate",
  "financial_goal": "Wealth Creation",
  "goal_amount": 10000000,
  "current_goal_savings": 1000000,
  "time_horizon_years": 12,
  "preferred_investment": "Equity MF"
}
```

**Response:**
```json
{
  "success": true,
  "risk_score": 68.4,
  "risk_profile": "Moderately Aggressive",
  "confidence": 0.864,
  "confidence_tier": "High",
  "probabilities": {
    "Conservative": 0.005,
    "Moderately Conservative": 0.041,
    "Moderate": 0.090,
    "Moderately Aggressive": 0.864,
    "Aggressive": 0.000
  },
  "top_factors": [
    "Long investment horizon of 12 years provides strong market recovery capacity.",
    "Strong savings rate of 54.2% indicates high monthly cash flow resilience.",
    "Low debt-to-income ratio (8.3%) minimizes fixed financial commitments.",
    "Robust liquid emergency cushion (16.7 months of expenses) protects long-term investments."
  ],
  "requires_abstention": false,
  "validation_warnings": [],
  "model_version": "risk-model-v1.0.0",
  "methodology": "Trained ML (Calibrated Random Forest + Gradient Boosting Regressor)"
}
```

---

## 8. Viva / Interview Defense Guide

### Q1: Why not predict asset returns or stock prices with Deep Learning?
**Answer:** Predicting financial asset prices from historical tabular data suffers from non-stationarity, low signal-to-noise ratio, and extreme overfitting. In fiduciary financial engineering, machine learning is best utilized to model **customer suitability and risk capacity**, while asset allocations and portfolio risks are determined through **empirical covariance optimization** and **stochastic Monte Carlo simulations**.

### Q2: How did you prevent Data Leakage during ML training?
**Answer:** We isolated a 20% stratified test set before any preprocessing. All categorical encoders, scalers, and custom ratio transformers were implemented via Scikit-Learn `Pipeline` and `ColumnTransformer`, fitting exclusively on the training folds inside 5-fold cross-validation.

### Q3: Why is probability calibration essential in financial suitability?
**Answer:** Raw classifier outputs often produce uncalibrated probabilities (e.g. overconfident tree leaf fractions). By applying Platt scaling (`CalibratedClassifierCV` sigmoid), the model's confidence corresponds to empirical accuracy: an 85% confidence rating means that ~85 out of 100 profiles with that score truly belong to that risk tier.

---

## 9. Disclaimer
This system is an educational and decision-support tool powered by machine learning, historical covariance statistics, and stochastic simulations. It is not intended as certified fiduciary investment advice.
