/**
 * Progress of a long wait, shown the same way everywhere (sign dictionary, sign-language video): a percent and how
 * long is left, estimated from the speed so far — never made up: until enough of the work is done to measure a speed,
 * the time left says it is being estimated.
 */

/** 0–100, whole numbers; 0 when the total is unknown. */
export function percentOf(done: number, total: number): number {
  if (!Number.isFinite(done) || !Number.isFinite(total) || total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.floor((done / total) * 100)));
}

/** Share of work done (0–1) at the current percent of one phase, when the phases have known weights. */
export function weighted(phases: { weight: number; percent: number }[]): number {
  const total = phases.reduce((sum, phase) => sum + phase.weight, 0);
  if (total <= 0) return 0;
  return Math.floor(phases.reduce((sum, phase) => sum + phase.weight * Math.max(0, Math.min(100, phase.percent)), 0) / total);
}

/**
 * "còn khoảng 12 giây" / "còn khoảng 2 phút 30 giây", from the time since the start and the percent done (constant
 * speed). Too early to tell (under 2 s or 3 %) → "đang ước tính thời gian còn lại"; done → "sắp xong".
 */
export function remainingLabel(startedAt: number | string | null | undefined, percent: number, now: number = Date.now()): string {
  if (startedAt == null) return 'đang ước tính thời gian còn lại';
  const start = typeof startedAt === 'number' ? startedAt : new Date(startedAt).getTime();
  const elapsed = now - start;
  if (percent >= 100) return 'sắp xong';
  if (!Number.isFinite(start) || elapsed < 2000 || percent < 3) return 'đang ước tính thời gian còn lại';
  const left = Math.max(1, Math.ceil((elapsed * (100 - percent)) / percent / 1000));
  if (left < 60) return `còn khoảng ${left} giây`;
  const rounded = Math.round(left / 10) * 10;
  const minutes = Math.floor(rounded / 60);
  const rest = rounded % 60;
  return rest === 0 ? `còn khoảng ${minutes} phút` : `còn khoảng ${minutes} phút ${rest} giây`;
}
