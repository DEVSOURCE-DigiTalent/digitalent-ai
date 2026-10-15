import { PERMISSIONS } from '../../../../hooks/use-permission';
import { badRequest, notFound } from '../http';
import { route } from '../router';
import { CATEGORIES, COMPETENCY_BY_ID, courseFor } from '../catalog';
import { ACME_ORGANIZATION_ID } from '../seed-acme';
import type { CapabilityCeilingRecord, OrgData } from '../types';
import { recordAudit } from './audit';

/**
 * Ceiling matrix of the organization (OW-05 "Lý thuyết trần nhà"), mirror of CapabilityCeilingsController:
 * Digital AI ceiling = 6 domains × 3 levels (18 courses) ⊇ organization ceiling ⊇ department ceilings, per domain.
 */

const P = PERMISSIONS;
const MAX_LEVEL = 3;
const LEVEL_NAMES = ['Cơ bản', 'Trung cấp', 'Nâng cao'];

/**
 * Demo organization: a mid-size company that keeps 13 of the 18 courses (budget first) and narrows two departments.
 * Kế toán needs data and safety, little content creation; Marketing needs content and communication.
 */
function demoCeilings(): CapabilityCeilingRecord {
  return {
    organization: { 'cat-1': 3, 'cat-2': 2, 'cat-3': 3, 'cat-4': 2, 'cat-5': 1, 'cat-6': 2 },
    departments: {
      'dep-kt': { 'cat-1': 2, 'cat-2': 1, 'cat-3': 1, 'cat-4': 2, 'cat-5': 1, 'cat-6': 1 },
      'dep-mkt': { 'cat-1': 3, 'cat-2': 2, 'cat-3': 3, 'cat-4': 1, 'cat-5': 1, 'cat-6': 2 },
    },
    updatedAt: '2026-10-08T09:30:00.000Z',
    updatedByName: 'Nguyễn Văn Chủ',
  };
}

