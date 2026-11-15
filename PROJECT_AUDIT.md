# SupportPilot: Comprehensive Notebook & System Audit Report

**Date:** 2026-11-15  
**Auditor:** Senior Python Engineer, Applied AI Engineer & Software Architect  
**Project:** SupportPilot — AI-Powered E-Commerce Customer Support Assistant  
**Source Notebook:** `notebooks/SupportPilot_AI_Prototype_Repaired.ipynb`  
**Execution Environment:** Python 3.11.18, `uv` package manager, Windows PowerShell  

---

## 1. Executive Summary

This audit provides an exhaustive architectural, algorithmic, and operational assessment of the prototype notebook `notebooks/SupportPilot_AI_Prototype_Repaired.ipynb` (74 total cells: 56 code cells, 18 markdown cells).

The prototype implements an intelligent e-commerce customer support system featuring:
1. **Canonical Knowledge Base:** 25 structured customer support policies (DOC-001 to DOC-025).
2. **Hybrid Retrieval:** FAISS dense vector search (`all-MiniLM-L6-v2`) + BM25Okapi sparse search fused via Reciprocal Rank Fusion ($k=60$).
3. **Relevance Gate:** Cosine similarity thresholding ($0.40$) for escalating out-of-scope or unverified inquiries.
4. **Azure AI Foundry Client:** `gpt-5-mini` using the Azure OpenAI Responses API (`/openai/v1/responses`).
5. **Local Support Tools:** Synthetic order tracking (`1024`, `1025`, `1026`) and human-in-the-loop refund staging.

### Summary of Audit Findings
- **Total Notebook Cells:** 74 (Cells 0–36: Baseline Prototype & Demo; Cells 37–73: Diagnostic Benchmarks & Exploratory Experiments).
- **Critical Issues Identified:** 3 (Hardcoded private Azure endpoint, hardcoded mock mode in agent execution, and dangerous policy-misattributing mock generation).
- **High Severity Issues:** 4 (Hardcoded search query in refund fallback, over-eager refund staging regex, non-persistent in-memory state with concurrency flaws, and dual-header authorization vulnerabilities).
- **Medium Severity Issues:** 3 (Discrepancy between FAISS vector relevance gate and Hybrid RRF evidence ranking, duplicate/conflicting evaluation functions across 6 cells, and embedded data structures).
- **Low Severity Issues:** 2 (Global mutable telemetry state and tokenization edge cases).

---

## 2. Notebook Inventory & Cell-by-Cell Structure

The notebook naturally partitions into two major phases:
- **Phase A: Core Pipeline & Initial Demo (Cells 0–36):** The primary pipeline from environment installation to single controlled live call.
- **Phase B: Diagnostic Probes, Benchmarks & Iterations (Cells 37–73):** Diagnostic scripts, multi-version retrieval benchmarks (V1, V2, V3, Holdout), BM25 query expansion experiments, and relevance threshold validation.

### Complete Section Breakdown

