import { PLANS, getPlan } from '../../../../lib/plans';
import { REFERENCE_POSITIONS, type ReferencePosition } from '../../../../lib/reference-positions';
import { levelLabel } from '../../../../lib/competency-levels';
import { getDb, updateDb } from '../../mock-store';
import { ACME_ORGANIZATION_ID } from '../seed-acme';
import { getOrgData } from '../org-store';
import {
  CATEGORIES, COMPETENCIES, COURSES,
  referenceLevel, type ReferencePositionCode, type CatalogCourse, type CatalogCompetency,
} from '../catalog';
import { badRequest, matchesSearch, notFound, paginate, pageRequest } from '../http';
import { route as baseRoute } from '../router';
import { ROLES } from '../../../../lib/roles';
import { PERMISSIONS } from '../../../../hooks/use-permission';

const route: typeof baseRoute = (method, pattern, handler, options = {}) => {
  if (pattern.startsWith('/platform')) {
    return baseRoute(method, pattern, handler, { ...options, roles: [ROLES.PLATFORM_ADMIN] });
  }
  return baseRoute(method, pattern, handler, options);
};
import type {
  PlatformAssessmentQuestionDto, PlatformAuditLogEntry, PlatformCurriculumModule,
  PlatformDashboardDto, PlatformOrganizationDto, PlatformPlanDto, PlatformReferencePositionDto,
  PlatformSettingsDto, PlatformStandardCourseDto, PlatformSubscriptionDto,
  UserProfileDto, LoginHistoryEntry, NotificationDto,
  PlatformUserDto, PlatformCompetencyDetailDto, PlatformAssessmentTemplateDto, PlatformSubscriptionDetailDto,
} from '../../../platform.service';

// In-memory / mock store state for platform modifications
const platformState = {
  suspendedOrgs: new Map<string, string>(), // orgId -> reason
  seatOverrides: new Map<string, number>(), // orgId -> seatLimit
  planOverrides: new Map<string, Partial<PlatformPlanDto>>(),
  competencyDescriptions: new Map<string, string>(),
  competencyOverrides: new Map<string, Partial<CatalogCompetency>>(),
  courseOverrides: new Map<string, Partial<PlatformStandardCourseDto>>(),
  positionRequirements: new Map<string, Map<string, number>>(), // posCode -> (frameworkCode -> level)
  userLocks: new Map<string, string>(), // userId -> lockReason
  cancelledSubscriptions: new Map<string, string>(), // subId -> reason
  customQuestions: new Map<string, PlatformAssessmentQuestionDto>(),
  assessmentTemplates: [
    {
      id: 'tpl-tt02-d1',
      code: 'TPL-D1-BASIC',
      title: 'Đề đánh giá chuẩn: Miền 1 - Dữ liệu và thông tin số',
      description: 'Bộ đề trắc nghiệm chuẩn hóa đánh giá kiến thức và kỹ năng khai thác, phân tích dữ liệu theo Khung chuẩn năng lực số.',
      durationMinutes: 45,
      totalQuestions: 20,
      passScorePercentage: 70,
      maxAttempts: 3,
      targetCompetencies: [
        { frameworkCode: '1.1', name: 'Duyệt, tìm kiếm và lọc dữ liệu, thông tin và nội dung số', questionCount: 7 },
        { frameworkCode: '1.2', name: 'Đánh giá dữ liệu, thông tin và nội dung số', questionCount: 7 },
        { frameworkCode: '1.3', name: 'Quản lý dữ liệu, thông tin và nội dung số', questionCount: 6 },
      ],
      status: 'ACTIVE' as const,
      updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: 'tpl-tt02-d2',
      code: 'TPL-TT02-D2-INTERMEDIATE',
      title: 'Đề đánh giá chuẩn: Miền 2 - Giao tiếp và hợp tác trong môi trường số',
      description: 'Đánh giá kỹ năng tương tác, chia sẻ và hợp tác qua các công cụ kỹ thuật số doanh nghiệp.',
      durationMinutes: 45,
      totalQuestions: 20,
      passScorePercentage: 75,
      maxAttempts: 2,
      targetCompetencies: [
        { frameworkCode: '2.1', name: 'Tương tác thông qua các công nghệ số', questionCount: 5 },
        { frameworkCode: '2.2', name: 'Chia sẻ thông qua các công nghệ số', questionCount: 5 },
        { frameworkCode: '2.3', name: 'Tham gia công dân thông qua các công nghệ số', questionCount: 5 },
        { frameworkCode: '2.4', name: 'Hợp tác thông qua các công nghệ số', questionCount: 5 },
      ],
      status: 'ACTIVE' as const,
      updatedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    },
    {
      id: 'tpl-tt02-d4',
      code: 'TPL-TT02-D4-CORE',
      title: 'Đề kiểm tra bắt buộc: An toàn thông tin và bảo mật số',
      description: 'Đề đánh giá các năng lực cốt lõi về bảo vệ thiết bị, dữ liệu cá nhân và an toàn số trong doanh nghiệp.',
      durationMinutes: 60,
      totalQuestions: 25,
      passScorePercentage: 80,
      maxAttempts: 3,
      targetCompetencies: [
        { frameworkCode: '4.1', name: 'Bảo vệ thiết bị', questionCount: 7 },
        { frameworkCode: '4.2', name: 'Bảo vệ dữ liệu cá nhân và quyền riêng tư', questionCount: 8 },
        { frameworkCode: '4.3', name: 'Bảo vệ sức khỏe và an sinh', questionCount: 5 },
        { frameworkCode: '4.4', name: 'Bảo vệ môi trường', questionCount: 5 },
      ],
      status: 'ACTIVE' as const,
      updatedAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    },
  ] as PlatformAssessmentTemplateDto[],
  settings: {
    maintenanceMode: false,
    allowSelfRegistration: true,
    mockPaymentSuccessRate: 100,
    mockEmailDelivery: true,
    aiScoringModel: 'gemini-1.5-pro-preview',
    defaultTrialDays: 14,
  } as PlatformSettingsDto,
  auditLogs: [
    {
      id: 'aud-01',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      actorEmail: 'platform@digitalent.ai',
      actorName: 'Quản trị viên Nền tảng',
      action: 'ORGANIZATION_APPROVED',
      targetType: 'Organization',
      targetName: 'Acme Corporation',
      details: 'Kích hoạt gói dịch vụ Pro (10 người dùng)',
    },
    {
      id: 'aud-02',
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      actorEmail: 'platform@digitalent.ai',
      actorName: 'Quản trị viên Nền tảng',
      action: 'FRAMEWORK_SYNC',
      targetType: 'CompetencyFramework',
      targetName: 'DIGITAL_FRAMEWORK',
      details: 'Đồng bộ 24 chuẩn năng lực theo Khung chuẩn năng lực số',
    },
    {
      id: 'aud-03',
      timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
      actorEmail: 'platform@digitalent.ai',
      actorName: 'Quản trị viên Nền tảng',
      action: 'PLAN_UPDATED',
      targetType: 'SubscriptionPlan',
      targetName: 'ENT_PRO',
      details: 'Cập nhật giá niêm yết chu kỳ năm',
    },
  ] as PlatformAuditLogEntry[],
  notifications: [
    {
      id: 'notif-1',
      title: 'Chào mừng bạn đến với DigiTalent AI',
      message: 'Hệ thống đã sẵn sàng với bộ dữ liệu Khung chuẩn năng lực số.',
      type: 'info',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      isRead: false,
    },
    {
      id: 'notif-2',
      title: 'Thông báo cập nhật hệ thống',
      message: 'Cổng Quản trị Nền tảng (Platform Portal) đã được nâng cấp giao diện v1.0.',
      type: 'success',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      isRead: false,
    },
    {
      id: 'notif-3',
      title: 'Nhắc nhở bảo mật',
      message: 'Định kỳ đổi mật khẩu để nâng cao an toàn tài khoản quản trị.',
      type: 'warning',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      isRead: true,
    },
  ] as NotificationDto[],
};

