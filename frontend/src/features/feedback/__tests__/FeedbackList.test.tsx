import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { feedbackService, type FeedbackItem } from '@/services/feedback.service';
import { FeedbackList, pageNumbers } from '../components/FeedbackList';

const item = (n: number, extra: Partial<FeedbackItem> = {}): FeedbackItem => ({
  id: `f${n}`, type: 'FEEDBACK', title: `Góp ý số ${n}`, description: 'Nội dung góp ý.', status: 'OPEN',
  createdAt: '2026-11-27T08:00:00Z', ...extra,
});

function renderList(kind: 'FEEDBACK' | 'BUG' = 'FEEDBACK') {
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <FeedbackList kind={kind} />
    </QueryClientProvider>,
  );
}

describe('FeedbackList', () => {
  afterEach(() => vi.restoreAllMocks());

  it('pages on the server, ten at a time, and filters by status from page 1', async () => {
    const getMine = vi.spyOn(feedbackService, 'getMine').mockImplementation(async (params) => ({
      success: true, message: '', errors: [],
      data: {
        items: [item((params?.pageIndex ?? 1) * 10, { adminNote: 'Đã ghi nhận, sẽ sửa trong bản tới.', rating: 4 })],
        pageIndex: params?.pageIndex ?? 1, pageSize: 10, totalItems: 23, totalPages: 3,
      },
    }));
    renderList();

    expect(await screen.findByText('Góp ý số 10')).toBeInTheDocument();
    expect(getMine).toHaveBeenLastCalledWith({ type: 'FEEDBACK', status: undefined, pageIndex: 1, pageSize: 10 });
    expect(screen.getByText('Phản hồi từ DigiTalent')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Đánh giá 4/5' })).toBeInTheDocument();

    const pager = screen.getByRole('navigation', { name: 'Phân trang' });
    expect(pager).toHaveTextContent('Trang 1/3 · 23 mục');
    expect(within(pager).getByRole('button', { name: 'Trang trước' })).toBeDisabled();
    fireEvent.click(within(pager).getByRole('button', { name: 'Trang 2' }));
    expect(await screen.findByText('Góp ý số 20')).toBeInTheDocument();
    expect(getMine).toHaveBeenLastCalledWith({ type: 'FEEDBACK', status: undefined, pageIndex: 2, pageSize: 10 });

    fireEvent.click(screen.getByRole('button', { name: 'Đã giải quyết' }));
    await waitFor(() => expect(getMine).toHaveBeenLastCalledWith({ type: 'FEEDBACK', status: 'RESOLVED', pageIndex: 1, pageSize: 10 }));
    expect(screen.getByRole('button', { name: 'Đã giải quyết' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('asks for bug reports only and invites the first one when there is none', async () => {
    const getMine = vi.spyOn(feedbackService, 'getMine').mockResolvedValue({
      success: true, message: '', errors: [], data: { items: [], pageIndex: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
    });
    renderList('BUG');

    expect(await screen.findByText('Bạn chưa báo lỗi nào')).toBeInTheDocument();
    expect(getMine).toHaveBeenCalledWith(expect.objectContaining({ type: 'BUG' }));
    expect(screen.getAllByRole('button', { name: /Báo lỗi mới/ })).toHaveLength(2);
    expect(screen.queryByRole('navigation', { name: 'Phân trang' })).toBeNull();
  });

  it('keeps the first, the last and the pages around the current one', () => {
    expect(pageNumbers(1, 3)).toEqual([1, 2, 3]);
    expect(pageNumbers(5, 9)).toEqual([1, 'gap', 4, 5, 6, 'gap', 9]);
    expect(pageNumbers(1, 1)).toEqual([1]);
  });
});
