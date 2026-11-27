import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as hooks from '@/hooks/use-course-updates';
import type { CourseUpdates } from '@/services/course-update.service';
import { CourseUpdatesPage } from '../pages/CourseUpdatesPage';

const offer: CourseUpdates = {
  status: 'AVAILABLE',
  currentVersionNo: 2,
  latestVersionNo: 3,
  latestPublishedAt: '2026-11-25T08:00:00Z',
  releaseNote: 'Sửa đáp án mô-đun 2',
  courses: [
    { courseId: 'p1', code: 'M1-F', title: 'Tìm kiếm thông tin cơ bản', level: 1, kind: 'UPDATED', owned: true, learnersInProgress: 3, learnersPassed: 2 },
    { courseId: 'p2', code: 'M2-I', title: 'Giao tiếp số trung cấp', level: 2, kind: 'UPDATED', owned: false, learnersInProgress: 0, learnersPassed: 0 },
  ],
  decidedBy: 'OWNER',
  canDecide: true,
};

function renderPage(data: CourseUpdates) {
  const apply = vi.fn().mockResolvedValue({ ...data, status: 'UP_TO_DATE', currentVersionNo: data.latestVersionNo, courses: [] });
  const keep = vi.fn().mockResolvedValue({ ...data, status: 'KEPT' });
  vi.spyOn(hooks, 'useCourseUpdates').mockReturnValue({ data, isLoading: false, isError: false } as never);
  vi.spyOn(hooks, 'useApplyCourseUpdate').mockReturnValue({ mutateAsync: apply, isPending: false } as never);
  vi.spyOn(hooks, 'useKeepCourseVersion').mockReturnValue({ mutateAsync: keep, isPending: false } as never);
  render(<MemoryRouter><CourseUpdatesPage /></MemoryRouter>);
  return { apply, keep };
}

describe('CourseUpdatesPage', () => {
  afterEach(() => vi.restoreAllMocks());

  it('lists what the newest version changes and who keeps the old one', () => {
    renderPage(offer);
    expect(screen.getByRole('heading', { name: '2 khóa thay đổi so với bản công ty đang dùng (v2)' })).toBeInTheDocument();
    expect(screen.getByText('Sửa đáp án mô-đun 2')).toBeInTheDocument();
    expect(screen.getByText('5 người sẽ học lại từ đầu')).toBeInTheDocument();
    expect(screen.getByText(/Chưa mua: áp dụng để khi mua có sẵn bản mới/)).toBeInTheDocument();
  });

  it('applies the newest version after confirming', async () => {
    const { apply } = renderPage(offer);
    fireEvent.click(screen.getByRole('button', { name: 'Áp dụng v3' }));
    const dialog = screen.getByRole('dialog', { name: 'Áp dụng v3 cho cả công ty?' });
    expect(dialog).toHaveTextContent('3 người đang học dở mất tiến độ cũ; bài cuối khóa đang chờ chấm bị hủy.');
    expect(dialog).toHaveTextContent('2 người đã đạt phải học lại; mức từ các khóa này không còn tính, chứng nhận đã cấp vẫn giữ.');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Áp dụng' }));
    await waitFor(() => expect(apply).toHaveBeenCalledWith(3));
  });

  it('keeps the current version only with a reason of ten characters', async () => {
    const { keep } = renderPage(offer);
    fireEvent.click(screen.getByRole('button', { name: 'Giữ bản hiện tại' }));
    const dialog = screen.getByRole('dialog', { name: 'Giữ v2, chưa áp dụng v3?' });
    const confirm = within(dialog).getByRole('button', { name: 'Giữ bản hiện tại' });
    fireEvent.change(within(dialog).getByLabelText(/Lý do/), { target: { value: 'ngắn' } });
    expect(confirm).toBeDisabled();
    fireEvent.change(within(dialog).getByLabelText(/Lý do/), { target: { value: 'Chờ R&D đọc bản mới' } });
    fireEvent.click(confirm);
    await waitFor(() => expect(keep).toHaveBeenCalledWith({ versionNo: 3, reason: 'Chờ R&D đọc bản mới' }));
  });

  it('shows the kept decision and still lets the company apply later', () => {
    renderPage({ ...offer, status: 'KEPT', kept: { versionNo: 3, reason: 'Chờ hết quý', keptAt: '2026-11-26T02:00:00Z', keptBy: 'Chủ Phú Thịnh' } });
    expect(screen.getByRole('status')).toHaveTextContent('Đang giữ v2: Chờ hết quý');
    expect(screen.queryByRole('button', { name: 'Giữ bản hiện tại' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Áp dụng v3' })).toBeInTheDocument();
  });

  it('lets the owner only read while the company R&D decides', () => {
    renderPage({ ...offer, decidedBy: 'RND', canDecide: false });
    expect(screen.getByRole('note')).toHaveTextContent('Công ty đã có R&D: R&D xem và quyết định');
    expect(screen.getByText('5 người sẽ học lại từ đầu')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Áp dụng/ })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Giữ bản hiện tại' })).toBeNull();
  });

  it('says the company is up to date when nothing waits', () => {
    renderPage({ status: 'UP_TO_DATE', currentVersionNo: 3, latestVersionNo: 3, courses: [], decidedBy: 'OWNER', canDecide: true });
    expect(screen.getByRole('heading', { name: 'Công ty đang dùng bản mới nhất (v3)' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Áp dụng/ })).toBeNull();
  });
});
