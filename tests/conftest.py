"""
SupportPilot: Pytest Fixtures Configuration
Provides isolated, 100% offline-capable fixtures for unit and integration testing.
"""

import pytest
from typing import List, Dict, Any
from unittest.mock import MagicMock
from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app
from app.services.azure_ai import AzureAIClient


@pytest.fixture(scope="session")
def sample_policies() -> List[Dict[str, Any]]:
    return [
        {
            "doc_id": "DOC-TEST-001",
            "title": "Standard Shipping Timelines",
            "content": "Standard shipping takes 3 to 5 business days within the continental United States."
        },
        {
            "doc_id": "DOC-TEST-002",
            "title": "Return Window Policy",
            "content": "Customers may return unopened products within 30 days of purchase for a full refund."
        },
        {
            "doc_id": "DOC-TEST-003",
            "title": "Defective Product Exchange",
            "content": "Defective products qualify for free prepaid return shipping labels and replacement."
        }
    ]


@pytest.fixture(scope="session")
def sample_orders() -> Dict[str, Any]:
    return {
        "1024": {
            "order_id": "1024",
            "customer_name": "Alex Morgan",
            "status": "in_transit",
            "total": 89.99,
            "currency": "USD"
        },
        "1025": {
            "order_id": "1025",
            "customer_name": "Sarah Lee",
            "status": "delivered",
            "total": 149.99,
            "currency": "USD"
        }
    }


@pytest.fixture
def mock_azure_client() -> MagicMock:
    client = MagicMock(spec=AzureAIClient)
    client.generate_response.return_value = (
        "According to policy [DOC-001], standard shipping takes 3 to 5 business days within the US."
    )
    client.get_usage_stats.return_value = {
        "successful_calls": 1,
        "failed_calls": 0,
        "prompt_tokens": 120,
        "completion_tokens": 30,
        "total_tokens": 150
    }
    return client


@pytest.fixture(scope="module")
def api_client():
    with TestClient(app) as client:
        yield client


@pytest.fixture(autouse=True)
def clean_refund_requests():
    """Ensure tests run against a clean refund store and leave it clean."""
    if settings.REFUNDS_PATH.exists():
        with open(settings.REFUNDS_PATH, "w", encoding="utf-8") as f:
            f.write("[]")
    yield
    if settings.REFUNDS_PATH.exists():
        with open(settings.REFUNDS_PATH, "w", encoding="utf-8") as f:
            f.write("[]")

