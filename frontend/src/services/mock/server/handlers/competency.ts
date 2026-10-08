import { CORE_COMPETENCY_CODES, MIN_REQUIREMENT_COUNT, TT02_COMPETENCY_CODES } from '../../../../features/competency/utils/requirement-domains';
import { PERMISSIONS } from '../../../../hooks/use-permission';
import { newId } from '../../mock-store';
import { CATEGORIES, CATEGORY_BY_ID, COMPETENCIES, COMPETENCY_BY_ID, COURSES } from '../catalog';
import { badRequest, conflict, forbidden, matchesSearch, notFound, paginate, pageRequest } from '../http';
import { calculateRun, skillGapBlocker } from '../org-logic';
import { route } from '../router';
import type { OrgData, RequirementItemRecord, RequirementSetRecord } from '../types';
import { recordAudit } from './audit';
import { employeesInScope } from './structure';

/** The standard competency framework (read-only for customers), position requirement sets and manual evidence. */

const P = PERMISSIONS;
const today = () => new Date().toISOString().slice(0, 10);

const STANDARD_ONLY = 'Khung năng lực chuẩn do DigiTalent AI quản lý, doanh nghiệp chỉ được xem và áp dụng.';

// ── Competencies ──

function competencyListItem(c: (typeof COMPETENCIES)[number]) {
  const category = CATEGORY_BY_ID.get(c.categoryId)!;
  return {
    id: c.id,
    categoryId: category.id,
    categoryName: category.name,
    categoryCode: category.code,
    categorySortOrder: category.sortOrder,
    frameworkCode: c.frameworkCode,
    code: c.code,
    name: c.name,
    description: c.description,
    competencyType: 'CORE_DIGITAL',
    status: 'ACTIVE',
    criteriaCount: c.criteria.length,
  };
}

route('GET', '/competencies', ({ query }) => {
  const items = COMPETENCIES
    .filter((c) => (!query.categoryId || c.categoryId === query.categoryId)
      && (!query.competencyType || query.competencyType === 'CORE_DIGITAL')
      && (!query.status || query.status === 'ACTIVE')
      && (matchesSearch(c.name, query.search) || matchesSearch(c.code, query.search)))
    .sort((a, b) => a.categoryId.localeCompare(b.categoryId) || Number(a.frameworkCode.split('.')[1]) - Number(b.frameworkCode.split('.')[1]))
    .map(competencyListItem);
  return paginate(items, pageRequest(query));
}, { permission: P.COMPETENCY_READ });

route('GET', '/competencies/:id', ({ params }) => {
  const competency = COMPETENCY_BY_ID.get(params.id);
  if (!competency) throw notFound('Không tìm thấy năng lực.');
  const { id, categoryId, code, name, description, criteria } = competency;
  const category = CATEGORY_BY_ID.get(categoryId)!;
  return { id, categoryId, categoryName: category.name, categoryCode: category.code, code, name, description, competencyType: 'CORE_DIGITAL', status: 'ACTIVE', criteria };
}, { permission: P.COMPETENCY_READ });

route('GET', '/competency-categories', () => CATEGORIES.map((c) => ({ id: c.id, code: c.code, name: c.name, sortOrder: c.sortOrder })), { permission: P.COMPETENCY_CATEGORY_READ });

for (const [method, path] of [['POST', '/competencies'], ['PUT', '/competencies/:id'], ['DELETE', '/competencies/:id']] as const) {
  route(method, path, () => { throw forbidden(STANDARD_ONLY); }, { permission: P.COMPETENCY_MANAGE });
}

// ── Position requirements ──

function itemDto(item: RequirementItemRecord) {
  const competency = COMPETENCY_BY_ID.get(item.competencyId)!;
  const category = CATEGORY_BY_ID.get(competency.categoryId)!;
  return {
    id: item.id,
    competencyId: competency.id,
    competencyCode: competency.code,
    competencyName: competency.name,
    competencyType: 'CORE_DIGITAL',
    categoryId: category.id,
    categoryName: category.name,
    categorySortOrder: category.sortOrder,
    frameworkCode: competency.frameworkCode,
    requiredLevel: item.requiredLevel,
    weightPercent: item.weightPercent,
    isMandatory: item.isMandatory,
    requiresPracticalEvidence: item.requiresPracticalEvidence,
    note: item.note,
  };
}

