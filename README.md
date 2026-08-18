# Finance Planning

AI-powered personal finance planning platform that analyzes a customer's financial profile, generates two personalized investment plans, and uses Gemini AI to explain the results in simple language.

The application combines a **React frontend**, **Node.js/Express backend**, **Python FastAPI financial planning service**, **MongoDB**, historical financial data, and **Gemini AI**.

> **Important:** The Python planning service is the source of truth for financial calculations. Gemini is used only as an explanation layer and must not recalculate or modify ML-generated values.

## Features

- User registration and login with JWT authentication
- Multi-step financial profile form
- Customer financial analysis
- Risk tolerance, risk capacity, and final risk-profile analysis
- Savings rate, debt-to-income ratio, net worth, and goal-gap analysis
- Historical market and economic-data analysis
- Personalized portfolio allocation across Equity, Debt, Gold, and FD
- Two generated plans: **Balanced Plan** and **Growth Plan**
- Expected annual return and volatility estimates
- Required monthly investment calculation for the financial goal
- Gemini-generated executive summary, plan pros/cons, actionable steps, and recommendation
- Interactive dashboard with charts and plan comparison

## Architecture

```text
                    ┌──────────────────────┐
                    │   React Frontend     │
                    │   Vite + Tailwind    │
                    └──────────┬───────────┘
                               │ HTTP
                               ▼
                    ┌──────────────────────┐
                    │ Node.js + Express    │
                    │ Authentication/API   │
                    └───────┬────────┬─────┘
                            │        │
                 HTTP       │        │ Gemini API
                            ▼        ▼
                 ┌──────────────┐  ┌──────────────┐
                 │ FastAPI ML   │  │ Gemini AI    │
                 │ Planning     │  │ Explanation  │
                 │ Service      │  │ Layer        │
                 └──────┬───────┘  └──────────────┘
                        │
                        ▼
                 Historical CSV Data

                 Backend ───────► MongoDB
```

### Services

| Service | Technology | Default Port |
|---|---|---:|
| Frontend | React 19, Vite, Tailwind CSS 4, React Router, Recharts | `5173` |
| Backend | Node.js, Express 5, Mongoose, JWT, Axios, Gemini SDK | `5000` |
| ML Service | Python, FastAPI, Pandas, NumPy, scikit-learn, Pydantic | `8000` |
| Database | MongoDB | `27017` locally |

## Project Structure

```text
Finance-Planning/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── scripts/
│   ├── package.json
│   └── server.js
│
├── ml-service/
│   ├── api.py
│   ├── requirements.txt
│   ├── src/
│   │   ├── customer_analysis.py
│   │   ├── historical_analysis.py
│   │   └── planning_engine.py
│   ├── datasets/
│   └── notebooks/
│
└── README.md
```

## Prerequisites

Install the following before running the project:

- **Node.js 18+**
- **Python 3.10+**
- **MongoDB** (local MongoDB or MongoDB Atlas)
- **Git**
- A **Gemini API key** from Google AI Studio

## Clone the Repository

```bash
git clone https://github.com/shiva154200/Finance-Planning.git
cd Finance-Planning
```

## Environment Variables

Create a file named `.env` inside the `backend/` directory.

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/finance-planning
JWT_SECRET=your_jwt_secret_here
Gemini_API_Key=your_gemini_api_key_here
ML_SERVICE_URL=http://localhost:8000
```

### Environment variable description

| Variable | Purpose |
|---|---|
| `PORT` | Backend server port |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWT tokens |
| `Gemini_API_Key` | Gemini API authentication key |
| `ML_SERVICE_URL` | URL of the Python ML service |

**Never commit real API keys, JWT secrets, passwords, or other credentials to GitHub.**

## Running the Project Locally

The project contains three application services. Run each service in a separate terminal.

### 1. Start the ML Service

Open Terminal 1:

```bash
cd ml-service
python -m venv venv
```

#### Windows PowerShell

```powershell
.\venv\Scripts\Activate.ps1
```

#### Windows CMD

```cmd
venv\Scripts\activate
```

#### macOS / Linux

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start FastAPI:

```bash
python -m uvicorn api:app --reload --port 8000
```

The ML service should be available at:

```text
http://127.0.0.1:8000
```

Health check:

```text
http://127.0.0.1:8000/health
```

Expected response:

```json
{
  "status": "healthy"
}
```

### 2. Start the Backend

Open Terminal 2:

```bash
cd backend
npm install
npm run dev
```

The backend should run on:

```text
http://localhost:5000
```

Make sure `backend/.env` exists before starting the backend.

### 3. Start the Frontend

Open Terminal 3:

```bash
cd frontend
npm install
npm run dev
```

Open the URL shown by Vite, normally:

```text
http://localhost:5173
```

The frontend currently sends API requests to:

```text
http://localhost:5000/api
```

## Complete Startup Order

For a fresh machine, use this order:

```text
1. Start MongoDB
2. Start the ML service on port 8000
3. Start the Node.js backend on port 5000
4. Start the React frontend on port 5173
5. Open the frontend in the browser
```

## Application Flow

```text
User
  │
  ▼
React Frontend
  │
  │ customer financial profile
  ▼
Node.js Backend
  │
  ├──────────────► MongoDB
  │
  │ customer data
  ▼
