import { ALL_DIGCOMP_COURSES } from '../data/courseCatalog.js';

export const clampLevel = value => Math.max(0, Math.min(6, Number(value) || 0));
export const currency = value => `${Math.round(value).toLocaleString('vi-VN')} đ`;

export function setRequirementWeight(requirements, index, requested) {
  const weight = Math.max(0, Math.min(100, Number(requested) || 0));
  const otherIndexes = requirements.map((_, i) => i).filter(i => i !== index);
  const otherTotal = otherIndexes.reduce((sum, i) => sum + requirements[i].weight, 0);
  let remaining = 100 - weight;
  const next = requirements.map(item => ({ ...item }));
  next[index].weight = weight;
  otherIndexes.forEach((i, position) => {
    const share = position === otherIndexes.length - 1 ? remaining : Math.floor((100 - weight) * (otherTotal ? requirements[i].weight / otherTotal : 1 / otherIndexes.length));
    next[i].weight = share;
    remaining -= share;
  });
  return next;
}

// A missing level is 0. A score is a weighted proportion of the role's required levels.
export function scoreProfile(levels, requirements) {
  if (!levels || levels.length !== requirements?.length || levels.some(value => value === null || value === undefined || value === '')) return null;
  const weightTotal = requirements.reduce((sum, item) => sum + item.weight, 0);
  if (!weightTotal) return null;
  return Math.round(requirements.reduce((sum, item, index) => {
    return sum + item.weight * Math.min(clampLevel(levels[index]) / item.level, 1);
  }, 0) / weightTotal * 100);
}

export function organizationScore(organization, phase = 'before') {
  const scores = organization.employees.map(employee => {
    const role = organization.roles.find(item => item.id === employee.roleId);
    return scoreProfile(employee[phase], role?.requirements);
  }).filter(value => value !== null);
  return scores.length ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length) : null;
}

export function pairedOrganizationScores(organization) {
  const pairs = organization.employees.map(employee => {
    const role = organization.roles.find(item => item.id === employee.roleId);
    return [scoreProfile(employee.before, role?.requirements), scoreProfile(employee.after, role?.requirements)];
  }).filter(([before, after]) => before !== null && after !== null);
  if (!pairs.length) return { count: 0, before: null, after: null, improvement: null };
  const before = Math.round(pairs.reduce((sum, pair) => sum + pair[0], 0) / pairs.length);
  const after = Math.round(pairs.reduce((sum, pair) => sum + pair[1], 0) / pairs.length);
  return { count: pairs.length, before, after, improvement: after - before };
}

export function skillGaps(levels, requirements) {
  if (!levels || !requirements) return [];
  return requirements.map((item, index) => ({
    ...item,
    area: index + 1,
    current: clampLevel(levels[index]),
    gap: Math.max(0, item.level - clampLevel(levels[index])),
    priority: Math.max(0, item.level - clampLevel(levels[index])) * item.weight * (item.mandatory ? 1.5 : 1),
  })).sort((a, b) => b.priority - a.priority);
}

export function matchCourses(levels, requirements) {
  return skillGaps(levels, requirements).filter(item => item.gap > 0).map(item => {
    const code = item.current < 2 ? 'F' : item.current < 4 ? 'I' : 'A';
    const course = ALL_DIGCOMP_COURSES[`A${item.area}-${code}`];
    return { ...item, course, reason: `Hiện tại ${item.current}/6 · cần ${item.level}/6 · thiếu ${item.gap} mức` };
  }).filter(item => item.course);
}

export const coursePrice = course => course?.isCommerciallyReady === false ? 0 : course?.id?.endsWith('-F') ? 0 : course?.id?.endsWith('-I') ? 390000 : 790000;

export function businessProjection(organization) {
  const gapCourses = organization.employees.flatMap(employee => {
    const role = organization.roles.find(item => item.id === employee.roleId);
    const levels = scoreProfile(employee.after, role?.requirements) === null ? employee.before : employee.after;
    return matchCourses(levels, role?.requirements);
  });
  const readyCourses = gapCourses.filter(item => item.course.isCommerciallyReady !== false);
  const hours = readyCourses.reduce((sum, item) => sum + (parseFloat(item.course.duration) || 0), 0);
  const plannedRevenue = readyCourses.reduce((sum, item) => sum + coursePrice(item.course), 0);
  const recordedRevenue = (organization.orders || []).reduce((sum, order) => sum + order.price * order.seats, 0);
  return { hours, plannedRevenue, recordedRevenue, plannedTrainingCost: hours * organization.hourlyCost };
}
