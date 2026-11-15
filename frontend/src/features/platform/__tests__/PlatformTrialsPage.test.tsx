import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter, useRoutes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { routes } from '@/app/router';
import { preloadLazyPages } from '@/app/routes/lazy-page';
import { MOCK_EMAILS, signInAsMock } from '@/test/session';
import type { MentorItem, PlatformTrialItem } from '@/services/trial-program.service';

const trialServiceMock = vi.hoisted(() => ({
  platformTrials: vi.fn(),
  mentors: vi.fn(),
  assignMentor: vi.fn(),
  createMentor: vi.fn(),
}));

vi.mock('@/services/trial-program.service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/trial-program.service')>();
  return {
    ...actual,
    trialProgramService: {
      ...actual.trialProgramService,
      platformTrials: trialServiceMock.platformTrials,
      mentors: trialServiceMock.mentors,
      assignMentor: trialServiceMock.assignMentor,
      createMentor: trialServiceMock.createMentor,
    },
  };
});

function App() {
  return useRoutes(routes);
}

const SAMPLE_TRIALS: PlatformTrialItem[] = [
  {
    organizationId: 'org-req',
    organizationName: 'Logistics Phương Đông',
    ownerName: 'Trần Hoàng Nam',
    ownerEmail: 'nam@phuongdong.vn',
    stage: 'REQUESTED',
    startedAt: '2026-11-01T08:00:00Z',
    testDeadline: new Date(Date.now() + 2 * 86400000).toISOString(),
    preferredReviewAt: new Date(Date.now() + 12 * 3600000).toISOString(),
    requestNote: 'Ưu tiên chấm nhóm kho vận.',
    requestedAt: '2026-11-10T09:00:00Z',
    mentorUserId: null,
    mentorName: null,
    participants: 10,
    submitted: 9,
    reviewed: 0,
  },
  {
    organizationId: 'org-asg',
    organizationName: 'VinTech Solutions',
    ownerName: 'Trần Đại Diện',
    ownerEmail: 'owner@vintech.vn',
    stage: 'ASSIGNED',
    startedAt: '2026-11-01T08:00:00Z',
    testDeadline: new Date(Date.now() + 5 * 86400000).toISOString(),
    preferredReviewAt: new Date(Date.now() + 6 * 86400000).toISOString(),
    requestNote: null,
    requestedAt: '2026-11-08T09:00:00Z',
    mentorUserId: 'm-1',
    mentorName: 'Lê Minh Tuấn',
    participants: 8,
    submitted: 8,
    reviewed: 3,
  },
  {
    organizationId: 'org-rep',
    organizationName: 'Giáo dục Số EduGlobal',
    ownerName: 'Phạm Giảng Viên',
    ownerEmail: 'owner@eduglobal.vn',
    stage: 'REPORTED',
    startedAt: '2026-10-15T08:00:00Z',
    testDeadline: '2026-10-25T18:00:00Z',
    preferredReviewAt: '2026-10-27T09:00:00Z',
    reportPublishedAt: '2026-10-28T10:00:00Z',
    mentorUserId: 'm-2',
    mentorName: 'Nguyễn Thu Hương',
    participants: 12,
    submitted: 12,
    reviewed: 12,
  },
];

const SAMPLE_MENTORS: MentorItem[] = [
  {
    userId: 'm-1',
    fullName: 'Lê Minh Tuấn',
    email: 'tuan.le@digitalent.ai',
    status: 'ACTIVE',
    activeTrials: 1,
    createdAt: '2026-08-01T08:00:00Z',
  },
  {
    userId: 'm-2',
    fullName: 'Nguyễn Thu Hương',
    email: 'huong.nguyen@digitalent.ai',
    status: 'ACTIVE',
    activeTrials: 0,
    createdAt: '2026-09-10T08:00:00Z',
  },
];

