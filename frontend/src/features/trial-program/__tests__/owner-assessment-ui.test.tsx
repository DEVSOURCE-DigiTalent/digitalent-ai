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
    expect(screen.getByRole('heading', { name: 'Năng lực theo lĩnh vực' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Xem khóa/ })[0]).toHaveAttribute('href', '/enterprise/courses?focus=M2-F&level=1');
    expect(screen.getByText('8 người cần bổ sung theo chuẩn vị trí')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /M4-/ })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Chi tiết từng nhân viên', exact: true })).toBeInTheDocument();
    expect(screen.getByText('Mức năng lực trung bình')).toBeInTheDocument();
    expect(screen.getByText('Đạt mức Trung cấp')).toBeInTheDocument();
    expect(screen.getByText('67% câu đúng trên tổng số bài đã chấm')).toBeInTheDocument();
    expect(screen.queryByText('Đạt Cơ bản ở mọi lĩnh vực')).not.toBeInTheDocument();
  });
  it('suggests M2-A only when the position requires advanced level', () => {
    const summary = { categoryId: 'communication', number: 2, name: 'Giao tiếp', counts: [0, 0, 1, 0], average: 2, level: 2 };
    const result = (target: number): TrialReport => ({
      ...report, assessed: 1, summary: [summary],
      employees: [{ ...report.employees[0], domainDetails: [comparedDomain('communication', 2, target)] }],
    });
    const view = render(<MemoryRouter><CompetencyReport report={result(2)} /></MemoryRouter>);
    expect(screen.getByRole('columnheader', { name: 'Chuẩn vị trí' })).toBeInTheDocument();
    expect(screen.getByText('1/1 đạt chuẩn')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /M2-A/ })).not.toBeInTheDocument();

    view.rerender(<MemoryRouter><CompetencyReport report={result(3)} /></MemoryRouter>);
    expect(screen.getByText('0/1 đạt chuẩn')).toBeInTheDocument();
    expect(within(screen.getByRole('table')).getByRole('link', { name: /M2-A/ }))
      .toHaveAttribute('href', '/enterprise/courses?focus=M2-A&level=3');
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

  it('paginates results and returns to page one when searching or resizing', () => {
    render(<MemoryRouter><CompetencyReport report={report} /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /Chi tiết từng nhân viên/ }));
    const results = within(document.getElementById('trial-employee-results')!);
    expect(results.getByText('Nhân viên 05')).toBeInTheDocument();
    expect(results.queryByText('Nhân viên 06')).not.toBeInTheDocument();
    fireEvent.click(results.getByRole('button', { name: 'Sau', exact: true }));
    expect(results.getByText('Nhân viên 06')).toBeInTheDocument();
    fireEvent.change(results.getByPlaceholderText('Tìm theo tên, phòng ban...'), { target: { value: '12' } });
    expect(results.getByText('Nhân viên 12')).toBeInTheDocument();
    expect(results.queryByText('Nhân viên 06')).not.toBeInTheDocument();
    fireEvent.change(results.getByPlaceholderText('Tìm theo tên, phòng ban...'), { target: { value: '' } });
    fireEvent.click(results.getByRole('combobox', { name: 'Số kết quả mỗi trang' }));
    fireEvent.click(screen.getByRole('option', { name: '10 / trang' }));
    expect(results.getByText('Nhân viên 10')).toBeInTheDocument();
    expect(results.queryByText('Nhân viên 11')).not.toBeInTheDocument();
  });

  it('keeps the result dialog present during its exit animation, then closes it', async () => {
    const resultsReport = { ...report, employees: report.employees.map((employee, index) => index === 0
      ? { ...employee, choiceScore: 72, choiceTotal: 90 } : employee) };
    render(<MemoryRouter><CompetencyReport report={resultsReport} /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /Chi tiết từng nhân viên/ }));
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
