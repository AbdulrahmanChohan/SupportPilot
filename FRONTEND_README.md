# SupportPilot — Frontend Documentation & Developer Guide

SupportPilot features a React 19 / TypeScript / Vite single-page application integrating directly with the FastAPI backend. It provides an enterprise AI customer-support workspace featuring hybrid retrieval observability, grounded citation rendering, order tracking, and a human-in-the-loop refund approval queue.

---

## 1. Frontend Architecture & Technology Stack

* **Core Framework:** React 19 (`react`, `react-dom`)
* **Build Tool:** Vite 6 (`vite`) with TypeScript 7.0
* **Styling:** Tailwind CSS v3.4 + PostCSS with deep navy & indigo SaaS design system
* **Routing:** React Router v7 (`react-router-dom`)
* **Server State Management:** TanStack Query v5 (`@tanstack/react-query`)
* **HTTP Client:** Axios with structured error interceptors and timeout configuration
* **Icons:** Lucide React (`lucide-react`)
* **Visualizations:** Recharts for hybrid retrieval benchmark charts
* **Test Suite:** Vitest + React Testing Library + `@testing-library/jest-dom` + `jsdom`

---

## 2. Directory Structure

```text
frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── app/
│   │   ├── router.tsx              # React Router configuration
│   │   └── queryClient.ts          # TanStack Query client configuration
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx       # Main app layout with responsive sidebar & topbar
│   │   │   ├── Sidebar.tsx         # Navigation sidebar with Financial Safety badge
│   │   │   └── Topbar.tsx          # Real-time backend connectivity status & refresh
│   │   ├── ui/
│   │   │   ├── Badge.tsx           # Multi-variant status pill badges
│   │   │   ├── Button.tsx          # Accessible buttons with loading spinners
│   │   │   ├── Card.tsx            # Styled card containers
│   │   │   ├── Input.tsx           # Standardized form input fields
│   │   │   ├── Skeleton.tsx        # Pulsing skeleton loaders
│   │   │   └── Toast.tsx           # Lightweight toast notification context
│   │   ├── chat/
│   │   │   ├── ChatMessage.tsx     # Message bubbles (User vs Assistant)
│   │   │   ├── ChatInput.tsx       # Input with character counter & prompt chips
│   │   │   ├── EvidenceCard.tsx    # Grounded policy evidence cards with RRF/FAISS/BM25 scores
│   │   │   └── ToolBadge.tsx       # Displays tools executed by SupportAgent
│   │   ├── orders/
│   │   │   ├── OrderSearch.tsx     # Search bar with synthetic order presets (1024, 1025, 1026)
│   │   │   └── OrderCard.tsx       # Detailed order view with shipping tracking
│   │   ├── refunds/
│   │   │   ├── RefundForm.tsx      # Staging form with validation and safety notice
│   │   │   └── RefundTable.tsx     # Staged refunds table with pending_human_approval pill
│   │   └── dashboard/
│   │       ├── HealthCard.tsx      # Live backend status and indexing metrics
│   │       ├── RetrievalChart.tsx  # FAISS vs BM25 vs RRF benchmark chart
│   │       └── QuickActions.tsx    # Fast navigation shortcut cards
│   ├── pages/
│   │   ├── DashboardPage.tsx       # Overview dashboard with health & recent approvals
│   │   ├── ChatPage.tsx            # Grounded AI customer support chat interface
│   │   ├── OrdersPage.tsx          # Order tracking & lookup page
│   │   ├── RefundsPage.tsx         # Refund staging management page
│   │   └── SystemPage.tsx          # Hybrid retrieval architecture & 25-doc policy explorer
│   ├── services/
│   │   └── api/
│   │       ├── client.ts           # Centralized Axios client with error interceptors
│   │       ├── supportApi.ts       # Type-safe API calls for all backend endpoints
│   │       └── types.ts            # TypeScript interfaces matching backend models
│   ├── test/
│   │   ├── setup.ts                # Test setup with jsdom mocks
│   │   ├── App.test.tsx            # Navigation and brand shell tests
│   │   ├── Chat.test.tsx           # Chat submission, citations, and error handling tests
│   │   ├── Orders.test.tsx         # Order lookup and not-found state tests
│   │   └── Refunds.test.tsx        # Refund staging, validation, and safety invariant tests
│   ├── App.tsx                     # Root App wrapper
│   ├── main.tsx                    # React DOM entry point
│   └── index.css                   # Tailwind CSS base styles & custom scrollbars
├── .env.example                    # Environment variable template (VITE_API_BASE_URL)
├── .env                            # Local configuration (http://localhost:8000)
├── package.json                    # Dependencies & scripts
├── vite.config.ts                  # Vite + Vitest build configuration
├── tsconfig.json                   # Root TypeScript project references
├── tsconfig.app.json               # App-specific TypeScript configuration
├── tailwind.config.js              # Custom SaaS color palette and font definitions
└── postcss.config.js               # PostCSS plugins (tailwindcss, autoprefixer)
```

---

## 3. Backend API Integration & Contracts

The frontend communicates with the FastAPI server running on `http://localhost:8000`:

| Endpoint | Method | Request Payload | Response Model | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/api/health` | `GET` | _None_ | `HealthResponse` | System health, policy count, FAISS vectors, and BM25 index status. |
| `/api/chat` | `POST` | `ChatRequest` (`query`, `order_id`, `mock_mode`) | `ChatResponse` | Primary support chat endpoint; returns answer, decision, and sources. |
| `/api/orders/{id}` | `GET` | _Path param_ | `OrderResponse` | Looks up customer order by ID (e.g. 1024, 1025, 1026). |
| `/api/refunds` | `POST` | `RefundCreateRequest` (`order_id`, `reason`) | `RefundResponse` | Stages refund request for human supervisor approval. |
| `/api/refunds` | `GET` | _None_ | `List[StagedRefundRecord]` | Lists all staged refund requests in the approval queue. |
| `/api/policies` | `GET` | _None_ | `List[PolicyDocument]` | Lists all 25 policy documents indexed in the knowledge base. |

---

## 4. Financial Safety Operating Invariant

> [!IMPORTANT]
> **Strict Supervisor Workflow**: Refund requests are only ever staged with status `pending_human_approval`. The frontend and backend physically contain zero automated payment rails or disbursement execution actions.

---

## 5. Startup & Execution Instructions (PowerShell)

### Step 1: Start the FastAPI Backend
Open a PowerShell terminal in the project root:
```powershell
cd C:\llm_engineering\SupportPilot
uv run python scripts/run_dev_server.py
```
* Backend runs at: `http://localhost:8000`
* Swagger API docs: `http://localhost:8000/docs`
* Health check: `http://localhost:8000/api/health`

### Step 2: Start the React Development Server
Open a second PowerShell terminal in the project root:
```powershell
cd C:\llm_engineering\SupportPilot\frontend
npm run dev
```
* Frontend runs at: `http://localhost:5173`

---

## 6. Testing & Quality Assurance

### Run Frontend Tests (Vitest)
```powershell
cd C:\llm_engineering\SupportPilot\frontend
npm test
```
* **Result:** 11 passed (4 test files: `App.test.tsx`, `Chat.test.tsx`, `Orders.test.tsx`, `Refunds.test.tsx`).

### Run Production TypeScript Build
```powershell
cd C:\llm_engineering\SupportPilot\frontend
npm run build
```
* **Result:** Zero TypeScript errors; production bundle compiled into `dist/`.

### Run Backend Pytest Suite
```powershell
cd C:\llm_engineering\SupportPilot
uv run pytest
```
* **Result:** 40 passed across all unit, integration, and benchmark suites.