| Cell Index | Cell Type | Section / Topic | Key Functions / Artifacts | Status & Architectural Quality |
|---|---|---|---|---|
| **0** | Markdown | Title & Architecture Overview | SupportPilot documentation | Informational |
| **1** | Markdown | Section 2: Installation & Imports | Dependency guidance | Informational |
| **2** | Code | Pip install commands | `!pip install sentence-transformers...` | Colab-specific (replace with `pyproject.toml`) |
| **3** | Code | Standard imports | `faiss`, `rank_bm25`, `SentenceTransformer` | Clean core imports |
| **4** | Markdown | Section 3: Configuration & Secrets | Azure credentials documentation | Informational |
| **5** | Code | Configuration & Key Resolution | `get_azure_api_key()`, constants | **CRITICAL:** Hardcoded endpoint; Colab dependency |
| **6** | Markdown | Section 4: Canonical Knowledge Base | 25 policies description | Informational |
| **7** | Code | Canonical 25 Policies | `canonical_documents`, `df_kb` | High quality; needs externalization to JSON |
| **8** | Markdown | Section 5: Dense Embeddings | `all-MiniLM-L6-v2` description | Informational |
| **9** | Code | Embedding Generation | `embedding_model.encode()` | L2 normalized; 384 dimensions |
| **10** | Markdown | Section 6: FAISS Vector Search | Inner Product index description | Informational |
| **11** | Code | FAISS Indexing & Search | `get_vector_results()` | Correct FlatIP cosine similarity implementation |
| **12** | Markdown | Section 7: BM25 Sparse Search | Tokenization & Okapi description | Informational |
| **13** | Code | BM25 Indexing & Search | `tokenize_text()`, `get_bm25_results()` | Working regex tokenizer; case-insensitive |
| **14** | Markdown | Section 8: Hybrid Retrieval & RRF | Reciprocal Rank Fusion description | Informational |
| **15** | Code | Hybrid RRF Implementation | `compute_rrf()`, `hybrid_search()` | Sound implementation ($k=60$, top 2x candidate pool) |
| **16** | Markdown | Section 9: Retrieval Evaluation | Benchmark description | Informational |
| **17** | Code | Benchmark V1 Evaluation | `evaluation_dataset`, `evaluate_retrieval()` | 10 queries; Recall@3 and MRR |
| **18** | Markdown | Section 10: Azure AI Foundry | Responses API description | **CRITICAL:** Hardcoded endpoint in markdown |
| **19** | Code | Azure Client & Response Parser | `call_azure()`, `extract_text_from_responses_api()` | Working parser; global mutable stats |
| **20** | Markdown | Section 11: Relevance Gate | Confidence threshold description | Informational |
| **21** | Code | Relevance Gating Function | `check_retrieval_relevance()` | Overwritten in cell execution 62; uses vector gate |
| **22** | Markdown | Section 12: Grounded Answer Generation | System prompt description | Informational |
| **23** | Code | Grounded Answer Pipeline | `build_grounded_prompt()`, `generate_support_answer()` | **CRITICAL:** Misleading canned mock fallback |
| **24** | Markdown | Section 13: Local Support Tools | Order & Refund tools description | Informational |
| **25** | Code | Synthetic Orders & Refund Tool | `orders_db`, `get_order_status()`, `create_refund_request()` | Working safety rules; non-persistent in-memory list |
| **26** | Markdown | Section 14: Agent Orchestration | Multi-tool coordinator description | Informational |
| **27** | Code | Support Agent Runner | `run_support_agent()`, `search_knowledge_base()` | **CRITICAL:** Hardcoded `mock_mode=True`; hardcoded query |
| **28** | Markdown | Section 15: Evaluation Framework | Multi-phrase quality rules description | Informational |
| **29** | Code | Answer Quality Evaluator | `evaluate_answer_quality()`, `model_eval_cases` | Deterministic concept check suite |
| **30** | Code | Live Evaluation Guard | `if RUN_LIVE_EVALUATION:` | Cost protection guard active |
| **31** | Markdown | Section 16: Cost Tracking | Usage metrics description | Informational |
| **32** | Code | Token Usage Display | `pd.DataFrame(AZURE_USAGE_STATS)` | Display only |
| **33** | Code | Empty Cell | None | Dead cell |
| **34** | Markdown | Section 17: System Verification | E2E test plan description | Informational |
| **35** | Code | Local Component Health Checks | Assertion suite | Robust offline sanity suite |
| **36** | Code | Controlled Single Live Call | Live API call with single query | Safe single live probe |
| **37** | Code | Unit Test: Response Parser | Assertions for `extract_text_from_responses_api` | Diagnostic unit test |
| **38–40** | Code | Inspection Probes | Inspecting `hybrid_search`, `get_vector_results` | Diagnostic inspection code |
| **41–42** | Code | Retrieval Benchmark V1 Diagnostics | `evaluate_retriever()`, per-query failure logs | Duplicate evaluation definitions |
| **43–46** | Code | Retrieval Benchmark V2 | 20-query benchmark dataset and runner | Expanded diagnostic evaluation |
| **47–50** | Code | Weighted RRF Experiments | `weighted_rrf_2_1()`, `weighted_rrf_3_1()` | Research exploration (2:1 and 3:1 weighting) |
| **51–54** | Code/Mark| Benchmark V3 (All 25 Policies) | 28 queries covering DOC-001–DOC-025 | Comprehensive diagnostic benchmark |
| **55–58** | Code | BM25 Synonym Expansion Research | `expand_bm25_query()`, `hybrid_search_with_expansion()` | Lexical gap research for DOC-006 |
| **59–61** | Code | Function Introspection Probes | `inspect.getsource` checks | Development introspection |
| **62–65** | Code | V3 + Expansion & Holdout Dataset | 27-question holdout dataset validation | Holdout generalization test |
| **66–73** | Code | Evidence Sufficiency & Gating Probes | Extensive threshold diagnostics across 8 test queries | Confirms threshold=0.40 gating behavior |

