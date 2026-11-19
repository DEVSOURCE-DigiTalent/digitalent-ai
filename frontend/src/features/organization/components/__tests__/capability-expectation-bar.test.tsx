import { cleanup, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import { CapabilityCeilingMatrix } from '../CapabilityCeilingMatrix';

vi.mock('@/hooks/use-permission', () => ({ PERMISSIONS: { POSITION_REQUIREMENT_MANAGE: 'manage' }, usePermission: () => ({ can: () => true }) }));
vi.mock('@/hooks/use-job-positions', () => ({ useJobPosition: () => ({ data: undefined }) }));
vi.mock('@/hooks/use-capability-ceilings', () => ({
  useCapabilityCeilings: () => ({ data: {
    isConfigured: true,
    levels: [{ level: 1, name: 'Cơ bản' }, { level: 2, name: 'Trung cấp' }, { level: 3, name: 'Nâng cao' }],
    domains: [1, 2].map((n) => ({ categoryId: `cat-${n}`, name: `Lĩnh vực ${n}`, sortOrder: n, organizationCeiling: 1, maxAllowedCeiling: 1, suggestedCeiling: 2,
      courses: [1, 2, 3].map((level) => ({ level, courseId: `course-${n}-${level}`, code: `A${n}-${level}`, title: `Khóa ${n}-${level}`, isUnlocked: level === 1, price: 0 })),
    })),
    departments: [{
      departmentId: 'kt', code: 'KT', name: 'Kế toán', employeeCount: 4, hasSuggestion: true, isCustomized: false, courseCount: 2,
      ceilings: [{ categoryId: 'cat-1', level: 1, suggested: 2, isCustomized: false }, { categoryId: 'cat-2', level: 1, suggested: 1, isCustomized: false }],
    }],
  } }),
  useUpdateDepartmentCeilings: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));
vi.mock('../CoursePositionStandardPanel', () => ({ CoursePositionStandardPanel: () => null }));
vi.mock('../CapabilityCeilingGuide', () => ({ CapabilityCeilingGuide: () => null }));
afterEach(cleanup);

it('keeps both parts in one small tab block and sets levels per department only (no company-wide level)', () => {
  render(<MemoryRouter initialEntries={['/enterprise/setup?tab=departments']}><CapabilityCeilingMatrix /></MemoryRouter>);
  const tabs = screen.getByRole('tablist', { name: 'Phần của khung năng lực' });
  expect(within(tabs).getAllByRole('tab')).toHaveLength(2);
  expect(within(tabs).queryByRole('button', { name: /Cách hoạt động/ })).toBeNull();
  expect(screen.queryByText('Mức mong muốn')).toBeNull();
  expect(screen.queryByText(/Một mức cho cả doanh nghiệp/)).toBeNull();
  expect(screen.getByRole('combobox', { name: 'Chọn phòng ban' })).toHaveTextContent('Kế toán');
  // No status chips beside the tabs.
  expect(screen.queryByText('Phòng ban chưa đặt theo đề xuất của hệ thống')).toBeNull();
  expect(screen.queryByText('Khóa dùng chung cho cả doanh nghiệp')).toBeNull();
});

it('opened from the survey: says why and links back to the survey', () => {
  render(<MemoryRouter initialEntries={['/enterprise/setup?tab=departments&from=survey']}><CapabilityCeilingMatrix /></MemoryRouter>);
  expect(screen.getByText('Đặt mức cần đạt cho từng phòng ban')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Xong, quay lại khảo sát/ })).toHaveAttribute('href', '/enterprise/trial?resume=1');
  expect(screen.getByRole('combobox', { name: 'Chọn phòng ban' })).toBeInTheDocument();
});
