"""
SupportPilot: Refund Staging Tool (Human Approval Workflow)
Stages refund requests for human supervisor approval.
INVARIANT: Never executes automated payments or disbursements.
"""

from typing import Dict, Any, List, Optional
from pathlib import Path
import json
import time
from filelock import FileLock

from app.core.config import settings
from app.core.logging import logger
from app.tools.order_tools import order_service, OrderService


class RefundService:
    def __init__(
        self,
        refunds_path: Path = settings.REFUNDS_PATH,
        order_svc: OrderService = order_service
    ):
        self.refunds_path = refunds_path
        self.order_service = order_svc
        self.lock_path = Path(str(self.refunds_path) + ".lock")

    def _read_refunds(self) -> List[Dict[str, Any]]:
        if not self.refunds_path.exists():
            return []
        try:
            with open(self.refunds_path, "r", encoding="utf-8") as f:
                content = f.read().strip()
                return json.loads(content) if content else []
        except Exception as e:
            logger.error(f"Error reading refund requests file: {e}")
            return []

    def _write_refunds(self, refunds: List[Dict[str, Any]]) -> None:
        temp_path = self.refunds_path.with_suffix(".tmp")
        with open(temp_path, "w", encoding="utf-8") as f:
            json.dump(refunds, f, indent=2)
        temp_path.replace(self.refunds_path)

    def create_refund_request(self, order_id: str, reason: str) -> Dict[str, Any]:
        """
        Stages a refund request for human supervisor approval.
        Does NOT disburse funds automatically.
        Enforces atomic duplicate prevention and audit logging.
        """
        cleaned_id = str(order_id).strip().replace("#", "")
        order_lookup = self.order_service.get_order_status(cleaned_id)

        if not order_lookup["success"]:
            return {
                "success": False,
                "message": f"Order #{cleaned_id} not found. Cannot create refund request."
            }

        order = order_lookup["order"]

        # Acquire file lock to ensure atomic, concurrency-safe staging
        with FileLock(str(self.lock_path), timeout=5.0):
            refunds = self._read_refunds()

            # Prevent duplicate pending requests for the same order
            for existing in refunds:
                if (
                    existing.get("order_id") == cleaned_id
                    and existing.get("status") == "pending_human_approval"
                ):
                    logger.info(f"Duplicate refund request prevented for Order #{cleaned_id}.")
                    return {
                        "success": True,
                        "message": f"A pending refund request already exists for Order #{cleaned_id}.",
                        "request": existing,
                        "is_duplicate": True
                    }

            request_id = f"REF-{len(refunds) + 1:04d}"
            record = {
                "request_id": request_id,
                "order_id": cleaned_id,
                "customer_name": order.get("customer_name"),
                "reason": reason.strip(),
                "amount": order.get("total"),
                "currency": order.get("currency", "USD"),
                "status": "pending_human_approval",
                "created_at": time.strftime("%Y-%m-%d %H:%M:%S")
            }

            refunds.append(record)
            self._write_refunds(refunds)

        logger.info(f"Refund request {request_id} staged successfully for Order #{cleaned_id}.")
        return {
            "success": True,
            "message": f"Refund request {request_id} created and awaiting human support approval.",
            "request": record,
            "is_duplicate": False
        }

    def get_all_staged_requests(self) -> List[Dict[str, Any]]:
        """Returns all staged refund requests."""
        with FileLock(str(self.lock_path), timeout=5.0):
            return self._read_refunds()


refund_service = RefundService()
