import { PERMISSIONS } from '../../../../hooks/use-permission';
import { newId } from '../../mock-store';
import { badRequest, conflict, matchesSearch, notFound, paginate, pageRequest } from '../http';
import { route, type RequestContext } from '../router';
import type { DepartmentRecord, EmployeeRecord, JobFamilyRecord, JobPositionRecord, OrgData, RecordStatus } from '../types';
import { recordAudit } from './audit';

/** Departments, job families, job positions and employees: the structure of the organization. */

const P = PERMISSIONS;
const now = () => new Date().toISOString();

const visible = (status: RecordStatus, filter: string | undefined) => (filter ? status === filter : status !== 'ARCHIVED');
const required = (value: unknown, label: string): string => {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) throw badRequest(`${label} là bắt buộc.`);
  return text;
};

// ── Departments ──

function departmentDto(data: OrgData, d: DepartmentRecord) {
  const parent = data.departments.find((x) => x.id === d.parentDepartmentId);
  const manager = data.employees.find((e) => e.id === d.managerEmployeeId);
  const deptEmployees = data.employees.filter((e) => e.departmentId === d.id && e.status === 'ACTIVE');
  const posMap = new Map(data.positions.map((p) => [p.id, p]));
  const gradeCounts: Record<string, number> = { G1: 0, G2: 0, G3: 0 };
  for (const emp of deptEmployees) {
    if (emp.jobPositionId) {
      const pos = posMap.get(emp.jobPositionId);
      if (pos?.jobGrade) gradeCounts[pos.jobGrade]++;
    }
  }

  return {
    ...d,
    parentDepartmentName: parent?.name,
    managerName: manager?.fullName,
    headcount: deptEmployees.length,
    gradeDistribution: gradeCounts,
  };
}

route('GET', '/departments', ({ org, query }) => {
  const data = org();
  const items = data.departments
    .filter((d) => visible(d.status, query.status) && (matchesSearch(d.name, query.search) || matchesSearch(d.code, query.search)))
    .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
    .map((d) => {
      const dto = departmentDto(data, d);
      return {
        id: dto.id,
        code: dto.code,
        name: dto.name,
        parentDepartmentName: dto.parentDepartmentName,
        managerEmployeeId: dto.managerEmployeeId,
        managerName: dto.managerName,
        headcount: dto.headcount,
        gradeDistribution: dto.gradeDistribution,
        status: dto.status,
      };
    });
  return paginate(items, pageRequest(query));
}, { permission: P.DEPARTMENT_READ });

route('GET', '/departments/:id', ({ org, params }) => {
  const data = org();
  const department = data.departments.find((d) => d.id === params.id);
  if (!department) throw notFound('Không tìm thấy phòng ban.');
  return departmentDto(data, department);
}, { permission: P.DEPARTMENT_READ });

route('POST', '/departments', ({ body, session, update }) => update((data) => {
  const code = required(body.code, 'Mã phòng ban').toUpperCase();
  const name = required(body.name, 'Tên phòng ban');
  if (data.departments.some((d) => d.code === code && d.status !== 'ARCHIVED')) throw conflict('Mã phòng ban đã tồn tại.');
  const department: DepartmentRecord = {
    id: newId('dep'),
    code,
    name,
    description: body.description as string | undefined,
    parentDepartmentId: (body.parentDepartmentId as string) || undefined,
    managerEmployeeId: (body.managerEmployeeId as string) || undefined,
    status: 'ACTIVE',
    createdAt: now(),
    updatedAt: now(),
  };
  data.departments.push(department);
  recordAudit(data, session, 'DEPARTMENT_CREATED', 'Phòng ban', name);
  return { id: department.id };
}), { permission: P.DEPARTMENT_CREATE_UPDATE, status: 201, message: 'Đã tạo phòng ban.' });

route('PUT', '/departments/:id', ({ body, params, session, update }) => update((data) => {
  const department = data.departments.find((d) => d.id === params.id);
  if (!department) throw notFound('Không tìm thấy phòng ban.');
  const code = required(body.code, 'Mã phòng ban').toUpperCase();
  if (data.departments.some((d) => d.id !== department.id && d.code === code && d.status !== 'ARCHIVED')) throw conflict('Mã phòng ban đã tồn tại.');
  if (body.parentDepartmentId === department.id) throw badRequest('Phòng ban không thể là cấp trên của chính nó.');
  Object.assign(department, {
    code,
    name: required(body.name, 'Tên phòng ban'),
    description: body.description as string | undefined,
    parentDepartmentId: (body.parentDepartmentId as string) || undefined,
    managerEmployeeId: (body.managerEmployeeId as string) || undefined,
    status: body.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
    updatedAt: now(),
  });
  recordAudit(data, session, 'DEPARTMENT_UPDATED', 'Phòng ban', department.name);
  return { id: department.id };
}), { permission: P.DEPARTMENT_CREATE_UPDATE, message: 'Đã cập nhật phòng ban.' });