---

## 3. Detailed Issue Catalog

### ISS-01: Hardcoded Azure AI Foundry Resource Endpoint
- **Severity:** Critical
- **Notebook Cell Number:** Cell 5 & Cell 18
- **Problem Description:**  
  `AZURE_AI_ENDPOINT = "https://abdulrahmanchohan4181-0-resource.services.ai.azure.com/openai/v1/responses"` is hardcoded directly into the script and markdown documentation.
- **Why It Matters:**  
  Hardcoding the endpoint exposes tenant infrastructure, developer username, and internal resource IDs in source control. If migrated as-is, the application will fail in staging/production environments where different Azure AI Foundry resources or deployments are configured.
- **Recommended Fix:**  
  Move the endpoint to `.env` as `AZURE_AI_ENDPOINT` and provide a sanitized placeholder in `.env.example`. Read the configuration dynamically through `app/core/config.py` using `pydantic-settings`.
- **Expected Result:**  
  Zero internal Azure resource names in source files; environment-agnostic deployment.

---

### ISS-02: Hardcoded `mock_mode=True` in Support Agent Orchestrator
- **Severity:** Critical
- **Notebook Cell Number:** Cell 27
- **Problem Description:**  
  Inside `run_support_agent(query, max_rounds=3)`, line 76 explicitly hardcodes:
  ```python
  rag_res = generate_support_answer(query, mock_mode=True)
  ```
- **Why It Matters:**  
  Even if the user configures valid Azure AI Foundry credentials, sets `RUN_LIVE_EVALUATION = True`, and wants live AI customer support, the agent runner forcefully disables live generation and routes every request into canned mock responses.
- **Recommended Fix:**  
  Add `mock_mode: Optional[bool] = None` to `run_support_agent()`. Default to `settings.MOCK_MODE` from configuration, allowing callers to toggle live Azure inference or offline deterministic mode cleanly.
- **Expected Result:**  
  Support agent can execute both deterministic offline testing and live production Azure inference based on configuration.

---

### ISS-03: Canned Mock Fallback Misattributes Policy Document IDs
- **Severity:** Critical
- **Notebook Cell Number:** Cell 23
- **Problem Description:**  
  In `generate_support_answer()`, the offline/mock branch executes:
  ```python
  if not api_key or mock_mode:
      top_doc = evidence_docs[0]
      q_lower = query.lower()
      if "exchange" in q_lower:
          answer_text = f"Under our policy [{top_doc['doc_id']}], customers may request an exchange..."
      elif "shipping" in q_lower:
          answer_text = f"According to our policy [{top_doc['doc_id']}], standard shipping takes 3 to 5 business days..."
      elif "refund" in q_lower:
          answer_text = f"Under our policy [{top_doc['doc_id']}], refunds are processed..."
      else:
          answer_text = f"Based on [{top_doc['doc_id']}], {top_doc['content'][:140]}."
  ```
