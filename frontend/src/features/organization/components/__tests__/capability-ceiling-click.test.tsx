import React, { StrictMode } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { toast } from 'sonner';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CapabilityCeilingMatrix } from '../CapabilityCeilingMatrix';

vi.mock('@/hooks/use-permission', () => ({ PERMISSIONS: { POSITION_REQUIREMENT_MANAGE: 'manage' }, usePermission: () => ({ can: () => true }) }));
vi.mock('@/hooks/use-capability-ceilings', () => ({
  useCapabilityCeilings: () => ({ data: {
    isConfigured: true, departments: [],
    levels: [{ level: 1, name: 'Cơ bản' }, { level: 2, name: 'Trung cấp' }],
    domains: [1, 2].map((n) => ({ categoryId: `cat-${n}`, name: `Lĩnh vực ${n}`, sortOrder: n, organizationCeiling: 1, maxAllowedCeiling: 2, suggestedCeiling: 1,
      courses: [1, 2, 3].map((level) => ({ level, courseId: `course-${n}-${level}`, code: `A${n}-${level}`, isUnlocked: level < 3 })),
    })),
  } }),
  useUpdateOrganizationCeilings: () => ({ isPending: false }),
  useUpdateDepartmentCeilings: () => ({ isPending: false }),
}));
vi.mock('../CoursePositionStandardPanel', () => ({ CoursePositionStandardPanel: ({ course }: { course: { code: string } }) => `Chi tiết ${course.code}` }));
vi.mock('../DomainMilestonePanel', () => ({ DomainMilestonePanel: () => React.createElement('button', { type: 'button' }, 'Chọn mốc') }));
vi.mock('../CapabilityCeilingGuide', () => ({ CapabilityCeilingGuide: () => null }));

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('React', React);
  vi.stubGlobal('matchMedia', () => ({ matches: false }));
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('ceiling information clicks', () => {
  it('matches the expanded domain and allows closing from its own header without closing on form clicks', () => {
    render(<MemoryRouter><CapabilityCeilingMatrix /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Mở mốc năng lực của lĩnh vực Lĩnh vực 2' }));
    act(() => vi.advanceTimersByTime(40));
    const close = screen.getByRole('button', { name: 'Thu gọn Lĩnh vực 2' });
    expect(close.closest('.cc-domain-panel')?.getAttribute('data-domain')).toBe('2');
    fireEvent.click(screen.getByRole('button', { name: 'Chọn mốc' }));
    expect(close.closest('.cc-inline-panel')?.classList.contains('is-open')).toBe(true);
    fireEvent.click(close);
    act(() => vi.advanceTimersByTime(400));
    expect(screen.queryByRole('button', { name: 'Thu gọn Lĩnh vực 2' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Mở mốc năng lực của lĩnh vực Lĩnh vực 2' }).getAttribute('aria-expanded')).toBe('false');
  });
  it('opens on one click and switches to another course without waiting for an exit timer', () => {
    render(<MemoryRouter><CapabilityCeilingMatrix /></MemoryRouter>);
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

  it('keeps a cell click for selecting the ceiling, without opening course information', () => {
    render(<MemoryRouter><CapabilityCeilingMatrix /></MemoryRouter>);
    const cell = screen.getByRole('button', { name: 'Thiết lập phạm vi Lĩnh vực 1: cấp 2' });
    fireEvent.click(cell);
    expect(cell.getAttribute('aria-pressed')).toBe('true');
    expect(screen.queryByText('Chi tiết A1-2')).toBeNull();
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

  it('stacks both action bars inside the enterprise shell and clears them independently', () => {
    render(<MemoryRouter><div className="enterprise-shell" data-testid="enterprise-shell"><CapabilityCeilingMatrix /></div></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Thiết lập phạm vi Lĩnh vực 1: cấp 2' }));
    fireEvent.click(screen.getByRole('button', { name: /Lĩnh vực 2, cấp 3: chưa mua khóa/ }));

    const dock = screen.getByRole('region', { name: 'Thao tác khung năng lực' });
    expect(dock.parentElement).toBe(screen.getByTestId('enterprise-shell'));
    expect(dock).toContainElement(screen.getByRole('button', { name: 'Lưu thay đổi' }));
    expect(dock).toContainElement(screen.getByRole('button', { name: /Thanh toán & Ký online/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Hủy chọn tất cả' }));
    expect(dock).not.toHaveTextContent('Giỏ khóa học');
    fireEvent.click(screen.getByRole('button', { name: 'Hủy thay đổi' }));
    expect(dock).not.toBeInTheDocument();
  });
});
