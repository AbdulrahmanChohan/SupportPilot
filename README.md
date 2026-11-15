# SupportPilot: AI-Powered Customer Support Assistant

SupportPilot is a production-grade, AI-powered e-commerce customer support assistant. It combines dense semantic retrieval (FAISS), sparse keyword retrieval (BM25), and Reciprocal Rank Fusion (RRF 1:1) with Microsoft Azure AI Foundry (`gpt-5-mini` via Azure OpenAI Responses API) to deliver strictly grounded, hallucination-resistant answers with verified document attribution.

---

## Architecture Overview

```text
SupportPilot/
├── app/
│   ├── main.py                     # FastAPI application entry point, lifecycle, and middleware
│   ├── core/
│   │   ├── config.py               # Pydantic Settings & environment variables
│   │   └── logging.py              # Structured logging configuration
│   ├── retrieval/
│   │   ├── embeddings.py           # SentenceTransformer (all-MiniLM-L6-v2, L2 normalized)
│   │   ├── vector_store.py         # FAISS IndexFlatIP cosine similarity vector store
│   │   ├── bm25.py                 # BM25Okapi sparse search with regex tokenizer
│   │   └── hybrid_search.py        # Reciprocal Rank Fusion (RRF 1:1, k=60)
│   ├── services/
│   │   ├── azure_ai.py             # Azure AI Foundry Responses API client with backoff retry
│   │   ├── support_service.py      # Relevance gate, grounded prompt builder, agent runner
│   │   └── evaluation.py           # Recall@K, MRR, and multi-phrase concept verification
│   ├── tools/
│   │   ├── order_tools.py          # Synthetic order lookup service
│   │   └── refund_tools.py         # Thread-safe refund staging tool (Human Approval)
│   ├── api/
│   │   └── routes.py               # REST API endpoints (/api/chat, /api/orders, /api/refunds, /api/health)
│   └── models/
│       ├── requests.py             # Pydantic request models
│       └── responses.py            # Pydantic response models
├── data/
│   ├── policies/policies.json      # Canonical 25 e-commerce policies (DOC-001 to DOC-025)
│   └── orders/
│       ├── orders.json             # Synthetic orders database (1024, 1025, 1026)
│       └── refund_requests.json    # Persistent repository for staged refund records
├── evaluation/
│   ├── benchmark.py                # Standalone retrieval benchmark CLI
│   └── datasets/                   # Canonical V1, V2, V3 development, and Holdout datasets
├── tests/
│   ├── unit/                       # Fast, isolated offline unit tests
│   ├── integration/                # End-to-end component and FastAPI endpoint tests
│   └── benchmark/                  # Historical retrieval baseline regression tests
├── scripts/
│   ├── build_indices.py            # Pre-compute FAISS and BM25 index stores
│   └── run_dev_server.py           # Local development server launcher
├── notebooks/
│   └── SupportPilot_AI_Prototype_Repaired.ipynb # Original prototype (preserved untouched)
├── .env.example                    # Template for local credentials
├── pyproject.toml                  # Python package and dependency configuration
└── README.md
```

---

## Core Capabilities

1. **Canonical Knowledge Base:** 25 structured customer support policies covering Shipping, Returns, Refunds, Warranties, Products, Payments, and Orders.
2. **Dense Semantic Retrieval:** `all-MiniLM-L6-v2` dense embeddings with unit $L_2$ normalization and FAISS `IndexFlatIP` cosine similarity search.
3. **Sparse Keyword Search:** `BM25Okapi` search with lowercase regex tokenization.
4. **Hybrid Retrieval (RRF 1:1):** Fuses dense and sparse candidate pools ($k=60$) without cross-modality score calibration errors.
5. **Relevance Gate & Escalation:** Semantic confidence gate ($0.40$ cosine threshold) automatically escalating out-of-scope inquiries to human support.
6. **Financial Safety & Human-in-the-Loop:** Strict staging-only refund workflow (`status = "pending_human_approval"`). Absolutely no automated disbursement rails.
7. **Azure AI Foundry:** Direct integration with `gpt-5-mini` using the Azure OpenAI Responses API (`/openai/v1/responses`).
8. **100% Offline Capable:** Entire test suite, local retrieval, and offline support agent run without requiring an active Azure subscription.

---

## Quickstart Guide

### 1. Prerequisites
- Python 3.11+
- `uv` package manager (or standard virtualenv)

### 2. Environment Setup
```powershell
# Synchronize virtual environment with uv
uv sync

# Configure environment variables
Copy-Item .env.example .env
```

Edit `.env` to configure your Azure AI Foundry credentials (optional for offline testing):
```env
AZURE_AI_ENDPOINT=https://your-resource-name.services.ai.azure.com/openai/v1/responses
AZURE_AI_KEY=your-actual-api-key
AZURE_MODEL_NAME=gpt-5-mini
```

### 3. Build Retrieval Stores
```powershell
uv run python scripts/build_indices.py
```

### 4. Run Automated Test Suite
```powershell
uv run pytest
```

### 5. Run the Development Server
```powershell
uv run python scripts/run_dev_server.py
```
Access the interactive OpenAPI Swagger documentation at: `http://127.0.0.1:8000/docs`

---

## API Endpoints

- `GET /api/health`: System health status, indexed document count, and Azure configuration state.
- `POST /api/chat`: Primary customer support assistant endpoint. Accepts queries, automatically performs order lookup or grounded policy retrieval, and returns attributed sources.
- `GET /api/orders/{order_id}`: Looks up customer order status by ID (e.g. `1024`, `1025`, `1026`).
- `POST /api/refunds`: Stages a refund request for human supervisor approval with duplicate prevention.

---

## Evaluation Benchmark CLI

Reproduce the historical retrieval benchmark metrics across different evaluation datasets:

```powershell
# Canonical 10-query benchmark (K=3)
uv run python -m evaluation.benchmark --dataset canonical --k 3

# V3 55-query development benchmark (K=5)
uv run python -m evaluation.benchmark --dataset v3 --k 5

# 27-query holdout validation benchmark (K=5)
uv run python -m evaluation.benchmark --dataset holdout --k 5
```
