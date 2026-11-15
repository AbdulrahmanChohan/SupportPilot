# SupportPilot — Frontend Implementation Plan & Backend API Contract Audit

**Author:** Senior Frontend Engineer & SaaS Product Designer  
**Date:** November 15, 2026  
**Application:** SupportPilot AI Customer Support Dashboard  
**Status:** Approved for Implementation  

---

## 1. Backend API Contracts & Audit

### 1.1 Verified Existing Endpoints in `app/api/routes.py`

#### 1. `GET /api/health`
* **Purpose:** System health, retrieval indexing state, and model configuration.
* **Method:** `GET`
* **Headers:** `Accept: application/json`
* **Response Status:** `200 OK`
* **Response Schema (`HealthResponse`):**
```json
{
  "status": "healthy",
  "app_name": "SupportPilot",
  "version": "0.1.0",
  "policies_count": 25,
  "vectors_indexed": 25,
  "bm25_indexed": 25,
  "azure_configured": false
}
```

#### 2. `POST /api/chat`
* **Purpose:** Primary customer support chat orchestration (intent routing, hybrid retrieval, answer generation).
* **Method:** `POST`
* **Headers:** `Content-Type: application/json`
* **Request Body Schema (`ChatRequest`):**
```json
{
  "query": "What is the return window policy?",
  "order_id": null,
  "mock_mode": null
}
```
* **Constraints:** `query` is required (1 to 500 characters). `order_id` is optional string. `mock_mode` is optional boolean.
* **Response Status:** `200 OK`
* **Response Schema (`ChatResponse`):**
```json
{
  "query": "What is the return window policy?",
  "answer": "According to policy [DOC-002] (Return Window Policy), customers may return unopened items within 30 days.",
  "decision": "ANSWER_GENERATED",
  "sources": [
    {
      "doc_id": "DOC-002",
      "title": "Return Window Policy",
      "rrf_score": 0.0328,
      "vector_score": 0.8124,
      "bm25_score": 12.45
    }
  ],
  "tools_used": [
    "search_knowledge_base"
  ],
  "status": "COMPLETED"
}
```
* **Error Status:** `500 Internal Server Error` with `{"detail": "Error processing support request: ..."}`

#### 3. `GET /api/orders/{order_id}`
* **Purpose:** Lookup customer order status and shipment details.
* **Method:** `GET`
* **Path Parameter:** `order_id` (string, e.g. `"1024"`, `"1025"`, `"1026"`)
* **Response Status:** `200 OK`
* **Response Schema (`OrderResponse`):**
```json
{
  "success": true,
  "order": {
    "order_id": "1024",
    "customer_name": "Alex Morgan",
    "status": "in_transit",
    "payment_status": "paid",
    "shipping_method": "Standard",
    "tracking_number": "SP-DEMO-1024",
    "estimated_delivery": "3-5 business days",
    "items": [
      "Wireless Headphones"
    ],
    "total": 89.99,
    "currency": "USD"
  },
  "message": null
}
```
* **Error Status:** `404 Not Found` with `{"detail": "Order #XXXX not found in our records."}`

#### 4. `POST /api/refunds`
* **Purpose:** Stage a customer refund request for human supervisor approval.
* **Method:** `POST`
* **Headers:** `Content-Type: application/json`
* **Request Body Schema (`RefundCreateRequest`):**
```json
{
  "order_id": "1024",
  "reason": "Customer reported item damaged upon delivery."
}
```
* **Constraints:** `order_id` is required (string). `reason` is required (3 to 500 characters).
* **Response Status:** `201 Created`
* **Response Schema (`RefundResponse`):**
```json
{
  "success": true,
  "message": "Refund request REF-0001 created and awaiting human support approval.",
  "request": {
    "request_id": "REF-0001",
    "order_id": "1024",
    "customer_name": "Alex Morgan",
    "reason": "Customer reported item damaged upon delivery.",
    "amount": 89.99,
    "currency": "USD",
    "status": "pending_human_approval",
    "created_at": "2026-11-15 11:00:00"
  },
  "is_duplicate": false
}
```
* **Error Status:** `400 Bad Request` with `{"detail": "Order #XXXX not found. Cannot create refund request."}`

---

### 1.2 Identified Backend Contract Gaps & Proactive Proposals

| Gap ID | Desired UI Feature | Current Backend State | Proposed Non-Breaking Backend Addition |
| :--- | :--- | :--- | :--- |
| **GAP-01** | Refund Request Listing (`GET /api/refunds`) | `refund_service.get_all_staged_requests()` exists in `app/tools/refund_tools.py`, and `StagedRefundRecord` model exists, but no GET endpoint was registered in `routes.py`. | Add `@router.get("/refunds", response_model=List[StagedRefundRecord])` in `app/api/routes.py`. |
| **GAP-02** | Knowledge Base Policy Explorer (`GET /api/policies`) | 25 policy documents exist in `hybrid_retriever.vector_store.documents` and `data/policies/policies.json`, but no read endpoint existed. | Add `@router.get("/policies")` returning the 25 indexed policy documents (id, title, content). |
| **GAP-03** | Local Development CORS | `allow_origins=["*"]` with `allow_credentials=True` generates Starlette deprecation/warning issues. | Configure explicit local development origins: `["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"]`. |

> [!NOTE]
> All proposed additions are strictly additive, non-breaking, and preserve 100% of the existing 38 unit and integration tests.

---

## 2. Frontend Architecture & Technology Stack

