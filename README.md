# Finance-Planning

AI-powered personal finance planning platform. Users submit their financial profile through a guided form and receive two personalized investment plans (Balanced and Growth), backed by rule-based analysis and historical market data, with Gemini AI explanations on a visual dashboard.

## Features

- User registration and login with JWT authentication
- Multi-step financial profile form (personal info, cash flow, assets, safety net, risk, goals)
- ML-driven portfolio allocation across Equity, Debt, Gold, and FD
- Two plan options: **Balanced Plan** and **Growth Plan**
- Expected return, volatility, and required monthly investment estimates
- AI-generated executive summary, pros/cons, actionable steps, and final recommendation
- Interactive dashboard with charts and plan comparison

## Architecture

```
Frontend (React)  -->  Backend (Express)  -->  ML Service (FastAPI)
                              |                         |
                         MongoDB                   CSV datasets
                              |
                         Gemini AI (explanation only)
```

| Service | Stack | Default Port |
|---------|-------|--------------|
| `frontend/` | React 19, Vite, Tailwind CSS 4, Framer Motion, Recharts | 5173 |
| `backend/` | Node.js, Express 5, Mongoose, JWT, `@google/genai` | 5000 |
| `ml-service/` | Python 3.10+, FastAPI, Pandas, Pydantic | 8000 |

The **ML service is the single source of truth** for all financial numbers (allocations, returns, volatility, risk scores, goal gap, required monthly investment). Gemini only explains the ML output and must not recalculate or contradict those values.

## Project Structure

```
Finance-Planning/
├── frontend/                              # React web app
│   └── src/
│       ├── pages/                         # Landing, Login, Register, Form, Dashboard
│       ├── components/                    # Layout, Navbar, UI primitives
│       └── services/                      # API client
├── backend/                               # REST API and orchestration
│   ├── controllers/                       # Auth, profile, plan handlers
│   ├── models/                            # User and Customer schemas
│   ├── routes/                            # API routes
│   ├── services/                          # ML and Gemini integrations
│   ├── middleware/                        # JWT auth
│   └── scripts/                           # Gemini explanation test script
├── ml-service/                            # Financial planning engine
│   ├── api.py                             # FastAPI entry point
│   ├── requirements.txt                   # Python dependencies
│   ├── src/                               # Customer & historical analysis, planning engine
│   ├── datasets/                          # Historical and sample customer CSV data
│   └── notebooks/                         # Exploratory analysis
└── financenodejs(temporary for testing)/  # Legacy prototype (optional)
```

## Prerequisites

- **Node.js** 18+
- **Python** 3.10+
- **MongoDB** (local or Atlas)
- **Gemini API key** from [Google AI Studio](https://aistudio.google.com/)

## Quick Start

Run all three services in separate terminals (MongoDB must be running first):

```bash
# Terminal 1 — ML Service
cd ml-service
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux
pip install -r requirements.txt
uvicorn api:app --reload --port 8000

# Terminal 2 — Backend
cd backend
npm install
npm run dev

# Terminal 3 — Frontend
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` and ensure the backend `.env` is configured (see below).

## Setup

### 1. ML Service

```bash
cd ml-service
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn api:app --reload --port 8000
```

Verify: open `http://localhost:8000/health`

### 2. Backend

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/finance-planning
JWT_SECRET=your_jwt_secret_here
Gemini_API_Key=your_gemini_api_key_here
ML_SERVICE_URL=http://localhost:8000
```

Install and run:

```bash
cd backend
npm install
npm run dev
```

Verify: open `http://localhost:5000`

Test Gemini explanations (requires a valid `Gemini_API_Key`):

```bash
cd backend
node scripts/test-gemini-explanation.js
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

The frontend calls the backend at `http://localhost:5000/api` (see `frontend/src/services/api.js`).

## User Flow

1. Register or log in (JWT stored in `localStorage`, 30-day expiry)
2. Complete the 6-step financial profile form
3. Frontend sends profile data to `POST /api/plans`
4. Backend forwards data to the ML service for plan generation
5. ML service returns two plans with allocations and projections
6. Gemini AI adds a readable analysis layer (without changing any numbers)
7. Dashboard displays plans, charts, and recommendations

Protected routes: `/form` and `/dashboard` require authentication.

**Note:** Generated plans are held in React state for the session. They are not persisted to the database after a page refresh.

## API Endpoints

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/me` | Get current user (protected) |

### Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/profile` | Save customer profile to MongoDB (protected) |

### Plans

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/plans` | Generate financial plan via ML + Gemini (protected) |

### ML Service

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/generate-plan` | Run planning engine |

## How the Planning Engine Works

1. **Customer analysis** — computes savings rate, debt-to-income ratio, net worth, risk tolerance, risk capacity, and goal gap
2. **Historical analysis** — derives asset returns and volatility from `historical_data.csv`
3. **Allocation** — builds base allocation from risk profile, then adjusts for time horizon and financial goal
4. **Plan generation** — produces two plans:

   | Plan | Type | Difference |
   |------|------|------------|
   | **Plan A** | Balanced | Base allocation from risk profile |
   | **Plan B** | Growth | +7% Equity, −7% FD |

   Each plan includes expected annual return, volatility, and required monthly investment.

5. **AI explanation** — Gemini summarizes ML output without changing the numbers

## Gemini AI Layer

Gemini (`gemini-3.5-flash`) receives the full ML result and returns structured JSON:

- `executive_summary`
- `plan_analysis` (pros/cons per plan)
- `actionable_steps`
- `final_recommendation`

Key rules enforced in the prompt:

- All ML numerical values are treated as immutable facts
- Gemini must not recalculate, modify, or contradict ML output
- Plan comparisons use exact ML values (e.g. if Plan B volatility > Plan A volatility, Gemini must say Plan B has higher volatility)
- Risk capacity, risk tolerance, and risk profile use ML-provided classifications only

Implementation: `backend/services/geminiService.js`

## Datasets

| File | Description |
|------|-------------|
| `ml-service/datasets/historical_data.csv` | Historical returns, volatility, and macro indicators (~500 rows) |
| `ml-service/datasets/customer_financial_profiles.csv` | Sample customer profiles for development (~500 rows) |

Jupyter notebooks in `ml-service/notebooks/` support exploratory analysis.

## Scripts

```bash
# Frontend
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # Run Oxlint
npm run preview  # Preview production build

# Backend
npm run dev      # Start with nodemon
npm start        # Start with node
node scripts/test-gemini-explanation.js   # Test Gemini explanation layer
```

## License

ISC
