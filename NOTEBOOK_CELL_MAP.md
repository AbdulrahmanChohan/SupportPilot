# SupportPilot: Notebook Cell Mapping & Migration Architecture

**Date:** 2026-11-15  
**Architect:** Senior Python Engineer & Software Architect  
**Project:** SupportPilot — AI-Powered E-Commerce Customer Support Assistant  
**Source Notebook:** `notebooks/SupportPilot_AI_Prototype_Repaired.ipynb` (74 Cells)  
**Target Architecture:** Modular Production-Ready FastAPI / Python Application  

---

## 1. Target Directory & Module Structure

```text
SupportPilot/
│
├── app/
│   ├── __init__.py
│   ├── main.py                     # FastAPI entry point, lifespan, CORS, middleware
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py               # Pydantic Settings, environment variables, validation
│   │   └── logging.py              # Structured logging and request tracing
│   ├── retrieval/
│   │   ├── __init__.py
│   │   ├── embeddings.py           # SentenceTransformer wrapper, normalization
│   │   ├── vector_store.py         # FAISS IndexFlatIP store & search
│   │   ├── bm25.py                 # Regex tokenizer & BM25Okapi index
│   │   └── hybrid_search.py        # Reciprocal Rank Fusion (RRF 1:1) engine
│   ├── services/
│   │   ├── __init__.py
│   │   ├── azure_ai.py             # Azure AI Foundry client, Responses API, retry, token metrics
│   │   ├── support_service.py      # Relevance gate, prompt builder, grounded answer generator, agent coordinator
│   │   └── evaluation.py           # Concept check evaluator, Recall@K, MRR metrics
│   ├── tools/
│   │   ├── __init__.py
│   │   ├── order_tools.py          # Order status lookup and verification
│   │   └── refund_tools.py         # Staged refund request creator with duplicate prevention
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes.py               # REST API endpoints (/chat, /orders/{id}, /refunds, /health)
│   └── models/
│       ├── __init__.py
│       ├── requests.py             # Pydantic input models (ChatRequest, RefundCreateRequest)
│       └── responses.py            # Pydantic response models (ChatResponse, OrderResponse, RefundResponse)
│
├── data/
│   ├── policies/
│   │   └── policies.json           # Canonical 25 policy documents (DOC-001 to DOC-025)
│   └── orders/
│       ├── orders.json             # Synthetic orders database (1024, 1025, 1026)
│       └── refund_requests.json    # Persistent repository for staged refund records
│
├── evaluation/
│   ├── __init__.py
│   ├── benchmark.py                # Standalone retrieval & generation benchmark CLI
│   └── datasets/
│       ├── canonical_eval.json     # 10-query Canonical V1 evaluation set
│       ├── dev_eval_v3.json        # 28-query V3 development evaluation set
│       └── holdout_eval.json       # 27-query Holdout validation set
│
├── tests/
│   ├── __init__.py
│   ├── conftest.py                 # Pytest fixtures (sample policies, mock clients, test orders)
│   ├── unit/
│   │   ├── test_embeddings.py
│   │   ├── test_vector_store.py
│   │   ├── test_bm25.py
│   │   ├── test_hybrid_search.py
│   │   ├── test_relevance_gate.py
│   │   ├── test_order_tools.py
│   │   ├── test_refund_tools.py
│   │   └── test_azure_parser.py
│   └── integration/
│       ├── test_agent_pipeline.py
│       └── test_api_routes.py
│
├── scripts/
│   ├── build_indices.py            # Pre-compute embeddings and vector index cache
│   └── run_dev_server.py           # Local development launcher
│
├── notebooks/
│   └── SupportPilot_AI_Prototype_Repaired.ipynb  # Original notebook (preserved untouched)
│
├── .env.example
├── .gitignore
├── pyproject.toml
└── README.md
```

---

## 2. Comprehensive Notebook Cell Mapping Table

Every notebook cell is mapped to its target destination, action, and architectural transformation rules:

| Cell Index | Cell Type | Original Section / Description | Target Destination | Action | Transformation & Refactoring Notes |
|---|---|---|---|---|---|
| **0** | Markdown | Project Title & Architecture Overview | `README.md` | Migrate to Docs | Incorporate architectural summary into project README. |
| **1** | Markdown | Section 2: Installation and Imports | `README.md` | Migrate to Docs | Document dependency management via `uv sync`. |
| **2** | Code | `!pip install sentence-transformers...` | `pyproject.toml` | Deprecate Cell | Dependencies already managed cleanly via `uv` in `pyproject.toml`. |
| **3** | Code | Standard Library & Core Imports | Various `__init__.py` & modules | Refactor | Distribute imports into respective modular components. |
| **4** | Markdown | Section 3: Configuration & Secrets | `README.md` | Migrate to Docs | Document `.env` configuration instructions. |
| **5** | Code | Configuration & Key Resolution (`get_azure_api_key`) | `app/core/config.py` | Refactor & Secure | Replace Colab `userdata` with `pydantic-settings`. Move endpoint to `.env`. |
| **6** | Markdown | Section 4: Canonical Knowledge Base | `data/policies/README.md` | Migrate to Docs | Document 25 policy schema and category distribution. |
| **7** | Code | Canonical 25 Policies (`canonical_documents`) | `data/policies/policies.json` | Externalize to Data | Separate raw data from code; load via `app/retrieval/vector_store.py`. |
| **8** | Markdown | Section 5: Dense Embedding Generation | `app/retrieval/embeddings.py` | Migrate to Docs | Document `all-MiniLM-L6-v2` embedding properties. |
| **9** | Code | SentenceTransformer Initialization & Encoding | `app/retrieval/embeddings.py` | Refactor to Class | Encapsulate as `EmbeddingEngine` with singleton caching and unit normalization. |
| **10** | Markdown | Section 6: FAISS Vector Search | `app/retrieval/vector_store.py` | Migrate to Docs | Document IndexFlatIP cosine similarity mechanics. |
| **11** | Code | FAISS Indexing & `get_vector_results()` | `app/retrieval/vector_store.py` | Refactor to Class | Encapsulate as `VectorStore` with `build()`, `search()`, and index persistence. |
| **12** | Markdown | Section 7: BM25 Sparse Keyword Search | `app/retrieval/bm25.py` | Migrate to Docs | Document regex tokenization and BM25Okapi scoring. |
| **13** | Code | `tokenize_text()` & `get_bm25_results()` | `app/retrieval/bm25.py` | Refactor to Class | Encapsulate as `BM25Store` with `build()`, `tokenize()`, and `search()`. |
| **14** | Markdown | Section 8: Hybrid Retrieval & RRF | `app/retrieval/hybrid_search.py`| Migrate to Docs | Document Reciprocal Rank Fusion ($k=60$) formula and fusion logic. |
| **15** | Code | `compute_rrf()` & `hybrid_search()` | `app/retrieval/hybrid_search.py`| Refactor to Class | Encapsulate as `HybridRetriever` coordinating VectorStore and BM25Store. |
| **16** | Markdown | Section 9: Retrieval Evaluation | `evaluation/README.md` | Migrate to Docs | Document Recall@K and MRR definitions. |
| **17** | Code | Canonical V1 Dataset & `evaluate_retrieval()` | `evaluation/benchmark.py` & `evaluation/datasets/canonical_eval.json` | Refactor to CLI | Externalize 10 queries to JSON; implement standard benchmark runner. |
| **18** | Markdown | Section 10: Azure AI Foundry Integration | `app/services/azure_ai.py` | Refactor to Docs | Document Responses API client, sanitize endpoints. |
| **19** | Code | `call_azure()`, `extract_text_from_responses_api()` | `app/services/azure_ai.py` | Refactor to Class | Encapsulate as `AzureAIClient` with backoff retry, clean headers, thread-safe metrics. |
| **20** | Markdown | Section 11: Relevance Gate & Escalation | `app/services/support_service.py`| Migrate to Docs | Document semantic confidence gate ($0.40$ threshold). |
| **21** | Code | `check_retrieval_relevance()` | `app/services/support_service.py`| Refactor | Implement as `RelevanceGate` preserving vector threshold and hybrid evidence. |
| **22** | Markdown | Section 12: Grounded Answer Generation | `app/services/support_service.py`| Migrate to Docs | Document prompt structure and attribution constraints. |
| **23** | Code | `build_grounded_prompt()`, `generate_support_answer()` | `app/services/support_service.py`| Refactor & Secure | Replace canned mock strings with safe deterministic stubs; enforce XML query sandbox. |
| **24** | Markdown | Section 13: Local Support Tools & Orders | `app/tools/README.md` | Migrate to Docs | Document synthetic order schema and staging workflow. |
| **25** | Code | `orders_db`, `get_order_status()`, `create_refund_request()` | `app/tools/order_tools.py`, `app/tools/refund_tools.py`, `data/orders/` | Externalize & Refactor | Separate orders to `data/orders/orders.json`; refund repository with file locking. |
| **26** | Markdown | Section 14: Support Agent & Orchestration | `app/services/support_service.py`| Migrate to Docs | Document intent routing and tool execution. |
| **27** | Code | `run_support_agent()`, `search_knowledge_base()` | `app/services/support_service.py`| Refactor & Fix | Fix hardcoded `mock_mode=True`; fix hardcoded refund query; refine intent parser. |
| **28** | Markdown | Section 15: Evaluation Framework | `evaluation/README.md` | Migrate to Docs | Document concept check evaluation rules. |
| **29** | Code | `evaluate_answer_quality()`, `model_eval_cases` | `app/services/evaluation.py` & `tests/unit/test_answer_quality.py` | Refactor & Test | Convert concept evaluation into service and unit test suite. |
| **30** | Code | Live LLM Evaluation Runner (`RUN_LIVE_EVALUATION`) | `evaluation/benchmark.py` | Refactor to CLI | Include optional live evaluation flag `--live` in CLI benchmark. |
| **31** | Markdown | Section 16: API Usage & Cost Tracking | `README.md` | Migrate to Docs | Document token tracking metrics. |
| **32** | Code | Session Usage Display | `app/services/azure_ai.py` | Refactor | Provide `get_usage_metrics()` method returning structured Pydantic model. |
| **33** | Code | Empty Code Cell | None | **Delete** | Extraneous empty cell. |
| **34** | Markdown | Section 17: Final End-to-End Tests | `tests/README.md` | Migrate to Docs | Document health checks and verification criteria. |
| **35** | Code | System Health Check Assertions | `tests/integration/test_system_health.py` | Convert to Pytest | Formalize assertions into automated pytest health test suite. |
| **36** | Code | Controlled Single Live Call | `scripts/test_live_azure.py` | Refactor to Script | Isolate live Azure test into an explicit opt-in diagnostic script. |
| **37** | Code | Response Extraction Unit Test | `tests/unit/test_azure_parser.py` | Convert to Pytest | Formalize into unit test testing various Azure JSON response formats. |
| **38–40** | Code | Introspection Probes (`inspect.signature`) | None | Archive / Deprecate | Temporary development inspection code; not needed in production. |
| **41–42** | Code | Benchmark V1 Diagnostics & `evaluate_retriever` | `evaluation/benchmark.py` | Consolidate | Merge metrics (`recall_at_k`, `reciprocal_rank`) into `app/services/evaluation.py`. |
| **43–46** | Code | Retrieval Benchmark V2 Dataset & Analysis | `evaluation/datasets/eval_v2.json` | Externalize to Data | Preserve V2 dataset for historical regression tests. |
| **47–50** | Code | Weighted RRF Experiments (2:1, 3:1) | `app/retrieval/hybrid_search.py` | Optional Feature | Implement configurable weights `(vector_weight, bm25_weight)` in `HybridRetriever`. |
| **51–54** | Code/Mark| Benchmark V3 (28 queries across 25 docs) | `evaluation/datasets/dev_eval_v3.json` | Externalize to Data | Store canonical 28-query V3 evaluation suite. |
| **55–58** | Code | BM25 Synonym Expansion Research | `app/retrieval/bm25.py` | Optional Feature | Provide optional `expand_query: bool = False` flag with `BM25_SYNONYMS` dict. |
| **59–61** | Code | Introspection Probes | None | Archive / Deprecate | Temporary development inspection code. |
| **62–65** | Code | V3 + Expansion & Holdout Dataset Validation | `evaluation/datasets/holdout_eval.json` | Externalize to Data | Preserve 27-question holdout dataset for validation testing. |
| **66–73** | Code | Evidence Sufficiency & Gating Probes | `tests/unit/test_relevance_gate.py` | Convert to Pytest | Convert the 8 evidence sufficiency queries into automated test cases. |

