"""
SupportPilot: Evaluation Metrics Unit Tests
Validates Recall@K, MRR, and multi-phrase concept verification.
"""

from app.services.evaluation import (
    recall_at_k, reciprocal_rank, hit_rate_at_k, evaluate_answer_quality
)


def test_recall_at_k():
    retrieved = ["DOC-001", "DOC-002", "DOC-003"]
    assert recall_at_k(retrieved, "DOC-001", k=1) == 1.0
    assert recall_at_k(retrieved, "DOC-002", k=1) == 0.0
    assert recall_at_k(retrieved, "DOC-002", k=2) == 1.0
    assert recall_at_k(retrieved, "DOC-005", k=3) == 0.0


def test_reciprocal_rank():
    retrieved = ["DOC-001", "DOC-002", "DOC-003"]
    assert reciprocal_rank(retrieved, "DOC-001") == 1.0
    assert reciprocal_rank(retrieved, "DOC-002") == 0.5
    assert reciprocal_rank(retrieved, "DOC-003") == round(1.0 / 3, 4) or abs(reciprocal_rank(retrieved, "DOC-003") - 1/3) < 1e-4
    assert reciprocal_rank(retrieved, "DOC-004") == 0.0


def test_evaluate_answer_quality():
    answer = (
        "Under our policy [DOC-025], customers may request an exchange within 30 days of purchase "
        "for unused items in original packaging. A $6 return label fee applies."
    )
    checks = [
        {"label": "30-day window", "required_phrases": ["30 days"]},
        {"label": "Unused condition", "required_phrases": ["unused"]},
        {"label": "Original packaging", "required_phrases": ["original packaging"]},
        {"label": "$6 label fee", "required_phrases": ["$6", "return label"]}
    ]
    res = evaluate_answer_quality(answer, checks)
    assert res["score"] == 1.0
    assert res["passed"] is True
    assert len(res["matched_concepts"]) == 4
    assert len(res["missing_concepts"]) == 0
