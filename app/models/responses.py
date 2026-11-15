"""
SupportPilot: API Response Schemas
Pydantic models structuring responses with strict document attribution.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class DocumentSource(BaseModel):
    doc_id: str
    title: str
    rrf_score: Optional[float] = None
    vector_score: Optional[float] = None
    bm25_score: Optional[float] = None


class ChatResponse(BaseModel):
    query: str
    answer: str
    decision: str = Field(description="Decision made by system: ANSWER_GENERATED or ESCALATE")
    sources: List[DocumentSource] = Field(default_factory=list)
    tools_used: List[str] = Field(default_factory=list)
    status: str = "COMPLETED"


class OrderResponse(BaseModel):
    success: bool
    order: Optional[Dict[str, Any]] = None
    message: Optional[str] = None


class StagedRefundRecord(BaseModel):
    request_id: str
    order_id: str
    customer_name: Optional[str] = None
    reason: str
    amount: Optional[float] = None
    currency: str = "USD"
    status: str = "pending_human_approval"
    created_at: str


class RefundResponse(BaseModel):
    success: bool
    message: str
    request: Optional[StagedRefundRecord] = None
    is_duplicate: bool = False


class HealthResponse(BaseModel):
    status: str
    app_name: str
    version: str
    policies_count: int
    vectors_indexed: int
    bm25_indexed: int
    azure_configured: bool
