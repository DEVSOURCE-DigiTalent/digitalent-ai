import type { SkillGapItem, SkillGapSummary } from '../../intelligence.service';
import type { ReferencePositionCode } from './catalog';
import type { EnrollmentStatus } from './engine';
import type { AssessmentAttemptRecord, CertificateRecord, PracticalTaskRecord, TaskSubmissionRecord } from './types-work';

export * from './types-work';

/** Records of the mock server: the data one organization owns. Names follow the REST DTOs the pages read. */

export type RecordStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

interface Timestamped {
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentRecord extends Timestamped {
  id: string;
  code: string;
  name: string;
  description?: string;
  parentDepartmentId?: string;
  managerEmployeeId?: string;
  status: RecordStatus;
}

export interface JobFamilyRecord extends Timestamped {
  id: string;
  code: string;
  name: string;
  description?: string;
  status: RecordStatus;
}

export type JobGradeCode = 'G1' | 'G2' | 'G3';

export interface JobGradeRecord {
  code: JobGradeCode;
  name: string;
  description: string;
}

export interface JobPositionRecord extends Timestamped {
  id: string;
  code: string;
  name: string;
  description?: string;
  departmentId?: string;
  jobFamilyId?: string;
  jobGrade?: JobGradeCode;
  /** Set for positions taken from the reference library. */
  referenceCode?: ReferencePositionCode;
  status: RecordStatus;
}

export interface EmployeeRecord extends Timestamped {
  id: string;
  userId?: string;
  departmentId: string;
  jobPositionId?: string;
  directManagerId?: string;
  employeeCode: string;
  fullName: string;
  workEmail?: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED' | 'ARCHIVED';
  joinedAt?: string;
}

export interface RequirementItemRecord {
  id: string;
  competencyId: string;
  requiredLevel: number;
  weightPercent: number;
  isMandatory: boolean;
  requiresPracticalEvidence: boolean;
  note?: string;
}

export interface RequirementSetRecord {
  id: string;
  jobPositionId: string;
  versionNo: number;
  status: 'DRAFT' | 'ACTIVE' | 'RETIRED';
  effectiveFrom?: string;
  effectiveTo?: string;
  reviewDate?: string;
  createdByUserId?: string;
  activatedByUserId?: string;
  activatedAt?: string;
  changeReason?: string;
  changeUserFullName?: string;
  items: RequirementItemRecord[];
}

export type EvidenceSource = 'MIGRATION' | 'ASSESSMENT' | 'TASK' | 'MANUAL';

export interface ProfileEntry {
  level: number;
  source: EvidenceSource;
  confirmedAt: string;
  note?: string;
}

/** Confirmed level per competency id, per employee id. */
export type ProfileMap = Record<string, Record<string, ProfileEntry>>;

export interface SkillGapRunRecord {
  runId: string;
  employeeId: string;
  requirementSetId: string;
  requirementSetVersionNo: number;
  generatedAt: string;
  generatedBy: 'SYSTEM' | 'USER_REQUEST';
  items: SkillGapItem[];
  summary: SkillGapSummary;
}

export type AssignmentStatus = EnrollmentStatus | 'CANCELLED';

export interface AssignmentRecord {
  id: string;
  employeeId: string;
  courseId: string;
  assignedByName: string;
  assignedAt: string;
  dueDate?: string;
  source: 'MANUAL' | 'RECOMMENDATION';
  status: AssignmentStatus;
  progressPercent: number;
  completedAt?: string;
  cancelReason?: string;
}

export interface RecommendationDecision {
  employeeId: string;
  courseId: string;
  status: 'ACCEPTED' | 'DISMISSED';
  reason?: string;
  decidedAt: string;
  decidedByName: string;
}

export type MemberStatus = 'ACTIVE' | 'INACTIVE';

/** A person with access to the organization (the seeded part; real sign-ups live in the mock database). */
export interface SeedMemberRecord {
  id: string;
  fullName: string;
  email: string;
  roles: string[];
  status: MemberStatus;
  employeeId?: string;
  joinedAt: string;
  lastActiveAt?: string;
  deactivatedReason?: string;
}

export interface SeedInvitationRecord {
  id: string;
  fullName: string;
  email: string;
  role: string;
  departmentId?: string;
  jobPositionId?: string;
  invitedAt: string;
}

export interface AuditEntry {
  id: string;
  at: string;
  actorName: string;
  action: string;
  targetType: string;
  targetLabel: string;
  detail?: string;
}

export interface OrgSettingsRecord {
  name: string;
  industry: string;
  size: string;
  timezone: string;
  defaultAssignmentDays: number;
}

/** A role or status change applied on top of a seeded account (seeded accounts live in code, not in the database). */
export interface MemberOverride {
  roles?: string[];
  status?: MemberStatus;
  deactivatedReason?: string;
}

export * from './types-work';

export type TrainingBatchStatus = 'DRAFT' | 'SCHEDULED' | 'RUNNING' | 'COMPLETED' | 'CANCELLED';

export interface TrainingBatchRecord {
  id: string;
  code: string;
  name: string;
  description?: string;
  status: TrainingBatchStatus;
  startDate: string;
  endDate: string;
  courseIds: string[];
  targetCriteria?: {
    departmentIds?: string[];
    jobPositionIds?: string[];
    jobGrades?: string[];
    employeeIds?: string[];
  };
  participantEmployeeIds: string[];
  createdAt: string;
  createdByName?: string;
}

export interface InternalCourseRecord {
  id: string;
  code: string;
  title: string;
  description: string;
  category: string;
  modulesCount: number;
  durationMinutes: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

export interface OrgData {
  organizationId: string;
  settings: OrgSettingsRecord;
  jobGrades?: JobGradeRecord[];
  departments: DepartmentRecord[];
  jobFamilies: JobFamilyRecord[];
  positions: JobPositionRecord[];
  employees: EmployeeRecord[];
  requirementSets: RequirementSetRecord[];
  profiles: ProfileMap;
  skillGapRuns: SkillGapRunRecord[];
  assignments: AssignmentRecord[];
  decisions: RecommendationDecision[];
  trainingBatches?: TrainingBatchRecord[];
  seedMembers: SeedMemberRecord[];
  seedInvitations: SeedInvitationRecord[];
  memberOverrides: Record<string, MemberOverride>;
  audit: AuditEntry[];
  attempts?: AssessmentAttemptRecord[];
  certificates?: CertificateRecord[];
  tasks?: PracticalTaskRecord[];
  submissions?: TaskSubmissionRecord[];
  internalCourses?: InternalCourseRecord[];
  /** Plan changes made after sign-up (seeded organizations have their plan in code). */
  subscriptionOverride?: {
    planCode: string;
    seats: number;
    cycle: 'month' | 'year';
    status: 'active' | 'expired' | 'payment_required';
    cancelAtPeriodEnd?: boolean;
  };
}
