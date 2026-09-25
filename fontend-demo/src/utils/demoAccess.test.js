import test from 'node:test';
import assert from 'node:assert/strict';
import { ACCOUNTS_KEY, ORGANIZATIONS_KEY, loginEmployee, provisionEmployee } from './demoAccess.js';

test('provisioned employee enters the correct enterprise and position', () => {
  const values = new Map();
  globalThis.localStorage = { getItem: key => values.get(key) || null, setItem: (key,value) => values.set(key, value) };
  const organization = { id:'test-org', name:'Doanh nghiệp thử', roles:[{ id:'ceo', name:'CEO', benchmark:'ceo_executive' }], employees:[{ id:'emp-1', name:'Nguyễn Minh', roleId:'ceo' }] };
  localStorage.setItem(ORGANIZATIONS_KEY, JSON.stringify([organization]));
  const account = provisionEmployee(organization, organization.employees[0]);
  assert.equal(provisionEmployee(organization, organization.employees[0]).code, account.code);
  assert.equal(JSON.parse(localStorage.getItem(ACCOUNTS_KEY))['emp-1'].username, account.username);
  const user = loginEmployee('test-org', account.username, account.code);
  assert.equal(user.name, 'Nguyễn Minh');
  assert.equal(user.jobTitle, 'CEO');
  assert.equal(user.benchmarkId, 'ceo_executive');
  assert.equal(loginEmployee('other-org', account.username, account.code), null);
  assert.equal(loginEmployee('test-org', account.username, '000000'), null);
});
