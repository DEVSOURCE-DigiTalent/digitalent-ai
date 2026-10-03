import type { InviteRow, MemberRole } from '@/types/commerce';

export interface CsvIssue {
  /** 1-based line number in the pasted text. */
  line: number;
  message: string;
}

export interface CsvParseResult {
  rows: InviteRow[];
  issues: CsvIssue[];
}

const ROLE_ALIASES: Record<string, MemberRole> = {
  owner: 'OWNER',
  'chủ doanh nghiệp': 'OWNER',
  'chu doanh nghiep': 'OWNER',
  manager: 'MANAGER',
  'quản lý': 'MANAGER',
  'quan ly': 'MANAGER',
  employee: 'EMPLOYEE',
  'nhân viên': 'EMPLOYEE',
  'nhan vien': 'EMPLOYEE',
  // Legacy aliases mapped to modern enterprise roles
  org_admin: 'OWNER',
  'quản trị tổ chức': 'OWNER',
  learning_admin: 'OWNER',
  'quản trị học tập': 'OWNER',
  learner: 'EMPLOYEE',
  'học viên': 'EMPLOYEE',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HEADER_PATTERN = /^(email|e-mail)\b/i;

/** Splits a line on commas or semicolons (Excel in Vietnamese locales exports semicolons) or tabs. */
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

/**
 * Reads pasted or uploaded CSV: `email, họ tên, phòng ban, vị trí, vai trò` (the last three are optional;
 * the role defaults to employee). A header row is skipped. A department or position that the organization
 * has not set up is reported rather than silently dropped.
 */
export function parseInviteCsv(
  text: string,
  known: { departments: string[]; positions: string[] },
): CsvParseResult {
  const rows: InviteRow[] = [];
  const issues: CsvIssue[] = [];
  const seen = new Set<string>();

  text.split(/\r?\n/).forEach((rawLine, index) => {
    const line = index + 1;
    if (!rawLine.trim() || (index === 0 && HEADER_PATTERN.test(rawLine.trim()))) return;

    const [email = '', fullName = '', departmentName = '', positionName = '', roleText = ''] = splitLine(rawLine);
    const normalizedEmail = email.toLowerCase();

    if (!EMAIL_PATTERN.test(normalizedEmail)) return void issues.push({ line, message: `Email không hợp lệ: "${email}"` });
    if (!fullName) return void issues.push({ line, message: 'Thiếu họ tên' });
    if (seen.has(normalizedEmail)) return void issues.push({ line, message: `Email bị lặp: ${normalizedEmail}` });

    const role = roleText ? ROLE_ALIASES[roleText.toLowerCase()] : 'EMPLOYEE';
    if (!role) return void issues.push({ line, message: `Vai trò không hợp lệ: "${roleText}"` });
    if (departmentName && !known.departments.includes(departmentName)) {
      return void issues.push({ line, message: `Phòng ban chưa được tạo: "${departmentName}"` });
    }
    if (positionName && !known.positions.includes(positionName)) {
      return void issues.push({ line, message: `Vị trí chưa được chọn: "${positionName}"` });
    }

    seen.add(normalizedEmail);
    rows.push({
      email: normalizedEmail,
      fullName,
      departmentName: departmentName || undefined,
      positionName: positionName || undefined,
      role,
    });
  });

  return { rows, issues };
}
