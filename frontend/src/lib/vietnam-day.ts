/** dd/MM of a moment in Vietnam time (UTC+7), the same on every browser (locale formats differ: 28/12 or 28-12). */
export function vietnamDay(at: Date): string {
  const local = new Date(at.getTime() + 7 * 3_600_000);
  return `${String(local.getUTCDate()).padStart(2, '0')}/${String(local.getUTCMonth() + 1).padStart(2, '0')}`;
}
