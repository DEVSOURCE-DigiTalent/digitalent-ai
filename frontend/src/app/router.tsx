import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { AuthGuard } from '../components/guards/AuthGuard';
import { RequirePermission } from '../components/guards/RequirePermission';
import { RequireRole } from '../components/guards/RequireRole';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { NotFoundPage } from '../features/auth/pages/NotFoundPage';

// Admin
import { AdminDashboardPage } from '../features/admin/pages/AdminDashboardPage';
import { UserManagementPage } from '../features/admin/pages/UserManagementPage';
import { RolePermissionPage } from '../features/admin/pages/RolePermissionPage';
import { SystemConfigPage } from '../features/admin/pages/SystemConfigPage';
import { AuditLogPage } from '../features/admin/pages/AuditLogPage';

// Organization
import { DepartmentListPage } from '../features/organization/pages/DepartmentListPage';
import { PositionListPage } from '../features/organization/pages/PositionListPage';
import { EmployeeListPage } from '../features/organization/pages/EmployeeListPage';

// Competency
import { CompetencyFrameworkPage } from '../features/competency/pages/CompetencyFrameworkPage';
import { PositionRequirementsPage } from '../features/competency/pages/PositionRequirementsPage';

// Course & Learning
import { CourseListPage } from '../features/course/pages/CourseListPage';
import { CourseAssignmentPage } from '../features/course/pages/CourseAssignmentPage';

// Assessment
import { QuestionBankPage } from '../features/assessment/pages/QuestionBankPage';
import { AssessmentListPage } from '../features/assessment/pages/AssessmentListPage';
import { LearnerResultsPage } from '../features/assessment/pages/LearnerResultsPage';

// Certificate
import { CertificateListPage } from '../features/certificate/pages/CertificateListPage';
import { CertificateVerificationPage } from '../features/certificate/pages/CertificateVerificationPage';

// Task
import { TaskBoardPage } from '../features/task/pages/TaskBoardPage';

// Intelligence
import { SkillGapPage } from '../features/intelligence/pages/SkillGapPage';
import { TrainingRiskPage } from '../features/intelligence/pages/TrainingRiskPage';
import { ReadinessPage } from '../features/intelligence/pages/ReadinessPage';

// Notification
import { NotificationCenterPage } from '../features/notification/pages/NotificationCenterPage';

// Employee self-service
import { MyProfilePage } from '../features/employee/pages/MyProfilePage';
import { MyLearningPage } from '../features/employee/pages/MyLearningPage';
import { MyAssessmentsPage } from '../features/employee/pages/MyAssessmentsPage';
import { MyCertificatesPage } from '../features/employee/pages/MyCertificatesPage';
import { MyCompetencyProfilePage } from '../features/employee/pages/MyCompetencyProfilePage';

// Fallback dashboard
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';

/**
 * Application router mapping to Screen Specification Document routes.
 * All feature routes are protected by AuthGuard.
 */
export const router = createBrowserRouter([
  // ── Public ──
  { path: '/login', element: <LoginPage /> },

  // ── Protected ──
  {
    path: '/',
    element: (
      <AuthGuard>
        <MainLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <Navigate to="/my-dashboard" replace /> },

      // Dashboards
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'admin/dashboard', element: <RequireRole roles={['SYSTEM_ADMIN']}><AdminDashboardPage /></RequireRole> },
      { path: 'hr/dashboard', element: <RequireRole roles={['SYSTEM_ADMIN', 'HR_MANAGER']}><DashboardPage /></RequireRole> },
      { path: 'manager/dashboard', element: <RequireRole roles={['SYSTEM_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER']}><DashboardPage /></RequireRole> },
      { path: 'trainer/dashboard', element: <RequireRole roles={['SYSTEM_ADMIN', 'HR_MANAGER', 'TRAINER']}><DashboardPage /></RequireRole> },
      { path: 'my-dashboard', element: <DashboardPage /> },

      // Admin
      { path: 'admin/users', element: <RequirePermission permission="user.read"><UserManagementPage /></RequirePermission> },
      { path: 'admin/roles', element: <RequireRole roles={['SYSTEM_ADMIN']}><RolePermissionPage /></RequireRole> },
      { path: 'admin/settings', element: <RequirePermission permission="system_config.manage"><SystemConfigPage /></RequirePermission> },
      { path: 'admin/audit-log', element: <RequireRole roles={['SYSTEM_ADMIN', 'HR_MANAGER']}><AuditLogPage /></RequireRole> },

      // Organization
      { path: 'organization/departments', element: <RequirePermission permission="department.read"><DepartmentListPage /></RequirePermission> },
      { path: 'organization/positions', element: <RequirePermission permission="job_position.read"><PositionListPage /></RequirePermission> },
      { path: 'organization/employees', element: <RequirePermission permission="employee.read"><EmployeeListPage /></RequirePermission> },

      // Competency
      { path: 'competency-framework', element: <RequirePermission permission="competency.read"><CompetencyFrameworkPage /></RequirePermission> },
      { path: 'competency-framework/position-requirements', element: <RequirePermission permission="position_requirement.read"><PositionRequirementsPage /></RequirePermission> },

      // Course & Learning
      { path: 'courses', element: <RequirePermission permission="course.read_catalog"><CourseListPage /></RequirePermission> },
      { path: 'course-assignment', element: <RequirePermission permission="course_assignment.read"><CourseAssignmentPage /></RequirePermission> },

      // Assessment
      { path: 'trainer/question-bank', element: <RequirePermission permission="question_bank.read"><QuestionBankPage /></RequirePermission> },
      { path: 'trainer/assessments', element: <RequirePermission permission="assessment.read"><AssessmentListPage /></RequirePermission> },
      { path: 'trainer/learners', element: <RequirePermission permission="attempt.read_result"><LearnerResultsPage /></RequirePermission> },

      // Certificate
      { path: 'certificates', element: <RequirePermission permission="certificate.read"><CertificateListPage /></RequirePermission> },
      { path: 'verify', element: <CertificateVerificationPage /> },

      // Task
      { path: 'tasks', element: <RequirePermission permission="task.read"><TaskBoardPage /></RequirePermission> },

      // Intelligence
      { path: 'intelligence/skill-gap', element: <RequirePermission permission="skill_gap.read"><SkillGapPage /></RequirePermission> },
      { path: 'intelligence/training-risk', element: <RequirePermission permission="training_risk.read"><TrainingRiskPage /></RequirePermission> },
      { path: 'intelligence/readiness', element: <RequirePermission permission="readiness.read"><ReadinessPage /></RequirePermission> },

      // Notification
      { path: 'notifications', element: <NotificationCenterPage /> },

      // Employee self-service
      { path: 'my-profile', element: <MyProfilePage /> },
      { path: 'my-learning', element: <MyLearningPage /> },
      { path: 'my-assessments', element: <MyAssessmentsPage /> },
      { path: 'my-certificates', element: <MyCertificatesPage /> },
      { path: 'my-competency-profile', element: <MyCompetencyProfilePage /> },
    ],
  },

  // ── Catch-all ──
  { path: '*', element: <NotFoundPage /> },
]);
