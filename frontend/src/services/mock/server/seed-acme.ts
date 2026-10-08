import { distributeWeightsByDomain, isMandatoryFor, type DomainRow } from '../../../features/competency/utils/requirement-domains';
import {
  CATEGORY_BY_ID, COMPETENCIES, COURSES, type ReferencePositionCode,
} from './catalog';
import { calculateRun } from './org-logic';
import { referenceRequirementLines } from './requirements';
import { seedWork } from './seed-work';
import type {
  AssignmentRecord, AuditEntry, DepartmentRecord, EmployeeRecord,
  InternalCourseRecord, JobGradeRecord, JobPositionRecord, OrgData, ProfileMap,
  RequirementSetRecord, SeedInvitationRecord, SeedMemberRecord, TrainingBatchRecord,
} from './types';

/**
 * Demo organization behind the seeded accounts (owner@, manager@, employee@digitalent.demo):
 * "Công ty Cổ phần Acme".
 */

export const ACME_ORGANIZATION_ID = 'org-acme';

const DAY_MS = 24 * 60 * 60 * 1000;
const daysFromNow = (days: number) => new Date(Date.now() + days * DAY_MS).toISOString();
const dateFromNow = (days: number) => daysFromNow(days).slice(0, 10);

export const JOB_GRADES: JobGradeRecord[] = [
  { code: 'G1', name: 'Nhân viên', description: 'Cấp bậc nhân viên thực thi trực tiếp chuyên môn.' },
  { code: 'G2', name: 'Phó phòng', description: 'Cấp bậc quản lý cấp phó hoặc chuyên gia phụ trách mảng.' },
  { code: 'G3', name: 'Trưởng phòng', description: 'Cấp bậc quản lý cấp cao phụ trách phòng ban.' },
];

const DEPARTMENTS: Array<Pick<DepartmentRecord, 'id' | 'code' | 'name' | 'description' | 'managerEmployeeId'>> = [
  { id: 'dep-bgd', code: 'BGD', name: 'Ban giám đốc', description: 'Điều hành và định hướng chiến lược.', managerEmployeeId: 'emp-03' },
  { id: 'dep-kd', code: 'KD', name: 'Kinh doanh', description: 'Bán hàng và chăm sóc khách hàng.', managerEmployeeId: 'emp-02' },
  { id: 'dep-mkt', code: 'MKT', name: 'Marketing', description: 'Truyền thông và nội dung.', managerEmployeeId: 'emp-08' },
  { id: 'dep-ns', code: 'NS', name: 'Nhân sự', description: 'Tuyển dụng, đào tạo và phúc lợi.', managerEmployeeId: 'emp-05' },
  { id: 'dep-kt', code: 'KT', name: 'Kế toán', description: 'Kế toán, thuế và báo cáo tài chính.', managerEmployeeId: 'emp-10' },
];

const POSITIONS: Array<{
  id: string;
  reference: ReferencePositionCode;
  code: string;
  name: string;
  family: string;
  departmentId: string;
  jobGrade: 'G1' | 'G2' | 'G3';
}> = [
  { id: 'pos-ceo', reference: 'CEO', code: 'CEO', name: 'Giám đốc điều hành', family: 'jf-qt', departmentId: 'dep-bgd', jobGrade: 'G3' },
  { id: 'pos-hr', reference: 'HR', code: 'HR', name: 'Nhân sự', family: 'jf-nv', departmentId: 'dep-ns', jobGrade: 'G2' },
  { id: 'pos-mkt', reference: 'MARKETING', code: 'MARKETING', name: 'Marketing', family: 'jf-nv', departmentId: 'dep-mkt', jobGrade: 'G1' },
  { id: 'pos-sales', reference: 'SALES_CRM', code: 'SALES_CRM', name: 'Kinh doanh (CRM)', family: 'jf-nv', departmentId: 'dep-kd', jobGrade: 'G1' },
  { id: 'pos-acc', reference: 'ACCOUNTANT', code: 'ACCOUNTANT', name: 'Kế toán', family: 'jf-nv', departmentId: 'dep-kt', jobGrade: 'G1' },
  { id: 'pos-sales-lead', reference: 'SALES_CRM', code: 'SALES_LEAD', name: 'Trưởng phòng Kinh doanh', family: 'jf-nv', departmentId: 'dep-kd', jobGrade: 'G3' },
  { id: 'pos-acc-lead', reference: 'ACCOUNTANT', code: 'ACCOUNTANT_LEAD', name: 'Trưởng phòng Kế toán', family: 'jf-nv', departmentId: 'dep-kt', jobGrade: 'G3' },
];