function getAllOrganizations(): PlatformOrganizationDto[] {
  const db = getDb();
  const orgs: PlatformOrganizationDto[] = [];

  // Seed demo org: Acme Corporation
  const acmeData = getOrgData(ACME_ORGANIZATION_ID);
  const acmeSuspended = platformState.suspendedOrgs.has(ACME_ORGANIZATION_ID);
  orgs.push({
    id: ACME_ORGANIZATION_ID,
    name: acmeData.settings.name,
    industry: acmeData.settings.industry || 'Công nghệ thông tin',
    size: acmeData.settings.size || '21-100',
    ownerName: 'Nguyễn Văn Chủ',
    ownerEmail: 'owner@digitalent.ai',
    planCode: 'ENT_PRO',
    planName: 'Gói Pro',
    status: acmeSuspended ? 'SUSPENDED' : 'ACTIVE',
    seatLimit: platformState.seatOverrides.get(ACME_ORGANIZATION_ID) ?? 100,
    seatsUsed: acmeData.employees.length || 5,
    departmentsCount: acmeData.departments.length || 3,
    positionsCount: acmeData.positions.length || 5,
    membersCount: 8,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    suspensionReason: platformState.suspendedOrgs.get(ACME_ORGANIZATION_ID),
  });

  // DB registered organizations
  for (const org of db.organizations) {
    if (org.id === ACME_ORGANIZATION_ID) continue;
    const isSuspended = platformState.suspendedOrgs.has(org.id);
    const owner = db.users.find((u) => u.id === org.ownerId);
    const plan = owner?.subscription ? getPlan(owner.subscription.planCode) : getPlan('ENT_STARTER');
    const members = db.users.filter((u) => u.organizationId === org.id);
    const invitations = db.invitations.filter((i) => i.organizationId === org.id);

    orgs.push({
      id: org.id,
      name: org.name,
      industry: org.industry || 'Dịch vụ',
      size: org.size || '21-100',
      ownerName: owner?.fullName || 'Chủ doanh nghiệp',
      ownerEmail: owner?.email || 'owner@example.com',
      planCode: plan?.code || 'ENT_STARTER',
      planName: plan?.name || 'Gói Starter',
      status: isSuspended ? 'SUSPENDED' : 'ACTIVE',
      seatLimit: platformState.seatOverrides.get(org.id) ?? owner?.subscription?.seatLimit ?? 5,
      seatsUsed: members.length + invitations.length,
      departmentsCount: org.departments.length,
      positionsCount: org.positions.length,
      membersCount: members.length,
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      suspensionReason: platformState.suspendedOrgs.get(org.id),
    });
  }

  return orgs;
}

// ── PLT-01: Dashboard ──
route('GET', '/platform/dashboard', () => {
  const orgs = getAllOrganizations();
  const db = getDb();
  const activeOrgs = orgs.filter((o) => o.status === 'ACTIVE');
  const suspendedOrgs = orgs.filter((o) => o.status === 'SUSPENDED');

  const totalUsers = 15 + db.users.length;
  const totalLearners = 12 + db.users.filter((u) => u.roles.includes('EMPLOYEE')).length;
  const activeSubs = activeOrgs.length + 3; // + mock individual subscriptions

  // Estimate MRR / ARR from active orgs
  let mrr = 0;
  for (const org of activeOrgs) {
    const plan = getPlan(org.planCode);
    if (plan && plan.monthlyPrice) mrr += plan.monthlyPrice * (org.seatLimit || 5);
  }
  mrr += 290000 * 3; // + B2C subscriptions
  const arr = mrr * 12;

  const subscriptionDistribution = [
    { planCode: 'ENT_STARTER', planName: 'Doanh nghiệp Starter', count: orgs.filter((o) => o.planCode === 'ENT_STARTER').length },
    { planCode: 'ENT_PRO', planName: 'Doanh nghiệp Pro', count: orgs.filter((o) => o.planCode === 'ENT_PRO').length },
    { planCode: 'ENT_ENTERPRISE', planName: 'Doanh nghiệp Tùy biến', count: orgs.filter((o) => o.planCode === 'ENT_ENTERPRISE').length },
    { planCode: 'IND_PLUS', planName: 'Cá nhân Plus', count: 8 },
  ];

  const dashboard: PlatformDashboardDto = {
    metrics: {
      totalOrganizations: orgs.length,
      activeOrganizations: activeOrgs.length,
      suspendedOrganizations: suspendedOrgs.length,
      totalUsers,
      totalLearners,
      activeSubscriptions: activeSubs,
      mrr,
      arr,
      standardCoursesCount: COURSES.length,
      standardQuestionsCount: 72,
    },
    recentOrganizations: orgs.slice(0, 5),
    subscriptionDistribution,
  };

  return dashboard;
});

// ── PLT-02: Organizations List ──
route('GET', '/platform/organizations', (context) => {
  const { query } = context;
  let list = getAllOrganizations();

  if (query.search) {
    list = list.filter((org) => matchesSearch(org.name, query.search) || matchesSearch(org.ownerEmail, query.search));
  }
  if (query.status) {
    list = list.filter((org) => org.status === query.status);
  }
  if (query.planCode) {
    list = list.filter((org) => org.planCode === query.planCode);
  }

  return paginate(list, pageRequest(query));
});

// ── PLT-03: Organization Detail & Management ──
route('GET', '/platform/organizations/:id', (context) => {
  const org = getAllOrganizations().find((o) => o.id === context.params.id);
  if (!org) throw notFound('Không tìm thấy tổ chức.');
  return org;
});

route('PUT', '/platform/organizations/:id/status', (context) => {
  const { id } = context.params;
  const status = context.body.status as 'ACTIVE' | 'SUSPENDED';
  const reason = String(context.body.reason ?? '').trim();

  if (!status || !['ACTIVE', 'SUSPENDED'].includes(status)) {
    throw badRequest('Trạng thái không hợp lệ.');
  }

  const org = getAllOrganizations().find((o) => o.id === id);
  if (!org) throw notFound('Không tìm thấy tổ chức.');

  if (status === 'SUSPENDED') {
    if (!reason) throw badRequest('Cần nhập lý do tạm khóa tổ chức.');
    platformState.suspendedOrgs.set(id, reason);
  } else {
    platformState.suspendedOrgs.delete(id);
  }

  platformState.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorEmail: context.session.email,
    actorName: context.session.fullName,
    action: status === 'SUSPENDED' ? 'ORGANIZATION_SUSPENDED' : 'ORGANIZATION_ACTIVATED',
    targetType: 'Organization',
    targetName: org.name,
    details: status === 'SUSPENDED' ? `Lý do: ${reason}` : 'Kích hoạt lại trạng thái hoạt động',
  });

  return { ...org, status, suspensionReason: status === 'SUSPENDED' ? reason : undefined };
}, { message: 'Đã cập nhật trạng thái tổ chức.' });

