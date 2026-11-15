# SupportPilot: Comprehensive Local Testing Strategy & Test Plan

**Date:** 2026-11-15  
**Architect:** Senior QA & Applied AI Engineer  
**Project:** SupportPilot — AI-Powered E-Commerce Customer Support Assistant  
**Framework:** `pytest`, `pytest-asyncio`, `httpx` (FastAPI TestClient)  
**Execution Environment:** Python 3.11.18, `uv`, Windows PowerShell (100% Offline Capable)  

---

## 1. Testing Philosophy & Governance

SupportPilot is a mission-critical customer-support application that retrieves sensitive store policies and handles customer order inquiries and financial refund requests.

### Core Testing Mandates:
1. **100% Offline Determinism:** Local unit and integration tests **must not require an Azure AI Foundry API key** or active internet connection. All tests must be runnable in CI/CD and offline developer environments.
2. **Zero Fabrication:** Test assertions must strictly evaluate actual software execution. No synthetic pass results or bypassed assertions.
3. **Financial Safety Invariant:** Tests must continuously verify that refund operations **only stage records** for human supervisor approval and never trigger automated payment execution.
4. **Attribution & Grounding Invariant:** Tests must verify that generated responses cite valid document IDs (`[DOC-XXX]`) present in the retrieved evidence.
5. **No Original Notebook Mutation:** Test suites test the migrated application code; the original notebook remains an untouched reference artifact.

---

## 2. Test Architecture & Directory Structure

```text
tests/
├── __init__.py
├── conftest.py                     # Reusable fixtures: mock Azure client, test knowledge base, sample orders
├── unit/
│   ├── test_data_loading.py        # Validates policies.json and orders.json integrity
│   ├── test_embeddings.py          # SentenceTransformer dimension and normalization tests
│   ├── test_vector_store.py        # FAISS IndexFlatIP indexing and cosine search tests
│   ├── test_bm25.py                # Regex tokenization and BM25Okapi scoring tests
│   ├── test_hybrid_search.py       # Candidate pooling, RRF formula, and metadata preservation
│   ├── test_relevance_gate.py      # Threshold gating (0.40), REVIEW_EVIDENCE vs ESCALATE
│   ├── test_order_tools.py         # Order lookup, status sanitization, missing order handling
│   ├── test_refund_tools.py        # Staging workflow, duplicate check, human approval status
│   └── test_azure_parser.py        # Responses API JSON parser across schema variants
├── integration/
│   ├── test_agent_orchestrator.py  # Intent routing (orders, refunds, policy FAQs)
│   ├── test_support_service.py     # End-to-end RAG pipeline with mock Azure client
│   └── test_api_routes.py          # FastAPI endpoints (/health, /api/chat, /api/orders, /api/refunds)
└── benchmark/
    └── test_retrieval_benchmarks.py# Regression tests validating historical Recall and MRR baselines
```

---

## 3. Detailed Component Test Specifications

### 3.1 Data Loading & Integrity (`test_data_loading.py`)
- **Objective:** Ensure externalized data files adhere to schema requirements.
- **Test Cases:**
  1. `test_policies_count_and_schema`: Verify exactly 25 policies exist in `data/policies/policies.json`. Each policy must contain non-empty `doc_id` (`DOC-001` to `DOC-025`), `title`, and `content`.
  2. `test_orders_db_schema`: Verify synthetic orders (`1024`, `1025`, `1026`) exist with required fields: `order_id`, `customer_name`, `status`, `payment_status`, `items`, `total`, `currency`.

### 3.2 Embedding Generation (`test_embeddings.py`)
- **Objective:** Validate vector representation and normalization.
- **Test Cases:**
  1. `test_embedding_dimensions`: Verify output vectors have shape `(N, 384)`.
  2. `test_embedding_l2_normalization`: Verify that Euclidean norm $\|v\|_2 = 1.0 \pm 10^{-5}$ for all generated vectors. This is mathematically required for Inner Product to equal Cosine Similarity.
  3. `test_embedding_determinism`: Ensure identical text strings generate identical vectors.

### 3.3 FAISS Vector Search (`test_vector_store.py`)
- **Objective:** Validate dense vector index creation and search precision.
- **Test Cases:**
  1. `test_vector_index_size`: Confirm FAISS index contains 25 indexed vectors.
  2. `test_vector_search_top_k`: Verify `get_vector_results(query, top_k=3)` returns exactly 3 documents with descending scores in range $[-1.0, 1.0]$.
  3. `test_vector_semantic_match`: Verify query `"standard delivery timeline"` ranks `DOC-001` at rank 1 with score $> 0.70$.

### 3.4 BM25 Sparse Retrieval (`test_bm25.py`)
- **Objective:** Validate regex tokenization and BM25Okapi scoring.
- **Test Cases:**
  1. `test_tokenize_text_behavior`: Verify normalization to lowercase, stripping of punctuation, and handling of alphanumeric terms.
  2. `test_bm25_exact_keyword_match`: Verify query `"DOC-005"` or `"exchange procedure"` accurately boosts target documents.
  3. `test_bm25_empty_query`: Ensure empty or whitespace-only queries handle gracefully without crashing, returning empty lists.

