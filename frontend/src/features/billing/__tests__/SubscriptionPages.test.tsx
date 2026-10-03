import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { SubscriptionOverviewPage } from '../pages/SubscriptionOverviewPage';
import { BillingInvoicesPage } from '../pages/BillingInvoicesPage';
import * as subscriptionHooks from '@/hooks/use-subscription';
import * as orgHooks from '@/hooks/use-organization';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('SubscriptionPages (Agent 1 - Phase H: OW-41, OW-43)', () => {
  let queryClient: QueryClient;

  const mockSubscription = {
    planId: 'plan-enterprise',
    planName: 'Enterprise Growth',
    status: 'active' as const,
    cycle: 'yearly' as const,
    amountPerPeriod: 24000000,
    seatsUsed: 18,
    seatLimit: 50,
    renewsAt: '2027-01-01T00:00:00Z',
    cancelAtPeriodEnd: false,
    entitlements: ['TT02_ASSESSMENT', 'INTERNAL_LEARNING', 'ADVANCED_ANALYTICS'],
    invoices: [
      {
        id: 'inv-1',
        code: 'INV-2026-001',
        issuedAt: '2026-01-01T00:00:00Z',
        description: 'Đăng ký thường niên gói Enterprise Growth (50 người dùng)',
        amount: 24000000,
        status: 'PAID' as const,
      },
      {
        id: 'inv-2',
        code: 'INV-2026-002',
        issuedAt: '2026-06-01T00:00:00Z',
        description: 'Bổ sung 10 người dùng đào tạo số nội bộ',
        amount: 4800000,
        status: 'PAID' as const,
      },
    ],
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    vi.clearAllMocks();

    vi.spyOn(subscriptionHooks, 'useSubscription').mockReturnValue({
      data: mockSubscription,
      isLoading: false,
    } as any);

    vi.spyOn(orgHooks, 'useOrganization').mockReturnValue({
      data: {
        name: 'Công ty Cổ phần DigiTalent Demo',
      },
      isLoading: false,
    } as any);
  });

  const renderWithClient = (ui: React.ReactNode) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{ui}</MemoryRouter>
      </QueryClientProvider>
    );
  };

  describe('OW-41: SubscriptionOverviewPage', () => {
    it('renders current plan details, seats, entitlements and recent invoices', () => {
      renderWithClient(<SubscriptionOverviewPage />);

      expect(screen.getByText('Gói dịch vụ doanh nghiệp')).toBeInTheDocument();
      expect(screen.getByText('Enterprise Growth')).toBeInTheDocument();
      expect(screen.getByText('Đang hoạt động')).toBeInTheDocument();
      expect(screen.getByText(/18 \/ 50 quyền sử dụng/i)).toBeInTheDocument();
      expect(screen.getByText('Nâng cấp / Đổi gói')).toBeInTheDocument();
      expect(screen.getByText('Ngừng gia hạn')).toBeInTheDocument();
      expect(screen.getByText('Xem chi tiết mức sử dụng')).toBeInTheDocument();
      expect(screen.getByText('Xem toàn bộ lịch sử hóa đơn')).toBeInTheDocument();
      expect(screen.getByText('INV-2026-001')).toBeInTheDocument();
    });
  });

  describe('OW-43: BillingInvoicesPage', () => {
    it('renders full invoice history, VAT business details and download action', () => {
      renderWithClient(<BillingInvoicesPage />);

      expect(screen.getByText('Lịch sử thanh toán & Hóa đơn')).toBeInTheDocument();
      expect(screen.getByText('Quay lại tổng quan gói dịch vụ')).toBeInTheDocument();
      expect(screen.getByText('INV-2026-001')).toBeInTheDocument();
      expect(screen.getByText('INV-2026-002')).toBeInTheDocument();
      expect(screen.getByText('Thông tin pháp lý xuất hóa đơn VAT')).toBeInTheDocument();
      expect(screen.getAllByText(/Chưa cấu hình|0109887766/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Chỉnh sửa trong Cài đặt tổ chức/i)).toBeInTheDocument();

      // Download PDF button
      const downloadButtons = screen.getAllByRole('button', { name: /Tải PDF/i });
      expect(downloadButtons.length).toBeGreaterThan(0);
      fireEvent.click(downloadButtons[0]);
    });
  });
});