route('PUT', '/platform/organizations/:id/quota', (context) => {
  const { id } = context.params;
  const seatLimit = Number(context.body.seatLimit);
  if (!Number.isInteger(seatLimit) || seatLimit < 1 || seatLimit > 1000) {
    throw badRequest('Hạn mức người dùng phải là số nguyên từ 1 đến 1000.');
  }

  const org = getAllOrganizations().find((o) => o.id === id);
  if (!org) throw notFound('Không tìm thấy tổ chức.');

  platformState.seatOverrides.set(id, seatLimit);

  platformState.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorEmail: context.session.email,
    actorName: context.session.fullName,
    action: 'QUOTA_UPDATED',
    targetType: 'Organization',
    targetName: org.name,
    details: `Thay đổi hạn mức người dùng thành ${seatLimit}`,
  });

  return { ...org, seatLimit };
}, { message: 'Đã cập nhật hạn mức người dùng thành công.' });

// ── PA-04 & PA-05: User Accounts Management ──
const DEMO_PLATFORM_USERS: PlatformUserDto[] = [
  {
    id: 'usr-plt-01',
    email: 'platform@digitalent.ai',
    fullName: 'Quản trị viên Nền tảng',
    phone: '0901234567',
    jobTitle: 'Quản trị hệ thống',
    roles: ['PLATFORM_ADMIN'],
    workspace: 'enterprise',
    status: 'ACTIVE',
    emailVerified: true,
    createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
    lastLoginAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'usr-own-01',
    email: 'owner@digitalent.ai',
    fullName: 'Nguyễn Văn Chủ',
    phone: '0912345678',
    jobTitle: 'Giám đốc điều hành',
    roles: ['OWNER'],
    workspace: 'enterprise',
    organizationId: ACME_ORGANIZATION_ID,
    organizationName: 'Acme Corporation',
    status: 'ACTIVE',
    emailVerified: true,
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    lastLoginAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'usr-mng-01',
    email: 'manager@digitalent.ai',
    fullName: 'Trần Thị Quản Lý',
    phone: '0923456789',
    jobTitle: 'Trưởng phòng Kinh doanh',
    roles: ['MANAGER'],
    workspace: 'enterprise',
    organizationId: ACME_ORGANIZATION_ID,
    organizationName: 'Acme Corporation',
    status: 'ACTIVE',
    emailVerified: true,
    createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
    lastLoginAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'usr-emp-01',
    email: 'employee@digitalent.ai',
    fullName: 'Lê Văn Nhân Viên',
    phone: '0934567890',
    jobTitle: 'Chuyên viên Phân tích',
    roles: ['EMPLOYEE'],
    workspace: 'enterprise',
    organizationId: ACME_ORGANIZATION_ID,
    organizationName: 'Acme Corporation',
    status: 'ACTIVE',
    emailVerified: true,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    lastLoginAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'usr-own-02',
    email: 'starter@digitalent.ai',
    fullName: 'Phạm Khởi Nghiệp',
    phone: '0945678901',
    jobTitle: 'Founder',
    roles: ['OWNER'],
    workspace: 'enterprise',
    organizationId: 'org-starter-01',
    organizationName: 'Công ty Công nghệ Alpha',
    status: 'ACTIVE',
    emailVerified: true,
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    lastLoginAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'usr-exp-01',
    email: 'expired@digitalent.ai',
    fullName: 'Hoàng Hết Hạn',
    phone: '0956789012',
    jobTitle: 'Giám đốc',
    roles: ['OWNER'],
    workspace: 'enterprise',
    organizationId: 'org-expired-01',
    organizationName: 'Tập đoàn Beta',
    status: 'ACTIVE',
    emailVerified: true,
    createdAt: new Date(Date.now() - 86400000 * 120).toISOString(),
    lastLoginAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'usr-per-01',
    email: 'personal@digitalent.ai',
    fullName: 'Vũ Học Viên Cá Nhân',
    phone: '0967890123',
    jobTitle: 'Chuyên viên tự do',
    roles: [],
    workspace: 'personal',
    status: 'ACTIVE',
    emailVerified: true,
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    lastLoginAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

function getAllUsers(): PlatformUserDto[] {
  const db = getDb();
  const orgs = getAllOrganizations();
  const list: PlatformUserDto[] = [];

  for (const u of DEMO_PLATFORM_USERS) {
    const isLocked = platformState.userLocks.has(u.id);
    list.push({
      ...u,
      status: isLocked ? 'LOCKED' : u.status,
      lockReason: platformState.userLocks.get(u.id),
    });
  }

  for (const u of db.users) {
    if (list.some((existing) => existing.id === u.id || existing.email === u.email)) continue;
    const isLocked = platformState.userLocks.has(u.id) || u.status === 'INACTIVE';
    const org = orgs.find((o) => o.id === u.organizationId);
    list.push({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      phone: u.phone,
      jobTitle: u.jobTitle,
      roles: u.roles,
      workspace: u.workspace,
      organizationId: u.organizationId,
      organizationName: org?.name,
      status: isLocked ? 'LOCKED' : 'ACTIVE',
      lockReason: platformState.userLocks.get(u.id) ?? u.deactivatedReason,
      emailVerified: u.emailVerified,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      lastLoginAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    });
  }

  return list;
}

route('GET', '/platform/users', (context) => {
  const { query } = context;
  let list = getAllUsers();

  if (query.search) {
    list = list.filter((u) => matchesSearch(u.fullName, query.search) || matchesSearch(u.email, query.search));
  }
  if (query.role) {
    list = list.filter((u) => u.roles.includes(query.role as string));
  }
  if (query.workspace) {
    list = list.filter((u) => u.workspace === query.workspace);
  }
  if (query.status) {
    list = list.filter((u) => u.status === query.status);
  }
  if (query.organizationId) {
    list = list.filter((u) => u.organizationId === query.organizationId);
  }

  return paginate(list, pageRequest(query));
});

route('GET', '/platform/users/:id', (context) => {
  const user = getAllUsers().find((u) => u.id === context.params.id);
  if (!user) throw notFound('Không tìm thấy tài khoản người dùng.');
  return user;
});

route('PUT', '/platform/users/:id/status', (context) => {
  const { id } = context.params;
  const status = context.body.status as 'ACTIVE' | 'LOCKED';
  const reason = String(context.body.reason ?? '').trim();

  if (!status || !['ACTIVE', 'LOCKED'].includes(status)) {
    throw badRequest('Trạng thái không hợp lệ.');
  }

  const user = getAllUsers().find((u) => u.id === id);
  if (!user) throw notFound('Không tìm thấy tài khoản người dùng.');

  if (status === 'LOCKED') {
    if (!reason) throw badRequest('Cần nhập lý do khóa tài khoản.');
    platformState.userLocks.set(id, reason);
  } else {
    platformState.userLocks.delete(id);
  }

  // Update in DB if present
  updateDb((db) => {
    const dbUser = db.users.find((u) => u.id === id);
    if (dbUser) {
      dbUser.status = status === 'LOCKED' ? 'INACTIVE' : 'ACTIVE';
      dbUser.deactivatedReason = status === 'LOCKED' ? reason : undefined;
    }
  });

  platformState.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorEmail: context.session.email,
    actorName: context.session.fullName,
    action: status === 'LOCKED' ? 'USER_ACCOUNT_LOCKED' : 'USER_ACCOUNT_UNLOCKED',
    targetType: 'User',
    targetName: user.fullName,
    details: status === 'LOCKED' ? `Lý do: ${reason}` : 'Mở khóa tài khoản người dùng',
  });

  return { ...user, status, lockReason: status === 'LOCKED' ? reason : undefined };
}, { message: 'Đã cập nhật trạng thái tài khoản thành công.' });

