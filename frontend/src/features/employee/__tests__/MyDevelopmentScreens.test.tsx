import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import * as meHooks from '@/hooks/use-me';
import type { MyEvidenceItem, MyLearningPathStep } from '@/services/me.service';
import { MyDevelopmentDashboardPage } from '../pages/MyDevelopmentDashboardPage';
import { MyCompetencyProfilePage } from '../pages/MyCompetencyProfilePage';
import { MySkillGapPage } from '../pages/MySkillGapPage';
import { EvidencePortfolioPage } from '../pages/EvidencePortfolioPage';
import { MyLearningPathPage } from '../pages/MyLearningPathPage';
import { failed, gapLine, loading, mutation, query, renderPage, signInAsEmployee } from './em-test-utils';

/** EM-01..EM-05: trạng thái đang tải / lỗi / chưa có dữ liệu và các thao tác trên trang. */

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() } }));

beforeEach(() => {
  vi.restoreAllMocks();
  vi.mocked(toast.success).mockClear();
  signInAsEmployee();
});

describe('EM-01 Bảng phát triển của tôi', () => {
  it('shows a skeleton while the dashboard loads', () => {
    vi.spyOn(meHooks, 'useMyDashboard').mockReturnValue(loading());

    renderPage(<MyDevelopmentDashboardPage />);

    expect(screen.getByLabelText('Đang tải bảng phát triển')).toBeInTheDocument();
  });

  it('offers a retry that reloads the dashboard after an error', () => {
    const refetch = vi.fn();
    vi.spyOn(meHooks, 'useMyDashboard').mockReturnValue(failed(refetch));

    renderPage(<MyDevelopmentDashboardPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }));

    expect(screen.getByText('Không tải được bảng phát triển')).toBeInTheDocument();
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});

describe('EM-02 Hồ sơ năng lực của tôi', () => {
  it('explains when the profile cannot be compared with a position', () => {
    vi.spyOn(meHooks, 'useMyCompetencyProfile').mockReturnValue(query({
      employee: { id: 'emp-1', fullName: 'Nguyễn Văn Kế Toán', employeeCode: 'NV001' },
      skipReason: 'NO_JOB_POSITION',
      items: [],
      otherConfirmed: [],
    }));

    renderPage(<MyCompetencyProfilePage />);

    expect(screen.getByText('Chưa đối chiếu được với chuẩn vị trí')).toBeInTheDocument();
  });

  it('offers a retry after an error', () => {
    const refetch = vi.fn();
    vi.spyOn(meHooks, 'useMyCompetencyProfile').mockReturnValue(failed(refetch));

    renderPage(<MyCompetencyProfilePage />);
    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }));

    expect(screen.getByText('Không tải được hồ sơ năng lực')).toBeInTheDocument();
    expect(refetch).toHaveBeenCalled();
  });
});

describe('EM-03 Khoảng trống năng lực của tôi', () => {
  it('links each suggested course and says when no course teaches a competency', () => {
    vi.spyOn(meHooks, 'useMySkillGapDetail').mockReturnValue(query({
      jobPositionName: 'Kế toán viên',
      summary: { totalRequired: 2, totalMet: 0, totalGap: 2, highCount: 0, mediumCount: 2, lowCount: 0, coveragePercent: 50 },
      calculatedAt: '2026-10-06T00:00:00Z',
      items: [
        { ...gapLine, suggestedCourses: [{ courseId: 'crs-a4i', code: 'A4-I', title: 'An toàn thông tin trong công việc', targetLevel: 2 }] },
        { ...gapLine, competencyId: 'cmp-6-3', competencyCode: 'TT02-6.3', competencyName: 'Đánh giá công cụ AI', suggestedCourses: [] },
      ],
    }));

    renderPage(<MySkillGapPage />);

    expect(screen.getByRole('link', { name: /An toàn thông tin trong công việc/ })).toHaveAttribute('href', '/enterprise/me/courses/crs-a4i');
    expect(screen.getByText(/Chưa có khóa học nào dạy năng lực này lên mức cao hơn/)).toBeInTheDocument();
  });

  it('shows why no gap could be calculated', () => {
    vi.spyOn(meHooks, 'useMySkillGapDetail').mockReturnValue(query({ skipReason: 'NO_ACTIVE_REQUIREMENT_SET', calculatedAt: '2026-10-06T00:00:00Z', items: [] }));

    renderPage(<MySkillGapPage />);

    expect(screen.getByText('Chưa tính được khoảng trống năng lực')).toBeInTheDocument();
  });
});

