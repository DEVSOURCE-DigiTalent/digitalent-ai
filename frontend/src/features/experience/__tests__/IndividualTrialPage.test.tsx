import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { REFERENCE_POSITIONS } from '@/lib/reference-positions';
import { IndividualTrialPage } from '../pages/IndividualTrialPage';

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/individual/try']}>
      <IndividualTrialPage />
    </MemoryRouter>,
  );
}

describe('Individual trial journey', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('starts with all five reference positions and explains the preview boundary', () => {
    renderPage();

    expect(screen.getByRole('heading', { level: 1, name: /Trải nghiệm lộ trình cá nhân/ })).toBeInTheDocument();
    expect(screen.getByText(/không cần thẻ thanh toán/i)).toBeInTheDocument();
    for (const position of REFERENCE_POSITIONS) {
      expect(screen.getByRole('radio', { name: new RegExp(escapeRegExp(position.name)) })).toBeInTheDocument();
    }
    expect(screen.getAllByRole('radio')).toHaveLength(5);
  });

  it('recovers safely when saved trial state references a removed position', () => {
    localStorage.setItem(
      'dt-individual-trial-v2',
      JSON.stringify({ version: 2, step: 'lesson', positionCode: 'OLD_POSITION', answers: {} }),
    );

    renderPage();

    expect(screen.getByRole('heading', { level: 2, name: 'Trải nghiệm lộ trình cá nhân' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(5);
  });

  it('recovers safely from legacy v1 storage with invalid position', () => {
    localStorage.setItem(
      'dt-individual-trial-v1',
      JSON.stringify({ version: 1, step: 'path', positionCode: 'INVALID', answers: {} }),
    );

    renderPage();

    expect(screen.getByRole('heading', { level: 2, name: 'Trải nghiệm lộ trình cá nhân' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(5);
  });

  it('takes a learner from target selection through a short diagnostic to a preview path', () => {
    renderPage();

    fireEvent.click(screen.getByRole('radio', { name: /Marketing/ }));
    fireEvent.click(screen.getByRole('button', { name: /Tiếp tục với Marketing/ }));

    expect(screen.getByRole('heading', { level: 2, name: /Khảo sát định hướng/ })).toBeInTheDocument();
    expect(screen.getByText(/không thay thế bài đánh giá đầu vào đầy đủ/i)).toBeInTheDocument();

    for (let index = 0; index < 6; index += 1) {
      const question = screen.getByRole('group', { name: new RegExp(`Câu ${index + 1}`) });
      fireEvent.click(within(question).getAllByRole('radio')[0]);
      fireEvent.click(screen.getByRole('button', { name: index === 5 ? /Xem lộ trình mẫu/ : /Câu tiếp/ }));
    }

    // Now in preview workspace
    expect(screen.getByTestId('trial-preview-workspace')).toBeInTheDocument();
    expect(screen.getAllByText('Bản trải nghiệm').length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { level: 2, name: /Lộ trình xem trước cho Marketing/ })).toBeInTheDocument();
    expect(screen.getByText(/Đây là kết quả định hướng, chưa phải mức năng lực được xác nhận/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Học bài miễn phí/ })).toBeInTheDocument();
    expect(screen.getAllByText(/Cần mở gói/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Mở 4 bài học tiếp theo/i)).toBeInTheDocument();
  });

  it('allows skipping diagnostic directly from target step via "Học thử ngay"', () => {
    renderPage();

    fireEvent.click(screen.getByRole('radio', { name: /Giám đốc điều hành/ }));
    const skipBtn = screen.getByRole('button', { name: /Học thử ngay/ });
    expect(skipBtn).toBeInTheDocument();
    fireEvent.click(skipBtn);

    // Enters preview workspace immediately with baseline path
    expect(screen.getByTestId('trial-preview-workspace')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Lộ trình nền tảng cho Giám đốc điều hành/ })).toBeInTheDocument();
    expect(screen.getByText(/Đây là lộ trình nền tảng chuẩn cho vị trí Giám đốc điều hành/i)).toBeInTheDocument();
  });

  it('allows skipping diagnostic from the diagnostic step via "Bỏ qua, vào bài học thử"', () => {
    renderPage();

    fireEvent.click(screen.getByRole('radio', { name: /Kế toán/ }));
    fireEvent.click(screen.getByRole('button', { name: /Tiếp tục với Kế toán/ }));

    expect(screen.getByRole('heading', { level: 2, name: /Khảo sát định hướng/ })).toBeInTheDocument();
    const skipLink = screen.getByRole('button', { name: /Bỏ qua, vào bài học thử/ });
    fireEvent.click(skipLink);

    expect(screen.getByTestId('trial-preview-workspace')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Lộ trình nền tảng cho Kế toán/ })).toBeInTheDocument();
  });

  it('renders Preview Workspace shell with tabs and takeaway artifact in the lesson step', () => {
    renderPage();

    fireEvent.click(screen.getByRole('radio', { name: /Kinh doanh/ }));
    fireEvent.click(screen.getByRole('button', { name: /Học thử ngay/ }));

    // Preview shell navigation tabs
    const nav = screen.getByRole('navigation', { name: /Điều hướng bản trải nghiệm/ });
    expect(within(nav).getByRole('button', { name: /Lộ trình/ })).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: /Bài học thử/ })).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: /Kết quả/ })).toBeInTheDocument();

    // Click tab "Bài học thử"
    fireEvent.click(within(nav).getByRole('button', { name: /Bài học thử/ }));
    expect(screen.getByRole('heading', { level: 2, name: /Bài học thử/ })).toBeInTheDocument();

    // Check takeaway artifact
    expect(screen.getAllByText(/Tài liệu mang đi/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Sao chép checklist/i })).toBeInTheDocument();

    // Copy takeaway
    fireEvent.click(screen.getByRole('button', { name: /Sao chép checklist/i }));
    expect(screen.getByText(/Đã sao chép/i)).toBeInTheDocument();

    // Switch back to "Lộ trình" via shell tab
    fireEvent.click(within(nav).getByRole('button', { name: /Lộ trình/ }));
    expect(screen.getByRole('heading', { level: 2, name: /Lộ trình nền tảng cho Kinh doanh/ })).toBeInTheDocument();
  });

  it('offers one complete learning slice with video, workplace application, takeaway and a purchase CTA', () => {
    renderPage();

    fireEvent.click(screen.getByRole('radio', { name: /Nhân sự/ }));
    fireEvent.click(screen.getByRole('button', { name: /Tiếp tục với Nhân sự/ }));
    for (let index = 0; index < 6; index += 1) {
      const question = screen.getByRole('group', { name: new RegExp(`Câu ${index + 1}`) });
      fireEvent.click(within(question).getAllByRole('radio')[1]);
      fireEvent.click(screen.getByRole('button', { name: index === 5 ? /Xem lộ trình mẫu/ : /Câu tiếp/ }));
    }
    fireEvent.click(screen.getByRole('button', { name: /Học bài miễn phí/ }));

    expect(screen.getByLabelText(/Video bài học thử/)).toHaveAttribute('src', '/videos/individual-study.mp4');
    expect(screen.getByRole('heading', { level: 2, name: /Bài học thử/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /Tình huống cho Nhân sự/ })).toBeInTheDocument();
    expect(screen.getAllByText(/Tài liệu mang đi/i).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('radio', { name: /Ẩn danh dữ liệu/ }));
    fireEvent.click(screen.getByRole('button', { name: /Xem phản hồi/ }));
    expect(screen.getByRole('status')).toHaveTextContent(/bảo vệ dữ liệu/i);

    fireEvent.click(screen.getByRole('radio', { name: /Kiểm tra dữ liệu nhạy cảm/ }));
    fireEvent.click(screen.getByRole('button', { name: /Hoàn thành bài thử/ }));

    expect(screen.getByRole('heading', { level: 2, name: /Bạn đã hoàn thành phần trải nghiệm/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Xem bảng giá/ })).toHaveAttribute(
      'href',
      '/individual/pricing?source=trial&position=HR',
    );
    expect(screen.getByText(/không cập nhật hồ sơ năng lực và không cấp chứng nhận/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Xem lại bài học/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Thử vị trí khác/ })).toBeInTheDocument();
  });
});

