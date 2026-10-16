import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ROLES } from '@/lib/roles';
import { MANAGER_SIDEBAR } from '@/lib/sidebars';
import { SidebarNav } from '@/components/layout/sidebar/SidebarNav';
import { pulseReviewService, type PulseFinalReviewItem, type PulseFinalReviewQueue, type PulseRecording } from '@/services/pulse.service';
import { PulseFinalReviewsPage } from '../pages/PulseFinalReviewsPage';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const ok = <T,>(data: T) => ({ data: { success: true, message: 'Success', data } }) as never;

const criteria = [
  { number: '01', title: 'Nguồn có thể truy vết', description: 'Nêu nguồn.' },
  { number: '02', title: 'Hành động có thể kiểm tra', description: 'Trình bày cách làm.' },
  { number: '03', title: 'Kết luận có căn cứ', description: 'Kết luận và bước tiếp theo.' },
];

const item = (overrides: Partial<PulseFinalReviewItem> = {}): PulseFinalReviewItem => ({
  kind: 'FINAL',
  submissionId: 'sub-1',
  status: 'PENDING',
  employeeId: 'emp-1',
  employeeName: 'Nguyễn An',
  departmentName: 'Kế toán',
  positionName: 'Kế toán viên',
  courseId: 'course-1',
  courseCode: 'A1-F',
  courseTitle: 'Tìm kiếm và lưu trữ thông tin cơ bản',
  domainName: 'Khai thác dữ liệu và thông tin',
  tier: 1,
  attemptNo: 1,
  maxAttempts: 2,
  attempts: [{ submissionId: 'sub-1', attemptNo: 1, evidenceText: 'Nguồn: sổ cái tháng 9; đối chiếu 120 hóa đơn.', submittedAt: '2026-10-14T08:00:00Z' }],
  aiHint: { checks: [true, true, false], summary: 'Có nguồn và hành động kiểm tra được; chưa thấy bước tiếp theo.' },
  ...overrides,
});

const queue = (items: PulseFinalReviewItem[]): PulseFinalReviewQueue => ({
  pendingCount: items.filter((i) => i.status === 'PENDING').length,
  preAssessmentCount: items.filter((i) => i.kind === 'PRE_ASSESSMENT').length,
  retryCount: items.filter((i) => i.status === 'RETRY_WAIT' || i.status === 'RETRY_READY').length,
  deadlineMissedCount: items.filter((i) => i.status === 'DEADLINE_MISSED').length,
  flaggedCount: items.filter((i) => i.status === 'FLAGGED').length,
  criteria,
  items,
});

const flagged = item({
  submissionId: 'sub-3',
  status: 'FLAGGED',
  employeeName: 'Trần Bình',
  courseCode: 'A4-F',
  courseTitle: 'An toàn số cơ bản',
  attemptNo: 2,
  aiHint: null,
  attempts: [
    { submissionId: 'sub-2', attemptNo: 1, evidenceText: 'Lần một', submittedAt: '2026-10-01T08:00:00Z', decision: 'NOT_YET', decisionReason: 'Thiếu nguồn cụ thể.', reviewerName: 'Trưởng phòng' },
    { submissionId: 'sub-3', attemptNo: 2, evidenceText: 'Lần hai', submittedAt: '2026-10-05T08:00:00Z', decision: 'NOT_YET', decisionReason: 'Vẫn thiếu kết luận.' },
  ],
});

