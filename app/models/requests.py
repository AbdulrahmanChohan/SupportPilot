"""
SupportPilot: API Request Schemas
Pydantic models validating incoming HTTP requests with safety bounds.
"""

from typing import Optional
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    query: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="Customer support question or inquiry.",
        examples=["How long does standard shipping take inside the US?"]
    )
    order_id: Optional[str] = Field(
        None,
        description="Optional customer order ID (e.g. 1024 or #1024).",
        examples=["1024"]
    )
    mock_mode: Optional[bool] = Field(
        None,
        description="Optional override for mock execution mode (defaults to server config)."
    )


class RefundCreateRequest(BaseModel):
    order_id: str = Field(
        ...,
        min_length=1,
        description="Order ID to stage for refund approval.",
        examples=["1024"]
    )
    reason: str = Field(
        ...,
        min_length=3,
        max_length=500,
        description="Reason for requesting refund.",
        examples=["Product arrived damaged during transit."]
    )
