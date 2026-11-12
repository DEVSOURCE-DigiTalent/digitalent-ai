import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { CompetencyLevelRow } from '@/services/workforce.service';
import { CompetencyTab } from './CompetencyTab';
import { MemberTabPager } from './MemberTabUi';
import { TasksTab } from './TasksTab';
import type { PracticalTaskRecord } from '@/services/mock/server/types-work';

describe('Member detail tabs', () => {
  it('changes page size and returns to the first page', () => {
    const tasks = Array.from({ length: 12 }, (_, index) => ({ id: `t${index}`, title: `Nhiệm vụ ${index + 1}`, status: 'ACTIVE', competencyIds: [] })) as unknown as PracticalTaskRecord[];
    render(<TasksTab tasks={tasks} />);
    expect(screen.queryByRole('heading', { name: 'Nhiệm vụ 6', exact: true })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Trang sau' }));
    expect(screen.getByRole('heading', { name: 'Nhiệm vụ 6', exact: true })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('combobox', { name: 'Số mục mỗi trang' }));
    fireEvent.click(screen.getByRole('option', { name: '10 / trang' }));
    expect(screen.getByRole('heading', { name: 'Nhiệm vụ 1', exact: true })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Nhiệm vụ 10', exact: true })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Nhiệm vụ 11', exact: true })).toBeNull();
    expect(screen.getAllByText('Đang thực hiện')).toHaveLength(10);
  });
  it('shows one competency domain at a time and switches to another domain', () => {
    const rows = [
      { competencyId: 'a', categoryName: 'Dữ liệu', frameworkCode: '1.1', name: 'Tìm kiếm thông tin', currentLevel: 1, requiredLevel: 2 },
      { competencyId: 'b', categoryName: 'An toàn', frameworkCode: '4.1', name: 'Bảo vệ thiết bị', currentLevel: 2, requiredLevel: 3 },
    ] as CompetencyLevelRow[];
    render(<CompetencyTab rows={rows} hasRequirement />);
    expect(screen.getByText('Tìm kiếm thông tin')).toBeTruthy();
    expect(screen.queryByText('Bảo vệ thiết bị')).toBeNull();
    fireEvent.click(screen.getByRole('tab', { name: /An toàn/ }));
    expect(screen.getByText('Bảo vệ thiết bị')).toBeTruthy();
    expect(screen.queryByText('Tìm kiếm thông tin')).toBeNull();
  });

  it('offers navigation only when more than one page exists', () => {
    const onPageChange = vi.fn();
    const { rerender } = render(<MemberTabPager page={1} total={5} pageSize={6} onPageChange={onPageChange} />);
    expect(screen.queryByRole('navigation')).toBeNull();
    rerender(<MemberTabPager page={1} total={12} pageSize={6} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Trang sau' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
