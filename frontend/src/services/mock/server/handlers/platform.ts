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
import type {
  CatalogVersionSummary,
  CatalogCourseRow,
  CatalogCourseDetail,
  CatalogModule,
  CatalogBlock,
  CatalogQuestion,
  CatalogSalesStatus,
  CatalogVersionStatus,
  ChangeKind,
  BlockType,
  PublishCheck,
  CourseInfoInput,
  QuestionInput,
  BlockInput,
} from '../../../platform-catalog.service';

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
      targetName: 'DigiTalent AI',
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
      title: 'Kiến trúc năng lực đã công bố',
      message: 'Phạm vi doanh nghiệp, phòng ban và vị trí đã được xác nhận.',
      type: 'info',
      createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
      isRead: false,
    },
    {
      id: 'notif-2',
      title: 'Nhân viên đã được phân bổ vị trí',
      message: 'Nhân viên Kế toán và Marketing đã nhận mục tiêu theo vị trí.',
      type: 'success',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      isRead: false,
    },
    {
      id: 'notif-3',
      title: 'Hoàn thành bài đánh giá đầu vào',
      message: 'Năng lực hiện tại đã được đo lường trên sáu miền năng lực.',
      type: 'info',
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      isRead: false,
    },
    {
      id: 'notif-4',
      title: 'Khóa học Cơ bản đã bắt đầu',
      message: 'Dữ liệu & thông tin · Cơ bản đã mở cho nhân viên.',
      type: 'success',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      isRead: true,
    },
  ] as NotificationDto[],
};

function getAllOrganizations(): PlatformOrganizationDto[] {
  const db = getDb();
  const orgs: PlatformOrganizationDto[] = [];

  // Seed demo org: DigiTalent AI
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

// ── PLT-01: Dashboard & Overview ──
route('GET', '/platform/overview', () => {
  const orgs = getAllOrganizations();
  const db = getDb();
  const suspendedOrgs = orgs.filter((o) => o.status === 'SUSPENDED');
  const trialOrgs = orgs.filter((o) => o.planCode === 'ENT_STARTER' || o.planCode === 'TRIAL');
  const paidOrgs = orgs.filter((o) => o.status === 'ACTIVE' && o.planCode !== 'ENT_STARTER' && o.planCode !== 'TRIAL');
  const totalUsers = 15 + db.users.length;
  const totalLearners = 12 + db.users.filter((u) => u.roles.includes('EMPLOYEE')).length;

  return {
    organizationCount: orgs.length,
    trialOrganizationCount: trialOrgs.length,
    paidOrganizationCount: paidOrgs.length,
    suspendedOrganizationCount: suspendedOrgs.length,
    conversionRate: orgs.length ? Math.round((paidOrgs.length / orgs.length) * 100) : 0,
    userCount: totalUsers,
    employeeCount: totalLearners,
    recentUsers7d: 3,
    recentEmployees7d: 2,
    lockedUserCount: platformState.userLocks.size,
    trialUserCount: 8,
    trialEndingSoonCount: 2,
    frameworkCount: 1,
    draftFrameworkCount: 0,
    frameworkHasDraft: false,
    domainCount: 6,
    currentVersionNo: 1,
    currentVersionPublishedAt: '2026-10-01T00:00:00Z',
    draftVersionNo: null,
    draftNewCourseCount: 0,
    draftEditedCourseCount: 0,
    courseCount: 18,
    pausedCourseCount: 0,
    questionCount: 72,
    seatsPurchased: 250,
    seatsGranted: 50,
    revenue: 125000000,
    recentOrganizations: orgs.slice(0, 5).map((o) => ({
      id: o.id,
      code: o.id.slice(0, 8).toUpperCase(),
      name: o.name,
      status: o.status as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
      stage: (o.planCode === 'ENT_STARTER' ? 'TRIAL' : 'PAID') as 'TRIAL' | 'PAID',
      ownerName: o.ownerName,
      ownerEmail: o.ownerEmail,
      seatLimit: o.seatLimit || 20,
      seatsPurchased: o.seatLimit || 20,
      seatsGranted: 0,
      seatsInUse: o.seatsUsed || 5,
      activeLearners: o.membersCount || 5,
      activeCourses: 6,
      createdAt: o.createdAt,
    })),
    recentActivity: platformState.auditLogs.slice(0, 5).map((a) => ({
      id: a.id,
      action: a.action,
      actionLabel: a.action,
      scope: 'PLATFORM' as const,
      entityType: a.targetType,
      entityId: null,
      entityLabel: a.targetName,
      organizationId: null,
      organizationName: null,
      actorEmail: a.actorEmail,
      oldValues: null,
      newValues: a.details,
      createdAt: a.timestamp,
    })),
  };
});

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

  return {
    organization: org,
    departments: [
      { id: 'dept-1', name: 'Công nghệ thông tin', managerName: 'Nguyễn Văn Quản', employeeCount: 4 },
      { id: 'dept-2', name: 'Kinh doanh & Tiếp thị', managerName: 'Trần Thị Trưởng', employeeCount: 3 },
      { id: 'dept-3', name: 'Tài chính - Kế toán', managerName: 'Lê Văn Tài', employeeCount: 2 },
    ],
    people: [
      { userId: 'usr-1', fullName: org.ownerName || 'Chủ doanh nghiệp', email: org.ownerEmail, role: 'OWNER', departmentName: 'Ban Giám đốc', positionName: 'Giám đốc', status: 'ACTIVE' },
      { userId: 'usr-2', fullName: 'Bùi Minh Khang', email: 'khang.bm@doanhnghiep.vn', role: 'MEMBER', departmentName: 'Kinh doanh & Tiếp thị', positionName: 'Chuyên viên CRM', status: 'ACTIVE' },
      { userId: 'usr-3', fullName: 'Đặng Quốc Huy', email: 'huy.dq@doanhnghiep.vn', role: 'MEMBER', departmentName: 'Tài chính - Kế toán', positionName: 'Kế toán tổng hợp', status: 'ACTIVE' },
    ],
    seats: [
      { courseCode: 'DGT-BAS-01', courseTitle: 'Chiến lược tìm kiếm và quản lý thông tin số', seatsPurchased: org.seatLimit || 10, seatsGranted: 0 },
    ],
    orders: [
      {
        id: `ord-${org.id.slice(0, 6)}`,
        organizationId: org.id,
        organizationName: org.name,
        courseCode: 'DGT-BAS-01',
        courseTitle: 'Chiến lược tìm kiếm và quản lý thông tin số',
        seats: org.seatLimit || 10,
        kind: 'PURCHASE',
        unitPrice: 399000,
        totalAmount: (org.seatLimit || 10) * 399000,
        reason: `[Hợp đồng điện tử: DT-ESIGN-${org.id.replace(/-/g, '').slice(0, 8).toUpperCase()}] Đại diện: ${org.ownerName || 'Chủ tài khoản'}`,
        createdByEmail: org.ownerEmail,
        createdAt: org.createdAt,
      },
    ],
    coursesInUse: [
      { courseCode: 'DGT-BAS-01', courseTitle: 'Chiến lược tìm kiếm và quản lý thông tin số', level: 1, levelName: 'Cơ bản', participants: Math.min(org.membersCount || 3, 10), completed: 2 },
    ],
  };
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
    id: 'usr-mtr-01',
    email: 'mentor@digitalent.ai',
    fullName: 'Hoàng Minh Mentor',
    phone: '0908889999',
    jobTitle: 'Chuyên gia Đánh giá Năng lực',
    roles: ['MENTOR'],
    workspace: 'mentor',
    status: 'ACTIVE',
    emailVerified: true,
    createdAt: new Date(Date.now() - 86400000 * 80).toISOString(),
    lastLoginAt: new Date(Date.now() - 3600000 * 3).toISOString(),
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
    organizationName: 'DigiTalent AI',
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
    organizationName: 'DigiTalent AI',
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
    organizationName: 'DigiTalent AI',
    status: 'ACTIVE',
    emailVerified: true,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    lastLoginAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'usr-emp-02',
    email: 'dev.emp@digitalent.ai',
    fullName: 'Vũ Thị Nhân Sự',
    phone: '0967890123',
    jobTitle: 'Kỹ sư phần mềm',
    roles: ['EMPLOYEE'],
    workspace: 'enterprise',
    organizationId: ACME_ORGANIZATION_ID,
    organizationName: 'DigiTalent AI',
    status: 'ACTIVE',
    emailVerified: true,
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    lastLoginAt: new Date(Date.now() - 86400000 * 1).toISOString(),
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
];

