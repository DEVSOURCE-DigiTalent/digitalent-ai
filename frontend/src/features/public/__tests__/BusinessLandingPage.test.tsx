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

  it('renders Scene 6 data governance and security control elements', () => {
    renderBusiness();

    expect(screen.getByText('AN TOÀN & VẬN HÀNH DỮ LIỆU')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Kiểm Soát Dữ Liệu & Ranh Giới Bảo Mật' })).toBeInTheDocument();

    // 4 operational chips
    expect(screen.getByText('Máy chủ: Nội địa Việt Nam')).toBeInTheDocument();
    expect(screen.getByText('Đường truyền: Mã hóa TLS')).toBeInTheDocument();
    expect(screen.getByText('Sao lưu: Tự động hàng ngày')).toBeInTheDocument();
    expect(screen.getByText('Xuất file: PDF & Excel')).toBeInTheDocument();

    // 4 security control grid cards
    expect(screen.getByRole('heading', { name: 'Tách biệt dữ liệu' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Phân quyền chức vụ' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ranh giới dữ liệu AI' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Nhật ký đối soát' })).toBeInTheDocument();
  });

  it('handles 2-column FAQ accordion interactions', () => {
    renderBusiness();

    const faqTrigger = screen.getByRole('button', { name: 'Dữ liệu nhân sự và bài thi được lưu ở đâu?' });
    expect(faqTrigger).toBeInTheDocument();
    expect(faqTrigger).toHaveAttribute('aria-expanded', 'false');

    // Click to open
    fireEvent.click(faqTrigger);
    expect(faqTrigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/hạ tầng máy chủ nội địa tại Việt Nam/)).toBeInTheDocument();

    // Click again to close
    fireEvent.click(faqTrigger);
    expect(faqTrigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders enterprise CTA and registration form', () => {
    renderBusiness();

    expect(screen.getByText('ĐĂNG KÝ TRẢI NGHIỆM')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Khởi tạo phiên trải nghiệm' })).toBeInTheDocument();
  });
});
