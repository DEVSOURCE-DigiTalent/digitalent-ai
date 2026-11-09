import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, vi } from 'vitest';

vi.hoisted(() => {
  vi.stubEnv('VITE_USE_MOCK', 'true');
});

import { signInAsMock, signOut, MOCK_EMAILS } from '@/test/session';
import { learningService } from '@/services/learning.service';

beforeAll(async () => {
  await import('@/services/mock/server/mock-adapter');
});

afterAll(() => {
  vi.unstubAllEnvs();
});

describe('Learning assessments and certificates data scoping', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    signOut();
  });

  it('restricts EMPLOYEE to seeing only their own assessment attempts and certificates', async () => {
    // employee@digitalent.ai is emp-01 (Hoàng Văn Nhân Viên)
    signInAsMock(MOCK_EMAILS.employee);

    const attemptsRes = await learningService.getAssessmentHistory();
    expect(attemptsRes.data.success).toBe(true);
    const attempts = attemptsRes.data.data!.items;
    expect(attempts.length).toBeGreaterThan(0);
    // Every attempt returned must belong to emp-01
    expect(attempts.every((a) => a.employeeId === 'emp-01')).toBe(true);
    expect(attempts.some((a) => a.employeeId === 'emp-02')).toBe(false);

    const certsRes = await learningService.getCertificates();
    expect(certsRes.data.success).toBe(true);
    const certs = certsRes.data.data!.items;
    expect(certs.length).toBeGreaterThan(0);
    // Every certificate returned must belong to emp-01
    expect(certs.every((c) => c.employeeId === 'emp-01')).toBe(true);
    expect(certs.some((c) => c.employeeId === 'emp-02' || c.employeeId === 'emp-07')).toBe(false);
  });

  it('restricts MANAGER to seeing only attempts and certificates of employees in their department scope', async () => {
    // manager@digitalent.ai is emp-02 (Phạm Thị Quản Lý), managing dep-kd
    signInAsMock(MOCK_EMAILS.manager);

    const attemptsRes = await learningService.getAssessmentHistory();
    expect(attemptsRes.data.success).toBe(true);
    const attempts = attemptsRes.data.data!.items;
    expect(attempts.length).toBeGreaterThan(0);
    // Should see attempts of dep-kd employees (emp-02, emp-06, emp-07...)
    expect(attempts.some((a) => a.employeeId === 'emp-02')).toBe(true);
    expect(attempts.some((a) => a.employeeId === 'emp-07')).toBe(true);
    // employee@ (emp-01) is in the manager's department since ece40cb; emp-05 (dep-ns) is not.
    expect(attempts.every((a) => ['emp-01', 'emp-02', 'emp-06', 'emp-07', 'emp-12'].includes(a.employeeId))).toBe(true);
    expect(attempts.some((a) => a.employeeId === 'emp-05')).toBe(false);

    const certsRes = await learningService.getCertificates();
    expect(certsRes.data.success).toBe(true);
    const certs = certsRes.data.data!.items;
    expect(certs.length).toBeGreaterThan(0);
    // Should see cert-001 (emp-07) and cert-002 (emp-02) from dep-kd
    expect(certs.some((c) => c.employeeId === 'emp-02')).toBe(true);
    expect(certs.some((c) => c.employeeId === 'emp-07')).toBe(true);
    // cert-003 of emp-01 is in scope now; nothing from another department.
    expect(certs.every((c) => ['emp-01', 'emp-02', 'emp-06', 'emp-07', 'emp-12'].includes(c.employeeId))).toBe(true);
  });

  it('allows OWNER to see assessment attempts and certificates of the entire organization', async () => {
    // owner@digitalent.ai is emp-03 (Nguyễn Văn Chủ), OWNER
    signInAsMock(MOCK_EMAILS.owner);

    const attemptsRes = await learningService.getAssessmentHistory();
    expect(attemptsRes.data.success).toBe(true);
    const attempts = attemptsRes.data.data!.items;
    expect(attempts.length).toBeGreaterThan(0);
    // Owner sees employees across departments: emp-01 (dep-kt), emp-02 (dep-kd), emp-05 (dep-ns), emp-07 (dep-kd)...
    expect(attempts.some((a) => a.employeeId === 'emp-01')).toBe(true);
    expect(attempts.some((a) => a.employeeId === 'emp-02')).toBe(true);
    expect(attempts.some((a) => a.employeeId === 'emp-05')).toBe(true);
    expect(attempts.some((a) => a.employeeId === 'emp-07')).toBe(true);

    const certsRes = await learningService.getCertificates();
    expect(certsRes.data.success).toBe(true);
    const certs = certsRes.data.data!.items;
    expect(certs.length).toBeGreaterThanOrEqual(3);
    // Owner sees certs across departments
    expect(certs.some((c) => c.employeeId === 'emp-01')).toBe(true);
    expect(certs.some((c) => c.employeeId === 'emp-02')).toBe(true);
    expect(certs.some((c) => c.employeeId === 'emp-07')).toBe(true);
  });
});
