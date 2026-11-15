import React from 'react';
import { Package, Truck, Calendar, User, DollarSign, Receipt, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Order } from '../../services/api/types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface OrderCardProps {
  order: Order;
  onRequestRefund?: (orderId: string) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onRequestRefund }) => {
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return (
          <Badge variant="success" size="md">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Delivered
          </Badge>
        );
      case 'in_transit':
        return (
          <Badge variant="info" size="md">
            <Truck className="w-3.5 h-3.5 mr-1" /> In Transit
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="warning" size="md">
            <Clock className="w-3.5 h-3.5 mr-1" /> Processing
          </Badge>
        );
      default:
        return <Badge variant="default" size="md">{status}</Badge>;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-slate-900 font-mono">Order #{order.order_id}</h3>
            {getStatusBadge(order.status)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Payment Status: <span className="font-semibold text-emerald-600 uppercase">{order.payment_status}</span>
          </p>
        </div>

        {onRequestRefund && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRequestRefund(order.order_id)}
            icon={<Receipt className="w-3.5 h-3.5 text-amber-600" />}
          >
            Stage Refund Request
          </Button>
        )}
      </div>

      {/* Grid details */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-xs text-slate-400 font-medium uppercase">Customer</span>
            <span className="text-sm font-semibold text-slate-800">{order.customer_name}</span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600 shrink-0">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-xs text-slate-400 font-medium uppercase">Shipping Method</span>
            <span className="text-sm font-semibold text-slate-800">{order.shipping_method}</span>
            <span className="block text-xs text-slate-500">
              Tracking: <span className="font-mono text-slate-700">{order.tracking_number || 'Pending'}</span>
            </span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-xs text-slate-400 font-medium uppercase">Estimated Delivery</span>
            <span className="text-sm font-semibold text-slate-800">{order.estimated_delivery}</span>
          </div>
        </div>
      </div>

      {/* Items & Total */}
      <div className="p-6 bg-slate-50/50">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Purchased Items ({order.items.length})
        </h4>
        <div className="space-y-2 mb-4">
          {order.items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg text-sm"
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-slate-400" />
                <span className="font-medium text-slate-800">{item}</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">Qty: 1</span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-base">
          <span className="font-medium text-slate-600">Order Total</span>
          <span className="font-bold text-slate-900 font-mono">
            ${order.total.toFixed(2)} {order.currency}
          </span>
        </div>
      </div>
    </div>
  );
};
