import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import {
  mentorEnterpriseService,
  pulseReviewService,
  type PulseFinalReviewItem,
  type PulseFinalReviewQueue,
} from '@/services/pulse.service';
import { MentorCourseReviewsPage } from '@/features/trial-program/pages/MentorCourseReviewsPage';
import { MentorCourseReviewWorkspacePage } from '@/features/trial-program/pages/MentorCourseReviewWorkspacePage';

function makeItem(overrides: Partial<PulseFinalReviewItem>): PulseFinalReviewItem {
  return {
    kind: 'FINAL',
    submissionId: 'sub-default',
    status: 'PENDING',
    employeeId: 'emp-1',
    employeeName: 'Lê Hoàng Long',
    organizationId: 'org-1',
    organizationName: 'DigiTalent Demo Company',
    departmentName: 'Sale',
    positionName: 'Sales / CRM',
    courseId: 'course-1',
    courseCode: 'M1-A',
    courseTitle: 'Phân tích thông tin và quản trị dữ liệu',
    domainName: 'Khai thác dữ liệu và thông tin',
    tier: 3,
    attemptNo: 1,
    maxAttempts: 2,
    assignment: {
      title: 'Bài thực hành phân tích doanh thu',
      promptHtml: '<p>Trình bày nguồn dữ liệu, phép kiểm tra sai số và đề xuất hành động.</p>',
      criteria: ['Nêu rõ tệp nguồn', 'Đối chiếu sai số'],
    },
    aiHint: {
      checks: [true, true, false],
      summary: 'Bài viết đã nêu nguồn dữ liệu và bước đối chiếu, cần xem kỹ kết luận hành động.',
      detail: null,
      fraud: null,
    },
    attempts: [
      {
        submissionId: 'sub-default',
        attemptNo: 1,
        evidenceText:
          'Từ báo cáo doanh thu Q3 xuất từ hệ thống CRM công ty, tôi kiểm tra lại công thức tổng theo khu vực và phát hiện 3 dòng trùng lặp cần làm sạch.',
        submittedAt: '2026-11-05T13:06:00.000Z',
        choice: {
          score: 8,
          total: 10,
          passMark: 7,
          passed: true,
          items: [
            { number: 1, question: 'Hàm lọc trùng dữ liệu?', selected: 'UNIQUE', correct: 'UNIQUE', isCorrect: true },
            { number: 2, question: 'Kiểm tra tổng hợp theo nhóm?', selected: 'SUMIF', correct: 'Pivot Table', isCorrect: false },
          ],
        },
      },
    ],
    recording: {
      sessionId: 'rec-1',
      kind: 'FINAL',
      status: 'SUBMITTED',
      startedAt: '2026-11-05T13:00:00.000Z',
      durationMs: 105000,
      flaggedCount: 0,
      segments: [
        { recordingId: 'seg-1', track: 'SCREEN', segmentNo: 1, contentType: 'video/webm', startOffsetMs: 0, endOffsetMs: 105000, sizeBytes: 1024, contentPath: 'recordings/seg-1.webm' },
        { recordingId: 'seg-2', track: 'CAMERA', segmentNo: 1, contentType: 'video/webm', startOffsetMs: 0, endOffsetMs: 105000, sizeBytes: 512, contentPath: 'recordings/seg-2.webm' },
      ],
      events: [],
      risk: { score: 12, level: 'LOW', faceCheck: 'ON', factors: [], moments: [] },
    },
    ...overrides,
  };
}

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="current-location">{location.pathname}</div>;
}

