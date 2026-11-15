import React, { useState } from 'react';
import { Send, CornerDownLeft, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

interface ChatInputProps {
  onSendMessage: (query: string, orderId?: string) => void;
  isLoading: boolean;
  onClearChat?: () => void;
}

const SUGGESTIONS = [
  'What is the standard shipping policy inside the US?',
  'Where is my order #1024?',
  'I would like to request a refund for order #1025',
  'What is the return window for opened items?',
];

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  onClearChat,
}) => {
  const [query, setQuery] = useState('');
  const [orderId, setOrderId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    onSendMessage(query.trim(), orderId.trim() || undefined);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-white border-t border-slate-200 p-4 sticky bottom-0">
      {/* Quick Prompts */}
      <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-500" /> Prompts:
        </span>
        {SUGGESTIONS.map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setQuery(s)}
            className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 border border-slate-200/80 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="relative rounded-xl border border-slate-300 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-500/20 bg-white transition-all shadow-xs">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value.slice(0, 500))}
            onKeyDown={handleKeyDown}
            placeholder="Ask a policy question or inquire about an order (e.g. #1024)..."
            rows={2}
            className="w-full px-4 pt-3 pb-8 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none"
            disabled={isLoading}
          />

          <div className="absolute bottom-2 left-4 right-3 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Optional Order ID"
                className="w-28 px-2 py-0.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
              />
              <span className="hidden sm:inline font-mono">
                {query.length}/500 chars
              </span>
            </div>

            <div className="flex items-center gap-2">
              {onClearChat && (
                <button
                  type="button"
                  onClick={onClearChat}
                  className="text-slate-400 hover:text-slate-600 text-xs transition-colors"
                >
                  Clear History
                </button>
              )}
              <Button
                type="submit"
                size="sm"
                variant="primary"
                isLoading={isLoading}
                disabled={!query.trim()}
                icon={<Send className="w-3.5 h-3.5" />}
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
