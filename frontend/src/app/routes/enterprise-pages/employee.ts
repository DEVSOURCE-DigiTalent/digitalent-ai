import type { PageRegistry } from '../build-routes';

import { TrialAwarePulseTodayPage } from '../../../features/experience/enterprise-trial/TrialAwareDashboardPages';
import { PulsePathPage } from '../../../features/pulse-employee/pages/PulsePathPage';
import { PulsePracticePage } from '../../../features/pulse-employee/pages/PulsePracticePage';
import { PulseCoursePage } from '../../../features/pulse-employee/pages/PulseCoursePage';
import { PulseModulePage } from '../../../features/pulse-employee/pages/PulseModulePage';
import { PulseFinalPage } from '../../../features/pulse-employee/pages/PulseFinalPage';
import { PulsePreAssessmentPage } from '../../../features/pulse-employee/pages/PulsePreAssessmentPage';
import { PulseOutcomeDetailPage, PulseOutcomesPage } from '../../../features/pulse-employee/pages/PulseOutcomesPage';
import { PulseActivityPage } from '../../../features/pulse-employee/pages/PulseActivityPage';
import { PulseProfilePage } from '../../../features/pulse-employee/pages/PulseProfilePage';

/** Cổng nhân viên Pulse — trang theo screen ID (lib/screens/enterprise/employee.ts). */
export const EMPLOYEE_PAGES: PageRegistry = {
  'EM-01': TrialAwarePulseTodayPage,
  'EM-02': PulsePathPage,
  'EM-03': PulsePracticePage,
  'EM-05': PulseCoursePage,
  'EM-06': PulseModulePage,
  'EM-07': PulseFinalPage,
  'EM-08': PulseOutcomesPage,
  'EM-09': PulseOutcomeDetailPage,
  'EM-10': PulseActivityPage,
  'EM-11': PulseProfilePage,
  'EM-12': PulsePreAssessmentPage,
};
