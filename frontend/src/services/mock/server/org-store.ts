import { REFERENCE_POSITIONS } from '../../../lib/reference-positions';
import { MOCK_ACCOUNTS } from '../mock-accounts';
import { getDb, onMockReset } from '../mock-store';
import type { ReferencePositionCode } from './catalog';
import { ACME_ORGANIZATION_ID, buildAcmeData } from './seed-acme';
import type { DepartmentRecord, JobPositionRecord, OrgData } from './types';

/**
 * Persisted data of each organization the mock server knows. The demo organization (Acme) is seeded in code;
 * an organization created through the sign-up flow starts from what its owner entered in the setup wizard.
 * Kept in localStorage so edits survive reloads; clear `dt-mock-org-data` (or the mock database) to start over.
 */

const STORAGE_KEY = 'dt-mock-org-data-v2';

let cache: Record<string, OrgData> | null = null;

function read(): Record<string, OrgData> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, OrgData>) : {};
  } catch {
    return {};
  }
}

function write(all: Record<string, OrgData>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // Storage full or blocked: the session still works from memory.
  }
}

const isReferenceCode = (code: string): code is ReferencePositionCode =>
  REFERENCE_POSITIONS.some((position) => position.code === code);

/** Organization data derived from the setup wizard of a registered organization. */
function seedFromRegistration(organizationId: string): OrgData {
  const registered = getDb().organizations.find((org) => org.id === organizationId);
  const demoName = MOCK_ACCOUNTS.find((account) => account.organization?.id === organizationId)?.organization?.name;
  const at = new Date().toISOString();

  const departments: DepartmentRecord[] = (registered?.departments ?? []).map((department, index) => ({
    id: department.id,
    code: `PB${String(index + 1).padStart(2, '0')}`,
    name: department.name,
    status: 'ACTIVE',
    createdAt: at,
    updatedAt: at,
  }));
  const positions: JobPositionRecord[] = (registered?.positions ?? []).map((position) => ({
    id: position.id,
    code: position.code,
    name: position.name,
    referenceCode: isReferenceCode(position.code) ? position.code : undefined,
    status: 'ACTIVE',
    createdAt: at,
    updatedAt: at,
  }));

  return {
    organizationId,
    settings: {
      name: registered?.name ?? demoName ?? 'Tổ chức',
      industry: registered?.industry ?? '',
      size: registered?.size ?? '',
      timezone: 'Asia/Ho_Chi_Minh',
      defaultAssignmentDays: 30,
    },
    departments,
    jobFamilies: [],
    positions,
    employees: [],
    requirementSets: [],
    profiles: {},
    skillGapRuns: [],
    assignments: [],
    decisions: [],
    seedMembers: [],
    seedInvitations: [],
    memberOverrides: {},
    audit: [],
  };
}

function load(): Record<string, OrgData> {
  cache ??= read();
  return cache;
}

export function getOrgData(organizationId: string): OrgData {
  const all = load();
  if (!all[organizationId]) {
    all[organizationId] = organizationId === ACME_ORGANIZATION_ID ? buildAcmeData() : seedFromRegistration(organizationId);
    write(all);
  }
  return all[organizationId];
}

/** Applies a change to one organization's data and persists it. The callback may mutate the data. */
export function updateOrgData<T>(organizationId: string, update: (data: OrgData) => T): T {
  const data = getOrgData(organizationId);
  const result = update(data);
  write(load());
  return result;
}

export function resetOrgStore(): void {
  cache = null;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

onMockReset(resetOrgStore);
