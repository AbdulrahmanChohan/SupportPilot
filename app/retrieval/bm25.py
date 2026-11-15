"""
SupportPilot: BM25 Sparse Keyword Retrieval Subsystem
Implements regex tokenization, BM25Okapi scoring, and optional synonym expansion.
"""

from typing import List, Dict, Any, Optional
from pathlib import Path
import json
import re
import numpy as np
from rank_bm25 import BM25Okapi

from app.core.config import settings
from app.core.logging import logger

# Optional vocabulary expansion map (from research in notebook Cell 57)
BM25_SYNONYMS: Dict[str, str] = {
    "faulty": "defective damaged",
    "defective": "faulty damaged",
    "postage": "shipping label return shipping",
    "returning": "return returns",
    "pay": "fee cost charge",
    "broken": "damaged defective",
    "swap": "exchange replace",
    "delivery": "shipping shipment",
    "arrive": "delivery shipment",
    "charged": "payment billing charge",
    "twice": "duplicate double",
}


def tokenize_text(text: str) -> List[str]:
    """Regex tokenizer removing punctuation and normalizing to lowercase."""
    return re.findall(r"\b[a-z0-9]+\b", text.lower())


def expand_bm25_query(query: str) -> str:
    """Expands query terms using the predefined synonym dictionary."""
    words = re.findall(r"\b[\w'-]+\b", query.lower())
    additions = []
    for word in words:
        if word in BM25_SYNONYMS:
            additions.append(BM25_SYNONYMS[word])
    if additions:
        return query + " " + " ".join(additions)
    return query


class BM25Store:
    def __init__(self):
        self.documents: List[Dict[str, Any]] = []
        self.tokenized_corpus: List[List[str]] = []
        self.index: Optional[BM25Okapi] = None

    def build_from_file(self, file_path: Path = settings.POLICIES_PATH) -> int:
        """Loads policies from JSON and builds BM25 index."""
        if not file_path.exists():
            raise FileNotFoundError(f"Knowledge base file not found at: {file_path}")

        with open(file_path, "r", encoding="utf-8") as f:
            docs = json.load(f)

        return self.build(docs)

    def build(self, documents: List[Dict[str, Any]]) -> int:
        """Builds BM25Okapi index over document titles and contents."""
        self.documents = documents
        self.tokenized_corpus = [
            tokenize_text(doc["title"] + " " + doc["content"])
            for doc in self.documents
        ]
        self.index = BM25Okapi(self.tokenized_corpus)
        logger.info(f"BM25 index built successfully with {len(self.tokenized_corpus)} documents.")
        return len(self.documents)

    def search(
        self,
        query: str,
        top_k: int = settings.RETRIEVAL_TOP_K,
        expand_query: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Executes sparse keyword retrieval.
        Returns top-K documents ranked by BM25 score.
        """
        if self.index is None or not self.documents:
            logger.warning("BM25 index is uninitialized or empty.")
            return []

        search_query = expand_bm25_query(query) if expand_query else query
        tokens = tokenize_text(search_query)

        if not tokens:
            return []

        scores = self.index.get_scores(tokens)
        top_indices = np.argsort(scores)[::-1][:min(top_k, len(self.documents))]

        results = []
        for idx in top_indices:
            doc = self.documents[idx]
            results.append({
                "doc_id": doc["doc_id"],
                "title": doc["title"],
                "content": doc["content"],
                "score": round(float(scores[idx]), 4)
            })

        return results


bm25_store = BM25Store()
