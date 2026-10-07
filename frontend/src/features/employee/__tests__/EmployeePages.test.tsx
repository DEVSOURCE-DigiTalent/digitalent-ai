import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import * as meHooks from '@/hooks/use-me';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ROLES } from '@/lib/roles';
import type {
  MyAchievements, MyAssessmentCard, MyAttemptResult, MyAttemptSession, MyCompetencyLine, MyCourseDetail, MyLesson,
  MyTaskDetail,
} from '@/services/me.service';

import { MyDevelopmentDashboardPage } from '../pages/MyDevelopmentDashboardPage';
import { MyCompetencyProfilePage } from '../pages/MyCompetencyProfilePage';
import { MySkillGapPage } from '../pages/MySkillGapPage';
import { EvidencePortfolioPage } from '../pages/EvidencePortfolioPage';
import { MyLearningPathPage } from '../pages/MyLearningPathPage';
import { MyLearningPage } from '../pages/MyLearningPage';
import { MyPracticalTasksPage } from '../pages/MyPracticalTasksPage';
import { EmployeeTaskDetailPage } from '../pages/EmployeeTaskDetailPage';
import { SubmitEvidencePage } from '../pages/SubmitEvidencePage';
import { TaskFeedbackPage } from '../pages/TaskFeedbackPage';
import { MyCertificatesPage } from '../pages/MyCertificatesPage';
import { CourseDetailPage } from '@/features/learning/pages/CourseDetailPage';
import { LessonViewerPage } from '@/features/learning/pages/LessonViewerPage';
import { MyAssessmentsPage } from '@/features/learning/pages/MyAssessmentsPage';
import { AssessmentIntroPage } from '@/features/learning/pages/AssessmentIntroPage';
import { AssessmentAttemptPage } from '@/features/learning/pages/AssessmentAttemptPage';
import { AssessmentResultPage } from '@/features/learning/pages/AssessmentResultPage';
import { AssessmentHistoryPage } from '@/features/learning/pages/AssessmentHistoryPage';

/** EM-01..EM-18 — trang cá nhân đọc dữ liệu thật từ /api/v1/me/* qua hooks/use-me. */

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() },
}));

const query = (data: unknown, overrides: Record<string, unknown> = {}) =>
  ({ data, isLoading: false, isError: false, error: null, refetch: vi.fn(), ...overrides }) as never;

const mutation = (mutateAsync = vi.fn().mockResolvedValue({}), mutate = vi.fn()) =>
  ({ mutateAsync, mutate, isPending: false }) as never;