route('POST', '/platform/users/:id/reset-password-assistance', (context) => {
  const { id } = context.params;
  const user = getAllUsers().find((u) => u.id === id);
  if (!user) throw notFound('Không tìm thấy tài khoản người dùng.');

  const tempPassword = 'Reset@' + Math.floor(100000 + Math.random() * 900000);

  updateDb((db) => {
    const dbUser = db.users.find((u) => u.id === id);
    if (dbUser) {
      dbUser.password = tempPassword;
    }
  });

  platformState.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorEmail: context.session.email,
    actorName: context.session.fullName,
    action: 'USER_PASSWORD_RESET_ASSISTED',
    targetType: 'User',
    targetName: user.fullName,
    details: `Hỗ trợ đặt lại mật khẩu tạm thời cho người dùng ${user.email}`,
  });

  return {
    tempPassword,
    message: `Đã cấp mật khẩu tạm thành công cho ${user.email}: ${tempPassword}`,
  };
}, { message: 'Hỗ trợ đặt lại mật khẩu thành công.' });

// ── PLT-10: Plans & Entitlements ──
route('GET', '/platform/plans', () => {
  const orgs = getAllOrganizations();
  return PLANS.filter((plan) => !plan.free).map((plan) => {
    const override = platformState.planOverrides.get(plan.code);
    const activeCount = plan.audience === 'enterprise'
      ? orgs.filter((o) => o.planCode === plan.code).length
      : 3;
    const yearlyPrice = plan.monthlyPrice ? Math.round(plan.monthlyPrice * 12 * 0.8) : null;

    const res: PlatformPlanDto = {
      code: plan.code,
      name: override?.name ?? plan.name,
      audience: plan.audience,
      monthlyPrice: override?.monthlyPrice ?? plan.monthlyPrice,
      yearlyPrice: override?.yearlyPrice ?? yearlyPrice,
      tagline: override?.tagline ?? plan.tagline,
      highlights: override?.highlights ?? plan.highlights,
      seatRange: plan.seatRange,
      entitlements: plan.entitlements,
      activeCount,
    };
    return res;
  });
});

route('PUT', '/platform/plans/:code', (context) => {
  const { code } = context.params;
  const plan = getPlan(code);
  if (!plan) throw notFound('Không tìm thấy gói dịch vụ.');

  const existing = platformState.planOverrides.get(code) ?? {};
  const updated = { ...existing, ...context.body };
  platformState.planOverrides.set(code, updated);

  platformState.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorEmail: context.session.email,
    actorName: context.session.fullName,
    action: 'PLAN_CONFIG_MODIFIED',
    targetType: 'SubscriptionPlan',
    targetName: plan.name,
    details: `Cập nhật thông số gói ${plan.code}`,
  });

  const yearlyPrice = plan.monthlyPrice ? Math.round(plan.monthlyPrice * 12 * 0.8) : null;

  return {
    code: plan.code,
    name: updated.name ?? plan.name,
    audience: plan.audience,
    monthlyPrice: updated.monthlyPrice ?? plan.monthlyPrice,
    yearlyPrice: updated.yearlyPrice ?? yearlyPrice,
    tagline: updated.tagline ?? plan.tagline,
    highlights: updated.highlights ?? plan.highlights,
    seatRange: plan.seatRange,
    entitlements: plan.entitlements,
    activeCount: 1,
  };
}, { message: 'Đã lưu cấu hình gói dịch vụ.' });

route('GET', '/platform/plans/:code', (context) => {
  const { code } = context.params;
  const plan = getPlan(code);
  if (!plan) throw notFound('Không tìm thấy gói dịch vụ.');

  const orgs = getAllOrganizations();
  const override = platformState.planOverrides.get(code);
  const activeCount = plan.audience === 'enterprise'
    ? orgs.filter((o) => o.planCode === plan.code).length
    : 3;
  const yearlyPrice = plan.monthlyPrice ? Math.round(plan.monthlyPrice * 12 * 0.8) : null;

  return {
    code: plan.code,
    name: override?.name ?? plan.name,
    audience: plan.audience,
    monthlyPrice: override?.monthlyPrice ?? plan.monthlyPrice,
    yearlyPrice: override?.yearlyPrice ?? yearlyPrice,
    tagline: override?.tagline ?? plan.tagline,
    highlights: override?.highlights ?? plan.highlights,
    seatRange: plan.seatRange,
    entitlements: plan.entitlements,
    activeCount,
  };
});

// ── PLT-11: Subscriptions Oversight ──
route('GET', '/platform/subscriptions', (context) => {
  const { query } = context;
  const orgs = getAllOrganizations();
  const list: PlatformSubscriptionDto[] = [];

  // Enterprise subscriptions
  for (const org of orgs) {
    const plan = getPlan(org.planCode) ?? getPlan('ENT_STARTER')!;
    list.push({
      id: `sub-${org.id}`,
      audience: 'enterprise',
      customerName: org.name,
      customerEmail: org.ownerEmail,
      planCode: plan.code,
      planName: plan.name,
      status: org.status === 'SUSPENDED' ? 'cancelled' : 'active',
      seats: org.seatLimit,
      cycle: 'month',
      amount: (plan.monthlyPrice ?? 0) * org.seatLimit,
      renewsAt: new Date(Date.now() + 86400000 * 25).toISOString().slice(0, 10),
      createdAt: org.createdAt,
    });
  }

  // Individual demo subscriptions
  list.push(
    {
      id: 'sub-ind-01',
      audience: 'individual',
      customerName: 'Trần Văn Linh',
      customerEmail: 'linh.tv@example.com',
      planCode: 'IND_PLUS',
      planName: 'Cá nhân Plus',
      status: 'active',
      seats: 1,
      cycle: 'year',
      amount: 2900000,
      renewsAt: new Date(Date.now() + 86400000 * 300).toISOString().slice(0, 10),
      createdAt: new Date(Date.now() - 86400000 * 65).toISOString(),
    },
    {
      id: 'sub-ind-02',
      audience: 'individual',
      customerName: 'Nguyễn Thị Học Viên',
      customerEmail: 'learner@digitalent.ai',
      planCode: 'IND_PLUS',
      planName: 'Cá nhân Plus',
      status: 'active',
      seats: 1,
      cycle: 'month',
      amount: 149000,
      renewsAt: new Date(Date.now() + 86400000 * 18).toISOString().slice(0, 10),
      createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    },
  );

  let filtered = list;
  if (query.search) {
    filtered = filtered.filter(
      (s) => matchesSearch(s.customerName, query.search) || matchesSearch(s.customerEmail, query.search),
    );
  }
  if (query.audience) {
    filtered = filtered.filter((s) => s.audience === query.audience);
  }
  if (query.status) {
    filtered = filtered.filter((s) => s.status === query.status);
  }

  return paginate(filtered, pageRequest(query));
});

