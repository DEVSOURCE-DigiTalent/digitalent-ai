import type { PageRegistry } from '../build-routes';

import { PracticalTaskListPage } from '../../../features/tasks/pages/PracticalTaskListPage';
import { CreatePracticalTaskPage } from '../../../features/tasks/pages/CreatePracticalTaskPage';
import { TaskDetailPage } from '../../../features/tasks/pages/TaskDetailPage';
import { ReviewQueuePage } from '../../../features/tasks/pages/ReviewQueuePage';
import { EvaluateEvidencePage } from '../../../features/tasks/pages/EvaluateEvidencePage';
import { AccountProfilePage } from '../../../features/account/pages/AccountProfilePage';
import { SecuritySettingsPage } from '../../../features/account/pages/SecuritySettingsPage';
import { NotificationsPage } from '../../../features/notifications/pages/NotificationsPage';

/** Shared Work (Practical tasks, evidence review) and Shared Topbar/Account pages. */
export const WORK_PAGES: PageRegistry = {
  // Shared Work (OW-35..39 / MG-08..12)
  'OW-35': PracticalTaskListPage,
  'MG-08': PracticalTaskListPage,

  'OW-36': CreatePracticalTaskPage,
  'MG-09': CreatePracticalTaskPage,

  'OW-37': TaskDetailPage,
  'MG-10': TaskDetailPage,

  'OW-38': ReviewQueuePage,
  'MG-11': ReviewQueuePage,

  'OW-39': EvaluateEvidencePage,
  'MG-12': EvaluateEvidencePage,

  // Shared Account & Notifications
  'SHR-01': AccountProfilePage,
  'SHR-02': SecuritySettingsPage,
  'SHR-03': NotificationsPage,
};
