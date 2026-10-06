import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/use-current-user';
import * as learningHooks from '@/hooks/use-my-learning';
import * as gapHooks from '@/hooks/use-skill-gaps';
import * as recommendationHooks from '@/hooks/use-recommendations';
import { ManagerDevelopmentDashboardPage } from '../pages/ManagerDevelopmentDashboardPage';
import { ManagerLearningPathPage } from '../pages/ManagerLearningPathPage';
import { NotFoundPage } from '@/features/auth/pages/NotFoundPage';

const enrolled = { enrollmentId: 'enroll-guid', courseId: 'course-guid', courseCode: 'M4-I', courseTitle: 'An toàn dữ liệu', status: 'IN_PROGRESS', progressPercent: 35, completedLessons: 2, totalLessons: 6 };

describe('manager learning uses BE2 data and enterprise routes', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('links the dashboard continue action to the enrolled GUID', () => {
    useCurrentUser.setState({ user: { id: 'manager', email: 'manager@example.test', fullName: 'Quản lý', roles: ['MANAGER'], permissions: [] }, isAuthenticated: true });
    vi.spyOn(learningHooks, 'useMyLearning').mockReturnValue({ data: { items: [enrolled], total: 1, completed: 0 }, isLoading: false } as any);
    vi.spyOn(gapHooks, 'useMySkillGap').mockReturnValue({ data: null, isLoading: false } as any);
    render(<MemoryRouter><ManagerDevelopmentDashboardPage /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Tiếp tục học' }).getAttribute('href')).toBe('/enterprise/me/courses/course-guid');
    expect(screen.getByText(/M4-I · 35%/)).toBeDefined();
    expect(screen.queryByText(/80%/)).toBeNull();
  });

  it('keeps BE2 recommendations separate from enrolled courses', () => {
    vi.spyOn(learningHooks, 'useMyLearning').mockReturnValue({ data: { items: [], total: 0 }, isLoading: false } as any);
    vi.spyOn(recommendationHooks, 'useCourseRecommendations').mockReturnValue({ data: { items: [{ courseId: 'recommended-guid', courseCode: 'M1-F', title: 'Khai thác thông tin', explanation: 'Bù đắp năng lực 1.1' }], reason: null }, isLoading: false } as any);
    render(<MemoryRouter><ManagerLearningPathPage /></MemoryRouter>);
    expect(screen.getByRole('link', { name: /Xem khóa học/ }).getAttribute('href')).toBe('/enterprise/me/courses/recommended-guid');
    expect(screen.getByText(/Gợi ý chưa phải khóa học được giao/)).toBeDefined();
  });

  it('returns the signed-in manager to the enterprise home from 404', () => {
    useCurrentUser.setState({ user: { id: 'manager', email: 'manager@example.test', fullName: 'Quản lý', roles: ['MANAGER'], permissions: [], workspace: 'enterprise' }, isAuthenticated: true });
    render(<MemoryRouter><NotFoundPage /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Về trang chủ' }).getAttribute('href')).toBe('/enterprise/team');
  });
});