---

## 3. Module Responsibility Matrix

### 3.1 `app/core/`
- **`config.py`:** Centralized settings management using `pydantic-settings`. Loads `.env`, validates types, provides defaults for hyperparameters (`RETRIEVAL_TOP_K=3`, `SIMILARITY_THRESHOLD=0.40`, `RRF_K=60`, `MAX_OUTPUT_TOKENS=180`).
- **`logging.py`:** Structured JSON/console logging with contextual request IDs.

### 3.2 `app/retrieval/`
- **`embeddings.py`:** Encapsulates `SentenceTransformer('all-MiniLM-L6-v2')`. Thread-safe encoding with `normalize_embeddings=True`.
- **`vector_store.py`:** Encapsulates `faiss.IndexFlatIP(384)`. Loads policies from `data/policies/policies.json`, creates embeddings, and provides top-$K$ cosine search.
- **`bm25.py`:** Implements `tokenize_text` regex tokenizer and `BM25Okapi` index. Provides top-$K$ lexical search and optional synonym expansion.
- **`hybrid_search.py`:** Executes candidate retrieval ($2 \times \text{top\_k}$) across vector and lexical stores, fuses results with Reciprocal Rank Fusion ($k=60$), and preserves document metadata and individual component scores.

### 3.3 `app/tools/`
- **`order_tools.py`:** Loads `data/orders/orders.json`. Exposes `get_order_status(order_id)`.
- **`refund_tools.py`:** Exposes `create_refund_request(order_id, reason)`. Validates order existence, checks for existing pending requests, stages records with status `"pending_human_approval"`, and persists to `data/orders/refund_requests.json` using atomic file locking.

