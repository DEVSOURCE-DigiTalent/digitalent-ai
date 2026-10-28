import type { PageRegistry } from '../build-routes';
import { lazyPage } from '../lazy-page';

const PulseTodayPage = lazyPage(() => import('../../../features/pulse-employee/pages/PulseTodayPage'), 'PulseTodayPage');
const PulsePathPage = lazyPage(() => import('../../../features/pulse-employee/pages/PulsePathPage'), 'PulsePathPage');
const PulsePracticePage = lazyPage(() => import('../../../features/pulse-employee/pages/PulsePracticePage'), 'PulsePracticePage');
const PulseCoursePage = lazyPage(() => import('../../../features/pulse-employee/pages/PulseCoursePage'), 'PulseCoursePage');
const PulseModulePage = lazyPage(() => import('../../../features/pulse-employee/pages/PulseModulePage'), 'PulseModulePage');
const PulseFinalPage = lazyPage(() => import('../../../features/pulse-employee/pages/PulseFinalPage'), 'PulseFinalPage');
const PulsePreAssessmentPage = lazyPage(() => import('../../../features/pulse-employee/pages/PulsePreAssessmentPage'), 'PulsePreAssessmentPage');
const PulseOutcomeDetailPage = lazyPage(() => import('../../../features/pulse-employee/pages/PulseOutcomesPage'), 'PulseOutcomeDetailPage');
const PulseOutcomesPage = lazyPage(() => import('../../../features/pulse-employee/pages/PulseOutcomesPage'), 'PulseOutcomesPage');
const PulseActivityPage = lazyPage(() => import('../../../features/pulse-employee/pages/PulseActivityPage'), 'PulseActivityPage');
const PulseProfilePage = lazyPage(() => import('../../../features/pulse-employee/pages/PulseProfilePage'), 'PulseProfilePage');
const TrialExamPage = lazyPage(() => import('../../../features/trial-program/pages/TrialTestPage'), 'TrialExamPage');
const TrialTestPage = lazyPage(() => import('../../../features/trial-program/pages/TrialTestPage'), 'TrialTestPage');

/** Cổng nhân viên Pulse — trang theo screen ID (lib/screens/enterprise/employee.ts). */
export const EMPLOYEE_PAGES: PageRegistry = {
  'EM-01': PulseTodayPage,
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
  'EM-T1': TrialTestPage,
  'EM-T2': TrialExamPage,
};
