import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CourseModules } from './CourseModules';

describe('Nội dung khóa học', () => {
  it('chỉ hiển thị chương đang mở và chia bài học thành từng trang', () => {
    const lessons = Array.from({ length: 11 }, (_, index) => ({
      id: `lesson-${index + 1}`,
      title: `Bài học ${index + 1}`,
      lessonType: 'TEXT',
      sortOrder: index + 1,
    }));
    render(<CourseModules modules={[
      { id: 'module-1', title: 'Chương một', sortOrder: 1, lessons },
      { id: 'module-2', title: 'Chương hai', sortOrder: 2, lessons: [{ ...lessons[0], id: 'other-lesson', title: 'Bài chương hai' }] },
    ]} />);

    expect(screen.getByText('Bài học 1')).toBeVisible();
    expect(screen.queryByText('Bài học 7')).not.toBeInTheDocument();
    expect(screen.queryByText('Bài chương hai')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Sau' }));
    expect(screen.getByText('Bài học 7')).toBeVisible();
    expect(screen.queryByText('Bài học 1')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Chương hai/ }));
    expect(screen.getByText('Bài chương hai')).toBeVisible();
    expect(screen.queryByText('Bài học 7')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Chương hai/ }));
    expect(screen.queryByText('Bài chương hai')).not.toBeInTheDocument();
  });
});
