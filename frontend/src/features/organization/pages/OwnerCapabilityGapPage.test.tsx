import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { CapabilityProgress, CapabilityProgressEmployeeDomain } from '@/services/intelligence.service';
import { scopeView } from '../lib/capability-progress';
import { OwnerCapabilityGapPage } from './OwnerCapabilityGapPage';

const d = (number: number, required: number, atSurvey: number | null, now: number | null): CapabilityProgressEmployeeDomain =>
  ({ categoryId: `c${number}`, number, name: `Lĩnh vực ${number}`, required, atSurvey, now });

// An: gained 1 in domain 1 (1 → 2 of 3). Bình: gained 1 in domain 2 (1 → 2 of 2), now meets everything. Chi: no survey.
const progress: CapabilityProgress = {
  surveyedAt: '2026-11-18T10:00:00Z', employees: 3, assessed: 2,
  totals: { gapsAtSurvey: 3, gapsNow: 1, peopleBelowAtSurvey: 2, peopleBelowNow: 1, peopleMet: 1 },
  domains: [1, 2, 3].map((n) => ({ categoryId: `c${n}`, number: n, name: `Lĩnh vực ${n}`, required: null, atSurvey: null, now: null, assessed: 0, belowAtSurvey: 0, belowNow: 0 })),
  departments: [
    { departmentId: 'kt', name: 'Kế toán', employees: 2, assessed: 2, gapsAtSurvey: 3, gapsNow: 1, peopleBelowNow: 1, domains: [] },
    { departmentId: 'mk', name: 'Marketing', employees: 1, assessed: 0, gapsAtSurvey: 0, gapsNow: 0, peopleBelowNow: 0, domains: [] },
  ],
  people: [
    { employeeId: 'an', name: 'Trần An', departmentName: 'Kế toán', positionName: 'Kế toán viên', departmentId: 'kt', assessed: true,
      gapsAtSurvey: 2, gapsNow: 1, levelsGained: 1, domains: [d(1, 3, 1, 2), d(2, 2, 2, 2), d(3, 1, 1, 1)] },
    { employeeId: 'binh', name: 'Lê Bình', departmentName: 'Kế toán', positionName: 'Kế toán viên', departmentId: 'kt', assessed: true,
      gapsAtSurvey: 1, gapsNow: 0, levelsGained: 1, domains: [d(1, 3, 3, 3), d(2, 2, 1, 2), d(3, 1, 1, 1)] },
    { employeeId: 'chi', name: 'Lê Chi', departmentName: 'Marketing', positionName: null, departmentId: 'mk', assessed: false,
      gapsAtSurvey: 0, gapsNow: 0, levelsGained: 0, domains: [d(1, 2, null, null)] },
  ],
};

const useCapabilityProgress = vi.fn(() => ({ data: progress, isLoading: false, isError: false, refetch: vi.fn() }));
vi.mock('@/hooks/use-skill-gaps', () => ({ useCapabilityProgress: () => useCapabilityProgress() }));

const renderPage = () => render(<MemoryRouter><OwnerCapabilityGapPage /></MemoryRouter>);
afterEach(() => { cleanup(); useCapabilityProgress.mockClear(); });

describe('scopeView', () => {
  it('measures the share of the required level met before and after, and splits the people', () => {
    const company = scopeView(progress);
    expect(company).toMatchObject({ employees: 3, assessed: 2, metAtSurvey: 67, metNow: 83, gapsAtSurvey: 3, gapsNow: 1 });
    expect(company.people.atSurvey).toEqual({ met: 0, small: 2, large: 0, none: 1 });
    expect(company.people.now).toEqual({ met: 1, small: 1, large: 0, none: 1 });
    expect(company.domains.map((x) => [x.number, x.atSurvey, x.now, x.required])).toEqual([[1, 2, 2.5, 3], [2, 1.5, 2, 2], [3, 1, 1, 1]]);
    expect(company.gainers.map((p) => p.name)).toEqual(['Lê Bình', 'Trần An']);
    expect(company.needs.map((p) => p.name)).toEqual(['Trần An']);
    expect(scopeView(progress, 'mk')).toMatchObject({ employees: 1, assessed: 0, metNow: null });
  });
});

describe('Khoảng trống năng lực', () => {
  it('opens on charts: share met with its rise, people before → now, levels closed', () => {
    renderPage();
    const met = screen.getByRole('region', { name: 'Mức đạt chuẩn' });
    expect(met).toHaveTextContent('83%');
    expect(met).toHaveTextContent('▲ 16');
    expect(within(met).getByRole('img', { name: 'Đạt chuẩn: lúc khảo sát 67%, hiện tại 83%' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /^Hiện tại: Đạt đủ 1, Thiếu 1–2 cấp 1/ })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Khoảng trống' })).toHaveTextContent('2cấp đã đóng');
  });

  it('the radar names every domain; pointing at one shows before, now and required', () => {
    renderPage();
    const radar = screen.getByRole('region', { name: 'Năng lực theo lĩnh vực' });
    const label = within(radar).getByRole('button', { name: /^Lĩnh vực 1: lúc khảo sát 2, hiện tại 2,5, cần đạt 3/ });
    fireEvent.mouseEnter(label);
    expect(within(radar).getByRole('status')).toHaveTextContent('Hiện tại: Nâng cao (2,5)');
  });

  it('a department scopes every chart to it; again on it goes back to the company', () => {
    renderPage();
    const kt = screen.getByRole('button', { name: 'Kế toán: đạt chuẩn 67% lúc khảo sát, 83% hiện tại' });
    expect(screen.getByRole('button', { name: 'Marketing: chưa có kết quả' })).toBeInTheDocument();
    fireEvent.click(kt);
    expect(kt).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Bỏ lọc Kế toán' })).toBeInTheDocument();
    expect(screen.getByText('2/2 có kết quả')).toBeInTheDocument();
    fireEvent.click(kt);
    expect(screen.getByText('2/3 có kết quả')).toBeInTheDocument();
  });

  it('highlights who moved most and who needs help; everyone stays behind one button', () => {
    renderPage();
    const up = screen.getByRole('region', { name: 'Tiến bộ nhiều nhất' });
    expect(within(up).getAllByRole('link').map((a) => a.textContent)).toEqual([expect.stringContaining('Lê Bình'), expect.stringContaining('Trần An')]);
    const need = screen.getByRole('region', { name: 'Cần hỗ trợ' });
    expect(within(need).getByRole('link', { name: /Trần An/ })).toHaveAttribute('href', '/enterprise/skill-gap/an');
    expect(screen.queryByRole('link', { name: /Lê Chi/ })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Tất cả nhân viên \(3\)/ }));
    expect(screen.getByRole('link', { name: /Lê Chi/ })).toHaveTextContent('Chưa có kết quả khảo sát');
  });

  it('without any survey result it says so instead of empty charts', () => {
    useCapabilityProgress.mockReturnValueOnce({ data: { ...progress, people: progress.people.map((p) => ({ ...p, assessed: false })) }, isLoading: false, isError: false, refetch: vi.fn() });
    renderPage();
    expect(screen.getByText('Chưa có kết quả khảo sát để so sánh')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Mức đạt chuẩn' })).toBeNull();
  });
});
