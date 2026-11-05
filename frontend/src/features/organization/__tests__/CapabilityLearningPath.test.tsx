import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CapabilityLearningPath } from '../components/CapabilityLearningPath';
import type { CompetencyGapRow } from '@/services/analytics.service';

const competencies: CompetencyGapRow[] = Array.from({ length: 8 }, (_, index) => ({
  competencyId: String(index + 1),
  frameworkCode: `1.${index + 1}`,
  name: `Năng lực ${index + 1}`,
  categoryName: index < 4 ? 'Dữ liệu' : 'An toàn',
  employeesRequired: 3,
  employeesWithGap: index === 7 ? 0 : 2,
  highCount: index === 6 ? 2 : 0,
  mediumCount: index === 7 ? 0 : 2,
  lowCount: 0,
  averageRequiredLevel: 2.5,
  averageCurrentLevel: 1.5,
}));

describe('CapabilityLearningPath', () => {
  it('prioritizes high gaps and keeps the list paginated', () => {
    render(<MemoryRouter><CapabilityLearningPath competencies={competencies} isLoading={false} /></MemoryRouter>);
    const rows = screen.getAllByRole('article');
    expect(rows).toHaveLength(6);
    expect(within(rows[0]).getByText('Năng lực 7')).toBeTruthy();
    expect(within(rows[0]).getByRole('link', { name: 'Xem khóa học cho Năng lực 7' }).getAttribute('href')).toBe('/enterprise/courses?gap=1.7&level=3');
    fireEvent.click(screen.getByRole('button', { name: 'Sau' }));
    expect(screen.getByText('Năng lực 6')).toBeTruthy();
  });

  it('filters by category and switches to met competencies', () => {
    render(<MemoryRouter><CapabilityLearningPath competencies={competencies} isLoading={false} /></MemoryRouter>);
    fireEvent.click(screen.getByRole('combobox', { name: 'Lọc theo lĩnh vực năng lực' }));
    fireEvent.click(screen.getByRole('option', { name: 'Dữ liệu' }));
    expect(screen.getAllByRole('article')).toHaveLength(4);
    fireEvent.click(screen.getByRole('combobox', { name: 'Lọc theo lĩnh vực năng lực' }));
    fireEvent.click(screen.getByRole('option', { name: 'Mọi lĩnh vực' }));
    fireEvent.click(screen.getByRole('button', { name: /Đạt chuẩn/ }));
    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.getByText('Năng lực 8')).toBeTruthy();
  });
});
