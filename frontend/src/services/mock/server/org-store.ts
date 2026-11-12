import { REFERENCE_POSITIONS } from '../../../lib/reference-positions';
import { COURSES } from './catalog';
import { MOCK_ACCOUNTS } from '../mock-accounts';
import { getDb, onMockReset } from '../mock-store';
import type { ReferencePositionCode } from './catalog';
import { ACME_ORGANIZATION_ID, buildAcmeData, demoOverallAssessments } from './seed-acme';
import type { DepartmentRecord, JobPositionRecord, OrgData } from './types';

/**
 * Persisted data of each organization the mock server knows. The demo organization (DigiTalent AI) is seeded in code;
 * an organization created through the sign-up flow starts from what its owner entered in the setup wizard.
 * Kept in localStorage so edits survive reloads; clear `dt-mock-org-data` (or the mock database) to start over.
 */

const STORAGE_KEY = 'dt-mock-org-data-v2';

let cache: Record<string, OrgData> | null = null;

function read(): Record<string, OrgData> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, OrgData>) : {};
  } catch {
    return {};
  }
}

function write(all: Record<string, OrgData>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // Storage full or blocked: the session still works from memory.
  }
}

const isReferenceCode = (code: string): code is ReferencePositionCode =>
  REFERENCE_POSITIONS.some((position) => position.code === code);

/** Organization data derived from the setup wizard of a registered organization. */
function seedFromRegistration(organizationId: string): OrgData {
  const registered = getDb().organizations.find((org) => org.id === organizationId);
  const demoName = MOCK_ACCOUNTS.find((account) => account.organization?.id === organizationId)?.organization?.name;
  const at = new Date().toISOString();

  const departments: DepartmentRecord[] = (registered?.departments ?? []).map((department, index) => ({
    id: department.id,
    code: `PB${String(index + 1).padStart(2, '0')}`,
    name: department.name,
    status: 'ACTIVE',
    createdAt: at,
    updatedAt: at,
  }));
  const positions: JobPositionRecord[] = (registered?.positions ?? []).map((position) => ({
    id: position.id,
    code: position.code,
    name: position.name,
    referenceCode: isReferenceCode(position.code) ? position.code : undefined,
    status: 'ACTIVE',
    createdAt: at,
    updatedAt: at,
  }));

  return {
    organizationId,
    settings: {
      name: registered?.name ?? demoName ?? 'Tổ chức',
      industry: registered?.industry ?? '',
      size: registered?.size ?? '',
      timezone: 'Asia/Ho_Chi_Minh',
      defaultAssignmentDays: 30,
    },
    departments,
    jobFamilies: [],
    positions,
    employees: [],
    requirementSets: [],
    profiles: {},
    skillGapRuns: [],
    assignments: [],
    decisions: [],
    seedMembers: [],
    seedInvitations: [],
    memberOverrides: {},
    audit: [],
  };
}

function load(): Record<string, OrgData> {
  cache ??= read();
  return cache;
}