- **Why It Matters:**  
  The mock logic matches broad keywords in the query and injects whatever document was retrieved at rank 0 into the string template. If a customer asks about International Shipping (`DOC-003`) or Overnight Delivery (`DOC-002`), the keyword `"shipping"` matches and returns the Standard US Shipping policy (`DOC-001`) while falsely stamping `[DOC-003]` or `[DOC-002]` on it. This constitutes severe policy misattribution and violates Rule 7 ("Never use fake AI answers as real customer-support answers").
- **Recommended Fix:**  
  Remove the keyword-matching canned strings. In offline mode, the system should either:
  1. Return an explicit mock response object labeled `[OFFLINE MOCK]` with direct excerpted text from `top_doc['content']`.
  2. Use a deterministic local extraction helper that quotes verified excerpts only.
  3. Clearly fail fast if live AI generation was requested but unavailable.
- **Expected Result:**  
  Elimination of policy hallucination and misattribution in offline mode.

---

### ISS-04: Hardcoded Search Query in Agent Refund Policy Fallback
- **Severity:** High
- **Notebook Cell Number:** Cell 27
- **Problem Description:**  
  When an inquiry mentions refund terms without an order ID, line 68 executes:
  ```python
  kb_res = search_knowledge_base("What is the refund processing time?")
  ```
- **Why It Matters:**  
  The user's actual question (e.g. "Do I get a refund if the item was final sale?", "Can you refund my express shipping fee?") is discarded and replaced with a static string about processing time (`DOC-008`).
- **Recommended Fix:**  
  Pass the customer's actual query string to `search_knowledge_base(query)` and feed the resulting evidence into `generate_support_answer()`.
- **Expected Result:**  
  Customer receives accurate, specific policy answers for their exact refund question.

---

### ISS-05: Overly Broad Keyword Intent Triggering for Refund Staging
- **Severity:** High
- **Notebook Cell Number:** Cell 27
- **Problem Description:**  
  The agent detects refund intent using a naive substring check:
  ```python
  if any(w in query_lower for w in ["refund", "return money", "cancel order"]):
      if order_id:
          create_refund_request(order_id, reason="Customer requested refund via SupportPilot agent.")
  ```
- **Why It Matters:**  
  If a customer submits an informational question like "Did you process the refund for order #1024?", the agent immediately stages a brand new refund request `REF-000X` for that order instead of retrieving its status or history.
- **Recommended Fix:**  
  Implement explicit intent categorization: distinguish between `request_refund` (actionable) and `inquire_refund_status` / `inquire_refund_policy` (read-only). If ambiguous, prompt the customer for confirmation before staging a refund.
- **Expected Result:**  
  No accidental refund staging on purely informational inquiries.

---

### ISS-06: Non-Persistent In-Memory State & Concurrency Vulnerabilities
- **Severity:** High
- **Notebook Cell Number:** Cell 25 & Cell 27
- **Problem Description:**  
  `refund_requests: List[Dict[str, Any]] = []` and `agent_execution_log = []` are stored as global Python lists in memory.
- **Why It Matters:**  
  In a production FastAPI deployment running under Uvicorn (especially with multiple worker processes):
  1. State resets whenever the server restarts.
  2. Workers do not share memory, completely bypassing duplicate request detection.
  3. Concurrent requests can produce duplicate `request_id` values due to race conditions.
- **Recommended Fix:**  
  Abstract storage behind a repository interface (`RefundRepository`). For local file-based storage, persist to `data/orders/refund_requests.json` using atomic file writes with file locking or SQLite.
- **Expected Result:**  
  Thread-safe, process-safe, persistent refund request management.

---

