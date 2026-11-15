"""
SupportPilot: Support Service Integration Tests
Verifies agent flow, tool execution, and grounded answer generation in offline test mode.
"""

from app.services.support_service import run_support_agent, generate_support_answer
from app.retrieval.hybrid_search import hybrid_retriever


def test_agent_order_lookup_flow():
    hybrid_retriever.initialize()
    res = run_support_agent("Where is my order #1024?", mock_mode=True)

    assert res["status"] == "COMPLETED"
    assert "get_order_status" in res["tools_used"]
    assert "Alex Morgan" in res["answer"]
    assert "In Transit" in res["answer"]


def test_agent_policy_inquiry_flow():
    hybrid_retriever.initialize()
    res = run_support_agent("How long does standard shipping take inside US?", mock_mode=True)

    assert res["status"] == "COMPLETED"
    assert "search_knowledge_base" in res["tools_used"]
    assert "[DOC-001]" in res["answer"]


def test_agent_escalation_flow():
    hybrid_retriever.initialize()
    res = run_support_agent("Can I buy real estate or land through your store?", mock_mode=True)

    assert res["status"] == "COMPLETED"
    assert "escalated this inquiry to our human customer support team" in res["answer"]