interface EmployeeSeed {
  n: number;
  name: string;
  email: string;
  department: string;
  position?: string;
  /** Average confirmed level; 0.6 means mostly nothing confirmed yet, 2.6 mostly Advanced. */
  base: number;
  /** Id of the demo sign-in account of this person, if any. */
  accountId?: string;
  status?: EmployeeRecord['status'];
  roles: string[];
}

const EMPLOYEES: EmployeeSeed[] = [
  { n: 1, name: 'Hoàng Văn Nhân Viên', email: 'employee@digitalent.demo', department: 'dep-kd', position: 'pos-sales', base: 1, accountId: 'mock-employee', roles: ['EMPLOYEE'] },
  { n: 2, name: 'Phạm Thị Quản Lý', email: 'manager@digitalent.demo', department: 'dep-kd', position: 'pos-sales-lead', base: 2.3, accountId: 'mock-manager', roles: ['MANAGER'] },
  { n: 3, name: 'Nguyễn Văn Chủ', email: 'owner@digitalent.demo', department: 'dep-bgd', position: 'pos-ceo', base: 2.6, accountId: 'mock-owner', roles: ['OWNER'] },
  { n: 4, name: 'Trần Thị Nhân Sự', email: 'nhansu.tran@acme.vn', department: 'dep-ns', position: 'pos-hr', base: 2.2, roles: ['EMPLOYEE'] },
  { n: 5, name: 'Lê Văn Đào Tạo', email: 'daotao.le@acme.vn', department: 'dep-ns', position: 'pos-hr', base: 2.4, roles: ['EMPLOYEE'] },
  { n: 6, name: 'Đỗ Minh Quân', email: 'quan.do@acme.vn', department: 'dep-kd', position: 'pos-sales', base: 1.6, roles: ['EMPLOYEE'] },
  { n: 7, name: 'Vũ Thu Hà', email: 'ha.vu@acme.vn', department: 'dep-kd', position: 'pos-sales', base: 1.2, roles: ['EMPLOYEE'] },
  { n: 8, name: 'Bùi Thanh Tùng', email: 'tung.bui@acme.vn', department: 'dep-mkt', position: 'pos-mkt', base: 2.2, roles: ['MANAGER'] },
  { n: 9, name: 'Ngô Lan Anh', email: 'lananh.ngo@acme.vn', department: 'dep-mkt', position: 'pos-mkt', base: 1.5, roles: ['EMPLOYEE'] },
  { n: 10, name: 'Đặng Văn Kiên', email: 'kien.dang@acme.vn', department: 'dep-kt', position: 'pos-acc-lead', base: 2.1, roles: ['MANAGER'] },
  { n: 11, name: 'Lý Mai Phương', email: 'phuong.ly@acme.vn', department: 'dep-kt', position: 'pos-acc', base: 0.6, roles: ['EMPLOYEE'] },
  { n: 12, name: 'Trịnh Quốc Bảo', email: 'bao.trinh@acme.vn', department: 'dep-kd', position: 'pos-sales', base: 1.4, status: 'INACTIVE', roles: ['EMPLOYEE'] },
  { n: 13, name: 'Phan Gia Hân', email: 'han.phan@acme.vn', department: 'dep-mkt', position: 'pos-mkt', base: 0.9, roles: ['EMPLOYEE'] },
];

const empId = (n: number) => `emp-${String(n).padStart(2, '0')}`;

function hash(text: string): number {
  let value = 2166136261;
  for (const char of text) value = Math.imul(value ^ char.charCodeAt(0), 16777619) >>> 0;
  return value;
}

