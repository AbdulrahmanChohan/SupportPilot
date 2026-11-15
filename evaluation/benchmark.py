"""
SupportPilot: Standalone Evaluation & Benchmark CLI
Reproduces historical retrieval benchmarks (Recall@K, MRR, Hit Rate@K)
and answer quality evaluations locally without requiring Azure credentials.
"""

import argparse
import json
from pathlib import Path
from typing import List, Dict, Any
import pandas as pd

from app.core.config import settings
from app.retrieval.hybrid_search import hybrid_retriever
from app.services.evaluation import recall_at_k, reciprocal_rank, hit_rate_at_k


def load_dataset(dataset_name: str) -> List[Dict[str, Any]]:
    dataset_dir = settings.BASE_DIR / "evaluation" / "datasets"
    mapping = {
        "canonical": dataset_dir / "canonical_eval.json",
        "v2": dataset_dir / "eval_v2.json",
        "v3": dataset_dir / "dev_eval_v3.json",
        "holdout": dataset_dir / "holdout_eval.json"
    }

    path = mapping.get(dataset_name.lower())
    if not path or not path.exists():
        raise FileNotFoundError(f"Evaluation dataset '{dataset_name}' not found at: {path}")

    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def run_retrieval_benchmark(dataset: List[Dict[str, Any]], k: int = 3) -> pd.DataFrame:
    """Evaluates FAISS, BM25, and Hybrid RRF over target queries."""
    methods = {
        "Dense Vector Search (FAISS)": lambda q, top_k: hybrid_retriever.vector_store.search(q, top_k=top_k),
        "Sparse Keyword Search (BM25)": lambda q, top_k: hybrid_retriever.bm25_store.search(q, top_k=top_k),
        "Hybrid Search (RRF 1:1)": lambda q, top_k: hybrid_retriever.search(q, top_k=top_k)
    }

    results = []
    total = len(dataset)

    for method_name, search_fn in methods.items():
        recalls = []
        reciprocal_ranks = []

        for item in dataset:
            query = item["query"]
            expected = item.get("expected_doc_id") or item.get("relevant_docs")

            retrieved = search_fn(query, top_k=k)
            retrieved_ids = [doc["doc_id"] for doc in retrieved]

            recalls.append(recall_at_k(retrieved_ids, expected, k=k))
            reciprocal_ranks.append(reciprocal_rank(retrieved_ids, expected))

        results.append({
            "Method": method_name,
            "Queries": total,
            f"Recall@{k}": round(sum(recalls) / total, 4) if total else 0.0,
            "MRR": round(sum(reciprocal_ranks) / total, 4) if total else 0.0,
            f"Hit Rate@{k}": round(sum(recalls) / total, 4) if total else 0.0
        })

    return pd.DataFrame(results)


def main():
    parser = argparse.ArgumentParser(description="SupportPilot Retrieval Benchmark CLI")
    parser.add_argument("--dataset", choices=["canonical", "v2", "v3", "holdout"], default="canonical",
                        help="Dataset to benchmark against (default: canonical)")
    parser.add_argument("-k", "--k", type=int, default=3, help="Top-K cutoff for Recall@K (default: 3)")
    args = parser.parse_args()

    print(f"\n{'='*70}")
    print(f"SUPPORTPILOT RETRIEVAL BENCHMARK: {args.dataset.upper()} (K={args.k})")
    print(f"{'='*70}")

    print("Initializing retrieval indexes...")
    hybrid_retriever.initialize()

    dataset = load_dataset(args.dataset)
    print(f"Loaded {len(dataset)} evaluation queries.")

    results_df = run_retrieval_benchmark(dataset, k=args.k)
    print("\nBenchmark Results:")
    print(results_df.to_markdown(index=False))
    print(f"\n{'='*70}\n")


if __name__ == "__main__":
    main()