### 2.1 Technology Decisions
* **Framework:** React 19 / Vite 6 with TypeScript (Strict mode).
* **Styling:** Tailwind CSS with a customized SaaS color palette (`slate-900`, `navy-950`, `indigo-600`, `emerald-600`, `amber-500`).
* **Routing:** `react-router-dom` v6 / v7.
* **Server State Management:** `@tanstack/react-query` v5 for cached, resilient data fetching and optimistic mutations.
* **HTTP Client:** `axios` with global base URL configuration, timeout, and response interceptor for unified error formatting.
* **Icons:** `lucide-react`.
* **Data Visualization:** `recharts` for retrieval score visualization and order status distribution.
* **Testing:** Vitest + React Testing Library + `@testing-library/jest-dom`.

---

## 3. Directory & Component Structure

```text
frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── app/
│   │   ├── router.tsx              # Application route definitions
│   │   └── queryClient.ts          # TanStack Query client configuration
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx       # Sidebar, Topbar, Main container
│   │   │   ├── Sidebar.tsx         # Responsive navigation sidebar
│   │   │   └── Topbar.tsx          # System status badge, breadcrumbs, mock toggle
│   │   ├── ui/
│   │   │   ├── Badge.tsx           # Status badges (in_transit, pending_human_approval, etc.)
│   │   │   ├── Button.tsx          # Accessible button with loading states
│   │   │   ├── Card.tsx            # Styled card containers
│   │   │   ├── Input.tsx           # Standardized form input
│   │   │   ├── Skeleton.tsx        # Loading placeholders
│   │   │   └── Toast.tsx           # Lightweight toast notification provider
│   │   ├── chat/
│   │   │   ├── ChatMessage.tsx     # Message bubbles (User vs Assistant)
│   │   │   ├── ChatInput.tsx       # Prompt input with character counter (max 500)
│   │   │   ├── EvidenceCard.tsx    # Retrieved policy evidence card with scores
│   │   │   └── ToolBadge.tsx       # Displays tools executed (e.g. get_order_status)
│   │   ├── orders/
│   │   │   ├── OrderSearch.tsx     # Quick search and synthetic ID preset buttons (1024, 1025, 1026)
│   │   │   └── OrderCard.tsx       # Detailed order view with shipment timeline
│   │   ├── refunds/
│   │   │   ├── RefundForm.tsx      # Staging form with validation and safety notice
│   │   │   └── RefundTable.tsx     # Staged refunds list with pending_human_approval pill
│   │   └── dashboard/
│   │       ├── HealthCard.tsx      # Live backend status and indexing metrics
│   │       ├── RetrievalChart.tsx  # FAISS vs BM25 vs RRF score distribution
│   │       └── QuickActions.tsx    # Navigation shortcuts
│   ├── pages/
│   │   ├── DashboardPage.tsx       # Overview dashboard
│   │   ├── ChatPage.tsx            # Full-featured AI support chat
│   │   ├── OrdersPage.tsx          # Order tracking & lookup
│   │   ├── RefundsPage.tsx         # Refund staging management
│   │   └── SystemPage.tsx          # System & retrieval knowledge base explorer
│   ├── services/
│   │   └── api/
│   │       ├── client.ts           # Central Axios instance with interceptors
│   │       ├── supportApi.ts       # Health, Chat, Orders, Refunds, Policies API calls
│   │       └── types.ts            # TypeScript interfaces matching backend models
│   ├── hooks/
│   │   ├── useHealth.ts            # Periodic health query
│   │   ├── useOrders.ts            # Order lookup mutation/query
│   │   └── useRefunds.ts           # Refund staging mutation and query
│   ├── styles/
│   │   └── index.css               # Tailwind CSS directives and custom typography
│   ├── test/
│   │   ├── setup.ts                # Vitest DOM matchers setup
│   │   ├── App.test.tsx            # App rendering and navigation tests
│   │   ├── Chat.test.tsx           # Chat submission and evidence display tests
│   │   ├── Orders.test.tsx         # Order search and error state tests
│   │   └── Refunds.test.tsx        # Refund staging form validation & safety invariant tests
│   ├── App.tsx                     # App root wrapper with QueryClientProvider & Toaster
│   └── main.tsx                    # React DOM entry point
├── .env.example
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── tailwind.config.js
└── postcss.config.js
```

---

## 4. UI Design Specification

* **Primary Palette:**
  * Background: Slate 50 (`#F8FAFC`) / Pure White (`#FFFFFF`)
  * Surface Borders: Slate 200 (`#E2E8F0`)
  * Deep Navy: Slate 900 (`#0F172A`) for typography and sidebar
  * Accent Indigo: Indigo 600 (`#4F46E5`) for primary actions and active tabs
  * Success Emerald: Emerald 600 (`#059669`) for healthy status and completed orders
  * Warning Amber: Amber 600 (`#D97706`) for `pending_human_approval`
* **Typography:** Inter / system font stack, high-contrast readable weights (400, 500, 600).
* **Empty & Error States:** Clear contextual illustrations/icons, explicit error descriptions, and retry buttons.
* **Financial Safety Banners:** Prominently display that refund requests are staged for human approval and that automated payment disbursement is physically disabled.

---

## 5. Execution Steps
1. Apply the additive, non-breaking backend endpoints (`GET /api/refunds`, `GET /api/policies`, and safe CORS) in `app/api/routes.py` and `app/main.py`.
2. Verify all 38 pytest tests continue to pass 100%.
3. Scaffold `frontend` with Vite, React, TypeScript, Tailwind CSS, Lucide React, Axios, TanStack Query, React Router, Recharts.
4. Implement all pages, components, and services matching exact backend contracts.
5. Author Vitest unit and component tests verifying navigation, chat interaction, order search, and refund safety.
6. Verify production build (`npm run build`) with zero TypeScript errors.
7. Author `FRONTEND_README.md` with explicit launch commands.