export function requirementOutput(data: OrgData, positionId: string, versionNo?: number) {
  const position = data.positions.find((p) => p.id === positionId);
  if (!position) throw notFound('Không tìm thấy vị trí công việc.');
  const sets = data.requirementSets.filter((s) => s.jobPositionId === positionId).sort((a, b) => b.versionNo - a.versionNo);
  const chosen = versionNo ? sets.find((s) => s.versionNo === versionNo) : (sets.find((s) => s.status === 'ACTIVE') ?? sets[0]);
  const versions = sets.map((s) => ({
    id: s.id,
    versionNo: s.versionNo,
    status: s.status,
    changeReason: s.changeReason,
    changeUserFullName: s.changeUserFullName,
    effectiveFrom: s.effectiveFrom,
    activatedAt: s.activatedAt,
  }));
  const base = { jobPositionId: position.id, jobPositionCode: position.code, jobPositionName: position.name, versions };
  if (!chosen) return { ...base, versionNo: 0, status: 'NONE', items: [] };
  return {
    ...base,
    id: chosen.id,
    versionNo: chosen.versionNo,
    status: chosen.status,
    effectiveFrom: chosen.effectiveFrom,
    effectiveTo: chosen.effectiveTo,
    reviewDate: chosen.reviewDate,
    createdByUserId: chosen.createdByUserId,
    activatedByUserId: chosen.activatedByUserId,
    activatedAt: chosen.activatedAt,
    changeReason: chosen.changeReason,
    changeUserFullName: chosen.changeUserFullName,
    items: chosen.items.map(itemDto),
  };
}

route('GET', '/position-requirements/summaries', ({ org }) => {
  const data = org();
  const summaries = data.positions
    .filter((pos) => pos.status !== 'ARCHIVED')
    .map((pos) => {
      const sets = data.requirementSets.filter((s) => s.jobPositionId === pos.id);
      const activeSet = sets.find((s) => s.status === 'ACTIVE');
      const draftSet = sets.find((s) => s.status === 'DRAFT');
      const dept = data.departments.find((d) => d.id === pos.departmentId);
      const empCount = data.employees.filter((e) => e.jobPositionId === pos.id && e.status === 'ACTIVE').length;

      return {
        jobPositionId: pos.id,
        jobPositionCode: pos.code,
        jobPositionName: pos.name,
        jobGrade: pos.jobGrade,
        departmentId: pos.departmentId,
        departmentName: dept?.name ?? '—',
        employeeCount: empCount,
        activeSet: activeSet
          ? {
              id: activeSet.id,
              versionNo: activeSet.versionNo,
              effectiveFrom: activeSet.effectiveFrom,
              activatedAt: activeSet.activatedAt,
              competencyCount: activeSet.items.length,
              changeReason: activeSet.changeReason,
            }
          : null,
        draftSet: draftSet
          ? {
              id: draftSet.id,
              versionNo: draftSet.versionNo,
              competencyCount: draftSet.items.length,
            }
          : null,
        totalVersions: sets.length,
        status: activeSet ? ('ACTIVE' as const) : draftSet ? ('DRAFT' as const) : ('NOT_CONFIGURED' as const),
      };
    });
  return summaries;
}, { permission: P.POSITION_REQUIREMENT_READ });

route('GET', '/position-requirements', ({ org, query }) => {
  if (!query.positionId) throw badRequest('Thiếu vị trí công việc.');
  return requirementOutput(org(), query.positionId, query.versionNo ? Number(query.versionNo) : undefined);
}, { permission: P.POSITION_REQUIREMENT_READ });

function parseItems(raw: unknown): RequirementItemRecord[] {
  if (!Array.isArray(raw)) throw badRequest('Danh sách năng lực không hợp lệ.');
  return raw.map((entry) => {
    const item = entry as Record<string, unknown>;
    const level = Number(item.requiredLevel);
    if (!COMPETENCY_BY_ID.has(String(item.competencyId))) throw badRequest('Năng lực không thuộc Khung chuẩn năng lực số.', 'COMPETENCY_NOT_IN_FRAMEWORK');
    if (![1, 2, 3].includes(level)) throw badRequest('Mức yêu cầu phải là 1, 2 hoặc 3.');
    return {
      id: newId('item'),
      competencyId: String(item.competencyId),
      requiredLevel: level,
      weightPercent: Number(item.weightPercent) || 0,
      isMandatory: Boolean(item.isMandatory),
      requiresPracticalEvidence: item.requiresPracticalEvidence !== false,
      note: typeof item.note === 'string' && item.note.trim() ? item.note.trim() : undefined,
    };
  });
}

