import { describe, expect, it } from 'vitest';
import { standardPositionChoices, standardPositionCode, standardPositionOptions } from '../standard-positions';

describe('standard positions', () => {
  it('reads a typed position as one of the 5 codes, else null', () => {
    expect(standardPositionCode('Giám đốc')).toBe('CEO');
    expect(standardPositionCode('nhân sự (hr)')).toBe('HR');
    expect(standardPositionCode('Sales')).toBe('SALES_CRM');
    expect(standardPositionCode('Kế toán')).toBe('ACCOUNTANT');
    expect(standardPositionCode('Lập trình viên')).toBeNull();
  });

  it('offers the 5 in every department: own name or catalog label, none taken out of use', () => {
    const positions = [
      { id: 'p1', code: 'ACCOUNTANT', name: 'Kế toán viên', status: 'ACTIVE' },
      { id: 'p2', code: 'HR', name: 'Nhân sự', status: 'INACTIVE' },
    ];
    expect(standardPositionChoices(positions)).toEqual(['CEO / Giám đốc', 'Marketing', 'Sales / CRM', 'Kế toán viên']);
    expect(standardPositionOptions(positions).map((o) => o.value)).toEqual(['new:CEO / Giám đốc', 'new:Marketing', 'new:Sales / CRM', 'p1']);
  });
});
