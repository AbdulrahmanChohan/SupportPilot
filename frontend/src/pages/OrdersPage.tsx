import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supportApi } from '../services/api/supportApi';
import { OrderSearch } from '../components/orders/OrderSearch';
import { OrderCard } from '../components/orders/OrderCard';
import { Skeleton } from '../components/ui/Skeleton';
import { AlertCircle, PackageSearch } from 'lucide-react';
import { useToast } from '../components/ui/Toast';

export const OrdersPage: React.FC = () => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>('1024');
  const navigate = useNavigate();
  const toast = useToast();

  const {
    data: orderResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['order', selectedOrderId],
    queryFn: () => supportApi.getOrder(selectedOrderId),
    enabled: !!selectedOrderId,
    retry: false,
  });

  const handleSearch = (id: string) => {
    setSelectedOrderId(id);
  };

  const handleRequestRefund = (orderId: string) => {
    navigate(`/refunds?orderId=${encodeURIComponent(orderId)}`);
    toast.info('Refund Form Prepared', `Staging refund for Order #${orderId}.`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Order Tracking</h1>
        <p className="text-sm text-slate-500 mt-1">
          Inspect order status, item manifestations, and delivery milestones.
        </p>
      </div>

      {/* Search Bar with Demo Chips */}
      <OrderSearch onSearch={handleSearch} isLoading={isLoading} />

      {/* Results Section */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 space-y-4">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
          <Skeleton className="h-36 w-full" />
        </div>
      ) : isError ? (
        <div className="bg-white rounded-xl border border-rose-200 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Order Not Found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {error instanceof Error ? error.message : `Order #${selectedOrderId} was not found in our records.`}
          </p>
          <p className="text-xs text-slate-400 mt-3 font-mono">
            Valid test orders: 1024, 1025, 1026
          </p>
        </div>
      ) : orderResponse?.order ? (
        <OrderCard
          order={orderResponse.order}
          onRequestRefund={handleRequestRefund}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
          <PackageSearch className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Enter an Order ID above to view details</p>
        </div>
      )}
    </div>
  );
};