route('POST', '/position-requirements', ({ body, session, update }) => update((data) => {
  const position = data.positions.find((p) => p.id === body.jobPositionId && p.status !== 'ARCHIVED');
  if (!position) throw notFound('Không tìm thấy vị trí công việc.');
  const sets = data.requirementSets.filter((s) => s.jobPositionId === position.id);
  if (sets.some((s) => s.status === 'DRAFT')) throw conflict('Vị trí này đã có một bản nháp. Hãy sửa bản nháp đó.');
  const userName = session.fullName || (session as any).name || 'Chủ doanh nghiệp';
  const set: RequirementSetRecord = {
    id: newId('req'),
    jobPositionId: position.id,
    versionNo: Math.max(0, ...sets.map((s) => s.versionNo)) + 1,
    status: 'DRAFT',
    effectiveFrom: body.effectiveFrom as string | undefined,
    effectiveTo: body.effectiveTo as string | undefined,
    reviewDate: body.reviewDate as string | undefined,
    changeReason: (body.changeReason as string) || 'Khởi tạo bản nháp yêu cầu năng lực',
    changeUserFullName: userName,
    createdByUserId: session.id,
    items: parseItems(body.items),
  };
  data.requirementSets.push(set);
  recordAudit(data, session, 'REQUIREMENT_DRAFT_CREATED', 'Yêu cầu năng lực', `${position.name} v${set.versionNo}`);
  return { id: set.id, versionNo: set.versionNo, status: set.status };
}), { permission: P.POSITION_REQUIREMENT_MANAGE, status: 201 });

route('PUT', '/position-requirements/:id', ({ body, params, session, update }) => update((data) => {
  const set = data.requirementSets.find((s) => s.id === params.id);
  if (!set) throw notFound('Không tìm thấy bộ yêu cầu.');
  if (set.status !== 'DRAFT') throw conflict('Chỉ sửa được bản nháp. Hãy tạo bản nháp mới từ bản đang áp dụng.');
  const userName = session.fullName || (session as any).name || 'Chủ doanh nghiệp';
  set.items = parseItems(body.items);
  set.effectiveFrom = body.effectiveFrom as string | undefined;
  set.effectiveTo = body.effectiveTo as string | undefined;
  set.reviewDate = body.reviewDate as string | undefined;
  if (body.changeReason) {
    set.changeReason = body.changeReason as string;
  }
  set.changeUserFullName = userName;
  const position = data.positions.find((p) => p.id === set.jobPositionId);
  recordAudit(data, session, 'REQUIREMENT_DRAFT_UPDATED', 'Yêu cầu năng lực', `${position?.name ?? ''} v${set.versionNo}`);
  return { id: set.id, versionNo: set.versionNo, status: set.status };
}), { permission: P.POSITION_REQUIREMENT_MANAGE });

route('POST', '/position-requirements/:id/activate', ({ body, params, session, update }) => update((data) => {
  const set = data.requirementSets.find((s) => s.id === params.id);
  if (!set) throw notFound('Không tìm thấy bộ yêu cầu.');
  if (set.status !== 'DRAFT') throw conflict('Chỉ kích hoạt được bản nháp.');

  const codes = set.items.map((item) => COMPETENCY_BY_ID.get(item.competencyId)?.frameworkCode);
  if (set.items.length < MIN_REQUIREMENT_COUNT || set.items.length > TT02_COMPETENCY_CODES.length) {
    throw badRequest(`Cần chọn từ ${MIN_REQUIREMENT_COUNT} đến ${TT02_COMPETENCY_CODES.length} năng lực.`, 'REQUIREMENT_COUNT_OUT_OF_RANGE');
  }
  if (CORE_COMPETENCY_CODES.some((code) => !codes.includes(code))) {
    throw badRequest('Bắt buộc có năng lực lõi 4.1 và 4.2.', 'CORE_COMPETENCY_MISSING');
  }
  const total = Math.round(set.items.reduce((sum, item) => sum + item.weightPercent, 0) * 100) / 100;
  if (Math.abs(total - 100) > 0.01) throw badRequest(`Tổng trọng số phải bằng 100% (hiện ${total}%).`, 'WEIGHT_SUM_INVALID');

  const previous = data.requirementSets.find((s) => s.jobPositionId === set.jobPositionId && s.status === 'ACTIVE');
  if (previous) {
    previous.status = 'RETIRED';
    previous.effectiveTo = today();
  }
  set.status = 'ACTIVE';
  set.activatedAt = new Date().toISOString();
  set.activatedByUserId = session.id;
  const userName = session.fullName || (session as any).name || 'Chủ doanh nghiệp';
  set.changeUserFullName = userName;
  if (body?.changeReason) {
    set.changeReason = body.changeReason as string;
  }
  set.effectiveFrom ??= today();

  // Everyone in the position gets a new snapshot against the new requirement set.
  for (const employee of data.employees.filter((e) => e.jobPositionId === set.jobPositionId)) {
    if (!skillGapBlocker(data, employee.id)) calculateRun(data, employee.id, 'SYSTEM');
  }
  const position = data.positions.find((p) => p.id === set.jobPositionId);
  recordAudit(data, session, 'REQUIREMENT_ACTIVATED', 'Yêu cầu năng lực', `${position?.name ?? ''} v${set.versionNo}`);
  return { id: set.id, versionNo: set.versionNo, status: set.status, activatedAt: set.activatedAt };
}), { permission: P.POSITION_REQUIREMENT_MANAGE, message: 'Đã kích hoạt bộ yêu cầu.' });

