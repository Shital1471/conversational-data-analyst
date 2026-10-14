# Conversational Data Analyst — Enterprise Banking Intelligence

A production-grade, full-stack banking analytics web application that enables business and compliance stakeholders to interrogate relational core banking data through natural language. Built with TypeScript, React, Vite, Node.js, Express, SQLite, and Recharts.

---

## 1. Project Overview

The **Conversational Data Analyst** transforms plain English business inquiries into verified, real-time relational analytics across multi-month core banking ledgers. Rather than generating hallucinated or cosmetic mock metrics, every response is backed by deterministic SQL execution against a relational SQLite database with strict foreign key constraints.

### Core Capabilities
- **Dual-View Architecture:** Seamlessly toggle between conversational **Chat Analyst** and a full-screen **Executive Dashboard** with live telemetry widgets.
- **Dark & Light Mode:** Executive dark theme and crisp enterprise light theme with automatic system preference detection and instant toggle.
- **Interactive Multi-View Charts:** Toggle dynamically between Bar, Area Trend with gradient fills, and Stacked Composed views right on every chart card.
- **Premium KPI Cards:** Glassmorphic cards with dynamic SVG trend sparklines, progress bars for conversion/rejection ratios, and hover elevations.
- **Smart Filters Bar:** Slice and dice queries by customer segment (Retail, SME, Corporate), region, and analytical focus with one-click report generation.
- **True CSV File Export & Clipboard Copy:** Direct `.csv` file generation with automatic timestamping, plus copy-to-clipboard with instant toast notifications.
- **Relational Data Foundation:** Queries across four connected banking datasets: `customers`, `branches`, `onboarding_applications`, and `transactions`.
- **Natural Language Query Engine:** Modular query pipeline with intent classification, parameter extraction, and audited SQL execution.
- **Executive Summaries & KPIs:** High-level narrative answers coupled with automated metric cards.
- **Auditable & Safe:** Full transparency with one-click audited SQL inspection, zero unrestricted raw AI SQL execution.

---

## 2. Architecture and Component Responsibilities

The system follows a decoupled client-server architecture with clear separation of concerns:

```
conversational-data-analyst/
├── client/                     # Frontend Single Page Application (SPA)
│   ├── src/
│   │   ├── components/         # Modular UI & visualization components
│   │   │   ├── Header.tsx      # System health, live DB status indicator, reset action
│   │   │   ├── Sidebar.tsx     # Database metrics overview, categorized prompt library
│   │   │   ├── ChatMessage.tsx # Message rendering (summary, KPIs, charts, tables)
│   │   │   ├── ChatInput.tsx   # Query submission, character limits, prompt suggestions
│   │   │   ├── ChartRenderer.tsx # Recharts visualizations (Bar, Line, Pie, Multi-bar)
│   │   │   ├── DataTable.tsx   # Interactive results table (sorting, search filter, formatted columns)
│   │   │   ├── KpiCards.tsx    # High-impact analytical metric cards
│   │   │   ├── PromptChips.tsx # Clickable analytical question pills
│   │   │   └── EmptyState.tsx  # Initial onboarding view with domain cards
│   │   ├── services/
│   │   │   └── api.ts          # Strongly-typed HTTP client for backend endpoints
│   │   ├── types/
│   │   │   └── index.ts        # TypeScript domain interfaces
│   │   ├── App.tsx             # Root layout & conversation state coordinator
│   │   └── main.tsx            # Application entry point
│   ├── vite.config.ts          # Vite build config with Tailwind v4 & API reverse proxy
│   └── package.json
│
├── server/                     # Backend API & Analytical Processing Pipeline
│   ├── src/
│   │   ├── config/
│   │   │   └── env.ts          # Centralized environment variable management
│   │   ├── db/
│   │   │   ├── connection.ts   # SQLite connection provider (WAL mode, foreign keys ON)
│   │   │   ├── schema.ts       # DDL schema definition with analytical indexes
│   │   │   ├── seedData.ts     # Deterministic PRNG seed data generator
│   │   │   └── seed.ts         # Idempotent database initialization and seed runner
│   │   ├── nlp/
│   │   │   ├── intents.ts      # Analytical intent catalog, regex patterns, and keywords
│   │   │   ├── queryTemplates.ts # Pre-audited parameterized SQL templates and formatters
│   │   │   └── interpreter.ts  # Deterministic NLP query interpretation engine
│   │   ├── routes/
│   │   │   ├── chat.ts         # POST /api/chat route handler
│   │   │   ├── health.ts       # GET /api/health endpoint
│   │   │   └── analytics.ts    # GET /api/analytics/overview endpoint
│   │   ├── validators/
│   │   │   └── chatValidator.ts # Zod request validation schemas
│   │   ├── types/
│   │   │   └── index.ts        # TypeScript models, requests, and response envelopes
│   │   ├── app.ts              # Express application configuration and security middleware
│   │   └── server.ts           # Server bootstrap and lifecycle management
│   ├── tests/
│   │   ├── interpreter.test.ts # Unit tests for intent classification and query logic
│   │   └── chatApi.test.ts     # Integration tests with Supertest
│   ├── vitest.config.ts        # Vitest configuration
│   └── package.json
│
├── .env.example                # Environment variables template
├── .gitignore                  # Git exclusions for dependencies, builds, and SQLite files
├── package.json                # Root workspace orchestrator scripts
└── README.md
```

