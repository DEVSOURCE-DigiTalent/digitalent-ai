import type { PageRegistry } from '../build-routes';
import { lazyPage } from '../lazy-page';

const OwnerOverviewPage = lazyPage(() => import('../../../features/organization/pages/OwnerOverviewPage'), 'OwnerOverviewPage');
const OwnerMembersPage = lazyPage(() => import('../../../features/organization/pages/OwnerMembersPage'), 'OwnerMembersPage');
const OwnerMemberDetailPage = lazyPage(() => import('../../../features/organization/pages/OwnerMemberDetailPage'), 'OwnerMemberDetailPage');
const DepartmentListPage = lazyPage(() => import('../../../features/organization/pages/DepartmentListPage'), 'DepartmentListPage');
const DepartmentDetailPage = lazyPage(() => import('../../../features/organization/pages/DepartmentDetailPage'), 'DepartmentDetailPage');
const PositionListPage = lazyPage(() => import('../../../features/organization/pages/PositionListPage'), 'PositionListPage');
const PositionDetailPage = lazyPage(() => import('../../../features/organization/pages/PositionDetailPage'), 'PositionDetailPage');
const JobGradeConfigPage = lazyPage(() => import('../../../features/organization/pages/JobGradeConfigPage'), 'JobGradeConfigPage');
const RolesAccessPage = lazyPage(() => import('../../../features/members/pages/RolesAccessPage'), 'RolesAccessPage');
const OwnerFrameworkPage = lazyPage(() => import('../../../features/organization/pages/OwnerFrameworkPage'), 'OwnerFrameworkPage');
const OwnerFrameworkDetailPage = lazyPage(() => import('../../../features/organization/pages/OwnerFrameworkDetailPage'), 'OwnerFrameworkDetailPage');
const RequirementSetListPage = lazyPage(() => import('../../../features/competency/pages/RequirementSetListPage'), 'RequirementSetListPage');
const PositionRequirementsPage = lazyPage(() => import('../../../features/competency/pages/PositionRequirementsPage'), 'PositionRequirementsPage');
const RequirementHistoryPage = lazyPage(() => import('../../../features/competency/pages/RequirementHistoryPage'), 'RequirementHistoryPage');
const WorkforceCompetencyMatrixPage = lazyPage(() => import('../../../features/competency/pages/WorkforceCompetencyMatrixPage'), 'WorkforceCompetencyMatrixPage');
const EmployeeCompetencyProfilePage = lazyPage(() => import('../../../features/competency/pages/EmployeeCompetencyProfilePage'), 'EmployeeCompetencyProfilePage');
const OwnerCapabilityGapPage = lazyPage(() => import('../../../features/organization/pages/OwnerCapabilityGapPage'), 'OwnerCapabilityGapPage');
const SkillGapDetailPage = lazyPage(() => import('../../../features/intelligence/pages/SkillGapDetailPage'), 'SkillGapDetailPage');
const RecommendationReviewPage = lazyPage(() => import('../../../features/intelligence/pages/RecommendationReviewPage'), 'RecommendationReviewPage');
const CourseAssignmentPage = lazyPage(() => import('../../../features/assignments/pages/CourseAssignmentPage'), 'CourseAssignmentPage');
const TrainingMonitorPage = lazyPage(() => import('../../../features/assignments/pages/TrainingMonitorPage'), 'TrainingMonitorPage');
const AssessmentResultsOverviewPage = lazyPage(() => import('../../../features/assignments/pages/AssessmentResultsOverviewPage'), 'AssessmentResultsOverviewPage');
const InternalCourseListPage = lazyPage(() => import('../../../features/assignments/pages/InternalCourseListPage'), 'InternalCourseListPage');
const InternalCourseEditorPage = lazyPage(() => import('../../../features/assignments/pages/InternalCourseEditorPage'), 'InternalCourseEditorPage');
const SubscriptionOverviewPage = lazyPage(() => import('../../../features/billing/pages/SubscriptionOverviewPage'), 'SubscriptionOverviewPage');
const BillingInvoicesPage = lazyPage(() => import('../../../features/billing/pages/BillingInvoicesPage'), 'BillingInvoicesPage');
const UsagePage = lazyPage(() => import('../../../features/billing/pages/UsagePage'), 'UsagePage');
const OrganizationSettingsPage = lazyPage(() => import('../../../features/organization/pages/OrganizationSettingsPage'), 'OrganizationSettingsPage');
const AuditLogPage = lazyPage(() => import('../../../features/organization/pages/AuditLogPage'), 'AuditLogPage');
const OwnerCourseCatalogPage = lazyPage(() => import('../../../features/organization/pages/OwnerCourseCatalogPage'), 'OwnerCourseCatalogPage');
const OwnerCourseDetailPage = lazyPage(() => import('../../../features/organization/pages/OwnerCourseDetailPage'), 'OwnerCourseDetailPage');
const CourseCheckoutPage = lazyPage(() => import('../../../features/organization/pages/CourseCheckoutPage'), 'CourseCheckoutPage');
const InternalCourseDetailPage = lazyPage(() => import('../../../features/courses/pages/InternalCourseDetailPage'), 'InternalCourseDetailPage');
const OwnerTrainingBatchesPage = lazyPage(() => import('../../../features/organization/pages/OwnerTrainingBatchesPage'), 'OwnerTrainingBatchesPage');
const OwnerNewTrainingBatchPage = lazyPage(() => import('../../../features/organization/pages/OwnerNewTrainingBatchPage'), 'OwnerNewTrainingBatchPage');
const OwnerTrainingBatchDetailPage = lazyPage(() => import('../../../features/organization/pages/OwnerTrainingBatchDetailPage'), 'OwnerTrainingBatchDetailPage');
const OwnerCycleReportPage = lazyPage(() => import('../../../features/organization/pages/OwnerCycleReportPage'), 'OwnerCycleReportPage');
const OwnerSetupBlueprintPage = lazyPage(() => import('../../../features/organization/pages/OwnerSetupBlueprintPage'), 'OwnerSetupBlueprintPage');
const TrialProgramPage = lazyPage(() => import('../../../features/trial-program/pages/TrialProgramPage'), 'TrialProgramPage');
const OwnerTrialLearningPage = lazyPage(() => import('../../../features/trial-program/pages/OwnerTrialLearningPage'), 'OwnerTrialLearningPage');
const OwnerCertificatesPage = lazyPage(() => import('../../../features/organization/pages/OwnerCertificatesPage'), 'OwnerCertificatesPage');
const OwnerCertificateDetailPage = lazyPage(() => import('../../../features/organization/pages/OwnerCertificateDetailPage'), 'OwnerCertificateDetailPage');

