import { REFERENCE_DOMAIN_LEVELS } from '../../../../lib/reference-positions';
import { ROLES } from '../../../../lib/roles';
import { badRequest, conflict } from '../http';
import { route } from '../router';
import type { ReferencePositionLevels } from '../../../reference-position-levels.service';

const STORAGE_KEY = 'digitalent-mock-reference-position-levels';
const CODES = ['CEO', 'HR', 'MARKETING', 'SALES_CRM', 'ACCOUNTANT'];

function defaults(): ReferencePositionLevels {
  return { version: 1, levels: Object.fromEntries(CODES.map((code) => [code, [...REFERENCE_DOMAIN_LEVELS[code]]])) };
}

export function readReferencePositionLevels(): ReferencePositionLevels {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as ReferencePositionLevels : defaults();
  } catch {
    return defaults();
  }
}

route('GET', '/reference-positions/levels', () => readReferencePositionLevels(), {
  roles: [ROLES.PLATFORM_ADMIN, ROLES.OWNER, ROLES.MANAGER, ROLES.EMPLOYEE],
});

route('PUT', '/reference-positions/levels', ({ body }) => {
  const input = body as unknown as ReferencePositionLevels;
  const current = readReferencePositionLevels();
  if (input.version !== current.version) throw conflict('Bảng tham chiếu đã thay đổi. Hãy tải lại trước khi lưu.');
  if (!input.levels || Object.keys(input.levels).length !== CODES.length ||
      CODES.some((code) => !Array.isArray(input.levels[code]) || input.levels[code].length !== 6 ||
        input.levels[code].some((level) => !Number.isInteger(level) || level < 1 || level > 3))) {
    throw badRequest('Cần đủ 5 vị trí, mỗi vị trí 6 mức từ 1 đến 3.');
  }
  const next: ReferencePositionLevels = {
    version: current.version + 1,
    levels: Object.fromEntries(CODES.map((code) => [code, [...input.levels[code]]])),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}, { roles: [ROLES.PLATFORM_ADMIN] });
