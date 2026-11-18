import { describe, expect, it } from 'vitest';
import type { PlatformCourseOrder } from '@/services/platform-admin.service';
import { extractContracts } from '../console/components/contracts';

function order(partial: Partial<PlatformCourseOrder>): PlatformCourseOrder {
  return {
    id: 'o', organizationId: 'org', organizationName: 'Org', courseCode: 'M1-I', courseTitle: 'Khóa',
    amount: 3990000, reason: null,
    createdByEmail: null, createdAt: '2026-11-14T16:47:00Z', ...partial,
  };
}

describe('extractContracts', () => {
  it('groups purchases by electronic contract code and reads the signer without the phone number', () => {
    const reason = '[Hợp đồng điện tử: DT-ESIGN-4MQLNW8] Đại diện: Nguyễn Thế Hùng (0988776655)';
    const contracts = extractContracts([
      order({ id: '1', reason }),
      order({ id: '2', reason, courseCode: 'M2-A', amount: 2000000, createdAt: '2026-11-14T16:40:00Z' }),
    ]);

    expect(contracts).toEqual([
      {
        code: 'DT-ESIGN-4MQLNW8', signer: 'Nguyễn Thế Hùng', orderCount: 2,
        totalAmount: 5990000, signedAt: '2026-11-14T16:40:00Z',
      },
    ]);
  });

  it('ignores purchases without a contract code', () => {
    const contracts = extractContracts([
      order({ reason: 'Doanh nghiệp mua khóa học' }),
      order({ reason: null }),
    ]);
    expect(contracts).toEqual([]);
  });

  it('lists the newest contract first and keeps a missing signer as null', () => {
    const contracts = extractContracts([
      order({ id: 'old', reason: '[Hợp đồng điện tử: DT-ESIGN-OLD]', createdAt: '2026-10-01T00:00:00Z' }),
      order({ id: 'new', reason: '[Hợp đồng điện tử: DT-ESIGN-NEW] Đại diện: Trần Văn B', createdAt: '2026-11-01T00:00:00Z' }),
    ]);
    expect(contracts.map((c) => c.code)).toEqual(['DT-ESIGN-NEW', 'DT-ESIGN-OLD']);
    expect(contracts[0].signer).toBe('Trần Văn B');
    expect(contracts[1].signer).toBeNull();
  });
});