function renderWorkbenchRoutes(initialPath = '/mentor/course-reviews') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <LocationProbe />
        <Routes>
          <Route path="/mentor/course-reviews" element={<MentorCourseReviewsPage />} />
          <Route path="/mentor/course-reviews/:submissionId" element={<MentorCourseReviewWorkspacePage />} />
          <Route path="/mentor/enterprises/:organizationId" element={<MentorCourseReviewsPage />} />
          <Route path="/mentor/enterprises/:organizationId/submissions/:submissionId" element={<MentorCourseReviewWorkspacePage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('MentorReviewWorkbench Split View (Phương án 1)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('shows multiple AI annotations, switches the active passage, and labels missing evidence', async () => {
    const base = makeItem({});
    const essay = base.attempts[0].evidenceText!;
    const first = 'báo cáo doanh thu Q3';
    const second = 'phát hiện 3 dòng trùng lặp';
    const item = makeItem({
      aiHint: { source: 'GEMINI', summary: '', checks: [], annotations: [
        { metric: 'depth', criterionIndex: null, kind: 'strength', start: essay.indexOf(first),
          end: essay.indexOf(first) + first.length, note: 'Có nguồn dữ liệu cụ thể.', action: null },
        { metric: 'depth', criterionIndex: null, kind: 'improve', start: essay.indexOf(second),
          end: essay.indexOf(second) + second.length, note: 'Cần ghi quy tắc nhận diện dòng trùng.', action: null },
        { metric: 'depth', criterionIndex: null, kind: 'missing', start: null, end: null,
          note: 'Thiếu bảng đối chiếu.', action: 'Bổ sung bảng trước và sau khi làm sạch.' },
      ] },
    });
    vi.spyOn(pulseReviewService, 'getQueue').mockResolvedValue({
      data: { data: {
        pendingCount: 1, preAssessmentCount: 0, retryCount: 0, deadlineMissedCount: 0,
        flaggedCount: 0, reviewedCount: 0, criteria: [], items: [item],
      } },
    } as Awaited<ReturnType<typeof pulseReviewService.getQueue>>);
    renderWorkbenchRoutes();

    fireEvent.click(await screen.findByRole('button', { name: 'Xem 3 chú thích AI' }));
    expect(screen.getByText(first, { selector: 'mark' })).toHaveAttribute('data-active', 'true');
    expect(screen.getByText(second, { selector: 'mark' })).toHaveAttribute('data-active', 'false');
    fireEvent.click(screen.getByRole('button', { name: 'Chú thích tiếp theo' }));
    expect(screen.getByText(second, { selector: 'mark' })).toHaveAttribute('data-active', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Chú thích tiếp theo' }));
    expect(screen.getByRole('status')).toHaveTextContent('Thiếu bảng đối chiếu.');
    expect(screen.getByRole('status')).toHaveTextContent('Bổ sung bảng trước và sau khi làm sạch.');
    expect(screen.getByText(second, { selector: 'mark' })).toHaveAttribute('data-active', 'false');
  });

  it('merges the AI ruler marker into the Mentor slider only while both scores match', async () => {
    const title = 'Kiểm chứng nguồn';
    const item = makeItem({
      rubric: [{ number: '01', title, description: '', weightPercent: 100, isRequired: false }],
      aiHint: { source: 'GEMINI', checks: [true], summary: '', criterionScores: [75] },
    });
    vi.spyOn(pulseReviewService, 'getQueue').mockResolvedValue({
      data: { data: {
        pendingCount: 1, preAssessmentCount: 0, retryCount: 0, deadlineMissedCount: 0,
        flaggedCount: 0, reviewedCount: 0, criteria: [], items: [item],
      } },
    } as Awaited<ReturnType<typeof pulseReviewService.getQueue>>);

    renderWorkbenchRoutes();

    const slider = await screen.findByRole('slider', { name: `Điểm Mentor cho ${title}` });
    const ruler = slider.parentElement;
    expect(ruler?.querySelector('.mw-rubric-ai-marker')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: `Dùng điểm AI gợi ý 75% cho ${title}` }));
    expect(slider).toHaveValue('75');
    expect(screen.getByRole('button', { name: `Điểm Mentor khớp gợi ý AI 75% cho ${title}` })).toBeDisabled();
    expect(ruler?.querySelector('.mw-rubric-ai-marker')).not.toBeInTheDocument();

    fireEvent.change(slider, { target: { value: '60' } });
    expect(slider).toHaveValue('60');
    expect(ruler?.querySelector('.mw-rubric-ai-marker')).toBeInTheDocument();
  });

  it('hides course codes in the Mentor list, course heading, and assignment heading', async () => {
    const item = makeItem({
      courseCode: 'M1-F',
      courseTitle: 'M1-F · Tìm kiếm và lưu trữ thông tin cơ bản',
      assignment: {
        title: 'Bài cuối khóa (M1-F)',
        promptHtml: '<p>Trình bày nguồn dữ liệu.</p>',
        criteria: ['Nêu rõ tệp nguồn'],
      },
    });
    vi.spyOn(pulseReviewService, 'getQueue').mockResolvedValue({
      data: { data: {
        pendingCount: 1, preAssessmentCount: 0, retryCount: 0, deadlineMissedCount: 0,
        flaggedCount: 0, reviewedCount: 0, criteria: [], items: [item],
      } },
    } as Awaited<ReturnType<typeof pulseReviewService.getQueue>>);

    renderWorkbenchRoutes();

    const courseName = 'Tìm kiếm và lưu trữ thông tin cơ bản';
    const list = await screen.findByRole('list', { name: 'Danh sách bài nộp' });
    expect(within(list).getByText(courseName)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: courseName })).toBeInTheDocument();
    expect(screen.getByText('Đề bài thực hành yêu cầu: Bài cuối khóa')).toBeInTheDocument();
    expect(screen.queryByText(/M1-F/i)).not.toBeInTheDocument();
  });

  it('includes PRE_ASSESSMENT, sorts priority PENDING -> FLAGGED -> APPROVED in queue rail, and auto-selects top item', async () => {
    const queue: PulseFinalReviewQueue = {
      pendingCount: 1,
      preAssessmentCount: 1,
      retryCount: 0,
      deadlineMissedCount: 0,
      flaggedCount: 1,
      reviewedCount: 1,
      criteria: [
        { number: '1', title: 'Nguồn có thể truy vết', description: 'Nêu rõ nguồn số liệu.' },
        { number: '2', title: 'Hành động có thể kiểm tra', description: 'Người khác kiểm chứng được.' },
        { number: '3', title: 'Kết luận có căn cứ', description: 'Nêu bước tiếp theo.' },
      ],
      items: [
        makeItem({
          submissionId: 'sub-approved',
          status: 'APPROVED',
          employeeName: 'Trần Minh Anh',
          positionName: null,
          departmentName: null,
          courseCode: 'M2-F',
          courseTitle: 'Giao tiếp và cộng tác cơ bản',
          domainName: 'Giao tiếp và hợp tác',
          tier: 1,
        }),
        makeItem({
          submissionId: 'sub-flagged',
          status: 'FLAGGED',
          employeeName: 'Nguyễn Gia Bảo',
          positionName: null,
          departmentName: 'Sale',
          courseCode: 'M3-I',
          courseTitle: 'Sáng tạo nội dung trung cấp',
          domainName: 'Sáng tạo nội dung số',
          tier: 2,
        }),
        makeItem({
          submissionId: 'sub-pre',
          attempts: [{ submissionId: 'sub-pre', attemptNo: 1, evidenceText: 'Bài đầu vào', submittedAt: '2026-11-05T12:00:00.000Z' }],
          status: 'PENDING',
          kind: 'PRE_ASSESSMENT',
          employeeName: 'Nhân viên trước khóa',
          courseCode: 'M4-F',
        }),
        makeItem({
          submissionId: 'sub-pending',
          status: 'PENDING',
          employeeName: 'Lê Hoàng Long',
          courseCode: 'M1-A',
          courseTitle: 'Phân tích thông tin và quản trị dữ liệu',
        }),
      ],
    };

    vi.spyOn(pulseReviewService, 'getQueue').mockResolvedValue({
      data: { success: true, message: 'OK', data: queue },
    } as never);

    renderWorkbenchRoutes('/mentor/course-reviews');

    expect(await screen.findByRole('heading', { name: 'Chấm bài & Thẩm định Năng lực' })).toBeInTheDocument();
    expect(screen.getByText('Kiểm tra và chấm điểm bài cuối cấp sau mỗi cấp độ theo từng lĩnh vực.')).toBeInTheDocument();

    const list = await screen.findByRole('list', { name: 'Danh sách bài nộp' });
    const railItems = within(list).getAllByRole('listitem');
    expect(railItems).toHaveLength(4);

    expect(within(railItems[0]).getByText('Lê Hoàng Long')).toBeInTheDocument();
    expect(within(railItems[2]).getByText('Nguyễn Gia Bảo')).toBeInTheDocument();
    expect(within(railItems[2]).getByText('Sale')).toBeInTheDocument();
    expect(within(railItems[3]).getByText('Trần Minh Anh')).toBeInTheDocument();
    expect(within(railItems[3]).getByText('Chưa phân vị trí')).toBeInTheDocument();

    expect(within(railItems[1]).getByText('Nhân viên trước khóa')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Lọc theo doanh nghiệp' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Mở bộ lọc nhân viên' }));
    const orgSelect = screen.getByRole('combobox', { name: 'Lọc theo doanh nghiệp' });
    fireEvent.click(orgSelect);
    expect(screen.getByRole('option', { name: 'DigiTalent Demo Company (4 bài)' })).toBeInTheDocument();
    fireEvent.keyDown(orgSelect, { key: 'Escape' });
    expect(screen.queryByRole('group', { name: 'Tóm tắt ba phần cần kiểm tra' })).not.toBeInTheDocument();

    // Auto-selects top queue item on right grading stage with essay tab and prompt active by default
    const stageBanner = screen.getByRole('region', { name: 'Thông tin nhân viên và điều hướng hàng chờ' });
    expect(within(stageBanner).getByRole('heading', { name: 'Lê Hoàng Long' })).toBeInTheDocument();
    expect(screen.getByText('Đề bài thực hành yêu cầu: Bài thực hành phân tích doanh thu')).toBeInTheDocument();
    expect(screen.getByText('Minh chứng tự luận của nhân viên')).toBeInTheDocument();

    fireEvent.click(within(railItems[1]).getByRole('button'));
    expect(await screen.findByRole('combobox', { name: 'Quyết định của mentor' })).toBeInTheDocument();
  });

  it('switches evidence tabs (Essay -> Video RecordingPlayer -> Choice filter) and inserts AI essay draft into feedback', async () => {
    const queue: PulseFinalReviewQueue = {
      pendingCount: 1,
      preAssessmentCount: 0,
      retryCount: 0,
      deadlineMissedCount: 0,
      flaggedCount: 0,
      reviewedCount: 0,
      criteria: [
        { number: '1', title: 'Nguồn có thể truy vết', description: 'Nêu rõ nguồn số liệu.' },
        { number: '2', title: 'Hành động có thể kiểm tra', description: 'Kiểm chứng được.' },
        { number: '3', title: 'Kết luận có căn cứ', description: 'Đủ căn cứ.' },
      ],
      items: [makeItem({ submissionId: 'sub-1' })],
    };

    vi.spyOn(pulseReviewService, 'getQueue').mockResolvedValue({
      data: { success: true, message: 'OK', data: queue },
    } as never);

    renderWorkbenchRoutes('/mentor/course-reviews');

    const aiSection = await screen.findByRole('region', { name: 'Gợi ý chấm tự luận' });
    fireEvent.click(within(aiSection).getByText('Nhận xét nháp đề xuất'));

    // Apply AI guidance draft into review form
    fireEvent.click(within(aiSection).getByRole('button', { name: /Chèn gợi ý vào nhận xét/i }));
    const textarea = screen.getByLabelText(/Nhận xét gửi nhân viên/i) as HTMLTextAreaElement;
    expect(textarea.value.length).toBeGreaterThan(20);

    // Switch to Video tab -> mounts RecordingPlayer
    const evidenceTabs = screen.getByRole('tablist', { name: 'Chuyển phần kiểm tra bài làm' });
    fireEvent.click(within(evidenceTabs).getByRole('tab', { name: /Video giám sát/i }));
    expect(await screen.findByRole('region', { name: 'Bản ghi bài làm' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Phát' })).toBeInTheDocument();

    // Switch to Choice tab -> filter wrong answers
    fireEvent.click(within(evidenceTabs).getByRole('tab', { name: /Trắc nghiệm/i }));
    expect(await screen.findByText(/Hàm lọc trùng dữ liệu/i)).toBeInTheDocument();
    expect(screen.getByText(/Kiểm tra tổng hợp theo nhóm/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Chỉ câu sai/i }));
    expect(screen.queryByText(/Hàm lọc trùng dữ liệu/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Kiểm tra tổng hợp theo nhóm/i)).toBeInTheDocument();
  });

  it('advances continuously to next PENDING submission on save and shows completion banner after the final pending item', async () => {
    const item1 = makeItem({
      submissionId: 'sub-pending-1',
      status: 'PENDING',
      employeeName: 'Nhân viên Một',
      attempts: [
        {
          submissionId: 'sub-pending-1',
          attemptNo: 1,
          evidenceText: 'Bài nộp rõ ràng của nhân viên một với nguồn CRM, bước đối chiếu sai số và hành động khắc phục.',
          submittedAt: '2026-11-05T15:00:00.000Z',
          choice: { score: 8, total: 10, passMark: 7, passed: true },
        },
      ],
    });
    const item2 = makeItem({
      submissionId: 'sub-pending-2',
      status: 'PENDING',
      employeeName: 'Nhân viên Hai',
      attempts: [
        {
          submissionId: 'sub-pending-2',
          attemptNo: 1,
          evidenceText: 'Bài nộp đủ dài của nhân viên thứ hai với nguồn CRM, bước đối chiếu tổng và đề xuất giải pháp cụ thể cho tuần tới.',
          submittedAt: '2026-11-05T14:00:00.000Z',
          choice: { score: 9, total: 10, passMark: 7, passed: true },
        },
      ],
    });

    let gradedFirst = false;
    let gradedSecond = false;

    vi.spyOn(mentorEnterpriseService, 'list').mockResolvedValue({
      data: {
        success: true,
        message: 'OK',
        data: {
          totalEnterprises: 1,
          pendingCount: 2,
          attentionCount: 0,
          reviewedCount: 0,
          items: [
            {
              organizationId: 'org-alpha',
              organizationCode: 'ALPHA',
              organizationName: 'Công ty Alpha',
              stage: 'OFFICIAL',
              ownerName: 'Chủ Alpha',
              ownerEmail: 'alpha@corp.vn',
              departmentCount: 1,
              employeeCount: 10,
              pendingCount: 2,
              retryCount: 0,
              flaggedCount: 0,
              reviewedCount: 0,
              totalSubmissions: 2,
            },
          ],
        },
      },
    } as never);

    vi.spyOn(pulseReviewService, 'getQueue').mockImplementation(async () => ({
      data: {
        success: true,
        message: 'OK',
        data: {
          pendingCount: (gradedFirst ? 0 : 1) + (gradedSecond ? 0 : 1),
          preAssessmentCount: 0,
          retryCount: 0,
          deadlineMissedCount: 0,
          flaggedCount: 0,
          reviewedCount: (gradedFirst ? 1 : 0) + (gradedSecond ? 1 : 0),
          criteria: [],
          items: [
            gradedFirst ? { ...item1, status: 'APPROVED' as const } : item1,
            gradedSecond ? { ...item2, status: 'APPROVED' as const } : item2,
          ],
        },
      },
    }) as never);

    const decideSpy = vi.spyOn(pulseReviewService, 'decide').mockImplementation(async (submissionId) => {
      if (submissionId === 'sub-pending-1') gradedFirst = true;
      if (submissionId === 'sub-pending-2') gradedSecond = true;
      return {
        data: {
          success: true,
          message: 'OK',
          data: {
            submissionId,
            decision: 'PASSED',
            status: 'APPROVED',
            enrollmentStatus: 'COMPLETED',
          },
        },
      } as never;
    });

    renderWorkbenchRoutes('/mentor/enterprises/org-alpha');

    // First student active
    const banner = await screen.findByRole('region', { name: 'Thông tin nhân viên và điều hướng hàng chờ' });
    expect(within(banner).getByRole('heading', { name: 'Nhân viên Một' })).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Lọc theo lĩnh vực' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Mở bộ lọc nhân viên' }));
    expect(screen.getByRole('combobox', { name: 'Lọc theo lĩnh vực' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Thu gọn bộ lọc' }));

    // Grade first student -> CTA says "Lưu & sang bài tiếp theo"
    fireEvent.click(screen.getByRole('button', { name: 'Công nhận đạt' }));
    fireEvent.change(screen.getByLabelText(/Nhận xét gửi nhân viên/i), {
      target: { value: 'Minh chứng rõ ràng, số liệu khớp hoàn toàn với yêu cầu.' },
    });
    const nextSubmitBtn = screen.getByRole('button', { name: 'Lưu & sang bài tiếp theo' });
    fireEvent.click(nextSubmitBtn);

    await waitFor(() => {
      expect(decideSpy).toHaveBeenCalledWith(
        'sub-pending-1',
        'PASSED',
        'Minh chứng rõ ràng, số liệu khớp hoàn toàn với yêu cầu.',
      );
    });

    // Stays inside workbench and jumps automatically to Nhân viên Hai
    await waitFor(() => {
      expect(screen.getByTestId('current-location').textContent).toBe(
        '/mentor/enterprises/org-alpha/submissions/sub-pending-2',
      );
    });
    expect(
      within(screen.getByRole('region', { name: 'Thông tin nhân viên và điều hướng hàng chờ' })).getByRole('heading', {
        name: 'Nhân viên Hai',
      }),
    ).toBeInTheDocument();

    // Now on the final pending item -> CTA is "Lưu quyết định"
    fireEvent.click(screen.getByRole('button', { name: 'Công nhận đạt' }));
    fireEvent.change(screen.getByLabelText(/Nhận xét gửi nhân viên/i), {
      target: { value: 'Đạt chuẩn cấp độ sau kiểm tra số liệu và lập luận.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu quyết định' }));

    await waitFor(() => {
      expect(decideSpy).toHaveBeenCalledWith(
        'sub-pending-2',
        'PASSED',
        'Đạt chuẩn cấp độ sau kiểm tra số liệu và lập luận.',
      );
    });

    // Completion banner appears in-place without kicking mentor out of workbench
    expect(
      await screen.findByText('Đã chấm xong toàn bộ bài chờ chấm trong hàng đợi hiện tại.'),
    ).toBeInTheDocument();
  });

  it('filters by status tabs, department, search, paginates, and handles criteria modal Escape key', async () => {
    const items: PulseFinalReviewItem[] = Array.from({ length: 12 }, (_, idx) =>
      makeItem({
        submissionId: `sub-${idx + 1}`,
        status: idx % 2 === 0 ? 'PENDING' : 'APPROVED',
        employeeId: `emp-${idx + 1}`,
        employeeName: `Nhân viên ${String(idx + 1).padStart(2, '0')}`,
        departmentName: idx === 1 ? 'Vận hành' : 'Sale',
      }),
    );

    vi.spyOn(pulseReviewService, 'getQueue').mockResolvedValue({
      data: {
        success: true,
        message: 'OK',
        data: {
          pendingCount: 6,
          preAssessmentCount: 0,
          retryCount: 0,
          deadlineMissedCount: 0,
          flaggedCount: 0,
          reviewedCount: 6,
          criteria: [
            { number: '1', title: 'Đúng trọng tâm', description: 'Trả lời sát tình huống thực tế.' },
            { number: '10', title: 'Minh chứng đầy đủ', description: 'Nêu số liệu và bước kiểm tra rõ ràng.' },
          ],
          items,
        },
      },
    } as never);

    renderWorkbenchRoutes('/mentor/course-reviews');

    await screen.findByText('Tổng 12 bài cuối cấp');
    const railList = screen.getByRole('list', { name: 'Danh sách bài nộp' });
    expect(within(railList).getAllByRole('listitem')).toHaveLength(10);

    const nav = screen.getByRole('navigation', { name: 'Phân trang danh sách' });
    expect(nav.textContent).toContain('Hiển thị 1 đến 10 trong tổng 12 bài nộp');

    // Page 2 -> 2 items
    fireEvent.click(screen.getByRole('button', { name: 'Trang sau' }));
    expect(within(screen.getByRole('list', { name: 'Danh sách bài nộp' })).getAllByRole('listitem')).toHaveLength(2);
    expect(nav.textContent).toContain('Hiển thị 11 đến 12 trong tổng 12 bài nộp');

    // Page size 20 -> all 12
    fireEvent.click(screen.getByRole('combobox', { name: 'Số dòng mỗi trang' }));
    fireEvent.click(screen.getByRole('option', { name: '20' }));
    expect(within(screen.getByRole('list', { name: 'Danh sách bài nộp' })).getAllByRole('listitem')).toHaveLength(12);

    // Department filter
    fireEvent.click(screen.getByRole('button', { name: 'Mở bộ lọc nhân viên' }));
    fireEvent.click(screen.getByRole('combobox', { name: 'Lọc theo phòng ban' }));
    fireEvent.click(screen.getByRole('option', { name: 'Vận hành' }));
    expect(screen.getByText('Tổng 1 bài cuối cấp')).toBeInTheDocument();

    // Reset filters
    fireEvent.click(screen.getByRole('button', { name: /Đặt lại bộ lọc/i }));
    expect(screen.getByText('Tổng 12 bài cuối cấp')).toBeInTheDocument();

    // Search miss -> empty message + clear
    fireEvent.change(screen.getByLabelText('Tìm bài nộp'), { target: { value: 'khong-ton-tai-xyz' } });
    expect(await screen.findByRole('heading', { name: 'Không có bài nộp khớp bộ lọc' })).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: /Đặt lại bộ lọc/i })[0]);
    expect(screen.getByText('Tổng 12 bài cuối cấp')).toBeInTheDocument();

    // Open and close criteria modal on Escape
    fireEvent.click(screen.getByRole('button', { name: /Xem tiêu chuẩn/i }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Tiêu chí 01')).toBeInTheDocument();
    expect(within(dialog).getByText('Tiêu chí 10')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('disables PASSED when choice threshold fails and navigates via queue stepper buttons', async () => {
    const failedChoiceItem = makeItem({
      submissionId: 'sub-choice-fail',
      status: 'PENDING',
      employeeName: 'Nhân viên Trắc Nghiệm Yếu',
      attempts: [
        {
          submissionId: 'sub-choice-fail',
          attemptNo: 1,
          evidenceText: 'Bài tự luận khá chi tiết nhưng phần trắc nghiệm chỉ đạt 5/10 câu.',
          submittedAt: '2026-11-05T15:00:00.000Z',
          choice: { score: 5, total: 10, passMark: 7, passed: false },
        },
      ],
    });
    const secondItem = makeItem({
      submissionId: 'sub-second',
      status: 'PENDING',
      employeeName: 'Nhân viên Tiếp Theo',
      attempts: [
        {
          submissionId: 'sub-second',
          attemptNo: 1,
          evidenceText: 'Bài nộp tiếp theo để kiểm tra điều hướng.',
          submittedAt: '2026-11-05T14:00:00.000Z',
          choice: { score: 8, total: 10, passMark: 7, passed: true },
        },
      ],
    });

    vi.spyOn(pulseReviewService, 'getQueue').mockResolvedValue({
      data: {
        success: true,
        message: 'OK',
        data: {
          pendingCount: 2,
          preAssessmentCount: 0,
          retryCount: 0,
          deadlineMissedCount: 0,
          flaggedCount: 0,
          reviewedCount: 0,
          criteria: [],
          items: [failedChoiceItem, secondItem],
        },
      },
    } as never);

    renderWorkbenchRoutes('/mentor/course-reviews');

    const banner = await screen.findByRole('region', { name: 'Thông tin nhân viên và điều hướng hàng chờ' });
    expect(within(banner).getByRole('heading', { name: 'Nhân viên Trắc Nghiệm Yếu' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Công nhận đạt' })).toBeDisabled();

    // Guidance enforces NOT_YET when choice fails
    fireEvent.click(screen.getByRole('button', { name: /Chèn gợi ý vào nhận xét/i }));
    expect(screen.getByRole('button', { name: 'Chưa đạt' })).toHaveAttribute('aria-pressed', 'true');

    // Stepper "Bài tiếp" switches directly to second item
    fireEvent.click(screen.getByRole('button', { name: 'Bài tiếp' }));
    await waitFor(() => {
      expect(screen.getByTestId('current-location').textContent).toBe('/mentor/course-reviews/sub-second');
    });
    expect(
      within(screen.getByRole('region', { name: 'Thông tin nhân viên và điều hướng hàng chờ' })).getByRole('heading', {
        name: 'Nhân viên Tiếp Theo',
      }),
    ).toBeInTheDocument();
  });

  it('lists all assigned enterprises including 0-submission organizations on /mentor/course-reviews and filters cleanly', async () => {
    vi.spyOn(mentorEnterpriseService, 'list').mockResolvedValue({
      data: {
        success: true,
        message: 'OK',
        data: {
          totalEnterprises: 2,
          pendingCount: 1,
          attentionCount: 0,
          reviewedCount: 0,
          items: [
            {
              organizationId: 'org-1',
              organizationCode: 'DIGITALENT',
              organizationName: 'DigiTalent Demo Company',
              stage: 'TRIAL',
              departmentCount: 3,
              employeeCount: 5,
              pendingCount: 1,
              retryCount: 0,
              flaggedCount: 0,
              reviewedCount: 0,
              totalSubmissions: 1,
            },
            {
              organizationId: 'org-alpha',
              organizationCode: 'TRIAL-C28150',
              organizationName: 'Tập đoàn Công nghệ Alpha',
              stage: 'TRIAL',
              departmentCount: 1,
              employeeCount: 0,
              pendingCount: 0,
              retryCount: 0,
              flaggedCount: 0,
              reviewedCount: 0,
              totalSubmissions: 0,
            },
          ],
        },
      },
    } as never);

    vi.spyOn(pulseReviewService, 'getQueue').mockResolvedValue({
      data: {
        success: true,
        message: 'OK',
        data: {
          pendingCount: 1,
          preAssessmentCount: 0,
          retryCount: 0,
          deadlineMissedCount: 0,
          flaggedCount: 0,
          reviewedCount: 0,
          criteria: [],
          items: [makeItem({ submissionId: 'sub-1' })],
        },
      },
    } as never);

    renderWorkbenchRoutes('/mentor/course-reviews');

    fireEvent.click(await screen.findByRole('button', { name: 'Mở bộ lọc nhân viên' }));
    fireEvent.click(await screen.findByRole('combobox', { name: 'Lọc theo doanh nghiệp' }));
    expect(await screen.findByRole('option', { name: 'DigiTalent Demo Company (1 bài)' })).toBeInTheDocument();
    fireEvent.click(await screen.findByRole('option', { name: 'Tập đoàn Công nghệ Alpha (0 bài)' }));
    expect(await screen.findByRole('heading', { name: 'Doanh nghiệp này chưa có bài nộp' })).toBeInTheDocument();
    expect(screen.getByText('Tổng 0 bài cuối cấp')).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: /Đặt lại bộ lọc/i })[0]);
    expect(await screen.findByText('Tổng 1 bài cuối cấp')).toBeInTheDocument();
  });

  it('always shows a course prompt box even when assignment payload is null', async () => {
    vi.spyOn(pulseReviewService, 'getQueue').mockResolvedValue({
      data: {
        success: true,
        message: 'OK',
        data: {
          pendingCount: 1,
          preAssessmentCount: 0,
          retryCount: 0,
          deadlineMissedCount: 0,
          flaggedCount: 0,
          reviewedCount: 0,
          criteria: [],
          items: [makeItem({ submissionId: 'sub-no-assign', assignment: null })],
        },
      },
    } as never);

    renderWorkbenchRoutes('/mentor/course-reviews');

    fireEvent.click(await screen.findByText('Đề bài thực hành yêu cầu'));
    expect(screen.getByText('Đề chuẩn theo khung khóa học')).toBeInTheDocument();
    expect(screen.getByText(/Mô tả một nhiệm vụ thực tế của vị trí Sales \/ CRM/i)).toBeInTheDocument();
  });

  it('supports detailed per-criterion rubric grading with Gemini criterionNotes and itemized submission', async () => {
    const queue: PulseFinalReviewQueue = {
      pendingCount: 1,
      preAssessmentCount: 0,
      retryCount: 0,
      deadlineMissedCount: 0,
      flaggedCount: 0,
      reviewedCount: 0,
      criteria: [
        { number: '01', title: 'Nguồn có thể truy vết', description: 'Nêu nguồn rõ ràng.' },
        { number: '02', title: 'Hành động có thể kiểm tra', description: 'Người khác kiểm chứng được.' },
        { number: '03', title: 'Kết luận có căn cứ', description: 'Có bước hành động tiếp theo.' },
      ],
      items: [
        makeItem({
          submissionId: 'sub-gemini',
          assignment: null,
          aiHint: {
            source: 'GEMINI',
            model: 'gemini-2.5-flash',
            checks: [true, false, false],
            criterionNotes: [
              'Đã nêu báo cáo Q3 từ CRM.',
              'Chưa đưa công thức kiểm tra trùng.',
              'Chưa nêu người chịu trách nhiệm tiếp theo.',
            ],
            criterionEvidence: ['báo cáo doanh thu Q3\n xuất từ hệ thống CRM công ty', null],
            summary: 'Bài nêu đúng nguồn CRM nhưng thiếu công thức kiểm tra và bước tiếp theo.',
            detail: {
              evidence: { ai: null },
              plagiarismScore: 10,
              plagiarismNote: 'Tự viết theo tình huống công việc.',
              aiGeneratedScore: 15,
              aiGeneratedNote: 'Văn phong tự nhiên.',
              relevanceScore: 80,
              relevanceNote: 'Đúng chủ đề dữ liệu bán hàng.',
              depthScore: 55,
              depthNote: 'Cần bổ sung phép kiểm chứng.',
              clarityScore: 75,
              clarityNote: 'Câu chữ mạch lạc.',
              verdict: 'Nên bổ sung công thức lọc trùng trước khi công nhận đạt.',
            },
            fraud: null,
          },
        }),
      ],
    };

    const getQueueSpy = vi.spyOn(pulseReviewService, 'getQueue').mockResolvedValue({
      data: { success: true, message: 'OK', data: queue },
    } as never);

    const decideSpy = vi.spyOn(pulseReviewService, 'decide').mockResolvedValue({
      data: {
        success: true,
        message: 'OK',
        data: {
          submissionId: 'sub-gemini',
          decision: 'NOT_YET',
          status: 'RETRY_WAIT',
          enrollmentStatus: 'IN_PROGRESS',
        },
      },
    } as never);

    renderWorkbenchRoutes('/mentor/course-reviews');

    const aiSection = await screen.findByRole('region', { name: 'Gợi ý chấm tự luận' });
    expect(within(aiSection).getByText('Trợ lý phân tích')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: /Trắc nghiệm/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Nguồn có thể truy vết' }));
    expect(screen.getByRole('tab', { name: /Trắc nghiệm/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/Đã nêu báo cáo Q3 từ CRM\./)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tìm trong bài làm: Nguồn có thể truy vết' }));
    expect(screen.getByRole('tab', { name: /Tự luận/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('báo cáo doanh thu Q3 xuất từ hệ thống CRM công ty', { selector: 'mark' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Đã nêu báo cáo Q3 từ CRM.');
    fireEvent.click(screen.getByRole('button', { name: 'Hành động có thể kiểm tra' }));
    fireEvent.click(screen.getByRole('button', { name: 'Tìm trong bài làm: Hành động có thể kiểm tra' }));
    expect(screen.getByRole('status')).toHaveTextContent('Không có đoạn trích trực tiếp.');
    expect(screen.queryByText('báo cáo doanh thu Q3 xuất từ hệ thống CRM công ty', { selector: 'mark' })).not.toBeInTheDocument();

    fireEvent.click(within(aiSection).getByText(/Chi tiết 5 chỉ số phân tích bài nộp/));
    fireEvent.click(screen.getByRole('tab', { name: /Trắc nghiệm/i }));
    const fallbackQueue = structuredClone(queue);
    fallbackQueue.items[0].aiHint = { source: 'KEYWORD_FALLBACK', checks: [], summary: '' };
    getQueueSpy.mockResolvedValueOnce({
      data: { success: true, message: 'OK', data: fallbackQueue },
    } as never);
    const depth = within(aiSection).getByRole('button', { name: 'Xem dẫn chứng: Chiều sâu và minh chứng' });
    fireEvent.click(depth);
    expect(await screen.findByText('Chưa nhận được dẫn chứng từ AI. Bấm lại để thử lại.')).toBeInTheDocument();
    expect(depth.closest('details')).toHaveAttribute('open');
    expect(within(aiSection).getByText('Trợ lý phân tích')).toBeInTheDocument();

    const refreshedQueue = structuredClone(queue);
    refreshedQueue.items[0].aiHint!.detail!.evidence!.depth = 'phát hiện 3 dòng trùng lặp cần làm sạch';
    let completeLookup!: () => void;
    const lookup = new Promise<void>((resolve) => { completeLookup = resolve; });
    getQueueSpy.mockImplementationOnce(async () => {
      await lookup;
      return { data: { success: true, message: 'OK', data: refreshedQueue } } as never;
    });
    fireEvent.click(depth);
    expect(depth).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('tab', { name: /Tự luận/i })).toHaveAttribute('aria-selected', 'true');
    expect(await screen.findByText('AI đang tìm đoạn liên quan trong bài làm…')).toBeInTheDocument();
    fireEvent.click(depth);
    expect(getQueueSpy.mock.calls.filter((call) => call[2])).toEqual([
      [true, undefined, true, 'sub-gemini', undefined, 'depth'],
      [true, undefined, true, 'sub-gemini', undefined, 'depth'],
    ]);
    completeLookup();
    expect(await screen.findByText('phát hiện 3 dòng trùng lặp cần làm sạch', { selector: 'mark' })).toBeInTheDocument();

    fireEvent.click(within(aiSection).getByRole('button', { name: 'Xem dẫn chứng: Dấu hiệu văn bản tự động' }));
    expect(depth).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('status')).toHaveTextContent('Không có đoạn trích trực tiếp.');
    expect(screen.queryByText('phát hiện 3 dòng trùng lặp cần làm sạch', { selector: 'mark' })).not.toBeInTheDocument();
    fireEvent.click(depth);
    expect(screen.getByText('phát hiện 3 dòng trùng lặp cần làm sạch', { selector: 'mark' })).toBeInTheDocument();
    expect(getQueueSpy.mock.calls.filter((call) => call[2])).toHaveLength(2);

    const criterionQueue = structuredClone(refreshedQueue);
    criterionQueue.items[0].aiHint!.criterionEvidence![2] = 'tôi kiểm tra lại công thức tổng theo khu vực';
    getQueueSpy.mockResolvedValueOnce({
      data: { success: true, message: 'OK', data: criterionQueue },
    } as never);
    fireEvent.click(screen.getByRole('button', { name: 'Kết luận có căn cứ' }));
    fireEvent.click(screen.getByRole('button', { name: 'Tìm trong bài làm: Kết luận có căn cứ' }));
    expect(await screen.findByText('tôi kiểm tra lại công thức tổng theo khu vực', { selector: 'mark' })).toBeInTheDocument();

    // Refresh analysis button triggers cache-bypass query
    fireEvent.click(within(aiSection).getByRole('button', { name: /Phân tích lại/i }));
    await waitFor(() => {
      expect(getQueueSpy.mock.calls.filter((call) => call[2])).toHaveLength(4);
    });

    // Rate each rubric criterion individually
    fireEvent.click(screen.getByRole('button', { name: 'Chấm 100% cho Nguồn có thể truy vết' }));
    fireEvent.change(screen.getByRole('slider', { name: 'Điểm Mentor cho Hành động có thể kiểm tra' }), {
      target: { value: '50' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Chấm 0% cho Kết luận có căn cứ' }));

    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('3/3 tiêu chí đã chấm')).toBeInTheDocument();

    // Quick chip on criterion 02 & manual note on criterion 03
    const rubric = screen.getByLabelText('Bảng chấm chi tiết theo tiêu chí');
    const noteButtons = within(rubric).getAllByRole('button', { name: 'Ghi chú' });
    fireEvent.click(noteButtons[1]!);
    fireEvent.click(noteButtons[2]!);
    fireEvent.click(screen.getByRole('button', { name: '+ Đúng hướng nhưng thiếu số liệu' }));
    const crit3NoteInput = screen.getByLabelText('Ghi chú tiêu chí 03') as HTMLInputElement;
    fireEvent.change(crit3NoteInput, { target: { value: 'Cần nêu thời hạn xử lý dữ liệu.' } });

    const reasonInput = screen.getByLabelText(/Nhận xét gửi nhân viên/i) as HTMLTextAreaElement;
    expect(reasonInput.value).toContain('Đánh giá tự luận (50% · 1/3 tiêu chí đạt):');
    expect(reasonInput.value).toContain('Tiêu chí 02 (Hành động có thể kiểm tra): 50%. Đúng hướng nhưng thiếu số liệu');
    expect(reasonInput.value).toContain('Tiêu chí 03 (Kết luận có căn cứ): 0%. Cần nêu thời hạn xử lý dữ liệu.');

    fireEvent.click(screen.getByRole('button', { name: 'Chưa đạt' }));
    fireEvent.click(screen.getByRole('button', { name: 'Lưu quyết định' }));

    await waitFor(() => {
      expect(decideSpy).toHaveBeenCalledWith(
        'sub-gemini',
        'NOT_YET',
        reasonInput.value.trim(),
        [
          { number: '01', title: 'Nguồn có thể truy vết', status: 'PASS', scorePercent: 100, note: null },
          {
            number: '02',
            title: 'Hành động có thể kiểm tra',
            status: 'PARTIAL',
            scorePercent: 50,
            note: 'Đúng hướng nhưng thiếu số liệu',
          },
          {
            number: '03',
            title: 'Kết luận có căn cứ',
            status: 'FAIL',
            scorePercent: 0,
            note: 'Cần nêu thời hạn xử lý dữ liệu.',
          },
        ],
      );
    });
  });

  it('honestly marks unconfigured server AI as keyword fallback instead of Gemini AI', async () => {
    vi.spyOn(pulseReviewService, 'getQueue').mockResolvedValue({
      data: {
        success: true,
        message: 'OK',
        data: {
          pendingCount: 1,
          preAssessmentCount: 0,
          retryCount: 0,
          deadlineMissedCount: 0,
          flaggedCount: 0,
          reviewedCount: 0,
          criteria: [
            { number: '01', title: 'Nguồn có thể truy vết', description: 'Nêu nguồn rõ.' },
          ],
          items: [
            makeItem({
              submissionId: 'sub-fallback',
              aiHint: {
                source: 'KEYWORD_FALLBACK',
                model: null,
                checks: [true],
                criterionNotes: null,
                summary: 'Gợi ý sơ bộ: thấy từ khóa trùng tiêu chí.',
                detail: null,
                fraud: null,
              },
            }),
          ],
        },
      },
    } as never);

    renderWorkbenchRoutes('/mentor/course-reviews');

    const aiSection = await screen.findByRole('region', { name: 'Gợi ý chấm tự luận' });
    expect(within(aiSection).getByText('Dò từ khóa')).toBeInTheDocument();
    expect(within(aiSection).getByRole('button', { name: /Phân tích lại/i })).toBeEnabled();
  });

  it('collapses and expands the employee queue rail while preserving collapsed state across quick candidate switches', async () => {
    const first = makeItem({
      submissionId: 'sub-a',
      status: 'PENDING',
      employeeName: 'Nhân viên A',
    });
    const second = makeItem({
      submissionId: 'sub-b',
      status: 'PENDING',
      employeeName: 'Nhân viên B',
    });

    vi.spyOn(pulseReviewService, 'getQueue').mockResolvedValue({
      data: {
        success: true,
        message: 'OK',
        data: {
          pendingCount: 2,
          preAssessmentCount: 0,
          retryCount: 0,
          deadlineMissedCount: 0,
          flaggedCount: 0,
          reviewedCount: 0,
          criteria: [],
          items: [first, second],
        },
      },
    } as never);

    renderWorkbenchRoutes('/mentor/course-reviews');

    const rail = await screen.findByLabelText('Hàng chờ bài nộp');
    const topToggle = screen.getByRole('button', { name: /Thu gọn danh sách/i });
    expect(topToggle).toHaveAttribute('aria-expanded', 'true');
    expect(rail).not.toHaveClass('is-collapsed-desktop');

    // Filter controls collapse / expand toggle
    const filterToggle = screen.getByRole('button', { name: 'Mở bộ lọc nhân viên' });
    expect(screen.queryByRole('tablist', { name: 'Lọc theo trạng thái bài nộp' })).not.toBeInTheDocument();
    fireEvent.click(filterToggle);
    expect(screen.getByRole('tablist', { name: 'Lọc theo trạng thái bài nộp' })).toBeInTheDocument();
    fireEvent.click(filterToggle);
    expect(screen.queryByRole('tablist', { name: 'Lọc theo trạng thái bài nộp' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Mở bộ lọc nhân viên' }));
    expect(screen.getByRole('tablist', { name: 'Lọc theo trạng thái bài nộp' })).toBeInTheDocument();

    // Collapse from inside rail header
    fireEvent.click(screen.getByRole('button', { name: 'Thu gọn thanh nhân viên' }));
    expect(rail).toHaveClass('is-collapsed-desktop');
    expect(screen.getByRole('button', { name: /Mở danh sách \(2\)/i })).toHaveAttribute('aria-expanded', 'false');

    // Quick-switch candidate from collapsed mini-rail preserves collapsed state across route transition
    const miniNav = screen.getByRole('list', { name: 'Chuyển nhanh nhân viên' });
    fireEvent.click(within(miniNav).getByRole('button', { name: 'Chọn Nhân viên B' }));

    await waitFor(() => {
      expect(screen.getByTestId('current-location').textContent).toBe('/mentor/course-reviews/sub-b');
    });
    expect(screen.getByLabelText('Hàng chờ bài nộp')).toHaveClass('is-collapsed-desktop');

    // Re-expand from mini-rail expand button
    fireEvent.click(screen.getByRole('button', { name: 'Mở rộng thanh nhân viên' }));
    expect(screen.getByLabelText('Hàng chờ bài nộp')).not.toHaveClass('is-collapsed-desktop');
    expect(screen.getByRole('button', { name: /Thu gọn danh sách/i })).toHaveAttribute('aria-expanded', 'true');
  });

  it('renders weighted 4-criterion Domain+Tier rubric, blocks PASSED on Gate fail, flags copied prompt, and syncs criteria modal', async () => {
    const weightedRubric = [
      {
        number: '01',
        title: 'Nguồn & bối cảnh công việc thực tế',
        description: 'Nêu rõ hệ thống, tệp hoặc tài liệu nguồn gắn với công việc.',
        weightPercent: 20,
        isRequired: false,
      },
      {
        number: '02',
        title: 'Quy trình thực hiện & kiểm chứng',
        description: 'Mô tả thao tác hoặc phép tính người khác kiểm tra lại được.',
        weightPercent: 20,
        isRequired: false,
      },
      {
        number: '03',
        title: 'Kết luận & bước tiếp theo',
        description: 'Nêu kết luận từ số liệu kiểm chứng và hành động bàn giao.',
        weightPercent: 20,
        isRequired: false,
      },
      {
        number: '04',
        title: 'Truy xuất nguồn chéo & chuẩn hóa dữ liệu nhiều nguồn',
        description: 'Đối chiếu ít nhất 2 nguồn dữ liệu và xử lý sai lệch.',
        weightPercent: 40,
        isRequired: true,
      },
    ];

    const copiedItem = makeItem({
      submissionId: 'sub-weighted',
      rubric: weightedRubric,
      assignment: {
        title: 'Phân tích thông tin và quản trị dữ liệu',
        promptHtml: null,
        criteria: weightedRubric.map((c) => c.title),
      },
      attempts: [
        {
          submissionId: 'sub-weighted',
          attemptNo: 1,
          evidenceText:
            'Mô tả một nhiệm vụ thực tế của vị trí Sales / CRM thuộc lĩnh vực khai thác dữ liệu và thông tin: nêu nguồn, hành động hoặc phép tính người khác kiểm tra lại được, kết luận và bước tiếp theo.',
          submittedAt: '2026-11-05T13:08:00.000Z',
          choice: { score: 8, total: 10, passMark: 7, passed: true },
        },
      ],
    });

    vi.spyOn(pulseReviewService, 'getQueue').mockResolvedValue({
      data: {
        success: true,
        message: 'OK',
        data: {
          pendingCount: 1,
          preAssessmentCount: 0,
          retryCount: 0,
          deadlineMissedCount: 0,
          flaggedCount: 0,
          reviewedCount: 0,
          criteria: [],
          items: [copiedItem],
        },
      },
    } as never);

    const decideSpy = vi.spyOn(pulseReviewService, 'decide').mockResolvedValue({
      data: {
        success: true,
        message: 'OK',
        data: {
          submissionId: 'sub-weighted',
          decision: 'PASSED',
          status: 'APPROVED',
          enrollmentStatus: 'COMPLETED',
        },
      },
    } as never);

    renderWorkbenchRoutes('/mentor/course-reviews');

    expect(await screen.findByText('Mốc đề xuất 70/100')).toBeInTheDocument();
    expect(screen.getByText('0/4 tiêu chí đã chấm')).toBeInTheDocument();
    expect(screen.getByText(/Cảnh báo sao chép đề bài:/)).toBeInTheDocument();
    expect(screen.getByText('Trọng số 40%')).toBeInTheDocument();
    expect(screen.getAllByText('Trọng số 20%')).toHaveLength(3);
    expect(screen.getByText('Bắt buộc')).toBeInTheDocument();

    // Open criteria modal -> synced to activeItem.rubric with weights & gate
    fireEvent.click(screen.getByRole('button', { name: /Xem tiêu chuẩn/i }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Tiêu chuẩn Đánh giá Tự luận')).toBeInTheDocument();
    expect(within(dialog).getByText('Tiêu chí 04')).toBeInTheDocument();
    expect(within(dialog).getByText('40%')).toBeInTheDocument();
    expect(within(dialog).getByText('Bắt buộc')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });

    // Failing Gate criterion 04 blocks Công nhận đạt and shows alert
    fireEvent.click(screen.getByRole('button', { name: 'Chấm 0% cho Truy xuất nguồn chéo & chuẩn hóa dữ liệu nhiều nguồn' }));
    expect(screen.getByRole('button', { name: 'Công nhận đạt' })).toBeDisabled();
    expect(
      screen.getByText('Tiêu chí bắt buộc dưới 70% nên chưa thể công nhận đạt.'),
    ).toBeInTheDocument();

    // Passing Gate + partial score 80% re-enables Công nhận đạt & submits weighted payload
    fireEvent.change(screen.getByRole('slider', { name: 'Điểm Mentor cho Nguồn & bối cảnh công việc thực tế' }), {
      target: { value: '100' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Chấm 100% cho Quy trình thực hiện & kiểm chứng' }));
    fireEvent.click(screen.getByRole('button', { name: 'Chấm 0% cho Kết luận & bước tiếp theo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Chấm 100% cho Truy xuất nguồn chéo & chuẩn hóa dữ liệu nhiều nguồn' }));

    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText('4/4 tiêu chí đã chấm')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Công nhận đạt' })).not.toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Công nhận đạt' }));
    expect(screen.getByRole('button', { name: 'Công nhận đạt' })).toHaveAttribute('aria-pressed', 'true');

    const reasonInput = screen.getByLabelText(/Nhận xét gửi nhân viên/i) as HTMLTextAreaElement;
    fireEvent.click(screen.getByRole('button', { name: 'Lưu quyết định' }));

    await waitFor(() => {
      expect(decideSpy).toHaveBeenCalledWith(
        'sub-weighted',
        'PASSED',
        reasonInput.value.trim(),
        [
          {
            number: '01',
            title: 'Nguồn & bối cảnh công việc thực tế',
            status: 'PASS',
            scorePercent: 100,
            note: null,
            weightPercent: 20,
            isRequired: false,
          },
          {
            number: '02',
            title: 'Quy trình thực hiện & kiểm chứng',
            status: 'PASS',
            scorePercent: 100,
            note: null,
            weightPercent: 20,
            isRequired: false,
          },
          {
            number: '03',
            title: 'Kết luận & bước tiếp theo',
            status: 'FAIL',
            scorePercent: 0,
            note: null,
            weightPercent: 20,
            isRequired: false,
          },
          {
            number: '04',
            title: 'Truy xuất nguồn chéo & chuẩn hóa dữ liệu nhiều nguồn',
            status: 'PASS',
            scorePercent: 100,
            note: null,
            weightPercent: 40,
            isRequired: true,
          },
        ],
      );
    });
  });
});
