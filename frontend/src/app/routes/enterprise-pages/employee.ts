import type { PageRegistry } from '../build-routes';

import { PersonalDashboardPage, PersonalLearningPathPage } from '../../../features/manager/pages/ManagerPageSwitch';
import { MyCompetencyProfilePage } from '../../../features/employee/pages/MyCompetencyProfilePage';
import { MySkillGapPage } from '../../../features/employee/pages/MySkillGapPage';
import { EvidencePortfolioPage } from '../../../features/employee/pages/EvidencePortfolioPage';
import { MyLearningPage } from '../../../features/employee/pages/MyLearningPage';
import { CourseDetailPage } from '../../../features/learning/pages/CourseDetailPage';
import { LessonViewerPage } from '../../../features/learning/pages/LessonViewerPage';
import { MyAssessmentsPage } from '../../../features/learning/pages/MyAssessmentsPage';
import { AssessmentIntroPage } from '../../../features/learning/pages/AssessmentIntroPage';
import { AssessmentAttemptPage } from '../../../features/learning/pages/AssessmentAttemptPage';
import { AssessmentResultPage } from '../../../features/learning/pages/AssessmentResultPage';
import { AssessmentHistoryPage } from '../../../features/learning/pages/AssessmentHistoryPage';
import { MyPracticalTasksPage } from '../../../features/employee/pages/MyPracticalTasksPage';
import { EmployeeTaskDetailPage } from '../../../features/employee/pages/EmployeeTaskDetailPage';
import { SubmitEvidencePage } from '../../../features/employee/pages/SubmitEvidencePage';
import { TaskFeedbackPage } from '../../../features/employee/pages/TaskFeedbackPage';
import { MyCertificatesPage } from '../../../features/employee/pages/MyCertificatesPage';

/** EMPLOYEE page registry mapping screen IDs (EM-*) and legacy IDs (EMP-*) to components. */
export const EMPLOYEE_PAGES: PageRegistry = {
  // v2.1 IDs
  'EM-01': PersonalDashboardPage,
  'EM-02': MyCompetencyProfilePage,
  'EM-03': MySkillGapPage,
  'EM-04': EvidencePortfolioPage,
  'EM-05': PersonalLearningPathPage,
  'EM-06': MyLearningPage,
  'EM-07': CourseDetailPage,
  'EM-08': LessonViewerPage,
  'EM-09': MyAssessmentsPage,
  'EM-10': AssessmentIntroPage,
  'EM-11': AssessmentAttemptPage,
  'EM-12': AssessmentResultPage,
  'EM-13': AssessmentHistoryPage,
  'EM-14': MyPracticalTasksPage,
  'EM-15': EmployeeTaskDetailPage,
  'EM-16': SubmitEvidencePage,
  'EM-17': TaskFeedbackPage,
  'EM-18': MyCertificatesPage,

  // Legacy EMP IDs for backward compatibility
  'EMP-01': PersonalDashboardPage,
  'EMP-02': MyCompetencyProfilePage,
  'EMP-03': MySkillGapPage,
  'EMP-04': MyLearningPage,
  'EMP-05': CourseDetailPage,
  'EMP-06': LessonViewerPage,
  'EMP-07': AssessmentIntroPage,
  'EMP-08': AssessmentAttemptPage,
  'EMP-09': AssessmentResultPage,
  'EMP-10': AssessmentHistoryPage,
  'EMP-11': MyPracticalTasksPage,
  'EMP-12': SubmitEvidencePage,
  'EMP-13': TaskFeedbackPage,
  'EMP-14': EvidencePortfolioPage,
  'EMP-15': MyCertificatesPage,
};
