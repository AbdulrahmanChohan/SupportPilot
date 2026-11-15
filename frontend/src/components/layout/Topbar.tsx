import React from 'react';
import { Menu, Activity, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supportApi } from '../../services/api/supportApi';
import { Badge } from '../ui/Badge';

interface TopbarProps {
  onToggleSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {
  const { data: health, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['health'],
    queryFn: supportApi.getHealth,
    refetchInterval: 1000 * 30, // 30s polling
  });

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
          <span className="font-medium text-slate-900">SupportPilot Control Center</span>
          <span>/</span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
            Hybrid RRF 1:1
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Backend health status pill */}
        {isLoading ? (
          <Badge variant="default" size="sm">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5 animate-pulse" />
            Connecting Backend...
          </Badge>
        ) : isError || !health ? (
          <Badge variant="error" size="sm">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5" />
            Backend Offline
          </Badge>
        ) : (
          <div className="flex items-center gap-2">
            <Badge variant="success" size="sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              API Connected
            </Badge>
            <span className="hidden md:inline-flex text-xs text-slate-400 font-mono">
              {health.policies_count} Docs | {health.vectors_indexed} Vectors
            </span>
          </div>
        )}

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
          title="Refresh Backend Status"
          aria-label="Refresh Backend Status"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-indigo-600' : ''}`} />
        </button>
      </div>
    </header>
  );
};
