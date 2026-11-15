"""
SupportPilot: Order Service Unit Tests
Validates customer order lookup and edge cases.
"""

from app.tools.order_tools import order_service


def test_order_status_success():
    res = order_service.get_order_status("1024")
    assert res["success"] is True
    assert res["order"]["order_id"] == "1024"
    assert res["order"]["customer_name"] == "Alex Morgan"
    assert res["order"]["status"] == "in_transit"


def test_order_status_with_hash():
    res = order_service.get_order_status("#1025")
    assert res["success"] is True
    assert res["order"]["order_id"] == "1025"
    assert res["order"]["customer_name"] == "Sarah Lee"


def test_order_status_not_found():
    res = order_service.get_order_status("9999")
    assert res["success"] is False
    assert "not found" in res["message"].lower()