### Component Responsibilities
- **Frontend (`client/`):** Manages user interactions, conversation history, loading/error states, responsive layout, Recharts data mapping, and CSV exports.
- **Backend (`server/`):**
  - **Validation Layer:** Zod schemas sanitize incoming questions, rejecting empty or oversized inputs (>500 chars).
  - **NLP Interpreter:** Normalizes queries and matches them against the business intent catalog using deterministic pattern matching and semantic scoring.
  - **Query Engine:** Binds parameters into reviewed, pre-audited SQL templates with parameterization.
  - **Analytics Formatter:** Transforms SQLite row sets into natural language summaries, KPI calculations, and chart configuration payloads.
  - **Database Layer:** Operates SQLite via Node's native `node:sqlite` with Write-Ahead Logging (WAL) and foreign key constraints.

---

## 3. Technology Stack

- **Frontend:**
  - React 19
  - TypeScript 5.7+
  - Vite 8
  - Tailwind CSS v4 & Lucide React
  - Recharts (Data Visualizations)
- **Backend:**
  - Node.js (v22.5+ / v24+ with native `node:sqlite`)
  - Express 4
  - TypeScript
  - Zod (Runtime input validation)
  - CORS & Security headers (`nosniff`, `DENY`, `XSS-Protection`)
- **Database:**
  - SQLite 3 (native synchronous engine via `node:sqlite`)
- **Testing:**
  - Vitest 3
  - Supertest 7
- **Tooling & Orchestration:**
  - `tsx` (TypeScript execution and hot reloading)
  - `concurrently` (unified monorepo orchestration)

---

## 4. Prerequisites

- **Node.js:** v22.5.0 or newer (v24.x recommended for built-in `node:sqlite`).
- **npm:** v10.x or newer.
- **Operating System:** Windows, macOS, or Linux.

---

## 5. Installation and Setup

Clone the repository and install root and package dependencies:

```bash
# 1. Clone repository
git clone <repo-url>
cd conversational-data-analyst

# 2. Install root dependencies
npm install

# 3. Install server dependencies
cd server
npm install

# 4. Install client dependencies
cd ../client
npm install

# 5. Return to project root
cd ..
```

---

## 6. Environment Configuration

Copy `.env.example` to create your local `.env` if customization is needed:

```bash
cp .env.example .env
```

Default configuration variables:

```ini
# Server Configuration
PORT=4000
NODE_ENV=development

# Database Configuration
DATABASE_URL=./banking.db

# Client Configuration
VITE_API_URL=http://localhost:4000/api
```

---

## 7. Database Schema and Seed Instructions

The relational database enforces primary and foreign key constraints across four distinct tables:

```
[ customers ] 1 ──< [ onboarding_applications ] >── 1 [ branches ]
      1
      │
      └──< [ transactions ] >── 1 [ branches ]
```

### Table Definitions

1. **`customers`**
   - `id`: INTEGER PRIMARY KEY AUTOINCREMENT
   - `customer_name`: TEXT NOT NULL
   - `customer_segment`: TEXT NOT NULL CHECK(`customer_segment` IN ('Retail', 'SME', 'Corporate'))
   - `created_at`: TEXT NOT NULL (YYYY-MM-DD)

2. **`branches`**
   - `id`: INTEGER PRIMARY KEY AUTOINCREMENT
   - `branch_name`: TEXT NOT NULL UNIQUE
   - `city`: TEXT NOT NULL
   - `region`: TEXT NOT NULL

