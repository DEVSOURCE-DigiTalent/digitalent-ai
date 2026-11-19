/**
 * The 5 standard positions (backend `JobPositionCatalog`). A department may have any name and hold several of them;
 * a position is shared by every department, one per code in the organization.
 */
export const STANDARD_POSITIONS = {
  CEO: 'CEO / Giám đốc',
  HR: 'Nhân sự (HR)',
  MARKETING: 'Marketing',
  SALES_CRM: 'Sales / CRM',
  ACCOUNTANT: 'Kế toán',
} as const;

export type StandardPositionCode = keyof typeof STANDARD_POSITIONS;

export const STANDARD_POSITION_CODES = Object.keys(STANDARD_POSITIONS) as StandardPositionCode[];

export const NOT_STANDARD_POSITION = 'Chọn một trong 5 vị trí chuẩn: CEO, Nhân sự, Marketing, Sales, Kế toán.';

const ALIASES: Record<string, StandardPositionCode> = { 'GIÁM ĐỐC': 'CEO', 'NHÂN SỰ': 'HR', 'KINH DOANH': 'SALES_CRM', SALES: 'SALES_CRM' };

/** Catalog code of a typed position (code, label or a common alias); null when it is not one of the 5. */
export function standardPositionCode(value: string | null | undefined): StandardPositionCode | null {
  const label = value?.trim();
  if (!label) return null;
  const upper = label.toLocaleUpperCase('vi');
  const match = STANDARD_POSITION_CODES.find((code) => code === upper || STANDARD_POSITIONS[code].toLocaleUpperCase('vi') === upper);
  return match ?? ALIASES[upper] ?? null;
}

interface PositionLike { code: string; name: string; status?: string }

/**
 * The names to offer for the 5 positions, in catalog order: the organization's own name when it has the position,
 * else the catalog label; a position taken out of use is left out.
 */
export function standardPositionChoices(positions: readonly PositionLike[] = []): string[] {
  return STANDARD_POSITION_CODES.flatMap((code) => {
    const own = positions.find((position) => position.code.toUpperCase() === code);
    if (!own) return [STANDARD_POSITIONS[code]];
    return own.status && own.status !== 'ACTIVE' ? [] : [own.name];
  });
}

/**
 * Select options for the 5 positions: the organization's own position (value = its id) when it has one, else
 * `new:<label>` so the invitation sends the name and the backend creates the position.
 */
export function standardPositionOptions(positions: readonly (PositionLike & { id: string })[] = []) {
  return STANDARD_POSITION_CODES.flatMap((code) => {
    const own = positions.find((position) => position.code.toUpperCase() === code);
    if (!own) return [{ value: `new:${STANDARD_POSITIONS[code]}`, label: STANDARD_POSITIONS[code], code }];
    return own.status && own.status !== 'ACTIVE' ? [] : [{ value: own.id, label: own.name, code }];
  });
}
