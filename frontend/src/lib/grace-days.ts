import { vietnamDay } from './vietnam-day';

/**
 * How long employees learning a course may finish its old content when new content is applied
 * (backend `CourseRelearn.GraceDayChoices`): 0 = at once, they start again on the new content.
 */
export const GRACE_DAY_CHOICES = [0, 7, 14, 30] as const;
export type GraceDays = (typeof GRACE_DAY_CHOICES)[number];
export const DEFAULT_GRACE_DAYS: GraceDays = 30;

/** dd/MM of the day the content switches, counted from now. */
export function switchDay(days: number, from: Date = new Date()): string {
  return vietnamDay(new Date(from.getTime() + days * 86_400_000));
}
