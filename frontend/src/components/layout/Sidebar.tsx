import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  PackageSearch,
  Receipt,
  Cpu,
  Bot,
  ShieldCheck,
} from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'AI Support Chat', path: '/chat', icon: MessageSquare },
  { name: 'Order Tracking', path: '/orders', icon: PackageSearch },
  { name: 'Refund Management', path: '/refunds', icon: Receipt },
  { name: 'System & Retrieval', path: '/system', icon: Cpu },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo and Brand */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <span className="font-semibold text-white text-base tracking-tight">SupportPilot</span>
              <span className="block text-[10px] text-slate-400 font-mono">HYBRID RAG v0.1</span>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  )
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Safety & Compliance Badge in sidebar footer */}
        <div className="p-4 m-3 rounded-lg bg-slate-800/80 border border-slate-700/60">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Financial Safeguard Active</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Automated payouts disabled. Refunds strictly staged for supervisor review.
          </p>
        </div>
      </aside>
    </>
  );
};