/** Deterministic level around the person's base level, so every run of the demo shows the same people. */
function levelFor(employeeId: string, frameworkCode: string, base: number, flat: boolean): number {
  if (flat) return Math.round(base);
  const jitter = ((hash(`${employeeId}:${frameworkCode}`) % 5) - 2) / 4;
  return Math.max(0, Math.min(3, Math.round(base + jitter)));
}

function buildProfiles(): ProfileMap {
  const confirmedAt = daysFromNow(-30);
  const profiles: ProfileMap = {};
  for (const seed of EMPLOYEES) {
    const id = empId(seed.n);
    profiles[id] = {};
    for (const competency of COMPETENCIES) {
      const level = levelFor(id, competency.frameworkCode, seed.base, seed.n === 1);
      if (level > 0) profiles[id][competency.id] = { level, source: 'MIGRATION', confirmedAt };
    }
  }
  return profiles;
}

function itemsFrom(rows: DomainRow[]): RequirementSetRecord['items'] {
  return distributeWeightsByDomain(rows)
    .filter((row) => row.requiredLevel > 0)
    .map((row) => ({
      id: `item-${row.competencyId}-${Math.random().toString(36).slice(2, 7)}`,
      competencyId: row.competencyId,
      requiredLevel: row.requiredLevel,
      weightPercent: row.weightPercent,
      isMandatory: row.isMandatory,
      requiresPracticalEvidence: true,
    }));
}

function rowsFromLines(lines: ReturnType<typeof referenceRequirementLines>, edit?: (code: string, level: number) => number): DomainRow[] {
  const byId = new Map(lines.map((l) => [l.competencyId, l.requiredLevel]));
  return COMPETENCIES.map((competency) => {
    const category = CATEGORY_BY_ID.get(competency.categoryId)!;
    const base = byId.get(competency.id) ?? 0;
    const level = edit ? edit(competency.frameworkCode, base) : base;
    return {
      competencyId: competency.id,
      competencyCode: competency.code,
      competencyName: competency.name,
      frameworkCode: competency.frameworkCode,
      categoryId: category.id,
      categoryName: category.name,
      categorySortOrder: category.sortOrder,
      requiredLevel: level,
      weightPercent: 0,
      isMandatory: isMandatoryFor(level, competency.frameworkCode),
      requiresPracticalEvidence: true,
    };
  });
}

function buildRequirementSets(): RequirementSetRecord[] {
  const sets: RequirementSetRecord[] = [];
  for (const position of POSITIONS) {
    const lines = referenceRequirementLines(position.reference);
    const active: RequirementSetRecord = {
      id: `req-${position.id}-${position.reference === 'SALES_CRM' ? 2 : 1}`,
      jobPositionId: position.id,
      versionNo: position.reference === 'SALES_CRM' ? 2 : 1,
      status: 'ACTIVE',
      effectiveFrom: dateFromNow(-30),
      reviewDate: dateFromNow(150),
      createdByUserId: 'mock-learning',
      activatedByUserId: 'mock-learning',
      activatedAt: daysFromNow(-30),
      items: itemsFrom(rowsFromLines(lines)),
    };

    if (position.reference === 'SALES_CRM') {
      // An older, smaller set that was replaced: shows up in the version history.
      sets.push({
        id: `req-${position.id}-1`,
        jobPositionId: position.id,
        versionNo: 1,
        status: 'RETIRED',
        effectiveFrom: dateFromNow(-200),
        effectiveTo: dateFromNow(-31),
        createdByUserId: 'mock-learning',
        activatedByUserId: 'mock-learning',
        activatedAt: daysFromNow(-200),
        items: itemsFrom(rowsFromLines(lines, (code, level) => (['1.1', '1.3', '2.1', '2.2', '2.4', '4.1', '4.2', '5.2', '6.1'].includes(code) ? Math.min(level, 2) : 0))),
      });
    }

    sets.push(active);

    if (position.reference === 'MARKETING') {
      // A draft in preparation next to the active set: 3.4 goes up, 2.3 is added.
      sets.push({
        id: `req-${position.id}-2`,
        jobPositionId: position.id,
        versionNo: 2,
        status: 'DRAFT',
        createdByUserId: 'mock-learning',
        items: itemsFrom(rowsFromLines(lines, (code, level) => (code === '3.4' ? 3 : code === '2.3' ? 1 : level))),
      });
    }
  }
  return sets;
}

