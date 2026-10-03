import type { StoredUser } from '../mock-store';
import { getDb } from '../mock-store';
import type { EmployeeRecord, OrgData, SeedMemberRecord } from './types';

/**
 * Everyone with, or about to have, access to an organization, in one list: the seeded demo members, accounts
 * created through the sign-up flows, and pending invitations. Seats are counted from this list.
 */

export type MemberViewStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';

export interface MemberView {
  /** User id for members; invitation token or id for pending invitations. */
  id: string;
  kind: 'member' | 'invitation';
  fullName: string;
  email: string;
  roles: string[];
  status: MemberViewStatus;
  employeeId?: string;
  employeeCode?: string;
  departmentId?: string;
  departmentName?: string;
  jobPositionId?: string;
  positionName?: string;
  jobGrade?: 'G1' | 'G2' | 'G3';
  jobGradeName?: string;
  coveragePercent?: number | null;
  highGapCount?: number;
  activeCourses?: number;
  joinedAt?: string;
  invitedAt?: string;
  lastActiveAt?: string;
  deactivatedReason?: string;
}

function placementOf(data: OrgData, employee: EmployeeRecord | undefined) {
  const department = data.departments.find((d) => d.id === employee?.departmentId);
  const position = data.positions.find((p) => p.id === employee?.jobPositionId);
  const grade = data.jobGrades?.find((g) => g.code === position?.jobGrade);

  // Compute coverage, gaps, and learning if employee exists
  let coveragePercent: number | null = null;
  let highGapCount = 0;
  let activeCourses = 0;

  if (employee) {
    const run = data.skillGapRuns
      ?.filter((r) => r.employeeId === employee.id)
      ?.sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))[0];
    if (run) {
      coveragePercent = run.summary?.coveragePercent ?? null;
      highGapCount = run.items.filter((i) => i.severity === 'HIGH').length;
    }
    activeCourses = data.assignments?.filter((a) => a.employeeId === employee.id && a.status === 'IN_PROGRESS').length ?? 0;
  }

  return {
    employeeId: employee?.id,
    employeeCode: employee?.employeeCode,
    departmentId: department?.id,
    departmentName: department?.name,
    jobPositionId: position?.id,
    positionName: position?.name,
    jobGrade: position?.jobGrade,
    jobGradeName: grade?.name,
    coveragePercent,
    highGapCount,
    activeCourses,
  };
}

function fromSeed(data: OrgData, seed: SeedMemberRecord): MemberView {
  const override = data.memberOverrides[seed.id];
  const employee = data.employees.find((e) => e.id === seed.employeeId);
  const status = override?.status ?? seed.status;
  return {
    id: seed.id,
    kind: 'member',
    fullName: seed.fullName,
    email: seed.email,
    roles: override?.roles ?? seed.roles,
    status,
    ...placementOf(data, employee),
    joinedAt: seed.joinedAt,
    lastActiveAt: seed.lastActiveAt,
    deactivatedReason: status === 'INACTIVE' ? (override?.deactivatedReason ?? seed.deactivatedReason) : undefined,
  };
}

function fromUser(data: OrgData, user: StoredUser): MemberView {
  const employee = data.employees.find((e) => e.userId === user.id);
  return {
    id: user.id,
    kind: 'member',
    fullName: user.fullName,
    email: user.email,
    roles: user.roles,
    status: user.status ?? 'ACTIVE',
    ...placementOf(data, employee),
    joinedAt: employee?.joinedAt,
    deactivatedReason: user.deactivatedReason,
  };
}


export function listMembers(data: OrgData): MemberView[] {
  const db = getDb();
  const seeded = data.seedMembers.map((seed) => fromSeed(data, seed));
  const seededIds = new Set(seeded.map((m) => m.id));

  const registered = db.users
    .filter((user) => user.organizationId === data.organizationId && !seededIds.has(user.id))
    .map((user) => fromUser(data, user));

  const invitations: MemberView[] = [
    ...data.seedInvitations.map((invitation): MemberView => ({
      id: invitation.id,
      kind: 'invitation',
      fullName: invitation.fullName,
      email: invitation.email,
      roles: [invitation.role],
      status: 'PENDING',
      departmentId: invitation.departmentId,
      departmentName: data.departments.find((d) => d.id === invitation.departmentId)?.name,
      jobPositionId: invitation.jobPositionId,
      positionName: data.positions.find((p) => p.id === invitation.jobPositionId)?.name,
      invitedAt: invitation.invitedAt,
    })),
    ...db.invitations
      .filter((invitation) => invitation.organizationId === data.organizationId && invitation.status === 'pending')
      .map((invitation): MemberView => ({
        id: invitation.token,
        kind: 'invitation',
        fullName: invitation.fullName,
        email: invitation.email,
        roles: [invitation.role],
        status: 'PENDING',
        departmentName: invitation.departmentName,
        positionName: invitation.positionName,
        invitedAt: invitation.createdAt,
      })),
  ];

  return [...seeded, ...registered, ...invitations];
}

/** Seats in use: active members plus invitations still waiting. A deactivated member frees their seat. */
export function seatsInUse(data: OrgData): number {
  return listMembers(data).filter((member) => member.status !== 'INACTIVE').length;
}

/** The active members who hold a role: used to keep at least one owner. */
export function activeHolders(data: OrgData, role: string): MemberView[] {
  return listMembers(data).filter((m) => m.kind === 'member' && m.status === 'ACTIVE' && m.roles.includes(role));
}

/**
 * Gives a member who just activated an invitation an employee profile, placed where the invitation said
 * (falling back to the first department, or a general one when the organization has none yet).
 */
export function addEmployeeForMember(
  data: OrgData,
  member: { userId: string; fullName: string; email: string },
  placement: { departmentName?: string; positionName?: string },
): EmployeeRecord {
  const now = new Date().toISOString();
  let department =
    data.departments.find((d) => d.name === placement.departmentName && d.status === 'ACTIVE') ??
    data.departments.find((d) => d.status === 'ACTIVE');
  if (!department) {
    department = { id: `dep-general-${data.organizationId}`, code: 'CHUNG', name: 'Chung', status: 'ACTIVE', createdAt: now, updatedAt: now };
    data.departments.push(department);
  }
  const position = data.positions.find((p) => p.name === placement.positionName && p.status === 'ACTIVE');
  const employee: EmployeeRecord = {
    id: `emp-${member.userId}`,
    userId: member.userId,
    departmentId: department.id,
    jobPositionId: position?.id,
    directManagerId: department.managerEmployeeId,
    employeeCode: `NV${String(data.employees.length + 1).padStart(3, '0')}`,
    fullName: member.fullName,
    workEmail: member.email,
    status: 'ACTIVE',
    joinedAt: now.slice(0, 10),
    createdAt: now,
    updatedAt: now,
  };
  data.employees.push(employee);
  return employee;
}
