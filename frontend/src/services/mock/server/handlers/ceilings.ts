import { PERMISSIONS } from '../../../../hooks/use-permission';
import { STANDARD_POSITION_CODES, STANDARD_POSITIONS, standardPositionCode } from '../../../../lib/standard-positions';
import { badRequest } from '../http';
import { route } from '../router';
import { CATEGORIES, COMPETENCIES, COMPETENCY_BY_ID, courseFor } from '../catalog';
import { ACME_ORGANIZATION_ID } from '../seed-acme';
import type { CapabilityCeilingRecord, OrgData } from '../types';
import { recordAudit } from './audit';
import { readReferencePositionLevels } from './reference-positions';

/**
 * Matrix of OW-05 "Khung năng lực số", mirror of CapabilityCeilingsController: the whole company = every course it owns
 * (Basic free, Intermediate / Advanced once bought); the 5 standard positions (shared by every department) get the level
 * their people must reach per domain, else the system suggestion (TT02 sample). A level may be above an owned course.
 */

const P = PERMISSIONS;
const MAX_LEVEL = 3;
const LEVEL_NAMES = ['Cơ bản', 'Trung cấp', 'Nâng cao'];

/**
 * Demo organization: a mid-size company that keeps 13 of the 18 courses (budget first) and sets two positions.
 * Kế toán needs data and safety, little content creation; Marketing needs content and communication.
 */
function demoCeilings(): CapabilityCeilingRecord {
  return {
    organization: { 'cat-1': 3, 'cat-2': 2, 'cat-3': 3, 'cat-4': 2, 'cat-5': 1, 'cat-6': 2 },
    positions: {
      ACCOUNTANT: { 'cat-1': 2, 'cat-2': 1, 'cat-3': 1, 'cat-4': 2, 'cat-5': 1, 'cat-6': 1 },
      MARKETING: { 'cat-1': 3, 'cat-2': 2, 'cat-3': 3, 'cat-4': 1, 'cat-5': 1, 'cat-6': 2 },
    },
    updatedAt: '2026-10-08T09:30:00.000Z',
    updatedByName: 'Nguyễn Văn Chủ',
  };
}

const ceilingsOf = (data: OrgData): CapabilityCeilingRecord | undefined =>
  data.capabilityCeilings ?? (data.organizationId === ACME_ORGANIZATION_ID ? demoCeilings() : undefined);

/** A paid course is unlocked for the whole organization once it is bought. */
const isBought = (data: OrgData, courseId: string | undefined): boolean =>
  Boolean(courseId && data.courseOrders?.includes(courseId));

const maxLicensedLevel = (data: OrgData, categoryId: string): number =>
  [3, 2].find((level) => isBought(data, courseFor(categoryId, level)?.id)) ?? 1;

/** Highest required level per category id for each position with an active requirement set. */
function requirementLevels(data: OrgData): Map<string, Map<string, number>> {
  const byPosition = new Map<string, Map<string, number>>();
  for (const set of data.requirementSets) {
    if (set.status !== 'ACTIVE') continue;
    const levels = byPosition.get(set.jobPositionId) ?? new Map<string, number>();
    for (const item of set.items) {
      const categoryId = COMPETENCY_BY_ID.get(item.competencyId)?.categoryId;
      if (!categoryId) continue;
      levels.set(categoryId, Math.min(MAX_LEVEL, Math.max(levels.get(categoryId) ?? 0, item.requiredLevel)));
    }
    byPosition.set(set.jobPositionId, levels);
  }
  return byPosition;
}