function renderPage(ui: ReactElement, { path = '/', at = '/' }: { path?: string; at?: string } = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[at]}>
        <Routes>
          <Route path={path} element={ui} />
          <Route path="*" element={<div data-testid="navigated" />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const employee = {
  id: 'emp-1',
  fullName: 'Nguyễn Văn Kế Toán',
  employeeCode: 'NV001',
  departmentName: 'Kế toán',
  jobPositionName: 'Kế toán viên',
};

const gapLine: MyCompetencyLine = {
  competencyId: 'cmp-4-2',
  competencyCode: 'TT02-4.2',
  competencyName: 'Bảo vệ dữ liệu cá nhân',
  categoryName: 'An toàn số',
  requiredLevel: 2,
  currentLevel: 1,
  confirmedAt: '2026-09-01T00:00:00Z',
  gapSteps: 1,
  severity: 'MEDIUM',
  mandatory: true,
  weightPercent: 10,
  requiresPracticalEvidence: true,
  priorityScore: 15,
  status: 'GAP',
};

const summary = { totalRequired: 1, totalMet: 0, totalGap: 1, highCount: 0, mediumCount: 1, lowCount: 0, coveragePercent: 50 };

const assessmentCard: MyAssessmentCard = {
  id: 'asm-1',
  code: 'A4-I-FINAL',
  title: 'Bài đánh giá cuối khóa A4-I',
  assessmentType: 'FINAL',
  isFinal: true,
  courseId: 'crs-1',
  courseCode: 'A4-I',
  courseTitle: 'An toàn thông tin trong công việc',
  questionCount: 2,
  timeLimitMinutes: 15,
  passingScore: 70,
  maxAttempts: 3,
  attemptsUsed: 0,
  attemptsRemaining: 3,
  passed: false,
  status: 'AVAILABLE',
  inProgressExpired: false,
  canStart: true,
};

const task: MyTaskDetail = {
  assignmentId: 'asg-1',
  title: 'Lập bảng phân quyền thư mục kế toán',
  description: 'Rà soát và lập bảng phân quyền truy cập thư mục chứng từ.',
  expectedOutput: 'Bảng phân quyền (Excel) + ảnh chụp cấu hình chia sẻ',
  status: 'NEEDS_REVISION',
  isOverdue: false,
  canSubmit: true,
  assignedAt: '2026-09-20T00:00:00Z',
  dueAt: '2026-10-20T00:00:00Z',
  assignedByName: 'Trần Quản Lý',
  reviewerName: 'Trần Quản Lý',
  targetLevel: 2,
  targets: [{ competencyId: 'cmp-4-2', code: 'TT02-4.2', name: 'Bảo vệ dữ liệu cá nhân', targetLevel: 2 }],
  submissionCount: 1,
  rubric: [{ id: 'r1', label: 'Đúng nguyên tắc tối thiểu quyền', maxPoints: 50 }],
  maxAttachmentBytes: 20 * 1024 * 1024,
  maxAttachments: 10,
  allowedExtensions: ['.pdf', '.xlsx'],
  submissions: [
    {
      id: 'sub-1',
      versionNo: 1,
      status: 'NEEDS_REVISION',
      submittedAt: '2026-09-25T08:00:00Z',
      note: 'Bản phân quyền lần đầu cho thư mục chứng từ.',
      links: ['https://drive.example.com/v1'],
      files: [],
      evaluation: {
        id: 'ev-1',
        verdict: 'NEEDS_REVISION',
        score: 55,
        feedback: 'Cần tách quyền xem và quyền sửa cho nhóm thủ quỹ.',
        reviewerName: 'Trần Quản Lý',
        evaluatedAt: '2026-09-27T08:00:00Z',
        countsAsEvidence: false,
        competencyResults: [{
          competencyId: 'cmp-4-2',
          competencyCode: 'TT02-4.2',
          competencyName: 'Bảo vệ dữ liệu cá nhân',
          targetLevel: 2,
          verdict: 'NEEDS_REVISION',
          score: 55,
          levelConfirming: false,
        }],
      },
    },
  ],
};
task.latestSubmission = task.submissions[0];

beforeEach(() => {
  vi.restoreAllMocks();
  useCurrentUser.setState({
    user: {
      id: 'usr-emp',
      email: 'employee@digitalent.ai',
      fullName: 'Nguyễn Văn Kế Toán',
      roles: [ROLES.EMPLOYEE],
      permissions: ['employee_competency_profile.read', 'skill_gap.read', 'evidence.read'],
    },
    isAuthenticated: true,
  });
});

describe('EM-01..EM-05: phát triển cá nhân', () => {
  it('EM-01 shows competency coverage, top gaps and the course to continue', () => {
    vi.spyOn(meHooks, 'useMyDashboard').mockReturnValue(query({
      employee,
      competency: { summary, averageCurrentLevel: 1, averageRequiredLevel: 2, topGaps: [gapLine] },
      courses: { total: 1, notStarted: 0, inProgress: 1, readyForAssessment: 0, completed: 0, overdue: 0 },
      continueLearning: {
        courseId: 'crs-1', courseCode: 'A4-I', courseTitle: 'An toàn thông tin trong công việc', status: 'IN_PROGRESS',
        progressPercent: 25, completedLessons: 1, totalLessons: 4, nextLessonId: 'les-2', nextLessonTitle: 'Bài 2', isOverdue: false,
      },
      tasks: { total: 1, toDo: 1, pendingReview: 0, needsRevision: 1, passed: 0, failed: 0, overdue: 0 },
      activeTasks: [task],
      assessments: { total: 1, available: 1, inProgress: 0, passed: 0, retake: 0, locked: 0 },
      nextAssessment: assessmentCard,
      validCertificates: 1,
      upcomingDeadlines: [],
    }));

    renderPage(<MyDevelopmentDashboardPage />);

    expect(screen.getByRole('heading', { name: 'Bảng phát triển của tôi' })).toBeInTheDocument();
    expect(screen.getAllByText(/Bảo vệ dữ liệu cá nhân/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/An toàn thông tin trong công việc/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Lập bảng phân quyền thư mục kế toán/).length).toBeGreaterThan(0);
  });

  it('EM-01 keeps its heading and offers a retry when loading fails', () => {
    const refetch = vi.fn();
    vi.spyOn(meHooks, 'useMyDashboard').mockReturnValue(query(undefined, { isError: true, refetch }));

    renderPage(<MyDevelopmentDashboardPage />);

    expect(screen.getByText('Không tải được bảng phát triển')).toBeInTheDocument();
  });

  it('EM-02 lists required competencies with their confirmed level', () => {
    const spy = vi.spyOn(meHooks, 'useMyCompetencyProfile').mockReturnValue(query({
      employee,
      requirementSet: { id: 'rs-1', versionNo: 1 },
      summary,
      items: [{ ...gapLine, confirmedEvidenceCount: 1, pendingEvidenceCount: 0 }],
      otherConfirmed: [],
    }));

    renderPage(<MyCompetencyProfilePage />);

    expect(screen.getByText('Hồ sơ năng lực của tôi')).toBeInTheDocument();
    expect(screen.getAllByText(/Bảo vệ dữ liệu cá nhân/).length).toBeGreaterThan(0);
    expect(spy).toHaveBeenCalledWith(true);
  });

  it('EM-02 does not call the API for a role without the profile permission', () => {
    useCurrentUser.setState({
      user: { id: 'u', email: 'u@x.vn', fullName: 'U', roles: [ROLES.EMPLOYEE], permissions: [] },
      isAuthenticated: true,
    });
    const spy = vi.spyOn(meHooks, 'useMyCompetencyProfile').mockReturnValue(query(undefined));

    renderPage(<MyCompetencyProfilePage />);

    expect(screen.getByText('Vai trò của bạn chưa xem được hồ sơ năng lực')).toBeInTheDocument();
    expect(spy).toHaveBeenCalledWith(false);
  });

  it('EM-03 suggests courses for each gap and explains a missing position', () => {
    const spy = vi.spyOn(meHooks, 'useMySkillGapDetail').mockReturnValue(query({
      jobPositionName: 'Kế toán viên',
      requirementSetVersionNo: 1,
      summary,
      calculatedAt: '2026-10-06T00:00:00Z',
      items: [{
        ...gapLine,
        suggestedCourses: [{ courseId: 'crs-1', code: 'A4-I', title: 'An toàn thông tin trong công việc', targetLevel: 2, enrollmentStatus: 'IN_PROGRESS' }],
      }],
    }));

    const { unmount } = renderPage(<MySkillGapPage />);
    expect(screen.getAllByText(/Bảo vệ dữ liệu cá nhân/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/An toàn thông tin trong công việc/).length).toBeGreaterThan(0);
    unmount();

    spy.mockReturnValue(query({ skipReason: 'NO_JOB_POSITION', calculatedAt: '2026-10-06T00:00:00Z', items: [] }));
    renderPage(<MySkillGapPage />);
    expect(screen.getByText('Chưa tính được khoảng trống năng lực')).toBeInTheDocument();
  });

  it('EM-04 shows own submissions and confirmed evidence on one timeline', () => {
    vi.spyOn(meHooks, 'useMyEvidenceTimeline').mockReturnValue(query({
      items: [
        {
          id: 'sub-1', kind: 'TASK_SUBMISSION', occurredAt: '2026-09-25T08:00:00Z', title: task.title, status: 'NEEDS_REVISION',
          description: 'Bản phân quyền lần đầu', assignmentId: 'asg-1', versionNo: 1, links: [], files: [],
          evaluation: task.submissions[0].evaluation, competencies: task.targets,
        },
        {
          id: 'ev-1', kind: 'COMPETENCY_EVIDENCE', occurredAt: '2026-09-01T00:00:00Z', title: 'Xác nhận TT02-1.1 ở mức 1', status: 'APPROVED',
          links: [], files: [], sourceType: 'MIGRATION', confirmedLevel: 1, competencies: [],
        },
      ],
      counts: { total: 2, approved: 1, pending: 0, needsRevision: 1, rejected: 0 },
    }));

    renderPage(<EvidencePortfolioPage />);

    expect(screen.getByRole('heading', { name: 'Dòng thời gian minh chứng' })).toBeInTheDocument();
    expect(screen.getAllByText(task.title).length).toBeGreaterThan(0);
    expect(screen.getByText('Xác nhận TT02-1.1 ở mức 1')).toBeInTheDocument();
  });

  it('EM-05 lets the employee enroll in a recommended course of the path', async () => {
    const enroll = vi.fn().mockResolvedValue({ enrollmentId: 'e-2', courseId: 'crs-2', status: 'NOT_STARTED' });
    vi.spyOn(meHooks, 'useEnrollInCourse').mockReturnValue(mutation(enroll));
    vi.spyOn(meHooks, 'useMyLearningPath').mockReturnValue(query({
      jobPositionName: 'Kế toán viên',
      openGapCount: 1,
      coveragePercent: 50,
      summary: { totalSteps: 1, completedSteps: 0, inProgressSteps: 0, recommendedSteps: 1, totalMinutes: 240, remainingMinutes: 240 },
      steps: [{
        order: 1, courseId: 'crs-2', courseCode: 'A1-I', courseTitle: 'Chiến lược tìm kiếm và quản lý thông tin', level: 2,
        estimatedDurationMinutes: 240, source: 'RECOMMENDED', status: 'RECOMMENDED', progressPercent: 0, isOverdue: false,
        rationale: 'Gợi ý để bù khoảng trống năng lực.', targetCompetencies: [], prerequisites: [], canEnroll: true, warnings: [],
      }],
    }));

    renderPage(<MyLearningPathPage />);

    expect(screen.getByText('Chiến lược tìm kiếm và quản lý thông tin')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Ghi danh & bắt đầu học/ }));
    await waitFor(() => expect(enroll).toHaveBeenCalledWith('crs-2'));
  });
});

