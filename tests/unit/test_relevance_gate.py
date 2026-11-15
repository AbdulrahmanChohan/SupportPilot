"""
SupportPilot: Relevance Gate Unit Tests
Verifies semantic confidence thresholding (0.40) and escalation boundaries.
"""

from app.services.support_service import check_retrieval_relevance
from app.retrieval.hybrid_search import hybrid_retriever


def test_relevance_gate_in_scope_query():
    # In-scope query must exceed threshold 0.40 and produce REVIEW_EVIDENCE
    hybrid_retriever.initialize()
    res = check_retrieval_relevance("How long does standard shipping take inside the US?", threshold=0.40)

    assert res["decision"] == "REVIEW_EVIDENCE"
    assert res["supported"] is True
    assert res["top_score"] >= 0.40
    assert len(res["evidence"]) > 0
    assert res["evidence"][0]["doc_id"] == "DOC-001"


def test_relevance_gate_out_of_scope_query():
    # Unrelated queries must fall below threshold 0.40 and trigger ESCALATE
    hybrid_retriever.initialize()
    res = check_retrieval_relevance("What is the current price of Bitcoin?", threshold=0.40)

    assert res["decision"] == "ESCALATE"
    assert res["supported"] is False
    assert res["top_score"] < 0.40
    assert "Escalated" in res["message"]


def test_relevance_gate_another_out_of_scope():
    hybrid_retriever.initialize()
    res = check_retrieval_relevance("Do you have a physical retail store in London?", threshold=0.40)
    assert res["decision"] == "ESCALATE"
    assert res["supported"] is False
