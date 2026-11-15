"""
SupportPilot: Refund Staging Tool Safety & Logic Unit Tests
Verifies human approval staging, duplicate checks, and financial safety invariants.
"""

import pytest
from app.tools.refund_tools import refund_service


def test_refund_staging_success():
    # Stage refund for order 1025
    res = refund_service.create_refund_request("1025", "Item was received with defect")
    assert res["success"] is True
    assert "created and awaiting human support approval" in res["message"]

    req = res["request"]
    assert req["order_id"] == "1025"
    assert req["customer_name"] == "Sarah Lee"
    assert req["status"] == "pending_human_approval"
    assert req["request_id"].startswith("REF-")


def test_refund_duplicate_prevention():
    # Attempting to stage a duplicate refund for the same order
    res1 = refund_service.create_refund_request("1024", "First refund request attempt")
    assert res1["success"] is True

    # Second request for same order must be flagged duplicate
    res2 = refund_service.create_refund_request("1024", "Duplicate refund request attempt")
    assert res2["success"] is True
    assert res2.get("is_duplicate") is True
    assert "already exists" in res2["message"]


def test_refund_nonexistent_order():
    res = refund_service.create_refund_request("9999", "Order does not exist")
    assert res["success"] is False
    assert "not found" in res["message"].lower()


def test_financial_safety_invariant():
    """
    CRITICAL FINANCIAL INVARIANT:
    Assert that refund requests NEVER disburse funds or set status to approved/paid.
    """
    staged = refund_service.get_all_staged_requests()
    for item in staged:
        assert item["status"] == "pending_human_approval", f"Violation: status was {item['status']}"
        assert "paid" not in item["status"].lower()
        assert "approved" not in item["status"].lower() or item["status"] == "pending_human_approval"
