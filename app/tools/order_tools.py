"""
SupportPilot: Order Lookup Tool
Retrieves customer order information safely from the orders repository.
"""

from typing import Dict, Any, Optional
from pathlib import Path
import json

from app.core.config import settings
from app.core.logging import logger


class OrderService:
    def __init__(self, orders_path: Path = settings.ORDERS_PATH):
        self.orders_path = orders_path
        self._orders_cache: Optional[Dict[str, Any]] = None

    def _load_orders(self) -> Dict[str, Any]:
        if not self.orders_path.exists():
            logger.error(f"Orders database not found at: {self.orders_path}")
            return {}
        with open(self.orders_path, "r", encoding="utf-8") as f:
            return json.load(f)

    @property
    def orders(self) -> Dict[str, Any]:
        if self._orders_cache is None:
            self._orders_cache = self._load_orders()
        return self._orders_cache

    def get_order_status(self, order_id: str) -> Dict[str, Any]:
        """Looks up order details for a given customer order ID."""
        cleaned_id = str(order_id).strip().replace("#", "")
        order = self.orders.get(cleaned_id)

        if not order:
            logger.info(f"Order #{cleaned_id} lookup failed (not found).")
            return {
                "success": False,
                "message": f"Order #{cleaned_id} not found in our records."
            }

        logger.info(f"Order #{cleaned_id} retrieved successfully.")
        return {
            "success": True,
            "order": order
        }


order_service = OrderService()