const recording: PulseRecording = {
  sessionId: 'ps-1',
  kind: 'PRE_ASSESSMENT',
  status: 'SUBMITTED',
  startedAt: '2026-10-15T08:00:00Z',
  endedAt: '2026-10-15T08:20:00Z',
  durationMs: 20 * 60_000,
  flaggedCount: 2,
  segments: [
    { recordingId: 'r-s1', track: 'SCREEN', segmentNo: 1, contentType: 'video/webm', displaySurface: 'monitor', startOffsetMs: 0, endOffsetMs: 6 * 60_000, sizeBytes: 900, contentPath: 'pulse/recordings/r-s1/content?exp=1&sig=a' },
    { recordingId: 'r-s2', track: 'SCREEN', segmentNo: 2, contentType: 'video/webm', displaySurface: 'monitor', startOffsetMs: 7 * 60_000, endOffsetMs: 20 * 60_000, sizeBytes: 900, contentPath: 'pulse/recordings/r-s2/content?exp=1&sig=b' },
    { recordingId: 'r-c1', track: 'CAMERA', segmentNo: 1, contentType: 'video/webm', startOffsetMs: 0, endOffsetMs: 20 * 60_000, sizeBytes: 900, contentPath: 'pulse/recordings/r-c1/content?exp=1&sig=c' },
  ],
  events: [
    { kind: 'STARTED', offsetMs: 0, flagged: false },
    { kind: 'TAB_HIDDEN', offsetMs: 3 * 60_000, durationMs: 12_000, flagged: true },
    { kind: 'SHARE_STOPPED', offsetMs: 6 * 60_000, durationMs: 60_000, flagged: true },
    { kind: 'SHARE_RESUMED', offsetMs: 7 * 60_000, flagged: false },
    { kind: 'SUBMITTED', offsetMs: 20 * 60_000, flagged: false },
  ],
};

const pre = item({
  kind: 'PRE_ASSESSMENT',
  submissionId: 'pa-1',
  employeeName: 'Phạm Dung',
  courseCode: 'A2-F',
  courseTitle: 'Giao tiếp số cơ bản',
  maxAttempts: 1,
  attempts: [{ submissionId: 'pa-1', attemptNo: 1, evidenceText: 'Soạn email gửi khách hàng có nguồn số liệu.', submittedAt: '2026-10-15T08:20:00Z', proctoringSessionId: 'ps-1' }],
  proctoringSessionId: 'ps-1',
  recording,
});

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/enterprise/team/final-reviews']}>
        <Routes>
          <Route path="/enterprise/team/final-reviews" element={<PulseFinalReviewsPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
  useCurrentUser.setState({
    user: { id: 'u-1', email: 'manager@digitalent.ai', fullName: 'Trưởng phòng', roles: [ROLES.MANAGER], permissions: ['task.evaluate', 'learning_progress.read', 'competency.read', 'dashboard.department.read'], workspace: 'enterprise' },
    isAuthenticated: true,
  });
});

