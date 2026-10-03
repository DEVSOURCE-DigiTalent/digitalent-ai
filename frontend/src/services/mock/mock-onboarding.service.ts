import { ENTITLEMENTS } from '../../lib/entitlements';
import { REFERENCE_POSITIONS } from '../../lib/reference-positions';
import { ROLES } from '../../lib/roles';
import type {
  InvitationSummary, InviteResult, InviteRow, OrganizationInput, OrganizationSetup,
} from '../../types/commerce';
import { currentMockUserId } from './mock-auth.service';
import { findMockAccountByEmail } from './mock-accounts';
import { mockFail, mockOk } from './mock-http';
import {
  findUserByEmail, findUserById, getDb, newId, newToken, seatsUsed, subscriptionOf, updateDb,
  type StoredInvitation, type StoredOrganization, type StoredUser,
} from './mock-store';

const FORBIDDEN = 'Chỉ chủ sở hữu hoặc quản trị tổ chức mới thiết lập được tổ chức.';
const NEEDS_ORGANIZATION = 'Hãy tạo tổ chức trước.';
const NEEDS_PAYMENT = 'Hãy thanh toán gói dịch vụ trước.';

function admin(): StoredUser | undefined {
  const user = findUserById(currentMockUserId() ?? '');
  const allowed = user && user.roles.some((role) => role === ROLES.OWNER);
  return allowed ? user : undefined;
}

/** The setup wizard comes after payment: without an active plan nothing here may change. */
function isPaid(user: StoredUser): boolean {
  return subscriptionOf(user)?.status === 'active';
}

function organizationOf(user: StoredUser): StoredOrganization | undefined {
  return getDb().organizations.find((org) => org.id === user.organizationId);
}

function toSummary(invitation: StoredInvitation): InvitationSummary {
  return {
    token: invitation.token,
    email: invitation.email,
    fullName: invitation.fullName,
    departmentName: invitation.departmentName,
    positionName: invitation.positionName,
    role: invitation.role as InvitationSummary['role'],
    status: invitation.status,
  };
}

const DEFAULT_GRADES = [
  { code: 'G1', name: 'Cấp Tác nghiệp / Chuyên viên', description: 'Thực hiện công việc chuyên môn, tác nghiệp trực tiếp' },
  { code: 'G2', name: 'Cấp Quản lý trực tiếp / Trưởng nhóm', description: 'Quản lý nhóm, phân công, giám sát và đánh giá công việc' },
  { code: 'G3', name: 'Cấp Lãnh đạo / Quản lý cấp cao', description: 'Định hướng chiến lược, quản trị phòng ban và tổ chức' },
];

function setupFor(user: StoredUser): OrganizationSetup {
  const organization = organizationOf(user);
  const subscription = subscriptionOf(user);
  return {
    organization: organization
      ? {
          id: organization.id,
          name: organization.name,
          industry: organization.industry,
          size: organization.size,
          logoUrl: organization.logoUrl,
          timezone: organization.timezone || 'Asia/Ho_Chi_Minh',
        }
      : null,
    grades: organization?.grades && organization.grades.length > 0 ? organization.grades : DEFAULT_GRADES,
    departments: organization?.departments ?? [],
    positions: organization?.positions ?? [],
    invitations: organization
      ? getDb().invitations.filter((i) => i.organizationId === organization.id).map(toSummary)
      : [],
    seatLimit: subscription?.seatLimit,
    seatsUsed: organization ? seatsUsed(organization.id) : 0,
    completed: organization?.setupCompleted ?? false,
    setupStep: organization?.setupStep ?? user.setupStep ?? 0,
    canBulkImport: subscription?.entitlements.includes(ENTITLEMENTS.BULK_IMPORT) ?? false,
  };
}

