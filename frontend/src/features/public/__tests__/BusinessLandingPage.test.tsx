import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/use-current-user';
import { PulseBusinessLandingPage } from '../pulse-landing/PulseBusinessLandingPage';

function renderBusiness() {
  return render(<MemoryRouter><PulseBusinessLandingPage /></MemoryRouter>);
}

describe('Pulse enterprise landing page', () => {
  beforeEach(() => {
    localStorage.clear();
    useCurrentUser.getState().clearUser();
  });

  it('presents the new visual identity and the enterprise learning journey', () => {
    renderBusiness();

    expect(screen.getByRole('heading', { level: 1, name: /Đào tạo có đích đến.*Tiến bộ nhìn thấy được/ })).toBeInTheDocument();
    expect(screen.getByText('Nền tảng phát triển năng lực số cho doanh nghiệp')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Các tầng học tập bằng kính/ })).toBeInTheDocument();

    const journey = screen.getByRole('region', { name: /Từ mục tiêu của doanh nghiệp/ });
    expect(within(journey).getAllByRole('article')).toHaveLength(5);
    expect(within(journey).getByRole('heading', { name: 'Đo điểm xuất phát' })).toBeInTheDocument();
    expect(within(journey).getByRole('heading', { name: 'Làm bài cuối khóa' })).toBeInTheDocument();
  });

  it('shows the competency ceiling order and distinct responsibilities for each role', () => {
    renderBusiness();

    expect(screen.getByLabelText('Trật tự các mức trần năng lực')).toHaveTextContent('Vị trí≤Phòng ban≤Doanh nghiệp≤Digital AI');
    const roles = screen.getByRole('region', { name: /Cùng một mục tiêu/ });
    for (const name of ['Doanh nghiệp', 'Quản lý', 'Nhân viên']) {
      expect(within(roles).getByRole('heading', { name })).toBeInTheDocument();
    }
  });

  it('explains free Basic content and paid higher level seats accurately', () => {
    renderBusiness();

    expect(screen.getByText(/Dùng thử miễn phí · học trọn khóa Cơ bản/)).toBeInTheDocument();
    expect(screen.getByText(/Học liệu Cơ bản luôn mở đầy đủ/)).toBeInTheDocument();
    expect(screen.getByText(/doanh nghiệp có thể xem đề cương và nội dung mẫu trước khi mua/)).toBeInTheDocument();
    expect(screen.getByText(/Doanh nghiệp mua theo khóa và phân bổ suất/)).toBeInTheDocument();
  });

  it('keeps the enterprise entry routes for trial, solution and login', () => {
    renderBusiness();

    expect(screen.getByRole('link', { name: /Bắt đầu dùng thử/ })).toHaveAttribute('href', '/business/try');
    expect(screen.getByRole('link', { name: /Xem cách hoạt động/ })).toHaveAttribute('href', '#hanh-trinh');
    expect(screen.getAllByRole('link', { name: 'Giải pháp' })[0]).toHaveAttribute('href', '/business/solution');
    expect(screen.getAllByRole('link', { name: 'Đăng nhập' })[0]).toHaveAttribute('href', '/login');
    expect(screen.queryByRole('link', { name: /Cá nhân/ })).not.toBeInTheDocument();
  });
});