export function ceilingMatrixDto(data: OrgData) {
  const saved = ceilingsOf(data);
  const requirements = requirementLevels(data);
  const reference = readReferencePositionLevels().levels;
  const referenceCode = (code: string, name: string): string | undefined => {
    const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const aliases: Record<string, string> = { CEO: 'CEO', GIAMDOC: 'CEO', HR: 'HR', NHANSU: 'HR', MARKETING: 'MARKETING',
      SALES: 'SALES_CRM', SALE: 'SALES_CRM', SALESCRM: 'SALES_CRM', KINHDOANH: 'SALES_CRM',
      ACCOUNTANT: 'ACCOUNTANT', ACCOUNTING: 'ACCOUNTANT', KETOAN: 'ACCOUNTANT', KETOANVIEN: 'ACCOUNTANT' };
    return aliases[normalize(code)] ?? aliases[normalize(name)];
  };
  const positionReferences = new Map(data.positions.map((position) => [position.id, referenceCode(position.code, position.name)]));
  const suggest = (positionIds: Iterable<string>, categoryId: string) => {
    const index = CATEGORIES.findIndex((category) => category.id === categoryId);
    return Math.max(0, ...[...positionIds].map((id) => {
      const own = requirements.get(id);
      if (own) return own.get(categoryId) ?? 0;
      const code = positionReferences.get(id);
      return code && index >= 0 ? reference[code]?.[index] ?? 0 : 0;
    }));
  };

  const domains = CATEGORIES.slice().sort((a, b) => a.sortOrder - b.sortOrder);
  const organizationCeiling = new Map(domains.map((d) => [d.id, maxLicensedLevel(data, d.id)]));

  const activeEmployees = data.employees.filter((e) => e.status === 'ACTIVE');
  const sample = (code: string, categoryId: string) => {
    const index = CATEGORIES.findIndex((category) => category.id === categoryId);
    return Math.min(MAX_LEVEL, index >= 0 ? reference[code]?.[index] ?? 0 : 0);
  };
  const positions = STANDARD_POSITION_CODES
    .map((code) => ({ code, row: positionRowOf(data, code) }))
    .filter(({ row }) => !row || row.status === 'ACTIVE')
    .map(({ code, row }) => {
      const own = saved?.positions?.[code] ?? {};
      const holders = activeEmployees.filter((e) => row && e.jobPositionId === row.id);
      const ceilings = domains.map((d) => {
        const isCustomized = own[d.id] !== undefined;
        const suggested = sample(code, d.id);
        // A position may aim above the owned courses: set first, buy later.
        return { categoryId: d.id, level: isCustomized ? own[d.id] : Math.max(1, suggested), suggested, isCustomized };
      });
      return {
        positionId: row?.id ?? null,
        code,
        name: row?.name ?? STANDARD_POSITIONS[code],
        employeeCount: holders.length,
        departments: [...new Set(holders.map((e) => data.departments.find((d) => d.id === e.departmentId)?.name).filter((n): n is string => Boolean(n)))]
          .sort((a, b) => a.localeCompare(b, 'vi')),
        hasSuggestion: ceilings.every((c) => c.suggested > 0),
        isCustomized: ceilings.some((c) => c.isCustomized),
        courseCount: ceilings.reduce((sum, c) => sum + c.level, 0),
        ceilings,
      };
    });

  return {
    platformMaxLevel: MAX_LEVEL,
    isConfigured: Object.keys(saved?.positions ?? {}).length > 0,
    updatedAt: saved?.updatedAt ?? null,
    updatedByName: saved?.updatedByName ?? null,
    levels: LEVEL_NAMES.map((name, i) => ({ level: i + 1, name })),
    domains: domains.map((d) => ({
      categoryId: d.id,
      code: d.code,
      name: d.name,
      sortOrder: d.sortOrder,
      organizationCeiling: organizationCeiling.get(d.id)!,
      maxAllowedCeiling: maxLicensedLevel(data, d.id),
      suggestedCeiling: suggest(requirements.keys(), d.id),
      courses: [1, 2, 3].map((level) => {
        const course = courseFor(d.id, level);
        const isUnlocked = level === 1 || isBought(data, course?.id);
        return {
          level, courseId: course?.id ?? null, code: course?.code ?? null, title: course?.title ?? null,
          isUnlocked,
          price: level === 2 ? 399000 : level === 3 ? 699000 : 0,
          competencies: course ? COMPETENCIES.filter((item) => item.categoryId === d.id).map((item) => ({ competencyId: item.id, targetLevel: level })) : [],
        };
      }),
    })),
    positions,
    organizationCourseCount: [...organizationCeiling.values()].reduce((sum, level) => sum + level, 0),
    platformCourseCount: domains.length * MAX_LEVEL,
  };
}

/** The organization's row for a standard position: its code, else an older row naming the same position. */
function positionRowOf(data: OrgData, code: string) {
  return data.positions.find((p) => p.code.toUpperCase() === code && p.status !== 'ARCHIVED')
    ?? data.positions.find((p) => p.status !== 'ARCHIVED' && !standardPositionCode(p.code) && standardPositionCode(p.name) === code);
}

interface CeilingInput {
  categoryId: string;
  level: number;
}