### 3.5 Hybrid Retrieval & RRF Fusion (`test_hybrid_search.py`)
- **Objective:** Verify candidate retrieval and Reciprocal Rank Fusion mechanics.
- **Test Cases:**
  1. `test_rrf_scoring_formula`: Given mock rank lists where Doc A is rank 1 in vector and rank 1 in BM25, verify its RRF score equals:
     $$\frac{1}{60 + 1} + \frac{1}{60 + 1} = \frac{2}{61} \approx 0.032787$$
  2. `test_hybrid_search_metadata_preservation`: Verify returned documents include all required keys: `doc_id`, `title`, `content`, `rrf_score`, `vector_score`, `bm25_score`.
  3. `test_hybrid_search_deduplication`: Ensure documents present in both vector and lexical candidate pools are merged cleanly without duplicates.

### 3.6 Relevance Gate & Escalation (`test_relevance_gate.py`)
- **Objective:** Verify semantic thresholding and escalation boundary.
- **Test Cases:**
  1. `test_in_scope_query_passes`: Query `"How long does standard shipping take?"` yields `top_score >= 0.40`, returning `decision: REVIEW_EVIDENCE` and `supported: True`.
  2. `test_out_of_scope_query_escalates`: Query `"What is the current price of Bitcoin?"` yields `top_score < 0.40`, returning `decision: ESCALATE`, `supported: False`, and human handoff message.
  3. `test_empty_retrieval_escalates`: When no documents are returned, verify immediate graceful escalation.

### 3.7 Order & Refund Local Tools (`test_order_tools.py`, `test_refund_tools.py`)
- **Objective:** Verify tool execution correctness and financial safety guards.
- **Test Cases:**
  1. `test_order_status_success`: Calling `get_order_status("1024")` or `get_order_status("#1024")` returns `success: True` and Alex Morgan order details.
  2. `test_order_status_not_found`: Calling `get_order_status("9999")` returns `success: False` with descriptive message.
  3. `test_refund_staging_success`: Calling `create_refund_request("1024", "Defective unit")` creates a record with `status: "pending_human_approval"` and returns generated `request_id`.
  4. **CRITICAL FINANCIAL SAFETY:** `test_refund_never_executes_disbursement`: Assert that no payment gateway is invoked, amount matches order total, and status is never `"paid"` or `"approved"`.
  5. `test_refund_duplicate_prevention`: Calling `create_refund_request("1024", ...)` a second time returns `is_duplicate: True` and does not create a redundant record.

### 3.8 Azure Responses API Parser (`test_azure_parser.py`)
- **Objective:** Verify resilient parsing of Azure OpenAI Responses API payload variants.
- **Test Cases:**
  1. `test_parse_direct_output_text`: Parses `{"output_text": "Response text"}` correctly.
  2. `test_parse_nested_message_blocks`: Parses nested `output[].content[].text` structures correctly.
  3. `test_parse_empty_or_malformed`: Returns empty string or raises descriptive error without crashing when fed empty dicts, missing keys, or unexpected data types.

### 3.9 FastAPI REST API Endpoints (`test_api_routes.py`)
- **Objective:** Validate HTTP status codes, request validation, and OpenAPI contracts.
- **Test Cases:**
  1. `GET /api/health`: Returns HTTP 200 with status `"healthy"`, knowledge base document count (25), and vector index size (25).
  2. `POST /api/chat`: With valid query, returns HTTP 200 with `answer`, `sources`, `decision`, and `tools_used`.
  3. `POST /api/chat` (Validation Error): Submitting query $> 500$ characters or empty payload returns HTTP 422 Unprocessable Entity.
  4. `GET /api/orders/1025`: Returns HTTP 200 with order details.
  5. `GET /api/orders/9999`: Returns HTTP 404 Not Found.
  6. `POST /api/refunds`: Stages a refund request and returns HTTP 201 Created with `request_id` and `pending_human_approval` status.

---

## 4. Pytest Configuration & Test Execution Guide

### 4.1 Pytest Configuration (`pyproject.toml`)
```toml
[tool.pytest.ini_options]
minversion = "7.0"
addopts = "-ra -q --strict-markers"
testpaths = ["tests"]
python_files = ["test_*.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
markers = [
    "unit: Unit tests (fast, isolated, offline)",
    "integration: Component integration tests",
    "live: Opt-in live Azure AI Foundry calls (requires AZURE_AI_KEY)",
    "benchmark: Historical retrieval benchmark regression tests"
]
```

### 4.2 Test Commands for PowerShell

```powershell
# 1. Run all offline unit tests (Default Fast Suite)
uv run pytest tests/unit

# 2. Run integration tests (Offline with mocked Azure client)
uv run pytest tests/integration

# 3. Run full test suite with coverage report
uv run pytest --cov=app tests/

# 4. Run historical retrieval benchmark verification
uv run pytest tests/benchmark/test_retrieval_benchmarks.py

# 5. Run single controlled live Azure call (Only when AZURE_AI_KEY is set in .env)
uv run pytest -m live tests/
```