/** OWNER page registry mapping screen IDs (OW-*) to components. */
export const OWNER_PAGES: PageRegistry = {
  // v2.1 IDs
  'OW-01': OwnerOverviewPage,
  'OW-02': OwnerMembersPage,
  'OW-03': OwnerMemberDetailPage,
  'OW-05': OwnerSetupBlueprintPage,
  'OW-T1': TrialProgramPage,
  'OW-T2': OwnerTrialLearningPage,
  'OW-06': DepartmentListPage,
  'OW-07': DepartmentDetailPage,
  'OW-09': PositionListPage,

  'OW-10': PositionDetailPage,
  'OW-12': JobGradeConfigPage,

  'OW-13': RolesAccessPage,
  'OW-14': OwnerFrameworkPage,
  'OW-15': OwnerFrameworkDetailPage,
  'OW-16': RequirementSetListPage,
  'OW-17': PositionRequirementsPage,
  'OW-18': RequirementHistoryPage,
  'OW-19': WorkforceCompetencyMatrixPage,
  'OW-20': EmployeeCompetencyProfilePage,
  'OW-21': OwnerCapabilityGapPage,
  'OW-22': SkillGapDetailPage,
  'OW-23': OwnerCourseCatalogPage,
  'OW-24': OwnerCourseDetailPage,
  'OW-CHECKOUT': CourseCheckoutPage,
  'OW-25': OwnerTrainingBatchesPage,
  'OW-26': OwnerNewTrainingBatchPage,
  'OW-27': OwnerTrainingBatchDetailPage,
  'OW-28': CourseAssignmentPage,
  'OW-29': RecommendationReviewPage,
  'OW-30': TrainingMonitorPage,
  'OW-31': InternalCourseListPage,
  'OW-32': InternalCourseEditorPage,
  'OW-33': InternalCourseDetailPage,
  'OW-34': AssessmentResultsOverviewPage,
  'OW-46': OwnerCertificatesPage,
  'OW-47': OwnerCertificateDetailPage,
  'OW-40': OwnerCycleReportPage,
  'OW-41': SubscriptionOverviewPage,
  'OW-42': UsagePage,
  'OW-43': BillingInvoicesPage,
  'OW-44': OrganizationSettingsPage,
  'OW-45': AuditLogPage,
};