describe('EM-04 Dòng thời gian minh chứng', () => {
  const item = (id: string, title: string, status: MyEvidenceItem['status']): MyEvidenceItem => ({
    id, kind: 'TASK_SUBMISSION', occurredAt: '2026-09-25T08:00:00Z', title, status, assignmentId: 'asg-1', versionNo: 1, links: [], files: [], competencies: [],
  });

  it('filters the timeline by review status', () => {
    vi.spyOn(meHooks, 'useMyEvidenceTimeline').mockReturnValue(query({
      items: [item('a', 'Bảng phân quyền v1', 'NEEDS_REVISION'), item('b', 'Quy trình lưu hóa đơn', 'APPROVED')],
      counts: { total: 2, approved: 1, pending: 0, needsRevision: 1, rejected: 0 },
    }));

    renderPage(<EvidencePortfolioPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Cần chỉnh sửa (1)' }));

    expect(screen.getByText('Bảng phân quyền v1')).toBeInTheDocument();
    expect(screen.queryByText('Quy trình lưu hóa đơn')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Không đạt (0)' }));
    expect(screen.getByText('Chưa có minh chứng trong mục này')).toBeInTheDocument();
  });
});

describe('EM-05 Lộ trình học tập của tôi', () => {
  const recommended = (overrides: Partial<MyLearningPathStep> = {}): MyLearningPathStep => ({
    order: 1, courseId: 'crs-a2i', courseCode: 'A2-I', courseTitle: 'Giao tiếp và cộng tác chuyên nghiệp', level: 2,
    estimatedDurationMinutes: 900, source: 'RECOMMENDED', status: 'RECOMMENDED', progressPercent: 0, isOverdue: false,
    rationale: 'Gợi ý để bù khoảng trống năng lực.', targetCompetencies: [], prerequisites: [], canEnroll: true, warnings: [], ...overrides,
  });
  const path = (steps: MyLearningPathStep[]) => query({
    openGapCount: 1,
    summary: { totalSteps: steps.length, completedSteps: 0, inProgressSteps: 0, recommendedSteps: steps.length, totalMinutes: 900, remainingMinutes: 900 },
    steps,
  });

  it('enrolls a recommended course and opens it', async () => {
    const enroll = vi.fn().mockResolvedValue({ enrollmentId: 'e-9', courseId: 'crs-a2i', status: 'NOT_STARTED' });
    vi.spyOn(meHooks, 'useEnrollInCourse').mockReturnValue(mutation(enroll));
    vi.spyOn(meHooks, 'useMyLearningPath').mockReturnValue(path([recommended()]));

    renderPage(<MyLearningPathPage />);
    fireEvent.click(screen.getByRole('button', { name: /Ghi danh & bắt đầu học/ }));

    await waitFor(() => expect(enroll).toHaveBeenCalledWith('crs-a2i'));
    expect(toast.success).toHaveBeenCalledWith('Đã ghi danh khóa A2-I.');
    expect(await screen.findByTestId('navigated')).toBeInTheDocument();
  });

  it('blocks enrolling while a prerequisite is missing', () => {
    vi.spyOn(meHooks, 'useEnrollInCourse').mockReturnValue(mutation());
    vi.spyOn(meHooks, 'useMyLearningPath').mockReturnValue(path([recommended({
      canEnroll: false,
      prerequisites: [{ courseId: 'crs-a2f', code: 'A2-F', title: 'Giao tiếp số cơ bản', completed: false }],
      warnings: ['Cần hoàn thành khóa tiên quyết trước: A2-F.'],
    })]));

    renderPage(<MyLearningPathPage />);

    expect(screen.getByRole('button', { name: /Ghi danh & bắt đầu học/ })).toBeDisabled();
    expect(screen.getByText(/A2-F/)).toBeInTheDocument();
  });
});
