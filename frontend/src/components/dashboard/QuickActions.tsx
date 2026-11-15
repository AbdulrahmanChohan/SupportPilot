import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, PackageSearch, Receipt, BookOpen, ArrowRight } from 'lucide-react';

const actions = [
  {
    title: 'AI Support Chat',
    description: 'Interact with the grounded support assistant, run order inquiries, and review policy citations.',
    path: '/chat',
    icon: MessageSquare,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
  },
  {
    title: 'Order Tracking',
    description: 'Lookup synthetic orders (#1024, #1025, #1026) to inspect shipment milestones and item details.',
    path: '/orders',
    icon: PackageSearch,
    color: 'text-sky-600 bg-sky-50 border-sky-100',
  },
  {
    title: 'Refund Approval Queue',
    description: 'Manage staged refund requests awaiting human review. Zero automated disbursements.',
    path: '/refunds',
    icon: Receipt,
    color: 'text-amber-600 bg-amber-50 border-amber-100',
  },
  {
    title: 'Knowledge Base & Retrieval',
    description: 'Inspect the 25 indexed policy documents, vector similarity parameters, and RRF settings.',
    path: '/system',
    icon: BookOpen,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  },
];

export const QuickActions: React.FC = () => {
  return (
    <div>
      <h3 className="text-base font-semibold text-slate-900 mb-3">Quick Navigation</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Link
              key={act.path}
              to={act.path}
              className="p-5 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all group flex flex-col justify-between"
            >
              <div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border mb-3 ${act.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {act.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {act.description}
                </p>
              </div>

              <div className="mt-4 flex items-center text-xs font-medium text-indigo-600 gap-1">
                <span>Open Section</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
