"""
SupportPilot: Dense Embedding Subsystem
Encapsulates SentenceTransformer model with L2 normalization for cosine similarity search.
"""

from typing import List, Union, Optional
import numpy as np
from sentence_transformers import SentenceTransformer
from app.core.config import settings
from app.core.logging import logger


class EmbeddingEngine:
    _instance: Optional["EmbeddingEngine"] = None
    _model: Optional[SentenceTransformer] = None

    def __new__(cls) -> "EmbeddingEngine":
        if cls._instance is None:
            cls._instance = super(EmbeddingEngine, cls).__new__(cls)
            logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL_NAME}...")
            cls._model = SentenceTransformer(settings.EMBEDDING_MODEL_NAME)
            logger.info("Embedding model loaded successfully.")
        return cls._instance

    @property
    def model(self) -> SentenceTransformer:
        if self._model is None:
            self._model = SentenceTransformer(settings.EMBEDDING_MODEL_NAME)
        return self._model

    def encode(self, texts: Union[str, List[str]]) -> np.ndarray:
        """
        Generates normalized dense embeddings.
        L2 normalization guarantees that inner product equals cosine similarity.
        """
        if isinstance(texts, str):
            texts = [texts]

        embeddings = self.model.encode(
            texts,
            convert_to_numpy=True,
            normalize_embeddings=True,
            show_progress_bar=False
        )
        return embeddings.astype("float32")


embedding_engine = EmbeddingEngine()
