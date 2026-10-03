import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { EnterpriseLandingPage, IndividualLandingPage } from '../pages/LandingPage';
import { useCurrentUser } from '@/hooks/use-current-user';
import { PLANS } from '@/lib/plans';

function renderBusiness() {
  return render(
    <MemoryRouter>
      <EnterpriseLandingPage />
    </MemoryRouter>
  );
}

const region = (name: RegExp) => screen.getByRole('region', { name });

describe('Business landing page: story and structure', () => {
  beforeEach(() => {
    localStorage.clear();
    useCurrentUser.getState().clearUser();
  });

  it('tells the story in the agreed order, without a separate features section', () => {
    renderBusiness();

    const titles = screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent ?? '');
    const order = [
      /Đào tạo xong chưa có nghĩa/,
      /Cách DigiTalent AI vận hành/,
      /Mỗi vị trí cần một bộ năng lực số riêng/,
      /Nhìn thấy đội ngũ thiếu gì/,
      /Từ nhiệm vụ thực tế đến năng lực được xác nhận/,
      /Ai vận hành DigiTalent AI/,
      /Từ đăng ký đến triển khai/,
      /Chọn gói theo quy mô/,
      /Câu hỏi thường gặp/,
      /Biết đội ngũ cần phát triển gì/,
    ].map((pattern) => titles.findIndex((title) => pattern.test(title)));

    expect(order.every((index) => index >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(titles.some((title) => /trên cùng một nền tảng/.test(title))).toBe(false);
  });

  it('keeps wording that matches the product rules: no public certificate lookup, no free plan, no old role names', () => {
    const { container } = renderBusiness();
    const text = container.textContent ?? '';

    expect(text).not.toMatch(/tra cứu chứng chỉ|chứng chỉ công khai|ai cũng kiểm tra/i);
    expect(text).not.toMatch(/miễn phí/i);
    expect(text).not.toMatch(/Quản trị tổ chức|Quản trị học tập|Platform Admin|PLATFORM_ADMIN|5 vai trò/);
    expect(text).not.toMatch(/Trung bình/);
    expect(text).not.toMatch(/trong 5 phút|trong 1 ngày|10\.000\+/);
  });
});

describe('Business landing page: hero and bridge', () => {
  beforeEach(() => {
    localStorage.clear();
    useCurrentUser.getState().clearUser();
  });

  it('opens with the two-line promise, description, and two calls to action', () => {
    renderBusiness();

    expect(screen.getByText('Biết đội ngũ đang thiếu gì.')).toBeInTheDocument();
    expect(screen.getByText(/Phát triển đúng năng lực\./)).toBeInTheDocument();
    expect(screen.getByText(/Đánh giá, đào tạo và xác nhận năng lực bằng minh chứng công việc thực tế\./)).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Xem bảng giá' })[0]).toHaveAttribute('href', '/business/pricing');
    expect(screen.getByRole('link', { name: 'Xem cách hoạt động' })).toHaveAttribute('href', '#cach-hoat-dong');
  });

  it('keeps the hero clean without dashboard sample data fragments', () => {
    renderBusiness();

    expect(screen.queryByRole('group', { name: /Dữ liệu minh họa/ })).not.toBeInTheDocument();
  });

  it('asks the three questions an employer needs answered, then joins them into one loop', () => {
    renderBusiness();

    const bridge = region(/Đào tạo xong chưa có nghĩa/);
    expect(within(bridge).getByText('Ai đang thiếu năng lực nào?')).toBeInTheDocument();
    expect(within(bridge).getByText('Nên đào tạo ai, về nội dung gì?')).toBeInTheDocument();
    expect(within(bridge).getByText(/bằng chứng nào cho thấy họ thực sự làm được/)).toBeInTheDocument();
    expect(within(bridge).getByText(/nối ba câu hỏi đó thành một vòng/)).toBeInTheDocument();
  });

  it('offers a small index to the three deep-dives', () => {
    renderBusiness();

    const index = screen.getByRole('navigation', { name: 'Ba trụ cột của sản phẩm' });
    const links = within(index).getAllByRole('link');
    expect(links.map((link) => link.textContent)).toEqual([
      expect.stringContaining('Yêu cầu năng lực theo vị trí'),
      expect.stringContaining('Khoảng trống năng lực đội ngũ'),
      expect.stringContaining('Minh chứng và xác nhận'),
    ]);
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['#cach-hoat-dong', '#khoang-trong', '#minh-chung']);
  });
});

