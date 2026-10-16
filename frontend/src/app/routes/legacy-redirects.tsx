import { Navigate, useLocation, useParams, type RouteObject } from 'react-router-dom';

/**
 * Redirects to target path while preserving any query parameters and hash.
 */
export function RedirectWithQuery({ to }: { to: string }) {
  const location = useLocation();
  return <Navigate to={`${to}${location.search}${location.hash}`} replace />;
}

/**
 * Handles wildcard /learn/* tail preserving: /learn/courses/42 -> /personal/courses/42
 */
function LegacyLearnRedirect() {
  const { '*': rest } = useParams();
  const location = useLocation();
  const path = rest ? `/personal/${rest}` : '/personal';
  return <Navigate to={`${path}${location.search}${location.hash}`} replace />;
}

/**
 * Redirects paths with an :id parameter while preserving query parameters and hash.
 */
function LegacyParamRedirect({ toPrefix }: { toPrefix: string }) {
  const { id } = useParams();
  const location = useLocation();
  return <Navigate to={`${toPrefix}/${id || ''}${location.search}${location.hash}`} replace />;
}

/**
 * Legacy URL redirect routes (UI/UX spec v2.1 §3.7, §4).
 * Preserves query string and deep link context across platform evolutions.
 */
export const legacyRedirectRoutes: RouteObject[] = [
  // ── Pre-restructure root / general redirects ──
  { path: '/learn/*', element: <LegacyLearnRedirect /> },
  { path: '/dashboard', element: <RedirectWithQuery to="/enterprise" /> },
  { path: '/my-dashboard', element: <RedirectWithQuery to="/enterprise" /> },
  { path: '/admin/*', element: <RedirectWithQuery to="/enterprise" /> },
  { path: '/courses', element: <RedirectWithQuery to="/enterprise" /> },

  // ── Organization legacy paths ──
  { path: '/organization/departments', element: <RedirectWithQuery to="/enterprise/departments" /> },
  { path: '/organization/positions', element: <RedirectWithQuery to="/enterprise/positions" /> },
  { path: '/organization/employees', element: <RedirectWithQuery to="/enterprise/members" /> },
  { path: '/competency-framework/*', element: <RedirectWithQuery to="/enterprise/framework" /> },

  // ── Enterprise renamed routes ──
  { path: '/enterprise/overview', element: <RedirectWithQuery to="/enterprise/dashboard" /> },
  { path: '/enterprise/me-dashboard', element: <RedirectWithQuery to="/enterprise/me" /> },
  { path: '/enterprise/analytics', element: <RedirectWithQuery to="/enterprise/reports" /> },
  { path: '/enterprise/capability', element: <RedirectWithQuery to="/enterprise/dashboard" /> },
  { path: '/enterprise/workforce', element: <RedirectWithQuery to="/enterprise/members" /> },
  { path: '/enterprise/workforce/:id', element: <LegacyParamRedirect toPrefix="/enterprise/members" /> },
  { path: '/enterprise/billing', element: <RedirectWithQuery to="/enterprise/subscription" /> },
  { path: '/enterprise/billing/*', element: <RedirectWithQuery to="/enterprise/subscription" /> },
  { path: '/enterprise/team-overview', element: <RedirectWithQuery to="/enterprise/team" /> },
  { path: '/enterprise/team-capability', element: <RedirectWithQuery to="/enterprise/team/competency" /> },
  { path: '/enterprise/team-members', element: <RedirectWithQuery to="/enterprise/team/members" /> },
  // EM-01..EM-18 cũ được thay bằng cổng nhân viên Pulse (lib/screens/enterprise/employee.ts): giữ các liên kết cũ.
  { path: '/enterprise/my-learning', element: <RedirectWithQuery to="/enterprise/me/path" /> },
  { path: '/enterprise/me/learning', element: <RedirectWithQuery to="/enterprise/me/path" /> },
  { path: '/enterprise/my-competency', element: <RedirectWithQuery to="/enterprise/me/path" /> },
  { path: '/enterprise/my-skill-gap', element: <RedirectWithQuery to="/enterprise/me/path" /> },
  { path: '/enterprise/my-tasks', element: <RedirectWithQuery to="/enterprise/me/practice" /> },
  { path: '/enterprise/my-achievements', element: <RedirectWithQuery to="/enterprise/me/outcomes" /> },
  { path: '/enterprise/me/certificates', element: <RedirectWithQuery to="/enterprise/me/outcomes" /> },
  { path: '/enterprise/me/competency', element: <RedirectWithQuery to="/enterprise/me/path" /> },
  { path: '/enterprise/me/skill-gap', element: <RedirectWithQuery to="/enterprise/me/path" /> },
  { path: '/enterprise/me/learning-path', element: <RedirectWithQuery to="/enterprise/me/path" /> },
  { path: '/enterprise/me/courses', element: <RedirectWithQuery to="/enterprise/me/path" /> },
  { path: '/enterprise/me/courses/:id/lessons/:lessonId', element: <LegacyParamRedirect toPrefix="/enterprise/me/courses" /> },
  { path: '/enterprise/me/evidence', element: <RedirectWithQuery to="/enterprise/me/outcomes" /> },
  { path: '/enterprise/me/achievements', element: <RedirectWithQuery to="/enterprise/me/outcomes" /> },
  // Bài kiểm tra đầu vào đã bỏ: mỗi khóa có bài đánh giá trước khi học riêng, mở từ trang Hôm nay.
  { path: '/enterprise/me/baseline', element: <RedirectWithQuery to="/enterprise/me" /> },
  { path: '/enterprise/me/assessments', element: <RedirectWithQuery to="/enterprise/me" /> },
  { path: '/enterprise/me/assessments/*', element: <RedirectWithQuery to="/enterprise/me" /> },
  { path: '/enterprise/me/tasks', element: <RedirectWithQuery to="/enterprise/me/practice" /> },
  { path: '/enterprise/me/tasks/*', element: <RedirectWithQuery to="/enterprise/me/practice" /> },
  { path: '/enterprise/positions/grades', element: <RedirectWithQuery to="/enterprise/positions" /> },
  { path: '/enterprise/evidence/:id', element: <RedirectWithQuery to="/enterprise/reviews" /> },
  { path: '/enterprise/reviews/evidence/:id', element: <RedirectWithQuery to="/enterprise/reviews" /> },

  // ── Platform legacy paths ──
  { path: '/platform/courses', element: <RedirectWithQuery to="/platform/versions" /> },
  { path: '/platform/assessment-bank', element: <RedirectWithQuery to="/platform/versions" /> },
];

