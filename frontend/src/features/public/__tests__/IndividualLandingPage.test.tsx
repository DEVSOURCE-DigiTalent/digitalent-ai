import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { IndividualLandingPage } from '../pages/LandingPage';
import { useCurrentUser } from '@/hooks/use-current-user';
import { REFERENCE_POSITIONS, summarizeRequirements } from '@/lib/reference-positions';

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, (char) => `\\${char}`);

function renderIndividual() {
  return render(
    <MemoryRouter>
      <IndividualLandingPage />
    </MemoryRouter>
  );
}

describe('Individual landing page: a paid product, framework kept apart from curriculum', () => {
  beforeEach(() => {
    localStorage.clear();
    useCurrentUser.getState().clearUser();
  });

  it('never offers anything for free: the plans are paid', () => {
    const { container } = renderIndividual();

    expect(container.textContent).not.toMatch(/miễn phí/i);
    expect(container.textContent).not.toMatch(/\bfree\b/i);
  });

  it('leads every main call to action to the personal pricing page', () => {
    renderIndividual();

    const ctas = screen.getAllByRole('link', { name: /Xem gói cá nhân/ });
    expect(ctas.length).toBeGreaterThanOrEqual(2);
    ctas.forEach((link) => expect(link).toHaveAttribute('href', '/individual/pricing'));
    expect(screen.queryByRole('link', { name: /Bắt đầu|Tạo tài khoản/ })).not.toBeInTheDocument();
  });

  it('separates the 8 tiers of the framework from the 3 programme tiers DigiTalent AI teaches', () => {
    renderIndividual();

    const specs = within(screen.getByRole('region', { name: /Biết mình đang ở đâu/ })).getAllByRole('listitem');
    const text = specs.map((item) => item.textContent).join(' | ');

    expect(text).toMatch(/8.*bậc năng lực.*khung tham chiếu/);
    expect(text).toMatch(/3.*tầng chương trình.*Cơ bản.*Trung cấp.*Nâng cao/);
    expect(text).not.toMatch(/Trung bình/);
    expect(text).not.toMatch(/5.*vị trí/);
  });

  it('shows the personal progress profile instead of a certificate', () => {
    const { container } = renderIndividual();

    expect(container.textContent).toMatch(/Mức được đánh giá/);
    expect(container.textContent).not.toMatch(/Đã xác thực|Mã mẫu|Chứng chỉ năng lực số|verified|confirmed/i);
  });
});

describe('Individual landing page: discovery sections (careers, how it works, framework)', () => {
  beforeEach(() => {
    localStorage.clear();
    useCurrentUser.getState().clearUser();
  });

  it('tells the story in order: positions, how it works, framework, then features', () => {
    renderIndividual();

    const titles = screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent ?? '');
    const at = (pattern: RegExp) => titles.findIndex((title) => pattern.test(title));

    expect(at(/Bạn muốn hướng tới vị trí nào/)).toBeGreaterThanOrEqual(0);
    expect(at(/Bạn muốn hướng tới vị trí nào/)).toBeLessThan(at(/Từ chọn mục tiêu đến hồ sơ năng lực/));
    expect(at(/Từ chọn mục tiêu đến hồ sơ năng lực/)).toBeLessThan(at(/Biết mình đang ở đâu/));
    expect(at(/Biết mình đang ở đâu/)).toBeLessThan(at(/Từ mục tiêu nghề nghiệp đến lộ trình học/));
  });

  it('lists the reference positions from the shared data, each linking to its requirements', () => {
    renderIndividual();

    const section = screen.getByRole('region', { name: /Bạn muốn hướng tới vị trí nào/ });
    for (const position of REFERENCE_POSITIONS) {
      const link = within(section).getByRole('link', { name: new RegExp(`Xem yêu cầu vị trí.*${escapeRegExp(position.name)}`) });
      expect(link).toHaveAttribute('href', `/careers/${position.code.toLowerCase()}`);
      const { selected } = summarizeRequirements(position);
      expect(within(section).getAllByText(new RegExp(`${selected}/24 năng lực`)).length).toBeGreaterThan(0);
    }
    expect(within(section).getByRole('link', { name: /Khám phá tất cả vị trí/ })).toHaveAttribute('href', '/careers');
  });

  it('calls them reference positions, not positions defined by Circular 02', () => {
    const { container } = renderIndividual();

    expect(container.textContent).toMatch(/vị trí tham chiếu/);
    expect(container.textContent).not.toMatch(/vị trí TT02|vị trí của Thông tư/i);
    expect(container.textContent).not.toMatch(/AI Engineer|Data Analyst|DevOps/);
  });

  it('explains the journey in six numbered steps', () => {
    renderIndividual();

    const section = screen.getByRole('region', { name: /Từ chọn mục tiêu đến hồ sơ năng lực/ });
    const steps = within(section).getAllByRole('listitem');

    expect(steps).toHaveLength(6);
    expect(steps[0]).toHaveTextContent(/Chọn vị trí mục tiêu/);
    expect(steps[5]).toHaveTextContent(/Theo dõi hồ sơ năng lực/);
  });

  it('keeps the navigation to the sections that matter', () => {
    renderIndividual();

    const nav = screen.getByRole('navigation', { name: 'Điều hướng chính' });
    expect(within(nav).getByRole('link', { name: 'Vị trí nghề nghiệp' })).toHaveAttribute('href', '#vi-tri');
    expect(within(nav).getByRole('link', { name: 'Cách hoạt động' })).toHaveAttribute('href', '#cach-hoat-dong');
    expect(within(nav).getByRole('link', { name: 'Khung năng lực' })).toHaveAttribute('href', '#khung');
    expect(within(nav).getByRole('link', { name: 'Bảng giá' })).toHaveAttribute('href', '/individual/pricing');
    expect(within(nav).getByRole('link', { name: 'Đăng nhập' })).toHaveAttribute('href', '/individual/login');
  });
});

