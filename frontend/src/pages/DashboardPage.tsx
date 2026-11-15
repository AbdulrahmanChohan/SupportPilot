import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supportApi } from '../services/api/supportApi';
import { HealthCard } from '../components/dashboard/HealthCard';
import { RetrievalChart } from '../components/dashboard/RetrievalChart';
import { QuickActions } from '../components/dashboard/QuickActions';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Receipt, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { data: health, isLoading: healthLoading, isError: healthError } = useQuery({
    queryKey: ['health'],
    queryFn: supportApi.getHealth,
  });

  const { data: refunds, isLoading: refundsLoading } = useQuery({
    queryKey: ['refunds'],
    queryFn: supportApi.getRefunds,
  });

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-sm">
        <div className="max-w-2xl">
          <Badge variant="purple" size="sm" className="mb-3 text-indigo-300 bg-indigo-900/60 border-indigo-700/60">
            Enterprise AI Customer Support RAG
          </Badge>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            SupportPilot Control Center
          </h1>
          <p className="text-sm md:text-base text-slate-300 mt-2 leading-relaxed">
            High-precision hybrid retrieval (FAISS + BM25 + RRF) with grounded Azure AI Foundry generation,
            automated order status tracking, and human-in-the-loop refund staging.
          </p>
        </div>
      </div>

      {/* Health & Indexing Infrastructure */}
      <HealthCard health={health} isLoading={healthLoading} isError={healthError} />

      {/* Main Grid: Chart & Pending Approval Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RetrievalChart />
        </div>

        <div>
          <Card className="h-full flex flex-col justify-between">
            <CardHeader
              title="Supervisor Review Queue"
              description="Staged refund requests requiring human approval."
              action={
                <Link
                  to="/refunds"
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              }
            />
            <CardContent className="flex-1">
              {refundsLoading ? (
                <div className="text-xs text-slate-400 py-6 text-center">Loading queue...</div>
              ) : !refunds || refunds.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-2">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">Queue is Clear</p>
                  <p className="text-xs text-slate-400 mt-0.5">No pending refund requests</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {refunds.slice(0, 3).map((r) => (
                    <div
                      key={r.request_id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <span className="font-mono text-indigo-600">{r.request_id}</span>
                          <span>•</span>
                          <span>Order #{r.order_id}</span>
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5 truncate max-w-[180px]">
                          {r.reason}
                        </p>
                      </div>
                      <Badge variant="warning" size="sm">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <QuickActions />
    </div>
  );
};
