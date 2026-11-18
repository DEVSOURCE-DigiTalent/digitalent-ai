import React, { StrictMode } from 'react';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { toast } from 'sonner';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CapabilityCeilingMatrix } from '../CapabilityCeilingMatrix';

const { saveDepartment } = vi.hoisted(() => ({ saveDepartment: vi.fn() }));
vi.mock('@/hooks/use-permission', () => ({ PERMISSIONS: { POSITION_REQUIREMENT_MANAGE: 'manage' }, usePermission: () => ({ can: () => true }) }));
vi.mock('@/hooks/use-job-positions', () => ({ useJobPosition: () => ({ data: undefined }) }));
vi.mock('@/hooks/use-capability-ceilings', () => ({
  useCapabilityCeilings: () => ({ data: {
    isConfigured: true,
    levels: [{ level: 1, name: 'Cơ bản' }, { level: 2, name: 'Trung cấp' }, { level: 3, name: 'Nâng cao' }],
    // The company owns Basic and Intermediate in both domains; Advanced is not bought.
    domains: [1, 2].map((n) => ({ categoryId: `cat-${n}`, name: `Lĩnh vực ${n}`, sortOrder: n, organizationCeiling: 2, maxAllowedCeiling: 2, suggestedCeiling: 2,
      courses: [1, 2, 3].map((level) => ({ level, courseId: `course-${n}-${level}`, code: `A${n}-${level}`, title: `Khóa ${n}-${level}`, isUnlocked: level < 3, price: level === 3 ? 699000 : 399000 })),
    })),
    departments: [
      {
        departmentId: 'kt', code: 'KT', name: 'Kế toán', employeeCount: 4, hasSuggestion: true, isCustomized: false, courseCount: 4,
        ceilings: [{ categoryId: 'cat-1', level: 2, suggested: 2, isCustomized: false }, { categoryId: 'cat-2', level: 2, suggested: 1, isCustomized: false }],
      },
      {
        // Marketing aims at Advanced communication before the company bought it (set first, buy later).
        departmentId: 'mkt', code: 'MKT', name: 'Marketing', employeeCount: 3, hasSuggestion: true, isCustomized: true, courseCount: 5,
        ceilings: [{ categoryId: 'cat-1', level: 2, suggested: 2, isCustomized: true }, { categoryId: 'cat-2', level: 3, suggested: 3, isCustomized: true }],
      },
    ],
  } }),
  useUpdateDepartmentCeilings: () => ({ isPending: false, mutateAsync: saveDepartment }),
}));
vi.mock('../CoursePositionStandardPanel', () => ({ CoursePositionStandardPanel: ({ course }: { course: { code: string } }) => `Chi tiết ${course.code}` }));
vi.mock('../CapabilityCeilingGuide', () => ({ CapabilityCeilingGuide: () => null }));

const renderAt = (entry = '/enterprise/setup', wrap?: (node: React.ReactNode) => React.ReactNode) => render(
  <MemoryRouter initialEntries={[entry]}>{wrap ? wrap(<CapabilityCeilingMatrix />) : <CapabilityCeilingMatrix />}</MemoryRouter>,
);

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('React', React);
  vi.stubGlobal('matchMedia', () => ({ matches: false }));
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); saveDepartment.mockReset(); });

