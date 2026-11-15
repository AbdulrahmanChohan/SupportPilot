"""
SupportPilot: Hybrid Retrieval & Reciprocal Rank Fusion (RRF) Subsystem
Fuses dense semantic vectors and sparse BM25 scores without score-scale collisions.
"""

from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.core.logging import logger
from app.retrieval.vector_store import vector_store, VectorStore
from app.retrieval.bm25 import bm25_store, BM25Store


def compute_rrf(
    vector_res: List[Dict[str, Any]],
    bm25_res: List[Dict[str, Any]],
    k: int = settings.RRF_K,
    top_n: int = settings.RETRIEVAL_TOP_K
) -> List[Dict[str, Any]]:
    """
    Computes Reciprocal Rank Fusion (RRF) score:
    Score(d) = sum(1.0 / (k + rank)) across available ranked lists.
    Preserves vector and lexical scores in document metadata.
    """
    rrf_scores: Dict[str, float] = {}
    doc_metadata: Dict[str, Dict[str, Any]] = {}
    vector_scores: Dict[str, float] = {}
    bm25_scores: Dict[str, float] = {}

    for rank, item in enumerate(vector_res, start=1):
        doc_id = item["doc_id"]
        doc_metadata[doc_id] = {
            "doc_id": item["doc_id"],
            "title": item["title"],
            "content": item["content"]
        }
        vector_scores[doc_id] = item["score"]
        rrf_scores[doc_id] = rrf_scores.get(doc_id, 0.0) + (1.0 / (k + rank))

    for rank, item in enumerate(bm25_res, start=1):
        doc_id = item["doc_id"]
        if doc_id not in doc_metadata:
            doc_metadata[doc_id] = {
                "doc_id": item["doc_id"],
                "title": item["title"],
                "content": item["content"]
            }
        bm25_scores[doc_id] = item["score"]
        rrf_scores[doc_id] = rrf_scores.get(doc_id, 0.0) + (1.0 / (k + rank))

    sorted_docs = sorted(rrf_scores.items(), key=lambda x: x[1], reverse=True)[:top_n]

    results = []
    for doc_id, rrf_score in sorted_docs:
        entry = doc_metadata[doc_id].copy()
        entry["rrf_score"] = round(rrf_score, 6)
        entry["vector_score"] = round(vector_scores.get(doc_id, 0.0), 4)
        entry["bm25_score"] = round(bm25_scores.get(doc_id, 0.0), 4)
        entry["score"] = entry["rrf_score"]
        results.append(entry)

    return results


class HybridRetriever:
    def __init__(
        self,
        v_store: VectorStore = vector_store,
        b_store: BM25Store = bm25_store,
        rrf_k: int = settings.RRF_K
    ):
        self.vector_store = v_store
        self.bm25_store = b_store
        self.rrf_k = rrf_k

    def initialize(self) -> None:
        """Initializes both stores from configured policy data path."""
        self.vector_store.build_from_file()
        self.bm25_store.build_from_file()

    def search(
        self,
        query: str,
        top_k: int = settings.RETRIEVAL_TOP_K,
        expand_bm25: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Executes hybrid retrieval by retrieving candidate pools (2 * top_k)
        and fusing rankings using Reciprocal Rank Fusion.
        """
        candidate_pool = top_k * 2
        v_res = self.vector_store.search(query, top_k=candidate_pool)
        b_res = self.bm25_store.search(query, top_k=candidate_pool, expand_query=expand_bm25)
        return compute_rrf(v_res, b_res, k=self.rrf_k, top_n=top_k)


hybrid_retriever = HybridRetriever()
