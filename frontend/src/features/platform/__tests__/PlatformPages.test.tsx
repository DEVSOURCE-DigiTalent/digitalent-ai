import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, useRoutes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { routes } from '@/app/router';
import { useCurrentUser } from '@/hooks/use-current-user';
import { MOCK_EMAILS, signInAsMock } from '@/test/session';
import apiClient from '@/services/api-client';
import { mockAdapter } from '@/services/mock/server/mock-adapter';

function App() {
  return useRoutes(routes);
}

describe('Platform Portal Tests (PA-01..21 according to UI/UX Spec v2.1)', () => {
  let queryClient: QueryClient;

  beforeAll(() => {
    apiClient.defaults.adapter = mockAdapter;
  });

  beforeEach(() => {
    localStorage.clear();
    useCurrentUser.getState().clearUser();
    signInAsMock(MOCK_EMAILS.platform);
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          refetchOnWindowFocus: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  const renderWithRouter = (initialPath: string) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialPath]}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('PA-01: Admin can access Platform Dashboard and view KPIs and recent organizations', async () => {
    renderWithRouter('/platform/dashboard');

    expect(await screen.findByRole('heading', { level: 1, name: 'Bảng điều khiển nền tảng' })).toBeInTheDocument();
    expect(await screen.findByText('Tổ chức khách hàng')).toBeInTheDocument();
    expect(await screen.findByText('Doanh thu tháng (MRR)')).toBeInTheDocument();
    expect(await screen.findByText('Phân bổ gói đăng ký')).toBeInTheDocument();
  });

  it('PA-02: Admin can access Organizations list and see search and table headers', async () => {
    renderWithRouter('/platform/organizations');

    expect(await screen.findByRole('heading', { level: 1, name: 'Danh sách tổ chức khách hàng' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Tìm theo tên tổ chức, email chủ doanh nghiệp/i)).toBeInTheDocument();
    expect(await screen.findByText('Công ty Cổ phần Acme')).toBeInTheDocument();
  });

  it('PA-03: Admin can access Organization Detail page', async () => {
    renderWithRouter('/platform/organizations/org-acme');

    expect(await screen.findByRole('heading', { level: 1, name: 'Công ty Cổ phần Acme' })).toBeInTheDocument();
    expect(await screen.findByText('Thông tin doanh nghiệp')).toBeInTheDocument();
    expect(await screen.findByText(/Điều chỉnh hạn mức ghế/i)).toBeInTheDocument();
  });

  it('PA-04: Admin can access Platform Users page and view users list', async () => {
    renderWithRouter('/platform/users');

    expect(await screen.findByRole('heading', { level: 1, name: 'Quản lý tài khoản người dùng' })).toBeInTheDocument();
    expect(await screen.findByPlaceholderText(/Tìm theo họ tên/i)).toBeInTheDocument();
    expect(await screen.findByText('Quản trị viên Nền tảng')).toBeInTheDocument();
  });

  it('PA-05: Admin can access Platform User Detail page', async () => {
    renderWithRouter('/platform/users/usr-plt-01');

    expect(await screen.findByRole('heading', { level: 1, name: /Quản trị viên Nền tảng/i })).toBeInTheDocument();
    expect(await screen.findByText('Thông tin định danh & Liên hệ')).toBeInTheDocument();
    expect(await screen.findByText(/Hỗ trợ đặt lại mật khẩu/i)).toBeInTheDocument();
  });

  it('PA-06: Admin can access Framework TT02 page and see 6 competency domains', async () => {
    renderWithRouter('/platform/framework');

    expect(await screen.findByRole('heading', { level: 1, name: 'Quản lý khung năng lực số Thông tư 02/2025' })).toBeInTheDocument();
    expect(await screen.findByText(/TT02-D1: Khai thác dữ liệu và thông tin/i)).toBeInTheDocument();
  });

  it('PA-07: Admin can access Competency Detail (source of truth)', async () => {
    renderWithRouter('/platform/framework/1.1');

    expect(await screen.findByRole('heading', { level: 1, name: /TT02-1.1/i })).toBeInTheDocument();
    expect(await screen.findByText('Định nghĩa năng lực chuẩn nền tảng')).toBeInTheDocument();
    expect(await screen.findByText(/8 bậc năng lực theo Thông tư 02\/2025/i)).toBeInTheDocument();
  });

  it('PA-08: Admin can access Curriculum page and view course tree & coverage', async () => {
    renderWithRouter('/platform/curriculum');

    expect(await screen.findByRole('heading', { level: 1, name: 'Giáo trình chuẩn nền tảng' })).toBeInTheDocument();
    expect((await screen.findAllByText('Khai thác dữ liệu và thông tin'))[0]).toBeInTheDocument();
  });

  it('PA-09: Admin can access Course Detail page', async () => {
    renderWithRouter('/platform/courses/crs-A1-F');

    expect(await screen.findByRole('heading', { level: 1, name: /Tìm kiếm và lưu trữ thông tin cơ bản/i })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /Tổng quan/i })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /Năng lực đáp ứng/i })).toBeInTheDocument();
  });

  it('PA-10: Admin can open Course Editor page', async () => {
    renderWithRouter('/platform/courses/crs-A1-F/edit');

    expect(await screen.findByRole('heading', { level: 1, name: 'Soạn khóa học: Tìm kiếm và lưu trữ thông tin cơ bản' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /Lưu khóa học/i })).toBeInTheDocument();
  });

  it('PA-11: Admin can access Question Bank page and view standard questions', async () => {
    renderWithRouter('/platform/questions');

    expect(await screen.findByRole('heading', { level: 1, name: 'Ngân hàng đề thi & bài đánh giá chuẩn' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Tìm theo nội dung, mã câu hỏi hoặc tên năng lực/i)).toBeInTheDocument();
    expect(await screen.findByText('Q-1.1-L1')).toBeInTheDocument();
  });

  it('PA-12: Admin can access Question Editor page', async () => {
    renderWithRouter('/platform/questions/Q-1.1-L1');

    expect(await screen.findByRole('heading', { level: 1, name: /Chỉnh sửa câu hỏi/i })).toBeInTheDocument();
    expect(await screen.findByText(/Thông tin định danh câu hỏi/i)).toBeInTheDocument();
  });

  it('PA-13: Admin can access Assessment Templates page', async () => {
    renderWithRouter('/platform/assessment-templates');

    expect(await screen.findByRole('heading', { level: 1, name: /Mẫu bài đánh giá chuẩn/i })).toBeInTheDocument();
    expect(await screen.findByText(/Đề đánh giá chuẩn: Miền 1/i)).toBeInTheDocument();
  });

  it('PA-14: Admin can access Reference Positions page and see position cards', async () => {
    renderWithRouter('/platform/positions');

    expect(await screen.findByRole('heading', { level: 1, name: 'Vị trí tham chiếu chuẩn nền tảng' })).toBeInTheDocument();
    expect(await screen.findByText('Giám đốc điều hành')).toBeInTheDocument();
    expect(await screen.findByText('Nhân sự')).toBeInTheDocument();
  });

  it('PA-15: Admin can access Position Requirements matrix', async () => {
    renderWithRouter('/platform/positions/CEO/requirements');

    expect(await screen.findByRole('heading', { level: 1, name: /Yêu cầu năng lực chuẩn: Giám đốc điều hành/i })).toBeInTheDocument();
    expect(await screen.findByText(/Lưu ma trận yêu cầu/i)).toBeInTheDocument();
  });

  it('PA-16: Admin can access Plans page and view plan cards', async () => {
    renderWithRouter('/platform/plans');

    expect(await screen.findByRole('heading', { level: 1, name: 'Gói dịch vụ & Quyền tính năng' })).toBeInTheDocument();
    expect(await screen.findByText('Starter')).toBeInTheDocument();
    expect((await screen.findAllByText('Pro'))[0]).toBeInTheDocument();
  });

  it('PA-17: Admin can access Plan Detail page', async () => {
    renderWithRouter('/platform/plans/ENT_STARTER');

    expect(await screen.findByRole('heading', { level: 1, name: /Cấu hình gói dịch vụ/i })).toBeInTheDocument();
    expect(await screen.findByText(/Hạn mức quy mô người dùng/i)).toBeInTheDocument();
  });

  it('PA-18: Admin can access Subscriptions page and view active subscriptions', async () => {
    renderWithRouter('/platform/subscriptions');

    expect(await screen.findByRole('heading', { level: 1, name: 'Giám sát gói đăng ký & thanh toán' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Tìm theo tên khách hàng, email/i)).toBeInTheDocument();
    expect(await screen.findByText('Công ty Cổ phần Acme')).toBeInTheDocument();
  });

  it('PA-19: Admin can access Subscription Detail page', async () => {
    renderWithRouter('/platform/subscriptions/sub-org-acme');

    expect(await screen.findByRole('heading', { level: 1, name: /Chi tiết thuê bao/i })).toBeInTheDocument();
    expect(await screen.findByText(/Lịch sử thanh toán & Hóa đơn/i)).toBeInTheDocument();
  });

  it('PA-20: Admin can access Audit Log page', async () => {
    renderWithRouter('/platform/audit-log');

    expect(await screen.findByRole('heading', { level: 1, name: 'Nhật ký kiểm toán nền tảng' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Tìm theo nội dung, email hoặc đối tượng/i)).toBeInTheDocument();
    expect(await screen.findByText('ORGANIZATION_APPROVED')).toBeInTheDocument();
  });

  it('PA-21: Admin can access System Settings page and see configuration toggles', async () => {
    renderWithRouter('/platform/settings');

    expect(await screen.findByRole('heading', { level: 1, name: 'Cấu hình hệ thống nền tảng' })).toBeInTheDocument();
    expect(await screen.findByText(/Chế độ bảo trì hệ thống/i)).toBeInTheDocument();
    expect(await screen.findByText('Lưu cấu hình hệ thống')).toBeInTheDocument();
  });
});
