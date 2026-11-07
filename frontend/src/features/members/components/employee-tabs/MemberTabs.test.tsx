import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { CompetencyLevelRow } from '@/services/workforce.service';
import { CompetencyTab } from './CompetencyTab';
import { MemberTabPager } from './MemberTabUi';

describe('Member detail tabs', () => {
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