### 3.4 `app/services/`
- **`azure_ai.py`:** Encapsulates HTTP communication with Azure AI Foundry Responses API. Manages exponential backoff retries, fast-fails on auth errors, extracts text responses, and records session token usage safely.
- **`support_service.py`:** Orchestrates the customer support workflow:
  1. Intent parsing & tool dispatch (order lookup, refund staging).
  2. Relevance gating via `check_retrieval_relevance()`.
  3. Grounded prompt compilation with XML-delimited customer questions.
  4. Generation execution via `AzureAIClient` (or deterministic test stub in test mode).
- **`evaluation.py`:** Reusable evaluation routines: `recall_at_k`, `mean_reciprocal_rank`, `hit_rate_at_k`, and `evaluate_answer_quality` multi-phrase concept verification.

### 3.5 `app/api/` & `app/models/`
- **`models/requests.py` & `responses.py`:** Pydantic schemas validating API inputs and outputs with OpenAPI documentation.
- **`api/routes.py`:** FastAPI router exposing:
  - `POST /api/chat`: Main support conversation endpoint.
  - `GET /api/orders/{order_id}`: Order lookup endpoint.
  - `POST /api/refunds`: Manual refund request staging endpoint.
  - `GET /api/health`: Comprehensive system health check (knowledge base, index counts, model availability).
