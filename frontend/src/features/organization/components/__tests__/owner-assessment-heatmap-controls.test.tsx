import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { OwnerAssessmentHeatmap } from '../OwnerAssessmentHeatmap';

const state = vi.hoisted(() => ({ loading: false }));

vi.mock('@/hooks/use-trial-program', () => ({
  useTrialProgram: () => ({
    isLoading: state.loading,
    isError: false,
    data: state.loading ? undefined : {
      departments: ['HR', 'CEO', 'Marketing'],
      participants: [
        { id: '1', fullName: 'Nhân viên HR', departmentName: 'HR', status: 'ACTIVE' },
        ...Array.from({ length: 8 }, (_, index) => ({ id: `hr-${index}`, fullName: `Nhân viên HR ${index + 2}`, departmentName: 'HR', status: 'ACTIVE' })),
        { id: '2', fullName: 'Nhân viên CEO', departmentName: 'CEO', status: 'SUBMITTED' },
        { id: '3', fullName: 'Nhân viên Marketing', departmentName: 'Marketing', status: 'REVIEWED' },
      ],
    },
  }),
}));

afterEach(() => { cleanup(); state.loading = false; vi.restoreAllMocks(); });

describe('Owner assessment heatmap controls', () => {
  it('shows loading progress until the assessment summary is available', () => {
    state.loading = true;
    const view = <MemoryRouter><OwnerAssessmentHeatmap /></MemoryRouter>;
    const { rerender } = render(view);
    expect(screen.getByRole('progressbar', { name: 'Đang tải tiến độ đánh giá…' })).toBeInTheDocument();
    expect(screen.queryByText('TỶ LỆ NỘP BÀI')).not.toBeInTheDocument();
    expect(screen.queryByText('0 phòng ban')).not.toBeInTheDocument();

    state.loading = false;
    rerender(<MemoryRouter><OwnerAssessmentHeatmap /></MemoryRouter>);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.getByText('TỶ LỆ NỘP BÀI')).toBeInTheDocument();
  });

  it('counts submitted and reviewed participants together in the submission column and summary', () => {
    render(<MemoryRouter><OwnerAssessmentHeatmap /></MemoryRouter>);
    const submittedColumn = screen.getByRole('columnheader', { name: 'Đã nộp' }) as HTMLTableCellElement;
    expect(screen.queryByRole('columnheader', { name: 'Đã chấm' })).not.toBeInTheDocument();
    for (const department of ['CEO', 'Marketing']) {
      const row = screen.getByRole('rowheader', { name: department }).closest('tr')!;
      expect(within(row).getAllByRole('cell')[submittedColumn.cellIndex - 1]).toHaveTextContent('1');
    }
    expect(screen.getByRole('img', { name: /Đã nộp: 2/ })).toBeInTheDocument();
  });

  it('opens the filter above a low trigger, keeps page scrolling, and excludes only the unchecked department', () => {
    const rectSpy = vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({ top: 530, bottom: 570, left: 100, right: 260, width: 160, height: 40, x: 100, y: 530, toJSON: () => ({}) });
    vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(270);
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 650 });
    const overflowBefore = document.body.style.overflow;

    render(<MemoryRouter><OwnerAssessmentHeatmap /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Phòng ban' }));
    const menu = document.querySelector<HTMLElement>('.owner-heatmap__menu--floating');
    expect(menu?.dataset.placement).toBe('above');
    expect(menu?.parentElement).toBe(document.body);
    expect(document.body.style.overflow).toBe(overflowBefore);
    const oldTop = menu?.style.top;
    rectSpy.mockReturnValue({ top: 400, bottom: 440, left: 100, right: 260, width: 160, height: 40, x: 100, y: 400, toJSON: () => ({}) });
    fireEvent.scroll(window);
    expect(menu?.style.top).not.toBe(oldTop);

    fireEvent.click(within(menu!).getByRole('checkbox', { name: /HR/ }));
    expect(screen.getByRole('columnheader', { name: 'Phòng ban (2)' })).toBeInTheDocument();
    expect(screen.queryByRole('row', { name: /^HR / })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Phòng ban 2/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Tỷ lệ thấp trước' }));
    fireEvent.click(screen.getByRole('button', { name: 'Tên phòng ban' }));
    expect(screen.getByRole('button', { name: 'Tên phòng ban' })).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(screen.getByRole('button', { name: 'Cột trạng thái' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(document.querySelector('.owner-heatmap__menu--floating')).toBeNull();
  });

  it('opens from the whole department row and pages a large team without rendering every person', async () => {
    render(<MemoryRouter><OwnerAssessmentHeatmap /></MemoryRouter>);
    const row = screen.getByText('HR').closest('tr')!;
    fireEvent.click(row.querySelector('.owner-heatmap__number')!);
    expect(row).toHaveAttribute('aria-expanded', 'true');
    const grid = document.querySelector<HTMLElement>('.owner-heatmap__people-grid')!;
    expect(grid.children).toHaveLength(PEOPLE_PER_PAGE_FOR_TEST);

    fireEvent.click(screen.getByRole('button', { name: 'Trang sau của HR' }));
    expect(grid.children).toHaveLength(3);
    fireEvent.change(screen.getByRole('textbox', { name: 'Tìm nhân viên trong HR' }), { target: { value: 'HR 9' } });
    expect(grid.children).toHaveLength(1);

    const ceoRow = screen.getByText('CEO').closest('tr')!;
    fireEvent.click(ceoRow);
    expect(row).toHaveAttribute('aria-expanded', 'false');
    expect(ceoRow).toHaveAttribute('aria-expanded', 'true');
    expect(document.querySelectorAll('.owner-heatmap__detail')).toHaveLength(2);
    await waitFor(() => expect(document.querySelectorAll('.owner-heatmap__detail')).toHaveLength(1));

    fireEvent.keyDown(ceoRow, { key: 'Enter' });
    expect(ceoRow).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(document.querySelector('.owner-heatmap__detail')).toBeNull());
  });
});

const PEOPLE_PER_PAGE_FOR_TEST = 6;