const ceilingsOf = (data: OrgData): CapabilityCeilingRecord | undefined =>
  data.capabilityCeilings ?? (data.organizationId === ACME_ORGANIZATION_ID ? demoCeilings() : undefined);

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
  const suggest = (positionIds: Iterable<string>, categoryId: string) =>
    Math.max(0, ...[...positionIds].map((id) => requirements.get(id)?.get(categoryId) ?? 0));

  const domains = CATEGORIES.slice().sort((a, b) => a.sortOrder - b.sortOrder);
  const organizationCeiling = new Map(
    domains.map((d) => [d.id, saved?.organization[d.id] ?? Math.max(1, suggest(requirements.keys(), d.id))]),
  );

  const activeEmployees = data.employees.filter((e) => e.status === 'ACTIVE');
  const departments = data.departments
    .filter((d) => d.status === 'ACTIVE')
    .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
    .map((department) => {
      const positionIds = new Set([
        ...activeEmployees.filter((e) => e.departmentId === department.id && e.jobPositionId).map((e) => e.jobPositionId!),
        ...data.positions.filter((p) => p.departmentId === department.id && p.status === 'ACTIVE').map((p) => p.id),
      ]);
      const own = saved?.departments[department.id] ?? {};
      const ceilings = domains.map((d) => {
        const orgLevel = organizationCeiling.get(d.id)!;
        const isCustomized = own[d.id] !== undefined;
        return {
          categoryId: d.id,
          level: isCustomized ? Math.min(own[d.id], orgLevel) : orgLevel,
          suggested: Math.min(suggest(positionIds, d.id), orgLevel),
          isCustomized,
        };
      });
      return {
        departmentId: department.id,
        code: department.code,
        name: department.name,
        employeeCount: activeEmployees.filter((e) => e.departmentId === department.id).length,
        isCustomized: ceilings.some((c) => c.isCustomized),
        courseCount: ceilings.reduce((sum, c) => sum + c.level, 0),
        ceilings,
      };
    });

  return {
    platformMaxLevel: MAX_LEVEL,
    isConfigured: Boolean(saved),
    updatedAt: saved?.updatedAt ?? null,
    updatedByName: saved?.updatedByName ?? null,
    levels: LEVEL_NAMES.map((name, i) => ({ level: i + 1, name })),
    domains: domains.map((d) => ({
      categoryId: d.id,
      code: d.code,
      name: d.name,
      sortOrder: d.sortOrder,
      organizationCeiling: organizationCeiling.get(d.id)!,
      suggestedCeiling: suggest(requirements.keys(), d.id),
      courses: [1, 2, 3].map((level) => {
        const course = courseFor(d.id, level);
        return { level, courseId: course?.id ?? null, code: course?.code ?? null, title: course?.title ?? null };
      }),
    })),
    departments,
    organizationCourseCount: [...organizationCeiling.values()].reduce((sum, level) => sum + level, 0),
    platformCourseCount: domains.length * MAX_LEVEL,
  };
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
      throw badRequest('Năng lực không thuộc ma trận trần nhà.', 'CATEGORY_NOT_IN_MATRIX', 'ceilings');
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
    throw badRequest('Cần đặt trần cho đủ mọi năng lực của ma trận.', 'CEILINGS_INCOMPLETE', 'ceilings');
  }

  const record: CapabilityCeilingRecord = ceilingsOf(data) ?? { organization: {}, departments: {}, updatedAt: '', updatedByName: '' };
  for (const item of ceilings) record.organization[item.categoryId] = item.level;

  // Department ceilings above the new organization ceiling are lowered to it.
  let adjusted = 0;
  for (const own of Object.values(record.departments)) {
    let changed = false;
    for (const [categoryId, level] of Object.entries(own)) {
      if (level > record.organization[categoryId]) {
        own[categoryId] = record.organization[categoryId];
        changed = true;
      }
    }
    if (changed) adjusted++;
  }

  stamp(record, session.fullName);
  data.capabilityCeilings = record;
  recordAudit(data, session, 'CAPABILITY_CEILING_UPDATED', 'Trần năng lực', 'Trần doanh nghiệp',
    adjusted > 0 ? `Hạ trần của ${adjusted} phòng ban theo trần mới` : undefined);
  return { ...ceilingMatrixDto(data), adjustedDepartmentCount: adjusted };
}), { permission: P.POSITION_REQUIREMENT_MANAGE, message: 'Đã lưu trần doanh nghiệp.' });

route('PUT', '/capability-ceilings/departments/:id', ({ body, params, session, update }) => update((data) => {
  const department = data.departments.find((d) => d.id === params.id && d.status === 'ACTIVE');
  if (!department) throw notFound('Không tìm thấy phòng ban.');

  const record = ceilingsOf(data);
  if (!record) {
    throw badRequest('Hãy lưu trần doanh nghiệp trước khi đặt trần cho phòng ban.', 'ORGANIZATION_CEILING_REQUIRED', 'ceilings');
  }

  if (body.inherit === true) {
    delete record.departments[department.id];
  } else {
    const ceilings = readCeilings(body);
    if (ceilings.length === 0) throw badRequest('Dữ liệu chưa hợp lệ. Vui lòng kiểm tra lại.');
    if (ceilings.some((item) => item.level > (record.organization[item.categoryId] ?? 0))) {
      throw badRequest(
        'Trần phòng ban không được cao hơn trần doanh nghiệp ở bất kỳ năng lực nào.',
        'CEILING_ABOVE_ORGANIZATION',
        'ceilings',
      );
    }
    const own = (record.departments[department.id] ??= {});
    for (const item of ceilings) own[item.categoryId] = item.level;
  }

  stamp(record, session.fullName);
  data.capabilityCeilings = record;
  recordAudit(data, session, 'CAPABILITY_CEILING_UPDATED', 'Trần năng lực', `Trần phòng ban ${department.name}`,
    body.inherit === true ? 'Kế thừa trần doanh nghiệp' : undefined);
  return ceilingMatrixDto(data);
}), { permission: P.POSITION_REQUIREMENT_MANAGE, message: 'Đã lưu trần phòng ban.' });
