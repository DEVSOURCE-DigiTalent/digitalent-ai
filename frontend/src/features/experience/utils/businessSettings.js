import { ORGANIZATIONS_KEY, readOrganizations } from './demoAccess.js';
import { makeRequirements } from '../data/enterpriseDemo.js';
import { JOB_ROLE_BENCHMARKS } from './competenceEngine.js';
import { setRequirementWeight } from './enterpriseEngine.js';

function integer(value, min, max, label) {
  const number = Number(value);
  if (value === '' || !Number.isInteger(number) || number < min || number > max) {
    throw new Error(`${label} phải là số nguyên từ ${min} đến ${max}.`);
  }
  return number;
}

function update(user, change) {
  const organizations = readOrganizations();
  const current = organizations.find(item => item.id === user.organizationId);
  if (!current || user.role !== 'enterprise_admin' || (current.ownerAccountId && current.ownerAccountId !== user.accountId)) {
    throw new Error('Chỉ quản trị của doanh nghiệp mới được sửa cấu hình.');
  }
  // Read the latest record and only patch the requested fields, preserving learning data.
  const next = change(current);
  localStorage.setItem(ORGANIZATIONS_KEY, JSON.stringify(organizations.map(item => item.id === current.id ? next : item)));
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('digcomp-organizations'));
  return next;
}

export function saveCompanySettings(user, form) {
  return update(user, current => {
    const name = form.name.trim();
    const sector = form.sector.trim();
    if (!name || !sector) throw new Error('Nhập tên doanh nghiệp và ngành nghề.');
    const size = integer(form.size, 1, 500, 'Quy mô');
    if (size < current.employees.length) throw new Error('Quy mô không được nhỏ hơn số hồ sơ nhân viên đang có.');
    const hourlyCost = integer(form.hourlyCost, 0, 1000000000, 'Chi phí giờ công');
    return { ...current, name, sector, size, hourlyCost };
  });
}

export function savePositionSettings(user, roleId, form) {
  return update(user, current => {
    const existing = roleId ? current.roles.find(role => role.id === roleId) : null;
    if (roleId && !existing) throw new Error('Vị trí không còn tồn tại.');
    const name = form.name.trim();
    if (!name) throw new Error('Nhập tên vị trí.');
    if (current.roles.some(role => role.id !== roleId && role.name.trim().toLocaleLowerCase('vi') === name.toLocaleLowerCase('vi'))) {
      throw new Error('Tên vị trí đã tồn tại.');
    }
    const headcount = integer(form.headcount, 1, 500, 'Số người dự kiến');
    const priority = integer(form.priority, 1, 3, 'Mức ưu tiên');
    const benchmark = existing?.benchmark || form.benchmark;
    if (!JOB_ROLE_BENCHMARKS.some(role => role.roleId === benchmark)) throw new Error('Chọn nhóm công việc tham khảo hợp lệ.');
    const position = { ...(existing || { id: `role-${crypto.randomUUID()}`, family: 'Đặc thù', benchmark, requirements: makeRequirements(benchmark) }),
      name, specialty: form.specialty.trim(), headcount, priority };
    return { ...current, roles: existing ? current.roles.map(role => role.id === roleId ? position : role) : [...current.roles, position] };
  });
}

export function saveSurveyRequirement(user, roleId, index, field, value) {
  return update(user, current => {
    const role = current.roles.find(item => item.id === roleId);
    if (!role?.requirements?.[index]) throw new Error('Không tìm thấy tiêu chí của vị trí.');
    if (!['level', 'weight', 'mandatory'].includes(field)) throw new Error('Trường cấu hình không hợp lệ.');
    const checked = field === 'mandatory' ? value === true : integer(value, field === 'level' ? 1 : 0, field === 'level' ? 6 : 100, field === 'level' ? 'Mức yêu cầu' : 'Trọng số');
    const requirements = field === 'weight' ? setRequirementWeight(role.requirements, index, checked)
      : role.requirements.map((item, i) => i === index ? { ...item, [field]: checked } : item);
    return { ...current, roles: current.roles.map(item => item.id === roleId ? { ...item, requirements } : item) };
  });
}
