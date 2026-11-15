"""
SupportPilot: Vector Store Unit Tests
Validates FAISS indexing, dimensionality, and cosine similarity search.
"""

from app.retrieval.vector_store import VectorStore


def test_vector_store_build_and_search(sample_policies):
    store = VectorStore(dimension=384)
    count = store.build(sample_policies)
    assert count == 3
    assert store.index.ntotal == 3

    # Query matching DOC-TEST-001
    results = store.search("How long does standard shipping take?", top_k=2)
    assert len(results) == 2
    assert results[0]["doc_id"] == "DOC-TEST-001"
    assert results[0]["score"] > 0.60
    assert -1.0 <= results[0]["score"] <= 1.0


def test_vector_store_empty_search():
    store = VectorStore(dimension=384)
    results = store.search("Any query", top_k=3)
    assert results == []
