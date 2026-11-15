import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supportApi } from '../services/api/supportApi';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import {
  Cpu,
  Layers,
  Search,
  BookOpen,
  Cloud,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react';

export const SystemPage: React.FC = () => {
  const [searchFilter, setSearchFilter] = useState('');
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);

  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ['health'],
    queryFn: supportApi.getHealth,
  });

  const { data: policies, isLoading: policiesLoading } = useQuery({
    queryKey: ['policies'],
    queryFn: supportApi.getPolicies,
  });

  const filteredPolicies = (policies || []).filter(
    (p) =>
      p.doc_id.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.content.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          System & Retrieval Architecture
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Technical specifications for hybrid RAG pipeline, FAISS index, BM25 tokenizer, and knowledge base documents.
        </p>
      </div>

      {/* Architecture Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* FAISS Vector Store Card */}
        <Card>
          <CardHeader
            title="Dense Vector Store (FAISS)"
            description="Semantic embedding search"
            action={<Badge variant="purple">all-MiniLM-L6-v2</Badge>}
          />
          <CardContent className="space-y-3 text-xs text-slate-600">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400">Index Type</span>
              <span className="font-mono font-semibold text-slate-800">IndexFlatIP</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400">Dimensions</span>
              <span className="font-mono font-semibold text-slate-800">384</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400">Distance Metric</span>
              <span className="font-mono font-semibold text-slate-800">Cosine (L2 normalized)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400">Relevance Threshold</span>
              <span className="font-mono font-semibold text-emerald-600">0.40</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Total Vectors</span>
              <span className="font-mono font-semibold text-slate-800">
                {health?.vectors_indexed ?? 25}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* BM25 Sparse Search Card */}
        <Card>
          <CardHeader
            title="Sparse Keyword Search"
            description="Lexical inverted index"
            action={<Badge variant="warning">BM25Okapi</Badge>}
          />
          <CardContent className="space-y-3 text-xs text-slate-600">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400">Algorithm</span>
              <span className="font-mono font-semibold text-slate-800">BM25Okapi</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400">Tokenization</span>
              <span className="font-mono font-semibold text-slate-800">Regex [a-zA-Z0-9]+</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400">Synonym Expansion</span>
              <span className="font-mono font-semibold text-slate-800">Active (return/refund/transit)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400">Candidate Pool</span>
              <span className="font-mono font-semibold text-slate-800">2 × top_k</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Indexed Docs</span>
              <span className="font-mono font-semibold text-slate-800">
                {health?.bm25_indexed ?? 25}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Fusion & Generation Card */}
        <Card>
          <CardHeader
            title="Fusion & Generation"
            description="Reciprocal Rank Fusion & LLM"
            action={<Badge variant="success">RRF 1:1</Badge>}
          />
          <CardContent className="space-y-3 text-xs text-slate-600">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400">Rank Fusion Constant</span>
              <span className="font-mono font-semibold text-slate-800">k = 60</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400">Fusion Weights</span>
              <span className="font-mono font-semibold text-slate-800">1:1 (Vector : BM25)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400">LLM Engine</span>
              <span className="font-mono font-semibold text-indigo-600">
                {health?.azure_configured ? 'Azure GPT-5-mini' : 'Deterministic Grounded Stub'}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400">Max Tokens</span>
              <span className="font-mono font-semibold text-slate-800">300</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Safety Delimiters</span>
              <span className="font-mono font-semibold text-emerald-600">&lt;customer_inquiry&gt;</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Policy Documents Knowledge Base Explorer */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-semibold text-slate-900">
                Knowledge Base Policies ({filteredPolicies.length} / {policies?.length ?? 25})
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Store policies indexed into FAISS and BM25 stores for grounded customer support.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter policies by keyword..."
              className="w-full px-3 py-1.5 pl-8 text-xs bg-slate-50 border border-slate-300 rounded-lg placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {policiesLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : filteredPolicies.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            No policies matching "{searchFilter}"
          </div>
        ) : (
          <div className="space-y-2">
            {filteredPolicies.map((doc) => {
              const isExpanded = expandedDoc === doc.doc_id;
              return (
                <div
                  key={doc.doc_id}
                  className="border border-slate-200 rounded-lg overflow-hidden transition-colors hover:border-slate-300"
                >
                  <button
                    onClick={() => setExpandedDoc(isExpanded ? null : doc.doc_id)}
                    className="w-full px-4 py-3 bg-white text-left flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {doc.doc_id}
                      </span>
                      <span className="text-sm font-medium text-slate-800">{doc.title}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-700 leading-relaxed font-sans">
                      <p>{doc.content}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