describe('Business landing page: how it works and the framework', () => {
  beforeEach(() => {
    localStorage.clear();
    useCurrentUser.getState().clearUser();
  });

  it('explains the competency loop in six steps and keeps sign-up steps out of it', () => {
    renderBusiness();

    const section = region(/Cách DigiTalent AI vận hành/);
    const steps = within(within(section).getByRole('list', { name: 'Vòng phát triển năng lực' })).getAllByRole('listitem');

    expect(steps).toHaveLength(6);
    expect(steps[0]).toHaveTextContent(/Xác định yêu cầu theo vị trí/);
    expect(steps[5]).toHaveTextContent(/Review minh chứng và xác nhận/);
    expect(section.textContent).not.toMatch(/Chọn gói|Tạo tổ chức|thanh toán/);
  });

  it('keeps the framework section about the framework only', () => {
    renderBusiness();

    const section = region(/Mỗi vị trí cần một bộ năng lực số riêng/);
    const text = within(section).getAllByRole('listitem').map((item) => item.textContent).join(' | ');

    expect(text).toMatch(/6.*miền năng lực/);
    expect(text).toMatch(/24.*năng lực thành phần/);
    expect(text).toMatch(/8.*bậc năng lực.*khung/);
    expect(text).toMatch(/9–24.*cấu hình.*vị trí/);
    expect(section.textContent).toMatch(/3 tầng.*Cơ bản.*Trung cấp.*Nâng cao/);
  });
});

describe('Business landing page: team skill gap and evidence', () => {
  beforeEach(() => {
    localStorage.clear();
    useCurrentUser.getState().clearUser();
  });

  it('shows what a team is missing: required, current and gap, worst first, with a training suggestion', () => {
    renderBusiness();

    const section = region(/Nhìn thấy đội ngũ thiếu gì/);
    const rows = within(within(section).getByRole('table', { name: /Khoảng trống năng lực của nhóm/ })).getAllByRole('row');

    // header + 4 competencies; the competency with the biggest gap comes first
    expect(rows).toHaveLength(5);
    expect(rows[1]).toHaveTextContent('6.1');
    expect(rows[1]).toHaveTextContent(/Còn thiếu 2 tầng/);
    expect(rows[4]).toHaveTextContent(/Đã đạt/);
    expect(within(section).getByText(/Ưu tiên đào tạo/)).toBeInTheDocument();
    expect(within(section).getByText(/8 nhân viên/)).toBeInTheDocument();
    expect(within(section).getByRole('button', { name: 'Đề xuất đào tạo' })).toBeInTheDocument();
    expect(within(section).getByText(/Dữ liệu minh họa/)).toBeInTheDocument();
  });

  it('uses the frozen terminology: trình độ and cấp bậc, never "mức" for competency levels', () => {
    renderBusiness();

    const section = region(/Nhìn thấy đội ngũ thiếu gì/);
    expect(within(section).getByText('Trình độ hiện tại')).toBeInTheDocument();
    expect(within(section).getByText('Trình độ yêu cầu')).toBeInTheDocument();
    expect(within(section).getByText(/Cấp bậc/)).toBeInTheDocument();
  });

  it('walks one piece of evidence from task to confirmed competency, reviewed by an Owner or Manager', () => {
    renderBusiness();

    const section = region(/Từ nhiệm vụ thực tế đến năng lực được xác nhận/);
    const stages = within(within(section).getByRole('list', { name: 'Các giai đoạn của minh chứng' })).getAllByRole('listitem');

    expect(stages.map((stage) => stage.textContent)).toEqual([
      expect.stringContaining('Nhiệm vụ'),
      expect.stringContaining('Đã nộp'),
      expect.stringContaining('Đang review'),
      expect.stringContaining('Đạt tiêu chí'),
      expect.stringContaining('Năng lực được xác nhận'),
    ]);
    expect(section.textContent).toMatch(/Owner hoặc Manager có thẩm quyền review/);
    expect(within(section).getByText(/Trình độ đã xác nhận/)).toBeInTheDocument();
  });
});

