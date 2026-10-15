import { summarizeRequirements, type ReferencePosition } from './reference-positions';

/**
 * The standard course catalog of the individual track: one course per domain of Circular 02/2025 and per level
 * (F Cơ bản, I Trung cấp, A Nâng cao), each needing the one below. Shared by the mock catalog and the public
 * sample path, so both count the same courses and hours.
 */

export const STANDARD_COURSE_TITLES: Record<number, [string, string, string]> = {
  1: ['Tìm kiếm và lưu trữ thông tin cơ bản', 'Chiến lược tìm kiếm và quản lý thông tin', 'Phân tích thông tin và quản trị dữ liệu'],
  2: ['Giao tiếp số cơ bản nơi công sở', 'Giao tiếp và cộng tác chuyên nghiệp', 'Lãnh đạo giao tiếp và cộng tác số'],
  3: ['Tạo lập nội dung số cơ bản', 'Tạo lập nội dung chuyên nghiệp', 'Chiến lược nội dung và giải pháp số'],
  4: ['An toàn số cơ bản', 'An toàn thông tin trong công việc', 'Quản trị an toàn và trách nhiệm số'],
  5: ['Xử lý sự cố và tự học công nghệ', 'Giải quyết vấn đề trong công việc số', 'Đổi mới và dẫn dắt chuyển đổi số'],
  6: ['Ứng dụng AI cơ bản', 'Ứng dụng AI trung cấp', 'Ứng dụng AI nâng cao'],
};

export const MODULES_PER_DOMAIN: Record<number, number> = { 1: 3, 2: 6, 3: 4, 4: 4, 5: 4, 6: 3 };
export const MINUTES_PER_MODULE: Record<number, number> = { 1: 60, 2: 90, 3: 120 };
const LEVEL_SUFFIX: Record<number, string> = { 1: 'F', 2: 'I', 3: 'A' };

export function standardCourseCode(domain: number, level: number): string {
  return `${domain === 6 ? 'M6' : `A${domain}`}-${LEVEL_SUFFIX[level]}`;
}

export const standardCourseMinutes = (domain: number, level: number) => MODULES_PER_DOMAIN[domain] * MINUTES_PER_MODULE[level];

export interface SampleCourse {
  code: string;
  title: string;
  level: number;
  minutes: number;
}

export interface SampleDomain {
  number: number;
  name: string;
  /** Competencies of the domain the position requires. */
  selected: number;
  total: number;
  requiredLevel: number;
  courses: SampleCourse[];
}

export interface SamplePath {
  domains: SampleDomain[];
  courseCount: number;
  minutes: number;
}

/**
 * The longest path a position can need: every course from Cơ bản up to the highest level required in each domain,
 * as if the learner started from zero. The entry assessment can only shorten it.
 */
export function samplePathFor(position: ReferencePosition): SamplePath {
  const domains = summarizeRequirements(position).domains
    .filter((domain) => domain.highestLevel > 0)
    .map((domain): SampleDomain => ({
      number: domain.number,
      name: domain.name,
      selected: domain.selected,
      total: domain.total,
      requiredLevel: domain.highestLevel,
      courses: Array.from({ length: domain.highestLevel }, (_, index) => {
        const level = index + 1;
        return {
          code: standardCourseCode(domain.number, level),
          title: STANDARD_COURSE_TITLES[domain.number][index],
          level,
          minutes: standardCourseMinutes(domain.number, level),
        };
      }),
    }));
  const courses = domains.flatMap((domain) => domain.courses);
  return { domains, courseCount: courses.length, minutes: courses.reduce((sum, course) => sum + course.minutes, 0) };
}
