import { describe, expect, it } from 'vitest';
import { parseCsv, rowsFromCells } from '../lib/participant-file';
import { isRowEmpty, rowError } from '../lib/participant-rows';
import { getHomePath } from '@/lib/navigation';
import { inferWorkspace } from '@/lib/roles';
import { trialGateOf } from '@/features/pulse-employee/lib/trial-gate';
import type { MyTrialAssessment } from '@/services/trial-program.service';
import { formatMoneyShort } from '../lib/trial-format';
import { learners, planTotals, type PlanLevels } from '../lib/trial-plan';

describe('trial participant file', () => {
  it('maps Vietnamese headers in any order and skips blank rows', () => {
    const rows = rowsFromCells([
      ['Email', 'Họ và tên', 'Vị trí', 'Phòng ban'],
      ['an@cty.vn', 'Nguyễn An', 'Kế toán viên', 'Kế toán'],
      ['', '', '', ''],
      ['binh@cty.vn', 'Trần Bình', 'Sales', 'Kinh doanh'],
    ]);
    expect(rows).toEqual([
      { fullName: 'Nguyễn An', email: 'an@cty.vn', department: 'Kế toán', position: 'Kế toán viên' },
      { fullName: 'Trần Bình', email: 'binh@cty.vn', department: 'Kinh doanh', position: 'Sales' },
    ]);
  });

  it('uses the template order when the file has no header row', () => {
    expect(rowsFromCells([['Lê Chi', 'chi@cty.vn', 'Marketing', 'Chuyên viên']])).toEqual([
      { fullName: 'Lê Chi', email: 'chi@cty.vn', department: 'Marketing', position: 'Chuyên viên' },
    ]);
  });

  it('reads CSV with a BOM, semicolons and quoted commas', () => {
    expect(parseCsv('﻿Họ tên;Email;Phòng ban;Vị trí\r\n"Phạm, Dũng";dung@cty.vn;Kế toán;"Trưởng ""nhóm"""\r\n')).toEqual([
      ['Họ tên', 'Email', 'Phòng ban', 'Vị trí'],
      ['Phạm, Dũng', 'dung@cty.vn', 'Kế toán', 'Trưởng "nhóm"'],
    ]);
  });

  it('flags incomplete rows and ignores empty ones', () => {
    expect(isRowEmpty({ fullName: ' ', email: '', department: '', position: '' })).toBe(true);
    expect(rowError({ fullName: 'An', email: 'an@', department: 'KT', position: 'KTV' })).toBe('Email chưa đúng');
    expect(rowError({ fullName: 'An', email: 'an@cty.vn', department: '', position: 'KTV' })).toBe('Thiếu phòng ban');
    expect(rowError({ fullName: 'An', email: 'an@cty.vn', department: 'KT', position: 'KTV' })).toBeNull();
  });
});

describe('trial navigation', () => {
  it('sends mentors to their review queue in the platform workspace', () => {
    expect(inferWorkspace(['MENTOR'])).toBe('platform');
    expect(getHomePath({ roles: ['MENTOR'], workspace: 'platform' })).toBe('/platform/course-reviews');
    expect(getHomePath({ roles: ['PLATFORM_ADMIN'], workspace: 'platform' })).toBe('/platform/dashboard');
  });

  it('sends the owner of a trial organization to the dashboard with trial tracking', () => {
    const owner = { id: 'o', email: 'o@x.vn', fullName: 'O', roles: ['OWNER'], permissions: [], workspace: 'enterprise' as const };
    expect(getHomePath({ ...owner, enterpriseTrialStatus: 'trial_active' })).toBe('/enterprise/dashboard');
    expect(getHomePath({ ...owner, enterpriseTrialStatus: 'converted' })).toBe('/enterprise/dashboard');
    expect(getHomePath(owner)).toBe('/enterprise/dashboard');
  });
});

describe('trial learning gate', () => {
  const now = Date.parse('2026-10-28T10:00:00Z');
  const mine = (overrides: Partial<MyTrialAssessment>): MyTrialAssessment => ({
    organizationName: 'Demo', status: 'NOT_STARTED', canStart: true, choiceCount: 18, domains: [],
    reportPublished: false, testDeadline: '2026-10-31T10:00:00Z', ...overrides,
  });

  it('asks for the test first, waits for the test to close after submitting, opens once it is closed', () => {
    expect(trialGateOf(mine({}), now)).toBe('todo');
    // Doanh nghiệp chưa đặt hạn: chưa làm được nhưng không phải "đã đóng".
    expect(trialGateOf(mine({ canStart: false, testDeadline: null, closedMessage: 'Doanh nghiệp chưa đặt hạn làm bài.' }), now)).toBe('todo');
    expect(trialGateOf(mine({ canStart: false, testDeadline: '2026-10-27T10:00:00Z', closedMessage: 'Đã hết hạn.' }), now)).toBe('closed');
    expect(trialGateOf(mine({ status: 'SUBMITTED' }), now)).toBe('waiting');
    expect(trialGateOf(mine({ status: 'REPORTED', reportPublished: true }), now)).toBeNull();
    expect(trialGateOf(undefined, now)).toBeNull();
  });
});

describe('training scope totals', () => {
  // 2 lĩnh vực; giá theo cấp: Cơ bản miễn phí, Trung cấp 399k, Nâng cao 699k.
  const prices = [0, 0, 399_000, 699_000];
  const people = [
    { departmentId: 'kt', levels: [0, 2] },
    { departmentId: 'kt', levels: [1, 3] },
    { departmentId: 'mk', levels: [1, 1] },
  ];
  const plan: PlanLevels = { organization: [3, 2], departments: { kt: [1, null] } };

  it('counts a seat when the level is below the course tier and the tier is within the effective maximum', () => {
    // Lĩnh vực 1: Kế toán dừng ở Cơ bản (mức riêng), Marketing tới Nâng cao.
    expect(learners(people, plan, 0, 1).length).toBe(1);
    expect(learners(people, plan, 0, 2).map((p) => p.departmentId)).toEqual(['mk']);
    expect(learners(people, plan, 0, 3).map((p) => p.departmentId)).toEqual(['mk']);
    // Lĩnh vực 2: tối đa Trung cấp theo doanh nghiệp; ai đã đạt không cần suất.
    expect(learners(people, plan, 1, 2).map((p) => p.departmentId)).toEqual(['mk']);
    expect(learners(people, plan, 1, 3)).toEqual([]);
  });

  it('adds up paid courses, seats and cost; Basic is free', () => {
    const totals = planTotals(people, plan, prices);
    expect(totals.byTier[1]).toEqual({ courses: 1, seats: 1, cost: 0 });
    expect(totals.courses).toBe(3);
    expect(totals.seats).toBe(3);
    expect(totals.cost).toBe(399_000 * 2 + 699_000);
    expect(totals.costByDomain).toEqual([[399_000, 699_000], [399_000, 0]]);
    expect(formatMoneyShort(totals.cost)).toBe('1,5tr');
    expect(formatMoneyShort(399_000)).toBe('399k');
  });
});
