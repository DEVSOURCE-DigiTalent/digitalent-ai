import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/use-current-user';
import { MOCK_EMAILS, signInAsMock } from '@/test/session';
import { PulseBusinessLandingPage } from '../pulse-landing/PulseBusinessLandingPage';

function renderBusiness() {
  return render(<MemoryRouter><PulseBusinessLandingPage /></MemoryRouter>);
}

/** Section of the landing page that holds a level-2 heading matching `name`. */
function sectionOf(name: RegExp) {
  return screen.getByRole('heading', { level: 2, name }).closest('section') as HTMLElement;
}

describe('Pulse enterprise landing page (2026 redesign)', () => {
  beforeEach(() => {
    localStorage.clear();
    useCurrentUser.getState().clearUser();
  });

  it('opens with the competency positioning and the two entry actions', () => {
    renderBusiness();

    expect(screen.getByRole('heading', { level: 1, name: /Định vị năng lực số\.\s*Bứt phá từ kết quả thật\./ })).toBeInTheDocument();
    expect(screen.getByText(/Đánh giá năng lực theo vị trí, xác định nội dung cần bồi dưỡng/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Trải nghiệm miễn phí 14 ngày/ })).toHaveAttribute('href', '/business/try');
    expect(screen.getByRole('link', { name: /Khám phá giải pháp/ })).toHaveAttribute('href', '/business/solution');
  });

  it('walks through the closed learning loop and the shared competency framework', () => {
    renderBusiness();

    const journey = sectionOf(/Chuyển hóa đào tạo thành/);
    expect(journey).toHaveAttribute('id', 'hanh-trinh');
    for (const step of ['Đo chuẩn đầu vào thích ứng', 'Học đúng chỗ còn thiếu', 'Minh chứng công việc thật', 'Báo cáo ROI & Sức khỏe kỹ năng']) {
      expect(within(journey).getByRole('heading', { level: 3, name: step })).toBeInTheDocument();
    }
    expect(sectionOf(/Một chuẩn chung/)).toHaveAttribute('id', 'khung-nang-luc');
    expect(sectionOf(/4 AI Agent Chuyên Trách/)).toHaveAttribute('id', 'ai-agents');
  });

  it('sends every sign-up call to action to the enterprise trial and offers no individual entry', () => {
    renderBusiness();

    const finalCta = sectionOf(/Sẵn sàng xây dựng đội ngũ/);
    expect(within(finalCta).getByRole('link')).toHaveAttribute('href', '/business/try');
    expect(within(sectionOf(/Tính toán hiệu quả cho/)).getByRole('link')).toHaveAttribute('href', '/business/try');
    expect(screen.queryByRole('link', { name: /Cá nhân/ })).not.toBeInTheDocument();
  });

  it('takes a signed-in owner back to the workspace instead of the trial', () => {
    signInAsMock(MOCK_EMAILS.owner);
    renderBusiness();

    const toWorkspace = screen.getAllByRole('link', { name: /Vào không gian làm việc/ });
    expect(toWorkspace.length).toBeGreaterThan(0);
    toWorkspace.forEach((link) => expect(link).toHaveAttribute('href', '/enterprise/dashboard'));
    expect(screen.queryByRole('link', { name: /Trải nghiệm miễn phí 14 ngày/ })).not.toBeInTheDocument();
  });
});
