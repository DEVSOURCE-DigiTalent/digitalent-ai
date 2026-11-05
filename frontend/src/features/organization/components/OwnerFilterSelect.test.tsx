import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { OwnerFilterSelect } from './OwnerFilterSelect';

const options = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'ACTIVE', label: 'Đang hoạt động' },
  { value: 'INACTIVE', label: 'Đã vô hiệu hóa' },
];

describe('OwnerFilterSelect', () => {
  it('opens a styled list and applies the selected filter', () => {
    const onChange = vi.fn();
    render(<OwnerFilterSelect label="Lọc trạng thái" value="" options={options} onChange={onChange} />);
    const trigger = screen.getByRole('combobox', { name: 'Lọc trạng thái' });
    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(screen.getByRole('option', { name: 'Đang hoạt động' }));
    expect(onChange).toHaveBeenCalledWith('ACTIVE');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('supports keyboard navigation and closes when focus leaves', () => {
    const onChange = vi.fn();
    render(<><OwnerFilterSelect label="Lọc trạng thái" value="" options={options} onChange={onChange} /><button>Tiếp theo</button></>);
    const trigger = screen.getByRole('combobox', { name: 'Lọc trạng thái' });
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('ACTIVE');
    fireEvent.click(trigger);
    fireEvent.focusIn(screen.getByRole('button', { name: 'Tiếp theo' }));
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('searches within a long option list', () => {
    const onChange = vi.fn();
    const departments = Array.from({ length: 12 }, (_, index) => ({ value: String(index + 1), label: `Phòng ban ${index + 1}` }));
    render(<OwnerFilterSelect label="Lọc phòng ban" value="" options={departments} onChange={onChange} />);
    fireEvent.click(screen.getByRole('combobox', { name: 'Lọc phòng ban' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Tìm lọc phòng ban' }), { target: { value: '12' } });
    expect(screen.getAllByRole('option')).toHaveLength(1);
    fireEvent.click(screen.getByRole('option', { name: 'Phòng ban 12' }));
    expect(onChange).toHaveBeenCalledWith('12');
  });

  it('requests matching departments beyond the first loaded page', () => {
    const onSearchChange = vi.fn();
    const onChange = vi.fn();
    const view = render(<OwnerFilterSelect label="Phòng ban" value="" options={[{ value: '', label: 'Mọi phòng ban' }]} onChange={onChange} onSearchChange={onSearchChange} />);
    fireEvent.click(screen.getByRole('combobox', { name: 'Phòng ban' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Tìm phòng ban' }), { target: { value: 'Kế toán' } });
    expect(onSearchChange).toHaveBeenCalledWith('Kế toán');
    view.rerender(<OwnerFilterSelect label="Phòng ban" value="" options={[{ value: '', label: 'Mọi phòng ban' }, { value: 'dept-101', label: 'Kế toán' }]} onChange={onChange} onSearchChange={onSearchChange} />);
    fireEvent.click(screen.getByRole('option', { name: 'Kế toán' }));
    expect(onChange).toHaveBeenCalledWith('dept-101');
  });
});