function buildAssignments(): AssignmentRecord[] {
  const courseId = (code: string) => COURSES.find((c) => c.code === code)!.id;
  type Row = [employee: number, course: string, status: AssignmentRecord['status'], progress: number, dueInDays: number | undefined, source: AssignmentRecord['source']];
  const rows: Row[] = [
    [1, 'A1-I', 'IN_PROGRESS', 40, 30, 'MANUAL'],
    [1, 'A4-I', 'NOT_STARTED', 0, 45, 'RECOMMENDATION'],
    [6, 'A2-I', 'IN_PROGRESS', 70, 9, 'MANUAL'],
    [7, 'A2-F', 'COMPLETED', 100, undefined, 'MANUAL'],
    [8, 'M6-I', 'READY_FOR_ASSESSMENT', 100, 14, 'MANUAL'],
    [9, 'A3-I', 'NOT_STARTED', 0, -6, 'MANUAL'],
    [10, 'A1-A', 'IN_PROGRESS', 20, 60, 'MANUAL'],
    [11, 'A4-F', 'IN_PROGRESS', 55, 19, 'MANUAL'],
    [13, 'A1-F', 'NOT_STARTED', 0, 4, 'MANUAL'],
    [2, 'M6-I', 'COMPLETED', 100, undefined, 'RECOMMENDATION'],
  ];
  return rows.map(([employee, course, status, progress, due, source], index) => ({
    id: `asg-${String(index + 1).padStart(3, '0')}`,
    employeeId: empId(employee),
    courseId: courseId(course),
    assignedByName: 'Lê Văn Học Tập',
    assignedAt: daysFromNow(-40 + index),
    dueDate: due === undefined ? undefined : dateFromNow(due),
    source,
    status,
    progressPercent: progress,
    completedAt: status === 'COMPLETED' ? daysFromNow(-12) : undefined,
  }));
}

function buildAudit(): AuditEntry[] {
  const rows: Array<[number, string, string, string, string, string?]> = [
    [-2, 'Trần Thị Quản Trị', 'MEMBER_INVITED', 'Lời mời', 'Mai Hoàng', 'Vai trò Học viên'],
    [-3, 'Trần Thị Quản Trị', 'MEMBER_INVITED', 'Lời mời', 'Cao Đức Long', 'Vai trò Học viên'],
    [-9, 'Trần Thị Quản Trị', 'MEMBER_DEACTIVATED', 'Thành viên', 'Trịnh Quốc Bảo', 'Lý do: nghỉ việc'],
    [-15, 'Nguyễn Văn Chủ', 'ROLE_CHANGED', 'Thành viên', 'Bùi Thanh Tùng', 'Học viên → Quản lý'],
    [-21, 'Lê Văn Học Tập', 'COURSE_ASSIGNED', 'Khóa học', 'A4-F cho Lý Mai Phương'],
    [-30, 'Lê Văn Học Tập', 'REQUIREMENT_ACTIVATED', 'Yêu cầu năng lực', 'Kinh doanh (CRM) v2'],
    [-31, 'Nguyễn Văn Chủ', 'ORGANIZATION_UPDATED', 'Tổ chức', 'Công ty Cổ phần Acme', 'Cập nhật quy mô'],
    [-45, 'Nguyễn Văn Chủ', 'SUBSCRIPTION_PURCHASED', 'Gói dịch vụ', 'Doanh nghiệp Pro', '100 người dùng'],
  ];
  return rows.map(([days, actorName, action, targetType, targetLabel, detail], index) => ({
    id: `aud-${String(index + 1).padStart(3, '0')}`,
    at: daysFromNow(days),
    actorName,
    action,
    targetType,
    targetLabel,
    detail,
  }));
}


