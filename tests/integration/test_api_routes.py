"""
SupportPilot: FastAPI Routes Integration Tests
Tests /api/health, /api/orders, /api/refunds, and /api/chat endpoints via TestClient.
"""

from fastapi.testclient import TestClient


def test_health_endpoint(api_client: TestClient):
    response = api_client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["policies_count"] == 25
    assert data["vectors_indexed"] == 25
    assert data["bm25_indexed"] == 25


def test_order_lookup_endpoint(api_client: TestClient):
    response = api_client.get("/api/orders/1025")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["order"]["customer_name"] == "Sarah Lee"


def test_order_lookup_not_found(api_client: TestClient):
    response = api_client.get("/api/orders/8888")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_refund_staging_endpoint(api_client: TestClient):
    payload = {
        "order_id": "1026",
        "reason": "Item arrived broken"
    }
    response = api_client.post("/api/refunds", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["request"]["order_id"] == "1026"
    assert data["request"]["status"] == "pending_human_approval"


def test_chat_endpoint_policy(api_client: TestClient):
    payload = {
        "query": "How long does standard shipping take inside US?",
        "mock_mode": True
    }
    response = api_client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["decision"] == "ANSWER_GENERATED"
    assert len(data["sources"]) > 0
    assert data["sources"][0]["doc_id"] == "DOC-001"


def test_chat_endpoint_order(api_client: TestClient):
    payload = {
        "query": "What is the status of my order #1024?",
        "mock_mode": True
    }
    response = api_client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "Alex Morgan" in data["answer"]
    assert "get_order_status" in data["tools_used"]


def test_chat_validation_error(api_client: TestClient):
    # Query exceeding 500 characters
    payload = {
        "query": "x" * 501
    }
    response = api_client.post("/api/chat", json=payload)
    assert response.status_code == 422


def test_get_refunds_endpoint(api_client: TestClient):
    response = api_client.get("/api/refunds")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_policies_endpoint(api_client: TestClient):
    response = api_client.get("/api/policies")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 25
    assert data[0]["doc_id"].startswith("DOC-")


def test_chat_stream_endpoint(api_client: TestClient):
    payload = {
        "query": "How long does standard shipping take?",
        "mock_mode": True
    }
    response = api_client.post("/api/chat/stream", json=payload)
    assert response.status_code == 200
    assert "text/event-stream" in response.headers["content-type"]
    text = response.text
    assert "data: " in text
    assert "[DONE]" in text
