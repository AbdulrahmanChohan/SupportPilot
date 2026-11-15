import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { DocumentSource } from '../../services/api/types';

interface EvidenceCardProps {
  source: DocumentSource;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ source }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-slate-200 rounded-lg p-3 bg-white text-xs text-slate-700 shadow-2xs hover:border-indigo-300 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
            {source.doc_id}
          </span>
          <span className="font-medium text-slate-800 line-clamp-1">{source.title}</span>
        </div>

        {(source.rrf_score !== undefined ||
          source.vector_score !== undefined ||
          source.bm25_score !== undefined) && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
            title="Toggle score details"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {expanded && (
        <div className="mt-2.5 pt-2 border-t border-slate-100 grid grid-cols-3 gap-2 font-mono text-[11px] text-slate-500">
          <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
            <span className="block text-[10px] uppercase text-slate-400">RRF Score</span>
            <span className="font-semibold text-indigo-600">
              {source.rrf_score !== null && source.rrf_score !== undefined
                ? source.rrf_score.toFixed(4)
                : 'N/A'}
            </span>
          </div>
          <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
            <span className="block text-[10px] uppercase text-slate-400">Vector Cosine</span>
            <span className="font-semibold text-emerald-600">
              {source.vector_score !== null && source.vector_score !== undefined
                ? source.vector_score.toFixed(4)
                : 'N/A'}
            </span>
          </div>
          <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
            <span className="block text-[10px] uppercase text-slate-400">BM25 Score</span>
            <span className="font-semibold text-amber-600">
              {source.bm25_score !== null && source.bm25_score !== undefined
                ? source.bm25_score.toFixed(2)
                : 'N/A'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
