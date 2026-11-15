import React, { useState } from 'react';
import { ShieldAlert, Receipt, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { RefundCreateRequest } from '../../services/api/types';

interface RefundFormProps {
  onSubmit: (data: RefundCreateRequest) => void;
  isLoading: boolean;
  initialOrderId?: string;
}

export const RefundForm: React.FC<RefundFormProps> = ({
  onSubmit,
  isLoading,
  initialOrderId = '',
}) => {
  const [orderId, setOrderId] = useState(initialOrderId);
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<{ orderId?: string; reason?: string }>({});

  const validate = () => {
    const newErrors: { orderId?: string; reason?: string } = {};
    if (!orderId.trim()) {
      newErrors.orderId = 'Order ID is required.';
    }
    if (!reason.trim()) {
      newErrors.reason = 'Reason for refund is required.';
    } else if (reason.trim().length < 3) {
      newErrors.reason = 'Reason must be at least 3 characters.';
    } else if (reason.trim().length > 500) {
      newErrors.reason = 'Reason cannot exceed 500 characters.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      order_id: orderId.trim(),
      reason: reason.trim(),
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
      <div className="flex items-center gap-2 mb-2">
        <Receipt className="w-5 h-5 text-indigo-600" />
        <h3 className="text-base font-semibold text-slate-900">Stage Refund Request</h3>
      </div>
      <p className="text-sm text-slate-500 mb-6">
        Submit customer refund requests into the human supervisor review queue.
      </p>

      {/* Safety Notice Banner */}
      <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 leading-relaxed">
          <strong className="font-semibold block mb-0.5">Financial Safety Operating Invariant:</strong>
          Refund requests are strictly staged with status <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-amber-900">pending_human_approval</code>.
          The AI system is cryptographically and logically prohibited from executing automated disbursements or payment transfers.
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Order ID"
          placeholder="e.g. 1024"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          error={errors.orderId}
          helperText="Order ID to lookup and attach to the refund record."
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Customer Reason for Refund
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value.slice(0, 500))}
            placeholder="e.g. Product received with defective display screen."
            className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
              errors.reason
                ? 'border-rose-300 focus:border-rose-500 text-rose-900'
                : 'border-slate-300 focus:border-indigo-600 text-slate-900'
            }`}
          />
          <div className="flex justify-between mt-1 text-xs text-slate-400">
            {errors.reason ? (
              <span className="text-rose-600">{errors.reason}</span>
            ) : (
              <span>Provide detailed rationale for audit trail.</span>
            )}
            <span className="font-mono">{reason.length}/500</span>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          className="w-full sm:w-auto"
        >
          Submit for Human Review
        </Button>
      </form>
    </div>
  );
};
