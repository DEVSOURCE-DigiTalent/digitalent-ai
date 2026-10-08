import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import * as meHooks from '@/hooks/use-me';
import type { MyAchievements, MyTaskSubmission } from '@/services/me.service';
import { MyPracticalTasksPage } from '../pages/MyPracticalTasksPage';
import { EmployeeTaskDetailPage } from '../pages/EmployeeTaskDetailPage';
import { SubmitEvidencePage } from '../pages/SubmitEvidencePage';
import { TaskFeedbackPage } from '../pages/TaskFeedbackPage';
import { MyCertificatesPage } from '../pages/MyCertificatesPage';
import { mutation, query, renderPage, signInAsEmployee, taskDetail } from './em-test-utils';

/** EM-14 Nhiệm vụ, EM-15 Chi tiết, EM-16 Nộp minh chứng kèm tệp, EM-17 Phản hồi, EM-18 Thành tựu. */

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() } }));

beforeEach(() => {
  vi.restoreAllMocks();
  vi.mocked(toast.error).mockClear();
  signInAsEmployee();
});

const pendingSubmission: MyTaskSubmission = {
  id: 'sub-1', versionNo: 1, status: 'PENDING_REVIEW', submittedAt: '2026-10-05T08:00:00Z',
  note: 'Bảng phân quyền đã rà soát.', links: [], files: [], evaluation: null,
};

describe('EM-14 Nhiệm vụ của tôi', () => {
  it('filters tasks by what is left to do', () => {
    vi.spyOn(meHooks, 'useMyTasks').mockReturnValue(query({
      items: [
        taskDetail({ assignmentId: 'asg-1', title: 'Rà soát quyền truy cập thư mục chứng từ' }),
        taskDetail({ assignmentId: 'asg-2', title: 'Chuẩn hóa quy trình lưu trữ hóa đơn', status: 'SUBMITTED', canSubmit: false, submissionCount: 1, latestSubmission: pendingSubmission }),
      ],
      summary: { total: 2, toDo: 1, pendingReview: 1, needsRevision: 0, passed: 0, failed: 0, overdue: 0 },
    }));

    renderPage(<MyPracticalTasksPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Đang chờ chấm (1)' }));

    expect(screen.getByText('Chuẩn hóa quy trình lưu trữ hóa đơn')).toBeInTheDocument();
    expect(screen.queryByText('Rà soát quyền truy cập thư mục chứng từ')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Xem chi tiết/ })).toHaveAttribute('href', '/enterprise/me/tasks/asg-2');
  });

  it('tells a new employee that no task has been assigned yet', () => {
    vi.spyOn(meHooks, 'useMyTasks').mockReturnValue(query({
      items: [], summary: { total: 0, toDo: 0, pendingReview: 0, needsRevision: 0, passed: 0, failed: 0, overdue: 0 },
    }));

    renderPage(<MyPracticalTasksPage />);

    expect(screen.getByText('Chưa có nhiệm vụ thực tế nào')).toBeInTheDocument();
  });
});

describe('EM-15 Chi tiết nhiệm vụ', () => {
  it('shows a not-found message for a task that is not assigned to me', () => {
    vi.spyOn(meHooks, 'useMyTask').mockReturnValue(query(undefined, { isError: true }));

    renderPage(<EmployeeTaskDetailPage />, { path: '/enterprise/me/tasks/:id', at: '/enterprise/me/tasks/asg-cua-dong-nghiep' });

    expect(screen.getByText('Không tìm thấy nhiệm vụ')).toBeInTheDocument();
  });
});

