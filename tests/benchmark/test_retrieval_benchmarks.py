"""
SupportPilot: Historical Retrieval Benchmark Regression Tests
Validates that Hybrid RRF 1:1 reproduces the canonical historical Recall and MRR baselines.
"""

from app.retrieval.hybrid_search import hybrid_retriever
from evaluation.benchmark import load_dataset, run_retrieval_benchmark


def test_canonical_retrieval_baseline():
    """
    Validates canonical 10-query benchmark from notebook Cell 17:
    Hybrid RRF Recall@3 must equal 1.0 (100%).
    """
    hybrid_retriever.initialize()
    dataset = load_dataset("canonical")
    df_results = run_retrieval_benchmark(dataset, k=3)

    hybrid_row = df_results[df_results["Method"] == "Hybrid Search (RRF 1:1)"].iloc[0]
    faiss_row = df_results[df_results["Method"] == "Dense Vector Search (FAISS)"].iloc[0]

    # Historical baseline assertions
    assert hybrid_row["Recall@3"] == 1.0, f"Expected Recall@3=1.0, got {hybrid_row['Recall@3']}"
    assert faiss_row["Recall@3"] == 1.0, f"Expected FAISS Recall@3=1.0, got {faiss_row['Recall@3']}"
    assert hybrid_row["MRR"] >= 0.85, f"Expected MRR >= 0.85, got {hybrid_row['MRR']}"
