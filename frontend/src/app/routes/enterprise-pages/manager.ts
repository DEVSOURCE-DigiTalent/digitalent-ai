import type { PageRegistry } from '../build-routes';

import { TeamCapabilityDashboardPage } from '../../../features/team/pages/TeamCapabilityDashboardPage';
import { TeamMembersPage } from '../../../features/team/pages/TeamMembersPage';
import { TeamMemberDetailPage } from '../../../features/team/pages/TeamMemberDetailPage';
import { TeamCompetencyMatrixPage } from '../../../features/team/pages/TeamCompetencyMatrixPage';
import { TeamSkillGapAnalyticsPage } from '../../../features/team/pages/TeamSkillGapAnalyticsPage';
import { TrainingMonitorPage } from '../../../features/assignments/pages/TrainingMonitorPage';
import { TrainingAssignmentDetailPage } from '../../../features/team/pages/TrainingAssignmentDetailPage';

/** MANAGER page registry mapping screen IDs (MG-*) to components. */
export const MANAGER_PAGES: PageRegistry = {
  // v2.1 IDs
  'MG-01': TeamCapabilityDashboardPage,
  'MG-02': TeamMembersPage,
  'MG-03': TeamMemberDetailPage,
  'MG-04': TeamCompetencyMatrixPage,
  'MG-05': TeamSkillGapAnalyticsPage,
  'MG-06': TrainingMonitorPage,
  'MG-07': TrainingAssignmentDetailPage,
};
