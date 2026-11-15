import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { supportApi } from '../services/api/supportApi';
import { RefundForm } from '../components/refunds/RefundForm';
import { RefundTable } from '../components/refunds/RefundTable';
import { useToast } from '../components/ui/Toast';
import { RefundCreateRequest } from '../services/api/types';

export const RefundsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialOrderId = searchParams.get('orderId') || '';
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: refunds, isLoading } = useQuery({
    queryKey: ['refunds'],
    queryFn: supportApi.getRefunds,
  });

  const createRefundMutation = useMutation({
    mutationFn: (data: RefundCreateRequest) => supportApi.createRefund(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
      if (data.is_duplicate) {
        toast.info('Existing Request Found', data.message);
      } else {
        toast.success(
          'Refund Staged for Review',
          data.message || 'Request successfully added to the human approval queue.'
        );
      }
    },
    onError: (err: Error) => {
      toast.error('Refund Staging Failed', err.message);
    },
  });

  const handleSubmit = (data: RefundCreateRequest) => {
    createRefundMutation.mutate(data);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Refund Management</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review staged customer refunds and stage new requests for human supervisor sign-off.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <RefundForm
            initialOrderId={initialOrderId}
            onSubmit={handleSubmit}
            isLoading={createRefundMutation.isPending}
          />
        </div>

        <div className="lg:col-span-2">
          <RefundTable refunds={refunds || []} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};
