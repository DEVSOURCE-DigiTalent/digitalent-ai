import type { MemberRole } from '@/types/commerce';

export interface ParsedEmployeeRow {
  id: string;
  fullName: string;
  email: string;
  employeeCode: string;
  departmentId: string;
  departmentName: string;
  jobPositionId: string;
  positionName: string;
  role: MemberRole;
  isValid: boolean;
  errors: string[];
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROLE_ALIASES: Record<string, MemberRole> = {
  owner: 'OWNER',
  'chủ sở hữu': 'OWNER',
  'chu so huu': 'OWNER',
  'chủ doanh nghiệp': 'OWNER',
  manager: 'MANAGER',
  'quản lý': 'MANAGER',
  'quan ly': 'MANAGER',
  'trưởng phòng': 'MANAGER',
  employee: 'EMPLOYEE',
  'nhân viên': 'EMPLOYEE',
  'nhan vien': 'EMPLOYEE',
  'học viên': 'EMPLOYEE',
};

/**
 * Tạo và tải về file CSV mẫu định dạng chuẩn UTF-8 (kèm BOM để mở trực tiếp trên Excel tiếng Việt không bị lỗi font).
 */
export function downloadEmployeeTemplate(
  departments: { id: string; name: string }[],
  positions: { id: string; name: string }[],
) {
  const dept1 = departments[0]?.name || 'Kinh doanh';
  const dept2 = departments[1]?.name || 'Kỹ thuật';
  const pos1 = positions.find((p) => p.name.includes('Kinh doanh'))?.name || positions[0]?.name || 'Chuyên viên kinh doanh';
  const pos2 = positions.find((p) => p.name.includes('Kỹ thuật') || p.name.includes('Phần mềm'))?.name || positions[1]?.name || 'Kỹ sư phần mềm';

  const rows = [
    ['Họ và tên', 'Email', 'Mã nhân viên', 'Phòng ban', 'Vị trí công việc', 'Vai trò'],
    ['Nguyễn Văn An', 'an.nguyen@congty.vn', 'NV001', dept1, pos1, 'Nhân viên'],
    ['Trần Thị Bình', 'binh.tran@congty.vn', 'NV002', dept2, pos2, 'Quản lý'],
    ['Lê Hoàng Long', 'long.le@congty.vn', 'NV003', dept1, pos1, 'Nhân viên'],
  ];

  const csvContent = '\uFEFF' + rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'mau_danh_sach_nhan_vien_digitalent.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Tách dòng tôn trọng dấu ngoặc kép và hỗ trợ tab, dấu phẩy, dấu chấm phẩy */
function splitLine(line: string): string[] {
  const separator = line.includes('\t') ? '\t' : line.includes(';') && !line.includes(',') ? ';' : ',';
  const cells: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        cell += '"';
        i++;
      } else {
        quoted = !quoted;
      }
    } else if (char === separator && !quoted) {
      cells.push(cell.trim());
      cell = '';
    } else {
      cell += char;
    }
  }
  cells.push(cell.trim());
  return cells;
}

function normalizeStr(s: string): string {
  return s.trim().toLowerCase().normalize('NFC');
}

/**
 * Phân tích nội dung file CSV/Excel thông minh, tự động nhận diện tiêu đề và ghép phòng ban/vị trí.
 */