describe('EM-06..EM-08: khóa học & bài học', () => {
  it('EM-06 lists the courses the employee is enrolled in', () => {
    vi.spyOn(meHooks, 'useMyCourses').mockReturnValue(query({
      items: [{
        enrollmentId: 'e-1', courseId: 'crs-1', courseCode: 'A4-I', courseTitle: 'An toàn thông tin trong công việc', level: 2,
        status: 'IN_PROGRESS', progressPercent: 25, totalLessons: 4, completedLessons: 1, isOverdue: false, source: 'ASSIGNED',
        assignedByName: 'Trần Quản Lý',
      }],
      summary: { total: 1, notStarted: 0, inProgress: 1, readyForAssessment: 0, completed: 0, overdue: 0 },
    }));

    renderPage(<MyLearningPage />);

    expect(screen.getByRole('heading', { name: 'Khóa học của tôi' })).toBeInTheDocument();
    expect(screen.getByText('An toàn thông tin trong công việc')).toBeInTheDocument();
  });

  const course: MyCourseDetail = {
    id: 'crs-2',
    code: 'A1-I',
    title: 'Chiến lược tìm kiếm và quản lý thông tin',
    level: 2,
    certificateEnabled: true,
    competencies: [],
    outcomes: [],
    prerequisites: [],
    enrollment: null,
    modules: [{
      id: 'm1', title: 'Học phần 1: Tìm kiếm nâng cao', isRequired: true,
      lessons: [{
        id: 'l1', title: 'Bài 1: Toán tử tìm kiếm', lessonType: 'TEXT', isRequired: true, completionRule: 'MANUAL_COMPLETE',
        selfCompletable: true, progressStatus: 'NOT_STARTED',
      }],
    }],
    totalLessons: 1,
    completedLessons: 0,
    assessments: [],
    canEnroll: true,
  };

  it('EM-07 shows the syllabus and enrolls a course that is open to the employee', async () => {
    const enroll = vi.fn().mockResolvedValue({ enrollmentId: 'e-2', courseId: 'crs-2', status: 'NOT_STARTED' });
    vi.spyOn(meHooks, 'useEnrollInCourse').mockReturnValue(mutation(enroll));
    vi.spyOn(meHooks, 'useMyCourse').mockReturnValue(query(course));

    renderPage(<CourseDetailPage />, { path: '/enterprise/me/courses/:id', at: '/enterprise/me/courses/crs-2' });

    expect(screen.getByRole('heading', { name: course.title })).toBeInTheDocument();
    expect(screen.getByText('Bài 1: Toán tử tìm kiếm')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Ghi danh khóa học/ }));
    await waitFor(() => expect(enroll).toHaveBeenCalledWith('crs-2'));
  });

  it('EM-07 explains why a course cannot be enrolled', () => {
    vi.spyOn(meHooks, 'useEnrollInCourse').mockReturnValue(mutation());
    vi.spyOn(meHooks, 'useMyCourse').mockReturnValue(query({
      ...course, canEnroll: false, enrollBlockedReason: 'Cần hoàn thành khóa tiên quyết trước: A1-F.',
    }));

    renderPage(<CourseDetailPage />, { path: '/enterprise/me/courses/:id', at: '/enterprise/me/courses/crs-2' });

    expect(screen.getByText(/Cần hoàn thành khóa tiên quyết trước: A1-F\./)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Ghi danh khóa học/ })).not.toBeInTheDocument();
  });

  it('EM-08 records the lesson as opened and completes it', async () => {
    const start = vi.fn();
    const complete = vi.fn().mockResolvedValue({
      lessonId: 'l1', lessonStatus: 'COMPLETED', courseProgressPercent: 50, enrollmentStatus: 'IN_PROGRESS', nextLessonId: 'l2', readyForAssessment: false,
    });
    vi.spyOn(meHooks, 'useStartLesson').mockReturnValue(mutation(undefined, start));
    vi.spyOn(meHooks, 'useCompleteMyLesson').mockReturnValue(mutation(complete));
    const lesson: MyLesson = {
      courseId: 'crs-2', courseCode: 'A1-I', courseTitle: course.title, moduleId: 'm1', moduleTitle: 'Học phần 1',
      id: 'l1', title: 'Bài 1: Toán tử tìm kiếm', lessonType: 'TEXT', contentBody: '## Mục tiêu\nDùng toán tử AND, OR, NOT.',
      isRequired: true, completionRule: 'MANUAL_COMPLETE', selfCompletable: true, materials: [], progressStatus: 'NOT_STARTED',
      lessonIndex: 1, totalLessons: 2, nextLessonId: 'l2', enrollmentStatus: 'NOT_STARTED', courseProgressPercent: 0,
    };
    vi.spyOn(meHooks, 'useMyLesson').mockReturnValue(query(lesson));

    renderPage(<LessonViewerPage />, { path: '/enterprise/me/courses/:id/lessons/:lessonId', at: '/enterprise/me/courses/crs-2/lessons/l1' });

    expect(screen.getByRole('heading', { name: lesson.title })).toBeInTheDocument();
    expect(screen.getByText(/Dùng toán tử AND, OR, NOT\./)).toBeInTheDocument();
    await waitFor(() => expect(start).toHaveBeenCalledWith({ courseId: 'crs-2', lessonId: 'l1' }));

    fireEvent.click(screen.getByRole('button', { name: /Hoàn thành & sang bài tiếp theo/ }));
    await waitFor(() => expect(complete).toHaveBeenCalledWith({ courseId: 'crs-2', lessonId: 'l1' }));
  });
});

