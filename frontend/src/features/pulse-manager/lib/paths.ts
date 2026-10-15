import { findEnterpriseScreen } from '@/lib/screens/enterprise';

/** Đường dẫn lấy từ sitemap (lib/screens/enterprise), không viết tay: đổi path ở sitemap là đủ. */
function path(screenId: string): string {
  const screen = findEnterpriseScreen(screenId);
  if (!screen) throw new Error(`Unknown screen ${screenId}`);
  return screen.path;
}

export const MANAGER_PATHS = {
  overview: path('MG-01'),
  members: path('MG-02'),
  member: (employeeId: string) => path('MG-03').replace(':id', encodeURIComponent(employeeId)),
  matrix: path('MG-04'),
  capability: path('MG-05'),
  training: path('MG-06'),
  trainingDetail: (assignmentId: string) => path('MG-07').replace(':assignmentId', encodeURIComponent(assignmentId)),
  tasks: path('MG-08'),
  newTask: path('MG-09'),
  evidence: path('MG-11'),
  evidenceDetail: (submissionId: string) => path('MG-12').replace(':submissionId', encodeURIComponent(submissionId)),
  finalReviews: path('MG-13'),
  reports: path('MG-14'),
  framework: path('MG-15'),
  activity: path('SHR-03'),
} as const;
