"""
SupportPilot: BM25 Sparse Search Unit Tests
Validates tokenization, BM25Okapi scoring, and keyword ranking.
"""

from app.retrieval.bm25 import tokenize_text, expand_bm25_query, BM25Store


def test_tokenize_text():
    tokens = tokenize_text("How long does 3-5 day shipping cost ($6)?")
    assert "how" in tokens
    assert "shipping" in tokens
    assert "cost" in tokens
    assert "3" in tokens
    assert "5" in tokens
    assert "6" in tokens


def test_expand_bm25_query():
    expanded = expand_bm25_query("Do I have to pay postage for returning a faulty item?")
    assert "postage" in expanded
    assert "shipping" in expanded
    assert "defective" in expanded
    assert "damaged" in expanded


def test_bm25_store_search(sample_policies):
    store = BM25Store()
    store.build(sample_policies)

    res = store.search("Standard shipping timelines", top_k=2)
    assert len(res) == 2
    assert res[0]["doc_id"] == "DOC-TEST-001"
    assert res[0]["score"] > 0


def test_bm25_empty_query(sample_policies):
    store = BM25Store()
    store.build(sample_policies)
    res = store.search("", top_k=2)
    assert res == []
