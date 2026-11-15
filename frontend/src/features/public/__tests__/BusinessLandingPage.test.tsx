import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/use-current-user';
import { PulseBusinessLandingPage } from '../pulse-landing/PulseBusinessLandingPage';

function renderBusiness() {
  return render(
    <MemoryRouter>
      <PulseBusinessLandingPage />
    </MemoryRouter>
  );
}

describe('Pulse enterprise landing page', () => {
  beforeEach(() => {
    localStorage.clear();
    useCurrentUser.getState().clearUser();
  });

  it('renders topbar navigation and brand correctly', () => {
    renderBusiness();

    const nav = screen.getByRole('navigation', { name: 'Điều hướng phân khu' });
    expect(nav).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: 'Giải pháp' })).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: 'Quy trình' })).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: 'Khung 6 Miền' })).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: 'Hệ thống' })).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: 'Bảo mật & FAQ' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Đăng nhập' })[0]).toHaveAttribute('href', '/login');
  });

  it('renders Scene 6 data governance dome slices and compact rim switcher', () => {
    renderBusiness();

    const nav = screen.getByRole('navigation', { name: 'Điều hướng phân khu' });
    fireEvent.click(within(nav).getByRole('button', { name: 'Bảo mật & FAQ' }));

    expect(screen.getByText('AN TOÀN THÔNG TIN & VẬN HÀNH DỮ LIỆU')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Kiến Trúc An Toàn & Kiểm Soát Dữ Liệu' })).toBeInTheDocument();

    // 4 operational chips
    expect(screen.getByText('Cách ly theo OrganizationId')).toBeInTheDocument();
    expect(screen.getByText('Lưu trữ tệp MinIO riêng biệt')).toBeInTheDocument();
    expect(screen.getByText('Kết nối mã hóa HTTPS / TLS')).toBeInTheDocument();
    expect(screen.getByText('Xác thực JWT theo vai trò')).toBeInTheDocument();

    // Compact top-rim switcher tabs
    const rimSwitcher = screen.getByRole('tablist', { name: 'Danh sách phân vùng dữ liệu' });
    expect(within(rimSwitcher).getByRole('tab', { name: /Cô Lập Dữ Liệu Theo Tổ Chức/i })).toHaveAttribute('aria-selected', 'true');
    expect(within(rimSwitcher).getByRole('tab', { name: /Phân Quyền 3 Vai Trò & Phòng Ban/i })).toBeInTheDocument();
    expect(within(rimSwitcher).getByRole('tab', { name: /Kiểm Soát Dữ Liệu Trợ Lý AI/i })).toBeInTheDocument();
  });

  it('handles FAQ accordion interactions in Scene 6', () => {
    renderBusiness();

    const nav = screen.getByRole('navigation', { name: 'Điều hướng phân khu' });
    fireEvent.click(within(nav).getByRole('button', { name: 'Bảo mật & FAQ' }));

    const faqTrigger = screen.getByRole('button', {
      name: 'Dữ liệu bài thi và nhân sự được bảo vệ thế nào trước nguy cơ rò rỉ?',
    });
    expect(faqTrigger).toBeInTheDocument();
    expect(faqTrigger).toHaveAttribute('aria-expanded', 'false');

    // Click to open
    fireEvent.click(faqTrigger);
    expect(faqTrigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/ngăn chặn truy cập chéo giữa các doanh nghiệp/)).toBeInTheDocument();

    // Click again to close
    fireEvent.click(faqTrigger);
    expect(faqTrigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders enterprise CTA and registration form in Scene 7', () => {
    renderBusiness();

    const nav = screen.getByRole('navigation', { name: 'Điều hướng phân khu' });
    fireEvent.click(within(nav).getByRole('button', { name: 'Đăng ký' }));

    expect(screen.getByText('ĐĂNG KÝ TRẢI NGHIỆM')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Khởi tạo phiên trải nghiệm/i })).toBeInTheDocument();
  });
});
