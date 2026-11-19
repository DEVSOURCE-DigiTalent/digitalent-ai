import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CompetencyReport, Steps } from '../components/OwnerTrialUi';
import { TrialDisclosure } from '../components/TrialDisclosure';
import type { TrialEmployeeDomainDetail, TrialReport } from '@/services/trial-program.service';

afterEach(cleanup);

const report: TrialReport = {
  assessed: 12,
  domains: [],
  summary: [{ categoryId: 'data', number: 1, name: 'Dữ liệu', counts: [0, 12, 0, 0], average: 1, level: 1 }],
  employees: Array.from({ length: 12 }, (_, index) => ({ employeeId: String(index), fullName: `Nhân viên ${String(index + 1).padStart(2, '0')}`, levels: [1, 1, 1, 1, 1, 1], choiceScore: 60, choiceTotal: 90 })),
};

function comparedDomain(categoryId: string, level: number, targetLevel: number): TrialEmployeeDomainDetail {
  return {
    categoryId, number: 2, name: 'Giao tiếp', level, targetLevel, skillGap: Math.max(0, targetLevel - level),
    levelLabel: '', statusText: '', gapText: '', recommendedCourse: '',
    basicCorrect: 0, basicTotal: 0, intermediateCorrect: 0, intermediateTotal: 0, advancedCorrect: 0, advancedTotal: 0,
    suggestedLevel: level,
  };
}