describe('Individual landing page: product value (skill gap, learning path, progress)', () => {
  beforeEach(() => {
    localStorage.clear();
    useCurrentUser.getState().clearUser();
  });

  it('starts from the gap to the target position, not from a course catalogue', () => {
    renderIndividual();

    const section = screen.getByRole('region', { name: /Bắt đầu từ khoảng cách/ });
    expect(within(section).getByText(/Yêu cầu vị trí/)).toBeInTheDocument();
    expect(within(section).getByText(/Mức hiện tại/)).toBeInTheDocument();
    expect(within(section).getByText(/Còn thiếu 2 tầng/)).toBeInTheDocument();
    expect(within(section).getByText(/Đã đạt/)).toBeInTheDocument();
    expect(within(section).getByText(/Ví dụ minh họa/)).toBeInTheDocument();
  });

  it('orders the roadmap by prerequisite and explains why each course is recommended', () => {
    renderIndividual();

    const roadmap = within(screen.getByRole('region', { name: /Bắt đầu từ khoảng cách/ })).getByRole('list', { name: 'Lộ trình học đề xuất' });
    const steps = within(roadmap).getAllByRole('listitem');

    expect(steps.map((step) => step.textContent)).toEqual([
      expect.stringContaining('A4-I'),
      expect.stringContaining('A4-A'),
      expect.stringContaining('A1-A'),
      expect.stringContaining('M6-I'),
    ]);
    expect(steps[0]).toHaveTextContent(/Vị trí yêu cầu Nâng cao ở năng lực 4\.2, kết quả hiện tại là Cơ bản/);
    // A learner who has already reached a level is not sent back to it.
    expect(roadmap.textContent).not.toMatch(/A1-F|A1-I|A2-|A3-/);
  });

  it('shows assessed levels and the history that led to them, never a workplace confirmation', () => {
    renderIndividual();

    const section = screen.getByRole('region', { name: /Tiến bộ/ });
    expect(within(section).getAllByText(/Mức được đánh giá/).length).toBeGreaterThan(0);
    expect(within(section).getByRole('list', { name: 'Lịch sử đánh giá' })).toBeInTheDocument();
    expect(section.textContent).not.toMatch(/xác nhận|xác thực|verified|confirmed/i);
  });
});

