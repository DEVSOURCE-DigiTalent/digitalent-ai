import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SeverityBadge } from '../components/SeverityBadge';
import { CompetencyRadarChart } from '../components/CompetencyRadarChart';
import { toChartData } from '../utils/chart-data';
import type { SkillGapItem } from '@/services/intelligence.service';

const item = (overrides: Partial<SkillGapItem>): SkillGapItem => ({
  competencyId: 'c-1',
  competencyCode: 'DATA_LITERACY',
  competencyName: 'Data literacy',
  categoryName: 'Digital core',
  requiredLevel: 3,
  currentLevel: 1,
  gapSteps: 2,
  weightPercent: 30,
  mandatory: true,
  mandatoryMultiplier: 1.5,
  priorityScore: 90,
  severity: 'HIGH',
  ...overrides,
});

describe('SeverityBadge', () => {
  it.each([
    ['HIGH', 'High'],
    ['MEDIUM', 'Medium'],
    ['LOW', 'Low'],
    [null, 'Met'],
  ] as const)('renders %s as "%s"', (severity, label) => {
    render(<SeverityBadge severity={severity} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});

describe('CompetencyRadarChart', () => {
  it('maps items to required / confirmed series, treating unconfirmed as 0', () => {
    const data = toChartData([item({}), item({ competencyId: 'c-2', competencyName: 'Security', currentLevel: null })]);

    expect(data).toEqual([
      { competency: 'Data literacy', required: 3, confirmed: 1 },
      { competency: 'Security', required: 3, confirmed: 0 },
    ]);
  });

  it('falls back to a bar chart when fewer than 3 competencies', () => {
    render(<CompetencyRadarChart items={[item({}), item({ competencyId: 'c-2' })]} />);
    expect(screen.getByTestId('competency-bar-chart')).toBeInTheDocument();
  });

  it('uses a radar chart from 3 competencies', () => {
    const items = ['a', 'b', 'c'].map((id) => item({ competencyId: id, competencyName: id }));
    render(<CompetencyRadarChart items={items} />);
    expect(screen.getByTestId('competency-radar-chart')).toBeInTheDocument();
  });
});
