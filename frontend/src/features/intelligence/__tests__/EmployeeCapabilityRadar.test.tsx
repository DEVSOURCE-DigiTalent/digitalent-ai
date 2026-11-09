import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EmployeeCapabilityRadar } from '../components/EmployeeCapabilityRadar';
import type { LearningNeedDomain } from '@/services/intelligence.service';

vi.stubGlobal('React', React);
afterEach(cleanup);
const domains: LearningNeedDomain[] = Array.from({ length: 6 }, (_, index) => ({ categoryId: `d${index}`, name: `Lĩnh vực ${index + 1}`, number: index + 1, requiredLevel: 3, currentLevel: 2, state: 'NEEDS_LEARNING', missingCompetencies: [] }));
describe('employee capability radar', () => {
  it('compares all six current levels against the position and opens the chosen domain', () => {
    const onSelect = vi.fn();
    const { container } = render(<EmployeeCapabilityRadar domains={domains} onSelect={onSelect} />);
    expect(screen.getByRole('img', { name: /Biểu đồ mạng nhện/ })).toBeInTheDocument();
    expect(container.querySelector('.employee-radar-current')).toBeInTheDocument();
    expect(container.querySelector('.employee-radar-target')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Xem lĩnh vực Lĩnh vực 4' }));
    expect(onSelect).toHaveBeenCalledWith('d3');
  });
  it('does not convert an unassessed domain into a zero score', () => {
    const { container } = render(<EmployeeCapabilityRadar domains={domains.map((domain, index) => index === 0 ? { ...domain, currentLevel: null, state: 'WAITING_ASSESSMENT' } : domain)} onSelect={vi.fn()} />);
    expect(container.querySelector('.employee-radar-current')).not.toBeInTheDocument();
    expect(screen.getByText('Chờ đánh giá')).toBeInTheDocument();
    expect(screen.getByText(/không tính là mức 0/)).toBeInTheDocument();
  });
});
