import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, useRoutes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { routes } from '@/app/router';
import { useCurrentUser } from '@/hooks/use-current-user';
import { MOCK_EMAILS, signInAsMock } from '@/test/session';

const service = vi.hoisted(() => ({
  getOverview: vi.fn(),
  getOrganizations: vi.fn(),
  getAuditLogs: vi.fn(),
}));

const catalog = vi.hoisted(() => ({ getFrameworks: vi.fn() }));

vi.mock('@/services/platform-admin.service', () => ({ platformAdminService: service }));
vi.mock('@/services/platform-catalog.service', () => ({ platformCatalogService: catalog, assetUrl: () => '' }));

function App() {
  return useRoutes(routes);
}

const emptyPage = { items: [], pageIndex: 1, pageSize: 20, totalItems: 0, totalPages: 0 };

describe('Platform Admin sidebar navigation (Pulse)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    localStorage.clear();
    useCurrentUser.getState().clearUser();
    signInAsMock(MOCK_EMAILS.platform);
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } } });
    vi.clearAllMocks();
    service.getOverview.mockReturnValue(new Promise(() => {})); // stays loading: only the shell matters here
    service.getOrganizations.mockResolvedValue(emptyPage);
    service.getAuditLogs.mockResolvedValue(emptyPage);
    catalog.getFrameworks.mockResolvedValue({ items: [], currentCatalogVersionNo: 1, draftCatalogVersionNo: null });
  });

  const renderAt = (path = '/platform/dashboard') =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[path]}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>,
    );

  const sidebar = () => screen.getByRole('complementary', { name: 'Điều hướng quản trị nền tảng' });

  it('links every sidebar item to a /platform route and marks the current page', async () => {
    renderAt();
    await screen.findByRole('heading', { level: 1, name: 'Toàn cảnh nền tảng hôm nay.' });

    const links = within(sidebar()).getAllByRole('link');
    expect(links).toHaveLength(8);
    links.forEach((link) => expect(link.getAttribute('href')).toMatch(/^\/platform\//));
    expect(within(sidebar()).getByRole('link', { name: /Tổng quan/ })).toHaveClass('active');
  });

  it('opens Tổ chức from the sidebar', async () => {
    renderAt();
    fireEvent.click(within(sidebar()).getByRole('link', { name: /Tổ chức/ }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Doanh nghiệp đang dùng nền tảng.' })).toBeInTheDocument();
    expect(await screen.findByText('Không có tổ chức nào khớp bộ lọc.')).toBeInTheDocument();
  });

  it('opens Khung chuẩn and Nhật ký kiểm tra from the sidebar', async () => {
    renderAt();
    fireEvent.click(within(sidebar()).getByRole('link', { name: /Khung chuẩn/ }));
    expect(await screen.findByText('Chưa có khung chuẩn.')).toBeInTheDocument();

    fireEvent.click(within(sidebar()).getByRole('link', { name: /Nhật ký kiểm tra/ }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Mỗi thao tác nhạy cảm đều có lý do.' })).toBeInTheDocument();
  });
});
