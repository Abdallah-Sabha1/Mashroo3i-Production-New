# Mashroo3i — AI-Powered Business Idea Evaluation Platform

> An intelligent, full-stack platform that helps entrepreneurs in Amman, Jordan validate, evaluate, and plan their business ideas using AI and region-specific financial benchmarks.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Deployment](#deployment)

---

## Overview

**Mashroo3i** (مشروعي — Arabic for "My Project") is a web application designed to empower first-time and experienced entrepreneurs in Jordan. Users submit their business ideas and receive:

- **AI-generated evaluations** powered by Google Gemini 2.5 Flash — including SWOT analysis, risk assessment, novelty and market potential scores, and actionable recommendations.
- **Detailed financial projections** tailored to B2B or B2C business models, using real-world benchmarks specific to Amman's market.
- **Downloadable PDF business plans** ready for presentations or investor pitches.

The platform combines a modern React frontend with a robust ASP.NET Core backend, PostgreSQL database, and tight integration with Google's Gemini AI API.

---

## Key Features

### Business Idea Submission
Submit a comprehensive idea profile including:
- Problem statement and target audience
- Unique selling proposition (USP)
- Business type (B2B or B2C), sector, and Amman region
- Estimated budget

### AI-Powered Evaluation
- **Novelty Score** — How original the idea is relative to the market
- **Market Potential Score** — Revenue opportunity assessment
- **Overall Score** — Composite viability rating
- **Risk Level** — Low / Medium / High classification
- **SWOT Analysis** — AI-generated Strengths, Weaknesses, Opportunities, Threats
- **Red Flags** — Critical issues the user should address
- **Verdict & Recommendations** — Structured guidance for moving forward

### Financial Planning Calculator
- Supports separate **B2B** and **B2C** logic
- Calculates: monthly revenue, costs, profit, break-even months, ROI, gross margin, LTV, CAC, LTV:CAC ratio, ARR
- Uses **Amman-specific sector benchmarks** (loaded from a curated JSON dataset)
- Regional cost and AOV multipliers per Amman neighborhood
- Multi-product support with per-product pricing

### PDF Business Plan Export
- Professionally formatted, multi-page PDF
- Includes idea overview, AI evaluation results, financial projections, and charts
- Ready to share with investors or mentors

### User Dashboard
- View and manage all submitted ideas
- Track idea status: `submitted` → `analyzing` → `completed`
- View evaluation and financial plan per idea

### Authentication & Profiles
- JWT-based register/login
- User profile includes education level, years of experience, and business interest area

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend Framework** | ASP.NET Core 10.0 (C#) |
| **Database** | PostgreSQL 13+ |
| **ORM** | Entity Framework Core 10.0 |
| **Authentication** | JWT Bearer Tokens |
| **Password Hashing** | BCrypt.Net |
| **AI Integration** | Google Gemini 2.5 Flash API |
| **PDF Generation** | iTextSharp (LGPLv2) |
| **API Docs** | Swagger / OpenAPI |
| **Frontend Framework** | React 18.2 |
| **Build Tool** | Vite 5.0 |
| **Routing** | React Router v6 |
| **State Management** | Zustand |
| **HTTP Client** | Axios |
| **Styling** | Tailwind CSS 3 |
| **Animations** | Framer Motion |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Containerization** | Docker (multi-stage build) |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         Browser                              │
│              React 18 SPA (Vite + Tailwind)                  │
│  Pages: Landing, Dashboard, Submit, Evaluate, Financial, PDF │
└────────────────────────┬─────────────────────────────────────┘
                         │ HTTP/JSON (Axios + JWT)
┌────────────────────────▼─────────────────────────────────────┐
│               ASP.NET Core 10 REST API                       │
│                                                              │
│  Controllers: Auth · Ideas · Evaluation · Financial · PDF    │
│  Services:    GeminiAI · FinancialCalc · Benchmarks · PDF    │
│  Middleware:  JWT Auth · Rate Limiting · Error Handling       │
└──────────┬────────────────────────────────┬──────────────────┘
           │ EF Core                        │ HTTP
┌──────────▼──────────┐        ┌────────────▼──────────────────┐
│   PostgreSQL DB     │        │   Google Gemini 2.5 Flash API │
│ Users, Ideas,       │        │   (AI evaluation & analysis)  │
│ Evaluations,        │        └───────────────────────────────┘
│ FinancialPlans      │
└─────────────────────┘
```

---

## Getting Started

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/)
- [PostgreSQL 13+](https://www.postgresql.org/)
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)

---

### Backend Setup

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Restore NuGet packages
dotnet restore

# 3. Configure your environment (see Environment Variables section)
# Edit appsettings.Development.json or set environment variables

# 4. Apply database migrations (auto-runs on startup, or run manually)
dotnet ef database update

# 5. Run the development server
dotnet run
```

The API will be available at `https://localhost:44395` with Swagger UI at `/swagger`.

---

### Frontend Setup

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Create a local environment file
cp .env.example .env

# 4. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

### Environment Variables

#### Backend (`appsettings.json` or environment variables)

| Variable | Description | Example |
|---|---|---|
| `ConnectionStrings:DefaultConnection` | PostgreSQL connection string | `Host=localhost;Database=mashroo3i;Username=postgres;Password=pass` |
| `DATABASE_URL` | Alternative Railway-format DB URL | `postgresql://user:pass@host:5432/db` |
| `JwtSettings:SecretKey` | JWT signing key (min 32 chars) | `your-super-secret-key-here` |
| `JwtSettings:Issuer` | JWT issuer | `MashrooiAPI` |
| `JwtSettings:Audience` | JWT audience | `MashrooiClient` |
| `GeminiAI:ApiKey` | Google Gemini API key | `AIzaSy...` |
| `GeminiAI:Enabled` | Toggle AI features on/off | `true` |
| `FRONTEND_URL` | Allowed CORS origin | `https://yourdomain.com` |

#### Frontend (`.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `https://localhost:44395/api` |

---

## API Reference

Full interactive documentation is available via Swagger at `/swagger` when the backend is running.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive JWT token |
| `GET` | `/api/auth/me` | Get current user profile |
| `PUT` | `/api/auth/profile` | Update user profile |

### Business Ideas

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/ideas` | Get all ideas for current user |
| `GET` | `/api/ideas/{id}` | Get a specific idea |
| `POST` | `/api/ideas` | Submit a new idea |
| `PUT` | `/api/ideas/{id}` | Update an idea |
| `DELETE` | `/api/ideas/{id}` | Delete an idea |

### Evaluations

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/evaluation/{ideaId}` | Generate AI evaluation for an idea |
| `GET` | `/api/evaluation/{ideaId}` | Get saved evaluation |

> **Rate Limited:** Evaluation generation is limited to 5 requests per minute.

### Financial Plans

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/financial/{ideaId}` | Generate financial plan |
| `GET` | `/api/financial/{ideaId}` | Get saved financial plan |

### Business Plan PDF

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/businessplan/{ideaId}` | Download PDF business plan |

---

## Database Schema

```
Users
├── id (PK)
├── fullname
├── email (unique)
├── password_hash
├── education
├── experience
├── business_interest
└── created_at

BusinessIdeas
├── id (PK)
├── user_id (FK → Users, cascade delete)
├── title
├── description
├── problem_statement
├── target_audience
├── usp
├── business_type  (B2B | B2C)
├── sector
├── amman_region
├── business_type_reason
├── estimated_budget
├── status  (submitted | analyzing | completed)
└── created_at

Evaluations
├── id (PK)
├── idea_id (FK → BusinessIdeas, 1:1, cascade delete)
├── novelty_score
├── market_potential_score
├── overall_score
├── risk_level
├── swot_analysis (JSON)
├── recommendations
├── verdict
├── red_flags
└── generated_at

FinancialPlans
├── id (PK)
├── idea_id (FK → BusinessIdeas, 1:1, cascade delete)
├── initial_investment
├── monthly_revenue
├── monthly_costs
├── monthly_profit
├── break_even_months
├── roi_percentage
├── gross_margin_pct
├── ltv
├── cac
├── ltv_cac_ratio
├── break_even_units
├── arr
├── financial_summary
└── created_at
```

---

## Project Structure

```
Mashroo3i-Production/
├── backend/                         # ASP.NET Core API
│   ├── Controllers/
│   │   ├── AuthController.cs
│   │   ├── IdeasController.cs
│   │   ├── EvaluationController.cs
│   │   ├── FinancialController.cs
│   │   └── BusinessPlanController.cs
│   ├── Models/                      # EF Core entity models
│   ├── Services/
│   │   ├── GeminiAIService.cs       # Gemini API integration
│   │   ├── FinancialService.cs      # Financial calculations
│   │   ├── BenchmarkService.cs      # Amman sector benchmarks
│   │   └── PdfService.cs            # PDF generation
│   ├── Data/
│   │   ├── AppDbContext.cs
│   │   └── amman_benchmarks.json    # Amman-specific market data
│   ├── Migrations/
│   ├── Dockerfile
│   ├── Program.cs
│   └── appsettings.json
│
├── frontend/                        # React SPA
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── SubmitIdea.jsx
│   │   │   ├── Evaluation.jsx
│   │   │   ├── Financial.jsx
│   │   │   ├── BusinessPlan.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── components/
│   │   │   ├── layout/              # Navbar, Sidebar, Footer
│   │   │   ├── shared/              # IdeaCard, SWOT, Charts, Scores
│   │   │   └── ui/                  # Button, Card, Input, Modal, etc.
│   │   ├── store/
│   │   │   ├── authStore.js         # Zustand auth state
│   │   │   └── ideaStore.js         # Zustand ideas state
│   │   ├── services/
│   │   │   └── api.js               # Axios API client
│   │   └── utils/
│   │       └── helpers.js
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── Mashroo3i-Production.sln
└── README.md
```

---

## Deployment

### Docker (Backend)

```bash
# Build the image
docker build -t mashroo3i-api ./backend

# Run the container
docker run -p 8080:8080 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/mashroo3i" \
  -e JwtSettings__SecretKey="your-secret-key" \
  -e GeminiAI__ApiKey="your-gemini-key" \
  -e FRONTEND_URL="https://your-frontend.com" \
  mashroo3i-api
```

### Railway (Recommended)

The backend is configured to read Railway's `DATABASE_URL` environment variable automatically. Set the following environment variables in your Railway project:

- `DATABASE_URL` (auto-provided by Railway PostgreSQL plugin)
- `JwtSettings__SecretKey`
- `GeminiAI__ApiKey`
- `FRONTEND_URL`

### Frontend (Vercel / Netlify)

```bash
# Build for production
cd frontend
npm run build

# Output is in dist/ — deploy to any static host
```

Set `VITE_API_URL` to your deployed backend URL before building.

---

## Security Notes

- Passwords are hashed using **BCrypt** with a work factor of 12.
- All API endpoints (except `/auth/register` and `/auth/login`) require a valid **JWT Bearer token**.
- AI evaluation endpoints are **rate-limited** to 5 requests/minute per user.
- CORS is restricted to configured allowed origins.
- The Gemini API key is never exposed to the frontend.

---

## License

This project is proprietary software. All rights reserved.

---

*Built with passion for Jordanian entrepreneurs.*