describe('EM-09..EM-13: bài đánh giá', () => {
  it('EM-09 lists assessments with the reason a final is still locked', () => {
    vi.spyOn(meHooks, 'useMyAssessments').mockReturnValue(query({
      items: [{ ...assessmentCard, status: 'LOCKED', canStart: false, lockedReason: 'Hoàn thành các bài học bắt buộc của khóa để mở bài đánh giá cuối khóa.' }],
      summary: { total: 1, available: 0, inProgress: 0, passed: 0, retake: 0, locked: 1 },
    }));

    renderPage(<MyAssessmentsPage />);

    expect(screen.getByText('Danh sách bài đánh giá năng lực')).toBeInTheDocument();
    expect(screen.getByText(assessmentCard.title)).toBeInTheDocument();
    expect(screen.getByText(/Hoàn thành các bài học bắt buộc/)).toBeInTheDocument();
  });

  it('EM-10 starts an attempt and opens the attempt page', async () => {
    const start = vi.fn().mockResolvedValue({ attemptId: 'att-1' });
    vi.spyOn(meHooks, 'useStartAttempt').mockReturnValue(mutation(start));
    vi.spyOn(meHooks, 'useMyAssessment').mockReturnValue(query({ ...assessmentCard, totalPoints: 2, competencies: [], attempts: [] }));

    renderPage(<AssessmentIntroPage />, { path: '/enterprise/me/assessments/:id', at: '/enterprise/me/assessments/asm-1' });

    expect(screen.getByRole('heading', { name: assessmentCard.title })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Bắt đầu làm bài/ }));
    await waitFor(() => expect(start).toHaveBeenCalledWith('asm-1'));
    expect(await screen.findByTestId('navigated')).toBeInTheDocument();
  });

  it('EM-11 resumes saved answers and submits the chosen options', async () => {
    const session: MyAttemptSession = {
      attemptId: 'att-1', assessmentId: 'asm-1', assessmentTitle: assessmentCard.title, assessmentType: 'FINAL', isFinal: true,
      courseId: 'crs-1', courseCode: 'A4-I', courseTitle: assessmentCard.courseTitle, attemptNo: 1, status: 'STARTED',
      startedAt: new Date().toISOString(), deadline: new Date(Date.now() + 15 * 60_000).toISOString(), serverNow: new Date().toISOString(),
      timeLimitMinutes: 15, passingScore: 70,
      questions: [
        { id: 'q1', text: 'Câu hỏi về mật khẩu mạnh?', questionType: 'MULTIPLE_CHOICE', points: 1, options: [{ id: 'q1-a', content: 'Dùng 123456' }, { id: 'q1-b', content: 'Dùng cụm từ dài + 2FA' }] },
        { id: 'q2', text: 'Câu hỏi về email lừa đảo?', questionType: 'MULTIPLE_CHOICE', points: 1, options: [{ id: 'q2-a', content: 'Báo IT' }, { id: 'q2-b', content: 'Bấm link' }] },
      ],
      answers: { q2: 'q2-a' },
    };
    const submit = vi.fn().mockResolvedValue({ attemptId: 'att-1', passed: true });
    vi.spyOn(meHooks, 'useStartAttempt').mockReturnValue(mutation());
    vi.spyOn(meHooks, 'useAttemptSession').mockReturnValue(query(session));
    vi.spyOn(meHooks, 'useSaveAttemptAnswers').mockReturnValue(mutation());
    vi.spyOn(meHooks, 'useSubmitAttempt').mockReturnValue(mutation(submit));

    renderPage(<AssessmentAttemptPage />, { path: '/enterprise/me/assessments/:id/attempt', at: '/enterprise/me/assessments/asm-1/attempt?attempt=att-1' });

    expect(screen.getByText('Câu hỏi về mật khẩu mạnh?')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: /Dùng cụm từ dài \+ 2FA/ }));
    fireEvent.click(screen.getByRole('button', { name: /^Nộp bài$/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'Xác nhận nộp bài' }));

    await waitFor(() => expect(submit).toHaveBeenCalledWith({ attemptId: 'att-1', answers: { q1: 'q1-b', q2: 'q2-a' } }));
  });

  it('EM-12 shows a passed final with the issued certificate', () => {
    const result: MyAttemptResult = {
      attemptId: 'att-1', assessmentId: 'asm-1', assessmentTitle: assessmentCard.title, assessmentType: 'FINAL', isFinal: true,
      courseId: 'crs-1', courseCode: 'A4-I', courseTitle: assessmentCard.courseTitle, attemptNo: 1,
      startedAt: '2026-10-01T08:00:00Z', submittedAt: '2026-10-01T08:10:00Z', durationSeconds: 600, autoSubmitted: false,
      score: 100, passingScore: 70, passed: true, earnedPoints: 2, totalPoints: 2, correctCount: 2, totalQuestions: 2,
      attemptsRemaining: 2, canRetake: false, revealAnswers: true, courseCompleted: true,
      certificate: { id: 'c-1', code: 'DT-2026-ABCD1234', issuedAt: '2026-10-01T08:10:00Z', status: 'VALID' },
      questions: [],
    };
    vi.spyOn(meHooks, 'useMyAssessment').mockReturnValue(query(undefined));
    vi.spyOn(meHooks, 'useAttemptResult').mockReturnValue(query(result));

    renderPage(<AssessmentResultPage />, { path: '/enterprise/me/assessments/:id/result', at: '/enterprise/me/assessments/asm-1/result?attempt=att-1' });

    expect(screen.getByText('Chúc mừng bạn đã đạt bài đánh giá!')).toBeInTheDocument();
    expect(screen.getByText(/DT-2026-ABCD1234/)).toBeInTheDocument();
  });

  it('EM-13 lists the employee attempts with their score', () => {
    vi.spyOn(meHooks, 'useAttemptHistory').mockReturnValue(query({
      items: [{
        attemptId: 'att-1', assessmentId: 'asm-1', assessmentTitle: assessmentCard.title, assessmentType: 'FINAL', isFinal: true,
        courseId: 'crs-1', courseCode: 'A4-I', courseTitle: assessmentCard.courseTitle, attemptNo: 1, status: 'SCORED',
        startedAt: '2026-10-01T08:00:00Z', submittedAt: '2026-10-01T08:10:00Z', durationSeconds: 600, score: 85, passingScore: 70,
        passed: true, correctCount: 2, totalQuestions: 2,
      }],
      pageIndex: 1, pageSize: 10, totalItems: 1, totalPages: 1,
    }));

    renderPage(<AssessmentHistoryPage />);

    expect(screen.getByText('Lịch sử bài đánh giá')).toBeInTheDocument();
    expect(screen.getAllByText(assessmentCard.title).length).toBeGreaterThan(0);
    expect(screen.getAllByText('85%').length).toBeGreaterThan(0);
  });
});