describe('Business landing page: who uses it and how to start', () => {
  beforeEach(() => {
    localStorage.clear();
    useCurrentUser.getState().clearUser();
  });

  it('presents Owner, Manager and Employee in that order, with Manager optional', () => {
    renderBusiness();

    const section = region(/Ai vận hành DigiTalent AI/);
    const personas = within(section).getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent);

    expect(personas).toEqual(['Chủ doanh nghiệp', 'Quản lý', 'Nhân viên']);
    expect(within(section).getByText(/Không bắt buộc/)).toBeInTheDocument();
    expect(within(section).getByText(/Owner có thể trực tiếp thực hiện các nghiệp vụ quản lý/)).toBeInTheDocument();
  });

  it('tells the rollout in six steps without promising a duration', () => {
    renderBusiness();

    const section = region(/Từ đăng ký đến triển khai/);
    const steps = within(within(section).getByRole('list', { name: 'Các bước triển khai' })).getAllByRole('listitem');

    expect(steps).toHaveLength(6);
    expect(steps[0]).toHaveTextContent(/Chọn gói/);
    expect(steps[5]).toHaveTextContent(/Bắt đầu đánh giá và đào tạo/);
    expect(section.textContent).toMatch(/lời mời chưa kích hoạt/);
    expect(section.textContent).not.toMatch(/phút|trong \d+ ngày/);
  });
});

describe('Business landing page: pricing, FAQ and closing', () => {
  beforeEach(() => {
    localStorage.clear();
    useCurrentUser.getState().clearUser();
  });

  it('previews the three plans from the catalogue, with a seat calculator', () => {
    renderBusiness();

    const section = region(/Chọn gói theo quy mô/);
    for (const plan of PLANS.filter((candidate) => candidate.audience === 'enterprise')) {
      expect(within(section).getByRole('article', { name: `Gói ${plan.name}` })).toBeInTheDocument();
    }
    expect(within(section).queryByRole('article', { name: /Gói Khởi đầu/ })).not.toBeInTheDocument();
  });

  it('recomputes each plan when the number of employees changes and respects seat limits', () => {
    renderBusiness();

    const section = region(/Chọn gói theo quy mô/);
    fireEvent.change(within(section).getByLabelText('Số nhân viên'), { target: { value: '35' } });

    const pro = within(section).getByRole('article', { name: 'Gói Pro' });
    expect(within(pro).getAllByText(/1\.990\.000/).length).toBeGreaterThan(0);
    expect(within(pro).getByRole('link', { name: 'Chọn gói Pro' })).toHaveAttribute(
      'href',
      '/business/register?plan=ENT_PRO&seats=50&cycle=month'
    );
    const starter = within(section).getByRole('article', { name: 'Gói Starter' });
    expect(within(starter).getByText(/tối đa 30 ghế/i)).toBeInTheDocument();
    expect(within(starter).queryByRole('link', { name: 'Chọn gói Starter' })).not.toBeInTheDocument();
    expect(within(section).getByRole('article', { name: 'Gói Enterprise' })).toBeInTheDocument();
    expect(section.textContent).toMatch(/lời mời chưa kích hoạt vẫn chiếm ghế/);
  });

  it('answers the questions the product can answer, and keeps billing policy out', () => {
    renderBusiness();

    const section = region(/Câu hỏi thường gặp/);
    for (const question of [
      /Số ghế được tính như thế nào/,
      /Manager có bắt buộc không/,
      /không có Manager thì ai review minh chứng/,
      /Yêu cầu năng lực theo vị trí được thiết lập ra sao/,
      /Hoàn thành khóa học có đồng nghĩa năng lực được xác nhận không/,
      /Khung năng lực TT02 được dùng/,
    ]) {
      expect(within(section).getByText(question)).toBeInTheDocument();
    }
    expect(section.textContent).not.toMatch(/hoàn tiền|hủy gói|gia hạn|lưu trữ.*(tháng|năm)|thanh toán thất bại|tách biệt/i);
  });

  it('closes with one call to action', () => {
    renderBusiness();

    const finale = region(/Biết đội ngũ cần phát triển gì/);
    expect(within(finale).getAllByRole('link', { name: 'Xem bảng giá' })).toHaveLength(1);
  });
});

