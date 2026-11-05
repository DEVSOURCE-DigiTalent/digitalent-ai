import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SkillGapDetailDashboard } from '../components/SkillGapDetailDashboard';
import type { SkillGapRunDetail } from '@/services/intelligence.service';

const items: SkillGapRunDetail['items'] = Array.from({ length: 8 }, (_, index) => ({
  competencyId: `c-${index}`,
  competencyCode: `C-${index}`,
  competencyName: `Năng lực ${index + 1}`,
  categoryName: index < 4 ? 'Dữ liệu' : 'An toàn',
  frameworkCode: `${index < 4 ? 1 : 4}.${index + 1}`,
  requiredLevel: 2,
  currentLevel: index === 7 ? 2 : 1,
  gapSteps: index === 7 ? 0 : 1,
  weightPercent: 12.5,
  mandatory: false,
  mandatoryMultiplier: 1,
  priorityScore: 8 - index,
  severity: index === 7 ? null : 'MEDIUM',
}));

const run = {
  items,
  summary: { totalRequired: 8, totalMet: 1, totalGap: 7, highCount: 0, mediumCount: 7, lowCount: 0, coveragePercent: 12.5, config: { mandatoryMultiplier: 1.5 } },
} as SkillGapRunDetail;

describe('SkillGapDetailDashboard', () => {
  it('paginates and filters competencies without expanding the page', () => {
    render(<MemoryRouter><SkillGapDetailDashboard run={run} /></MemoryRouter>);
    expect(screen.getAllByRole('article')).toHaveLength(6);
    fireEvent.click(screen.getByRole('button', { name: 'Sau' }));
    expect(screen.getByText('Năng lực 7')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox', { name: 'Lọc theo lĩnh vực' }), { target: { value: 'Dữ liệu' } });
    expect(screen.getAllByRole('article')).toHaveLength(4);
    fireEvent.click(screen.getByRole('button', { name: /Đã đạt/ }));
    expect(screen.getByText('Không có năng lực trong bộ lọc này.')).toBeInTheDocument();
  });
});