export const mockOnboardingService = {
  getSetup: async () => {
    const user = admin();
    if (!user) return mockFail(403, FORBIDDEN);
    if (!isPaid(user)) return mockFail(402, NEEDS_PAYMENT);
    return mockOk(setupFor(user));
  },

  saveOrganization: async (input: OrganizationInput) => {
    const user = admin();
    if (!user) return mockFail(403, FORBIDDEN);
    if (!isPaid(user)) return mockFail(402, NEEDS_PAYMENT);
    updateDb((db) => {
      const stored = db.users.find((u) => u.id === user.id)!;
      const existing = db.organizations.find((org) => org.id === stored.organizationId);
      if (existing) {
        Object.assign(existing, {
          name: input.name.trim(),
          industry: input.industry,
          size: input.size,
          logoUrl: input.logoUrl?.trim() || undefined,
          timezone: input.timezone || 'Asia/Ho_Chi_Minh',
        });
        return;
      }
      const organization: StoredOrganization = {
        id: newId('org'),
        name: input.name.trim(),
        industry: input.industry,
        size: input.size,
        logoUrl: input.logoUrl?.trim() || undefined,
        timezone: input.timezone || 'Asia/Ho_Chi_Minh',
        ownerId: stored.id,
        departments: [],
        positions: [],
        grades: DEFAULT_GRADES,
        setupCompleted: false,
      };
      db.organizations.push(organization);
      stored.organizationId = organization.id;
    });
    return mockOk(setupFor(findUserById(user.id)!));
  },

  saveGrades: async (grades: { code: string; name: string; description: string }[]) => {
    const user = admin();
    if (!user) return mockFail(403, FORBIDDEN);
    if (!isPaid(user)) return mockFail(402, NEEDS_PAYMENT);
    if (!organizationOf(user)) return mockFail(400, NEEDS_ORGANIZATION);
    updateDb((db) => {
      const organization = db.organizations.find((org) => org.id === user.organizationId)!;
      organization.grades = grades;
    });
    return mockOk(setupFor(findUserById(user.id)!));
  },

  saveDepartments: async (names: string[]) => {
    const user = admin();
    if (!user) return mockFail(403, FORBIDDEN);
    if (!isPaid(user)) return mockFail(402, NEEDS_PAYMENT);
    if (!organizationOf(user)) return mockFail(400, NEEDS_ORGANIZATION);
    updateDb((db) => {
      const organization = db.organizations.find((org) => org.id === user.organizationId)!;
      const wanted = [...new Set(names.map((name) => name.trim()).filter(Boolean))];
      organization.departments = wanted.map(
        (name) => organization.departments.find((d) => d.name === name) ?? { id: newId('dep'), name },
      );
    });
    return mockOk(setupFor(findUserById(user.id)!));
  },

  /** `codes` are reference positions to use; `custom` are names the organization adds itself. */
  savePositions: async (selection: {
    codes: string[];
    custom: string[];
    details?: Record<string, { departmentName?: string; jobGrade?: string }>;
  }) => {
    const user = admin();
    if (!user) return mockFail(403, FORBIDDEN);
    if (!isPaid(user)) return mockFail(402, NEEDS_PAYMENT);
    if (!organizationOf(user)) return mockFail(400, NEEDS_ORGANIZATION);
    updateDb((db) => {
      const organization = db.organizations.find((org) => org.id === user.organizationId)!;
      const defaultGradeFor = (code: string) => {
        if (code === 'POS_CEO' || code === 'POS_CTO' || code === 'POS_CFO') return 'G3';
        if (code.includes('MANAGER') || code.includes('LEAD') || code.includes('DIRECTOR')) return 'G2';
        return 'G1';
      };
      const keep = (code: string, name: string, isCustom: boolean) => {
        const found = organization.positions.find((p) => p.code === code);
        const detail = selection.details?.[code];
        const grade = detail?.jobGrade || found?.jobGrade || defaultGradeFor(code);
        const dept = detail?.departmentName || found?.departmentName;
        return {
          id: found?.id ?? newId('pos'),
          code,
          name,
          isCustom,
          departmentName: dept,
          jobGrade: grade,
        };
      };
      const fromReference = REFERENCE_POSITIONS.filter((ref) => selection.codes.includes(ref.code)).map((ref) =>
        keep(ref.code, ref.name, false),
      );
      const custom = [...new Set(selection.custom.map((name) => name.trim()).filter(Boolean))].map((name) =>
        keep(`CUSTOM_${name.toUpperCase().replace(/\s+/g, '_')}`, name, true),
      );
      organization.positions = [...fromReference, ...custom];
    });
    return mockOk(setupFor(findUserById(user.id)!));
  },

  inviteMembers: async (rows: InviteRow[]) => {
    const user = admin();
    if (!user) return mockFail(403, FORBIDDEN);
    if (!isPaid(user)) return mockFail(402, NEEDS_PAYMENT);
    const organization = organizationOf(user);
    if (!organization) return mockFail(400, NEEDS_ORGANIZATION);
    const seatLimit = subscriptionOf(user)?.seatLimit;

    const result = updateDb((db): InviteResult => {
      const created: StoredInvitation[] = [];
      const rejected: InviteResult['rejected'] = [];
      let used = seatsUsed(organization.id);

      for (const row of rows) {
        const email = row.email.trim().toLowerCase();
        const alreadyInvited = db.invitations.some((i) => i.organizationId === organization.id && i.email === email);
        if (findMockAccountByEmail(email) || findUserByEmail(email) || alreadyInvited) {
          rejected.push({ email, reason: 'Email đã có tài khoản hoặc đã được mời.' });
        } else if (seatLimit !== undefined && used >= seatLimit) {
          rejected.push({ email, reason: 'Đã hết số ghế của gói.' });
        } else {
          const invitation: StoredInvitation = {
            token: newToken(),
            organizationId: organization.id,
            email,
            fullName: row.fullName.trim(),
            departmentName: row.departmentName || undefined,
            positionName: row.positionName || undefined,
            role: row.role,
            status: 'pending',
            createdAt: new Date().toISOString(),
          };
          db.invitations.push(invitation);
          created.push(invitation);
          used += 1;
        }
      }
      return { created: created.map(toSummary), rejected };
    });
    return mockOk(result);
  },

  saveStep: async (stepIndex: number) => {
    const user = admin();
    if (!user) return mockFail(403, FORBIDDEN);
    updateDb((db) => {
      const stored = db.users.find((u) => u.id === user.id);
      if (stored) stored.setupStep = stepIndex;
      if (stored?.organizationId) {
        const org = db.organizations.find((o) => o.id === stored.organizationId);
        if (org) org.setupStep = stepIndex;
      }
    });
    return mockOk({ saved: true });
  },

  saveStepAndExit: async (stepIndex: number) => {
    const user = admin();
    if (!user) return mockFail(403, FORBIDDEN);
    updateDb((db) => {
      const stored = db.users.find((u) => u.id === user.id);
      if (stored) {
        stored.setupStep = stepIndex;
        // P15: If organization exists, user can enter the portal
        if (stored.organizationId) {
          stored.onboardingStatus = undefined;
        }
      }
      if (stored?.organizationId) {
        const org = db.organizations.find((o) => o.id === stored.organizationId);
        if (org) org.setupStep = stepIndex;
      }
    });
    return mockOk({ saved: true });
  },

  completeSetup: async () => {
    const user = admin();
    if (!user) return mockFail(403, FORBIDDEN);
    if (!isPaid(user)) return mockFail(402, NEEDS_PAYMENT);
    if (!organizationOf(user)) return mockFail(400, NEEDS_ORGANIZATION);
    updateDb((db) => {
      db.organizations.find((org) => org.id === user.organizationId)!.setupCompleted = true;
      db.users.find((u) => u.id === user.id)!.onboardingStatus = undefined;
    });
    return mockOk(setupFor(findUserById(user.id)!));
  },
};
