"""
SupportPilot: REST API Routes
Exposes customer support conversation, order lookup, refund staging, and health endpoints.
"""

from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
from app.models.requests import ChatRequest, RefundCreateRequest
from app.models.responses import (
    ChatResponse, OrderResponse, RefundResponse, HealthResponse,
    DocumentSource, StagedRefundRecord
)
from app.core.config import settings
from app.retrieval.hybrid_search import hybrid_retriever
from app.tools.order_tools import order_service
from app.tools.refund_tools import refund_service
from app.services.support_service import support_agent, stream_support_agent

router = APIRouter(prefix="/api", tags=["SupportPilot"])


@router.get("/health", response_model=HealthResponse)
def get_health():
    """Returns application health, knowledge base stats, and model availability."""
    return HealthResponse(
        status="healthy",
        app_name=settings.APP_NAME,
        version=settings.APP_VERSION,
        policies_count=len(hybrid_retriever.vector_store.documents),
        vectors_indexed=hybrid_retriever.vector_store.index.ntotal,
        bm25_indexed=len(hybrid_retriever.bm25_store.documents),
        azure_configured=settings.is_azure_live
    )


@router.post("/chat/stream")
async def chat_stream_endpoint(request: ChatRequest):
    """
    Streaming customer support chat endpoint emitting Server-Sent Events (SSE).
    Streams tokens in real-time alongside metadata.
    """
    return StreamingResponse(
        stream_support_agent(
            query=request.query,
            order_id=request.order_id,
            mock_mode=request.mock_mode
        ),
        media_type="text/event-stream"
    )


@router.post("/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    """
    Primary customer support chat endpoint.
    Orchestrates order lookup, refund staging, and grounded knowledge base answers.
    """
    try:
        result = support_agent.run(request.query, mock_mode=request.mock_mode)

        # Extract sources if present from hybrid search
        search_res = hybrid_retriever.search(request.query, top_k=settings.RETRIEVAL_TOP_K)
        sources = [
            DocumentSource(
                doc_id=d["doc_id"],
                title=d["title"],
                rrf_score=d.get("rrf_score"),
                vector_score=d.get("vector_score"),
                bm25_score=d.get("bm25_score")
            )
            for d in search_res
        ]

        # Determine decision tag
        decision = "ANSWER_GENERATED"
        if "escalated" in result["answer"].lower():
            decision = "ESCALATE"

        return ChatResponse(
            query=request.query,
            answer=result["answer"],
            decision=decision,
            sources=sources,
            tools_used=result["tools_used"],
            status=result["status"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing support request: {str(e)}"
        )


@router.get("/orders/{order_id}", response_model=OrderResponse)
def get_order_endpoint(order_id: str):
    """Looks up customer order status by Order ID."""
    result = order_service.get_order_status(order_id)
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result["message"]
        )
    return OrderResponse(success=True, order=result["order"])


@router.post("/refunds", response_model=RefundResponse, status_code=status.HTTP_201_CREATED)
def create_refund_endpoint(request: RefundCreateRequest):
    """
    Stages a refund request for human supervisor approval.
    Does NOT disburse funds automatically.
    """
    result = refund_service.create_refund_request(request.order_id, request.reason)
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["message"]
        )

    req_data = result.get("request")
    record = None
    if req_data:
        record = StagedRefundRecord(
            request_id=req_data["request_id"],
            order_id=req_data["order_id"],
            customer_name=req_data.get("customer_name"),
            reason=req_data["reason"],
            amount=req_data.get("amount"),
            currency=req_data.get("currency", "USD"),
            status=req_data.get("status", "pending_human_approval"),
            created_at=req_data["created_at"]
        )

    return RefundResponse(
        success=True,
        message=result["message"],
        request=record,
        is_duplicate=result.get("is_duplicate", False)
    )


@router.get("/refunds", response_model=List[StagedRefundRecord])
def get_refunds_endpoint():
    """Returns all staged refund requests pending human approval."""
    raw_refunds = refund_service.get_all_staged_requests()
    return [
        StagedRefundRecord(
            request_id=r["request_id"],
            order_id=r["order_id"],
            customer_name=r.get("customer_name"),
            reason=r["reason"],
            amount=r.get("amount"),
            currency=r.get("currency", "USD"),
            status=r.get("status", "pending_human_approval"),
            created_at=r["created_at"]
        )
        for r in raw_refunds
    ]


@router.get("/policies")
def get_policies_endpoint():
    """Returns all indexed knowledge base policy documents."""
    return [
        {
            "doc_id": doc["doc_id"],
            "title": doc["title"],
            "content": doc["content"]
        }
        for doc in hybrid_retriever.vector_store.documents
    ]