describe('PulseFinalReviewsPage (MG-13, mock #/review)', () => {
  it('shows the queue counts, the evidence, the three criteria with the AI hint and every status', async () => {
    vi.spyOn(pulseReviewService, 'getQueue').mockResolvedValue(ok(queue([
      item(),
      flagged,
      item({ submissionId: 'sub-4', status: 'RETRY_WAIT', employeeName: 'Lê Chi', aiHint: null, attempts: [{ submissionId: 'sub-4', attemptNo: 1, evidenceText: 'Bài đầu', submittedAt: '2026-10-13T08:00:00Z', decision: 'NOT_YET', decisionReason: 'Cần phép tính.', retryOpensAt: '2026-10-16T08:00:00Z', retryDueAt: '2026-10-23T08:00:00Z' }] }),
    ])));

    renderPage();

    expect(await screen.findByRole('heading', { level: 1, name: 'Ra quyết định dựa trên minh chứng.' })).toBeTruthy();
    const kpis = screen.getByRole('region', { name: 'Tình trạng hàng chờ' });
    expect(within(kpis).getByText('Chờ quyết định').previousElementSibling).toHaveTextContent('1');
    expect(within(kpis).getByText('Cần hỗ trợ').previousElementSibling).toHaveTextContent('1');

    const pending = screen.getByRole('article', { name: 'Nguyễn An · Tìm kiếm và lưu trữ thông tin cơ bản' });
    expect(within(pending).getByText('Nguồn: sổ cái tháng 9; đối chiếu 120 hóa đơn.')).toBeTruthy();
    expect(within(pending).getAllByLabelText('Gợi ý: có')).toHaveLength(2);
    expect(within(pending).getByLabelText('Gợi ý: chưa thấy')).toBeTruthy();
    expect(within(pending).getByText('Có nguồn và hành động kiểm tra được; chưa thấy bước tiếp theo.')).toBeTruthy();

    const support = screen.getByRole('article', { name: 'Trần Bình · An toàn số cơ bản' });
    expect(within(support).getByText('Lần nộp trước')).toBeTruthy();
    expect(within(support).getByRole('button', { name: 'Sắp xếp kèm cặp' })).toBeTruthy();
    expect(screen.getByText(/Lần nộp cuối mở/)).toBeTruthy();
  });

  it('records a decision only with a choice and a reason of at least 10 characters', async () => {
    vi.spyOn(pulseReviewService, 'getQueue').mockResolvedValue(ok(queue([item()])));
    const decide = vi.spyOn(pulseReviewService, 'decide').mockResolvedValue(ok({ submissionId: 'sub-1', decision: 'PASSED', status: 'APPROVED', enrollmentStatus: 'COMPLETED' }));

    renderPage();

    const submit = await screen.findByRole('button', { name: 'Ghi quyết định cuối cùng →' });
    expect((submit as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(screen.getByRole('combobox', { name: 'Quyết định của quản lý' }), { target: { value: 'PASSED' } });
    fireEvent.change(screen.getByLabelText(/Lý do gửi nhân viên/), { target: { value: 'Ngắn' } });
    expect((submit as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText('Cần ít nhất 10 ký tự (hiện có 4).')).toBeTruthy();

    fireEvent.change(screen.getByLabelText(/Lý do gửi nhân viên/), { target: { value: '  Đạt cả ba tiêu chí, nguồn rõ ràng.  ' } });
    expect((submit as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(submit);

    await waitFor(() => expect(decide).toHaveBeenCalledWith('sub-1', 'PASSED', 'Đạt cả ba tiêu chí, nguồn rõ ràng.'));
  });

  it('warns that a second NOT_YET raises the support flag', async () => {
    vi.spyOn(pulseReviewService, 'getQueue').mockResolvedValue(ok(queue([item({ attemptNo: 2 })])));

    renderPage();

    fireEvent.change(await screen.findByRole('combobox', { name: 'Quyết định của quản lý' }), { target: { value: 'NOT_YET' } });
    expect(screen.getByText(/Đây là lần nộp cuối: chưa đạt sẽ bật cờ hỗ trợ/)).toBeTruthy();
  });

  it('records the support chosen for a flagged final', async () => {
    vi.spyOn(pulseReviewService, 'getQueue').mockResolvedValue(ok(queue([flagged])));
    const record = vi.spyOn(pulseReviewService, 'recordSupport').mockResolvedValue(ok({ submissionId: 'sub-3', action: 'COACHING', recordedAt: '2026-10-15T08:00:00Z' }));

    renderPage();

    const submit = await screen.findByRole('button', { name: 'Ghi hướng hỗ trợ →' });
    expect((submit as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Sắp xếp kèm cặp' }));
    fireEvent.change(screen.getByLabelText(/Ghi chú cho nhân viên/), { target: { value: 'Kèm cặp 2 buổi' } });
    fireEvent.click(submit);

    await waitFor(() => expect(record).toHaveBeenCalledWith('sub-3', 'COACHING', 'Kèm cặp 2 buổi'));
  });

  it('filters by status and explains an empty queue', async () => {
    vi.spyOn(pulseReviewService, 'getQueue').mockResolvedValue(ok(queue([item(), flagged])));
    const view = renderPage();

    fireEvent.click(await screen.findByRole('button', { name: /Cần hỗ trợ/ }));
    expect(screen.queryByRole('article', { name: /Nguyễn An/ })).toBeNull();
    expect(screen.getByRole('article', { name: /Trần Bình/ })).toBeTruthy();
    view.unmount();

    vi.spyOn(pulseReviewService, 'getQueue').mockResolvedValue(ok(queue([])));
    renderPage();
    expect(await screen.findByText('Chưa có bài nào cần quyết định.')).toBeTruthy();
  });
});

describe('PulseFinalReviewsPage · pre-assessments and recordings', () => {
  it('shows a pre-assessment with its recording, gaps and proctoring log', async () => {
    vi.spyOn(pulseReviewService, 'getQueue').mockResolvedValue(ok(queue([pre, item()])));

    renderPage();

    const card = await screen.findByRole('article', { name: 'Phạm Dung · Giao tiếp số cơ bản' });
    expect(within(card).getByRole('heading', { level: 2, name: 'Đánh giá trước khi học' })).toBeTruthy();
    const player = within(card).getByRole('region', { name: 'Bản ghi bài làm' });
    expect(within(player).getByText(/2 sự kiện cần xem/)).toBeTruthy();
    const log = within(player).getByRole('list', { name: 'Nhật ký giám sát' });
    expect(within(log).getByText(/Rời tab bài làm/)).toBeTruthy();
    expect(within(log).getAllByText('Cần xem')).toHaveLength(2);

    // Tua tới lúc dừng chia sẻ: khung màn hình báo khoảng trống thay vì phát video.
    fireEvent.change(within(player).getByRole('slider', { name: 'Vị trí trong bản ghi' }), { target: { value: String(6 * 60_000 + 30_000) } });
    expect(within(player).getByText('Màn hình không được chia sẻ')).toBeTruthy();

    const kpis = screen.getByRole('region', { name: 'Tình trạng hàng chờ' });
    expect(within(kpis).getByText('Đánh giá trước khi học').previousElementSibling).toHaveTextContent('1');
  });

  it('records a pre-assessment decision through its own endpoint', async () => {
    vi.spyOn(pulseReviewService, 'getQueue').mockResolvedValue(ok(queue([pre])));
    const decideFinal = vi.spyOn(pulseReviewService, 'decide');
    const decidePre = vi.spyOn(pulseReviewService, 'decidePreAssessment').mockResolvedValue(ok({ preAssessmentId: 'pa-1', decision: 'PASSED', status: 'PASSED', enrollmentId: 'enr-9' }));

    renderPage();

    const select = await screen.findByRole('combobox', { name: 'Quyết định của quản lý' });
    expect(within(select).getByRole('option', { name: 'Đạt · công nhận khóa, không cần học' })).toBeTruthy();
    fireEvent.change(select, { target: { value: 'PASSED' } });
    fireEvent.change(screen.getByLabelText(/Lý do gửi nhân viên/), { target: { value: 'Bài đạt cả ba tiêu chí, có nguồn.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ghi quyết định cuối cùng →' }));

    await waitFor(() => expect(decidePre).toHaveBeenCalledWith('pa-1', 'PASSED', 'Bài đạt cả ba tiêu chí, có nguồn.'));
    expect(decideFinal).not.toHaveBeenCalled();
  });

  it('filters the queue by kind of test', async () => {
    vi.spyOn(pulseReviewService, 'getQueue').mockResolvedValue(ok(queue([pre, item()])));

    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: /^Bài cuối khóa/ }));
    expect(screen.queryByRole('article', { name: /Phạm Dung/ })).toBeNull();
    expect(screen.getByRole('article', { name: /Nguyễn An/ })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /^Đánh giá trước khi học/ }));
    expect(screen.getByRole('article', { name: /Phạm Dung/ })).toBeTruthy();
    expect(screen.queryByRole('article', { name: /Nguyễn An/ })).toBeNull();
  });
});

describe('manager sidebar', () => {
  const renderNav = (path: string) =>
    render(
      <MemoryRouter initialEntries={[path]}>
        <SidebarNav config={MANAGER_SIDEBAR} isRail={false} />
      </MemoryRouter>,
    );

  it('highlights only the most specific item: Chấm bài, not the team overview', () => {
    renderNav('/enterprise/team/final-reviews');
    expect(screen.getByRole('link', { name: /Chấm bài/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: /^Tổng quan$/ })).not.toHaveAttribute('aria-current');
  });

  it('still highlights the overview on its own page', () => {
    renderNav('/enterprise/team');
    expect(screen.getByRole('link', { name: /^Tổng quan$/ })).toHaveAttribute('aria-current', 'page');
  });
});
