import React from 'react';
import { User, Bot, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { clsx } from 'clsx';
import { ChatMessageItem } from '../../services/api/types';
import { EvidenceCard } from './EvidenceCard';
import { ToolBadge } from './ToolBadge';
import { Badge } from '../ui/Badge';

interface ChatMessageProps {
  message: ChatMessageItem;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={clsx('flex gap-3.5 my-4', isUser ? 'justify-end' : 'justify-start')}>
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          <Bot className="w-4 h-4" />
        </div>
      )}

      {/* Bubble Content */}
      <div className={clsx('max-w-2xl flex flex-col', isUser ? 'items-end' : 'items-start')}>
        {/* Author & Timestamp */}
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-xs font-medium text-slate-500">
            {isUser ? 'You' : 'SupportPilot AI'}
          </span>
          <span className="text-[11px] text-slate-400">{message.timestamp}</span>
        </div>

        {/* Message Box */}
        <div
          className={clsx(
            'p-4 rounded-xl text-sm leading-relaxed shadow-xs',
            isUser
              ? 'bg-indigo-600 text-white rounded-tr-xs'
              : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
          )}
        >
          {/* Main Answer Text */}
          <div className="whitespace-pre-wrap">
            {message.text}
            {message.isStreaming && (
              <span className="inline-block w-1.5 h-4 ml-1 bg-indigo-600 animate-pulse align-middle" />
            )}
          </div>

          {/* Tools & Decision Tag for Assistant */}
          {!isUser && (message.decision || (message.tools_used && message.tools_used.length > 0)) && (
            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
              {message.decision === 'ESCALATE' ? (
                <Badge variant="warning" size="sm">
                  <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />
                  Escalated to Human Support
                </Badge>
              ) : message.decision === 'ANSWER_GENERATED' ? (
                <Badge variant="success" size="sm">
                  <CheckCircle className="w-3 h-3 mr-1 text-emerald-600" />
                  Grounded Answer
                </Badge>
              ) : null}

              {message.tools_used?.map((tool, idx) => (
                <ToolBadge key={idx} toolName={tool} />
              ))}
            </div>
          )}
        </div>

        {/* Retrieved Policy Evidence Section (Cleanly separated from AI answer) */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-2.5 w-full bg-slate-50 border border-slate-200/80 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-2">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>Grounded Knowledge Base Evidence ({message.sources.length} Policies)</span>
            </div>
            <div className="space-y-2">
              {message.sources.map((source, idx) => (
                <EvidenceCard key={`${source.doc_id}-${idx}`} source={source} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};