### ISS-07: Dual-Header Authentication and Colab-Specific Key Resolution
- **Severity:** High
- **Notebook Cell Number:** Cell 5 & Cell 19
- **Problem Description:**  
  In Cell 5, `get_azure_api_key()` imports `google.colab.userdata`. In Cell 19, headers transmit the API key twice:
  ```python
  headers = {
      "api-key": api_key,
      "Authorization": f"Bearer {api_key}",
      "Content-Type": "application/json"
  }
  ```
- **Why It Matters:**  
  1. The `google.colab` import produces noisy warnings or import failures in standalone Python runtimes.
  2. For Azure OpenAI Services, `api-key: {key}` is the standard API key header. Sending an API key as a `Bearer` token violates OAuth2 specs and can cause Azure API gateways to reject the request with HTTP 401.
- **Recommended Fix:**  
  Use `python-dotenv` and Pydantic Settings. Set only `api-key: {key}` when using Azure API keys (or `Authorization: Bearer {token}` only when using Azure Entra ID OAuth tokens).
- **Expected Result:**  
  Standardized HTTP headers and seamless local credential resolution.

---

### ISS-08: Discrepancy Between FAISS Vector Relevance Gate and Hybrid RRF Evidence
- **Severity:** Medium
- **Notebook Cell Number:** Cell 21, Cell 68, Cell 72
- **Problem Description:**  
  In `check_retrieval_relevance()`, the decision to escalate vs answer is calculated solely from:
  ```python
  vector_results = get_vector_results(query, top_k=1)
  top_vector_score = vector_results[0]["score"] if vector_results else 0.0
  if top_vector_score < threshold:
      return {"decision": "ESCALATE", ...}
  ```
  However, the evidence provided to the prompt is generated by `hybrid_search(query, top_k=top_k)`.
- **Why It Matters:**  
  A query with exact lexical keywords (e.g. part numbers, order policies, specific names) might score low on dense embedding cosine similarity (< 0.40) despite BM25 scoring it at the very top. The gate will escalate despite having perfect lexical evidence. Conversely, an out-of-scope query that produces a false semantic similarity >= 0.40 will pass into generation.
- **Recommended Fix:**  
  Preserve the existing Hybrid RRF 1:1 strategy per architectural guidelines. Log gating telemetry for both `vector_score` and `top_bm25_score`. In future iterations, introduce an evidence sufficiency score that considers both semantic similarity and BM25 confidence before escalating.
- **Expected Result:**  
  Maintains backward-compatible behavior while providing diagnostics on gating disagreements.

---

### ISS-09: Duplicate and Fragmented Evaluation Logic Across Notebook
- **Severity:** Medium
- **Notebook Cell Number:** Cell 17 vs Cells 41, 44, 48, 53, 57, 62
- **Problem Description:**  
  The notebook contains at least 5 different evaluation routines:
  - Cell 17: `evaluate_retrieval(dataset, search_fn, k=3)`
  - Cell 41: `evaluate_retriever(dataset, retriever_fn, k=5)`, `recall_at_k`, `reciprocal_rank`, `summarize_evaluation`
  - Cell 48: `weighted_rrf_search(query, top_k=5, vector_weight=2, bm25_weight=1)`
  - Cell 57: `hybrid_search_with_expansion(query, top_k=5)`
  - Cell 62: Multi-method comparison table
- **Why It Matters:**  
  Maintenance nightmare and confusion regarding which benchmark is canonical. Hyperparameters vary between $K=3$ and $K=5$, and metrics are defined redundantly in multiple places.
- **Recommended Fix:**  
  Consolidate all evaluation metrics into `app/services/evaluation.py` (for runtime evaluation) and a dedicated CLI benchmark script in `evaluation/benchmark.py`.
- **Expected Result:**  
  A single, reusable, authoritative evaluation engine.

---

### ISS-10: In-Memory Hardcoded Policies and Synthetic Orders
- **Severity:** Medium
- **Notebook Cell Number:** Cell 7 & Cell 25
- **Problem Description:**  
  25 policies and 3 synthetic orders are defined as raw Python dictionaries inside notebook cells.