// ── PA-19: Subscription Detail & Actions ──
route('GET', '/platform/subscriptions/:id', (context) => {
  const { id } = context.params;
  const orgs = getAllOrganizations();

  // Find if it's enterprise sub (id = `sub-${orgId}`)
  const org = orgs.find((o) => `sub-${o.id}` === id || o.id === id);
  if (org) {
    const plan = getPlan(org.planCode) ?? getPlan('ENT_STARTER')!;
    const isCancelled = platformState.cancelledSubscriptions.has(id) || org.status === 'SUSPENDED';

    const subDetail: PlatformSubscriptionDetailDto = {
      id: `sub-${org.id}`,
      audience: 'enterprise',
      customerName: org.name,
      customerEmail: org.ownerEmail,
      planCode: plan.code,
      planName: plan.name,
      status: isCancelled ? 'cancelled' : 'active',
      seats: org.seatLimit,
      cycle: 'month',
      amount: (plan.monthlyPrice ?? 0) * org.seatLimit,
      renewsAt: new Date(Date.now() + 86400000 * 25).toISOString().slice(0, 10),
      createdAt: org.createdAt,
      paymentHistory: [
        {
          id: `pay-${org.id}-01`,
          date: new Date(Date.now() - 86400000 * 5).toISOString().slice(0, 10),
          amount: (plan.monthlyPrice ?? 0) * org.seatLimit,
          status: 'PAID',
          invoiceUrl: `/invoices/inv-${org.id}-01.pdf`,
          note: 'Thanh toán chu kỳ tháng qua cổng VNPay/MoMo',
        },
        {
          id: `pay-${org.id}-02`,
          date: new Date(Date.now() - 86400000 * 35).toISOString().slice(0, 10),
          amount: (plan.monthlyPrice ?? 0) * org.seatLimit,
          status: 'PAID',
          invoiceUrl: `/invoices/inv-${org.id}-02.pdf`,
          note: 'Thanh toán khởi tạo dịch vụ ban đầu',
        },
      ],
      planChanges: [
        {
          date: new Date(Date.now() - 86400000 * 30).toISOString().slice(0, 10),
          fromPlan: 'ENT_STARTER',
          toPlan: plan.code,
          changedBy: org.ownerEmail,
          reason: 'Nâng cấp quy mô doanh nghiệp theo nhu cầu đào tạo',
        },
      ],
      supportActions: [
        {
          id: `sup-${org.id}-01`,
          timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
          actor: 'platform@digitalent.ai',
          action: 'QUOTA_EXPANSION',
          note: `Đã mở rộng hạn mức từ 5 lên ${org.seatLimit} người dùng`,
        },
      ],
    };
    return subDetail;
  }

  // Check individual demo subscription
  if (id === 'sub-ind-01' || id === 'sub-ind-02') {
    const isCancelled = platformState.cancelledSubscriptions.has(id);
    const subDetail: PlatformSubscriptionDetailDto = {
      id,
      audience: 'individual',
      customerName: id === 'sub-ind-01' ? 'Trần Văn Linh' : 'Nguyễn Thị Học Viên',
      customerEmail: id === 'sub-ind-01' ? 'linh.tv@example.com' : 'learner@digitalent.ai',
      planCode: 'IND_PLUS',
      planName: 'Cá nhân Plus',
      status: isCancelled ? 'cancelled' : 'active',
      seats: 1,
      cycle: id === 'sub-ind-01' ? 'year' : 'month',
      amount: id === 'sub-ind-01' ? 2900000 : 149000,
      renewsAt: new Date(Date.now() + 86400000 * 180).toISOString().slice(0, 10),
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      paymentHistory: [
        {
          id: `pay-${id}-01`,
          date: new Date(Date.now() - 86400000 * 30).toISOString().slice(0, 10),
          amount: id === 'sub-ind-01' ? 2900000 : 149000,
          status: 'PAID',
          note: 'Thanh toán trực tuyến quét mã QR',
        },
      ],
      planChanges: [],
      supportActions: [],
    };
    return subDetail;
  }

  throw notFound('Không tìm thấy thông tin đăng ký subscription.');
});

route('PUT', '/platform/subscriptions/:id/cancel', (context) => {
  const { id } = context.params;
  const reason = String(context.body.reason ?? '').trim();
  if (!reason) throw badRequest('Vui lòng nhập lý do can thiệp hủy gói.');

  platformState.cancelledSubscriptions.set(id, reason);

  platformState.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorEmail: context.session.email,
    actorName: context.session.fullName,
    action: 'SUBSCRIPTION_TERMINATED_BY_PLATFORM',
    targetType: 'Subscription',
    targetName: id,
    details: `Hủy/đình chỉ gói đăng ký: ${reason}`,
  });

  return { id, status: 'cancelled' };
}, { message: 'Đã cập nhật trạng thái hủy gói đăng ký thành công.' });

// ── PLT-04: Framework Management ──
route('GET', '/platform/framework', () => {
  const competencies = COMPETENCIES.map((c) => {
    const customDesc = platformState.competencyDescriptions.get(c.id);
    return customDesc ? { ...c, description: customDesc } : c;
  });
  return { categories: CATEGORIES, competencies };
});

route('PUT', '/platform/framework/:id', (context) => {
  const { id } = context.params;
  const description = String(context.body.description ?? '').trim();
  if (description.length < 5) throw badRequest('Mô tả năng lực cần ít nhất 5 ký tự.');

  platformState.competencyDescriptions.set(id, description);
  const found = COMPETENCIES.find((c) => c.id === id);
  if (!found) throw notFound('Không tìm thấy năng lực.');

  platformState.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorEmail: context.session.email,
    actorName: context.session.fullName,
    action: 'COMPETENCY_UPDATED',
    targetType: 'Competency',
    targetName: found.name,
    details: `Cập nhật mô tả năng lực chuẩn ${found.code}`,
  });

  return { ...found, description };
}, { message: 'Đã cập nhật mô tả năng lực chuẩn.' });