function buildInternalCourses(): InternalCourseRecord[] {
  return [
    {
      id: 'icrs-001',
      code: 'NB-01',
      title: 'Văn hóa doanh nghiệp và Quy chuẩn làm việc số Acme',
      description: 'Khóa nhập môn bắt buộc dành cho nhân sự mới gia nhập Công ty Cổ phần Acme.',
      category: 'Văn hóa & Hội nhập',
      modulesCount: 3,
      durationMinutes: 90,
      status: 'PUBLISHED',
      createdAt: daysFromNow(-50),
      updatedAt: daysFromNow(-10),
    },
    {
      id: 'icrs-002',
      code: 'NB-02',
      title: 'Quy trình kiểm soát rủi ro thông tin nội bộ 2026',
      description: 'Hướng dẫn thực thi chính sách bảo vệ thông tin mật và báo cáo sự cố an ninh số.',
      category: 'Chính sách & Tuân thủ',
      modulesCount: 2,
      durationMinutes: 60,
      status: 'DRAFT',
      createdAt: daysFromNow(-15),
      updatedAt: daysFromNow(-2),
    },
  ];
}

export function buildAcmeData(): OrgData {
  const at = daysFromNow(-60);
  const departments: DepartmentRecord[] = DEPARTMENTS.map((d) => ({ ...d, status: 'ACTIVE', createdAt: at, updatedAt: at }));
  const positions: JobPositionRecord[] = POSITIONS.map((p) => ({
    id: p.id,
    code: p.code,
    name: p.name,
    jobFamilyId: p.family,
    departmentId: p.departmentId,
    jobGrade: p.jobGrade,
    referenceCode: p.reference,
    status: 'ACTIVE',
    createdAt: at,
    updatedAt: at,
  }));
  const managerOf = new Map(DEPARTMENTS.map((d) => [d.id, d.managerEmployeeId]));

  const employees: EmployeeRecord[] = EMPLOYEES.map((seed) => {
    const id = empId(seed.n);
    const manager = managerOf.get(seed.department);
    return {
      id,
      userId: seed.accountId,
      departmentId: seed.department,
      jobPositionId: seed.position,
      directManagerId: manager && manager !== id ? manager : undefined,
      employeeCode: `NV${String(seed.n).padStart(3, '0')}`,
      fullName: seed.name,
      workEmail: seed.email,
      status: seed.status ?? 'ACTIVE',
      joinedAt: dateFromNow(-300 + seed.n * 7),
      createdAt: at,
      updatedAt: at,
    };
  });
  // The new hire has no position yet: a skill gap cannot be calculated for them.
  employees.push({
    id: empId(14), departmentId: 'dep-ns', directManagerId: 'emp-05', employeeCode: 'NV014', fullName: 'Cao Đức Long',
    workEmail: 'long.cao@acme.vn', status: 'ACTIVE', joinedAt: dateFromNow(-3), createdAt: at, updatedAt: at,
  });

  const seedMembers: SeedMemberRecord[] = EMPLOYEES.map((seed) => ({
    id: seed.accountId ?? `usr-seed-${String(seed.n).padStart(2, '0')}`,
    fullName: seed.name,
    email: seed.email,
    roles: seed.roles,
    status: seed.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
    employeeId: empId(seed.n),
    joinedAt: dateFromNow(-300 + seed.n * 7),
    lastActiveAt: seed.status === 'INACTIVE' ? undefined : daysFromNow(-(seed.n % 5)),
    deactivatedReason: seed.status === 'INACTIVE' ? 'Nghỉ việc' : undefined,
  }));

  const seedInvitations: SeedInvitationRecord[] = [
    { id: 'inv-seed-01', fullName: 'Cao Đức Long', email: 'long.cao@acme.vn', role: 'EMPLOYEE', departmentId: 'dep-ns', invitedAt: daysFromNow(-3) },
    { id: 'inv-seed-02', fullName: 'Mai Hoàng', email: 'mai.hoang@acme.vn', role: 'EMPLOYEE', departmentId: 'dep-kd', jobPositionId: 'pos-sales', invitedAt: daysFromNow(-2) },
  ];

  function buildTrainingBatches(): TrainingBatchRecord[] {
    return [
      {
        id: 'tb-001',
        code: 'DOT-2026-01',
        name: 'Phổ cập Năng lực số cho Khối Nghiệp vụ & Kỹ thuật',
        description: 'Chương trình đào tạo trọng điểm Quý 1/2026 nhằm nâng cao năng lực khai thác dữ liệu và an toàn thông tin.',
        status: 'RUNNING',
        startDate: dateFromNow(-15),
        endDate: dateFromNow(15),
        courseIds: ['crs-A1-F', 'crs-A2-F', 'crs-A4-F'],
        targetCriteria: {
          departmentIds: ['dep-kt', 'dep-it'],
          jobGrades: ['G1', 'G2'],
        },
        participantEmployeeIds: ['emp-001', 'emp-006', 'emp-007', 'emp-008', 'emp-009', 'emp-010', 'emp-011', 'emp-013'],
        createdAt: daysFromNow(-20),
        createdByName: 'Nguyễn Văn Chủ',
      },
      {
        id: 'tb-002',
        code: 'DOT-2026-02',
        name: 'Nâng cao Kỹ năng Dữ liệu & AI cho Cấp bậc G2–G3',
        description: 'Đợt đào tạo chuyên sâu về ứng dụng AI và phân tích dữ liệu nghiệp vụ cho cán bộ quản lý và chuyên viên cấp cao.',
        status: 'SCHEDULED',
        startDate: dateFromNow(10),
        endDate: dateFromNow(40),
        courseIds: ['crs-M6-I', 'crs-A1-I'],
        targetCriteria: {
          jobGrades: ['G2', 'G3'],
        },
        participantEmployeeIds: ['emp-001', 'emp-002', 'emp-003', 'emp-004', 'emp-005'],
        createdAt: daysFromNow(-5),
        createdByName: 'Nguyễn Văn Chủ',
      },
      {
        id: 'tb-003',
        code: 'DOT-2025-04',
        name: 'Đợt Khởi động - Nhập môn Chuyển đổi số & An toàn thông tin',
        description: 'Đợt đào tạo toàn diện chuẩn bị lộ trình chuẩn hóa theo Khung chuẩn năng lực số.',
        status: 'COMPLETED',
        startDate: dateFromNow(-90),
        endDate: dateFromNow(-30),
        courseIds: ['crs-A1-F', 'crs-A4-F'],
        targetCriteria: {
          departmentIds: ['dep-ns', 'dep-kd'],
        },
        participantEmployeeIds: ['emp-002', 'emp-007', 'emp-012', 'emp-014'],
        createdAt: daysFromNow(-100),
        createdByName: 'Trần Thị Quản Trị',
      },
    ];
  }

  const data: OrgData = {
    organizationId: ACME_ORGANIZATION_ID,
    settings: { name: 'Công ty Cổ phần Acme', industry: 'Dịch vụ', size: '21-100', timezone: 'Asia/Ho_Chi_Minh', defaultAssignmentDays: 30 },
    jobGrades: JOB_GRADES,
    departments,
    jobFamilies: [
      { id: 'jf-qt', code: 'QT', name: 'Quản trị', description: 'Vị trí điều hành.', status: 'ACTIVE', createdAt: at, updatedAt: at },
      { id: 'jf-nv', code: 'NV', name: 'Nghiệp vụ', description: 'Vị trí chuyên môn.', status: 'ACTIVE', createdAt: at, updatedAt: at },
    ],
    positions,
    employees,
    requirementSets: buildRequirementSets(),
    profiles: buildProfiles(),
    skillGapRuns: [],
    assignments: buildAssignments(),
    decisions: [],
    trainingBatches: buildTrainingBatches(),
    seedMembers,
    seedInvitations,
    memberOverrides: {},
    audit: buildAudit(),
    internalCourses: buildInternalCourses(),
  };

  seedWork(data);

  for (const employee of employees) {
    const hasSet = data.requirementSets.some((s) => s.jobPositionId === employee.jobPositionId && s.status === 'ACTIVE');
    if (employee.status === 'ACTIVE' && employee.jobPositionId && hasSet) calculateRun(data, employee.id, 'SYSTEM', daysFromNow(-7));
  }
  return data;
}
