import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { RefundsPage } from '../pages/RefundsPage';
import { ToastProvider } from '../components/ui/Toast';
import { supportApi } from '../services/api/supportApi';

vi.mock('../services/api/supportApi', () => ({
  supportApi: {
    getRefunds: vi.fn(),
    createRefund: vi.fn(),
  },
}));

describe('Refund Management & Human Approval Workflow', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    vi.clearAllMocks();
    vi.mocked(supportApi.getRefunds).mockResolvedValue([]);
  });

  it('validates refund form fields before submission', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <MemoryRouter>
            <RefundsPage />
          </MemoryRouter>
        </ToastProvider>
      </QueryClientProvider>
    );

    const submitBtn = screen.getByRole('button', { name: /submit for human review/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText('Order ID is required.')).toBeInTheDocument();
    expect(screen.getByText('Reason for refund is required.')).toBeInTheDocument();
    expect(supportApi.createRefund).not.toHaveBeenCalled();
  });

  it('renders pending_human_approval badge and staged refund in table', async () => {
    const mockRefunds = [
      {
        request_id: 'REF-0001',
        order_id: '1025',
        customer_name: 'Sarah Lee',
        reason: 'Defective screen upon arrival',
        amount: 149.99,
        currency: 'USD',
        status: 'pending_human_approval',
        created_at: '2026-11-15 11:00:00',
      },
    ];

    vi.mocked(supportApi.getRefunds).mockResolvedValue(mockRefunds);

    render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <MemoryRouter>
            <RefundsPage />
          </MemoryRouter>
        </ToastProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('REF-0001')).toBeInTheDocument();
      expect(screen.getByText('#1025')).toBeInTheDocument();
      expect(screen.getByText('Sarah Lee')).toBeInTheDocument();
      expect(screen.getByText('$149.99 USD')).toBeInTheDocument();
      expect(screen.getAllByText('pending_human_approval').length).toBeGreaterThanOrEqual(2);
    });
  });

  it('enforces financial safety invariant: never renders automated payout buttons', async () => {
    vi.mocked(supportApi.getRefunds).mockResolvedValueOnce([]);

    render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <MemoryRouter>
            <RefundsPage />
          </MemoryRouter>
        </ToastProvider>
      </QueryClientProvider>
    );

    // Assert safety notice is visible
    expect(screen.getByText(/Financial Safety Operating Invariant/i)).toBeInTheDocument();

    // Assert that no buttons offer to disburse, execute payment, or payout directly
    expect(screen.queryByRole('button', { name: /payout/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /disburse/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /execute refund/i })).not.toBeInTheDocument();
  });
});