route('DELETE', '/departments/:id', ({ params, session, update }) => update((data) => {
  const department = data.departments.find((d) => d.id === params.id);
  if (!department) throw notFound('Không tìm thấy phòng ban.');
  if (data.employees.some((e) => e.departmentId === department.id && e.status === 'ACTIVE')) {
    throw conflict('Phòng ban còn nhân viên đang hoạt động. Hãy chuyển họ sang phòng ban khác trước.');
  }
  department.status = 'ARCHIVED';
  department.updatedAt = now();
  recordAudit(data, session, 'DEPARTMENT_ARCHIVED', 'Phòng ban', department.name);
  return { id: department.id };
}), { permission: P.DEPARTMENT_CREATE_UPDATE, message: 'Đã lưu trữ phòng ban.' });

// ── Job families ──

const familyDto = (f: JobFamilyRecord) => ({ id: f.id, code: f.code, name: f.name, description: f.description, status: f.status, createdAt: f.createdAt, updatedAt: f.updatedAt });

route('GET', '/job-families', ({ org, query }) => {
  const paged = paginate(
    org().jobFamilies.filter((f) => visible(f.status, query.status) && matchesSearch(f.name, query.search)).map(familyDto),
    pageRequest(query),
  );
  return { items: paged.items, totalItems: paged.totalItems, pageIndex: paged.pageIndex, pageSize: paged.pageSize };
}, { permission: P.JOB_FAMILY_READ });

route('GET', '/job-families/:id', ({ org, params }) => {
  const family = org().jobFamilies.find((f) => f.id === params.id);
  if (!family) throw notFound('Không tìm thấy nhóm vị trí.');
  return familyDto(family);
}, { permission: P.JOB_FAMILY_READ });

route('POST', '/job-families', ({ body, update }) => update((data) => {
  const code = required(body.code, 'Mã nhóm vị trí').toUpperCase();
  if (data.jobFamilies.some((f) => f.code === code && f.status !== 'ARCHIVED')) throw conflict('Mã nhóm vị trí đã tồn tại.');
  const family: JobFamilyRecord = { id: newId('jf'), code, name: required(body.name, 'Tên nhóm vị trí'), description: body.description as string | undefined, status: 'ACTIVE', createdAt: now(), updatedAt: now() };
  data.jobFamilies.push(family);
  return { id: family.id, code: family.code, name: family.name };
}), { permission: P.JOB_FAMILY_CREATE_UPDATE, status: 201 });