describe('Khung năng lực số', () => {
  it('starts on the courses the company owns and points at what departments still need', () => {
    renderAt();
    expect(screen.getByRole('tab', { name: /Khóa học của doanh nghiệp/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('img', { name: 'Đã có 4/6 khóa' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Đặt mức/ })).toBeNull();
    expect(screen.getByRole('button', { name: 'Xem khóa A1-2' })).toHaveTextContent('Dùng ở: Mọi phòng ban');

    // Marketing set Advanced communication: the course to buy is flagged and the callout offers it.
    const needed = screen.getByRole('button', { name: /Lĩnh vực 2, cấp 3: chưa mua khóa/ });
    expect(needed).toHaveTextContent('Cần cho');
    expect(within(needed).getByTitle('Cần cho: Marketing')).toHaveTextContent('M');
    expect(screen.getByText('Phòng ban đang cần 1 khóa chưa mua')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Thêm cả 1 vào giỏ' }));
    expect(screen.getByRole('region', { name: 'Thao tác khung năng lực' })).toHaveTextContent('Giỏ khóa học · 1 khóa');
    expect(screen.getByRole('button', { name: 'Đã có trong giỏ' })).toBeDisabled();
  });

  it('opens on one click and switches to another course without waiting for an exit timer', () => {
    renderAt();
    fireEvent.click(screen.getByRole('button', { name: 'Xem khóa A1-2' }));
    act(() => vi.advanceTimersByTime(40));
    expect(screen.getByText('Chi tiết A1-2').closest('.cc-inline-panel')?.classList.contains('is-open')).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Xem khóa A2-2' }));
    expect(screen.getByText('Chi tiết A2-2')).toBeTruthy();
    expect(screen.queryByText('Chi tiết A1-2')).toBeNull();
    act(() => vi.advanceTimersByTime(40));
    expect(screen.getByText('Chi tiết A2-2').closest('.cc-inline-panel')?.classList.contains('is-open')).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Xem khóa A2-2' }));
    fireEvent.click(screen.getByRole('button', { name: 'Xem khóa A1-2' }));
    act(() => vi.advanceTimersByTime(450));
    expect(screen.getByText('Chi tiết A1-2').closest('.cc-inline-panel')?.classList.contains('is-open')).toBe(true);
  });

  it('shows a single toast per click when picking a course to buy under StrictMode', () => {
    const success = vi.spyOn(toast, 'success');
    const info = vi.spyOn(toast, 'info');
    render(<StrictMode><MemoryRouter><CapabilityCeilingMatrix /></MemoryRouter></StrictMode>);

    fireEvent.click(screen.getByRole('button', { name: /Lĩnh vực 2, cấp 3: chưa mua khóa/ }));
    expect(success).toHaveBeenCalledTimes(1);
    expect(success).toHaveBeenCalledWith('Đã chọn khóa A2-3 để mua bản quyền', expect.anything());

    fireEvent.click(screen.getByRole('button', { name: /Lĩnh vực 2, cấp 3: đã chọn mua/ }));
    expect(info).toHaveBeenCalledTimes(1);
    expect(info).toHaveBeenCalledWith('Đã bỏ chọn khóa A2-3');
  });

  it('sets a department level as a range, with the suggestion marked and only the domains picked saved', async () => {
    saveDepartment.mockResolvedValue({});
    renderAt('/enterprise/setup?tab=departments');
    // One picker for any number of departments, with the progress and a jump to the next one.
    const picker = screen.getByRole('combobox', { name: 'Chọn phòng ban' });
    expect(picker).toHaveTextContent('Kế toán');
    expect(screen.getByText('Kế toán chưa đặt mức. Bấm vào mức cần đạt ở từng lĩnh vực.')).toBeInTheDocument();
    expect(screen.getByText('phòng ban đã đặt mức').parentElement).toHaveTextContent('1/2 phòng ban đã đặt mức');
    expect(screen.queryByRole('button', { name: /Phòng ban chưa đặt tiếp theo/ })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Phòng ban sau' }));
    expect(picker).toHaveTextContent('Marketing');
    expect(screen.getByRole('button', { name: /Phòng ban chưa đặt tiếp theo/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Phòng ban chưa đặt tiếp theo/ }));
    expect(picker).toHaveTextContent('Kế toán');
    expect(screen.queryByRole('button', { name: /chuẩn vị trí/i })).toBeNull();
    const basic = screen.getByRole('button', { name: 'Đặt mức Lĩnh vực 1: Cơ bản' });
    const intermediate = screen.getByRole('button', { name: 'Đặt mức Lĩnh vực 1: Trung cấp' });
    expect(intermediate).toHaveTextContent('Đề xuất');

    fireEvent.click(intermediate);
    expect(intermediate).toHaveAttribute('aria-pressed', 'true');
    expect(intermediate).toHaveTextContent('Mức cần đạt');
    expect(basic).toHaveTextContent('Đã gồm');

    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' })); });
    expect(saveDepartment).toHaveBeenCalledWith({ departmentId: 'kt', data: { inherit: false, ceilings: [{ categoryId: 'cat-1', level: 2 }] } });
  });

  it('sets a level whose course is not bought yet, while buying stays in the courses view', () => {
    renderAt('/enterprise/setup?tab=departments', (node) => <div className="enterprise-shell" data-testid="enterprise-shell">{node}</div>);
    const advanced = screen.getByRole('button', { name: 'Đặt mức Lĩnh vực 2: Nâng cao (chưa mua)' });
    expect(advanced).toHaveTextContent('Chưa mua');
    fireEvent.click(advanced);
    expect(advanced).toHaveAttribute('aria-pressed', 'true');

    // The department hero counts the course to buy; the dock only saves, no cart here.
    const toBuy = screen.getByText('Khóa cần mua').parentElement!;
    expect(toBuy).toHaveTextContent('1');
    const dock = screen.getByRole('region', { name: 'Thao tác khung năng lực' });
    expect(dock.parentElement).toBe(screen.getByTestId('enterprise-shell'));
    expect(within(dock).getByRole('button', { name: 'Lưu thay đổi' })).toBeInTheDocument();
    expect(dock).not.toHaveTextContent('Giỏ khóa học');

    fireEvent.click(within(toBuy).getByRole('button', { name: /Mua ở phần 1/ }));
    expect(screen.getByRole('tab', { name: /Khóa học của doanh nghiệp/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByRole('region', { name: 'Thao tác khung năng lực' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Lĩnh vực 1, cấp 3: chưa mua khóa/ }));
    const cartDock = screen.getByRole('region', { name: 'Thao tác khung năng lực' });
    expect(within(cartDock).getByRole('button', { name: /Thanh toán & Ký online/ })).toBeInTheDocument();
    expect(within(cartDock).queryByRole('button', { name: 'Lưu thay đổi' })).toBeNull();
  });

});
