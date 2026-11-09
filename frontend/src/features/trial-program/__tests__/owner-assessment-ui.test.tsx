import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { CompetencyReport, Steps } from '../components/TrialUi';
import { TrialDisclosure } from '../components/TrialDisclosure';
import type { TrialReport } from '@/services/trial-program.service';

afterEach(cleanup);

const report: TrialReport = {
  assessed: 12,
  domains: [],
  summary: [{ categoryId: 'data', number: 1, name: 'Dữ liệu', counts: [0, 12, 0, 0], average: 1, level: 1 }],
  employees: Array.from({ length: 12 }, (_, index) => ({ employeeId: String(index), fullName: `Nhân viên ${String(index + 1).padStart(2, '0')}`, levels: [1, 1, 1, 1, 1, 1] })),
};

describe('owner assessment interactions', () => {
  it('uses level distribution without a misleading average-score column or a count in the employee heading', () => {
    render(<CompetencyReport report={report} />);
    expect(screen.queryByRole('columnheader', { name: 'Điểm TB' })).not.toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Phân bổ (12 người)' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Chi tiết từng nhân viên', exact: true })).toBeInTheDocument();
    expect(screen.getByText('Mức năng lực trung bình')).toBeInTheDocument();
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
    render(<CompetencyReport report={report} />);
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
    render(<CompetencyReport report={report} />);
    fireEvent.click(screen.getByRole('button', { name: /Chi tiết từng nhân viên/ }));
    const results = within(document.getElementById('trial-employee-results')!);
    fireEvent.click(results.getAllByRole('button', { name: 'Xem chi tiết' })[0]);
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getAllByRole('button', { name: 'Đóng', exact: true })[0]);
    expect(dialog).toHaveClass('is-closing');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