function renderTrials() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/platform/trials']}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('PlatformTrialsPage (PA-14)', () => {
  beforeAll(async () => {
    await preloadLazyPages();
  }, 45000);

  beforeEach(() => {
    vi.clearAllMocks();
    signInAsMock(MOCK_EMAILS.platform);
    trialServiceMock.platformTrials.mockResolvedValue({
      data: { data: { items: SAMPLE_TRIALS } },
    });
    trialServiceMock.mentors.mockResolvedValue({
      data: { data: { items: SAMPLE_MENTORS } },
    });
    trialServiceMock.assignMentor.mockResolvedValue({ data: { data: { success: true } } });
    trialServiceMock.createMentor.mockResolvedValue({
      data: {
        data: {
          mentor: {
            userId: 'm-new',
            fullName: 'Trần Bảo An',
            email: 'an.tran@digitalent.ai',
            status: 'ACTIVE',
            activeTrials: 0,
            createdAt: '2026-11-14T08:00:00Z',
          },
        },
      },
    });
  });

  it('shows matched skeleton loader while data is pending', async () => {
    trialServiceMock.platformTrials.mockImplementation(() => new Promise(() => { }));
    renderTrials();
    expect(
      await screen.findByRole('status', { name: /đang tải danh sách đánh giá dùng thử/i }),
    ).toBeInTheDocument();
  });

  it('renders distinct stage labels, 4 KPI filter cards, and interactive mentor filtering', async () => {
    renderTrials();

    const getTable = () => screen.getByRole('region', { name: /bảng yêu cầu thẩm định dùng thử/i });

    await waitFor(() => expect(within(getTable()).getByText('Logistics Phương Đông')).toBeInTheDocument());
    expect(within(getTable()).getByText('VinTech Solutions')).toBeInTheDocument();
    expect(within(getTable()).getByText('Giáo dục Số EduGlobal')).toBeInTheDocument();

    // REQUESTED and ASSIGNED must have distinct labels inside the table (not merged as "Đang khảo sát")
    expect(within(getTable()).getAllByText('Chờ phân công').length).toBeGreaterThanOrEqual(1);
    expect(within(getTable()).getAllByText('Đang chấm thi').length).toBeGreaterThanOrEqual(1);
    expect(within(getTable()).getByText('Chưa phân công')).toBeInTheDocument();

    // Filter via KPI card "Chờ phân công"
    fireEvent.click(screen.getByRole('button', { name: /chờ phân công/i }));
    expect(within(getTable()).getByText('Logistics Phương Đông')).toBeInTheDocument();
    expect(within(getTable()).queryByText('VinTech Solutions')).not.toBeInTheDocument();

    // Clicking active KPI resets back to all
    fireEvent.click(screen.getByRole('button', { name: /chờ phân công/i }));
    expect(within(getTable()).getByText('VinTech Solutions')).toBeInTheDocument();

    // Open Mentor dropdown and filter table by Lê Minh Tuấn
    fireEvent.click(screen.getByRole('button', { name: /lọc theo mentor/i }));
    fireEvent.click(screen.getByRole('button', { name: /tuan\.le@digitalent\.ai/i }));
    expect(within(getTable()).getByText('VinTech Solutions')).toBeInTheDocument();
    expect(within(getTable()).queryByText('Logistics Phương Đông')).not.toBeInTheDocument();
  });

  it('opens TrialDetailDrawer and assigns a mentor, and supports CreateMentorDrawer', async () => {
    renderTrials();

    await waitFor(() => expect(screen.getByText('Logistics Phương Đông')).toBeInTheDocument());

    // Open assign drawer from table CTA
    fireEvent.click(screen.getByRole('button', { name: /^Phân công$/i }));
    expect(screen.getByRole('radiogroup', { name: /chọn mentor phụ trách/i })).toBeInTheDocument();

    // Select Nguyễn Thu Hương and submit
    fireEvent.click(screen.getByRole('radio', { name: /Nguyễn Thu Hương/i }));
    fireEvent.click(screen.getByRole('button', { name: /Xác nhận phân công Mentor/i }));

    await waitFor(() =>
      expect(trialServiceMock.assignMentor).toHaveBeenCalledWith('org-req', 'm-2'),
    );

    // Open CreateMentorDrawer from header action
    fireEvent.click(screen.getByRole('button', { name: /Thêm Mentor/i }));
    fireEvent.change(screen.getByLabelText(/Họ và tên chuyên gia/i), {
      target: { value: 'Trần Bảo An' },
    });
    fireEvent.change(screen.getByLabelText(/Email công việc/i), {
      target: { value: 'an.tran@digitalent.ai' },
    });
    fireEvent.change(screen.getByLabelText(/Mật khẩu khởi tạo/i), {
      target: { value: 'MatKhauAnToan123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Tạo tài khoản Mentor/i }));

    await waitFor(() =>
      expect(trialServiceMock.createMentor).toHaveBeenCalledWith({
        fullName: 'Trần Bảo An',
        email: 'an.tran@digitalent.ai',
        password: 'MatKhauAnToan123',
      }),
    );
  });
});