import React from 'react';
import { Clock, AlertCircle, FileCheck2, User } from 'lucide-react';
import { StagedRefundRecord } from '../../services/api/types';
import { Badge } from '../ui/Badge';
import { Skeleton } from '../ui/Skeleton';

interface RefundTableProps {
  refunds: StagedRefundRecord[];
  isLoading: boolean;
}

export const RefundTable: React.FC<RefundTableProps> = ({ refunds, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (refunds.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
          <FileCheck2 className="w-6 h-6" />
        </div>
        <h4 className="text-base font-semibold text-slate-800">No Staged Refunds</h4>
        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          No refund requests are currently queued for supervisor review. Staged requests from the form or chat agent will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Human Approval Queue</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {refunds.length} request{refunds.length === 1 ? '' : 's'} awaiting supervisor sign-off
          </p>
        </div>
        <Badge variant="warning" size="md">
          <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
          Supervisor Action Required
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
            <tr>
              <th className="px-6 py-3.5">Request ID</th>
              <th className="px-6 py-3.5">Order</th>
              <th className="px-6 py-3.5">Customer</th>
              <th className="px-6 py-3.5">Amount</th>
              <th className="px-6 py-3.5">Reason</th>
              <th className="px-6 py-3.5">Approval Status</th>
              <th className="px-6 py-3.5">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {refunds.map((ref) => (
              <tr key={ref.request_id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-6 py-4 font-mono font-medium text-indigo-600">
                  {ref.request_id}
                </td>
                <td className="px-6 py-4 font-mono font-semibold text-slate-900">
                  #{ref.order_id}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 font-medium text-slate-800">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{ref.customer_name || 'N/A'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-mono font-semibold text-slate-900">
                  ${ref.amount !== null && ref.amount !== undefined ? ref.amount.toFixed(2) : '0.00'} {ref.currency}
                </td>
                <td className="px-6 py-4 max-w-xs text-xs text-slate-600 truncate" title={ref.reason}>
                  {ref.reason}
                </td>
                <td className="px-6 py-4">
                  <Badge variant="warning" size="sm">
                    <Clock className="w-3 h-3 mr-1 text-amber-600" />
                    {ref.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-xs text-slate-400 font-mono">
                  {ref.created_at}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