- **Why It Matters:**  
  Changes to customer support policies require editing Python application code, preventing non-engineers from updating content and making version-controlled policy auditing impossible.
- **Recommended Fix:**  
  Externalize documents to `data/policies/policies.json` (or individual `.md` files) and orders to `data/orders/orders.json`.
- **Expected Result:**  
  Clean separation of business data from executable code.

---

### ISS-11: Global Mutable State for Azure Token & Usage Tracking
- **Severity:** Low
- **Notebook Cell Number:** Cell 19 & Cell 32
- **Problem Description:**  
  `AZURE_USAGE_STATS` is a plain global dictionary modified during `call_azure()`.
- **Why It Matters:**  
  Not thread-safe in multi-threaded API servers; cannot track per-tenant, per-session, or per-user token consumption.
- **Recommended Fix:**  
  Encapsulate usage metrics inside `app/services/azure_ai.py` using thread-safe counters or database/logging sinks.
- **Expected Result:**  
  Accurate, thread-safe API consumption telemetry.

---

### ISS-12: Tokenizer and Regex Extraction Edge Cases
- **Severity:** Low
- **Notebook Cell Number:** Cell 13 & Cell 27
- **Problem Description:**  
  `tokenize_text` uses `\b[a-z0-9]+\b` which strips hyphens ("3-5" becomes "3", "5") and currency symbols ("$6" becomes "6"). In Cell 27, order matching regex `r"#?(\b102[4-6]\b|\b\d{4,6}\b)"` hardcodes expected order IDs `102[4-6]`.
- **Why It Matters:**  
  Strips domain-relevant symbols in search terms and makes order lookup brittle if new order IDs are introduced.
- **Recommended Fix:**  
  Preserve alphanumeric hyphenated tokens (`\b[a-z0-9]+(?:-[a-z0-9]+)*\b`) and generalize order extraction to standard numeric ID patterns.
- **Expected Result:**  
  Improved token fidelity for technical terms, SKUs, and order numbers.

---

## 4. Retrieval System Audit & Historical Benchmarks

### 4.1 Indexing & Search Mechanics
1. **Dense Vector Search (FAISS):**
   - Model: `sentence-transformers/all-MiniLM-L6-v2` (384 dimensions).
   - Embeddings are generated with `normalize_embeddings=True` (unit Euclidean norm).
   - Index type: `faiss.IndexFlatIP(384)`. Because vectors are $L_2$ normalized, inner product strictly equals **cosine similarity** ($\cos \theta \in [-1, 1]$).
   - Precision: High on semantic intent, robust to phrasing variations.

2. **Sparse Keyword Search (BM25):**
   - Engine: `rank_bm25.BM25Okapi`.
   - Corpus tokens: `tokenize_text(doc["title"] + " " + doc["content"])`.
   - Precision: Excels at exact keywords, numbers (e.g. "30 days", "$6"), and policy numbers ("DOC-005"). Misses semantic paraphrases where keywords differ (e.g., "parcel" vs "shipping", "faulty" vs "defective").

3. **Reciprocal Rank Fusion (RRF):**
   - Formula:
     $$\text{RRF\_Score}(d) = \sum_{m \in \{\text{vector}, \text{bm25}\}} \frac{1}{k + \text{rank}_m(d)}$$
     with $k = 60$.
   - Candidate pool: Top $2 \times \text{top\_k}$ candidates retrieved from dense and sparse search before fusing.
   - Preserves ranking robustness without requiring cross-modality score calibration.

### 4.2 Historical Retrieval Benchmark Results
The following historical results are transcribed directly from the notebook execution outputs and must be treated as **historical reference points**, not guaranteed production accuracy:

#### Canonical Benchmark V1 (10 Queries, $K=3$) — Cell 17
| Retrieval Modality | Queries | Recall@3 | MRR |
|---|---|---|---|
| Dense Vector Search (FAISS) | 10 | 1.000 (100%) | 1.000 |
| Sparse Keyword Search (BM25) | 10 | 0.800 (80%) | 0.700 |
| **Hybrid Search (RRF 1:1)** | **10** | **1.000 (100%)** | **0.867** |

