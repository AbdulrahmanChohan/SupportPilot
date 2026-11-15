import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChatPage } from '../pages/ChatPage';
import { ToastProvider } from '../components/ui/Toast';
import { supportApi } from '../services/api/supportApi';

vi.mock('../services/api/supportApi', () => ({
  supportApi: {
    sendChat: vi.fn(),
    streamChat: vi.fn(),
  },
}));

describe('AI Support Chat Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('renders initial welcome message and input field', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <ChatPage />
        </ToastProvider>
      </QueryClientProvider>
    );

    expect(screen.getByText(/Hello! I am SupportPilot/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Ask a policy question or inquire about an order/i)
    ).toBeInTheDocument();
  });

  it('submits a chat query and displays assistant answer with policy evidence', async () => {
    vi.mocked(supportApi.streamChat).mockImplementationOnce(async (_payload, callbacks) => {
      callbacks.onMeta?.({
        decision: 'ANSWER_GENERATED',
        tools_used: ['search_knowledge_base'],
        sources: [
          {
            doc_id: 'DOC-001',
            title: 'Standard Shipping Timelines',
            rrf_score: 0.032,
            vector_score: 0.85,
            bm25_score: 11.2,
          },
        ],
      });
      callbacks.onToken('Standard shipping takes 3-5 business days [DOC-001].');
      callbacks.onDone?.();
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <ChatPage />
        </ToastProvider>
      </QueryClientProvider>
    );

    const input = screen.getByPlaceholderText(/Ask a policy question or inquire about an order/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'What is standard shipping?' } });
    fireEvent.click(sendButton);

    // Expect user message rendered
    expect(screen.getByText('What is standard shipping?')).toBeInTheDocument();

    // Expect assistant response and grounded evidence
    await waitFor(() => {
      expect(screen.getByText(/Standard shipping takes 3-5 business days/i)).toBeInTheDocument();
      expect(screen.getByText('DOC-001')).toBeInTheDocument();
      expect(screen.getByText('Standard Shipping Timelines')).toBeInTheDocument();
      expect(screen.getAllByText('Grounded Answer').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('handles backend API error gracefully in chat', async () => {
    vi.mocked(supportApi.streamChat).mockImplementationOnce(async (_payload, callbacks) => {
      const err = new Error('Connection refused to backend');
      callbacks.onError?.(err);
      throw err;
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <ChatPage />
        </ToastProvider>
      </QueryClientProvider>
    );

    const input = screen.getByPlaceholderText(/Ask a policy question or inquire about an order/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'Test query' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Error processing request: Connection refused to backend/i)
      ).toBeInTheDocument();
    });
  });
});
