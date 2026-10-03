import type { PageRegistry } from '../build-routes';

import { OrganizationOverviewPage } from '../../../features/organization/pages/OrganizationOverviewPage';
import { MembersPage } from '../../../features/members/pages/MembersPage';
import { MemberDetailPage } from '../../../features/members/pages/MemberDetailPage';
import { DepartmentListPage } from '../../../features/organization/pages/DepartmentListPage';
import { DepartmentDetailPage } from '../../../features/organization/pages/DepartmentDetailPage';
import { PositionListPage } from '../../../features/organization/pages/PositionListPage';
import { PositionDetailPage } from '../../../features/organization/pages/PositionDetailPage';
import { JobGradeConfigPage } from '../../../features/organization/pages/JobGradeConfigPage';
import { RolesAccessPage } from '../../../features/members/pages/RolesAccessPage';


import { CompetencyFrameworkPage } from '../../../features/competency/pages/CompetencyFrameworkPage';
import { CompetencyDetailPage } from '../../../features/competency/pages/CompetencyDetailPage';
import { RequirementSetListPage } from '../../../features/competency/pages/RequirementSetListPage';
import { PositionRequirementsPage } from '../../../features/competency/pages/PositionRequirementsPage';
import { RequirementHistoryPage } from '../../../features/competency/pages/RequirementHistoryPage';
import { WorkforceCompetencyMatrixPage } from '../../../features/competency/pages/WorkforceCompetencyMatrixPage';
import { EmployeeCompetencyProfilePage } from '../../../features/competency/pages/EmployeeCompetencyProfilePage';
import { SkillGapAnalyticsPage } from '../../../features/intelligence/pages/SkillGapAnalyticsPage';
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
import { StandardCourseCatalogPage } from '../../../features/courses/pages/StandardCourseCatalogPage';
import { StandardCourseDetailPage } from '../../../features/courses/pages/StandardCourseDetailPage';
import { InternalCourseDetailPage } from '../../../features/courses/pages/InternalCourseDetailPage';
import { TrainingBatchListPage } from '../../../features/training/pages/TrainingBatchListPage';
import { TrainingBatchWizardPage } from '../../../features/training/pages/TrainingBatchWizardPage';
import { TrainingBatchDetailPage } from '../../../features/training/pages/TrainingBatchDetailPage';
import { ReportsPage } from '../../../features/reports/pages/ReportsPage';

/** OWNER page registry mapping screen IDs (OW-*) to components. */
export const OWNER_PAGES: PageRegistry = {
  // v2.1 IDs
  'OW-01': OrganizationOverviewPage,
  'OW-02': MembersPage,
  'OW-03': MemberDetailPage,
  'OW-06': DepartmentListPage,
  'OW-07': DepartmentDetailPage,
  'OW-09': PositionListPage,

  'OW-10': PositionDetailPage,
  'OW-12': JobGradeConfigPage,

  'OW-13': RolesAccessPage,
  'OW-14': CompetencyFrameworkPage,
  'OW-15': CompetencyDetailPage,
  'OW-16': RequirementSetListPage,
  'OW-17': PositionRequirementsPage,
  'OW-18': RequirementHistoryPage,
  'OW-19': WorkforceCompetencyMatrixPage,
  'OW-20': EmployeeCompetencyProfilePage,
  'OW-21': SkillGapAnalyticsPage,
  'OW-22': SkillGapDetailPage,
  'OW-23': StandardCourseCatalogPage,
  'OW-24': StandardCourseDetailPage,
  'OW-25': TrainingBatchListPage,
  'OW-26': TrainingBatchWizardPage,
  'OW-27': TrainingBatchDetailPage,
  'OW-28': CourseAssignmentPage,
  'OW-29': RecommendationReviewPage,
  'OW-30': TrainingMonitorPage,
  'OW-31': InternalCourseListPage,
  'OW-32': InternalCourseEditorPage,
  'OW-33': InternalCourseDetailPage,
  'OW-34': AssessmentResultsOverviewPage,
  'OW-40': ReportsPage,
  'OW-41': SubscriptionOverviewPage,
  'OW-42': UsagePage,
  'OW-43': BillingInvoicesPage,
  'OW-44': OrganizationSettingsPage,
  'OW-45': AuditLogPage,
};