describe('EM-16 Nộp minh chứng nhiệm vụ', () => {
  const renderSubmit = (upload = vi.fn(), submit = vi.fn().mockResolvedValue({ versionNo: 1 })) => {
    vi.spyOn(meHooks, 'useMyTask').mockReturnValue(query(taskDetail()));
    vi.spyOn(meHooks, 'useUploadTaskAttachment').mockReturnValue(mutation(upload));
    vi.spyOn(meHooks, 'useSubmitMyTask').mockReturnValue(mutation(submit));
    renderPage(<SubmitEvidencePage />, { path: '/enterprise/me/tasks/:id/submit', at: '/enterprise/me/tasks/asg-1/submit' });
  };

  it('uploads an allowed file, refuses a disallowed one and submits the uploaded file id', async () => {
    const upload = vi.fn().mockResolvedValue({ id: 'file-1', fileName: 'bang-phan-quyen.pdf', sizeBytes: 2048 });
    const submit = vi.fn().mockResolvedValue({ versionNo: 1 });
    renderSubmit(upload, submit);

    const input = screen.getByLabelText('Chọn tệp đính kèm');
    fireEvent.change(input, { target: { files: [new File(['x'], 'virus.exe', { type: 'application/octet-stream' })] } });
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Định dạng .exe không được hỗ trợ.'));
    expect(upload).not.toHaveBeenCalled();

    const pdf = new File(['nội dung'], 'bang-phan-quyen.pdf', { type: 'application/pdf' });
    fireEvent.change(input, { target: { files: [pdf] } });
    await waitFor(() => expect(upload).toHaveBeenCalledWith({ assignmentId: 'asg-1', file: pdf }));
    expect(await screen.findByText('bang-phan-quyen.pdf')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Mô tả giải pháp/), { target: { value: 'Đã lập bảng phân quyền cho thư mục chứng từ.' } });
    fireEvent.click(screen.getByRole('button', { name: /Gửi nộp minh chứng/ }));

    await waitFor(() => expect(submit).toHaveBeenCalledWith({
      assignmentId: 'asg-1',
      payload: { content: 'Đã lập bảng phân quyền cho thư mục chứng từ.', linkUrls: [], attachmentIds: ['file-1'] },
    }));
  });

  it('rejects a link that is not an http(s) address', async () => {
    const submit = vi.fn();
    renderSubmit(vi.fn(), submit);

    fireEvent.change(screen.getByLabelText(/Mô tả giải pháp/), { target: { value: 'Đã lập bảng phân quyền cho thư mục chứng từ.' } });
    fireEvent.change(screen.getByLabelText('Đường dẫn 1'), { target: { value: 'drive.example.com/bao-cao' } });
    fireEvent.click(screen.getByRole('button', { name: /Gửi nộp minh chứng/ }));

    expect(await screen.findByText(/Đường dẫn phải bắt đầu bằng http:\/\/ hoặc https:\/\//)).toBeInTheDocument();
    expect(submit).not.toHaveBeenCalled();
  });
});

describe('EM-17 Phản hồi & chỉnh sửa', () => {
  it('says the latest version is waiting for review', () => {
    vi.spyOn(meHooks, 'useMyTask').mockReturnValue(query(taskDetail({
      status: 'SUBMITTED', canSubmit: false, submissionCount: 1, latestSubmission: pendingSubmission, submissions: [pendingSubmission],
    })));

    renderPage(<TaskFeedbackPage />, { path: '/enterprise/me/tasks/:id/feedback', at: '/enterprise/me/tasks/asg-1/feedback' });

    expect(screen.getByText('Bài nộp lần 1 đang chờ chấm')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Nộp lại bài chỉnh sửa/ })).not.toBeInTheDocument();
  });
});

describe('EM-18 Thành tựu & chứng nhận', () => {
  const achievements = (certificates: MyAchievements['certificates']): MyAchievements => ({
    stats: { validCertificates: certificates.filter((c) => c.status === 'VALID').length, completedCourses: 0, passedAssessments: 0, approvedTasks: 0, confirmedCompetencies: 0 },
    certificates,
    confirmedCompetencies: [],
    milestones: [],
  });

  it('invites an employee without certificates to start learning', () => {
    vi.spyOn(meHooks, 'useMyAchievements').mockReturnValue(query(achievements([])));

    renderPage(<MyCertificatesPage />);

    expect(screen.getByText('Bạn chưa có chứng nhận nào')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Đến khóa học của tôi' })).toHaveAttribute('href', '/enterprise/me/courses');
  });

  it('marks a revoked certificate as no longer valid and shows the reason', () => {
    vi.spyOn(meHooks, 'useMyAchievements').mockReturnValue(query(achievements([{
      id: 'c-1', certificateCode: 'DT-2026-REVOKED1', holderName: 'Nguyễn Văn Kế Toán', courseTitle: 'An toàn số cơ bản',
      issuedAt: '2026-09-01T00:00:00Z', status: 'REVOKED', revocationReason: 'Cấp nhầm khóa học.',
    }])));

    renderPage(<MyCertificatesPage />);

    expect(screen.getByText('Lý do thu hồi: Cấp nhầm khóa học.')).toBeInTheDocument();
    expect(screen.getByText('Chứng chỉ không còn hiệu lực')).toBeInTheDocument();
    expect(screen.getByText('Đã thu hồi')).toBeInTheDocument();
  });
});