function computeTaskSummary(role: string): string {
  switch (role) {
    case 'EMPLOYEE':
      return '2 khóa học · 1 hoàn thành';
    case 'MENTOR':
      return 'Thẩm định bài thi · 4 bài chờ chấm';
    case 'OWNER':
      return 'Quản trị toàn tổ chức';
    case 'MANAGER':
      return 'Quản lý phòng ban · 12 nhân sự';
    case 'PLATFORM_ADMIN':
      return 'Quản trị nền tảng · Toàn hệ thống';
    default:
      return 'Đang tham gia hệ thống';
  }
}

function getAllUsers(): PlatformUserDto[] {
  const db = getDb();
  const orgs = getAllOrganizations();
  const list: PlatformUserDto[] = [];

  for (const u of DEMO_PLATFORM_USERS) {
    const isLocked = platformState.userLocks.has(u.id);
    const primary = (u.roles[0] || 'EMPLOYEE').toUpperCase();
    list.push({
      ...u,
      displayName: u.fullName || u.email,
      role: primary,
      planCode: null,
      trialState: null,
      trialEndsAt: null,
      status: isLocked ? 'LOCKED' : u.status,
      lockReason: platformState.userLocks.get(u.id),
      taskSummary: computeTaskSummary(primary),
    });
  }

  for (const u of db.users) {
    if (list.some((existing) => existing.id === u.id || existing.email === u.email)) continue;
    const isLocked = platformState.userLocks.has(u.id) || u.status === 'INACTIVE';
    const org = orgs.find((o) => o.id === u.organizationId);
    const primary = (u.roles && u.roles.length > 0 ? u.roles[0] : (u.workspace === 'mentor' ? 'MENTOR' : u.workspace === 'platform' ? 'PLATFORM_ADMIN' : 'EMPLOYEE')).toUpperCase();
    list.push({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      displayName: u.fullName || u.email,
      role: primary,
      phone: u.phone,
      jobTitle: u.jobTitle,
      roles: u.roles && u.roles.length ? u.roles : [primary],
      workspace: (u.workspace as 'enterprise' | 'personal' | 'platform' | 'mentor') || 'enterprise',
      organizationId: u.organizationId,
      organizationName: org?.name,
      planCode: null,
      trialState: null,
      trialEndsAt: null,
      status: isLocked ? 'LOCKED' : 'ACTIVE',
      lockReason: platformState.userLocks.get(u.id) ?? u.deactivatedReason,
      emailVerified: u.emailVerified,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      lastLoginAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      taskSummary: computeTaskSummary(primary),
    });
  }

  return list;
}