describe('Business landing page: background videos', () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    localStorage.clear();
    useCurrentUser.getState().clearUser();
    // A visitor who has not asked for reduced motion; otherwise the page loads no video at all.
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

  it('puts the former closing clip in the hero and the former hero clip at the end', () => {
    const { container } = renderBusiness();

    const heroSrc = container.querySelector('header video')?.getAttribute('src');
    const finaleSrc = screen.getByRole('region', { name: /Biết đội ngũ cần phát triển gì/ }).querySelector('video')?.getAttribute('src');

    expect(heroSrc).toContain('hf_20260314_131748');
    expect(finaleSrc).toContain('hf_20260405_170732');
  });

  it('leaves the individual page on its own clips', () => {
    const { container } = render(
      <MemoryRouter>
        <IndividualLandingPage />
      </MemoryRouter>
    );

    expect(container.querySelector('header video')?.getAttribute('src')).toContain('hf_20260405_170732');
  });
});

describe('Business landing page: review round (hierarchy, product detail, readability)', () => {
  beforeEach(() => {
    localStorage.clear();
    useCurrentUser.getState().clearUser();
  });

  it('shrinks the wordmark on the business hero so the promise leads, and leaves the individual hero alone', () => {
    const { container, unmount } = renderBusiness();
    expect(container.querySelector('h1')).toHaveStyle({ '--lp-wm-scale': '0.7' });
    unmount();

    const individual = render(
      <MemoryRouter>
        <IndividualLandingPage />
      </MemoryRouter>
    );
    expect(individual.container.querySelector('h1')?.getAttribute('style') ?? '').not.toContain('--lp-wm-scale');
  });

  it('keeps the numbers of the framework apart from the choice DigiTalent AI makes', () => {
    renderBusiness();

    const section = region(/Mỗi vị trí cần một bộ năng lực số riêng/);
    expect(within(section).getByText('Cấu hình của DigiTalent AI')).toBeInTheDocument();
    expect(within(section).getByText('Khung của Thông tư')).toBeInTheDocument();
    expect(section.textContent).toMatch(/9–24/);
  });

  it('lets a visitor look at another department and recomputes the gap table', () => {
    renderBusiness();

    const section = region(/Nhìn thấy đội ngũ thiếu gì/);
    const tabs = within(within(section).getByRole('tablist', { name: 'Chọn phòng ban' })).getAllByRole('tab');
    expect(tabs.map((tab) => tab.textContent)).toEqual(['Marketing', 'Kế toán', 'Kinh doanh (CRM)']);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');

    fireEvent.click(tabs[1]);

    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    const rows = within(within(section).getByRole('table', { name: /Khoảng trống năng lực của nhóm Kế toán/ })).getAllByRole('row');
    expect(rows[1]).toHaveTextContent('1.2');
    expect(rows[1]).toHaveTextContent(/Còn thiếu 2 tầng/);
  });

  it('shows what confirmation changes: the confirmed level and the gap that closes', () => {
    renderBusiness();

    const section = region(/Từ nhiệm vụ thực tế đến năng lực được xác nhận/);
    expect(within(section).getByText(/Cơ bản → Trung cấp/)).toBeInTheDocument();
    expect(within(section).getByText(/Khoảng trống 4\.2: còn thiếu 1 tầng → đã đạt/)).toBeInTheDocument();
  });

  it('gives each rollout step a small piece of what the product would show', () => {
    renderBusiness();

    const section = region(/Từ đăng ký đến triển khai/);
    expect(within(section).getByText('Tổ chức đã được tạo')).toBeInTheDocument();
    expect(within(section).getByText('3 vị trí đã cấu hình')).toBeInTheDocument();
    expect(within(section).getByText('12 nhân viên đã được mời')).toBeInTheDocument();
    expect(within(section).getByText(/Ví dụ minh họa/)).toBeInTheDocument();
  });

  it('puts Owner first and large, with Manager and Employee stacked beside it', () => {
    renderBusiness();

    const section = region(/Ai vận hành DigiTalent AI/);
    const [owner, manager, employee] = within(section).getAllByRole('article');
    expect(owner).toHaveAttribute('data-size', 'lead');
    expect(manager).toHaveAttribute('data-size', 'side');
    expect(employee).toHaveAttribute('data-size', 'side');
  });

  it('makes the recommended plan the most prominent one', () => {
    renderBusiness();

    const section = region(/Chọn gói theo quy mô/);
    expect(within(section).getByRole('article', { name: 'Gói Pro' })).toHaveAttribute('data-featured', 'true');
    expect(within(section).getByRole('article', { name: 'Gói Starter' })).not.toHaveAttribute('data-featured');
  });
});
