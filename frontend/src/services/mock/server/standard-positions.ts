import { NOT_STANDARD_POSITION, STANDARD_POSITIONS, standardPositionCode } from '../../../lib/standard-positions';
import { newId } from '../mock-store';
import type { JobPositionRecord, OrgData } from './types';

/**
 * Mirror of the backend `StandardPositions.Resolve`: a department has any name, a position is one of the 5 standard
 * ones, one per code, shared by every department. Returns the organization's position for a typed standard position
 * (created when it has none yet), or the reason when the value is not one of the 5 or that position is out of use.
 */
export function resolveStandardPosition(data: OrgData, nameOrCode: string): { position?: JobPositionRecord; error?: string } {
  const value = nameOrCode.trim();
  const code = standardPositionCode(value)
    ?? standardPositionCode(data.positions.find((p) => p.name.trim().toLowerCase() === value.toLowerCase())?.code);
  if (!code) return { error: NOT_STANDARD_POSITION };
  const position = data.positions.find((p) => p.code.toUpperCase() === code);
  if (position) {
    return position.status === 'ACTIVE' ? { position } : { error: 'Vị trí chuẩn này đã ngừng sử dụng trong doanh nghiệp.' };
  }
  const at = new Date().toISOString();
  const created: JobPositionRecord = { id: newId('pos'), code, name: STANDARD_POSITIONS[code], status: 'ACTIVE', createdAt: at, updatedAt: at };
  data.positions.push(created);
  return { position: created };
}

/** Names of the departments whose active employees hold the position. */
export function departmentsHolding(data: OrgData, positionId: string): string[] {
  const ids = new Set(data.employees.filter((e) => e.jobPositionId === positionId && e.status === 'ACTIVE').map((e) => e.departmentId));
  return data.departments.filter((d) => ids.has(d.id)).map((d) => d.name).sort((a, b) => a.localeCompare(b, 'vi'));
}
