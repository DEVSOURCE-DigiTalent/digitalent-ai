import { courseCodeKey } from '@/features/courses/course-code';
import type { CourseListItem } from '@/services/assignment.service';
import type { CapabilityProgress, CapabilityProgressEmployee } from '@/services/intelligence.service';
import { positionKey } from './capability-progress';

/** Where one person stands against the level their position requires (same buckets as Khoảng trống năng lực). */
export type PersonState = 'met' | 'small' | 'large' | 'none';

export const PERSON_STATES: { key: PersonState; label: string }[] = [
  { key: 'met', label: 'Đạt đủ mức' },
  { key: 'small', label: 'Thiếu 1–2 mức' },
  { key: 'large', label: 'Thiếu từ 3 mức' },
  { key: 'none', label: 'Chưa có kết quả' },
];

export function personState(person: Pick<CapabilityProgressEmployee, 'assessed' | 'gapsNow'>): PersonState {
  if (!person.assessed) return 'none';
  if (person.gapsNow === 0) return 'met';
  return person.gapsNow <= 2 ? 'small' : 'large';
}

export interface TeamGroup {
  key: string;
  name: string;
  people: CapabilityProgressEmployee[];
}

export interface TeamSummary {
  total: number;
  assessed: number;
  counts: Record<PersonState, number>;
  /** People meeting every compared domain at the survey (same people as now). */
  metAtSurvey: number;
  /** People who went up a level in at least one domain since the survey. */
  improved: number;
  groups: TeamGroup[];
}

const stateOrder: Record<PersonState, number> = { met: 0, small: 1, large: 2, none: 3 };

/** The team by position (positions are shared by every department), the largest first, people without one last. */
export function teamSummary(data: CapabilityProgress): TeamSummary {
  const counts: Record<PersonState, number> = { met: 0, small: 0, large: 0, none: 0 };
  data.people.forEach((person) => { counts[personState(person)] += 1; });
  const byKey = new Map<string, TeamGroup>();
  for (const person of data.people) {
    const key = positionKey(person.positionId);
    const group = byKey.get(key) ?? { key, name: key === 'none' ? 'Chưa có vị trí' : person.positionName ?? 'Chưa có vị trí', people: [] };
    group.people.push(person);
    byKey.set(key, group);
  }
  const groups = [...byKey.values()]
    .map((group) => ({
      ...group,
      people: [...group.people].sort((a, b) => stateOrder[personState(a)] - stateOrder[personState(b)] || a.name.localeCompare(b.name, 'vi')),
    }))
    .sort((a, b) => Number(a.key === 'none') - Number(b.key === 'none') || b.people.length - a.people.length || a.name.localeCompare(b.name, 'vi'));
  const assessed = data.people.filter((person) => person.assessed);
  return {
    total: data.people.length,
    assessed: assessed.length,
    counts,
    metAtSurvey: assessed.filter((person) => person.gapsAtSurvey === 0).length,
    improved: assessed.filter((person) => person.levelsGained > 0).length,
    groups,
  };
}

export interface WheelCourse {
  id: string;
  code: string;
  title: string;
  domain: number;
  level: number;
  owned: boolean;
}

const domainOf = (course: Pick<CourseListItem, 'code' | 'categoryName'>) => {
  const fromCode = /^M([1-6])-[FIA]$/.exec(courseCodeKey(course.code));
  if (fromCode) return Number(fromCode[1]);
  const fromName = /^\s*([1-6])\./.exec(course.categoryName ?? '');
  return fromName ? Number(fromName[1]) : 0;
};

/** The 18 standard courses as (domain, level) cells: owned = Basic (free) or bought (licence / purchase). */
export function courseWheel(items: CourseListItem[]): WheelCourse[] {
  const cells = new Map<string, WheelCourse>();
  for (const course of items) {
    const domain = domainOf(course);
    if (!domain || course.level < 1 || course.level > 3) continue;
    const key = `${domain}-${course.level}`;
    if (cells.has(key)) continue;
    cells.set(key, {
      id: course.id, code: courseCodeKey(course.code), title: course.title, domain, level: course.level,
      owned: course.level === 1 || Boolean(course.hasLicense || course.isPurchased),
    });
  }
  return [...cells.values()].sort((a, b) => a.domain - b.domain || a.level - b.level);
}

export interface TodoItem {
  key: 'invites' | 'positions' | 'courses';
  count: number;
  label: string;
  to: string;
}

/**
 * What the owner can act on now: invitations nobody activated, employees without a position (so without a required
 * level), and the courses not bought yet that people below their required level need (the cart opens with them).
 */
export function todoItems(input: { pendingInvites: number; people: CapabilityProgressEmployee[]; courses: WheelCourse[] }): TodoItem[] {
  const items: TodoItem[] = [];
  if (input.pendingInvites > 0) {
    items.push({ key: 'invites', count: input.pendingInvites, label: `${input.pendingInvites} lời mời chưa kích hoạt`, to: '/enterprise/members' });
  }
  const noPosition = input.people.filter((person) => !person.positionId).length;
  if (noPosition > 0) {
    items.push({ key: 'positions', count: noPosition, label: `${noPosition} người chưa có vị trí`, to: '/enterprise/members' });
  }
  const notOwned = new Map(input.courses.filter((course) => !course.owned).map((course) => [`${course.domain}-${course.level}`, course]));
  const needed = new Map<string, WheelCourse>();
  for (const person of input.people) {
    for (const domain of person.domains) {
      if (domain.now == null || domain.now >= domain.required) continue;
      for (let level = domain.now + 1; level <= domain.required; level += 1) {
        const course = notOwned.get(`${domain.number}-${level}`);
        if (course) needed.set(course.code, course);
      }
    }
  }
  // An Advanced course is bought with the Intermediate course of its domain when the company does not have it.
  for (const course of [...needed.values()]) {
    const lower = course.level === 3 ? notOwned.get(`${course.domain}-2`) : undefined;
    if (lower) needed.set(lower.code, lower);
  }
  if (needed.size > 0) {
    const codes = [...needed.values()].sort((a, b) => a.domain - b.domain || a.level - b.level).map((course) => course.code);
    items.push({ key: 'courses', count: needed.size, label: `${needed.size} khóa cần mua cho người còn thiếu`, to: `/enterprise/courses?selected=${codes.join(',')}` });
  }
  return items;
}

/** "Hôm nay", "Hôm qua", "3 ngày trước", then the date. */
export function whenText(iso: string, now = new Date()): string {
  const day = (value: Date) => Date.UTC(value.getFullYear(), value.getMonth(), value.getDate());
  const at = new Date(iso);
  const days = Math.round((day(now) - day(at)) / 86_400_000);
  if (days <= 0) return 'Hôm nay';
  if (days === 1) return 'Hôm qua';
  if (days < 7) return `${days} ngày trước`;
  return `${String(at.getDate()).padStart(2, '0')}/${String(at.getMonth() + 1).padStart(2, '0')}`;
}