3. **`onboarding_applications`**
   - `id`: INTEGER PRIMARY KEY AUTOINCREMENT
   - `customer_id`: INTEGER NOT NULL REFERENCES `customers(id)` ON DELETE CASCADE
   - `branch_id`: INTEGER NOT NULL REFERENCES `branches(id)` ON DELETE CASCADE
   - `application_date`: TEXT NOT NULL (YYYY-MM-DD)
   - `status`: TEXT NOT NULL CHECK(`status` IN ('Approved', 'Rejected', 'Pending'))
   - `rejection_reason`: TEXT NULL

4. **`transactions`**
   - `id`: INTEGER PRIMARY KEY AUTOINCREMENT
   - `customer_id`: INTEGER NOT NULL REFERENCES `customers(id)` ON DELETE CASCADE
   - `branch_id`: INTEGER NOT NULL REFERENCES `branches(id)` ON DELETE CASCADE
   - `transaction_date`: TEXT NOT NULL (YYYY-MM-DD)
   - `amount`: REAL NOT NULL
   - `transaction_type`: TEXT NOT NULL CHECK(`transaction_type` IN ('Deposit', 'Withdrawal', 'Transfer', 'Payment'))
   - `currency`: TEXT NOT NULL DEFAULT 'USD'

### Seed Script & Idempotency

The seed script (`server/src/db/seed.ts`) generates reproducible data using a seeded pseudo-random number generator (Mulberry32 PRNG):
- **65 Customers:** 40 Retail, 15 SME businesses, and 10 Corporate holdings with realistic commercial names.
- **10 Branches:** Distributed across Northeast, Southeast, Midwest, West, and Southwest regions.
- **180 Onboarding Applications:** Spanning May 2024 through October 2024 with realistic branch-specific underwriting rejection variances.
- **450 Transactions:** Spanning across account tiers ranging from personal deposits ($50 - $4,500) to corporate wire settlements ($50,000 - $750,000).

To initialize or re-seed the database:

```bash
# Run from root:
npm run seed
```

*Note: The seed script is completely idempotent. Running it multiple times safely refreshes seed data without creating orphaned or duplicate rows.*

---

## 8. Commands to Run Frontend, Backend, and Tests

### Run Both Concurrently (Development Mode)
```bash
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4000`

### Run Individually
```bash
# Backend only:
npm run dev:server

# Frontend only:
npm run dev:client
```

### Run Automated Tests
```bash
npm run test
```
Executes 19 Vitest unit and Supertest integration tests covering NLP intent matching, SQL execution, error handling, validation, and SQL injection prevention.

### Build Production Bundles
```bash
npm run build
```
Typechecks and compiles both backend (`tsc`) and frontend (`vite build`).

---

## 9. Example Supported Questions

The conversational interface supports natural language queries across the core banking domains:

| Analytical Category | Example Questions | Visualization |
| :--- | :--- | :--- |
| **Segment Onboarding** | *"Show monthly onboarding applications by customer segment"* | Multi-series Bar Chart |
| **Branch Risk & Rejections** | *"Which branches have the highest rejection rate?"* | Descending Bar Chart |
| **Segment Comparison** | *"Compare retail and SME onboarding volumes"* | Grouped Bar Chart |
| **High-Net-Worth Accounts** | *"Show the top five customers by transaction value"* | Ranked Bar Chart |
| **Turnover & Volume** | *"What is the total transaction value this month?"* | Summary KPIs & Breakdown |
| **Pipeline Status** | *"Show application status distribution"* | Donut / Pie Chart |
| **Monetary Trends** | *"Show transaction value over time"* | Timeline Trend Line Chart |
| **Branch Operations** | *"Show application volume by branch"* | Stacked Intake Bar Chart |
| **Approval Ratios** | *"Show the application approval rate by branch"* | Branch Approval Bar Chart |

*Any unsupported or ambiguous inquiry (e.g., "What is the weather in Paris?") triggers a clarification response with clickable suggested prompts.*

---

## 10. Security Approach and Query-Safety Design

Financial enterprise systems require zero-trust database access. The following controls are enforced:

1. **No Unrestricted AI-Generated SQL:** Raw user input is **never** evaluated into ad-hoc SQL strings.
2. **Intent-Bound Templates:** Natural language queries map to a whitelist of pre-audited, vetted SQL templates.
3. **Strict Parameterization:** Any dynamic inputs (such as numeric limits or date ranges) are bound via SQLite positional parameters (`?`).
4. **Input Length & Structure Validation:** All incoming payloads are validated via Zod (`min(2)`, `max(500)` characters, whitespace trimmed).
5. **Enforced Foreign Keys:** Enabled via `PRAGMA foreign_keys = ON;` on every database connection.
6. **Defensive Error Handling:** Database exceptions and internal stack traces are captured server-side and logged safely. Generic, friendly messages are returned to the client to avoid information leakage.
7. **Security Middleware:** Custom HTTP response headers enforce `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, and CORS controls.

---

## 11. Assumptions

- **Analytical Scope:** Focused on onboarding applications, customer accounts, branch locations, and transaction records.
- **Reporting Period:** Seed data models chronological operations across May 2024 – October 2024.
- **Mocked AI Interpreter:** The current version uses a deterministic natural language matcher rather than an external paid LLM API key, ensuring offline operation and fast test execution.
- **Single Currency Model:** Amounts are denominated in USD for uniform aggregation.

---

## 12. Completed Functionality

- [x] Full-stack TypeScript application with React, Vite, Node.js, and Express.
- [x] Relational SQLite database with 4 distinct, indexed tables (`customers`, `branches`, `onboarding_applications`, `transactions`).
- [x] Idempotent seed script with 65 customers, 10 branches, 180 applications, and 450 transactions.
- [x] Deterministic mock AI query processing pipeline supporting 8+ distinct business intents.
- [x] Interactive Recharts visualizations (Bar, Line, Pie, and Multi-series charts).
- [x] Executive natural-language summaries and KPI cards for every answer.
- [x] Data table with sorting, search filter, and column formatting (currency, percentages, status badges).
- [x] One-click "Copy Answer" and "Copy CSV" functionality.
- [x] Transparent "Inspect Audited SQL Template" expander.
- [x] Clickable prompt chips and responsive sidebar with live database statistics.
- [x] Graceful unsupported question handling with follow-up suggestions.
- [x] 19 automated tests (Vitest + Supertest) covering validation, query logic, and security.

---

## 13. Known Limitations

- **Complex Multi-Condition Filtering:** Arbitrary multi-predicate cross-filtering (e.g. *"Show rejected SME customers in Chicago with deposits over $50k in July"*) requires extending the query builder with dynamic AST validation.
- **Single-Turn Context:** The engine processes each question independently; multi-turn follow-ups (e.g. *"Now filter that by Chicago"*) require conversational memory state.
- **Single-Node SQLite:** For multi-instance distributed deployments, a centralized relational database (e.g. PostgreSQL) would be required.

---

## 14. How the Solution Could Be Productionised

To scale this prototype to a multi-tenant enterprise banking platform:

1. **LLM Integration via Guardrailed Structured Outputs:**
   - Integrate an LLM (e.g. Gemini 1.5 Pro or GPT-4o) using **JSON Schema / Structured Outputs**.
   - Instead of asking the LLM to write raw SQL, prompt it to output a validated JSON structure:
     ```json
     {
       "intent": "branch_rejection_rate",
       "parameters": { "region": "Midwest", "minApplications": 10 }
     }
     ```
   - The backend validates the JSON with Zod and binds it into the reviewed query template. This eliminates SQL injection risks while leveraging LLM flexibility.

2. **Database Scaling & Connection Pooling:**
   - Migrate from SQLite to PostgreSQL with read replicas and connection pooling (PgBouncer).
   - Implement database caching (Redis) for high-frequency aggregate questions.

3. **Authentication & Role-Based Access Control (RBAC):**
   - Integrate OAuth2 / OIDC (e.g., Okta, Auth0, Keycloak).
   - Enforce row-level security (RLS) so branch managers only view analytics for their authorized regions.

4. **Audit Logging & Compliance:**
   - Write every analytical inquiry, matched intent, and user ID to an immutable audit ledger for compliance with SOX and banking data governance frameworks.

---

## 15. AI Development Tools Used

- **Google Antigravity IDE (Gemini 3.8 Flash):** Used as an agentic pair-programming assistant to scaffold the workspace, generate the deterministic PRNG seed dataset, author the TypeScript types, implement the Recharts components, configure Tailwind CSS v4, and draft comprehensive automated test suites.
- **Vite & Oxlint:** Used for fast compilation and type verification.