export function parseSmartEmployeeCsv(
  text: string,
  departments: { id: string; name: string; code?: string }[],
  positions: { id: string; name: string; code?: string; departmentId?: string }[],
): { rows: ParsedEmployeeRow[]; issues: string[] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) {
    return { rows: [], issues: ['File hoặc nội dung tải lên trống.'] };
  }

  // Chuẩn bị map tìm kiếm phòng ban và vị trí (hỗ trợ cả tên và mã)
  const deptMap = new Map<string, { id: string; name: string; code?: string }>();
  departments.forEach((d) => {
    deptMap.set(normalizeStr(d.name), d);
    if (d.code) deptMap.set(normalizeStr(d.code), d);
  });

  const posMap = new Map<string, { id: string; name: string; code?: string; departmentId?: string }>();
  positions.forEach((p) => {
    posMap.set(normalizeStr(p.name), p);
    if (p.code) posMap.set(normalizeStr(p.code), p);
  });

  // Kiểm tra dòng đầu tiên xem có phải là tiêu đề (header) không
  const firstLineCells = splitLine(lines[0]).map((c) => normalizeStr(c));
  let headerIndex = {
    fullName: -1,
    email: -1,
    employeeCode: -1,
    department: -1,
    position: -1,
    role: -1,
  };

  const hasHeader = firstLineCells.some((cell) =>
    ['họ và tên', 'họ tên', 'tên', 'name', 'full name', 'email', 'e-mail', 'phòng ban', 'bộ phận', 'department'].some((k) =>
      cell.includes(k),
    ),
  );

  let dataLines = lines;
  if (hasHeader) {
    firstLineCells.forEach((cell, idx) => {
      if (['họ và tên', 'họ tên', 'tên', 'full name', 'fullname', 'name'].some((k) => cell === k || cell.includes(k))) {
        if (headerIndex.fullName === -1) headerIndex.fullName = idx;
      } else if (['email', 'e-mail', 'mail', 'hộp thư'].some((k) => cell === k || cell.includes(k))) {
        if (headerIndex.email === -1) headerIndex.email = idx;
      } else if (['mã nhân viên', 'mã nv', 'manv', 'employee code', 'code', 'id'].some((k) => cell === k || cell.includes(k))) {
        if (headerIndex.employeeCode === -1) headerIndex.employeeCode = idx;
      } else if (['phòng ban', 'bộ phận', 'phòng', 'department', 'dept'].some((k) => cell === k || cell.includes(k))) {
        if (headerIndex.department === -1) headerIndex.department = idx;
      } else if (['vị trí', 'chức danh', 'chức vụ', 'vị trí công việc', 'position', 'job position', 'title'].some((k) => cell === k || cell.includes(k))) {
        if (headerIndex.position === -1) headerIndex.position = idx;
      } else if (['vai trò', 'role', 'quyền'].some((k) => cell === k || cell.includes(k))) {
        if (headerIndex.role === -1) headerIndex.role = idx;
      }
    });
    dataLines = lines.slice(1);
  } else {
    // Không có header rõ ràng -> phỏng đoán theo vị trí phổ biến:
    // Nếu cell 0 có '@' -> email, fullName, code, department, position, role
    // Nếu cell 1 có '@' -> fullName, email, code, department, position, role
    const sampleCells = splitLine(lines[0]);
    if (sampleCells[0] && sampleCells[0].includes('@')) {
      headerIndex = { email: 0, fullName: 1, employeeCode: 2, department: 3, position: 4, role: 5 };
    } else {
      headerIndex = { fullName: 0, email: 1, employeeCode: 2, department: 3, position: 4, role: 5 };
    }
  }

  const rows: ParsedEmployeeRow[] = [];
  const issues: string[] = [];
  const seenEmails = new Set<string>();

  dataLines.forEach((line, index) => {
    const lineNum = hasHeader ? index + 2 : index + 1;
    const cells = splitLine(line);
    if (cells.length === 0 || cells.every((c) => !c.trim())) return;

    const getVal = (idx: number) => (idx >= 0 && idx < cells.length ? cells[idx].trim() : '');

    const fullName = getVal(headerIndex.fullName);
    const email = getVal(headerIndex.email).toLowerCase();
    const employeeCode = getVal(headerIndex.employeeCode);
    const deptRaw = getVal(headerIndex.department);
    const posRaw = getVal(headerIndex.position);
    const roleRaw = getVal(headerIndex.role);

    const errors: string[] = [];

    // Kiểm tra Họ tên
    if (!fullName) {
      errors.push('Thiếu họ và tên');
    }

    // Kiểm tra Email
    if (!email) {
      errors.push('Thiếu email');
    } else if (!EMAIL_PATTERN.test(email)) {
      errors.push(`Email không đúng định dạng (${email})`);
    } else if (seenEmails.has(email)) {
      errors.push(`Email bị trùng lặp trong file (${email})`);
    } else {
      seenEmails.add(email);
    }

    // Khớp Phòng ban (hỗ trợ cả tìm mờ và theo mã)
    let matchedDept = deptRaw ? deptMap.get(normalizeStr(deptRaw)) : undefined;
    if (!matchedDept && deptRaw) {
      const target = normalizeStr(deptRaw);
      matchedDept = departments.find((d) =>
        normalizeStr(d.name).includes(target) ||
        target.includes(normalizeStr(d.name)) ||
        (d.code && normalizeStr(d.code) === target),
      );
    }

    // Khớp Vị trí công việc (hỗ trợ cả tìm mờ và theo mã)
    let matchedPos = posRaw ? posMap.get(normalizeStr(posRaw)) : undefined;
    if (!matchedPos && posRaw) {
      const target = normalizeStr(posRaw);
      matchedPos = positions.find((p) =>
        normalizeStr(p.name).includes(target) ||
        target.includes(normalizeStr(p.name)) ||
        (p.code && normalizeStr(p.code) === target),
      );
    }

    // Khớp Vai trò
    const role: MemberRole = roleRaw ? ROLE_ALIASES[normalizeStr(roleRaw)] || 'EMPLOYEE' : 'EMPLOYEE';

    // Không bắt buộc phải có sẵn phòng ban trong hệ thống — file có gì sẽ tự động tạo phòng ban đó
    if (!matchedDept && !deptRaw && role !== 'OWNER') {
      errors.push('Chưa có thông tin phòng ban');
    }

    rows.push({
      id: `imp-${lineNum}-${email || Math.random().toString(36).substring(2, 7)}`,
      fullName,
      email,
      employeeCode,
      departmentId: matchedDept ? matchedDept.id : (deptRaw ? `new:${deptRaw}` : ''),
      departmentName: matchedDept ? matchedDept.name : deptRaw,
      jobPositionId: matchedPos ? matchedPos.id : (posRaw ? `new:${posRaw}` : ''),
      positionName: matchedPos ? matchedPos.name : posRaw,
      role,
      isValid: errors.length === 0,
      errors,
    });
  });

  return { rows, issues };
}
