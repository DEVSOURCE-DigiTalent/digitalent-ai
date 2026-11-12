import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, useLocation } from 'react-router-dom';
import {
  mentorEnterpriseService,
  pulseReviewService,
  type MentorEnterpriseItem,
  type MentorEnterprisesResponse,
  type PulseFinalReviewQueue,
} from '@/services/pulse.service';
import { MentorEnterprisesPage } from '@/features/trial-program/pages/MentorEnterprisesPage';

function makeEnterprise(overrides: Partial<MentorEnterpriseItem>): MentorEnterpriseItem {
  return {
    organizationId: 'org-default',
    organizationCode: 'DIGI',
    organizationName: 'DigiTalent Demo Company',
    stage: 'OFFICIAL',
    ownerName: 'Nguyễn Minh Chủ',
    ownerEmail: 'owner@digitalent.ai',
    departmentCount: 3,
    employeeCount: 24,
    pendingCount: 2,
    retryCount: 1,
    flaggedCount: 0,
    reviewedCount: 5,
    totalSubmissions: 8,
    latestSubmittedAt: '2026-11-05T13:06:00.000Z',
    assignedAt: '2026-11-01T08:00:00.000Z',
    ...overrides,
  };
}

function mockEmptyQueue(overrides?: Partial<PulseFinalReviewQueue>) {
  vi.spyOn(pulseReviewService, 'getQueue').mockResolvedValue({
    data: {
      success: true,
      message: 'OK',
      data: {
        pendingCount: 0,
        preAssessmentCount: 0,
        retryCount: 0,
        deadlineMissedCount: 0,
        flaggedCount: 0,
        reviewedCount: 0,
        criteria: [],
        items: [],
        ...overrides,
      },
    },
  } as never);
}

function LocationProbe() {
  const location = useLocation();
  return (
    <>
      <div data-testid="location-path">{location.pathname}</div>
      <div data-testid="location-state">{JSON.stringify(location.state ?? null)}</div>
    </>
  );
}

function renderEnterprisesPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/mentor/enterprises']}>
        <LocationProbe />
        <MentorEnterprisesPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('MentorEnterprisesPage operational hub', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders urgent action strip, default table view with priority ordering, cards view toggle, and child navigation', async () => {
    const payload: MentorEnterprisesResponse = {
      totalEnterprises: 3,
      pendingCount: 4,
      attentionCount: 1,
      reviewedCount: 10,
      items: [
        makeEnterprise({
          organizationId: 'org-done',
          organizationCode: 'DONE',
          organizationName: 'Công ty Hoàn Tất',
          stage: 'OFFICIAL',
          pendingCount: 0,
          retryCount: 0,
          flaggedCount: 0,
          reviewedCount: 6,
          totalSubmissions: 6,
        }),
        makeEnterprise({
          organizationId: 'org-trial',
          organizationCode: 'TRIAL-c2615a9b11223344',
          organizationName: 'Công ty Dùng Thử A',
          stage: 'TRIAL',
          pendingCount: 3,
          retryCount: 1,
          flaggedCount: 1,
          reviewedCount: 2,
          totalSubmissions: 7,
        }),
        makeEnterprise({
          organizationId: 'org-off',
          organizationCode: 'OFF1',
          organizationName: 'Công ty Chính Thức B',
          stage: 'OFFICIAL',
          pendingCount: 1,
          retryCount: 0,
          flaggedCount: 0,
          reviewedCount: 2,
          totalSubmissions: 3,
        }),
      ],
    };

    vi.spyOn(mentorEnterpriseService, 'list').mockResolvedValue({
      data: { success: true, message: 'OK', data: payload },
    } as never);

    mockEmptyQueue({
      pendingCount: 1,
      items: [
        {
          kind: 'FINAL',
          submissionId: 'sub-urgent',
          status: 'PENDING',
          employeeId: 'emp-urgent',
          employeeName: 'Nhân viên Khẩn Cấp',
          organizationId: 'org-trial',
          organizationName: 'Công ty Dùng Thử A',
          departmentName: 'Kinh doanh',
          positionName: 'Chuyên viên',
          courseId: 'c-1',
          courseCode: 'M1-A',
          courseTitle: 'Khai thác dữ liệu',
          domainName: 'Dữ liệu',
          tier: 2,
          attemptNo: 1,
          maxAttempts: 2,
          attempts: [
            {
              submissionId: 'sub-urgent',
              attemptNo: 1,
              evidenceText: 'Bài nộp khẩn',
              submittedAt: '2026-11-05T10:00:00.000Z',
              choice: { score: 9, total: 10, passMark: 7, passed: true },
            },
          ],
          recording: null,
        },
      ],
    });

    renderEnterprisesPage();

    expect(await screen.findByRole('heading', { name: 'Tổng quan chấm bài' })).toBeInTheDocument();
    expect(await screen.findByText('Tổng 3 doanh nghiệp')).toBeInTheDocument();

    // Duplicated focus box "Ưu tiên chấm tiếp theo" is removed in favor of right summary tabs + urgent strip
    expect(screen.queryByText('Ưu tiên chấm tiếp theo')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Mở bàn chấm ngay/i })).not.toBeInTheDocument();

    const summaryNav = screen.getByRole('navigation', { name: 'Phân loại nhanh bài nộp' });
    expect(within(summaryNav).getByRole('button', { name: /4\s*Bài chờ chấm/i })).toBeInTheDocument();
    expect(within(summaryNav).getByRole('button', { name: /1\s*Cần hỗ trợ \/ nộp lại/i })).toBeInTheDocument();
    expect(within(summaryNav).getByRole('button', { name: /10\s*Bài đã xử lý/i })).toBeInTheDocument();

    // Urgent strip opens specific pending submission in workbench
    const urgentRegion = await screen.findByRole('region', { name: 'Việc cần xử lý ngay' });
    expect(within(urgentRegion).getByText('Nhân viên Khẩn Cấp')).toBeInTheDocument();

    // Default Table View shows clean short code TRIAL-C2615A and priority sorting
    expect(screen.getByRole('button', { name: 'Bảng' })).toHaveAttribute('aria-pressed', 'true');
    const table = await screen.findByRole('table');
    const bodyRows = within(table).getAllByRole('row').slice(1);
    expect(bodyRows).toHaveLength(3);
    expect(within(bodyRows[0]).getByText('Công ty Dùng Thử A')).toBeInTheDocument();
    expect(within(bodyRows[0]).getByText('Dùng thử')).toBeInTheDocument();
    expect(within(bodyRows[0]).getByText('TRIAL-C2615A')).toBeInTheDocument();
    expect(within(bodyRows[0]).getByText('3 chờ chấm')).toBeInTheDocument();
    expect(within(bodyRows[1]).getByText('Công ty Chính Thức B')).toBeInTheDocument();
    expect(within(bodyRows[2]).getByText('Không có')).toBeInTheDocument();

    // Toggle to Cards View still works cleanly for Mentor
    fireEvent.click(screen.getByRole('button', { name: 'Thẻ' }));
    const cardList = await screen.findByRole('list', { name: 'Danh sách doanh nghiệp dạng thẻ' });
    const cards = within(cardList).getAllByRole('listitem');
    expect(cards).toHaveLength(3);
    expect(within(cards[0]).getByText('Công ty Dùng Thử A')).toBeInTheDocument();

    // Navigating to child enterprise workbench from table or card view
    fireEvent.click(within(cards[0]).getByRole('button', { name: /Mở bàn chấm/i }));
    expect(screen.getByTestId('location-path').textContent).toBe('/mentor/enterprises/org-trial');
  });

  it('filters by status tab, stage, search, and resets cleanly', async () => {
    const payload: MentorEnterprisesResponse = {
      totalEnterprises: 2,
      pendingCount: 2,
      attentionCount: 0,
      reviewedCount: 4,
      items: [
        makeEnterprise({
          organizationId: 'org-1',
          organizationCode: 'DIGI',
          organizationName: 'DigiTalent Demo Company',
          stage: 'OFFICIAL',
          pendingCount: 2,
          retryCount: 0,
          flaggedCount: 0,
          reviewedCount: 2,
          totalSubmissions: 4,
        }),
        makeEnterprise({
          organizationId: 'org-2',
          organizationCode: 'BETA',
          organizationName: 'Beta Retail Trial',
          stage: 'TRIAL',
          pendingCount: 0,
          retryCount: 0,
          flaggedCount: 0,
          reviewedCount: 2,
          totalSubmissions: 2,
        }),
      ],
    };

    vi.spyOn(mentorEnterpriseService, 'list').mockResolvedValue({
      data: { success: true, message: 'OK', data: payload },
    } as never);
    mockEmptyQueue();

    renderEnterprisesPage();

    await screen.findByText('Tổng 2 doanh nghiệp');

    fireEvent.change(screen.getByLabelText('Lọc theo giai đoạn doanh nghiệp'), { target: { value: 'TRIAL' } });
    expect(screen.getByText('Tổng 1 doanh nghiệp')).toBeInTheDocument();
    expect(screen.getByText('Beta Retail Trial')).toBeInTheDocument();
    expect(screen.queryByText('DigiTalent Demo Company')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Đặt lại bộ lọc/i }));
    expect(screen.getByText('Tổng 2 doanh nghiệp')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Tìm doanh nghiệp'), { target: { value: 'khong-co-org' } });
    expect(await screen.findByText('Không có doanh nghiệp khớp bộ lọc')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: /Đặt lại bộ lọc/i })[0]);
    expect(screen.getByText('Tổng 2 doanh nghiệp')).toBeInTheDocument();
  });

  it('paginates across pages in cards view and table view', async () => {
    const items: MentorEnterpriseItem[] = Array.from({ length: 12 }, (_, idx) =>
      makeEnterprise({
        organizationId: `org-${idx + 1}`,
        organizationCode: `ORG${idx + 1}`,
        organizationName: `Doanh nghiệp ${String(idx + 1).padStart(2, '0')}`,
        pendingCount: idx < 5 ? 12 - idx : 0,
      }),
    );

    vi.spyOn(mentorEnterpriseService, 'list').mockResolvedValue({
      data: {
        success: true,
        message: 'OK',
        data: {
          totalEnterprises: 12,
          pendingCount: 5,
          attentionCount: 0,
          reviewedCount: 60,
          items,
        },
      },
    } as never);
    mockEmptyQueue();

    renderEnterprisesPage();

    await screen.findByText('Tổng 12 doanh nghiệp');
    const nav = screen.getByRole('navigation', { name: 'Phân trang danh sách' });
    expect(nav.textContent).toContain('Hiển thị 1 đến 10 trong tổng 12 doanh nghiệp');
    expect(within(await screen.findByRole('table')).getAllByRole('row').slice(1)).toHaveLength(10);

    fireEvent.click(screen.getByRole('button', { name: 'Trang sau' }));
    expect(nav.textContent).toContain('Hiển thị 11 đến 12 trong tổng 12 doanh nghiệp');
    expect(within(screen.getByRole('table')).getAllByRole('row').slice(1)).toHaveLength(2);

    fireEvent.click(screen.getByRole('button', { name: 'Thẻ' }));
    expect(
      within(await screen.findByRole('list', { name: 'Danh sách doanh nghiệp dạng thẻ' })).getAllByRole('listitem'),
    ).toHaveLength(2);
  });

  it('navigates to /mentor/course-reviews with pre-applied status filter when clicking summary tabs', async () => {
    vi.spyOn(mentorEnterpriseService, 'list').mockResolvedValue({
      data: {
        success: true,
        message: 'OK',
        data: {
          totalEnterprises: 1,
          pendingCount: 3,
          attentionCount: 2,
          reviewedCount: 5,
          items: [makeEnterprise({})],
        },
      },
    } as never);
    mockEmptyQueue();

    renderEnterprisesPage();

    const summaryNav = await screen.findByRole('navigation', { name: 'Phân loại nhanh bài nộp' });
    fireEvent.click(within(summaryNav).getByRole('button', { name: /Cần hỗ trợ \/ nộp lại/i }));

    expect(screen.getByTestId('location-path').textContent).toBe('/mentor/course-reviews');
    expect(screen.getByTestId('location-state').textContent).toContain('"statusFilter":"ATTENTION"');
  });
});
