"""
SupportPilot: Data Integrity Tests
Validates schema, document counts, and field integrity of externalized data assets.
"""

import json
from app.core.config import settings


def test_policies_json_integrity():
    assert settings.POLICIES_PATH.exists(), f"Policies file missing at {settings.POLICIES_PATH}"

    with open(settings.POLICIES_PATH, "r", encoding="utf-8") as f:
        policies = json.load(f)

    assert isinstance(policies, list), "Policies must be a list"
    assert len(policies) == 25, f"Expected 25 canonical policies, got {len(policies)}"

    seen_ids = set()
    for doc in policies:
        assert "doc_id" in doc, "Missing doc_id"
        assert "title" in doc, f"Missing title in {doc.get('doc_id')}"
        assert "content" in doc, f"Missing content in {doc.get('doc_id')}"
        assert doc["doc_id"].startswith("DOC-"), f"Invalid doc_id format: {doc['doc_id']}"
        assert doc["doc_id"] not in seen_ids, f"Duplicate doc_id found: {doc['doc_id']}"
        seen_ids.add(doc["doc_id"])
        assert len(doc["title"].strip()) > 0, "Title cannot be empty"
        assert len(doc["content"].strip()) > 20, "Content too short"


def test_orders_json_integrity():
    assert settings.ORDERS_PATH.exists(), f"Orders file missing at {settings.ORDERS_PATH}"

    with open(settings.ORDERS_PATH, "r", encoding="utf-8") as f:
        orders = json.load(f)

    assert isinstance(orders, dict), "Orders must be a dictionary"
    assert len(orders) >= 3, "Orders database must contain at least 3 synthetic orders"

    for order_id in ["1024", "1025", "1026"]:
        assert order_id in orders, f"Expected order {order_id} in orders.json"
        ord_data = orders[order_id]
        assert ord_data["order_id"] == order_id
        assert "customer_name" in ord_data
        assert "status" in ord_data
        assert "total" in ord_data
        assert ord_data["total"] > 0