// ── PA-07: Competency Detail & Source-of-Truth ──
route('GET', '/platform/framework/:id', (context) => {
  const { id } = context.params;
  const comp = COMPETENCIES.find((c) => c.id === id || c.code === id || c.frameworkCode === id);
  if (!comp) throw notFound('Không tìm thấy năng lực chuẩn.');

  const domain = CATEGORIES.find((cat) => cat.id === comp.categoryId);
  const customDesc = platformState.competencyDescriptions.get(comp.id);
  const override = platformState.competencyOverrides.get(comp.id);

  const levelsDetail = [
    {
      level: 1,
      levelName: 'Cơ bản',
      subLevels: 'Bậc 1 - Bậc 2',
      behaviorIndicator: 'Thực hiện được với hướng dẫn, trong tình huống quen thuộc và đơn giản.',
      assessmentGuidance: 'Đánh giá qua bài kiểm tra trắc nghiệm tình huống chuẩn đầu ra.',
      evidenceGuidance: 'Hoàn thành bài đánh giá mức độ cơ bản của khóa học.',
    },
    {
      level: 2,
      levelName: 'Trung cấp',
      subLevels: 'Bậc 3 - Bậc 4',
      behaviorIndicator: 'Tự thực hiện độc lập, chọn được cách làm phù hợp cho tình huống thông thường trong công việc.',
      assessmentGuidance: 'Đánh giá qua bài kiểm tra phối hợp tình huống và phân tích dữ liệu.',
      evidenceGuidance: 'Hoàn thành bài kiểm tra và một nhiệm vụ thực hành có sự xác nhận của quản lý.',
    },
    {
      level: 3,
      levelName: 'Nâng cao',
      subLevels: 'Bậc 5 - Bậc 8',
      behaviorIndicator: 'Xử lý được tình huống phức tạp, hướng dẫn người khác và đề xuất cải tiến cho tổ chức.',
      assessmentGuidance: 'Đánh giá qua nhiệm vụ thực tế và sản phẩm công việc thực nghiệm.',
      evidenceGuidance: 'Hoàn thành nhiệm vụ thực tế chuyên sâu và được quản lý/chuyên gia phê duyệt minh chứng.',
    },
  ];

  // Positions requiring this competency
  const refPositions = REFERENCE_POSITIONS.map((pos) => {
    const lvl = referenceLevel(pos.code as ReferencePositionCode, comp.frameworkCode);
    return { code: pos.code, name: pos.name, requiredLevel: lvl };
  }).filter((p) => p.requiredLevel > 0);

  // Standard courses covering this competency
  const stdCourses = COURSES.filter((crs) => crs.categoryId === comp.categoryId).map((crs) => ({
    id: crs.id,
    code: crs.code,
    title: crs.title,
    level: crs.level,
  }));

  const res: PlatformCompetencyDetailDto = {
    ...comp,
    name: override?.name ?? comp.name,
    description: override?.description ?? customDesc ?? comp.description,
    domainName: domain?.name ?? 'Miền năng lực',
    levelsDetail,
    referencePositions: refPositions,
    standardCourses: stdCourses,
  };

  return res;
});

route('PUT', '/platform/framework/:id/source-of-truth', (context) => {
  const { id } = context.params;
  const comp = COMPETENCIES.find((c) => c.id === id || c.code === id || c.frameworkCode === id);
  if (!comp) throw notFound('Không tìm thấy năng lực chuẩn.');

  const body = context.body as Partial<CatalogCompetency>;
  const existing = platformState.competencyOverrides.get(comp.id) ?? {};
  const updated = { ...existing, ...body };
  platformState.competencyOverrides.set(comp.id, updated);

  if (body.description) {
    platformState.competencyDescriptions.set(comp.id, body.description);
  }

  platformState.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorEmail: context.session.email,
    actorName: context.session.fullName,
    action: 'COMPETENCY_SOURCE_OF_TRUTH_MODIFIED',
    targetType: 'Competency',
    targetName: comp.name,
    details: `Sửa đổi định nghĩa chuẩn source-of-truth cho năng lực ${comp.code}`,
  });

  return { ...comp, ...updated };
}, { message: 'Đã cập nhật dữ liệu gốc năng lực chuẩn (Source-of-truth).' });

// ── PLT-05, 06, 06E: Curriculum & Standard Courses ──
route('GET', '/platform/curriculum', () => {
  return { categories: CATEGORIES, competencies: COMPETENCIES };
});

function enrichCourse(course: CatalogCourse): PlatformStandardCourseDto {
  const override = platformState.courseOverrides.get(course.id);
  const domain = CATEGORIES.find((c) => c.id === course.categoryId);

  const modulesList: PlatformCurriculumModule[] = Array.from({ length: course.modules }, (_, i) => ({
    id: `mod-${course.id}-${i + 1}`,
    title: `Chương ${i + 1}: Kiến thức trọng tâm phần ${i + 1}`,
    estimatedMinutes: Math.round(course.estimatedDurationMinutes / course.modules),
    lessons: [
      { id: `les-${course.id}-${i + 1}-1`, title: `Bài ${i + 1}.1: Tổng quan và nguyên lý ứng dụng`, type: 'video', durationMinutes: 20 },
      { id: `les-${course.id}-${i + 1}-2`, title: `Bài ${i + 1}.2: Hướng dẫn thực hành theo kịch bản`, type: 'reading', durationMinutes: 25 },
      { id: `les-${course.id}-${i + 1}-3`, title: `Bài ${i + 1}.3: Bài kiểm tra củng cố kiến thức`, type: 'quiz', durationMinutes: 15 },
    ],
  }));

  return {
    ...course,
    title: override?.title ?? course.title,
    description: override?.description ?? `Khóa đào tạo chuẩn theo Khung chuẩn năng lực số miền ${domain?.name}.`,
    targetAudience: override?.targetAudience ?? 'Nhân sự các phòng ban và quản lý doanh nghiệp.',
    learningOutcomes: override?.learningOutcomes ?? [
      'Hiểu rõ các nguyên tắc và chỉ số hành vi theo Khung chuẩn năng lực số.',
      'Áp dụng thành thạo vào quy trình làm việc hằng ngày.',
      'Sẵn sàng cho bài đánh giá năng lực số cấp độ tương ứng.',
    ],
    modulesList: override?.modulesList ?? modulesList,
  };
}

route('GET', '/platform/courses', () => {
  return COURSES.map(enrichCourse);
});

route('GET', '/platform/courses/:id', (context) => {
  const course = COURSES.find((c) => c.id === context.params.id);
  if (!course) throw notFound('Không tìm thấy khóa học chuẩn.');
  return enrichCourse(course);
});

route('PUT', '/platform/courses/:id', (context) => {
  const { id } = context.params;
  const course = COURSES.find((c) => c.id === id);
  if (!course) throw notFound('Không tìm thấy khóa học chuẩn.');

  const existing = platformState.courseOverrides.get(id) ?? {};
  const updated = { ...existing, ...context.body };
  platformState.courseOverrides.set(id, updated);

  platformState.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorEmail: context.session.email,
    actorName: context.session.fullName,
    action: 'COURSE_UPDATED',
    targetType: 'StandardCourse',
    targetName: course.title,
    details: `Biên tập nội dung khóa học chuẩn ${course.code}`,
  });

  return enrichCourse({ ...course, title: updated.title ?? course.title });
}, { message: 'Đã lưu chỉnh sửa khóa học chuẩn.' });

