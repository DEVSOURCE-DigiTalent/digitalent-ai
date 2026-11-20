import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { LearningActivity } from '@/services/analytics.service';
import type { CourseListItem } from '@/services/assignment.service';
import type { CapabilityProgress, CapabilityProgressEmployee, CapabilityProgressEmployeeDomain } from '@/services/intelligence.service';
import { courseWheel, personState, teamSummary, todoItems, whenText } from '../lib/owner-overview';
import { OwnerOverviewPage } from './OwnerOverviewPage';

const d = (number: number, required: number, now: number | null, atSurvey = now): CapabilityProgressEmployeeDomain =>
  ({ categoryId: `c${number}`, number, name: `Lĩnh vực ${number}`, required, atSurvey, now });
const person = (id: string, name: string, positionId: string | null, positionName: string | null, extra: Partial<CapabilityProgressEmployee>): CapabilityProgressEmployee => ({
  employeeId: id, name, departmentName: 'Kế toán', positionName, departmentId: 'kt', positionId,
  assessed: true, gapsAtSurvey: 0, gapsNow: 0, levelsGained: 0, domains: [], ...extra,
});

// An meets everything (went up once), Bình is 2 levels short in data (now Basic, needs Advanced), Chi has no survey and no position.
const progress = {
  surveyedAt: '2026-11-03T10:00:00Z', employees: 3, assessed: 2,
  totals: { gapsAtSurvey: 3, gapsNow: 2, peopleBelowAtSurvey: 2, peopleBelowNow: 1, peopleMet: 1 },
  domains: [], positions: [],
  people: [
    person('an', 'Trần Minh An', 'acc', 'Kế toán viên', { gapsAtSurvey: 1, levelsGained: 1, domains: [d(1, 2, 2, 1)] }),
    person('binh', 'Lê Bình', 'acc', 'Kế toán viên', { gapsAtSurvey: 2, gapsNow: 2, domains: [d(1, 3, 1)] }),
    person('chi', 'Lê Chi', null, null, { assessed: false, domains: [d(1, 2, null)] }),
  ],
} as CapabilityProgress;

const course = (code: string, domain: number, level: number, extra: Partial<CourseListItem> = {}) =>
  ({ id: `id-${code}`, code, title: `Khóa ${code}`, categoryName: `${domain}. Lĩnh vực`, level, ...extra }) as CourseListItem;
// domain 1: Basic (free), Intermediate bought, Advanced not bought; domain 2: Basic only
const catalog = { items: [course('M1-F', 1, 1), course('M1-I', 1, 2, { isPurchased: true }), course('M1-A', 1, 3, { price: 699000 }), course('M2-F', 2, 1)], totalItems: 4 };

const activity: LearningActivity = {
  employees: 3, learners: 2, inProgress: 3, completed: 5, completedLast30Days: 2,
  weeks: [{ weekStart: '2026-11-09', started: 2, completed: 1 }, { weekStart: '2026-11-16', started: 1, completed: 0 }],
  recent: [{ employeeId: 'an', employeeName: 'Trần Minh An', courseTitle: 'Chiến lược tìm kiếm', domainNumber: 1, level: 2, completedAt: new Date().toISOString() }],
};

vi.mock('@/hooks/use-organization', () => ({
  useOrganizationOverview: () => ({ data: { name: 'Công ty Sao Mai', members: { active: 3, pending: 2, inactive: 0 } }, isLoading: false, isError: false }),
}));
vi.mock('@/hooks/use-skill-gaps', () => ({ useCapabilityProgress: () => ({ data: progress, isLoading: false, isError: false }) }));
vi.mock('@/hooks/use-assignments', () => ({ useCourseCatalog: () => ({ data: catalog, isLoading: false, isError: false }) }));
vi.mock('@/hooks/use-analytics', () => ({ useLearningActivity: () => ({ data: activity, isLoading: false, isError: false }) }));
vi.mock('../components/SendAnnouncementModal', () => ({ SendAnnouncementModal: () => null }));

const renderPage = () => render(<MemoryRouter><OwnerOverviewPage /></MemoryRouter>);
afterEach(cleanup);