describe('owner assessment interactions', () => {
  it('prioritizes the domain with the most staff below their position standard', () => {
    const priorityReport = { ...report, employees: report.employees.map((employee, index) => ({
      ...employee,
      domainDetails: [comparedDomain('data', 1, 1), comparedDomain('communication', index < 8 ? 0 : 1, 1), comparedDomain('safety', 3, 3)],
    })), summary: [...report.summary,
      { categoryId: 'communication', number: 2, name: 'Giao tiếp', counts: [8, 4, 0, 0], average: 0.3, level: 0 },
      { categoryId: 'safety', number: 4, name: 'An toàn', counts: [0, 0, 0, 12], average: 3, level: 3 },
    ] };
    render(<MemoryRouter><CompetencyReport report={priorityReport} /></MemoryRouter>);
    // The domain table is the report's first block: no separate overview panel above it.
    // With everyone's results in, no coverage line under the title (it only appears as a low-coverage warning).
    const table = within(screen.getByRole('region', { name: 'Kết quả theo lĩnh vực' }));
    expect(table.queryByText('12/12 người')).not.toBeInTheDocument();
    expect(table.queryByText(/câu trắc nghiệm mỗi lĩnh vực/)).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Kết quả chung' })).not.toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Mức hiện tại' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Mức cần đạt' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Kết quả từng người', exact: true })).toBeInTheDocument();
    // Compact rows: the company's current level next to the required one; no "train first" tag any more.
    const priority = within(screen.getByRole('button', { name: 'Chi tiết Giao tiếp' }).closest('tr')!);
    expect(priority.getByRole('button', { name: 'Chi tiết Giao tiếp' })).toHaveAttribute('aria-expanded', 'false');
    expect(priority.getByText('Chưa đạt Cơ bản').closest('[data-tone]')).toHaveAttribute('data-tone', 'below');
    expect(priority.getByText('Cơ bản')).toBeInTheDocument();
    expect(screen.queryByText('Ưu tiên học trước')).not.toBeInTheDocument();
    // Everyone is in one (unnamed) department, so there is nothing to filter.
    expect(screen.queryByRole('combobox', { name: 'Lọc theo phòng ban' })).not.toBeInTheDocument();
    // The company's courses sit in the row: Giao tiếp needs the Basic course; the two domains everyone meets need none.
    expect(screen.getByRole('columnheader', { name: 'Khóa nên học' })).toBeInTheDocument();
    expect(priority.getByRole('link', { name: /Khóa Cơ bản/ })).toHaveAttribute('href', '/enterprise/courses?focus=M2-F&level=1');
    expect(screen.getAllByText('Không cần thêm khóa')).toHaveLength(2);
    // "Chi tiết": a summary tile (how many are below the standard, split below / met) and a column chart of people per level.
    fireEvent.click(priority.getByRole('button', { name: /Chi tiết/ }));
    const detail = within(document.getElementById('trial-domain-detail-communication')!);
    expect(detail.getByText('8/12')).toBeInTheDocument();
    expect(detail.getByText('Chưa đạt chuẩn Cơ bản')).toBeInTheDocument();
    expect(detail.getByText('8 dưới chuẩn')).toBeInTheDocument();
    expect(detail.getByText('4 đạt chuẩn')).toBeInTheDocument();
    expect(detail.getByText('8 người')).toBeInTheDocument();
    expect(detail.getByText('4 người, mức chuẩn vị trí')).toBeInTheDocument();
    expect(detail.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /M4-/ })).not.toBeInTheDocument();
    expect(screen.queryByText(/câu đúng trên tổng số/)).not.toBeInTheDocument();
  });

  it('warns that a small share of submissions cannot describe the whole team', () => {
    render(<MemoryRouter><CompetencyReport report={{ ...report, assessed: 1, employees: report.employees.slice(0, 1) }} participantCount={6} provisional /></MemoryRouter>);
    const table = within(screen.getByRole('region', { name: 'Kết quả theo lĩnh vực' }));
    expect(table.getByText('1/6 người')).toBeInTheDocument();
    expect(table.getByText('Chưa đủ để kết luận cho cả đội')).toBeInTheDocument();
    expect(table.getByText('Tạm thời · tự cập nhật khi có thêm bài nộp')).toBeInTheDocument();
    // Without position standards there is nothing to compare: a link to set the standard instead.
    expect(screen.getByRole('link', { name: /Đặt mức cho phòng ban/ })).toHaveAttribute('href', '/enterprise/setup?tab=departments');
  });
  it('suggests M2-A only when the position requires advanced level', () => {
    const summary = { categoryId: 'communication', number: 2, name: 'Giao tiếp', counts: [0, 0, 1, 0], average: 2, level: 2 };
    const result = (target: number): TrialReport => ({
      ...report, assessed: 1, summary: [summary],
      employees: [{ ...report.employees[0], domainDetails: [comparedDomain('communication', 2, target)] }],
    });
    const view = render(<MemoryRouter><CompetencyReport report={result(2)} /></MemoryRouter>);
    expect(screen.getByRole('columnheader', { name: 'Mức cần đạt' })).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Mức trung bình' })).not.toBeInTheDocument();
    // Current level (Trung cấp, meets the standard) next to the required level (Trung cấp).
    expect(within(screen.getByRole('table')).getAllByText('Trung cấp')).toHaveLength(2);
    expect(screen.queryByRole('columnheader', { name: 'Đạt chuẩn vị trí' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /M2-A/ })).not.toBeInTheDocument();

    view.rerender(<MemoryRouter><CompetencyReport report={result(3)} /></MemoryRouter>);
    expect(within(screen.getByRole('table')).getByRole('link', { name: /M2-A/ }))
      .toHaveAttribute('href', '/enterprise/courses?focus=M2-A&level=3');
  });

  it('lists every course from the next level up to a higher standard, in order', () => {
    // Courses are chained, so a person at Cơ bản with a Nâng cao standard needs Trung cấp then Nâng cao.
    const summary = { categoryId: 'data', number: 1, name: 'Dữ liệu', counts: [0, 1, 0, 0], average: 1, level: 1 };
    render(<MemoryRouter><CompetencyReport report={{
      ...report, assessed: 1, summary: [summary],
      employees: [{ ...report.employees[0], domainDetails: [comparedDomain('data', 1, 3)] }],
    }} /></MemoryRouter>);
    const path = screen.getByRole('list', { name: 'Khóa cần học, lần lượt' });
    expect(within(path).getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual([
      '/enterprise/courses?focus=M1-I&level=2',
      '/enterprise/courses?focus=M1-A&level=3',
    ]);
    expect(within(path).getByRole('link', { name: /Khóa Trung cấp/ })).toBeInTheDocument();
  });

  it('filters the domain table by department and recomputes levels and courses', () => {
    const summary = { categoryId: 'data', number: 1, name: 'Dữ liệu', counts: [1, 1, 1, 0], average: 1, level: 1 };
    const person = (id: string, departmentName: string, level: number) => ({
      ...report.employees[0], employeeId: id, fullName: id, departmentName, domainDetails: [comparedDomain('data', level, 2)],
    });
    render(<MemoryRouter><CompetencyReport report={{
      ...report, assessed: 3, summary: [summary],
      employees: [person('a', 'Kế toán', 0), person('b', 'Kế toán', 1), person('c', 'Marketing', 2)],
    }} /></MemoryRouter>);
    const row = () => within(screen.getByRole('button', { name: 'Chi tiết Dữ liệu' }).closest('tr')!);
    // Whole company: the weakest person starts at Cơ bản, the standard is Trung cấp.
    expect(row().getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual([
      '/enterprise/courses?focus=M1-F&level=1', '/enterprise/courses?focus=M1-I&level=2',
    ]);
    const filter = screen.getByRole('combobox', { name: 'Lọc theo phòng ban' });
    fireEvent.click(filter);
    fireEvent.click(screen.getByRole('option', { name: 'Marketing (1 người)' }));
    // Marketing alone already meets the standard.
    expect(row().getByText('Không cần thêm khóa')).toBeInTheDocument();
    expect(row().queryByRole('link')).not.toBeInTheDocument();
    fireEvent.click(filter);
    fireEvent.click(screen.getByRole('option', { name: 'Kế toán (2 người)' }));
    expect(row().getAllByRole('link')).toHaveLength(2);
    fireEvent.click(row().getByRole('button', { name: 'Chi tiết Dữ liệu' }));
    expect(within(document.getElementById('trial-domain-detail-data')!).getByText('2/2')).toBeInTheDocument();
  });

  it('keeps draft content mounted but inert when the disclosure closes', () => {
    const { rerender, container } = render(<TrialDisclosure open><input aria-label="Bản nháp" defaultValue="Giữ nội dung" /></TrialDisclosure>);
    rerender(<TrialDisclosure open={false}><input aria-label="Bản nháp" defaultValue="Giữ nội dung" /></TrialDisclosure>);
    expect(container.querySelector('.trial-disclosure')).toHaveAttribute('inert');
    expect(container.querySelector('input')).toHaveValue('Giữ nội dung');
    rerender(<TrialDisclosure open><input aria-label="Bản nháp" defaultValue="Giữ nội dung" /></TrialDisclosure>);
    expect(screen.getByLabelText('Bản nháp')).toHaveValue('Giữ nội dung');
    expect(container.querySelector('.trial-disclosure')).not.toHaveAttribute('inert');
  });

  it('identifies the current assessment step for keyboard and screen reader users', () => {
    render(<Steps steps={['Danh sách', 'Thời hạn', 'Tiến độ']} current={1} label="Tiến trình đánh giá" />);
    expect(screen.getByRole('navigation', { name: 'Tiến trình đánh giá' }).querySelector('[aria-current=step]')).toHaveTextContent('Thời hạn');
  });

  it('paginates results ten at a time and returns to page one when searching', () => {
    render(<MemoryRouter><CompetencyReport report={report} /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /Kết quả từng người/ }));
    const results = within(document.getElementById('trial-employee-results')!);
    expect(results.getByText('Nhân viên 10')).toBeInTheDocument();
    expect(results.queryByText('Nhân viên 11')).not.toBeInTheDocument();
    fireEvent.click(results.getByRole('button', { name: 'Sau', exact: true }));
    expect(results.getByText('Nhân viên 11')).toBeInTheDocument();
    fireEvent.change(results.getByPlaceholderText('Tìm theo tên, phòng ban...'), { target: { value: '12' } });
    expect(results.getByText('Nhân viên 12')).toBeInTheDocument();
    expect(results.queryByText('Nhân viên 11')).not.toBeInTheDocument();
  });

  it('keeps the result dialog present during its exit animation, then closes it', async () => {
    const resultsReport = { ...report, employees: report.employees.map((employee, index) => index === 0
      ? { ...employee, choiceScore: 72, choiceTotal: 90 } : employee) };
    render(<MemoryRouter><CompetencyReport report={resultsReport} /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /Kết quả từng người/ }));
    const results = within(document.getElementById('trial-employee-results')!);
    fireEvent.click(results.getAllByRole('button', { name: 'Xem chi tiết' })[0]);
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('72/90')).toBeInTheDocument();
    expect(within(dialog).queryByText('Mức gợi ý theo tỷ lệ đúng của từng lĩnh vực')).not.toBeInTheDocument();
    fireEvent.click(within(dialog).getAllByRole('button', { name: 'Đóng', exact: true })[0]);
    expect(dialog).toHaveClass('is-closing');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