describe('Individual trial result: reverse trial call to action (spec §8.1)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  function completeLesson() {
    fireEvent.click(screen.getByRole('radio', { name: /Ẩn danh dữ liệu/ }));
    fireEvent.click(screen.getByRole('button', { name: /Xem phản hồi/ }));
    fireEvent.click(screen.getByRole('radio', { name: /Kiểm tra dữ liệu nhạy cảm/ }));
    fireEvent.click(screen.getByRole('button', { name: /Hoàn thành bài thử/ }));
  }

  function finishWith(positionName: string, optionIndex: number) {
    renderPage();
    fireEvent.click(screen.getByRole('radio', { name: new RegExp(positionName) }));
    fireEvent.click(screen.getByRole('button', { name: new RegExp(`Tiếp tục với ${positionName}`) }));
    for (let index = 0; index < 6; index += 1) {
      const question = screen.getByRole('group', { name: new RegExp(`Câu ${index + 1}`) });
      fireEvent.click(within(question).getAllByRole('radio')[optionIndex]);
      fireEvent.click(screen.getByRole('button', { name: index === 5 ? /Xem lộ trình mẫu/ : /Câu tiếp/ }));
    }
    fireEvent.click(screen.getByRole('button', { name: /Học bài miễn phí/ }));
    completeLesson();
  }

  it('makes "save and keep learning for 7 days" the main action and the price list the secondary one', () => {
    finishWith('Nhân sự', 1);

    const main = screen.getByRole('link', { name: /Lưu kết quả và học tiếp 7 ngày miễn phí/ });
    expect(main).toHaveAttribute('href', '/individual/register?trial=1&position=HR&source=try');
    expect(screen.getByText(/Không cần thẻ · Không tự gia hạn · Hết hạn vẫn giữ kết quả/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Xem bảng giá' })).toHaveAttribute(
      'href',
      '/individual/pricing?source=trial&position=HR',
    );
  });

  it('hands the position and the orientation score to the sign-up in session storage, never in local storage', () => {
    finishWith('Nhân sự', 1);

    fireEvent.click(screen.getByRole('link', { name: /Lưu kết quả và học tiếp/ }));

    const handoff = JSON.parse(sessionStorage.getItem('dt-try-handoff')!);
    expect(handoff).toMatchObject({ positionCode: 'HR', correct: 6, total: 6 });
    expect(Object.keys(handoff).sort()).toEqual(['completedAt', 'correct', 'positionCode', 'total']);
    expect(localStorage.getItem('dt-try-handoff')).toBeNull();
  });

  it('hands over only the position when the survey was skipped', () => {
    renderPage();
    fireEvent.click(screen.getByRole('radio', { name: /Nhân sự/ }));
    fireEvent.click(screen.getByRole('button', { name: /Học thử ngay/ }));
    fireEvent.click(screen.getByRole('button', { name: /Học bài miễn phí/ }));
    completeLesson();

    fireEvent.click(screen.getByRole('link', { name: /Lưu kết quả và học tiếp/ }));

    const handoff = JSON.parse(sessionStorage.getItem('dt-try-handoff')!);
    expect(handoff.positionCode).toBe('HR');
    expect(handoff).not.toHaveProperty('correct');
    expect(handoff).not.toHaveProperty('total');
  });
});