// ── Manual evidence ──

route('POST', '/competency-evidences/manual', (context) => context.update((data) => {
  const { body, session } = context;
  const employee = employeesInScope({ org: () => data, session }).find((e) => e.id === body.employeeId);
  if (!employee) throw notFound('Không tìm thấy nhân viên.');
  const competency = COMPETENCY_BY_ID.get(String(body.competencyId));
  if (!competency) throw notFound('Không tìm thấy năng lực.');
  const confirmedLevel = Number(body.confirmedLevel);
  if (![1, 2, 3].includes(confirmedLevel)) throw badRequest('Mức xác nhận phải là 1, 2 hoặc 3.');
  const note = typeof body.reviewNote === 'string' ? body.reviewNote.trim() : '';
  if (!note) throw badRequest('Cần ghi chú lý do xác nhận.');

  const profile = (data.profiles[employee.id] ??= {});
  const previousLevel = profile[competency.id]?.level ?? null;
  profile[competency.id] = { level: confirmedLevel, source: 'MANUAL', confirmedAt: new Date().toISOString(), note };
  if (!skillGapBlocker(data, employee.id)) calculateRun(data, employee.id, 'SYSTEM');
  recordAudit(data, session, 'COMPETENCY_CONFIRMED', 'Năng lực nhân viên', `${employee.fullName} · ${competency.code}`, `Mức ${previousLevel ?? 0} → ${confirmedLevel}`);
  return {
    evidenceId: newId('evd'),
    employeeId: employee.id,
    competencyId: competency.id,
    previousLevel,
    confirmedLevel,
    supersededEvidenceId: previousLevel === null ? null : newId('evd'),
  };
}), { permission: P.EVIDENCE_CREATE_MANUAL, status: 201, message: 'Đã xác nhận năng lực.' });

// ── Where a competency is used (LCA-07) ──

route('GET', '/competencies/:id/usage', ({ org, params }) => {
  const competency = COMPETENCY_BY_ID.get(params.id);
  if (!competency) throw notFound('Không tìm thấy năng lực.');
  const data = org();

  const positions = data.positions
    .filter((position) => position.status === 'ACTIVE')
    .flatMap((position) => {
      const set = data.requirementSets.find((s) => s.jobPositionId === position.id && s.status === 'ACTIVE');
      const item = set?.items.find((i) => i.competencyId === competency.id);
      if (!item) return [];
      return [{
        positionId: position.id,
        positionName: position.name,
        requiredLevel: item.requiredLevel,
        isMandatory: item.isMandatory,
        weightPercent: item.weightPercent,
        employees: data.employees.filter((e) => e.jobPositionId === position.id && e.status === 'ACTIVE').length,
      }];
    });

  const levels = { 0: 0, 1: 0, 2: 0, 3: 0 } as Record<number, number>;
  for (const employee of data.employees.filter((e) => e.status === 'ACTIVE')) {
    levels[data.profiles[employee.id]?.[competency.id]?.level ?? 0] += 1;
  }

  const courses = COURSES.filter((c) => c.categoryId === competency.categoryId && c.status === 'PUBLISHED').map((c) => ({
    id: c.id,
    code: c.code,
    title: c.title,
    level: c.level,
    assigned: data.assignments.filter((a) => a.courseId === c.id && a.status !== 'CANCELLED').length,
  }));

  const employeesWithGap: {
    employeeId: string;
    fullName: string;
    email: string;
    departmentName: string;
    jobPositionName: string;
    jobGrade?: string;
    currentLevel: number;
    requiredLevel: number;
    gap: number;
  }[] = [];

  for (const employee of data.employees.filter((e) => e.status === 'ACTIVE')) {
    const position = data.positions.find((p) => p.id === employee.jobPositionId);
    if (!position) continue;
    const set = data.requirementSets.find((s) => s.jobPositionId === position.id && s.status === 'ACTIVE');
    const item = set?.items.find((i) => i.competencyId === competency.id);
    if (!item) continue;
    const currentLevel = data.profiles[employee.id]?.[competency.id]?.level ?? 0;
    if (currentLevel < item.requiredLevel) {
      const dept = data.departments.find((d) => d.id === employee.departmentId);
      employeesWithGap.push({
        employeeId: employee.id,
        fullName: employee.fullName,
        email: employee.workEmail || '',
        departmentName: dept?.name ?? '—',
        jobPositionName: position.name,
        jobGrade: position.jobGrade,
        currentLevel,
        requiredLevel: item.requiredLevel,
        gap: item.requiredLevel - currentLevel,
      });
    }
  }

  return { positions, courses, levelDistribution: levels, employeesWithGap };
}, { permission: P.COMPETENCY_READ });
