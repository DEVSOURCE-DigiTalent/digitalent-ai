import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { BehaviorOverview, BehaviorReportDetail, BehaviorReportItem } from '@/services/behavior-report.service';
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
  // grouped by position, whatever the department; Chi holds no position yet
  positions: [
    { positionId: 'acc', name: 'Kế toán viên', employees: 2, assessed: 2, gapsAtSurvey: 3, gapsNow: 1, peopleBelowNow: 1, domains: [] },
    { positionId: null, name: 'Chưa có vị trí', employees: 1, assessed: 0, gapsAtSurvey: 0, gapsNow: 0, peopleBelowNow: 0, domains: [] },
  ],
  people: [
    { employeeId: 'an', name: 'Trần An', departmentName: 'Kế toán', positionName: 'Kế toán viên', departmentId: 'kt', positionId: 'acc', assessed: true,
      gapsAtSurvey: 2, gapsNow: 1, levelsGained: 1, domains: [d(1, 3, 1, 2), d(2, 2, 2, 2), d(3, 1, 1, 1)] },
    { employeeId: 'binh', name: 'Lê Bình', departmentName: 'Kế toán', positionName: 'Kế toán viên', departmentId: 'kt', positionId: 'acc', assessed: true,
      gapsAtSurvey: 1, gapsNow: 0, levelsGained: 1, domains: [d(1, 3, 3, 3), d(2, 2, 1, 2), d(3, 1, 1, 1)] },
    { employeeId: 'chi', name: 'Lê Chi', departmentName: 'Marketing', positionName: null, departmentId: 'mk', positionId: null, assessed: false,
      gapsAtSurvey: 0, gapsNow: 0, levelsGained: 0, domains: [d(1, 2, null, null)] },
  ],
};

const useCapabilityProgress = vi.fn(() => ({ data: progress, isLoading: false, isError: false, refetch: vi.fn() }));
vi.mock('@/hooks/use-skill-gaps', () => ({ useCapabilityProgress: () => useCapabilityProgress() }));

