import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '../ui/Button';

interface OrderSearchProps {
  onSearch: (orderId: string) => void;
  isLoading: boolean;
}

const DEMO_ORDERS = ['1024', '1025', '1026'];

export const OrderSearch: React.FC<OrderSearchProps> = ({ onSearch, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    onSearch(searchTerm.trim());
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs mb-6">
      <h2 className="text-base font-semibold text-slate-900 mb-1">Look Up Customer Order</h2>
      <p className="text-sm text-slate-500 mb-4">
        Enter an Order ID to inspect shipping status, delivery timelines, and purchased items.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="e.g. 1024"
            className="w-full px-3.5 py-2 pl-9 text-sm bg-white border border-slate-300 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <Button type="submit" variant="primary" isLoading={isLoading} disabled={!searchTerm.trim()}>
          Track Order
        </Button>
      </form>

      {/* Preset Synthetic Order buttons */}
      <div className="mt-4 flex items-center gap-2 text-xs">
        <span className="text-slate-400 font-medium">Synthetic Test Orders:</span>
        {DEMO_ORDERS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setSearchTerm(id);
              onSearch(id);
            }}
            className="px-2.5 py-1 font-mono rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 border border-slate-200 transition-colors"
          >
            Order #{id}
          </button>
        ))}
      </div>
    </div>
  );
};
