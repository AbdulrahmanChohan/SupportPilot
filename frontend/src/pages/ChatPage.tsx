import React, { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, AlertCircle, Info, RefreshCcw } from 'lucide-react';
import { supportApi } from '../services/api/supportApi';
import { ChatMessageItem } from '../services/api/types';
import { ChatMessage } from '../components/chat/ChatMessage';
import { ChatInput } from '../components/chat/ChatInput';
import { useToast } from '../components/ui/Toast';

const INITIAL_MESSAGES: ChatMessageItem[] = [
  {
    id: 'welcome',
    sender: 'assistant',
    text: "Hello! I am SupportPilot, your AI customer support assistant. I can help you with store policies (shipping, returns, warranty, exchanges) or check your order status (e.g. Order #1024, #1025, #1026). How can I assist you today?",
    timestamp: 'Just now',
    decision: 'ANSWER_GENERATED',
    tools_used: [],
    sources: [],
  },
];

export const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageItem[]>(() => {
    const saved = sessionStorage.getItem('supportpilot_chat');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });
  const [isStreaming, setIsStreaming] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  useEffect(() => {
    sessionStorage.setItem('supportpilot_chat', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (query: string, orderId?: string) => {
    if (isStreaming) return;

    const userMsg: ChatMessageItem = {
      id: Math.random().toString(36).substring(2, 9),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const assistantMsgId = Math.random().toString(36).substring(2, 9);
    const initialAssistantMsg: ChatMessageItem = {
      id: assistantMsgId,
      sender: 'assistant',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true,
      tools_used: [],
      sources: [],
    };

    setMessages((prev) => [...prev, userMsg, initialAssistantMsg]);
    setIsStreaming(true);

    try {
      await supportApi.streamChat(
        {
          query,
          order_id: orderId || null,
          mock_mode: null,
        },
        {
          onToken: (token) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMsgId
                  ? { ...msg, text: msg.text + token }
                  : msg
              )
            );
          },
          onMeta: (meta) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMsgId
                  ? {
                      ...msg,
                      decision: meta.decision || msg.decision,
                      tools_used: meta.tools_used || msg.tools_used,
                      sources: meta.sources || msg.sources,
                    }
                  : msg
              )
            );
          },
          onError: (err) => {
            toast.error('Failed to get response', err.message);
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMsgId
                  ? {
                      ...msg,
                      text:
                        msg.text ||
                        `Error processing request: ${err.message}. Please verify the backend service is running on http://localhost:8000.`,
                      isError: true,
                      isStreaming: false,
                    }
                  : msg
              )
            );
            setIsStreaming(false);
          },
          onDone: () => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMsgId ? { ...msg, isStreaming: false } : msg
              )
            );
            setIsStreaming(false);
          },
        }
      );
    } catch {
      setIsStreaming(false);
    }
  };

  const handleClearChat = () => {
    setMessages(INITIAL_MESSAGES);
    sessionStorage.removeItem('supportpilot_chat');
    toast.info('Chat Cleared', 'Conversation history reset to default.');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              SupportPilot Assistant
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h2>
            <p className="text-xs text-slate-500">
              Grounded Hybrid Retrieval with Document Attribution
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-white transition-colors"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          <span>Clear History</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {isStreaming && messages[messages.length - 1]?.text === '' && (
          <div className="flex gap-3.5 my-4 items-start">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl rounded-tl-xs shadow-xs text-sm text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-xs font-medium text-slate-600">
                Retrieving policy evidence & streaming response...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isStreaming}
        onClearChat={handleClearChat}
      />
    </div>
  );
};
