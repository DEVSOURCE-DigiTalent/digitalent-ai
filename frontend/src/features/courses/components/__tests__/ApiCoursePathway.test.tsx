import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ApiCoursePathway } from '../ApiCoursePathway';
import type { CourseDetailDto } from '@/services/assignment.service';

vi.mock('@/hooks/use-assignments', () => ({
  useCourses: () => ({ data: undefined }),
  useCourseLesson: () => ({ data: { contentBody: '### Mục tiêu học tập\n- Hiểu khái niệm cơ bản' }, isLoading: false, isError: false }),
}));

describe('ApiCoursePathway', () => {
  it('orders modules and real lessons by sortOrder, numbers each module, and hides raw lesson types', () => {
    const course = {
      id: 'course-1', code: 'A1-F', title: 'Khóa học chuẩn', level: 1, status: 'PUBLISHED',
      modules: [
        { id: 'module-2', title: 'Học phần 2: Đánh giá dữ liệu', sortOrder: 2, lessons: [
          { id: 'lesson-3', title: 'Câu hỏi ôn tập', lessonType: 'QUIZ', sortOrder: 1, estimatedMinutes: 10 },
        ] },
        { id: 'module-1', title: 'Học phần 1: Nghiên cứu đa nguồn', sortOrder: 1, lessons: [
          { id: 'lesson-2', title: 'Nội dung bài học', lessonType: 'TEXT', sortOrder: 2, estimatedMinutes: 15 },
          { id: 'lesson-1', title: 'Mục tiêu và khái niệm', lessonType: 'TEXT', sortOrder: 1, estimatedMinutes: 15 },
        ] },
      ],
    } as CourseDetailDto;

    render(<MemoryRouter><ApiCoursePathway course={course} /></MemoryRouter>);

    const pathway = within(screen.getByRole('complementary', { name: 'Lộ trình bài học' }));
    const labels = pathway.getAllByRole('button').map((button) => button.textContent);
    expect(labels[0]).toContain('Bài 1: Mục tiêu và khái niệm');
    expect(labels[1]).toContain('Bài 2: Nội dung bài học');
    expect(labels[2]).toContain('Bài 1: Câu hỏi ôn tập');
    expect(pathway.getByText('Học phần 1: Nghiên cứu đa nguồn')).toBeDefined();
    expect(pathway.getByText('Học phần 2: Đánh giá dữ liệu')).toBeDefined();
    expect(pathway.queryByText(/\b(TEXT|QUIZ)\b/)).toBeNull();
    expect(pathway.getByText('3 bài')).toBeDefined();
    const content = within(screen.getByRole('region', { name: 'Nội dung bài học' }));
    expect(content.getByRole('heading', { name: 'Mục tiêu học tập' })).toBeDefined();
    expect(content.getByText('Hiểu khái niệm cơ bản')).toBeDefined();
    expect(screen.getByText('Video bài học đang được cập nhật')).toBeDefined();

    fireEvent.click(pathway.getAllByRole('button')[1]);
    expect(screen.getByRole('heading', { name: 'Bài 2: Nội dung bài học' })).toBeDefined();
  });
});
