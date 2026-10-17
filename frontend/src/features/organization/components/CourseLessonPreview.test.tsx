import { StrictMode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CourseModules } from './CourseModules';

vi.mock('@/hooks/use-assignments', () => ({ useCourseLesson: () => ({
  data: { id: 'lesson-1', title: 'Bài từ database', courseCode: 'A1-F', contentBody: '<p>Nội dung đã tải thành công.</p>', lessonType: 'TEXT', media: [] },
  isLoading: false, error: null,
}) }));

describe('Owner xem bài trong React StrictMode', () => {
  beforeEach(() => {
    if (!HTMLDialogElement.prototype.showModal) HTMLDialogElement.prototype.showModal = function () {};
    if (!HTMLDialogElement.prototype.close) HTMLDialogElement.prototype.close = function () {};
    vi.spyOn(HTMLDialogElement.prototype, 'showModal').mockImplementation(function (this: HTMLDialogElement) { this.setAttribute('open', ''); });
    vi.spyOn(HTMLDialogElement.prototype, 'close').mockImplementation(function (this: HTMLDialogElement) {
      this.removeAttribute('open');
      // Native dialog close is queued: StrictMode cleanup must not dismiss the reopened preview.
      queueMicrotask(() => this.dispatchEvent(new Event('close')));
    });
  });
  afterEach(() => { vi.restoreAllMocks(); });

  it('opens, survives the replayed cleanup, closes and can be opened again', async () => {
    render(<StrictMode><CourseModules courseCode="A1-F" modules={[{
      id: 'module-1', title: 'Mô đun', sortOrder: 1,
      lessons: [{ id: 'lesson-1', title: 'Bài từ database', lessonType: 'TEXT', sortOrder: 1 }],
    }]} /></StrictMode>);
    fireEvent.click(screen.getByRole('button', { name: /Xem bài/ }));
    await waitFor(() => expect(screen.getByRole('dialog', { name: 'Xem nội dung bài học' })).toBeVisible());
    expect(screen.getByText('Nội dung đã tải thành công.')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Đóng nội dung bài học' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Xem bài/ }));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeVisible());
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
