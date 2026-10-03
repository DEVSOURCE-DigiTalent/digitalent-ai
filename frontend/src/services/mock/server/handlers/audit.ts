import type { SessionUser } from '../../../../types/session';
import { newId } from '../../mock-store';
import type { OrgData } from '../types';

/** Appends an entry to the organization audit log (spec ADM-11). Call inside `update()`. */
export function recordAudit(
  data: OrgData,
  actor: SessionUser,
  action: string,
  targetType: string,
  targetLabel: string,
  detail?: string,
): void {
  data.audit.unshift({
    id: newId('aud'),
    at: new Date().toISOString(),
    actorName: actor.fullName,
    action,
    targetType,
    targetLabel,
    detail,
  });
}
