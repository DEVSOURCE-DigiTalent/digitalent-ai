import test from 'node:test';
import assert from 'node:assert/strict';
import { DEMO_ORGANIZATIONS } from '../data/enterpriseDemo.js';
import { ORGANIZATIONS_KEY, readOrganizations } from './demoAccess.js';
import { saveCompanySettings, savePositionSettings, saveSurveyRequirement } from './businessSettings.js';

const storage = new Map();
globalThis.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, String(value)) };
const user = { role: 'enterprise_admin', organizationId: 'sao-mai', accountId: 'owner' };
function seed() {
  storage.clear();
  const organizations = structuredClone(DEMO_ORGANIZATIONS);
  Object.assign(organizations[0], { ownerAccountId: 'owner', learningPolicy: { plan: 'team', courseLimit: 4 }, orders: [{ id: 'paid-order' }] });
  localStorage.setItem(ORGANIZATIONS_KEY, JSON.stringify(organizations));
  return organizations[0];
}

test('profile and role edits preserve latest employees, purchased plan, role IDs and requirements', () => {
  const initial = seed();
  const form = { ...initial, name: 'Tên mới', sector: 'Dịch vụ', size: 30, hourlyCost: 150000 };
  const latest = readOrganizations();
  latest[0].employees[0].after = [6,5,4,3,2];
  latest[0].learningPolicy.courseLimit = 7;
  localStorage.setItem(ORGANIZATIONS_KEY, JSON.stringify(latest));
  const saved = saveCompanySettings(user, form);
  assert.deepEqual(saved.employees, latest[0].employees);
  assert.deepEqual(saved.learningPolicy, latest[0].learningPolicy);
  assert.deepEqual(saved.orders, initial.orders);
  assert.equal(saved.ownerAccountId, 'owner');
  const role = saved.roles[0];
  const changed = savePositionSettings(user, role.id, { ...role, name: 'Giám đốc điều hành', specialty: 'Quản lý dữ liệu', headcount: 2, priority: 1, benchmark: 'marketing_specialist' });
  assert.equal(changed.roles[0].id, role.id);
  assert.equal(changed.roles[0].benchmark, role.benchmark);
  assert.deepEqual(changed.roles[0].requirements, role.requirements);
  assert.deepEqual(changed.employees, latest[0].employees);
  assert.deepEqual(readOrganizations().slice(1), latest.slice(1));
});

test('settings reject foreign owners, invalid inputs and duplicate role names without changing stored records', () => {
  const org = seed();
  const before = localStorage.getItem(ORGANIZATIONS_KEY);
  assert.throws(() => saveCompanySettings({ ...user, accountId: 'other' }, org), /quản trị/);
  assert.throws(() => saveCompanySettings({ ...user, role: 'employee' }, org), /quản trị/);
  assert.throws(() => saveCompanySettings(user, { ...org, size: 1 }), /nhỏ hơn/);
  assert.throws(() => saveCompanySettings(user, { ...org, hourlyCost: -1 }), /Chi phí/);
  assert.throws(() => savePositionSettings(user, null, { ...org.roles[0], specialty: '' }), /đã tồn tại/);
  assert.throws(() => saveSurveyRequirement(user, org.roles[0].id, 0, 'level', 7), /Mức yêu cầu/);
  assert.equal(localStorage.getItem(ORGANIZATIONS_KEY), before);
});

test('new positions preserve existing data and survey weight changes retain a 100 percent total', () => {
  const initial = seed();
  const added = savePositionSettings(user, null, { name: 'Chuyên viên CRM', specialty: 'Bán hàng B2B', benchmark: 'b2b_sales', headcount: 3, priority: 1 });
  const role = added.roles.at(-1);
  assert.equal(added.roles.length, initial.roles.length + 1);
  assert.deepEqual(added.roles.slice(0, -1), initial.roles);
  assert.equal(role.specialty, 'Bán hàng B2B');
  const weighted = saveSurveyRequirement(user, role.id, 0, 'weight', 45);
  assert.equal(weighted.roles.at(-1).requirements.reduce((sum, item) => sum + item.weight, 0), 100);
  const updated = saveSurveyRequirement(user, role.id, 1, 'mandatory', true);
  assert.equal(updated.roles.at(-1).requirements[1].mandatory, true);
  assert.equal(updated.roles.at(-1).requirements[0].weight, 45);
  assert.deepEqual(updated.employees, initial.employees);
});