// ── PLT-07: Assessment Bank ──
const QUESTIONS_BANK: PlatformAssessmentQuestionDto[] = COMPETENCIES.flatMap((comp) => {
  const domain = CATEGORIES.find((c) => c.id === comp.categoryId);
  return [1, 2, 3].map((lvl): PlatformAssessmentQuestionDto => ({
    id: `ques-${comp.frameworkCode.replace('.', '-')}-L${lvl}`,
    code: `Q-${comp.frameworkCode}-L${lvl}`,
    competencyCode: comp.code,
    competencyName: comp.name,
    domainName: domain?.name ?? 'Miền năng lực',
    level: lvl,
    type: lvl === 3 ? 'PRACTICAL_RUBRIC' : 'MCQ',
    questionText: `Tình huống đánh giá năng lực ${comp.code} (${comp.name}) ở cấp độ ${levelLabel(lvl)}: Trong trường hợp doanh nghiệp cần áp dụng quy trình số vào thực tế, phương án nào là chuẩn mực?`,
    options: lvl === 3 ? undefined : [
      { id: 'opt-1', text: 'Tuân thủ đúng quy trình an toàn, kiểm chứng dữ liệu trước khi công bố', isCorrect: true },
      { id: 'opt-2', text: 'Thực hiện nhanh nhất có thể bỏ qua bước sao lưu kiểm thử', isCorrect: false },
      { id: 'opt-3', text: 'Chia sẻ mật khẩu nội bộ cho đối tác bên ngoài để tiện trao đổi', isCorrect: false },
      { id: 'opt-4', text: 'Không lưu trữ lịch sử thao tác để tiết kiệm bộ nhớ', isCorrect: false },
    ],
    rubricGuide: lvl === 3 ? 'Tiêu chí đánh giá nhiệm vụ thực hành: 1) Tính đầy đủ; 2) Tuân thủ an toàn thông tin; 3) Khả năng nhân rộng và tài liệu hóa giải pháp.' : undefined,
  }));
});

route('GET', '/platform/assessment-bank', (context) => {
  const { query } = context;
  let list = QUESTIONS_BANK;

  if (query.search) {
    list = list.filter((q) => matchesSearch(q.questionText, query.search) || matchesSearch(q.competencyName, query.search) || matchesSearch(q.code, query.search));
  }
  if (query.domainId) {
    list = list.filter((q) => q.domainName.includes(String(query.domainId)));
  }
  if (query.type) {
    list = list.filter((q) => q.type === query.type);
  }
  if (query.level) {
    list = list.filter((q) => q.level === Number(query.level));
  }

  return paginate(list, pageRequest(query));
});

// ── PA-12: Question Detail & Editor ──
route('GET', '/platform/questions/:id', (context) => {
  const { id } = context.params;
  const custom = platformState.customQuestions.get(id);
  if (custom) return custom;

  const found = QUESTIONS_BANK.find((q) => q.id === id);
  if (!found) throw notFound('Không tìm thấy câu hỏi trong ngân hàng đề.');
  return found;
});

route('POST', '/platform/questions', (context) => {
  const body = context.body as Partial<PlatformAssessmentQuestionDto>;
  if (!body.questionText || !body.competencyCode) {
    throw badRequest('Nội dung câu hỏi và mã năng lực là bắt buộc.');
  }

  const id = body.id || `ques-custom-${Date.now()}`;
  const comp = COMPETENCIES.find((c) => c.code === body.competencyCode || c.frameworkCode === body.competencyCode);
  const domain = comp ? CATEGORIES.find((cat) => cat.id === comp.categoryId) : undefined;

  const question: PlatformAssessmentQuestionDto = {
    id,
    code: body.code || `Q-CUSTOM-${Math.floor(1000 + Math.random() * 9000)}`,
    competencyCode: comp?.code ?? body.competencyCode,
    competencyName: comp?.name ?? (body.competencyName || 'Năng lực chuẩn'),
    domainName: domain?.name ?? (body.domainName || 'Miền số'),
    level: body.level ?? 1,
    type: body.type ?? 'MCQ',
    questionText: body.questionText,
    options: body.options ?? [
      { id: 'opt-1', text: 'Phương án đúng tiêu chuẩn', isCorrect: true },
      { id: 'opt-2', text: 'Phương án sai 1', isCorrect: false },
      { id: 'opt-3', text: 'Phương án sai 2', isCorrect: false },
      { id: 'opt-4', text: 'Phương án sai 3', isCorrect: false },
    ],
    rubricGuide: body.rubricGuide,
  };

  platformState.customQuestions.set(id, question);

  platformState.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorEmail: context.session.email,
    actorName: context.session.fullName,
    action: body.id ? 'QUESTION_UPDATED' : 'QUESTION_CREATED',
    targetType: 'AssessmentQuestion',
    targetName: question.code,
    details: `Biên soạn câu hỏi đánh giá cho năng lực ${question.competencyCode}`,
  });

  return question;
}, { message: 'Đã lưu câu hỏi đánh giá thành công.' });

// ── PA-13: Assessment Templates ──
route('GET', '/platform/assessment-templates', (context) => {
  const { query } = context;
  let list = platformState.assessmentTemplates;

  if (query.search) {
    list = list.filter((t) => matchesSearch(t.title, query.search) || matchesSearch(t.code, query.search));
  }
  if (query.status) {
    list = list.filter((t) => t.status === query.status);
  }

  return paginate(list, pageRequest(query));
});

route('GET', '/platform/assessment-templates/:id', (context) => {
  const found = platformState.assessmentTemplates.find((t) => t.id === context.params.id);
  if (!found) throw notFound('Không tìm thấy mẫu đề đánh giá.');
  return found;
});

route('PUT', '/platform/assessment-templates/:id', (context) => {
  const { id } = context.params;
  const idx = platformState.assessmentTemplates.findIndex((t) => t.id === id);
  if (idx < 0) throw notFound('Không tìm thấy mẫu đề đánh giá.');

  const body = context.body as Partial<PlatformAssessmentTemplateDto>;
  const updated: PlatformAssessmentTemplateDto = {
    ...platformState.assessmentTemplates[idx],
    ...body,
    updatedAt: new Date().toISOString(),
  };

  platformState.assessmentTemplates[idx] = updated;

  platformState.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorEmail: context.session.email,
    actorName: context.session.fullName,
    action: 'ASSESSMENT_TEMPLATE_UPDATED',
    targetType: 'AssessmentTemplate',
    targetName: updated.title,
    details: `Cập nhật cấu hình đề đánh giá ${updated.code}`,
  });

  return updated;
}, { message: 'Đã cập nhật mẫu đề đánh giá.' });

