import type { PageRegistry } from '../build-routes';

import { OwnerOverviewPage } from '../../../features/organization/pages/OwnerOverviewPage';
import { OwnerMembersPage } from '../../../features/organization/pages/OwnerMembersPage';
import { OwnerMemberDetailPage } from '../../../features/organization/pages/OwnerMemberDetailPage';
import { DepartmentListPage } from '../../../features/organization/pages/DepartmentListPage';
import { DepartmentDetailPage } from '../../../features/organization/pages/DepartmentDetailPage';
import { PositionListPage } from '../../../features/organization/pages/PositionListPage';
import { PositionDetailPage } from '../../../features/organization/pages/PositionDetailPage';
import { JobGradeConfigPage } from '../../../features/organization/pages/JobGradeConfigPage';
import { RolesAccessPage } from '../../../features/members/pages/RolesAccessPage';


import { OwnerFrameworkPage } from '../../../features/organization/pages/OwnerFrameworkPage';
import { OwnerFrameworkDetailPage } from '../../../features/organization/pages/OwnerFrameworkDetailPage';
import { RequirementSetListPage } from '../../../features/competency/pages/RequirementSetListPage';
import { PositionRequirementsPage } from '../../../features/competency/pages/PositionRequirementsPage';
import { RequirementHistoryPage } from '../../../features/competency/pages/RequirementHistoryPage';
import { WorkforceCompetencyMatrixPage } from '../../../features/competency/pages/WorkforceCompetencyMatrixPage';
import { EmployeeCompetencyProfilePage } from '../../../features/competency/pages/EmployeeCompetencyProfilePage';
import { OwnerCapabilityGapPage } from '../../../features/organization/pages/OwnerCapabilityGapPage';
import { SkillGapDetailPage } from '../../../features/intelligence/pages/SkillGapDetailPage';
import { RecommendationReviewPage } from '../../../features/intelligence/pages/RecommendationReviewPage';
import { CourseAssignmentPage } from '../../../features/assignments/pages/CourseAssignmentPage';
import { TrainingMonitorPage } from '../../../features/assignments/pages/TrainingMonitorPage';
import { AssessmentResultsOverviewPage } from '../../../features/assignments/pages/AssessmentResultsOverviewPage';
import { InternalCourseListPage } from '../../../features/assignments/pages/InternalCourseListPage';
import { InternalCourseEditorPage } from '../../../features/assignments/pages/InternalCourseEditorPage';
import { SubscriptionOverviewPage } from '../../../features/billing/pages/SubscriptionOverviewPage';
import { BillingInvoicesPage } from '../../../features/billing/pages/BillingInvoicesPage';
import { UsagePage } from '../../../features/billing/pages/UsagePage';
import { OrganizationSettingsPage } from '../../../features/organization/pages/OrganizationSettingsPage';
import { AuditLogPage } from '../../../features/organization/pages/AuditLogPage';
import { OwnerCourseCatalogPage } from '../../../features/organization/pages/OwnerCourseCatalogPage';
import { OwnerCourseDetailPage } from '../../../features/organization/pages/OwnerCourseDetailPage';
import { InternalCourseDetailPage } from '../../../features/courses/pages/InternalCourseDetailPage';
import { OwnerTrainingBatchesPage } from '../../../features/organization/pages/OwnerTrainingBatchesPage';
import { OwnerNewTrainingBatchPage } from '../../../features/organization/pages/OwnerNewTrainingBatchPage';
import { OwnerTrainingBatchDetailPage } from '../../../features/organization/pages/OwnerTrainingBatchDetailPage';
import { OwnerCycleReportPage } from '../../../features/organization/pages/OwnerCycleReportPage';
import { OwnerSetupBlueprintPage } from '../../../features/organization/pages/OwnerSetupBlueprintPage';
import { OwnerCertificatesPage } from '../../../features/organization/pages/OwnerCertificatesPage';
import { OwnerCertificateDetailPage } from '../../../features/organization/pages/OwnerCertificateDetailPage';

/** OWNER page registry mapping screen IDs (OW-*) to components. */
export const OWNER_PAGES: PageRegistry = {
  // v2.1 IDs
  'OW-01': OwnerOverviewPage,
  'OW-02': OwnerMembersPage,
  'OW-03': OwnerMemberDetailPage,
  'OW-05': OwnerSetupBlueprintPage,
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