/** Same checks as the backend validators: one row per domain, level 0..3, domain of the matrix. */
function readCeilings(body: Record<string, unknown>): CeilingInput[] {
  const raw = Array.isArray(body.ceilings) ? (body.ceilings as Partial<CeilingInput>[]) : [];
  const ids = new Set<string>();
  return raw.map((item) => {
    const categoryId = String(item.categoryId ?? '');
    const level = Number(item.level);
    if (!Number.isInteger(level) || level < 0 || level > MAX_LEVEL) throw badRequest('Dữ liệu chưa hợp lệ. Vui lòng kiểm tra lại.');
    if (ids.has(categoryId)) throw badRequest('Dữ liệu chưa hợp lệ. Vui lòng kiểm tra lại.');
    if (!CATEGORIES.some((c) => c.id === categoryId)) {
      throw badRequest('Năng lực không thuộc ma trận phạm vi năng lực.', 'CATEGORY_NOT_IN_MATRIX', 'ceilings');
    }
    ids.add(categoryId);
    return { categoryId, level };
  });
}

const stamp = (record: CapabilityCeilingRecord, name: string) => {
  record.updatedAt = new Date().toISOString();
  record.updatedByName = name;
};

route('GET', '/capability-ceilings', ({ org }) => ceilingMatrixDto(org()), { permission: P.POSITION_REQUIREMENT_READ });

route('PUT', '/capability-ceilings/organization', ({ body, session, update }) => update((data) => {
  const ceilings = readCeilings(body);
  if (CATEGORIES.some((c) => !ceilings.some((i) => i.categoryId === c.id))) {
    throw badRequest('Vui lòng chọn cấp độ cho tất cả lĩnh vực.', 'CEILINGS_INCOMPLETE', 'ceilings');
  }
  if (ceilings.some((item) => item.level > maxLicensedLevel(data, item.categoryId))) {
    throw badRequest('Cần mua khóa học của cấp này trước khi mở rộng phạm vi doanh nghiệp.', 'COURSE_LICENSE_REQUIRED', 'ceilings');
  }

  // Legacy (no longer used by OW-05): the company keeps every owned course; position levels are untouched.
  const record: CapabilityCeilingRecord = ceilingsOf(data) ?? { organization: {}, positions: {}, updatedAt: '', updatedByName: '' };
  for (const item of ceilings) record.organization[item.categoryId] = item.level;

  stamp(record, session.fullName);
  data.capabilityCeilings = record;
  recordAudit(data, session, 'CAPABILITY_CEILING_UPDATED', 'Phạm vi năng lực', 'Phạm vi doanh nghiệp');
  return { ...ceilingMatrixDto(data), adjustedDepartmentCount: 0 };
}), { permission: P.POSITION_REQUIREMENT_MANAGE, message: 'Đã lưu phạm vi doanh nghiệp.' });

route('PUT', '/capability-ceilings/positions/:code', ({ body, params, session, update }) => update((data) => {
  const code = standardPositionCode(decodeURIComponent(params.code));
  if (!code) throw badRequest('Chọn một trong 5 vị trí chuẩn: CEO, Nhân sự, Marketing, Sales, Kế toán.', 'INVALID_JOB_POSITION', 'code');
  const row = positionRowOf(data, code);
  if (row && row.status !== 'ACTIVE') throw badRequest('Vị trí chuẩn này đã ngừng sử dụng trong doanh nghiệp.', 'INVALID_JOB_POSITION', 'code');

  const record: CapabilityCeilingRecord = ceilingsOf(data) ?? { organization: {}, positions: {}, updatedAt: '', updatedByName: '' };
  record.positions ??= {};
  if (body.inherit === true) {
    delete record.positions[code];
  } else {
    const ceilings = readCeilings(body);
    if (ceilings.length === 0 || ceilings.some((item) => item.level < 1)) throw badRequest('Dữ liệu chưa hợp lệ. Vui lòng kiểm tra lại.');
    const own = (record.positions[code] ??= {});
    for (const item of ceilings) own[item.categoryId] = item.level;
  }

  stamp(record, session.fullName);
  data.capabilityCeilings = record;
  recordAudit(data, session, 'CAPABILITY_CEILING_UPDATED', 'Khung năng lực số', `Vị trí ${row?.name ?? STANDARD_POSITIONS[code]}`,
    body.inherit === true ? 'Bỏ mức đã đặt, theo đề xuất của hệ thống' : undefined);
  return ceilingMatrixDto(data);
}), { permission: P.POSITION_REQUIREMENT_MANAGE, message: 'Đã lưu mức cần đạt của vị trí.' });