// An passed the Data Intermediate final (domain 1, the level he went up to) with a high-risk exam; Bình's exam was clean.
const exam = (id: string, employeeId: string, employeeName: string, level: 'HIGH' | 'LOW', domainNumber: number, tier: number, decision: 'PASSED' | null): BehaviorReportItem => ({
  reportId: id, sessionId: `s-${id}`, employeeId, employeeName, positionName: 'Kế toán viên', departmentName: 'Kế toán',
  courseId: `c-${id}`, courseCode: `M${domainNumber}-I`, courseTitle: `Khóa ${domainNumber}.${tier}`, domainNumber, domainName: `Lĩnh vực ${domainNumber}`, tier,
  attemptNo: 1, submittedAt: '2026-11-25T09:42:00Z', durationMs: 18 * 60_000, status: 'READY', riskScore: level === 'HIGH' ? 62 : 3,
  riskLevel: level, aiLevel: level, level, summary: null, findingCount: level === 'HIGH' ? 1 : 0, decision,
  findingTitles: level === 'HIGH' ? ['Sao chép đề, rời tab rồi dán bài'] : [],
  marks: level === 'HIGH' ? [{ startMs: 180_000, endMs: 280_000, severity: 'HIGH' }] : [],
});
const behavior: BehaviorOverview = {
  counts: { all: 2, high: 1, medium: 0, low: 1, analyzing: 0, peopleHigh: 1 },
  employees: [
    { employeeId: 'an', level: 'HIGH', high: 1, medium: 0, low: 0, analyzing: 0, reports: [exam('r-an', 'an', 'Trần An', 'HIGH', 1, 2, 'PASSED')] },
    { employeeId: 'binh', level: 'LOW', high: 0, medium: 0, low: 1, analyzing: 0, reports: [exam('r-binh', 'binh', 'Lê Bình', 'LOW', 2, 2, 'PASSED')] },
  ],
};
const anDetail: BehaviorReportDetail = {
  ...behavior.employees[0]!.reports[0]!,
  summary: 'Sao chép đề, rời tab rồi dán 612 ký tự vào bài tự luận.',
  stats: { attemptNo: 1, essayChars: 660, pasteCount: 1, pastedChars: 612, pastedIntoEssayChars: 612, largePasteCount: 1, copyCount: 1,
    awayCount: 1, awayMs: 74_000, idleMs: 0, faceAlertCount: 0, faceAlertMs: 0, sourceLossCount: 0, secondScreen: false, choiceScore: 17, choiceTotal: 20 },
  risk: { score: 62, level: 'HIGH', faceCheck: 'ON', factors: [], moments: [] },
  findings: [{ startMs: 180_000, endMs: 280_000, severity: 'HIGH', title: 'Sao chép đề, rời tab rồi dán bài', explanation: 'Chuỗi sao chép → rời tab → dán.',
    events: [{ kind: 'PASTE', offsetMs: 280_000, durationMs: null, detail: 'ESSAY:612', flagged: true }] }],
  advice: 'Xem đoạn 03:00–04:40.', model: 'gemini-test', analyzedAt: '2026-11-25T09:43:00Z', errorCode: null, eventsTruncated: false,
  essayText: 'Bài làm.', recording: null,
};
const useBehaviorReport = vi.fn((id: string | undefined) => ({ data: id === 'r-an' ? anDetail : undefined, isLoading: false, isError: id !== 'r-an' }));
vi.mock('@/hooks/use-behavior-reports', () => ({
  useBehaviorOverview: () => ({ data: behavior, isLoading: false, isError: false }),
  useBehaviorReport: (id: string | undefined) => useBehaviorReport(id),
  useAnalyzeBehaviorReport: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock('@/hooks/use-permission', async (original) => ({
  ...(await original<typeof import('@/hooks/use-permission')>()),
  usePermission: () => ({ can: () => true, is: () => false, user: null }),
}));

const renderPage = () => render(<MemoryRouter><OwnerCapabilityGapPage /></MemoryRouter>);
afterEach(() => { cleanup(); useCapabilityProgress.mockClear(); });

describe('scopeView', () => {
  it('measures the share of the required level met before and after, and splits the people', () => {
    const company = scopeView(progress);
    expect(company).toMatchObject({ employees: 3, assessed: 2, metAtSurvey: 67, metNow: 83, gapsAtSurvey: 3, gapsNow: 1 });
    expect(company.people.atSurvey).toEqual({ met: 0, small: 2, large: 0, none: 1 });
    expect(company.people.now).toEqual({ met: 1, small: 1, large: 0, none: 1 });
    expect(company.domains.map((x) => [x.number, x.atSurvey, x.now, x.required])).toEqual([[1, 2, 2.5, 3], [2, 1.5, 2, 2], [3, 1, 1, 1]]);
    expect(company.needs.map((p) => p.name)).toEqual(['Trần An']);
    expect(scopeView(progress, 'none')).toMatchObject({ employees: 1, assessed: 0, metNow: null });
  });
});

describe('Khoảng trống năng lực', () => {
  it('opens on charts: share met with its rise, the domains to train first and the survey results chart', () => {
    renderPage();
    const met = screen.getByRole('region', { name: 'Mức đạt chuẩn' });
    expect(met).toHaveTextContent('83%');
    expect(met).toHaveTextContent('▲ 16');
    expect(within(met).getByRole('img', { name: 'Đạt chuẩn: lúc khảo sát 67%, hiện tại 83%' })).toBeInTheDocument();
    // the same line chart as the survey results: level now against the required level, per domain
    const results = screen.getByRole('region', { name: 'Kết quả theo lĩnh vực' });
    expect(within(results).getByRole('figure', { name: 'Biểu đồ mức hiện tại so với mức cần đạt theo lĩnh vực' })).toBeInTheDocument();
    expect(within(results).getByRole('img', { name: /^Lĩnh vực 1 Lĩnh vực 1: hiện tại 2,5, cần đạt 3,0/ })).toBeInTheDocument();
    // beside it, where training pays first: An is below in data (1 of the 2 people compared)
    const priority = screen.getByRole('region', { name: 'Lĩnh vực cần ưu tiên' });
    expect(within(priority).getAllByRole('listitem').map((li) => li.textContent)).toEqual(['1Dữ liệu1/2 người chưa đạt']);
    expect(within(priority).getByRole('link', { name: /Xem khóa học/ })).toHaveAttribute('href', '/enterprise/courses');
    // which ring is which level, outside the plot
    expect(screen.getByRole('list', { name: 'Các vòng của biểu đồ' })).toHaveTextContent('Vòng ngoài: Nâng cao');
  });

  it('the radar names every domain; pointing at one shows before, now and required', () => {
    renderPage();
    const radar = screen.getByRole('region', { name: 'Năng lực theo lĩnh vực' });
    const label = within(radar).getByRole('button', { name: /^Lĩnh vực 1: lúc khảo sát 2, hiện tại 2,5, cần đạt 3/ });
    fireEvent.mouseEnter(label);
    expect(within(radar).getByRole('status')).toHaveTextContent('Hiện tại: Nâng cao (2,5)');
  });

  it('a position scopes every chart to it; again on it goes back to the company', () => {
    renderPage();
    const kt = screen.getByRole('button', { name: 'Kế toán viên: đạt chuẩn 67% lúc khảo sát, 83% hiện tại' });
    expect(screen.getByRole('button', { name: 'Chưa có vị trí: chưa có kết quả' })).toBeInTheDocument();
    fireEvent.click(kt);
    expect(kt).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Bỏ lọc Kế toán viên' })).toBeInTheDocument();
    expect(screen.getByText('2/2 có kết quả')).toBeInTheDocument();
    fireEvent.click(kt);
    expect(screen.getByText('2/3 có kết quả')).toBeInTheDocument();
  });

  it('highlights who needs help; everyone stays behind one button', () => {
    renderPage();
    // no "who moved most" strip: the radar and the people list already show who went up
    expect(screen.queryByRole('region', { name: 'Tiến bộ nhiều nhất' })).toBeNull();
    // in plain words: the most urgent domain, how many domains are still below
    const need = screen.getByRole('region', { name: 'Cần hỗ trợ' });
    expect(within(need).getByRole('button', { name: /Trần An/ })).toHaveTextContent('Dữ liệu: Trung cấp → cần Nâng caoChưa đạt 1/3 lĩnh vựcThi: rủi ro cao');
    expect(screen.queryByRole('button', { name: /^LC Lê Chi/ })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Tất cả nhân viên \(3\)/ }));
    const people = screen.getByRole('region', { name: 'Tất cả nhân viên' });
    expect(within(people).getByRole('button', { name: /Lê Chi/ })).toHaveTextContent('Chưa có kết quả khảo sát');
    expect(within(people).getByRole('button', { name: /Lê Bình/ })).not.toHaveTextContent('Thi:');
  });

  it('puts exam behavior beside the levels: the strip, then one person with levels, finals and the replay', () => {
    renderPage();
    const strip = screen.getByRole('region', { name: 'Hành vi khi thi' });
    const levels = within(strip).getByRole('group', { name: 'Xem người theo mức' });
    // the three levels always show, a level without exams stays visible but cannot open an empty list
    expect(within(levels).getByRole('button', { name: '0 bài cần xem lại' })).toBeDisabled();
    // one level → the people with a final at that level: their level now and where it looks suspicious
    fireEvent.click(within(levels).getByRole('button', { name: '1 bài rủi ro cao' }));
    const high = within(strip).getByRole('list', { name: 'Người có bài rủi ro cao' });
    const row = within(high).getByRole('button', { name: /Trần An/ });
    expect(within(row).getByRole('img', {
      name: 'Mức hiện tại: Dữ liệu Trung cấp, cần Nâng cao, có bài thi đáng ngờ; Giao tiếp Trung cấp, đã đạt mức cần; Sáng tạo Cơ bản, đã đạt mức cần',
    })).toBeInTheDocument();
    expect(row).toHaveTextContent('Đạt 2/3 lĩnh vực');
    // the flagged final names its domain, the level reached there and why it looks suspicious
    expect(row).toHaveTextContent('Dữ liệu · bài Trung cấphiện tại Trung cấp, cần Nâng caoSao chép đề, rời tab rồi dán bài');
    // the tiles explain themselves once, above the list
    expect(strip).toHaveTextContent('Mức hiện tại 6 lĩnh vực:đạt mức cầnchưa đạtchưa có kết quảcó bài thi đáng ngờ');
    expect(within(high).queryByRole('button', { name: /Lê Bình/ })).toBeNull();
    fireEvent.click(within(levels).getByRole('button', { name: '1 bài bình thường' }));
    expect(within(strip).getByRole('list', { name: 'Người có bài bình thường' })).toHaveTextContent('Lê Bình');
    fireEvent.click(within(levels).getByRole('button', { name: '1 bài rủi ro cao' }));
    fireEvent.click(within(within(strip).getByRole('list', { name: 'Người có bài rủi ro cao' })).getByRole('button', { name: /Trần An/ }));

    const panel = screen.getByRole('dialog', { name: 'Trần An' });
    expect(within(panel).getByRole('link', { name: /Chi tiết khoảng trống/ })).toHaveAttribute('href', '/enterprise/skill-gap/an');
    expect(within(panel).getByRole('group', { name: 'Đáng ngờ ở' })).toHaveTextContent('Dữ liệu · Trung cấpSao chép đề, rời tab rồi dán bài');
    // the Data level he reached came through the flagged exam
    const data = within(panel).getByRole('img', { name: 'Dữ liệu: lúc khảo sát Cơ bản, hiện tại Trung cấp, cần Nâng cao' }).closest('li')!;
    expect(within(data).getByRole('button', { name: 'Thi: rủi ro cao' })).toHaveAttribute('title', 'Mức hiện tại đạt qua bài thi rủi ro cao');
    expect(within(panel).getByRole('button', { name: /Khóa 1\.2/ })).toHaveAttribute('aria-pressed', 'true');
    // an exam row says why in words (the AI's main finding) instead of a strip of marks
    expect(within(panel).getByRole('button', { name: /Khóa 1\.2/ })).toHaveTextContent('Sao chép đề, rời tab rồi dán bài · 18 phút 0 giây làm bài');
    expect(useBehaviorReport).toHaveBeenLastCalledWith('r-an');
    expect(within(panel).getByText('Sao chép đề, rời tab rồi dán 612 ký tự vào bài tự luận.')).toBeInTheDocument();
    expect(within(panel).getByText('Dán 612 ký tự · 93% bài tự luận')).toBeInTheDocument();

    const finding = within(panel).getByRole('button', { name: /^1\. Sao chép đề/ });
    fireEvent.click(within(panel).getByRole('button', { name: /Xem đoạn 03:00–04:40/ }));
    expect(finding).toHaveAttribute('aria-current', 'true');

    fireEvent.click(within(panel).getByRole('button', { name: 'Đóng' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('without any survey result it says so instead of empty charts', () => {
    useCapabilityProgress.mockReturnValueOnce({ data: { ...progress, people: progress.people.map((p) => ({ ...p, assessed: false })) }, isLoading: false, isError: false, refetch: vi.fn() });
    renderPage();
    expect(screen.getByText('Chưa có kết quả khảo sát để so sánh')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Mức đạt chuẩn' })).toBeNull();
  });
});
