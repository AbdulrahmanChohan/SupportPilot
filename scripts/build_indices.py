"""
SupportPilot: Index Builder Script
Pre-indexes canonical policy documents into FAISS and BM25 stores.
"""

import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.config import settings
from app.core.logging import logger
from app.retrieval.hybrid_search import hybrid_retriever


def build():
    logger.info("Building SupportPilot retrieval stores from policies.json...")
    hybrid_retriever.initialize()
    logger.info(
        f"Build complete! FAISS vectors: {hybrid_retriever.vector_store.index.ntotal}, "
        f"BM25 documents: {len(hybrid_retriever.bm25_store.documents)}"
    )


if __name__ == "__main__":
    build()
