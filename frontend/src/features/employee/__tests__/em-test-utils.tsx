import { vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ROLES } from '@/lib/roles';
import type { MyAssessmentCard, MyCompetencyLine, MyTaskDetail } from '@/services/me.service';

/** Tiện ích chung cho test giao diện các màn EM-01..EM-18 (hooks/use-me được giả lập bằng vi.spyOn). */

export const query = (data: unknown, overrides: Record<string, unknown> = {}) =>
  ({ data, isLoading: false, isError: false, error: null, refetch: vi.fn(), ...overrides }) as never;

export const loading = () => query(undefined, { isLoading: true });

export const failed = (refetch = vi.fn()) => query(undefined, { isError: true, refetch });

export const mutation = (mutateAsync = vi.fn().mockResolvedValue({}), mutate = vi.fn()) =>
  ({ mutateAsync, mutate, isPending: false }) as never;

/** Render một trang trong router; mọi điều hướng ra ngoài `path` hiện `data-testid="navigated"` kèm URL. */
export function renderPage(ui: ReactElement, { path = '/', at = '/' }: { path?: string; at?: string } = {}) {
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

export function signInAsEmployee(permissions = ['employee_competency_profile.read', 'skill_gap.read', 'evidence.read']) {
  useCurrentUser.setState({
    user: { id: 'usr-emp', email: 'employee@digitalent.ai', fullName: 'Nguyễn Văn Kế Toán', roles: [ROLES.EMPLOYEE], permissions },
    isAuthenticated: true,
  });
}

export const gapLine: MyCompetencyLine = {
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

export const assessmentCard: MyAssessmentCard = {
  id: 'asm-1',
  code: 'A4-I-FINAL',
  title: 'Bài đánh giá cuối khóa A4-I',
  assessmentType: 'FINAL',
  isFinal: true,
  courseId: 'crs-1',
  courseCode: 'A4-I',
  courseTitle: 'An toàn thông tin trong công việc',
  questionCount: 3,
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

export function taskDetail(overrides: Partial<MyTaskDetail> = {}): MyTaskDetail {
  return {
    assignmentId: 'asg-1',
    title: 'Lập bảng phân quyền thư mục kế toán',
    description: 'Rà soát và lập bảng phân quyền truy cập thư mục chứng từ.',
    expectedOutput: 'Bảng phân quyền (Excel)',
    status: 'ASSIGNED',
    isOverdue: false,
    canSubmit: true,
    assignedAt: '2026-09-20T00:00:00Z',
    dueAt: '2026-10-20T00:00:00Z',
    assignedByName: 'Trần Quản Lý',
    reviewerName: 'Trần Quản Lý',
    targetLevel: 2,
    targets: [{ competencyId: 'cmp-4-2', code: 'TT02-4.2', name: 'Bảo vệ dữ liệu cá nhân', targetLevel: 2 }],
    submissionCount: 0,
    latestSubmission: null,
    rubric: [],
    submissions: [],
    maxAttachmentBytes: 20 * 1024 * 1024,
    maxAttachments: 10,
    allowedExtensions: ['.pdf', '.xlsx', '.png'],
    ...overrides,
  };
}