route('GET', '/platform/users', (context) => {
  const { query } = context;
  const allUsersList = getAllUsers();

  const stats = {
    total: allUsersList.length,
    owners: allUsersList.filter((u) => (u.role || u.roles[0]) === 'OWNER').length,
    managers: allUsersList.filter((u) => (u.role || u.roles[0]) === 'MANAGER').length,
    employees: allUsersList.filter((u) => (u.role || u.roles[0]) === 'EMPLOYEE').length,
    mentors: allUsersList.filter((u) => (u.role || u.roles[0]) === 'MENTOR').length,
    admins: allUsersList.filter((u) => (u.role || u.roles[0]) === 'PLATFORM_ADMIN').length,
    locked: allUsersList.filter((u) => u.status === 'LOCKED').length,
    active: allUsersList.filter((u) => u.status === 'ACTIVE').length,
  };

  let list = allUsersList;

  const allPersonalTrials = list.filter((u) => u.planCode && u.trialState);
  const activeCount = allPersonalTrials.filter((u) => u.trialState === 'ACTIVE').length;
  const endingSoonCount = allPersonalTrials.filter((u) => {
    if (u.trialState !== 'ACTIVE' || !u.trialEndsAt) return false;
    const leftMs = Date.parse(u.trialEndsAt) - Date.now();
    return leftMs > 0 && leftMs <= 48 * 3600 * 1000;
  }).length;
  const endedCount = allPersonalTrials.filter((u) => u.trialState === 'ENDED').length;

  if (query.search) {
    list = list.filter((u) => matchesSearch(u.fullName || '', query.search) || matchesSearch(u.displayName || '', query.search) || matchesSearch(u.email || '', query.search));
  }
  if (query.role) {
    list = list.filter((u) => (u.role || u.roles?.[0]) === query.role || u.roles?.includes(query.role as string));
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

  const result = paginate(list, pageRequest(query));
  return {
    ...result,
    stats,
    trials: {
      active: activeCount,
      endingSoon: endingSoonCount,
      ended: endedCount,
    },
  };
});

route('GET', '/platform/users/:id', (context) => {
  const user = getAllUsers().find((u) => u.id === context.params.id);
  if (!user) throw notFound('Không tìm thấy tài khoản người dùng.');
  return {
    user,
    organizationStatus: 'ACTIVE' as const,
    enrolledCourses: [
      {
        courseCode: 'DGT-BAS-01',
        courseTitle: 'Chiến lược tìm kiếm và quản lý thông tin số',
        level: 1,
        levelName: 'Cơ bản',
        progress: 100,
        completedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        score: 8.5,
        status: 'COMPLETED',
      },
      {
        courseCode: 'DGT-INT-02',
        courseTitle: 'Tư duy phản biện và giải quyết vấn đề số',
        level: 2,
        levelName: 'Trung cấp',
        progress: 65,
        completedAt: null,
        score: null,
        status: 'IN_PROGRESS',
      },
    ],
  };
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
route('GET', '/platform/frameworks', () => {
  return {
    items: [
      {
        id: 'fw-tt02',
        code: 'TT02_2025',
        name: 'Khung năng lực số quốc gia (Thông tư 02/2025/TT-BGDĐT)',
        description: 'Bộ 24 năng lực số cốt lõi chuẩn hóa cho mọi cơ quan, tổ chức và doanh nghiệp.',
        status: 'PUBLISHED' as const,
        currentVersionNo: 1,
        domainCount: 6,
        courseCount: 18,
        coursesByLevel: [6, 6, 6],
        draftCourseCount: null,
        hasDraft: false,
      },
    ],
  };
});

route('GET', '/platform/frameworks/:id', () => {
  return {
    id: 'fw-tt02',
    code: 'TT02_2025',
    name: 'Khung năng lực số quốc gia (Thông tư 02/2025/TT-BGDĐT)',
    description: 'Bộ 24 năng lực số cốt lõi chuẩn hóa cho mọi cơ quan, tổ chức và doanh nghiệp.',
    status: 'PUBLISHED' as const,
    currentVersionNo: 1,
    domainCount: 6,
    courseCount: 18,
    coursesByLevel: [6, 6, 6],
    draftCourseCount: null,
    hasDraft: false,
    currentCatalogVersionNo: 1,
    draftCatalogVersionNo: null,
    domains: CATEGORIES.map((cat, idx) => ({
      id: cat.id,
      code: cat.code,
      name: cat.name,
      sortOrder: cat.sortOrder,
      publishedDescription: `Miền ${idx + 1}: ${cat.name} theo chuẩn Thông tư 02.`,
      draftDescription: '',
      hasDraft: false,
      courses: COURSES.filter((c) => c.categoryId === cat.id && c.status === 'PUBLISHED').map((c) => ({
        courseId: c.id,
        code: c.code,
        title: c.title,
        level: c.level,
        levelName: levelLabel(c.level),
      })),
      draftNewCourses: [],
    })),
    releases: [
      {
        versionNo: 1,
        releaseNote: 'Công bố chuẩn phiên bản neo ban đầu.',
        publishedByEmail: 'admin@digitalent.ai',
        publishedAt: '2026-10-01T00:00:00Z',
      },
    ],
  };
});

route('PUT', '/platform/frameworks/:id/draft', (context) => {
  const { id } = context.params;
  return {
    id,
    code: 'TT02_2025',
    name: 'Khung chuẩn năng lực số doanh nghiệp',
    description: 'Bộ 24 năng lực số cốt lõi chuẩn hóa cho doanh nghiệp.',
    status: 'PUBLISHED' as const,
    currentVersionNo: catalogStore.currentVersionNo,
    domainCount: 6,
    courseCount: 18,
    coursesByLevel: [6, 6, 6],
    draftCourseCount: null,
    hasDraft: false,
    currentCatalogVersionNo: catalogStore.currentVersionNo,
    draftCatalogVersionNo: catalogStore.draftVersionNo,
    domains: CATEGORIES.map((cat, idx) => ({
      id: cat.id,
      code: cat.code,
      name: cat.name,
      sortOrder: cat.sortOrder,
      publishedDescription: `Lĩnh vực ${idx + 1}: ${cat.name}.`,
      draftDescription: '',
      hasDraft: false,
      courses: COURSES.filter((c) => c.categoryId === cat.id && c.status === 'PUBLISHED').map((c) => ({
        courseId: c.id,
        code: c.code,
        title: c.title,
        level: c.level,
        levelName: levelLabel(c.level),
      })),
      draftNewCourses: [],
    })),
    releases: [
      {
        versionNo: 1,
        releaseNote: 'Công bố chuẩn ban đầu.',
        publishedByEmail: 'admin@digitalent.ai',
        publishedAt: '2026-10-01T00:00:00Z',
      },
    ],
  };
}, { message: 'Đã lưu bản nháp khung năng lực.' });

route('POST', '/platform/frameworks/:id/publish', (context) => {
  const { id } = context.params;
  return {
    id,
    code: 'TT02_2025',
    name: 'Khung chuẩn năng lực số doanh nghiệp',
    description: 'Bộ 24 năng lực số cốt lõi chuẩn hóa cho doanh nghiệp.',
    status: 'PUBLISHED' as const,
    currentVersionNo: catalogStore.currentVersionNo,
    domainCount: 6,
    courseCount: 18,
    coursesByLevel: [6, 6, 6],
    draftCourseCount: null,
    hasDraft: false,
    currentCatalogVersionNo: catalogStore.currentVersionNo,
    draftCatalogVersionNo: catalogStore.draftVersionNo,
    domains: CATEGORIES.map((cat, idx) => ({
      id: cat.id,
      code: cat.code,
      name: cat.name,
      sortOrder: cat.sortOrder,
      publishedDescription: `Lĩnh vực ${idx + 1}: ${cat.name}.`,
      draftDescription: '',
      hasDraft: false,
      courses: COURSES.filter((c) => c.categoryId === cat.id && c.status === 'PUBLISHED').map((c) => ({
        courseId: c.id,
        code: c.code,
        title: c.title,
        level: c.level,
        levelName: levelLabel(c.level),
      })),
      draftNewCourses: [],
    })),
    releases: [
      {
        versionNo: 1,
        releaseNote: 'Công bố chuẩn ban đầu.',
        publishedByEmail: 'admin@digitalent.ai',
        publishedAt: '2026-10-01T00:00:00Z',
      },
    ],
  };
}, { message: 'Đã công bố khung năng lực.' });

route('POST', '/platform/frameworks/:id/domains', (context) => {
  const { id } = context.params;
  const body = context.body as { name: string; description?: string };
  return {
    id,
    code: 'TT02_2025',
    name: 'Khung chuẩn năng lực số doanh nghiệp',
    description: 'Bộ 24 năng lực số cốt lõi chuẩn hóa cho doanh nghiệp.',
    status: 'PUBLISHED' as const,
    currentVersionNo: catalogStore.currentVersionNo,
    domainCount: 7,
    courseCount: 18,
    coursesByLevel: [6, 6, 6],
    draftCourseCount: null,
    hasDraft: false,
    currentCatalogVersionNo: catalogStore.currentVersionNo,
    draftCatalogVersionNo: catalogStore.draftVersionNo,
    domains: [
      ...CATEGORIES.map((cat, idx) => ({
        id: cat.id,
        code: cat.code,
        name: cat.name,
        sortOrder: cat.sortOrder,
        publishedDescription: `Lĩnh vực ${idx + 1}: ${cat.name}.`,
        draftDescription: '',
        hasDraft: false,
        courses: COURSES.filter((c) => c.categoryId === cat.id && c.status === 'PUBLISHED').map((c) => ({
          courseId: c.id,
          code: c.code,
          title: c.title,
          level: c.level,
          levelName: levelLabel(c.level),
        })),
        draftNewCourses: [],
      })),
      {
        id: `cat-${Date.now()}`,
        code: 'NEW',
        name: body.name || 'Lĩnh vực mới',
        sortOrder: 7,
        publishedDescription: body.description ?? '',
        draftDescription: '',
        hasDraft: false,
        courses: [],
        draftNewCourses: [],
      },
    ],
    releases: [],
  };
}, { status: 201, message: 'Đã thêm lĩnh vực mới.' });

route('PUT', '/platform/frameworks/:id/domains/:domainId', (context) => {
  const { id, domainId } = context.params;
  const body = context.body as { name: string; description?: string };
  return {
    id,
    code: 'TT02_2025',
    name: 'Khung chuẩn năng lực số doanh nghiệp',
    description: 'Bộ 24 năng lực số cốt lõi chuẩn hóa cho doanh nghiệp.',
    status: 'PUBLISHED' as const,
    currentVersionNo: catalogStore.currentVersionNo,
    domainCount: 6,
    courseCount: 18,
    coursesByLevel: [6, 6, 6],
    draftCourseCount: null,
    hasDraft: false,
    currentCatalogVersionNo: catalogStore.currentVersionNo,
    draftCatalogVersionNo: catalogStore.draftVersionNo,
    domains: CATEGORIES.map((cat, idx) => ({
      id: cat.id,
      code: cat.code,
      name: cat.id === domainId ? (body.name || cat.name) : cat.name,
      sortOrder: cat.sortOrder,
      publishedDescription: cat.id === domainId ? (body.description ?? `Lĩnh vực ${idx + 1}`) : `Lĩnh vực ${idx + 1}: ${cat.name}.`,
      draftDescription: '',
      hasDraft: false,
      courses: COURSES.filter((c) => c.categoryId === cat.id && c.status === 'PUBLISHED').map((c) => ({
        courseId: c.id,
        code: c.code,
        title: c.title,
        level: c.level,
        levelName: levelLabel(c.level),
      })),
      draftNewCourses: [],
    })),
    releases: [],
  };
}, { message: 'Đã cập nhật lĩnh vực.' });

route('DELETE', '/platform/frameworks/:id/domains/:domainId', (context) => {
  const { id } = context.params;
  return {
    id,
    code: 'TT02_2025',
    name: 'Khung chuẩn năng lực số doanh nghiệp',
    description: 'Bộ 24 năng lực số cốt lõi chuẩn hóa cho doanh nghiệp.',
    status: 'PUBLISHED' as const,
    currentVersionNo: catalogStore.currentVersionNo,
    domainCount: 5,
    courseCount: 18,
    coursesByLevel: [6, 6, 6],
    draftCourseCount: null,
    hasDraft: false,
    currentCatalogVersionNo: catalogStore.currentVersionNo,
    draftCatalogVersionNo: catalogStore.draftVersionNo,
    domains: CATEGORIES.slice(0, 5).map((cat, idx) => ({
      id: cat.id,
      code: cat.code,
      name: cat.name,
      sortOrder: cat.sortOrder,
      publishedDescription: `Lĩnh vực ${idx + 1}: ${cat.name}.`,
      draftDescription: '',
      hasDraft: false,
      courses: COURSES.filter((c) => c.categoryId === cat.id && c.status === 'PUBLISHED').map((c) => ({
        courseId: c.id,
        code: c.code,
        title: c.title,
        level: c.level,
        levelName: levelLabel(c.level),
      })),
      draftNewCourses: [],
    })),
    releases: [],
  };
}, { message: 'Đã xóa lĩnh vực.' });

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
  const items = COURSES.map((c) => {
    const d = parseInt(c.categoryId.replace('cat-', ''), 10) || 1;
    return {
      id: c.id,
      code: c.code,
      frameworkId: 'fw-tt02',
      frameworkName: 'Khung năng lực số quốc gia (Thông tư 02/2025/TT-BGDĐT)',
      domainCode: `D${d}`,
      domainName: CATEGORIES.find((cat) => cat.id === c.categoryId)?.name ?? '',
      level: c.level,
      levelName: levelLabel(c.level),
      versionNo: 1,
      title: c.title,
      outcome: `Đạt chuẩn năng lực số mức độ ${levelLabel(c.level)}`,
      pricePerSeat: c.level === 1 ? 0 : 500000 * c.level,
      salesStatus: 'OPEN' as const,
      isFree: c.level === 1,
      draftPricePerSeat: null,
      draftSalesStatus: null,
      publishedAt: '2026-10-01T00:00:00Z',
      moduleCount: c.modules,
      questionCount: 12,
      seatsPurchased: 20,
      seatsGranted: 5,
      revenue: c.level === 1 ? 0 : 10000000,
    };
  });
  return { items };
});

route('GET', '/platform/commerce', () => {
  const published = COURSES.filter((c) => c.status === 'PUBLISHED');
  const courses = published.map((c) => {
    const d = parseInt(c.categoryId.replace('cat-', ''), 10) || 1;
    return {
      id: c.id,
      code: c.code,
      frameworkId: 'fw-tt02',
      frameworkName: 'Khung năng lực số quốc gia (Thông tư 02/2025/TT-BGDĐT)',
      domainCode: `D${d}`,
      domainName: CATEGORIES.find((cat) => cat.id === c.categoryId)?.name ?? '',
      level: c.level,
      levelName: levelLabel(c.level),
      versionNo: 1,
      title: c.title,
      outcome: `Đạt chuẩn năng lực số mức độ ${levelLabel(c.level)}`,
      pricePerSeat: c.level === 1 ? 0 : 500000 * c.level,
      salesStatus: 'OPEN' as const,
      isFree: c.level === 1,
      draftPricePerSeat: null,
      draftSalesStatus: null,
      publishedAt: '2026-10-01T00:00:00Z',
      moduleCount: c.modules,
      questionCount: 12,
      seatsPurchased: 20,
      seatsGranted: 5,
      revenue: c.level === 1 ? 0 : 10000000,
    };
  });
  return {
    courses,
    seatsPurchased: 250,
    seatsGranted: 50,
    revenue: 125000000,
    orders: {
      items: [],
      totalCount: 0,
      pageIndex: 1,
      pageSize: 20,
      totalPages: 0,
    },
  };
});

// ── PLT-03 & PLT-04: Catalog Versions & Course Builder Mock Store ──
interface CatalogStoreState {
  currentVersionNo: number;
  draftVersionNo: number | null;
  versions: Map<number, CatalogVersionSummary>;
  courseRowsByVersion: Map<number, CatalogCourseRow[]>;
  courseDetails: Map<string, CatalogCourseDetail>;
}

function createDefaultCourseRows(): CatalogCourseRow[] {
  return COURSES.filter((c) => c.status === 'PUBLISHED').map((c) => {
    const cat = CATEGORIES.find((category) => category.id === c.categoryId);
    return {
      courseId: c.id,
      code: c.code,
      title: c.title,
      frameworkId: 'fw-standard',
      frameworkName: 'Khung chuẩn năng lực số doanh nghiệp',
      domainId: c.categoryId,
      domainName: cat?.name ?? '',
      level: c.level,
      levelName: levelLabel(c.level),
      moduleCount: c.modules,
      questionCount: 12,
      pricePerSeat: c.level === 1 ? 0 : 500000 * c.level,
      salesStatus: 'OPEN' as CatalogSalesStatus,
      changeKind: 'UNCHANGED' as ChangeKind,
    };
  });
}

const catalogStore: CatalogStoreState = (() => {
  const versions = new Map<number, CatalogVersionSummary>();
  const courseRowsByVersion = new Map<number, CatalogCourseRow[]>();

  const summaries: CatalogVersionSummary[] = [
    {
      versionNo: 5,
      status: 'CURRENT',
      basedOnVersionNo: 4,
      releaseNote: 'Công bố chuẩn hóa danh mục khóa học số v5.',
      createdAt: '2026-11-01T00:00:00Z',
      publishedAt: '2026-11-05T08:00:00Z',
      publishedByEmail: 'admin@digitalent.ai',
      courseCount: 18,
      frameworkCount: 1,
      newCount: 0,
      editedCount: 0,
    },
    {
      versionNo: 4,
      status: 'RETIRED',
      basedOnVersionNo: 3,
      releaseNote: 'Phiên bản v4 lưu trữ.',
      createdAt: '2026-10-15T00:00:00Z',
      publishedAt: '2026-10-20T08:00:00Z',
      publishedByEmail: 'admin@digitalent.ai',
      courseCount: 18,
      frameworkCount: 1,
      newCount: 0,
      editedCount: 0,
    },
    {
      versionNo: 3,
      status: 'RETIRED',
      basedOnVersionNo: 2,
      releaseNote: 'Phiên bản v3 lưu trữ.',
      createdAt: '2026-09-01T00:00:00Z',
      publishedAt: '2026-09-10T08:00:00Z',
      publishedByEmail: 'admin@digitalent.ai',
      courseCount: 18,
      frameworkCount: 1,
      newCount: 0,
      editedCount: 0,
    },
    {
      versionNo: 2,
      status: 'RETIRED',
      basedOnVersionNo: 1,
      releaseNote: 'Phiên bản v2 lưu trữ.',
      createdAt: '2026-07-01T00:00:00Z',
      publishedAt: '2026-07-15T08:00:00Z',
      publishedByEmail: 'admin@digitalent.ai',
      courseCount: 18,
      frameworkCount: 1,
      newCount: 0,
      editedCount: 0,
    },
    {
      versionNo: 1,
      status: 'RETIRED',
      basedOnVersionNo: null,
      releaseNote: 'Phiên bản khởi tạo v1.',
      createdAt: '2026-05-01T00:00:00Z',
      publishedAt: '2026-05-15T08:00:00Z',
      publishedByEmail: 'admin@digitalent.ai',
      courseCount: 18,
      frameworkCount: 1,
      newCount: 0,
      editedCount: 0,
    },
  ];

  for (const s of summaries) {
    versions.set(s.versionNo, s);
    courseRowsByVersion.set(s.versionNo, createDefaultCourseRows());
  }

  return {
    currentVersionNo: 5,
    draftVersionNo: null,
    versions,
    courseRowsByVersion,
    courseDetails: new Map<string, CatalogCourseDetail>(),
  };
})();

function getCoursesForVersion(versionNo: number): CatalogCourseRow[] {
  let rows = catalogStore.courseRowsByVersion.get(versionNo);
  if (!rows) {
    rows = createDefaultCourseRows();
    catalogStore.courseRowsByVersion.set(versionNo, rows);
  }
  return rows;
}

function getOrCreateCourseDetail(versionNo: number, courseId: string): CatalogCourseDetail {
  const key = `${versionNo}-${courseId}`;
  const isDraft = versionNo === catalogStore.draftVersionNo;
  const versionStatus: CatalogVersionStatus = isDraft
    ? 'DRAFT'
    : versionNo === catalogStore.currentVersionNo
      ? 'CURRENT'
      : 'RETIRED';

  const existing = catalogStore.courseDetails.get(key);
  if (existing) {
    existing.versionStatus = versionStatus;
    existing.editable = isDraft;
    return existing;
  }

  const course = COURSES.find((c) => c.id === courseId || c.code === courseId || c.code === courseId.replace(/^crs-|^c-/, ''));
  const cat = course ? CATEGORIES.find((category) => category.id === course.categoryId) : undefined;
  const code = course ? course.code : courseId.replace(/^crs-|^c-/, '');
  const title = course ? course.title : `Khóa học ${code}`;
  const level = course ? course.level : 1;
  const modulesCount = Math.max(1, course?.modules ?? 2);

  const modules: CatalogModule[] = Array.from({ length: modulesCount }, (_, i) => {
    const mIndex = i + 1;
    return {
      moduleId: `mod-${code.toLowerCase()}-${mIndex}`,
      index: i,
      title: `Bài học ${mIndex}: Kiến thức và kỹ năng cốt lõi`,
      quizTitle: `Trắc nghiệm ôn tập bài ${mIndex}`,
      blocks: [
        {
          blockId: `blk-${code.toLowerCase()}-${mIndex}-1`,
          index: 0,
          type: 'TEXT' as const,
          bodyHtml: `<p>Nội dung kiến thức chuẩn hóa cho học phần <strong>${title}</strong>.</p><p>Học viên nắm bắt phương pháp, công cụ và quy trình thực hiện công việc hiệu quả trên môi trường số.</p>`,
          asset: null,
          caption: null,
          altText: null,
          items: [],
        },
      ],
      questions: [
        {
          questionId: `q-${code.toLowerCase()}-${mIndex}-1`,
          index: 0,
          text: `Mục tiêu quan trọng nhất của bài học này là gì?`,
          explanation: 'Hiểu rõ nguyên lý cốt lõi và phương pháp triển khai thực tiễn.',
          blockId: null,
          options: [
            { optionId: `opt-${mIndex}-1`, text: 'Nắm vững nguyên lý và phương pháp vận dụng thực tế', isCorrect: true },
            { optionId: `opt-${mIndex}-2`, text: 'Bỏ qua các bước thẩm định tính chính xác của dữ liệu', isCorrect: false },
            { optionId: `opt-${mIndex}-3`, text: 'Chỉ thực hiện khi có văn bản yêu cầu riêng', isCorrect: false },
          ],
        },
      ],
    };
  });

  const detail: CatalogCourseDetail = {
    versionNo,
    versionStatus,
    editable: isDraft,
    courseId,
    code,
    codeEditable: isDraft,
    changeKind: isDraft ? 'NEW' : 'UNCHANGED',
    frameworkId: 'fw-standard',
    frameworkName: 'Khung chuẩn năng lực số doanh nghiệp',
    domainId: course ? course.categoryId : 'cat-1',
    domainName: cat?.name ?? 'Dữ liệu và thông tin số',
    level,
    levelName: levelLabel(level),
    title,
    outcome: 'Học viên hoàn thành khóa học sẽ nắm vững kỹ năng thực hành theo chuẩn năng lực số doanh nghiệp.',
    pricePerSeat: level === 1 ? 0 : 500000 * level,
    salesStatus: 'OPEN',
    final: {
      title: `Bài đánh giá tổng hợp: ${title}`,
      promptHtml: `<p>Thực hiện bài kiểm tra cuối khóa nhằm đánh giá mức độ tiếp thu và vận dụng kiến thức <strong>${title}</strong> vào thực tế công việc.</p>`,
      criteria: [
        'Nắm vững kiến thức và kỹ năng trọng tâm',
        'Vận dụng giải quyết tình huống thực tế chính xác',
        'Tuân thủ quy chuẩn kỹ thuật và an toàn số',
      ],
    },
    modules,
  };

  catalogStore.courseDetails.set(key, detail);
  return detail;
}

route('GET', '/platform/catalog/versions', () => {
  const items = Array.from(catalogStore.versions.values()).sort((a, b) => b.versionNo - a.versionNo);
  return {
    items,
    currentVersionNo: catalogStore.currentVersionNo,
    draftVersionNo: catalogStore.draftVersionNo,
  };
});

route('POST', '/platform/catalog/versions', () => {
  if (catalogStore.draftVersionNo !== null) {
    const draft = catalogStore.versions.get(catalogStore.draftVersionNo);
    if (draft) {
      return {
        version: draft,
        editable: true,
        courses: getCoursesForVersion(catalogStore.draftVersionNo),
      };
    }
  }

  const nextNo = catalogStore.currentVersionNo + 1;
  catalogStore.draftVersionNo = nextNo;
  const draftSummary: CatalogVersionSummary = {
    versionNo: nextNo,
    status: 'DRAFT',
    basedOnVersionNo: catalogStore.currentVersionNo,
    releaseNote: '',
    createdAt: new Date().toISOString(),
    publishedAt: null,
    publishedByEmail: null,
    courseCount: 18,
    frameworkCount: 1,
    newCount: 0,
    editedCount: 0,
  };
  catalogStore.versions.set(nextNo, draftSummary);

  const currentCourses = getCoursesForVersion(catalogStore.currentVersionNo);
  const draftCourses = currentCourses.map((c) => ({
    ...c,
    changeKind: 'UNCHANGED' as ChangeKind,
  }));
  catalogStore.courseRowsByVersion.set(nextNo, draftCourses);

  return {
    version: draftSummary,
    editable: true,
    courses: draftCourses,
  };
}, { message: 'Đã tạo bản nháp mới.' });

route('DELETE', '/platform/catalog/versions/:versionNo', (context) => {
  const vNo = Number(context.params.versionNo);
  if (catalogStore.draftVersionNo === vNo) {
    catalogStore.draftVersionNo = null;
    catalogStore.versions.delete(vNo);
    catalogStore.courseRowsByVersion.delete(vNo);
  }
  const items = Array.from(catalogStore.versions.values()).sort((a, b) => b.versionNo - a.versionNo);
  return {
    items,
    currentVersionNo: catalogStore.currentVersionNo,
    draftVersionNo: catalogStore.draftVersionNo,
  };
}, { message: 'Đã hủy bản nháp.' });

route('GET', '/platform/catalog/versions/:versionNo', (context) => {
  const vNo = Number(context.params.versionNo) || catalogStore.currentVersionNo;
  let summary = catalogStore.versions.get(vNo);
  if (!summary) {
    summary = {
      versionNo: vNo,
      status: vNo === catalogStore.draftVersionNo ? 'DRAFT' : vNo === catalogStore.currentVersionNo ? 'CURRENT' : 'RETIRED',
      basedOnVersionNo: vNo > 1 ? vNo - 1 : null,
      releaseNote: `Phiên bản v${vNo}.`,
      createdAt: '2026-01-01T00:00:00Z',
      publishedAt: '2026-01-02T00:00:00Z',
      publishedByEmail: 'admin@digitalent.ai',
      courseCount: 18,
      frameworkCount: 1,
      newCount: 0,
      editedCount: 0,
    };
    catalogStore.versions.set(vNo, summary);
  }
  const courses = getCoursesForVersion(vNo);
  return {
    version: summary,
    editable: summary.status === 'DRAFT',
    courses,
  };
});

route('POST', '/platform/catalog/versions/:versionNo/publish', (context) => {
  const vNo = Number(context.params.versionNo);
  const body = context.body as { releaseNote?: string } | undefined;
  const summary = catalogStore.versions.get(vNo);
  if (!summary) throw notFound(`Không tìm thấy phiên bản v${vNo}.`);

  const oldCurrent = catalogStore.versions.get(catalogStore.currentVersionNo);
  if (oldCurrent && oldCurrent.versionNo !== vNo) {
    oldCurrent.status = 'RETIRED';
  }

  summary.status = 'CURRENT';
  summary.publishedAt = new Date().toISOString();
  summary.publishedByEmail = context.session?.email || 'admin@digitalent.ai';
  if (body?.releaseNote) {
    summary.releaseNote = body.releaseNote;
  }
  catalogStore.currentVersionNo = vNo;
  if (catalogStore.draftVersionNo === vNo) {
    catalogStore.draftVersionNo = null;
  }

  return {
    version: summary,
    editable: false,
    courses: getCoursesForVersion(vNo),
  };
}, { message: 'Đã công bố phiên bản danh mục.' });

route('GET', '/platform/catalog/versions/:versionNo/publish-check', (context) => {
  const vNo = Number(context.params.versionNo);
  const check: PublishCheck = {
    versionNo: vNo,
    canPublish: true,
    changedCount: 0,
    items: [],
  };
  return check;
});

route('PUT', '/platform/catalog/versions/:versionNo/prices', (context) => {
  const vNo = Number(context.params.versionNo);
  const body = context.body as { items: { courseId: string; pricePerSeat: number; salesStatus: CatalogSalesStatus }[] };
  const courses = getCoursesForVersion(vNo);
  for (const item of body.items ?? []) {
    const c = courses.find((row) => row.courseId === item.courseId);
    if (c) {
      if (c.level > 1) {
        c.pricePerSeat = item.pricePerSeat;
      }
      c.salesStatus = item.salesStatus;
      c.changeKind = 'EDITED';
    }
  }
  const summary = catalogStore.versions.get(vNo)!;
  return {
    version: summary,
    editable: summary.status === 'DRAFT',
    courses,
  };
}, { message: 'Đã cập nhật bảng giá khóa học.' });

route('GET', '/platform/catalog/versions/:versionNo/courses/:courseId', (context) => {
  const vNo = Number(context.params.versionNo);
  const { courseId } = context.params;
  return getOrCreateCourseDetail(vNo, courseId);
});

route('PUT', '/platform/catalog/versions/:versionNo/courses/:courseId', (context) => {
  const vNo = Number(context.params.versionNo);
  const { courseId } = context.params;
  const detail = getOrCreateCourseDetail(vNo, courseId);
  const body = context.body as Partial<CourseInfoInput>;

  if (body.title !== undefined) detail.title = body.title;
  if (body.outcome !== undefined) detail.outcome = body.outcome;
  if (body.domainId !== undefined) {
    detail.domainId = body.domainId;
    const cat = CATEGORIES.find((c) => c.id === body.domainId);
    if (cat) detail.domainName = cat.name;
  }
  if (body.level !== undefined) {
    detail.level = body.level;
    detail.levelName = levelLabel(body.level);
    if (body.level === 1) detail.pricePerSeat = 0;
  }
  if (body.pricePerSeat !== undefined && detail.level > 1) {
    detail.pricePerSeat = body.pricePerSeat;
  }
  if (body.salesStatus !== undefined) detail.salesStatus = body.salesStatus;
  if (body.code !== undefined && detail.codeEditable) detail.code = body.code;
  detail.changeKind = 'EDITED';

  const rows = getCoursesForVersion(vNo);
  const row = rows.find((r) => r.courseId === courseId);
  if (row) {
    row.title = detail.title;
    row.domainId = detail.domainId;
    row.domainName = detail.domainName;
    row.level = detail.level;
    row.levelName = detail.levelName;
    row.pricePerSeat = detail.pricePerSeat;
    row.salesStatus = detail.salesStatus;
    row.code = detail.code;
    row.changeKind = 'EDITED';
  }

  return detail;
}, { message: 'Đã lưu thông tin khóa học.' });

route('POST', '/platform/catalog/versions/:versionNo/courses', (context) => {
  const vNo = Number(context.params.versionNo);
  const body = context.body as { code: string; title: string; domainId: string; level: number };
  const courseId = `crs-${body.code || Date.now()}`;
  const cat = CATEGORIES.find((c) => c.id === body.domainId);

  const detail: CatalogCourseDetail = {
    versionNo: vNo,
    versionStatus: 'DRAFT',
    editable: true,
    courseId,
    code: body.code,
    codeEditable: true,
    changeKind: 'NEW',
    frameworkId: 'fw-standard',
    frameworkName: 'Khung chuẩn năng lực số doanh nghiệp',
    domainId: body.domainId,
    domainName: cat?.name ?? 'Dữ liệu và thông tin số',
    level: body.level,
    levelName: levelLabel(body.level),
    title: body.title,
    outcome: '',
    pricePerSeat: body.level === 1 ? 0 : 500000 * body.level,
    salesStatus: 'OPEN',
    final: { title: 'Bài đánh giá cuối khóa', promptHtml: '', criteria: [] },
    modules: [],
  };

  catalogStore.courseDetails.set(`${vNo}-${courseId}`, detail);

  const rows = getCoursesForVersion(vNo);
  rows.push({
    courseId,
    code: detail.code,
    title: detail.title,
    frameworkId: detail.frameworkId,
    frameworkName: detail.frameworkName,
    domainId: detail.domainId,
    domainName: detail.domainName,
    level: detail.level,
    levelName: detail.levelName,
    moduleCount: 0,
    questionCount: 0,
    pricePerSeat: detail.pricePerSeat,
    salesStatus: detail.salesStatus,
    changeKind: 'NEW',
  });

  return detail;
}, { status: 201, message: 'Đã thêm khóa học mới vào bản nháp.' });

route('DELETE', '/platform/catalog/versions/:versionNo/courses/:courseId', (context) => {
  const vNo = Number(context.params.versionNo);
  const { courseId } = context.params;
  const rows = getCoursesForVersion(vNo);
  const idx = rows.findIndex((r) => r.courseId === courseId);
  if (idx >= 0) rows.splice(idx, 1);
  catalogStore.courseDetails.delete(`${vNo}-${courseId}`);

  const summary = catalogStore.versions.get(vNo)!;
  return {
    version: summary,
    editable: summary.status === 'DRAFT',
    courses: rows,
  };
}, { message: 'Đã xóa khóa học khỏi bản nháp.' });

route('PUT', '/platform/catalog/versions/:versionNo/courses/:courseId/final', (context) => {
  const vNo = Number(context.params.versionNo);
  const { courseId } = context.params;
  const detail = getOrCreateCourseDetail(vNo, courseId);
  const body = context.body as { title: string; promptHtml: string; criteria: string[] };
  detail.final = { ...body };
  detail.changeKind = 'EDITED';
  return detail;
}, { message: 'Đã lưu bài cuối khóa.' });

route('POST', '/platform/catalog/versions/:versionNo/courses/:courseId/modules', (context) => {
  const vNo = Number(context.params.versionNo);
  const { courseId } = context.params;
  const detail = getOrCreateCourseDetail(vNo, courseId);
  const title = String((context.body as { title?: string }).title ?? 'Mô đun mới').trim();

  const newModule: CatalogModule = {
    moduleId: `mod-${Date.now()}`,
    index: detail.modules.length,
    title,
    quizTitle: 'Trắc nghiệm ôn tập',
    blocks: [],
    questions: [],
  };
  detail.modules.push(newModule);
  detail.changeKind = 'EDITED';

  const rows = getCoursesForVersion(vNo);
  const row = rows.find((r) => r.courseId === courseId);
  if (row) row.moduleCount = detail.modules.length;

  return detail;
}, { status: 201, message: 'Đã thêm mô đun mới.' });

route('PUT', '/platform/catalog/versions/:versionNo/courses/:courseId/modules/:moduleId', (context) => {
  const vNo = Number(context.params.versionNo);
  const { courseId, moduleId } = context.params;
  const detail = getOrCreateCourseDetail(vNo, courseId);
  const body = context.body as { title?: string; quizTitle?: string };

  const mod = detail.modules.find((m) => m.moduleId === moduleId);
  if (mod) {
    if (body.title !== undefined) mod.title = body.title;
    if (body.quizTitle !== undefined) mod.quizTitle = body.quizTitle;
    detail.changeKind = 'EDITED';
  }
  return detail;
}, { message: 'Đã cập nhật mô đun.' });

route('DELETE', '/platform/catalog/versions/:versionNo/courses/:courseId/modules/:moduleId', (context) => {
  const vNo = Number(context.params.versionNo);
  const { courseId, moduleId } = context.params;
  const detail = getOrCreateCourseDetail(vNo, courseId);

  detail.modules = detail.modules.filter((m) => m.moduleId !== moduleId);
  detail.modules.forEach((m, idx) => { m.index = idx; });
  detail.changeKind = 'EDITED';

  const rows = getCoursesForVersion(vNo);
  const row = rows.find((r) => r.courseId === courseId);
  if (row) row.moduleCount = detail.modules.length;

  return detail;
}, { message: 'Đã xóa mô đun.' });

route('POST', '/platform/catalog/versions/:versionNo/courses/:courseId/modules/:moduleId/move', (context) => {
  const vNo = Number(context.params.versionNo);
  const { courseId, moduleId } = context.params;
  const detail = getOrCreateCourseDetail(vNo, courseId);
  const toIndex = Number((context.body as { toIndex?: number }).toIndex ?? 0);

  const curIndex = detail.modules.findIndex((m) => m.moduleId === moduleId);
  if (curIndex >= 0) {
    const [item] = detail.modules.splice(curIndex, 1);
    detail.modules.splice(toIndex, 0, item);
    detail.modules.forEach((m, idx) => { m.index = idx; });
    detail.changeKind = 'EDITED';
  }
  return detail;
});

route('POST', '/platform/catalog/versions/:versionNo/courses/:courseId/modules/:moduleId/blocks', (context) => {
  const vNo = Number(context.params.versionNo);
  const { courseId, moduleId } = context.params;
  const detail = getOrCreateCourseDetail(vNo, courseId);
  const body = context.body as { type: BlockType; position?: number };

  const mod = detail.modules.find((m) => m.moduleId === moduleId);
  if (mod) {
    const newBlock: CatalogBlock = {
      blockId: `blk-${Date.now()}`,
      index: mod.blocks.length,
      type: body.type || 'TEXT',
      bodyHtml: body.type === 'TEXT' ? '<p>Nội dung bài học...</p>' : null,
      asset: null,
      caption: null,
      altText: null,
      items: [],
    };
    if (typeof body.position === 'number' && body.position >= 0) {
      mod.blocks.splice(body.position, 0, newBlock);
      mod.blocks.forEach((b, idx) => { b.index = idx; });
    } else {
      mod.blocks.push(newBlock);
    }
    detail.changeKind = 'EDITED';
  }
  return detail;
}, { status: 201, message: 'Đã thêm khối nội dung.' });

route('PUT', '/platform/catalog/versions/:versionNo/courses/:courseId/blocks/:blockId', (context) => {
  const vNo = Number(context.params.versionNo);
  const { courseId, blockId } = context.params;
  const detail = getOrCreateCourseDetail(vNo, courseId);
  const body = context.body as BlockInput;

  for (const mod of detail.modules) {
    const block = mod.blocks.find((b) => b.blockId === blockId);
    if (block) {
      if (body.bodyHtml !== undefined) block.bodyHtml = body.bodyHtml;
      if (body.caption !== undefined) block.caption = body.caption;
      if (body.altText !== undefined) block.altText = body.altText;
      detail.changeKind = 'EDITED';
      break;
    }
  }
  return detail;
}, { message: 'Đã lưu khối nội dung.' });

route('DELETE', '/platform/catalog/versions/:versionNo/courses/:courseId/blocks/:blockId', (context) => {
  const vNo = Number(context.params.versionNo);
  const { courseId, blockId } = context.params;
  const detail = getOrCreateCourseDetail(vNo, courseId);

  for (const mod of detail.modules) {
    const idx = mod.blocks.findIndex((b) => b.blockId === blockId);
    if (idx >= 0) {
      mod.blocks.splice(idx, 1);
      mod.blocks.forEach((b, i) => { b.index = i; });
      detail.changeKind = 'EDITED';
      break;
    }
  }
  return detail;
}, { message: 'Đã xóa khối nội dung.' });

route('POST', '/platform/catalog/versions/:versionNo/courses/:courseId/blocks/:blockId/move', (context) => {
  const vNo = Number(context.params.versionNo);
  const { courseId, blockId } = context.params;
  const detail = getOrCreateCourseDetail(vNo, courseId);
  const toIndex = Number((context.body as { toIndex?: number }).toIndex ?? 0);

  for (const mod of detail.modules) {
    const idx = mod.blocks.findIndex((b) => b.blockId === blockId);
    if (idx >= 0) {
      const [block] = mod.blocks.splice(idx, 1);
      mod.blocks.splice(toIndex, 0, block);
      mod.blocks.forEach((b, i) => { b.index = i; });
      detail.changeKind = 'EDITED';
      break;
    }
  }
  return detail;
});

route('POST', '/platform/catalog/versions/:versionNo/courses/:courseId/modules/:moduleId/questions', (context) => {
  const vNo = Number(context.params.versionNo);
  const { courseId, moduleId } = context.params;
  const detail = getOrCreateCourseDetail(vNo, courseId);
  const body = context.body as QuestionInput;

  const mod = detail.modules.find((m) => m.moduleId === moduleId);
  if (mod) {
    const newQuestion: CatalogQuestion = {
      questionId: `q-${Date.now()}`,
      index: mod.questions.length,
      text: body.text || 'Câu hỏi trắc nghiệm mới',
      explanation: body.explanation ?? null,
      blockId: body.blockId ?? null,
      options: body.options?.map((opt, i) => ({
        optionId: `opt-${Date.now()}-${i}`,
        text: opt.text,
        isCorrect: opt.isCorrect,
      })) ?? [
        { optionId: `opt-${Date.now()}-1`, text: 'Lựa chọn A', isCorrect: true },
        { optionId: `opt-${Date.now()}-2`, text: 'Lựa chọn B', isCorrect: false },
      ],
    };
    mod.questions.push(newQuestion);
    detail.changeKind = 'EDITED';

    const rows = getCoursesForVersion(vNo);
    const row = rows.find((r) => r.courseId === courseId);
    if (row) {
      row.questionCount = detail.modules.reduce((sum, m) => sum + m.questions.length, 0);
    }
  }
  return detail;
}, { status: 201, message: 'Đã thêm câu hỏi trắc nghiệm.' });

route('PUT', '/platform/catalog/versions/:versionNo/courses/:courseId/questions/:questionId', (context) => {
  const vNo = Number(context.params.versionNo);
  const { courseId, questionId } = context.params;
  const detail = getOrCreateCourseDetail(vNo, courseId);
  const body = context.body as QuestionInput;

  for (const mod of detail.modules) {
    const q = mod.questions.find((question) => question.questionId === questionId);
    if (q) {
      if (body.text !== undefined) q.text = body.text;
      if (body.explanation !== undefined) q.explanation = body.explanation;
      if (body.blockId !== undefined) q.blockId = body.blockId;
      if (body.options !== undefined) {
        q.options = body.options.map((opt, i) => ({
          optionId: `opt-${i}`,
          text: opt.text,
          isCorrect: opt.isCorrect,
        }));
      }
      detail.changeKind = 'EDITED';
      break;
    }
  }
  return detail;
}, { message: 'Đã lưu câu hỏi.' });

route('DELETE', '/platform/catalog/versions/:versionNo/courses/:courseId/questions/:questionId', (context) => {
  const vNo = Number(context.params.versionNo);
  const { courseId, questionId } = context.params;
  const detail = getOrCreateCourseDetail(vNo, courseId);

  for (const mod of detail.modules) {
    const idx = mod.questions.findIndex((q) => q.questionId === questionId);
    if (idx >= 0) {
      mod.questions.splice(idx, 1);
      mod.questions.forEach((q, i) => { q.index = i; });
      detail.changeKind = 'EDITED';
      break;
    }
  }

  const rows = getCoursesForVersion(vNo);
  const row = rows.find((r) => r.courseId === courseId);
  if (row) {
    row.questionCount = detail.modules.reduce((sum, m) => sum + m.questions.length, 0);
  }

  return detail;
}, { message: 'Đã xóa câu hỏi.' });

route('POST', '/platform/assets/presign', () => {
  return {
    mode: 'PROXY' as const,
    uploadUrl: null,
    uploadToken: null,
    method: null,
  };
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

route('GET', '/platform/audit-logs', (context) => {
  const { query } = context;
  let list = platformState.auditLogs.map((a) => ({
    id: a.id,
    action: a.action,
    actionLabel: a.action,
    scope: 'PLATFORM' as const,
    entityType: a.targetType,
    entityId: null,
    entityLabel: a.targetName,
    organizationId: null,
    organizationName: null,
    actorEmail: a.actorEmail,
    oldValues: null,
    newValues: a.details,
    createdAt: a.timestamp,
  }));

  if (query.search) {
    list = list.filter((a) => matchesSearch(a.newValues ?? '', query.search) || matchesSearch(a.entityLabel ?? '', query.search) || matchesSearch(a.actorEmail ?? '', query.search));
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
  const stored = getDb().users.find((user) => user.id === session.id) ?? getDb().accountProfiles?.[session.id];
  const profile: UserProfileDto = {
    id: session.id,
    fullName: stored?.fullName ?? session.fullName,
    email: session.email,
    phone: stored?.phone ?? '',
    jobTitle: stored?.jobTitle ?? '',
    roleTitle: session.roles[0],
  };
  return profile;
}, { permission: PERMISSIONS.ACCOUNT_VIEW_OWN });

route('PUT', '/account/profile', (context) => {
  const { session, body } = context;
  const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : session.fullName;
  const phone = typeof body.phone === 'string' ? body.phone.trim() : undefined;
  const jobTitle = typeof body.jobTitle === 'string' ? body.jobTitle.trim() : undefined;

  // Preserve edits for both seeded demo identities and registered accounts.
  updateDb((db) => {
    db.accountProfiles ??= {};
    db.accountProfiles[session.id] = { fullName, phone, jobTitle };
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
