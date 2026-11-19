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
  autoAssignMentors: vi.fn(),
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
      autoAssignMentors: trialServiceMock.autoAssignMentors,
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
    coursesPurchased: 4,
    learners: 9,
    waitingFinals: 1,
  },
  {
    organizationId: 'org-learn',
    organizationName: 'Bán lẻ Sao Mai',
    ownerName: 'Lê Thị Mai',
    ownerEmail: 'mai@saomai.vn',
    stage: 'REPORTED',
    startedAt: '2026-10-20T08:00:00Z',
    testDeadline: '2026-10-30T18:00:00Z',
    reportPublishedAt: '2026-10-30T18:00:00Z',
    mentorUserId: null,
    mentorName: null,
    participants: 5,
    submitted: 5,
    reviewed: 0,
    coursesPurchased: 2,
    learners: 3,
    waitingFinals: 2,
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

function renderTrials(path = '/platform/trials') {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
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

  it('keeps the survey apart from the mentor who grades the learning assignments', async () => {
    renderTrials();

    const survey = () => screen.getByRole('region', { name: /bảng bài khảo sát/i });

    await waitFor(() => expect(within(survey()).getByText('Logistics Phương Đông')).toBeInTheDocument());

    // Survey: requested and mentor-assigned organizations are both still taking the test; no mentor column.
    expect(within(survey()).getAllByText('Đang làm bài')).toHaveLength(2);
    expect(within(survey()).getAllByText('Đã có báo cáo')).toHaveLength(2);
    expect(within(survey()).queryByText('Chưa phân công')).not.toBeInTheDocument();
    expect(within(survey()).queryByText('Lê Minh Tuấn')).not.toBeInTheDocument();

    // KPI "Đang làm khảo sát" filters the survey table; clicking again shows everything.
    fireEvent.click(screen.getByRole('button', { name: /đang làm khảo sát/i }));
    expect(within(survey()).getByText('VinTech Solutions')).toBeInTheDocument();
    expect(within(survey()).queryByText('Giáo dục Số EduGlobal')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /đang làm khảo sát/i }));
    expect(within(survey()).getByText('Giáo dục Số EduGlobal')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: /bảng tổ chức và mentor phụ trách/i })).not.toBeInTheDocument();
  });

  it('lists the learning organizations and their mentor on the Mentor page', async () => {
    renderTrials('/platform/mentors');
    const learning = () => screen.getByRole('region', { name: /bảng tổ chức và mentor phụ trách/i });
    await waitFor(() => expect(within(learning()).getByText('Bán lẻ Sao Mai')).toBeInTheDocument());
    expect(screen.queryByRole('region', { name: /bảng bài khảo sát/i })).not.toBeInTheDocument();

    // Every organization that started its survey, with its mentor; no mentor and waiting work first.
    const rows = within(learning()).getAllByRole('row');
    expect(within(rows[1]).getByText('Bán lẻ Sao Mai')).toBeInTheDocument();
    expect(within(rows[1]).getByText('Chưa phân công')).toBeInTheDocument();
    expect(within(rows[1]).getByText('2 bài')).toBeInTheDocument();
    expect(within(rows[2]).getByText('Logistics Phương Đông')).toBeInTheDocument();
    expect(within(rows[2]).getByText('Đang làm khảo sát')).toBeInTheDocument();
    expect(within(rows[3]).getByText('Nguyễn Thu Hương')).toBeInTheDocument();
    expect(within(learning()).getByText('VinTech Solutions')).toBeInTheDocument();

    // Filter the learning table by mentor.
    fireEvent.click(screen.getByRole('button', { name: /lọc theo mentor/i }));
    fireEvent.click(screen.getByRole('button', { name: /huong\.nguyen@digitalent\.ai/i }));
    expect(within(learning()).getByText('Giáo dục Số EduGlobal')).toBeInTheDocument();
    expect(within(learning()).queryByText('Bán lẻ Sao Mai')).not.toBeInTheDocument();
  });

  it('assigns every organization without a mentor in one click', async () => {
    trialServiceMock.autoAssignMentors.mockResolvedValue({
      data: { data: { assigned: [{ organizationId: 'org-learn', organizationName: 'Bán lẻ Sao Mai', mentorUserId: 'm-2', mentorName: 'Nguyễn Thu Hương' }], remaining: 0 } },
    });
    renderTrials('/platform/mentors');

    // Logistics Phương Đông (taking the survey) and Bán lẻ Sao Mai (learning) have no mentor.
    const button = await screen.findByRole('button', { name: /tự phân công \(2\)/i });
    fireEvent.click(button);
    await waitFor(() => expect(trialServiceMock.autoAssignMentors).toHaveBeenCalledTimes(1));
  });

  it('opens TrialDetailDrawer and assigns a mentor, and supports CreateMentorDrawer', async () => {
    renderTrials('/platform/mentors');

    const learning = () => screen.getByRole('region', { name: /bảng tổ chức và mentor phụ trách/i });
    await waitFor(() => expect(within(learning()).getByText('Bán lẻ Sao Mai')).toBeInTheDocument());

    // Open the assign drawer from the learning table
    // First row = Bán lẻ Sao Mai (no mentor and assignments waiting).
    fireEvent.click(within(learning()).getAllByRole('button', { name: /^Phân công$/i })[0]);
    expect(screen.getByRole('radiogroup', { name: /chọn mentor phụ trách/i })).toBeInTheDocument();

    // Select Nguyễn Thu Hương and submit
    fireEvent.click(screen.getByRole('radio', { name: /Nguyễn Thu Hương/i }));
    fireEvent.click(screen.getByRole('button', { name: /Xác nhận phân công/i }));

    await waitFor(() =>
      expect(trialServiceMock.assignMentor).toHaveBeenCalledWith('org-learn', 'm-2'),
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