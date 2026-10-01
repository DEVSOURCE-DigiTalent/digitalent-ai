import { DEMO_ORGANIZATIONS } from '../data/enterpriseDemo.js';

export const ORGANIZATIONS_KEY = 'dig talent enterprise workspace v1';
export const ACCOUNTS_KEY = 'digcomp_demo_accounts_v1';
export const SESSION_KEY = 'digcomp_demo_session_v1';

export function readOrganizations() {
  try {
    const saved = JSON.parse(localStorage.getItem(ORGANIZATIONS_KEY));
    if (Array.isArray(saved) && saved.length) return saved;
  } catch {}
  return DEMO_ORGANIZATIONS;
}

export function readAccounts() {
  try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '{}'); } catch { return {}; }
}

export function saveAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function provisionEmployee(organization, employee) {
  const accounts = readAccounts();
  const existing = accounts[employee.id];
  if (existing) return existing;
  const account = { employeeId: employee.id, organizationId: organization.id,
    username: `${organization.id}-${employee.id}`.toLowerCase(),
    code: String(Math.floor(100000 + Math.random() * 900000)), createdAt: new Date().toISOString() };
  saveAccounts({ ...accounts, [employee.id]: account });
  return account;
}

export function loginEmployee(organizationId, username, code) {
  const organization = readOrganizations().find(item => item.id === organizationId);
  const account = Object.values(readAccounts()).find(item => item.organizationId === organizationId && item.username === username.trim().toLowerCase() && item.code === code.trim());
  const employee = organization?.employees.find(item => item.id === account?.employeeId);
  const position = organization?.roles.find(item => item.id === employee?.roleId);
  return employee && position ? { id: employee.id, employeeId: employee.id, organizationId, role: 'employee', roleLabel: position.name,
    name: employee.name, jobTitle: position.name, benchmarkId: position.benchmark, avatar: employee.name.charAt(0) } : null;
}

export function enterpriseAdmin(organization) {
  return { id: `admin-${organization.id}`, organizationId: organization.id, role: 'enterprise_admin',
    roleLabel: 'Quản trị doanh nghiệp', name: organization.name, jobTitle: organization.sector, avatar: '🏢' };
}