route('PUT', '/job-families/:id', ({ body, params, update }) => update((data) => {
  const family = data.jobFamilies.find((f) => f.id === params.id);
  if (!family) throw notFound('Không tìm thấy nhóm vị trí.');
  Object.assign(family, { name: required(body.name, 'Tên nhóm vị trí'), description: body.description as string | undefined, status: body.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE', updatedAt: now() });
  return { id: family.id, code: family.code, name: family.name, status: family.status };
}), { permission: P.JOB_FAMILY_CREATE_UPDATE });

route('DELETE', '/job-families/:id', ({ params, update }) => update((data) => {
  const family = data.jobFamilies.find((f) => f.id === params.id);
  if (!family) throw notFound('Không tìm thấy nhóm vị trí.');
  if (data.positions.some((p) => p.jobFamilyId === family.id && p.status !== 'ARCHIVED')) throw conflict('Nhóm vị trí còn vị trí công việc.');
  family.status = 'ARCHIVED';
  return { id: family.id };
}), { permission: P.JOB_FAMILY_CREATE_UPDATE });

// ── Job positions ──

function positionDto(data: OrgData, p: JobPositionRecord) {
  const dept = data.departments.find((d) => d.id === p.departmentId);
  const grade = data.jobGrades?.find((g) => g.code === p.jobGrade);
  const headcount = data.employees.filter((e) => e.jobPositionId === p.id && e.status === 'ACTIVE').length;
  const hasRequirementSet = data.requirementSets.some((s) => s.jobPositionId === p.id && s.status === 'ACTIVE');

  return {
    ...p,
    departmentName: dept?.name,
    jobGradeName: grade?.name,
    jobFamilyName: data.jobFamilies.find((f) => f.id === p.jobFamilyId)?.name,
    headcount,
    hasRequirementSet,
  };
}

route('GET', '/job-positions', ({ org, query }) => {
  const data = org();
  const items = data.positions
    .filter((p) => visible(p.status, query.status)
      && (!query.jobFamilyId || p.jobFamilyId === query.jobFamilyId)
      && (!query.departmentId || p.departmentId === query.departmentId)
      && (!query.jobGrade || p.jobGrade === query.jobGrade)
      && (matchesSearch(p.name, query.search) || matchesSearch(p.code, query.search)))
    .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
    .map((p) => positionDto(data, p));
  return paginate(items, pageRequest(query));
}, { permission: P.JOB_POSITION_READ });

route('GET', '/job-positions/:id', ({ org, params }) => {
  const data = org();
  const position = data.positions.find((p) => p.id === params.id);
  if (!position) throw notFound('Không tìm thấy vị trí công việc.');
  return positionDto(data, position);
}, { permission: P.JOB_POSITION_READ });

route('POST', '/job-positions', ({ body, session, update }) => update((data) => {
  const code = required(body.code, 'Mã vị trí').toUpperCase();
  if (data.positions.some((p) => p.code === code && p.status !== 'ARCHIVED')) throw conflict('Mã vị trí đã tồn tại.');
  const position: JobPositionRecord = {
    id: newId('pos'),
    code,
    name: required(body.name, 'Tên vị trí'),
    description: body.description as string | undefined,
    departmentId: (body.departmentId as string) || undefined,
    jobGrade: (body.jobGrade as 'G1' | 'G2' | 'G3') || undefined,
    jobFamilyId: (body.jobFamilyId as string) || undefined,
    status: 'ACTIVE',
    createdAt: now(),
    updatedAt: now(),
  };
  data.positions.push(position);
  recordAudit(data, session, 'POSITION_CREATED', 'Vị trí công việc', position.name);
  return { id: position.id };
}), { permission: P.JOB_POSITION_CREATE_UPDATE, status: 201, message: 'Đã tạo vị trí công việc.' });

route('PUT', '/job-positions/:id', ({ body, params, session, update }) => update((data) => {
  const position = data.positions.find((p) => p.id === params.id);
  if (!position) throw notFound('Không tìm thấy vị trí công việc.');
  const code = required(body.code, 'Mã vị trí').toUpperCase();
  if (data.positions.some((p) => p.id !== position.id && p.code === code && p.status !== 'ARCHIVED')) throw conflict('Mã vị trí đã tồn tại.');
  Object.assign(position, {
    code,
    name: required(body.name, 'Tên vị trí'),
    description: body.description as string | undefined,
    departmentId: (body.departmentId as string) || undefined,
    jobGrade: (body.jobGrade as 'G1' | 'G2' | 'G3') || undefined,
    jobFamilyId: (body.jobFamilyId as string) || undefined,
    status: body.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
    updatedAt: now(),
  });
  recordAudit(data, session, 'POSITION_UPDATED', 'Vị trí công việc', position.name);
  return { id: position.id };
}), { permission: P.JOB_POSITION_CREATE_UPDATE, message: 'Đã cập nhật vị trí công việc.' });

route('DELETE', '/job-positions/:id', ({ params, session, update }) => update((data) => {
  const position = data.positions.find((p) => p.id === params.id);
  if (!position) throw notFound('Không tìm thấy vị trí công việc.');
  if (data.employees.some((e) => e.jobPositionId === position.id && e.status === 'ACTIVE')) {
    throw conflict('Vị trí còn nhân viên đang giữ. Hãy chuyển họ sang vị trí khác trước.');
  }
  position.status = 'ARCHIVED';
  position.updatedAt = now();
  recordAudit(data, session, 'POSITION_ARCHIVED', 'Vị trí công việc', position.name);
  return { id: position.id };
}), { permission: P.JOB_POSITION_CREATE_UPDATE, message: 'Đã lưu trữ vị trí công việc.' });

// ── Job Grades (OW-12) ──

route('GET', '/job-grades', ({ org }) => {
  const data = org();
  const grades = data.jobGrades ?? [];
  const employees = data.employees.filter((e) => e.status === 'ACTIVE');
  const posMap = new Map(data.positions.map((p) => [p.id, p]));

  return grades.map((g) => {
    const matchingPositions = data.positions.filter((p) => p.jobGrade === g.code && p.status === 'ACTIVE');
    const matchingEmployees = employees.filter((e) => {
      const pos = e.jobPositionId ? posMap.get(e.jobPositionId) : undefined;
      return pos?.jobGrade === g.code;
    });

    return {
      code: g.code,
      name: g.name,
      description: g.description,
      positionCount: matchingPositions.length,
      employeeCount: matchingEmployees.length,
    };
  });
}, { permission: P.JOB_GRADE_READ });

route('PUT', '/job-grades/:code', ({ body, params, session, update }) => update((data) => {
  const code = params.code as 'G1' | 'G2' | 'G3';
  const grade = data.jobGrades?.find((g) => g.code === code);
  if (!grade) throw notFound('Không tìm thấy cấp bậc.');

  const name = required(body.name, 'Tên cấp bậc');
  const description = typeof body.description === 'string' ? body.description.trim() : grade.description;
  grade.name = name;
  grade.description = description;

  recordAudit(data, session, 'ORGANIZATION_UPDATED', 'Cấp bậc', `${code} - ${name}`);
  return { code: grade.code, name: grade.name, description: grade.description };
}), { permission: P.JOB_GRADE_MANAGE, message: 'Đã cập nhật cấp bậc.' });


// ── Employees ──

export function employeeDto(data: OrgData, e: EmployeeRecord) {
  const department = data.departments.find((d) => d.id === e.departmentId);
  const position = data.positions.find((p) => p.id === e.jobPositionId);
  const manager = data.employees.find((m) => m.id === e.directManagerId);
  return {
    id: e.id,
    organizationId: data.organizationId,
    userId: e.userId,
    departmentId: e.departmentId,
    departmentName: department?.name,
    jobPositionId: e.jobPositionId,
    positionId: e.jobPositionId,
    positionName: position?.name,
    jobPositionName: position?.name,
    directManagerId: e.directManagerId,
    directManagerName: manager?.fullName,
    employeeCode: e.employeeCode,
    fullName: e.fullName,
    workEmail: e.workEmail,
    phone: e.phone,
    status: e.status,
    joinedAt: e.joinedAt,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  };
}

/** Data scope (RBAC): HR and administrators see the organization, a manager their department, others only themselves. */
export function employeesInScope(context: Pick<RequestContext, 'org' | 'session'>): EmployeeRecord[] {
  const data = context.org();
  const { roles, id } = context.session;
  const own = data.employees.find((e) => e.userId === id);
  if (roles.includes('OWNER')) return data.employees;
  if (roles.includes('MANAGER') && own) {
    const managedDeptIds = data.departments.filter((d) => d.managerEmployeeId === own.id).map((d) => d.id);
    if (managedDeptIds.length > 0) {
      return data.employees.filter((e) => managedDeptIds.includes(e.departmentId) || e.departmentId === own.departmentId);
    }
    return data.employees.filter((e) => e.departmentId === own.departmentId);
  }
  return own ? [own] : [];
}

route('GET', '/employees', (context) => {
  const { query } = context;
  const data = context.org();
  const items = employeesInScope(context)
    .filter((e) => (query.status ? e.status === query.status : e.status !== 'ARCHIVED')
      && (!query.departmentId || e.departmentId === query.departmentId)
      && (!(query.positionId ?? query.jobPositionId) || e.jobPositionId === (query.positionId ?? query.jobPositionId))
      && (matchesSearch(e.fullName, query.search) || matchesSearch(e.employeeCode, query.search) || matchesSearch(e.workEmail, query.search)))
    .sort((a, b) => a.employeeCode.localeCompare(b.employeeCode))
    .map((e) => employeeDto(data, e));
  return paginate(items, pageRequest(query));
}, { permission: P.EMPLOYEE_READ });

route('GET', '/employees/:id', (context) => {
  const employee = employeesInScope(context).find((e) => e.id === context.params.id);
  if (!employee) throw notFound('Không tìm thấy nhân viên.');
  return employeeDto(context.org(), employee);
}, { permission: P.EMPLOYEE_READ });

function validatePlacement(data: OrgData, body: Record<string, unknown>) {
  if (body.departmentId && !data.departments.some((d) => d.id === body.departmentId && d.status === 'ACTIVE')) throw badRequest('Phòng ban không hợp lệ.');
  const position = (body.jobPositionId ?? body.positionId) as string | undefined;
  if (position && !data.positions.some((p) => p.id === position && p.status === 'ACTIVE')) throw badRequest('Vị trí công việc không hợp lệ.');
  return position || undefined;
}

route('POST', '/employees', ({ body, session, update }) => update((data) => {
  const employeeCode = required(body.employeeCode, 'Mã nhân viên').toUpperCase();
  if (data.employees.some((e) => e.employeeCode === employeeCode)) throw conflict('Mã nhân viên đã tồn tại.');
  const jobPositionId = validatePlacement(data, body);
  const employee: EmployeeRecord = {
    id: newId('emp'), employeeCode, fullName: required(body.fullName, 'Họ tên'), departmentId: required(body.departmentId, 'Phòng ban'),
    jobPositionId, directManagerId: (body.directManagerId as string) || undefined, workEmail: body.workEmail as string | undefined,
    phone: body.phone as string | undefined, joinedAt: body.joinedAt as string | undefined, status: 'ACTIVE', createdAt: now(), updatedAt: now(),
  };
  data.employees.push(employee);
  recordAudit(data, session, 'EMPLOYEE_CREATED', 'Nhân viên', employee.fullName);
  return { id: employee.id };
}), { permission: P.EMPLOYEE_CREATE_UPDATE, status: 201, message: 'Đã tạo hồ sơ nhân viên.' });

route('PUT', '/employees/:id', ({ body, params, session, update }) => update((data) => {
  const employee = data.employees.find((e) => e.id === params.id);
  if (!employee) throw notFound('Không tìm thấy nhân viên.');
  const jobPositionId = validatePlacement(data, body);
  const code = body.employeeCode ? String(body.employeeCode).toUpperCase() : employee.employeeCode;
  if (data.employees.some((e) => e.id !== employee.id && e.employeeCode === code)) throw conflict('Mã nhân viên đã tồn tại.');
  Object.assign(employee, {
    employeeCode: code,
    fullName: body.fullName ? String(body.fullName).trim() : employee.fullName,
    departmentId: (body.departmentId as string) || employee.departmentId,
    jobPositionId: 'jobPositionId' in body || 'positionId' in body ? jobPositionId : employee.jobPositionId,
    directManagerId: 'directManagerId' in body ? (body.directManagerId as string) || undefined : employee.directManagerId,
    workEmail: 'workEmail' in body ? (body.workEmail as string) : employee.workEmail,
    phone: 'phone' in body ? (body.phone as string) : employee.phone,
    status: (body.status as EmployeeRecord['status']) ?? employee.status,
    updatedAt: now(),
  });
  recordAudit(data, session, 'EMPLOYEE_UPDATED', 'Nhân viên', employee.fullName);
  return { id: employee.id };
}), { permission: P.EMPLOYEE_CREATE_UPDATE, message: 'Đã cập nhật hồ sơ nhân viên.' });

const archiveEmployee = ({ params, session, update }: RequestContext) => update((data) => {
  const employee = data.employees.find((e) => e.id === params.id);
  if (!employee) throw notFound('Không tìm thấy nhân viên.');
  employee.status = 'ARCHIVED';
  employee.updatedAt = now();
  recordAudit(data, session, 'EMPLOYEE_ARCHIVED', 'Nhân viên', employee.fullName);
  return { id: employee.id };
});

route('DELETE', '/employees/:id', archiveEmployee, { permission: P.EMPLOYEE_ARCHIVE_RESTORE, message: 'Đã lưu trữ nhân viên.' });

route('POST', '/employees/:id/transfer', ({ body, params, session, update }) => update((data) => {
  const employee = data.employees.find((e) => e.id === params.id);
  if (!employee) throw notFound('Không tìm thấy nhân viên.');
  const jobPositionId = validatePlacement(data, body);
  if (body.departmentId) employee.departmentId = body.departmentId as string;
  if (jobPositionId) employee.jobPositionId = jobPositionId;
  if (body.managerId) employee.directManagerId = body.managerId as string;
  employee.updatedAt = now();
  recordAudit(data, session, 'EMPLOYEE_TRANSFERRED', 'Nhân viên', employee.fullName);
  return employeeDto(data, employee);
}), { permission: P.EMPLOYEE_TRANSFER });
