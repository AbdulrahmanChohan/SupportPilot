"""
SupportPilot: Hybrid Search & RRF Unit Tests
Validates candidate fusion, score calculation, and metadata preservation.
"""

from app.retrieval.hybrid_search import compute_rrf, HybridRetriever
from app.retrieval.vector_store import VectorStore
from app.retrieval.bm25 import BM25Store


def test_compute_rrf_math():
    v_res = [
        {"doc_id": "DOC-A", "title": "Doc A", "content": "A", "score": 0.90},
        {"doc_id": "DOC-B", "title": "Doc B", "content": "B", "score": 0.80}
    ]
    b_res = [
        {"doc_id": "DOC-A", "title": "Doc A", "content": "A", "score": 2.50},
        {"doc_id": "DOC-C", "title": "Doc C", "content": "C", "score": 1.20}
    ]

    # k=60
    # DOC-A: 1/(60+1) + 1/(60+1) = 2/61 ≈ 0.032787
    # DOC-B: 1/(60+2) = 1/62 ≈ 0.016129
    # DOC-C: 1/(60+2) = 1/62 ≈ 0.016129
    fused = compute_rrf(v_res, b_res, k=60, top_n=3)

    assert len(fused) == 3
    assert fused[0]["doc_id"] == "DOC-A"
    assert abs(fused[0]["rrf_score"] - (2 / 61)) < 1e-4
    assert fused[0]["vector_score"] == 0.90
    assert fused[0]["bm25_score"] == 2.50


def test_hybrid_search_end_to_end(sample_policies):
    v_store = VectorStore(dimension=384)
    v_store.build(sample_policies)

    b_store = BM25Store()
    b_store.build(sample_policies)

    retriever = HybridRetriever(v_store=v_store, b_store=b_store, rrf_k=60)
    results = retriever.search("standard shipping times", top_k=2)

    assert len(results) == 2
    assert results[0]["doc_id"] == "DOC-TEST-001"
    assert "rrf_score" in results[0]
    assert "vector_score" in results[0]
    assert "bm25_score" in results[0]
