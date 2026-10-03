import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { SeverityBadge } from '../components/SeverityBadge';
import { CompetencyRadarChart } from '../components/CompetencyRadarChart';
import { SkillGapTable } from '../components/SkillGapTable';
import { SkillGapDetailView } from '../components/SkillGapDetailView';
import { toChartData } from '../utils/chart-data';
import type { SkillGapItem, SkillGapRunDetail } from '@/services/intelligence.service';

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
    ['HIGH', 'Cao'],
    ['MEDIUM', 'Trung bình'],
    ['LOW', 'Thấp'],
    [null, 'Đạt'],
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

const domainItem = (code: string, required: number, current: number, priority: number) =>
  item({
    competencyId: `c-${code}`,
    competencyCode: `TT02-${code}`,
    competencyName: `Competency ${code}`,
    frameworkCode: code,
    categoryName: `${code[0]}. Domain ${code[0]}`,
    categorySortOrder: Number(code[0]),
    requiredLevel: required,
    currentLevel: current,
    gapSteps: Math.max(0, required - current),
    priorityScore: priority,
    severity: required - current >= 2 ? 'HIGH' : required - current === 1 ? 'MEDIUM' : null,
  });

const DOMAIN_ITEMS = [
  domainItem('4.1', 3, 1, 12.51),
  domainItem('4.2', 3, 2, 6.26),
  domainItem('3.1', 1, 1, 0),
  domainItem('1.1', 3, 1, 16.68),
];

describe('SkillGapTable grouped by domain', () => {
  it('shows one collapsible group per domain with a "Miền đã đạt" badge only when every line is met', () => {
    render(<SkillGapTable items={DOMAIN_ITEMS} />);

    const domain4 = screen.getByRole('button', { name: /4\. Domain 4/ });
    expect(domain4).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByText('Miền đã đạt')).toHaveLength(1);
    expect(screen.getByText('4.2 Competency 4.2')).toBeInTheDocument();

    fireEvent.click(domain4);

    expect(domain4).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('4.2 Competency 4.2')).not.toBeInTheDocument();
    expect(screen.getByText('1.1 Competency 1.1')).toBeInTheDocument();
  });
});

describe('SkillGapDetailView', () => {
  it('charts by domain with the average level once the standard spans 3 domains', () => {
    const run = {
      runId: 'r-1', employeeId: 'e-1', employeeCode: 'EMP-1', employeeName: 'Employee', requirementSetVersionNo: 1,
      generatedAt: '2026-09-29T15:39:31Z', generatedBy: 'SYSTEM', gapCount: 3, highCount: 2, coveragePercent: 54.17,
      requirementSetId: 's-1', calculationVersion: 'SG-2.0', jobPositionName: 'Kế toán',
      summary: { totalRequired: 4, totalMet: 1, totalGap: 3, highCount: 2, mediumCount: 1, lowCount: 0, coveragePercent: 54.17, config: { mandatoryMultiplier: 1.5 } },
      items: DOMAIN_ITEMS,
    } as SkillGapRunDetail;

    render(<SkillGapDetailView run={run} />);

    expect(screen.getByText('Trình độ yêu cầu và trình độ đã xác nhận trung bình theo miền')).toBeInTheDocument();
    expect(screen.getByTestId('competency-radar-chart')).toBeInTheDocument();
    expect(screen.getByText(/29\/09\/2026/)).toBeInTheDocument();
  });
});
