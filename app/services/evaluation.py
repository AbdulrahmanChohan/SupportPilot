"""
SupportPilot: Evaluation Metrics Subsystem
Provides standardized Recall@K, MRR, Hit Rate@K, and multi-phrase concept verification.
"""

from typing import List, Dict, Any, Union


def recall_at_k(retrieved_ids: List[str], relevant_ids: Union[str, List[str]], k: int = 3) -> float:
    """Calculates Recall@K: 1.0 if any relevant doc is in top K retrieved, else 0.0."""
    if isinstance(relevant_ids, str):
        relevant_ids = [relevant_ids]
    top_k = retrieved_ids[:k]
    for r_id in relevant_ids:
        if r_id in top_k:
            return 1.0
    return 0.0


def reciprocal_rank(retrieved_ids: List[str], relevant_ids: Union[str, List[str]]) -> float:
    """Calculates Reciprocal Rank of the first relevant document retrieved."""
    if isinstance(relevant_ids, str):
        relevant_ids = [relevant_ids]
    for rank, doc_id in enumerate(retrieved_ids, start=1):
        if doc_id in relevant_ids:
            return 1.0 / rank
    return 0.0


def hit_rate_at_k(retrieved_ids: List[str], relevant_ids: Union[str, List[str]], k: int = 5) -> float:
    """Calculates Hit Rate@K (equivalent to Recall@K for single-document relevance)."""
    return recall_at_k(retrieved_ids, relevant_ids, k=k)


def evaluate_answer_quality(answer: str, expected_checks: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Evaluates grounded answers against required factual phrases.
    Avoids false positives by requiring all phrases in a concept check to match.
    """
    answer_lower = answer.lower()
    matched = []
    missing = []

    for check in expected_checks:
        required = check.get("required_phrases", [])
        if all(phrase.lower() in answer_lower for phrase in required):
            matched.append(check.get("label", "unlabeled"))
        else:
            missing.append(check.get("label", "unlabeled"))

    total = len(expected_checks)
    score = (len(matched) / total) if total > 0 else 1.0

    return {
        "score": round(score, 2),
        "passed": score >= 0.80,
        "matched_concepts": matched,
        "missing_concepts": missing
    }
