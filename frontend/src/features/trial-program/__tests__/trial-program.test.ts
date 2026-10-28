import { describe, expect, it } from 'vitest';
import { parseCsv, rowsFromCells } from '../lib/participant-file';
import { isRowEmpty, rowError } from '../lib/participant-rows';
import { getHomePath } from '@/lib/navigation';
import { inferWorkspace } from '@/lib/roles';
import { trialGateOf } from '@/features/pulse-employee/lib/trial-gate';
import type { MyTrialAssessment } from '@/services/trial-program.service';
import { suggestLevel } from '../lib/trial-format';

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
    expect(getHomePath({ roles: ['MENTOR'], workspace: 'platform' })).toBe('/platform/reviews');
    expect(getHomePath({ roles: ['PLATFORM_ADMIN'], workspace: 'platform' })).toBe('/platform/dashboard');
  });

  it('sends the owner of a trial organization to the trial page', () => {
    const owner = { id: 'o', email: 'o@x.vn', fullName: 'O', roles: ['OWNER'], permissions: [], workspace: 'enterprise' as const };
    expect(getHomePath({ ...owner, enterpriseTrialStatus: 'trial_active' })).toBe('/enterprise/trial');
    expect(getHomePath({ ...owner, enterpriseTrialStatus: 'converted' })).toBe('/enterprise/dashboard');
    expect(getHomePath(owner)).toBe('/enterprise/dashboard');
  });
});

describe('trial learning gate', () => {
  const now = Date.parse('2026-10-28T10:00:00Z');
  const mine = (overrides: Partial<MyTrialAssessment>): MyTrialAssessment => ({
    organizationName: 'Demo', status: 'NOT_STARTED', canStart: true, choiceCount: 18, domains: [], essays: [],
    reportPublished: false, testDeadline: '2026-10-31T10:00:00Z', ...overrides,
  });

  it('asks for the test first, waits for the mentor after submitting, opens once the report is published', () => {
    expect(trialGateOf(mine({}), now)).toBe('todo');
    // Doanh nghiệp chưa đặt hạn: chưa làm được nhưng không phải "đã đóng".
    expect(trialGateOf(mine({ canStart: false, testDeadline: null, closedMessage: 'Doanh nghiệp chưa đặt hạn làm bài.' }), now)).toBe('todo');
    expect(trialGateOf(mine({ canStart: false, testDeadline: '2026-10-27T10:00:00Z', closedMessage: 'Đã hết hạn.' }), now)).toBe('closed');
    expect(trialGateOf(mine({ status: 'SUBMITTED' }), now)).toBe('waiting');
    expect(trialGateOf(mine({ status: 'REVIEWED', reportPublished: true }), now)).toBeNull();
    expect(trialGateOf(undefined, now)).toBeNull();
  });
});

describe('mentor suggested level', () => {
  it('caps the multiple-choice level by the essays passed in a row once all three are scored', () => {
    expect(suggestLevel(3, [7, 6, 4], 5)).toBe(2);
    expect(suggestLevel(1, [9, 9, 9], 5)).toBe(1);
    expect(suggestLevel(3, [4, 9, 9], 5)).toBe(0);
    // Chưa chấm đủ tự luận: chỉ theo trắc nghiệm.
    expect(suggestLevel(2, [7, null, null], 5)).toBe(2);
  });
});