describe('EM-14..EM-18: nhiệm vụ & thành tựu', () => {
  it('EM-14 lists assigned tasks with a resubmit action', () => {
    vi.spyOn(meHooks, 'useMyTasks').mockReturnValue(query({
      items: [task],
      summary: { total: 1, toDo: 1, pendingReview: 0, needsRevision: 1, passed: 0, failed: 0, overdue: 0 },
    }));

    renderPage(<MyPracticalTasksPage />);

    expect(screen.getByText('Nhiệm vụ thực tế của tôi')).toBeInTheDocument();
    expect(screen.getByText(task.title)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Nộp lại bài/ })).toHaveAttribute('href', '/enterprise/me/tasks/asg-1/submit');
  });

  it('EM-15 shows only the employee own submissions and their review', () => {
    vi.spyOn(meHooks, 'useMyTask').mockReturnValue(query(task));

    renderPage(<EmployeeTaskDetailPage />, { path: '/enterprise/me/tasks/:id', at: '/enterprise/me/tasks/asg-1' });

    expect(screen.getByRole('heading', { name: task.title })).toBeInTheDocument();
    expect(screen.getByText('Bản phân quyền lần đầu cho thư mục chứng từ.')).toBeInTheDocument();
    expect(screen.getByText('Cần tách quyền xem và quyền sửa cho nhóm thủ quỹ.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Xem phản hồi/ })).toHaveAttribute('href', '/enterprise/me/tasks/asg-1/feedback');
  });

  it('EM-16 validates and submits content, links and attachments', async () => {
    const submit = vi.fn().mockResolvedValue({ assignmentId: 'asg-1', submissionId: 'sub-2', versionNo: 2, submittedAt: '', assignmentStatus: 'SUBMITTED' });
    vi.spyOn(meHooks, 'useMyTask').mockReturnValue(query(task));
    vi.spyOn(meHooks, 'useSubmitMyTask').mockReturnValue(mutation(submit));
    vi.spyOn(meHooks, 'useUploadTaskAttachment').mockReturnValue(mutation());

    renderPage(<SubmitEvidencePage />, { path: '/enterprise/me/tasks/:id/submit', at: '/enterprise/me/tasks/asg-1/submit' });

    expect(screen.getByText(`Nộp lại minh chứng: ${task.title}`)).toBeInTheDocument();
    expect(screen.getByText(/Cần tách quyền xem và quyền sửa/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Mô tả giải pháp/), { target: { value: 'Ngắn' } });
    fireEvent.click(screen.getByRole('button', { name: /Gửi nộp minh chứng/ }));
    expect(await screen.findByText('Mô tả cần tối thiểu 20 ký tự.')).toBeInTheDocument();
    expect(submit).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText(/Mô tả giải pháp/), { target: { value: 'Đã tách quyền xem và quyền sửa cho nhóm thủ quỹ theo góp ý.' } });
    fireEvent.change(screen.getByLabelText('Đường dẫn 1'), { target: { value: 'https://drive.example.com/v2' } });
    fireEvent.click(screen.getByRole('button', { name: /Gửi nộp minh chứng/ }));

    await waitFor(() => expect(submit).toHaveBeenCalledWith({
      assignmentId: 'asg-1',
      payload: {
        content: 'Đã tách quyền xem và quyền sửa cho nhóm thủ quỹ theo góp ý.',
        linkUrls: ['https://drive.example.com/v2'],
        attachmentIds: [],
      },
    }));
  });

  it('EM-16 refuses a task that is waiting for review', () => {
    vi.spyOn(meHooks, 'useMyTask').mockReturnValue(query({ ...task, status: 'SUBMITTED', canSubmit: false }));
    vi.spyOn(meHooks, 'useSubmitMyTask').mockReturnValue(mutation());
    vi.spyOn(meHooks, 'useUploadTaskAttachment').mockReturnValue(mutation());

    renderPage(<SubmitEvidencePage />, { path: '/enterprise/me/tasks/:id/submit', at: '/enterprise/me/tasks/asg-1/submit' });

    expect(screen.getByText('Nhiệm vụ hiện không nhận bài nộp')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Gửi nộp minh chứng/ })).not.toBeInTheDocument();
  });

  it('EM-17 shows the latest verdict, score and per-competency result', () => {
    vi.spyOn(meHooks, 'useMyTask').mockReturnValue(query(task));

    renderPage(<TaskFeedbackPage />, { path: '/enterprise/me/tasks/:id/feedback', at: '/enterprise/me/tasks/asg-1/feedback' });

    expect(screen.getByText(`Kết quả & Phản hồi: ${task.title}`)).toBeInTheDocument();
    expect(screen.getByText('Yêu cầu bổ sung / chỉnh sửa minh chứng')).toBeInTheDocument();
    expect(screen.getByText('55')).toBeInTheDocument();
    expect(screen.getByText('Cần tách quyền xem và quyền sửa cho nhóm thủ quỹ.')).toBeInTheDocument();
    expect(screen.getByText('Kết quả theo từng năng lực')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Nộp lại bài chỉnh sửa/ })).toHaveAttribute('href', '/enterprise/me/tasks/asg-1/submit');
  });

  it('EM-18 shows certificates, confirmed competencies and copies a certificate code', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const achievements: MyAchievements = {
      stats: { validCertificates: 1, completedCourses: 1, passedAssessments: 1, approvedTasks: 0, confirmedCompetencies: 1 },
      certificates: [{
        id: 'c-1', certificateCode: 'DT-2026-DEMOA2F1', holderName: 'Nguyễn Văn Kế Toán', courseId: 'crs-a2f',
        courseTitle: 'Giao tiếp số cơ bản nơi công sở', issuedAt: '2026-09-15T00:00:00Z', status: 'VALID', score: 75,
      }],
      confirmedCompetencies: [{ competencyId: 'cmp-1-1', competencyCode: 'TT02-1.1', competencyName: 'Duyệt, tìm kiếm và lọc dữ liệu', level: 1, confirmedAt: '2026-09-01T00:00:00Z' }],
      milestones: [{ kind: 'CERTIFICATE_ISSUED', title: 'Nhận chứng chỉ DT-2026-DEMOA2F1', occurredAt: '2026-09-15T00:00:00Z' }],
    };
    vi.spyOn(meHooks, 'useMyAchievements').mockReturnValue(query(achievements));

    renderPage(<MyCertificatesPage />);

    expect(screen.getByText('Chứng nhận & thành tựu của tôi')).toBeInTheDocument();
    expect(screen.getByText('DT-2026-DEMOA2F1')).toBeInTheDocument();
    expect(screen.getByText('Giao tiếp số cơ bản nơi công sở')).toBeInTheDocument();
    expect(screen.getByText(/Duyệt, tìm kiếm và lọc dữ liệu/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Sao chép mã/ }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('DT-2026-DEMOA2F1'));
  });
});