describe('owner overview helpers', () => {
  it('puts each person in one bucket and groups the team by position, people without one last', () => {
    expect(progress.people.map(personState)).toEqual(['met', 'small', 'none']);
    const team = teamSummary(progress);
    expect(team).toMatchObject({ total: 3, assessed: 2, counts: { met: 1, small: 1, large: 0, none: 1 }, metAtSurvey: 0, improved: 1 });
    expect(team.groups.map((g) => [g.name, g.people.map((p) => p.name)])).toEqual([
      ['Kế toán viên', ['Trần Minh An', 'Lê Bình']],
      ['Chưa có vị trí', ['Lê Chi']],
    ]);
  });

  it('owns Basic courses and bought ones; lists only what can be acted on', () => {
    const wheel = courseWheel(catalog.items);
    expect(wheel.map((c) => [c.code, c.owned])).toEqual([['M1-F', true], ['M1-I', true], ['M1-A', false], ['M2-F', true]]);
    // Bình needs Advanced in data, not bought: the cart opens with it
    expect(todoItems({ pendingInvites: 2, people: progress.people, courses: wheel })).toEqual([
      { key: 'invites', count: 2, label: '2 lời mời chưa kích hoạt', to: '/enterprise/members' },
      { key: 'positions', count: 1, label: '1 người chưa có vị trí', to: '/enterprise/members' },
      { key: 'courses', count: 1, label: '1 khóa cần mua cho người còn thiếu', to: '/enterprise/courses?selected=M1-A' },
    ]);
    expect(todoItems({ pendingInvites: 0, people: [progress.people[0]], courses: wheel })).toEqual([]);
  });

  it('says when in plain words', () => {
    const now = new Date(2026, 10, 20, 15);
    expect(whenText(new Date(2026, 10, 20, 8).toISOString(), now)).toBe('Hôm nay');
    expect(whenText(new Date(2026, 10, 19, 8).toISOString(), now)).toBe('Hôm qua');
    expect(whenText(new Date(2026, 10, 16, 8).toISOString(), now)).toBe('4 ngày trước');
    expect(whenText(new Date(2026, 9, 9, 8).toISOString(), now)).toBe('09/10');
  });
});

describe('OW-01 Tổng quan', () => {
  it('opens with what to act on, each a link', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 1, name: 'Tổng quan' })).toBeInTheDocument();
    const todo = screen.getByRole('region', { name: 'Cần làm' });
    expect(within(todo).getByRole('link', { name: /2 lời mời chưa kích hoạt/ })).toHaveAttribute('href', '/enterprise/members');
    expect(within(todo).getByRole('link', { name: /1 khóa cần mua cho người còn thiếu/ })).toHaveAttribute('href', '/enterprise/courses?selected=M1-A');
    // the old survey participation tabs are gone
    expect(screen.queryByRole('tab')).toBeNull();
  });

  it('shows the team as a tile per person by position, and highlights one state on demand', () => {
    renderPage();
    const team = screen.getByRole('region', { name: 'Đội ngũ' });
    expect(team).toHaveTextContent('1/3người đạt đủ mức cần đạt');
    expect(within(team).getByText('▲ 1 người so với lúc khảo sát')).toBeInTheDocument();
    const an = within(team).getByRole('link', { name: 'Trần Minh An · Đạt đủ mức · lên 1 cấp từ khảo sát' });
    expect(an).toHaveAttribute('href', '/enterprise/skill-gap/an');
    expect(an).toHaveTextContent('MA');
    expect(within(team).getByRole('link', { name: 'Lê Chi · Chưa có kết quả' })).toHaveAttribute('data-state', 'none');
    expect(within(team).getByText('Chưa có vị trí')).toBeInTheDocument();
    const small = within(team).getByRole('button', { name: 'Thiếu 1–2 mức: 1 người' });
    fireEvent.click(small);
    expect(small).toHaveAttribute('aria-pressed', 'true');
    expect(an.closest('[data-focus]')).toHaveAttribute('data-focus', 'small');
    fireEvent.click(small);
    expect(an.closest('.ov-team__groups')).not.toHaveAttribute('data-focus');
  });

  it('draws the company courses as a small wheel: owned out of all, one segment per course', () => {
    renderPage();
    const courses = screen.getByRole('region', { name: 'Khóa học của công ty' });
    expect(within(courses).getByRole('img', { name: '3/4 khóa học đã có' })).toBeInTheDocument();
    expect(within(courses).getAllByRole('link').filter((el) => el.tagName === 'path')).toHaveLength(4);
    expect(within(courses).getByRole('link', { name: 'Khóa M1-A: Dữ liệu · Nâng cao · Chưa mua' })).toBeInTheDocument();
    expect(courses).toHaveTextContent('Còn 1 khóa chưa mua');
  });

  it('says whether people learn: learners, courses finished, weeks, latest completions', () => {
    renderPage();
    const rhythm = screen.getByRole('region', { name: 'Nhịp học' });
    expect(rhythm).toHaveTextContent('2người đang học');
    expect(rhythm).toHaveTextContent('5khóa đã học xong');
    expect(within(rhythm).getByText('+2 trong 30 ngày')).toBeInTheDocument();
    // a table for screen readers, one row per week
    expect(within(rhythm).getAllByRole('row').slice(1).map((row) => row.textContent)).toEqual(['09/1121', '16/1110']);
    const recent = screen.getByRole('region', { name: 'Vừa học xong' });
    expect(within(recent).getByRole('link', { name: /Trần Minh An/ })).toHaveTextContent('Trần Minh AnChiến lược tìm kiếmTrung cấpHôm nay');
  });
});
