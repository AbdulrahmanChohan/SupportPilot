import React from 'react';
import { Wrench, PackageSearch, Receipt, Search } from 'lucide-react';

interface ToolBadgeProps {
  toolName: string;
}

export const ToolBadge: React.FC<ToolBadgeProps> = ({ toolName }) => {
  let label = toolName;
  let icon = <Wrench className="w-3 h-3 text-slate-500" />;

  if (toolName === 'get_order_status') {
    label = 'Order Lookup Tool';
    icon = <PackageSearch className="w-3 h-3 text-sky-600" />;
  } else if (toolName === 'create_refund_request') {
    label = 'Refund Staging Tool';
    icon = <Receipt className="w-3 h-3 text-amber-600" />;
  } else if (toolName === 'search_knowledge_base') {
    label = 'Hybrid Retrieval Engine';
    icon = <Search className="w-3 h-3 text-indigo-600" />;
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
      {icon}
      <span>{label}</span>
    </span>
  );
};
