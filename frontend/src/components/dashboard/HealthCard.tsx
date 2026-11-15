import React from 'react';
import { Activity, Database, Cpu, Cloud, CheckCircle, AlertCircle } from 'lucide-react';
import { HealthResponse } from '../../services/api/types';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface HealthCardProps {
  health?: HealthResponse;
  isLoading: boolean;
  isError: boolean;
}

export const HealthCard: React.FC<HealthCardProps> = ({ health, isLoading, isError }) => {
  return (
    <Card className="mb-6">
      <CardHeader
        title="System Health & Infrastructure"
        description="Real-time status of FastAPI backend, vector indices, and language model integration."
        action={
          isLoading ? (
            <Badge variant="default">Checking...</Badge>
          ) : isError || !health ? (
            <Badge variant="error">Service Offline</Badge>
          ) : (
            <Badge variant="success">
              <CheckCircle className="w-3.5 h-3.5 mr-1" />
              Operational
            </Badge>
          )
        }
      />
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Database className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-medium uppercase tracking-wider">Policy Documents</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {health?.policies_count ?? '--'}
            </div>
            <span className="text-xs text-slate-400">DOC-001 to DOC-025</span>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Cpu className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-medium uppercase tracking-wider">FAISS Embeddings</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {health?.vectors_indexed ?? '--'}
            </div>
            <span className="text-xs text-slate-400">IndexFlatIP (384-dim)</span>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Database className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-medium uppercase tracking-wider">BM25 Vocabulary</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {health?.bm25_indexed ?? '--'}
            </div>
            <span className="text-xs text-slate-400">BM25Okapi Tokens</span>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Cloud className="w-4 h-4 text-sky-600" />
              <span className="text-xs font-medium uppercase tracking-wider">Azure AI Foundry</span>
            </div>
            <div className="text-sm font-bold text-slate-900 mt-1">
              {health?.azure_configured ? (
                <span className="text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Live GPT-5-mini
                </span>
              ) : (
                <span className="text-slate-500 flex items-center gap-1 font-mono text-xs">
                  Offline / Mock Mode
                </span>
              )}
            </div>
            <span className="text-xs text-slate-400">Responses API</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
