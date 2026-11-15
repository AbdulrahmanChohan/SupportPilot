"""
SupportPilot: FAISS Vector Store Subsystem
Manages dense embedding index and cosine similarity search.
"""

from typing import List, Dict, Any, Optional
from pathlib import Path
import json
import faiss
import numpy as np

from app.core.config import settings
from app.core.logging import logger
from app.retrieval.embeddings import embedding_engine


class VectorStore:
    def __init__(self, dimension: int = settings.EMBEDDING_DIMENSION):
        self.dimension = dimension
        self.index = faiss.IndexFlatIP(dimension)
        self.documents: List[Dict[str, Any]] = []

    def build_from_file(self, file_path: Path = settings.POLICIES_PATH) -> int:
        """Loads policy documents from JSON file and builds FAISS index."""
        if not file_path.exists():
            raise FileNotFoundError(f"Knowledge base file not found at: {file_path}")

        with open(file_path, "r", encoding="utf-8") as f:
            docs = json.load(f)

        return self.build(docs)

    def build(self, documents: List[Dict[str, Any]]) -> int:
        """Encodes documents and populates the FAISS IndexFlatIP index."""
        self.documents = documents
        corpus_texts = [
            f"{doc['title']}: {doc['content']}" for doc in self.documents
        ]

        logger.info(f"Encoding {len(corpus_texts)} policy documents for FAISS...")
        embeddings = embedding_engine.encode(corpus_texts)

        self.index.reset()
        self.index.add(embeddings)
        logger.info(f"FAISS index built successfully with {self.index.ntotal} documents.")
        return self.index.ntotal

    def search(self, query: str, top_k: int = settings.RETRIEVAL_TOP_K) -> List[Dict[str, Any]]:
        """
        Executes dense semantic retrieval. Returns top-K documents with cosine scores.
        """
        if self.index.ntotal == 0:
            logger.warning("FAISS index is empty during search.")
            return []

        query_vec = embedding_engine.encode(query)
        scores, indices = self.index.search(query_vec, min(top_k, self.index.ntotal))

        results = []
        for i, idx in enumerate(indices[0]):
            if idx == -1:
                continue
            doc = self.documents[idx]
            results.append({
                "doc_id": doc["doc_id"],
                "title": doc["title"],
                "content": doc["content"],
                "score": round(float(scores[0][i]), 4)
            })

        return results


vector_store = VectorStore()
