import type { PageRegistry } from '../build-routes';

import { TrialAwareManagerDashboardPage } from '../../../features/experience/enterprise-trial/TrialAwareDashboardPages';
import { TeamMembersPage } from '../../../features/manager/pages/team/TeamMembersPage';
import { TeamMemberDetailPage } from '../../../features/manager/pages/team/TeamMemberDetailPage';
import { TeamCompetencyMatrixPage } from '../../../features/manager/pages/team/TeamCompetencyMatrixPage';
import { TrainingAssignmentDetailPage } from '../../../features/manager/pages/team/TrainingAssignmentDetailPage';
import { PulseFinalReviewsPage } from '../../../features/pulse-manager/pages/PulseFinalReviewsPage';
import { ManagerCapabilityPage } from '../../../features/pulse-manager/pages/ManagerCapabilityPage';
import { ManagerTeamTrainingPage } from '../../../features/pulse-manager/pages/ManagerTeamTrainingPage';
import { ManagerCycleReportPage } from '../../../features/pulse-manager/pages/ManagerCycleReportPage';
import { ManagerFrameworkPage } from '../../../features/pulse-manager/pages/ManagerFrameworkPage';

/** MANAGER page registry mapping screen IDs (MG-*) to components. Pulse pages: features/pulse-manager. */
export const MANAGER_PAGES: PageRegistry = {
  // v2.1 IDs
  'MG-01': TrialAwareManagerDashboardPage,
  'MG-02': TeamMembersPage,
  'MG-03': TeamMemberDetailPage,
  'MG-04': TeamCompetencyMatrixPage,
  'MG-05': ManagerCapabilityPage,
  'MG-06': ManagerTeamTrainingPage,
  'MG-07': TrainingAssignmentDetailPage,
  'MG-13': PulseFinalReviewsPage,
  'MG-14': ManagerCycleReportPage,
  'MG-15': ManagerFrameworkPage,
};