#### Benchmark V3 (28 Development Queries, $K=5$) — Cell 62
| Retrieval Method | Questions | Recall@5 | MRR | Hit Rate@5 | Failed Queries |
|---|---|---|---|---|---|
| FAISS Only | 28 | 1.0000 | 0.9464 | 1.0000 | 0 |
| Hybrid RRF + BM25 Expansion | 28 | 1.0000 | 0.9405 | 1.0000 | 0 |
| Weighted RRF 3:1 (Vector:BM25) | 28 | 0.9643 | 0.9286 | 0.9643 | 1 |
| Weighted RRF 2:1 (Vector:BM25) | 28 | 0.9643 | 0.8869 | 0.9643 | 1 |
| **Hybrid RRF 1:1 (Baseline)** | **28** | **0.9643** | **0.8810** | **0.9643** | **1** |
| BM25 Only | 28 | 0.8571 | 0.7381 | 0.8571 | 4 |

*Note on Failed Query in RRF 1:1:* The single failure was `"Do I have to pay postage when returning a faulty product?"` where neither BM25 nor FAISS placed `DOC-006` in the top 5 without synonym expansion.

#### Final Holdout Dataset (27 Questions, $K=5$) — Cell 65
- Total test questions: 27 covering all 25 policies and 2 multi-policy questions.
- Result: **All methods retrieved every expected document for every question (100% Recall@5).**

---

## 5. Azure AI Foundry Client & Responses API Audit

### 5.1 Endpoint & Authentication
- **Target URL:** `https://abdulrahmanchohan4181-0-resource.services.ai.azure.com/openai/v1/responses`
- **Model:** `gpt-5-mini`
- **Auth Method:** `api-key` header.
- **Audit Assessment:** The Responses API request format matches the Azure AI Foundry preview specification for direct generation:
  ```json
  {
    "model": "gpt-5-mini",
    "input": "<grounded_prompt>",
    "max_output_tokens": 180,
    "store": false
  }
  ```
- **Response Extraction:** `extract_text_from_responses_api()` correctly traverses both top-level `output_text` and nested `output[].content[].text` structures.

### 5.2 Resiliency & Retry Logic
- Backoff algorithm: Exponential ($2^{\text{attempt}}$ seconds: 1s, 2s, 4s).
- Retried HTTP Statuses: 429 (Rate Limit), 500, 502, 503, 504.
- Fast-Fail Statuses: 401, 403 (Authentication failure).
- Timeouts: Explicit `(5.0, 30.0)` connect and read timeouts prevent hung threads.

---

## 6. Financial Safety & Human-in-the-Loop Verification

A primary architectural requirement is:
> **Refunds must only be staged for human approval. Never execute actual payments or refunds.**

### Audit Finding:
1. `create_refund_request()` in Cell 25 enforces status `"pending_human_approval"` on every staged record.
2. It assigns a staged ID (`REF-0001`), logs amount, currency, and customer details, and appends to `refund_requests`.
3. There is **zero integration** with Stripe, PayPal, banking rails, or automated payment APIs.
4. **Duplicate Prevention:** Before staging, the function checks if a request with `order_id` and `status == "pending_human_approval"` already exists. If found, it flags `is_duplicate = True` and returns the existing request.
5. **Conclusion:** Financial safety is structurally preserved. However, persistence and concurrency must be hardened during migration (see `ISS-06`).

---

## 7. Audit Verdict & Sign-Off Checklist

- [x] Full notebook inspected (74 cells).
- [x] Original notebook preserved untouched.
- [x] All duplicate/conflicting implementations identified.
- [x] Security vulnerabilities and endpoint exposures cataloged.
- [x] Retrieval mechanics and benchmark results documented.
- [x] Financial safety rules verified.
- [x] Application code changes blocked pending user sign-off.
