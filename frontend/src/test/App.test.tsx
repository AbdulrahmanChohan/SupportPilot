import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { ToastProvider } from '../components/ui/Toast';

describe('Application Shell & Navigation', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  it('renders the SupportPilot brand and navigation links', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <MemoryRouter initialEntries={['/']}>
            <Sidebar isOpen={true} />
          </MemoryRouter>
        </ToastProvider>
      </QueryClientProvider>
    );

    expect(screen.getByText('SupportPilot')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('AI Support Chat')).toBeInTheDocument();
    expect(screen.getByText('Order Tracking')).toBeInTheDocument();
    expect(screen.getByText('Refund Management')).toBeInTheDocument();
    expect(screen.getByText('System & Retrieval')).toBeInTheDocument();
  });

  it('displays the financial safety guarantee badge in the sidebar', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <MemoryRouter initialEntries={['/']}>
            <Sidebar isOpen={true} />
          </MemoryRouter>
        </ToastProvider>
      </QueryClientProvider>
    );

    expect(screen.getByText('Financial Safeguard Active')).toBeInTheDocument();
    expect(
      screen.getByText(/Automated payouts disabled/i)
    ).toBeInTheDocument();
  });
});