// ── PLT-08, 09: Reference Positions ──
function getReferencePositionDetail(pos: ReferencePosition): PlatformReferencePositionDto {
  const posCode = pos.code as ReferencePositionCode;
  const customMap = platformState.positionRequirements.get(pos.code);

  const requiredCompetencies = COMPETENCIES.map((comp) => {
    const domain = CATEGORIES.find((c) => c.id === comp.categoryId);
    const standardLvl = referenceLevel(posCode, comp.frameworkCode);
    const lvl = customMap?.get(comp.frameworkCode) ?? standardLvl;

    return {
      frameworkCode: comp.frameworkCode,
      competencyName: comp.name,
      level: lvl,
      levelLabel: levelLabel(lvl),
      domainName: domain?.name ?? '',
    };
  }).filter((r) => r.level > 0);

  return {
    code: pos.code,
    name: pos.name,
    description: pos.description,
    requiredCompetencies,
  };
}

route('GET', '/platform/positions', () => {
  return REFERENCE_POSITIONS.map(getReferencePositionDetail);
});

route('GET', '/platform/positions/:code', (context) => {
  const found = REFERENCE_POSITIONS.find((p) => p.code.toUpperCase() === context.params.code.toUpperCase());
  if (!found) throw notFound('Không tìm thấy vị trí tham chiếu.');
  return getReferencePositionDetail(found);
});

route('PUT', '/platform/positions/:code/requirements', (context) => {
  const { code } = context.params;
  const found = REFERENCE_POSITIONS.find((p) => p.code.toUpperCase() === code.toUpperCase());
  if (!found) throw notFound('Không tìm thấy vị trí tham chiếu.');

  const reqs = context.body.requirements as Array<{ frameworkCode: string; level: number }>;
  if (!Array.isArray(reqs)) throw badRequest('Dữ liệu yêu cầu năng lực không hợp lệ.');

  const map = new Map<string, number>();
  for (const r of reqs) {
    map.set(r.frameworkCode, Number(r.level) || 0);
  }
  platformState.positionRequirements.set(found.code, map);

  platformState.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorEmail: context.session.email,
    actorName: context.session.fullName,
    action: 'REFERENCE_POSITION_REQUIREMENTS_UPDATED',
    targetType: 'ReferencePosition',
    targetName: found.name,
    details: `Cập nhật ma trận năng lực chuẩn vị trí ${found.code}`,
  });

  return getReferencePositionDetail(found);
}, { message: 'Đã cập nhật yêu cầu năng lực vị trí tham chiếu.' });

// ── PLT-12: Audit Log ──
route('GET', '/platform/audit-log', (context) => {
  const { query } = context;
  let list = platformState.auditLogs;

  if (query.search) {
    list = list.filter((a) => matchesSearch(a.details, query.search) || matchesSearch(a.targetName, query.search) || matchesSearch(a.actorEmail, query.search));
  }
  if (query.action) {
    list = list.filter((a) => a.action === query.action);
  }

  return paginate(list, pageRequest(query));
});

// ── PLT-13: System Settings ──
route('GET', '/platform/settings', () => {
  return platformState.settings;
});

route('PUT', '/platform/settings', (context) => {
  const body = context.body as Partial<PlatformSettingsDto>;
  platformState.settings = { ...platformState.settings, ...body };

  platformState.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorEmail: context.session.email,
    actorName: context.session.fullName,
    action: 'SYSTEM_SETTINGS_UPDATED',
    targetType: 'SystemConfig',
    targetName: 'Cấu hình nền tảng',
    details: 'Thay đổi tham số cấu hình hệ thống',
  });

  return platformState.settings;
}, { message: 'Đã lưu cấu hình hệ thống.' });

// ── SHR-01 & SHR-02: Shared Account Profile & Security ──
route('GET', '/account/profile', (context) => {
  const { session } = context;
  const profile: UserProfileDto = {
    id: session.id,
    fullName: session.fullName,
    email: session.email,
    phone: '0912345678',
    jobTitle: session.roles.includes('PLATFORM_ADMIN') ? 'Quản trị viên Hệ thống' : 'Chuyên viên',
    roleTitle: session.roles[0],
  };
  return profile;
}, { permission: PERMISSIONS.ACCOUNT_VIEW_OWN });

route('PUT', '/account/profile', (context) => {
  const { session, body } = context;
  const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : session.fullName;
  const phone = typeof body.phone === 'string' ? body.phone.trim() : undefined;
  const jobTitle = typeof body.jobTitle === 'string' ? body.jobTitle.trim() : undefined;

  // Persist into mock DB if user is registered
  updateDb((db) => {
    const user = db.users.find((u) => u.id === session.id);
    if (user) {
      user.fullName = fullName;
      if (phone !== undefined) user.phone = phone;
      if (jobTitle !== undefined) user.jobTitle = jobTitle;
    }
  });

  return {
    id: session.id,
    fullName,
    email: session.email,
    phone,
    jobTitle,
    roleTitle: session.roles[0],
  };
}, { permission: PERMISSIONS.ACCOUNT_UPDATE_OWN_PROFILE, message: 'Đã cập nhật thông tin cá nhân.' });

route('POST', '/account/change-password', (context) => {
  const { body } = context;
  const currentPassword = String(body.currentPassword ?? '');
  const newPassword = String(body.newPassword ?? '');

  if (!currentPassword) {
    throw badRequest('Vui lòng nhập mật khẩu hiện tại.');
  }

  if (newPassword.length < 8) {
    throw badRequest('Mật khẩu mới cần ít nhất 8 ký tự.');
  }

  // Update in DB if applicable
  updateDb((db) => {
    const user = db.users.find((u) => u.id === context.session.id);
    if (user) user.password = newPassword;
  });

  return null;
}, { permission: PERMISSIONS.ACCOUNT_CHANGE_OWN_PASSWORD, message: 'Đổi mật khẩu thành công.' });

route('GET', '/account/login-history', () => {
  const history: LoginHistoryEntry[] = [
    {
      id: 'log-1',
      timestamp: new Date().toISOString(),
      ip: '113.190.234.12',
      browser: 'Chrome 128 (Windows 11)',
      os: 'Windows 11',
      status: 'SUCCESS',
    },
    {
      id: 'log-2',
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      ip: '113.190.234.12',
      browser: 'Chrome 128 (Windows 11)',
      os: 'Windows 11',
      status: 'SUCCESS',
    },
    {
      id: 'log-3',
      timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
      ip: '14.161.45.89',
      browser: 'Edge 127 (Windows 11)',
      os: 'Windows 11',
      status: 'SUCCESS',
    },
  ];
  return history;
}, { permission: PERMISSIONS.ACCOUNT_VIEW_OWN });

// ── SHR-03: Shared Notifications ──
route('GET', '/notifications', (context) => {
  const { query } = context;
  let list = platformState.notifications;
  if (query.unreadOnly === 'true') {
    list = list.filter((n) => !n.isRead);
  }
  return list;
}, { permission: PERMISSIONS.NOTIFICATION_READ_OWN });

route('PUT', '/notifications/:id/read', (context) => {
  const { id } = context.params;
  const found = platformState.notifications.find((n) => n.id === id);
  if (found) found.isRead = true;
  return null;
}, { permission: PERMISSIONS.NOTIFICATION_MARK_READ });

route('PUT', '/notifications/read-all', () => {
  platformState.notifications.forEach((n) => { n.isRead = true; });
  return null;
}, { permission: PERMISSIONS.NOTIFICATION_MARK_READ });