/** Bring an untouched older owner demo seed up to the five-department/five-position showcase. */
function updateOwnerDemoSeed(data: OrgData): boolean {
  let changed = false;
  if (!data.overallAssessments) { data.overallAssessments = demoOverallAssessments(); changed = true; }
  // Legacy demo storage predates explicit course-seat purchases. Give the showcase
  // its documented sample licenses once; no runtime ceiling is used as evidence of purchase.
  if (!data.courseSeatOrders) {
    data.courseSeatOrders = Object.fromEntries(
      [['cat-1', 3], ['cat-2', 2], ['cat-3', 3], ['cat-4', 2], ['cat-6', 2]].map(([categoryId, level]) => {
        const course = COURSES.find((item) => item.categoryId === categoryId && item.level === level)!;
        return [course.id, 12];
      }),
    );
    changed = true;
  }
  const departmentNames: Record<string, [string, string]> = {
    'dep-bgd': ['Ban giám đốc', 'CEO'],
    'dep-kd': ['Kinh doanh', 'Sales/CRM'],
    'dep-ns': ['Nhân sự', 'HR'],
  };
  for (const department of data.departments) {
    const names = departmentNames[department.id];
    if (names && department.name === names[0]) { department.name = names[1]; changed = true; }
  }
  const positionNames: Record<string, [string, string]> = {
    'pos-ceo': ['Giám đốc điều hành', 'CEO'],
    'pos-hr': ['Nhân sự', 'HR'],
    'pos-sales': ['Kinh doanh (CRM)', 'Sales/CRM'],
  };
  for (const position of data.positions) {
    const names = positionNames[position.id];
    if (names && position.name === names[0]) { position.name = names[1]; changed = true; }
  }
  const defaultCodes = new Set(['CEO', 'HR', 'MARKETING', 'SALES_CRM', 'ACCOUNTANT', 'SALES_LEAD', 'ACCOUNTANT_LEAD']);
  const defaultLeadNames = data.positions.some((position) => position.id === 'pos-sales-lead' && position.name === 'Trưởng phòng Kinh doanh')
    && data.positions.some((position) => position.id === 'pos-acc-lead' && position.name === 'Trưởng phòng Kế toán');
  if (data.positions.length === 7 && data.positions.every((position) => defaultCodes.has(position.code)) && defaultLeadNames) {
    data.positions = data.positions.filter((position) => position.id !== 'pos-sales-lead' && position.id !== 'pos-acc-lead');
    for (const employee of data.employees) {
      if (employee.jobPositionId === 'pos-sales-lead') employee.jobPositionId = 'pos-sales';
      if (employee.jobPositionId === 'pos-acc-lead') employee.jobPositionId = 'pos-acc';
    }
    changed = true;
  }
  const extraPeople = [
    { id: 'emp-15', name: 'Nguyễn Minh Anh', departmentId: 'dep-bgd', positionId: 'pos-ceo' },
    { id: 'emp-16', name: 'Phạm Thu Trang', departmentId: 'dep-ns', positionId: 'pos-hr' },
    { id: 'emp-17', name: 'Trần Gia Bảo', departmentId: 'dep-kt', positionId: 'pos-acc' },
    { id: 'emp-18', name: 'Lê Ngọc Mai', departmentId: 'dep-mkt', positionId: 'pos-mkt' },
    { id: 'emp-19', name: 'Đỗ Khánh Linh', departmentId: 'dep-kd', positionId: 'pos-sales' },
    { id: 'emp-20', name: 'Vũ Thanh Tâm', departmentId: 'dep-ns', positionId: 'pos-hr' },
    { id: 'emp-21', name: 'Bùi Đức Huy', departmentId: 'dep-kd', positionId: 'pos-sales' },
  ];
  const at = new Date().toISOString();
  for (const person of extraPeople) {
    if (data.employees.some((employee) => employee.id === person.id)) continue;
    const number = person.id.slice(4);
    const email = `demo${number}@digitalent.ai`;
    data.employees.push({ id: person.id, departmentId: person.departmentId, jobPositionId: person.positionId, employeeCode: `NV${number.padStart(3, '0')}`, fullName: person.name, workEmail: email, status: 'ACTIVE', joinedAt: at.slice(0, 10), createdAt: at, updatedAt: at });
    data.seedMembers.push({ id: `usr-showcase-${number}`, fullName: person.name, email, roles: ['EMPLOYEE'], status: 'ACTIVE', employeeId: person.id, joinedAt: at.slice(0, 10), lastActiveAt: at });
    changed = true;
  }
  return changed;
}

export function getOrgData(organizationId: string): OrgData {
  const all = load();
  if (!all[organizationId]) {
    all[organizationId] = organizationId === ACME_ORGANIZATION_ID ? buildAcmeData() : seedFromRegistration(organizationId);
    write(all);
  }
  if (import.meta.env.VITE_OWNER_SHOWCASE === 'true' && organizationId === ACME_ORGANIZATION_ID && updateOwnerDemoSeed(all[organizationId])) write(all);
  return all[organizationId];
}

/** Applies a change to one organization's data and persists it. The callback may mutate the data. */
export function updateOrgData<T>(organizationId: string, update: (data: OrgData) => T): T {
  const data = getOrgData(organizationId);
  const result = update(data);
  write(load());
  return result;
}

export function resetOrgStore(): void {
  cache = null;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

onMockReset(resetOrgStore);
