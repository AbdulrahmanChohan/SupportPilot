import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { OrdersPage } from '../pages/OrdersPage';
import { ToastProvider } from '../components/ui/Toast';
import { supportApi } from '../services/api/supportApi';

vi.mock('../services/api/supportApi', () => ({
  supportApi: {
    getOrder: vi.fn(),
  },
}));

describe('Order Tracking Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
    vi.mocked(supportApi.getOrder).mockResolvedValue({
      success: true,
      order: null,
    });
  });

  it('renders order search and synthetic preset buttons', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <MemoryRouter>
            <OrdersPage />
          </MemoryRouter>
        </ToastProvider>
      </QueryClientProvider>
    );

    expect(screen.getByText('Look Up Customer Order')).toBeInTheDocument();
    expect(screen.getByText('Order #1024')).toBeInTheDocument();
    expect(screen.getByText('Order #1025')).toBeInTheDocument();
    expect(screen.getByText('Order #1026')).toBeInTheDocument();
  });

  it('successfully retrieves and displays order details for #1024', async () => {
    const mockOrder = {
      success: true,
      order: {
        order_id: '1024',
        customer_name: 'Alex Morgan',
        status: 'in_transit',
        payment_status: 'paid',
        shipping_method: 'Standard',
        tracking_number: 'SP-DEMO-1024',
        estimated_delivery: '3-5 business days',
        items: ['Wireless Headphones'],
        total: 89.99,
        currency: 'USD',
      },
    };

    vi.mocked(supportApi.getOrder).mockResolvedValueOnce(mockOrder);

    render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <MemoryRouter>
            <OrdersPage />
          </MemoryRouter>
        </ToastProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Order #1024/i })).toBeInTheDocument();
      expect(screen.getByText('Alex Morgan')).toBeInTheDocument();
      expect(screen.getByText('In Transit')).toBeInTheDocument();
      expect(screen.getByText('SP-DEMO-1024')).toBeInTheDocument();
      expect(screen.getByText('Wireless Headphones')).toBeInTheDocument();
      expect(screen.getByText('$89.99 USD')).toBeInTheDocument();
    });
  });

  it('displays error state when order is not found', async () => {
    vi.mocked(supportApi.getOrder).mockRejectedValueOnce(
      new Error('Order #9999 not found in our records.')
    );

    render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <MemoryRouter>
            <OrdersPage />
          </MemoryRouter>
        </ToastProvider>
      </QueryClientProvider>
    );

    const input = screen.getByPlaceholderText(/e\.g\. 1024/i);
    const button = screen.getByRole('button', { name: /track order/i });

    fireEvent.change(input, { target: { value: '9999' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Order Not Found')).toBeInTheDocument();
      expect(screen.getByText(/Order #9999 not found/i)).toBeInTheDocument();
    });
  });
});
