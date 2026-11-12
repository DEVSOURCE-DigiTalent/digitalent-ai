import React from 'react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, useLocation, useRoutes } from 'react-router-dom';
import { mentorRoutes } from '@/app/routes/mentor.routes';
import { legacyRedirectRoutes } from '@/app/routes/legacy-redirects';
import { preloadLazyPages } from '@/app/routes/lazy-page';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ROLES, WORKSPACES } from '@/lib/roles';
import { MENTOR_SCREENS } from '@/lib/screens/mentor';
import { mentorEnterpriseService, pulseReviewService } from '@/services/pulse.service';
import { platformService } from '@/services/platform.service';
import { MENTOR_NAV } from '../mentor-nav';
import { MentorLayout } from '../MentorLayout';
import { MentorProfilePage } from '../MentorProfilePage';

function setMentorSession() {
  localStorage.setItem('accessToken', 'test-mentor-token');
  useCurrentUser.getState().setUser({
    id: 'mentor-1',
    email: 'mentor@digitalent.ai',
    fullName: 'Mentor DigiTalent',
    roles: [ROLES.MENTOR],
    permissions: ['trial.review'],
    workspace: WORKSPACES.MENTOR,
    emailVerified: true,
  });
}

function MentorRouterProbe() {
  const location = useLocation();
  const element = useRoutes([...mentorRoutes, ...legacyRedirectRoutes]);
  return (
    <>
      <div data-testid="location-display">{location.pathname}</div>
      {element}
    </>
  );
}

describe('Mentor navigation, parent-child sitemap and hidden /mentor/reviews routes', () => {
  let queryClient: QueryClient;

  beforeAll(() => preloadLazyPages(), 60_000);

  beforeEach(() => {
    localStorage.clear();
    useCurrentUser.getState().clearUser();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.spyOn(mentorEnterpriseService, 'list').mockResolvedValue({
      data: {
        success: true,
        message: 'Success',
        data: {
          totalEnterprises: 2,
          pendingCount: 3,
          attentionCount: 1,
          reviewedCount: 5,
          items: [],
        },
      },
    } as never);
    vi.spyOn(pulseReviewService, 'getQueue').mockResolvedValue({
      data: {
        success: true,
        message: 'Success',
        data: {
          pendingCount: 2,
          reviewedCount: 5,
          preAssessmentCount: 0,
          retryCount: 0,
          deadlineMissedCount: 0,
          flaggedCount: 0,
          criteria: [],
          items: [],
        },
      },
    } as never);
    vi.spyOn(platformService, 'getNotifications').mockResolvedValue({
      data: {
        success: true,
        message: 'Success',
        data: {
          items: [
            {
              id: 'notif-1',
              type: 'PULSE_FINAL_SUBMITTED',
              title: 'Có bài cuối khóa cần chấm',
              message: 'Lê Hoàng Long đã nộp bài cuối khóa "Khai thác dữ liệu".',
              relatedEntityType: 'course_final_submissions',
              relatedEntityId: 'sub-99',
              isRead: false,
              createdAt: '2026-11-10T03:00:00.000Z',
            },
          ],
          total: 1,
          unread: 1,
          pageIndex: 1,
          pageSize: 20,
        },
      },
    } as never);
    vi.spyOn(platformService, 'markNotificationRead').mockResolvedValue({
      data: { success: true, message: 'OK', data: null },
    } as never);
    vi.spyOn(platformService, 'markAllNotificationsRead').mockResolvedValue({
      data: { success: true, message: 'OK', data: null },
    } as never);
  });

  it('configures single-tab MENTOR_NAV for assigned enterprises and marks MT-06/MT-07 retired', () => {
    expect(MENTOR_NAV.map((item) => item.to)).toEqual(['/mentor/enterprises']);

    const mt01 = MENTOR_SCREENS.find((s) => s.id === 'MT-01');
    const mt02 = MENTOR_SCREENS.find((s) => s.id === 'MT-02');
    const mt03 = MENTOR_SCREENS.find((s) => s.id === 'MT-03');
    const mt04 = MENTOR_SCREENS.find((s) => s.id === 'MT-04');
    const mt05 = MENTOR_SCREENS.find((s) => s.id === 'MT-05');
    const mt06 = MENTOR_SCREENS.find((s) => s.id === 'MT-06');
    const mt07 = MENTOR_SCREENS.find((s) => s.id === 'MT-07');

    expect(mt01?.path).toBe('/mentor/enterprises');
    expect(mt02?.path).toBe('/mentor/enterprises/:organizationId');
    expect(mt03?.path).toBe('/mentor/enterprises/:organizationId/submissions/:submissionId');
    expect(mt04?.path).toBe('/mentor/course-reviews');
    expect(mt05?.path).toBe('/mentor/course-reviews/:submissionId');
    expect(mt06?.status).toBe('RETIRED');
    expect(mt07?.status).toBe('RETIRED');
  });

  it('shows only Doanh nghiệp được giao tab in header nav without Tất cả bài nộp or Dùng thử doanh nghiệp in MentorLayout', async () => {
    setMentorSession();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/mentor/enterprises']}>
          <MentorLayout />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByRole('link', { name: 'Doanh nghiệp được giao' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Tất cả bài nộp' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Dùng thử doanh nghiệp/i })).not.toBeInTheDocument();

    // Notification button beside search shows unread badge, opens popover, and deep links cleanly
    const notifBtn = await screen.findByRole('button', { name: /Thông báo \(1 chưa đọc\)/i });
    fireEvent.click(notifBtn);
    expect(await screen.findByRole('dialog', { name: 'Danh sách thông báo nhanh' })).toBeInTheDocument();
    expect(screen.getByText('Có bài cuối khóa cần chấm')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Mở trung tâm thông báo/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Tìm nhanh/i }));
    expect(await screen.findByPlaceholderText('Nhập tên trang cần mở...')).toBeInTheDocument();
    expect(screen.getByText('Tất cả bài nộp cuối cấp')).toBeInTheDocument();
    expect(screen.queryByText('Dùng thử doanh nghiệp')).not.toBeInTheDocument();
  });

  it('hides Doanh nghiệp được giao tab in header when viewing enterprise detail subpage', async () => {
    setMentorSession();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/mentor/enterprises/org-1']}>
          <MentorLayout />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText('Chấm bài theo doanh nghiệp')).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Điều hướng Mentor' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Doanh nghiệp được giao' })).not.toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /Thông báo \(1 chưa đọc\)/i })).toBeInTheDocument();
  });

  it('links to /mentor/enterprises and excludes /mentor/reviews or pre-assessment copy from MentorProfilePage', async () => {
    setMentorSession();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/mentor/account']}>
          <MentorProfilePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByRole('heading', { name: /Hồ sơ Mentor/i })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Xem doanh nghiệp được giao/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('link', { name: /Xem tất cả bài nộp/i })).toHaveAttribute('href', '/mentor/course-reviews');
    expect(await screen.findByText('2 đơn vị')).toBeInTheDocument();

    expect(screen.queryByRole('link', { name: /Xem doanh nghiệp dùng thử/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/đánh giá trước khi học/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Chấm bài đánh giá doanh nghiệp dùng thử/i)).not.toBeInTheDocument();
  });

  it.each(['/mentor', '/mentor/reviews', '/mentor/reviews/org-1', '/platform/reviews', '/platform/reviews/org-1'])(
    'redirects %s directly to /mentor/enterprises',
    async (entryPath) => {
      setMentorSession();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={[entryPath]}>
            <MentorRouterProbe />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('location-display').textContent).toBe('/mentor/enterprises');
      });
    },
  );
});
