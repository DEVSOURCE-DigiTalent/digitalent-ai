import { describe, it, expect } from 'vitest';
import { parseInviteCsv } from '../csv';

const known = { departments: ['Kinh doanh', 'Kế toán'], positions: ['Kế toán', 'Marketing'] };

describe('parseInviteCsv', () => {
  it('reads rows with every column and skips the header', () => {
    const text = 'email,họ tên,phòng ban,vị trí,vai trò\nan@x.vn,Nguyễn An,Kinh doanh,Marketing,Quản lý';

    expect(parseInviteCsv(text, known)).toEqual({
      rows: [{ email: 'an@x.vn', fullName: 'Nguyễn An', departmentName: 'Kinh doanh', positionName: 'Marketing', role: 'MANAGER' }],
      issues: [],
    });
  });

  it('defaults the role to employee and leaves department and position empty', () => {
    const { rows } = parseInviteCsv('binh@x.vn,Lê Bình', known);

    expect(rows).toEqual([{ email: 'binh@x.vn', fullName: 'Lê Bình', departmentName: undefined, positionName: undefined, role: 'EMPLOYEE' }]);
  });

  it('accepts semicolons and tabs, as spreadsheets in Vietnamese locales export them', () => {
    expect(parseInviteCsv('a@x.vn;An', known).rows).toHaveLength(1);
    expect(parseInviteCsv('a@x.vn\tAn', known).rows).toHaveLength(1);
  });

  it('lowercases emails and understands role codes as well as Vietnamese names', () => {
    const { rows } = parseInviteCsv('A@X.vn,An,,,LEARNING_ADMIN\nB@X.vn,Bình,,,học viên', known);

    expect(rows.map((r) => [r.email, r.role])).toEqual([['a@x.vn', 'OWNER'], ['b@x.vn', 'EMPLOYEE']]);
  });

  it('reports each bad line with its number and keeps the good ones', () => {
    const text = [
      'ok@x.vn,Tốt',
      'khong-phai-email,Sai',
      'thieu@x.vn,',
      'ok@x.vn,Trùng',
      'role@x.vn,Vai,,,Giám đốc',
      'dep@x.vn,Phòng,Kho,,',
      'pos@x.vn,Vị trí,,Pháp chế,',
    ].join('\n');

    const { rows, issues } = parseInviteCsv(text, known);

    expect(rows.map((r) => r.email)).toEqual(['ok@x.vn']);
    expect(issues.map((i) => i.line)).toEqual([2, 3, 4, 5, 6, 7]);
    expect(issues[0].message).toMatch(/Email không hợp lệ/);
    expect(issues[1].message).toMatch(/Thiếu họ tên/);
    expect(issues[2].message).toMatch(/lặp/);
    expect(issues[3].message).toMatch(/Vai trò/);
    expect(issues[4].message).toMatch(/Phòng ban chưa được tạo/);
    expect(issues[5].message).toMatch(/Vị trí chưa được chọn/);
  });

  it('keeps a comma inside a quoted cell and reads doubled quotes as one', () => {
    const { rows } = parseInviteCsv('a@x.vn,"Trần, An",,,\nb@x.vn,"Lê ""Bin"" Bình"', known);

    expect(rows.map((r) => r.fullName)).toEqual(['Trần, An', 'Lê "Bin" Bình']);
  });

  it('ignores blank lines and returns nothing for empty text', () => {
    expect(parseInviteCsv('\n\n', known)).toEqual({ rows: [], issues: [] });
  });
});
