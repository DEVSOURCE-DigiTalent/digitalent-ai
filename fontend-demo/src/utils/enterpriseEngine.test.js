import test from 'node:test';
import assert from 'node:assert/strict';
import { DEMO_ORGANIZATIONS } from '../data/enterpriseDemo.js';
import { ALL_DIGCOMP_COURSES } from '../data/courseCatalog.js';
import { businessProjection, coursePrice, matchCourses, organizationScore, pairedOrganizationScores, scoreProfile, setRequirementWeight } from './enterpriseEngine.js';

test('role weights total 100 and full required levels score 100', () => {
  for (const organization of DEMO_ORGANIZATIONS) {
    for (const role of organization.roles) {
      assert.equal(role.requirements.reduce((sum, item) => sum + item.weight, 0), 100);
      assert.equal(scoreProfile(role.requirements.map(item => item.level), role.requirements), 100);
    }
  }
});

test('missing reassessment is not reported as improvement', () => {
  const organization = DEMO_ORGANIZATIONS[1];
  assert.equal(organizationScore(organization, 'after'), null);
  const role = organization.roles[0];
  assert.equal(scoreProfile([1, null, 2, 3, 4], role.requirements), null);
  assert.equal(pairedOrganizationScores(organization).count, 0);
});

test('before and after organization comparison uses the same employees', () => {
  const organization = DEMO_ORGANIZATIONS[0];
  const paired = pairedOrganizationScores(organization);
  assert.equal(paired.count, 2);
  assert.ok(paired.after > paired.before);
});

test('matching starts with foundation, advances after reassessment, and stops at target', () => {
  const requirements = DEMO_ORGANIZATIONS[0].roles.find(role => role.id === 'marketing').requirements;
  const foundation = matchCourses([0, 6, 6, 6, 6], requirements);
  assert.equal(foundation.length, 1);
  assert.equal(foundation[0].course.id, 'A1-F');
  assert.equal(matchCourses([2, 6, 6, 6, 6], requirements)[0].course.id, 'A1-I');
  assert.equal(matchCourses([4, 6, 6, 6, 6], requirements)[0].course.id, 'A1-A');
  assert.equal(matchCourses(requirements.map(item => item.level), requirements).length, 0);
});

test('recorded revenue only includes orders and foundation is free', () => {
  const organization = structuredClone(DEMO_ORGANIZATIONS[0]);
  assert.equal(businessProjection(organization).recordedRevenue, 0);
  organization.orders.push({ price: 390000, seats: 2 });
  assert.equal(businessProjection(organization).recordedRevenue, 780000);
  assert.equal(coursePrice({ id: 'A1-F' }), 0);
});

test('changing a role weight preserves the 100 percent total', () => {
  const requirements = DEMO_ORGANIZATIONS[0].roles[0].requirements;
  const updated = setRequirementWeight(requirements, 2, 40);
  assert.equal(updated[2].weight, 40);
  assert.equal(updated.reduce((sum, item) => sum + item.weight, 0), 100);
  assert.equal(requirements.reduce((sum, item) => sum + item.weight, 0), 100);
});

test('roadmap has three full lesson stages in each area and flags commercial review', () => {
  assert.equal(Object.keys(ALL_DIGCOMP_COURSES).length, 15);
  for (let area = 1; area <= 5; area++) {
    for (const level of ['F', 'I', 'A']) assert.ok(ALL_DIGCOMP_COURSES[`A${area}-${level}`]);
  }
  const requirements = DEMO_ORGANIZATIONS[0].roles.find(role => role.id === 'ceo').requirements;
  const match = matchCourses([6, 0, 6, 6, 6], requirements);
  assert.equal(match[0].course.id, 'A2-F');
  assert.equal(match[0].course.modules.length, 6);
  assert.equal(match[0].course.isCommerciallyReady, false);
});

test('unreleased outlines are excluded from potential course revenue', () => {
  const organization = structuredClone(DEMO_ORGANIZATIONS[0]);
  organization.employees = [{ id: 'test', roleId: 'ceo', before: [6, 2, 6, 6, 6], after: null }];
  assert.equal(matchCourses(organization.employees[0].before, organization.roles.find(role => role.id === 'ceo').requirements)[0].course.id, 'A2-I');
  assert.equal(businessProjection(organization).plannedRevenue, 0);
  assert.equal(businessProjection(organization).hours, 0);
});
