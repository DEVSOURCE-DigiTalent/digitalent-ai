import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/use-current-user';
import * as meHooks from '@/hooks/use-me';
import { ROLES } from '@/lib/roles';
import { ManagerDevelopmentDashboardPage } from '../pages/ManagerDevelopmentDashboardPage';
import { ManagerLearningPathPage } from '../pages/ManagerLearningPathPage';
import { CourseDetailPage } from '@/features/learning/pages/CourseDetailPage';
import { LessonViewerPage } from '@/features/learning/pages/LessonViewerPage';
import { NotFoundPage } from '@/features/auth/pages/NotFoundPage';
import { MANAGER_SIDEBAR } from '@/lib/sidebars/manager';

vi.mock('@/features/employee/pages/MyLearningPathPage', () => ({
  MyLearningPathPage: () => <div data-testid="personal-learning-path" />,
}));
vi.mock('@/features/learning/pages/EmployeeCourseDetailPage', () => ({
  EmployeeCourseDetailPage: () => <div data-testid="personal-course" />,
}));
vi.mock('@/features/learning/pages/EmployeeLessonViewerPage', () => ({
  EmployeeLessonViewerPage: () => <div data-testid="personal-lesson" />,
}));
vi.mock('@/features/learning/pages/CatalogCourseDetailPage', () => ({
  CatalogCourseDetailPage: () => <div data-testid="catalog-course" />,
}));
vi.mock('@/features/learning/pages/CatalogLessonViewerPage', () => ({
  CatalogLessonViewerPage: () => <div data-testid="catalog-lesson" />,
}));

function signIn(role: string) {
  useCurrentUser.setState({
    user: { id: 'user-1', email: 'user@example.test', fullName: 'Người dùng', roles: [role], permissions: [], workspace: 'enterprise' },
    isAuthenticated: true,
  });
}

describe('manager personal screens', () => {
  beforeEach(() => signIn(ROLES.MANAGER));
  afterEach(() => { vi.restoreAllMocks(); });

  it('shows the employee dashboard layout with the manager’s BE competency state and shared learning path', () => {
    vi.spyOn(meHooks, 'useMyDashboard').mockReturnValue({
      data: {
        employee: { id: 'manager-employee', fullName: 'Người quản lý', employeeCode: 'MG01' },
        competency: { summary: { totalMet: 2, totalRequired: 4, totalGap: 2, coveragePercent: 50 }, topGaps: [] },
        courses: { inProgress: 0, notStarted: 0, completed: 0 },
        continueLearning: null,
        tasks: { toDo: 0, pendingReview: 0, overdue: 0 },
        activeTasks: [],
        assessments: { available: 0, retake: 0, inProgress: 0 },
        nextAssessment: null,
        validCertificates: 0,
        upcomingDeadlines: [],
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);
    render(<MemoryRouter><ManagerDevelopmentDashboardPage /><ManagerLearningPathPage /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Bảng phát triển của tôi' })).toBeInTheDocument();
    expect(screen.getByText(/2\/4 năng lực đạt \(50%\)/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Xem phân tích năng lực' }).getAttribute('href')).toBe('/enterprise/initial-assessment');
    expect(screen.queryByText(/bài test đầu vào/i)).not.toBeInTheDocument();
    expect(screen.getByTestId('personal-learning-path')).toBeInTheDocument();
  });

  it('uses self-scoped course and lesson pages for manager and employee, leaving owner previews intact', () => {
    const { rerender } = render(<MemoryRouter><CourseDetailPage /><LessonViewerPage /></MemoryRouter>);
    expect(screen.getByTestId('personal-course')).toBeInTheDocument();
    expect(screen.getByTestId('personal-lesson')).toBeInTheDocument();

    act(() => signIn(ROLES.EMPLOYEE));
    rerender(<MemoryRouter><CourseDetailPage /><LessonViewerPage /></MemoryRouter>);
    expect(screen.getByTestId('personal-course')).toBeInTheDocument();
    expect(screen.getByTestId('personal-lesson')).toBeInTheDocument();

    act(() => signIn(ROLES.OWNER));
    rerender(<MemoryRouter><CourseDetailPage /><LessonViewerPage /></MemoryRouter>);
    expect(screen.getByTestId('catalog-course')).toBeInTheDocument();
    expect(screen.getByTestId('catalog-lesson')).toBeInTheDocument();
  });

  it('exposes the same personal destinations in the manager navigation', () => {
    const personal = MANAGER_SIDEBAR.find((section) => section.label === 'Cá nhân');
    expect(personal?.items?.map((item) => item.screenId)).toEqual([
      'EM-01', 'EM-02', 'EM-03', 'EM-04', 'EM-05', 'EM-06', 'EM-09', 'EM-14', 'EM-18',
    ]);
  });

  it('returns the signed-in manager to the team home from 404', () => {
    render(<MemoryRouter><NotFoundPage /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Về trang chủ' }).getAttribute('href')).toBe('/enterprise/team');
  });
});
