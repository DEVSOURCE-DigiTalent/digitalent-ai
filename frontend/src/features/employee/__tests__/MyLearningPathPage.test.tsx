import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { MyLearningPathPage } from '../pages/MyLearningPathPage';

vi.mock('@/hooks/use-assignments', () => ({
  useCourses: () => ({ data: { items: [] }, isLoading: false }),
}));

vi.mock('@/hooks/use-skill-gaps', () => ({
  useMySkillGap: () => ({
    data: { jobPositionName: 'Chuyên viên CRM' },
    isLoading: false,
  }),
}));

describe('MyLearningPathPage', () => {
  it('keeps the regular employee learning path available outside the trial workspace', () => {
    render(
      <MemoryRouter initialEntries={['/enterprise/me/learning-path']}>
        <MyLearningPathPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: /Lộ trình học tập của tôi/ })).toBeInTheDocument();
    expect(screen.getByText(/Chuyên viên CRM/)).toBeInTheDocument();
    expect(screen.getByText('Giao tiếp số cơ bản nơi công sở')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Tiếp tục học \(45%\)/ })).toHaveAttribute(
      'href',
      '/enterprise/me/courses/crs-A4-I',
    );
  });
});