FastAPI ML Service
  │
  ├── Customer Analysis
  ├── Risk Analysis
  ├── Historical Analysis
  ├── Portfolio Allocation
  ├── Return & Volatility Calculation
  └── Required Monthly Investment
  │
  ▼
Two Financial Plans
  │
  ▼
Node.js Backend
  │
  ▼
Gemini AI
  │
  └── Explanation only
  │
  ▼
React Dashboard
```

## How the Financial Planning Engine Works

### 1. Customer Analysis

The ML service analyzes the customer's financial profile and derives metrics such as:

- Monthly savings
- Savings rate
- Debt-to-income ratio
- Total assets
- Total liabilities
- Net worth
- Goal gap
- Risk-related metrics

### 2. Risk Analysis

The planning engine uses the customer's supplied financial and risk information to determine the appropriate risk profile.

The ML output can include:

- Risk tolerance score
- Risk capacity score
- Final risk score
- Final risk-profile classification
- Investment experience
- Preferred investment type

These values are calculated by the ML service and passed to the Gemini explanation layer as authoritative values.

### 3. Historical Analysis

Historical financial data is analyzed to derive information about:

- Equity returns
- Debt returns
- Gold returns
- FD returns
- Asset volatility
- Correlations
- Market and economic trends

The historical data is stored in CSV files under `ml-service/datasets/`.

### 4. Portfolio Allocation

The planning engine creates asset allocations across:

- Equity
- Debt
- Gold
- FD

The allocation is adjusted according to the customer's risk profile, financial goal, and time horizon.

### 5. Plan Generation

Two plans are generated:

| Plan | Description |
|---|---|
| **Balanced Plan** | More balanced allocation based on the customer's calculated risk profile |
| **Growth Plan** | Growth-oriented alternative with a higher Equity allocation relative to the Balanced Plan |

Each plan contains values such as:

- Asset allocation
- Expected annual return
- Expected volatility
- Required monthly investment
- Risk profile
- Financial goal
- Time horizon

### 6. Gemini Explanation Layer

Gemini receives the ML-generated result and converts it into an understandable explanation containing:

- Executive summary
- Plan analysis
- Pros and cons
- Actionable steps
- Final recommendation

Gemini **does not act as the financial calculation engine**.

The ML service remains the single source of truth for numerical values and classifications.

## API Endpoints

### Backend API

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive JWT |
| `GET` | `/api/auth/me` | Get authenticated user |
| `POST` | `/api/profile` | Save customer financial profile |
| `POST` | `/api/plans` | Generate financial plan |

Protected endpoints require a valid JWT token.

### ML Service API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | ML service status message |
| `GET` | `/health` | Health check |
| `POST` | `/generate-plan` | Generate financial plans from customer data |

## Testing the ML Service

After starting the ML service, verify that it is running:

```text
GET http://127.0.0.1:8000/health
```

Expected response:

```json
{
  "status": "healthy"
}
```

The main planning endpoint is:

```text
POST http://127.0.0.1:8000/generate-plan
```

It accepts the customer's financial information and returns the generated planning result.

## Data

The ML service uses historical and customer financial datasets during development.

Typical dataset contents include:

- Customer financial profiles
- Income and expenses
- Savings and debt information
- Assets and liabilities
- Risk information
- Financial goals
- Historical asset returns
- Historical volatility
- Inflation and interest rates
- Market and economic indicators

Do not add personal customer information or API credentials to the repository.

## Useful Commands

### Frontend

```bash
cd frontend
npm install
npm run dev
npm run build
npm run lint
npm run preview
```

### Backend

```bash
cd backend
npm install
npm run dev
npm start
```

### ML Service

```bash
cd ml-service
python -m venv venv
pip install -r requirements.txt
python -m uvicorn api:app --reload --port 8000
```

## Troubleshooting

### Frontend cannot connect to backend

Check that the backend is running on port `5000` and that the frontend API configuration points to:

```text
http://localhost:5000/api
```

### Backend cannot connect to ML service

Check that the ML service is running on port `8000` and that the backend `.env` contains:

```env
ML_SERVICE_URL=http://localhost:8000
```

### MongoDB connection error

Check that MongoDB is running and that `MONGO_URI` is correct.

For local MongoDB:

```env
MONGO_URI=mongodb://127.0.0.1:27017/finance-planning
```

### Gemini errors

Check that:

- `Gemini_API_Key` is present in `backend/.env`
- The API key is valid
- The Gemini API is available for the configured account/project

### Python dependency errors

Activate the virtual environment before installing dependencies:

```bash
cd ml-service
python -m venv venv
```

Then activate it and run:

```bash
pip install -r requirements.txt
```

## Development Notes

- The frontend is a Vite React application.
- The backend is an Express REST API.
- The ML service is a FastAPI application.
- MongoDB stores application/user profile data.
- Historical analysis uses CSV data.
- Gemini provides natural-language explanations of ML results.
- The generated plan is currently held in frontend state for the active session and is not intended to be a persistent investment-record system.

## Disclaimer

This project is intended for **educational, demonstration, and hackathon purposes**. Generated financial plans are algorithmic examples and should not be treated as guaranteed investment advice or guaranteed future returns.

## License

ISC
