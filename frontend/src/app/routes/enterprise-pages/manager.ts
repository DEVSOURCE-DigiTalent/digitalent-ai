import type { PageRegistry } from '../build-routes';
import { lazyPage } from '../lazy-page';

const ManagerOverviewPage = lazyPage(() => import('../../../features/pulse-manager/pages/ManagerOverviewPage'), 'ManagerOverviewPage');
const TeamMembersPage = lazyPage(() => import('../../../features/manager/pages/team/TeamMembersPage'), 'TeamMembersPage');
const TeamMemberDetailPage = lazyPage(() => import('../../../features/manager/pages/team/TeamMemberDetailPage'), 'TeamMemberDetailPage');
const TeamCompetencyMatrixPage = lazyPage(() => import('../../../features/manager/pages/team/TeamCompetencyMatrixPage'), 'TeamCompetencyMatrixPage');
const TrainingAssignmentDetailPage = lazyPage(() => import('../../../features/manager/pages/team/TrainingAssignmentDetailPage'), 'TrainingAssignmentDetailPage');
const PulseFinalReviewsPage = lazyPage(() => import('../../../features/pulse-manager/pages/PulseFinalReviewsPage'), 'PulseFinalReviewsPage');
const ManagerCapabilityPage = lazyPage(() => import('../../../features/pulse-manager/pages/ManagerCapabilityPage'), 'ManagerCapabilityPage');
const ManagerTeamTrainingPage = lazyPage(() => import('../../../features/pulse-manager/pages/ManagerTeamTrainingPage'), 'ManagerTeamTrainingPage');
const ManagerCycleReportPage = lazyPage(() => import('../../../features/pulse-manager/pages/ManagerCycleReportPage'), 'ManagerCycleReportPage');
const ManagerFrameworkPage = lazyPage(() => import('../../../features/pulse-manager/pages/ManagerFrameworkPage'), 'ManagerFrameworkPage');

/** MANAGER page registry mapping screen IDs (MG-*) to components. Pulse pages: features/pulse-manager. */
export const MANAGER_PAGES: PageRegistry = {
  // v2.1 IDs
  'MG-01': ManagerOverviewPage,
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