describe('Individual landing page: conversion (learning experience, pricing, FAQ)', () => {
  beforeEach(() => {
    localStorage.clear();
    useCurrentUser.getState().clearUser();
  });

  it('shows what is inside a course: modules, objective, practice and an assessment', () => {
    renderIndividual();

    const section = screen.getByRole('region', { name: /Bên trong một khóa học/ });
    expect(within(section).getByText('A4-I')).toBeInTheDocument();
    expect(within(section).getByText('An toàn thông tin trong công việc')).toBeInTheDocument();
    expect(within(section).getByRole('list', { name: 'Các module của khóa' }).querySelectorAll('li')).toHaveLength(4);
    for (const block of ['Mục tiêu học tập', 'Kiến thức và ví dụ', 'Bài thực hành', 'Bài đánh giá', 'Tiến độ']) {
      expect(within(section).getByRole('heading', { level: 3, name: block })).toBeInTheDocument();
    }
    expect(within(section).getByText(/Ví dụ minh họa/)).toBeInTheDocument();
  });

  it('previews the two paid plans from the plan catalogue, each leading into sign-up with that plan', () => {
    renderIndividual();

    const section = screen.getByRole('region', { name: /Chọn gói phù hợp/ });
    expect(within(section).getAllByText(/149\.000/).length).toBeGreaterThan(0);
    expect(within(section).getAllByText(/299\.000/).length).toBeGreaterThan(0);
    expect(within(section).queryByText(/Khởi đầu/)).not.toBeInTheDocument();
    expect(within(section).getByText('Nên chọn')).toBeInTheDocument();
    expect(within(section).getByRole('link', { name: 'Chọn gói Plus' })).toHaveAttribute(
      'href',
      '/individual/register?plan=IND_PLUS&seats=1&cycle=month'
    );
    expect(within(section).getByRole('link', { name: 'Chọn gói Pro' })).toHaveAttribute(
      'href',
      '/individual/register?plan=IND_PRO&seats=1&cycle=month'
    );
    expect(within(section).getByRole('link', { name: /So sánh chi tiết/ })).toHaveAttribute('href', '/individual/pricing');
  });

  it('answers the questions the product can already answer, and makes no promise about billing policy', () => {
    renderIndividual();

    const section = screen.getByRole('region', { name: /Câu hỏi thường gặp/ });
    for (const question of [
      /đánh giá năng lực số của tôi bằng cách nào/,
      /Khung năng lực.*được dùng như thế nào/,
      /thay đổi vị trí nghề nghiệp mục tiêu/,
      /phải học lại/,
      /Mức được đánh giá.*nghĩa là gì/,
      /Gói cá nhân bao gồm/,
    ]) {
      expect(within(section).getByText(question)).toBeInTheDocument();
    }
    // Refunds, cancellation, renewal and data retention are business policy that is not decided yet.
    expect(section.textContent).not.toMatch(/hoàn tiền|hủy gói|gia hạn|lưu trữ.*(tháng|năm)|thanh toán thất bại/i);
  });

  it('tells the visitor that a reference position and its requirements are built by DigiTalent AI, not defined by the Circular', () => {
    renderIndividual();

    const section = screen.getByRole('region', { name: /Câu hỏi thường gặp/ });
    expect(section.textContent).toMatch(/do DigiTalent AI xây dựng/);
    expect(section.textContent).toMatch(/Thông tư không quy định vị trí việc làm/);
  });

  it('keeps the section order of the proposal, ending with pricing, FAQ and the closing call to action', () => {
    renderIndividual();

    const titles = screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent ?? '');
    const order = [
      /Bạn muốn hướng tới vị trí nào/,
      /Từ chọn mục tiêu đến hồ sơ năng lực/,
      /Biết mình đang ở đâu/,
      /Từ mục tiêu nghề nghiệp đến lộ trình học/,
      /Bắt đầu từ khoảng cách/,
      /Bên trong một khóa học/,
      /Tiến bộ của bạn/,
      /Chọn gói phù hợp/,
      /Câu hỏi thường gặp/,
      /Một mục tiêu/,
    ].map((pattern) => titles.findIndex((title) => pattern.test(title)));

    expect(order.every((index) => index >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });
});

describe('Individual landing page: background video', () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    localStorage.clear();
    useCurrentUser.getState().clearUser();
    // A visitor who has not asked for reduced motion: without matchMedia the page stays static and loads no video.
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as unknown as typeof window.matchMedia;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('uses the self-hosted study clip only behind the course column of the learning section', () => {
    const { container } = renderIndividual();

    const clips = container.querySelectorAll('video[src="/videos/individual-study.mp4"]');
    expect(clips).toHaveLength(1);
    const section = screen.getByRole('region', { name: /Bên trong một khóa học/ });
    expect(section.contains(clips[0])).toBe(true);
  });

  it('leaves the profile card and the closing section on the original background videos', () => {
    const { container } = renderIndividual();

    const finale = screen.getByRole('region', { name: /Một mục tiêu một lộ trình/ });
    expect(finale.querySelector('video')?.getAttribute('src')).not.toBe('/videos/individual-study.mp4');
    const sources = [...container.querySelectorAll('video')].map((video) => video.getAttribute('src'));
    expect(sources.filter((src) => src === '/videos/individual-study.mp4')).toHaveLength(1);
  });

  it('keeps the clip silent and inline so it can autoplay behind the text', () => {
    const { container } = renderIndividual();

    const clip = container.querySelector('video[src="/videos/individual-study.mp4"]') as HTMLVideoElement;
    expect(clip.muted).toBe(true);
    expect(clip.loop).toBe(true);
    expect(clip).toHaveAttribute('playsinline');
  });

  it('crops the corner of the clip that carries the generator watermark out of view', () => {
    const { container } = renderIndividual();

    const clip = container.querySelector('video[src="/videos/individual-study.mp4"]') as HTMLVideoElement;
    expect(Number(clip.dataset.zoom)).toBeGreaterThan(1);
    expect(clip.style.transform).toMatch(/scale\(1\.\d+\)/);
  });
});
