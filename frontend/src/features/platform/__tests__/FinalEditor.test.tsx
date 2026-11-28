import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { FinalEditor } from '../builder/FinalEditor';
import { platformCatalogService, type CatalogCourseDetail } from '@/services/platform-catalog.service';

it('loads existing weights and saves adjusted weights on the current version', async () => {
  const course = {
    versionNo: 3,
    courseId: 'course-1',
    final: { title: 'Bài cuối khóa', promptHtml: '', criteria: ['Nội dung (60%)', 'Minh chứng (40%)'] },
    finalRubric: [
      { title: 'Nội dung', weightPercent: 60, isRequired: false },
      { title: 'Minh chứng', weightPercent: 40, isRequired: false },
    ],
  } as CatalogCourseDetail;
  const update = vi.spyOn(platformCatalogService, 'updateFinal').mockResolvedValue(course);
  try {
    render(
      <FinalEditor course={course} editable={false} showWeights editCurrentWeights
        edit={(save) => save(course.versionNo, course.courseId)} />,
    );

    const first = screen.getByRole('spinbutton', { name: 'Trọng số tiêu chí 1' });
    expect(first).toHaveValue(60);
    const criterion = screen.getByRole('textbox', { name: 'Tiêu chí 1' });
    expect(criterion).toHaveValue('Nội dung');
    expect(criterion).toHaveAttribute('readonly');
    const save = screen.getByRole('button', { name: 'Lưu trọng số' });
    fireEvent.change(first, { target: { value: '70' } });
    expect(save).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Chia đều' }));
    fireEvent.click(save);
    await waitFor(() => expect(update).toHaveBeenCalledWith(3, 'course-1', {
      title: 'Bài cuối khóa', promptHtml: '', criteria: ['Nội dung', 'Minh chứng'],
      criterionWeights: [50, 50], expectedCriterionWeights: [60, 40],
    }));
  } finally {
    update.mockRestore();
  }
});

it('shows the old 60% total and requires redistribution in the shared R&D editor', () => {
  const course = {
    final: {
      title: 'Bài cuối khóa', promptHtml: '',
      criteria: ['Đánh giá nguồn (25%)', 'Tính khả thi (20%)', 'Trình bày (15%)'],
    },
  } as CatalogCourseDetail;
  const edit = vi.fn();
  render(<FinalEditor course={course} editable showWeights internal edit={edit} />);

  expect(screen.getByRole('spinbutton', { name: 'Trọng số tiêu chí 1' })).toHaveValue(25);
  expect(screen.getByText('60% / 100%')).toBeInTheDocument();
  const save = screen.getByRole('button', { name: 'Lưu bài cuối khóa' });
  expect(save).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Chia đều' }));
  expect(screen.getAllByRole('spinbutton').map((input) => (input as HTMLInputElement).valueAsNumber))
    .toEqual([34, 33, 33]);
  expect(save).toBeEnabled();
});
