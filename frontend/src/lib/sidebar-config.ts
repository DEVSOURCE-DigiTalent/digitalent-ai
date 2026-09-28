import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  FileText,
  Building2,
  Briefcase,
  UserCircle,
  GitBranch,
  BookOpen,
  GraduationCap,
  HelpCircle,
  Award,
  ClipboardList,
  Brain,
  BarChart3,
  Bell,
  Search,
  FileSpreadsheet,
} from 'lucide-react';

export interface SidebarItem {
  label: string;
  path: string;
  icon: LucideIcon;
  roles?: string[];
  children?: SidebarItem[];
}

export interface SidebarGroup {
  label: string;
  items: SidebarItem[];
}

/**
 * Role-based sidebar navigation configuration.
 * Maps to IA Document section 5: Full Sitemap by Role.
 * Items are filtered by user roles at render time.
 * 'roles' with ['*'] means all authenticated users can see it.
 */
export const sidebarGroups: SidebarGroup[] = [
  {
    label: 'Dashboard',
    items: [
      { label: 'Admin Dashboard', path: '/enterprise/admin/dashboard', icon: LayoutDashboard, roles: ['SYSTEM_ADMIN'] },
      { label: 'HR Dashboard', path: '/enterprise/hr/dashboard', icon: BarChart3, roles: ['HR_MANAGER'] },
      { label: 'Manager Dashboard', path: '/enterprise/manager/dashboard', icon: LayoutDashboard, roles: ['DEPARTMENT_MANAGER'] },
      { label: 'Trainer Dashboard', path: '/enterprise/trainer/dashboard', icon: LayoutDashboard, roles: ['TRAINER'] },
      { label: 'My Dashboard', path: '/enterprise/my-dashboard', icon: LayoutDashboard, roles: ['EMPLOYEE'] },
    ],
  },
  {
    label: 'Administration',
    items: [
      { label: 'User Management', path: '/enterprise/admin/users', icon: Users, roles: ['SYSTEM_ADMIN'] },
      { label: 'Role & Permission', path: '/enterprise/admin/roles', icon: Shield, roles: ['SYSTEM_ADMIN'] },
      { label: 'System Configuration', path: '/enterprise/admin/settings', icon: Settings, roles: ['SYSTEM_ADMIN'] },
      { label: 'Audit Log', path: '/enterprise/admin/audit-log', icon: FileText, roles: ['SYSTEM_ADMIN', 'HR_MANAGER'] },
    ],
  },
  {
    label: 'Organization',
    items: [
      { label: 'Departments', path: '/enterprise/organization/departments', icon: Building2, roles: ['SYSTEM_ADMIN', 'HR_MANAGER'] },
      { label: 'Job Positions', path: '/enterprise/organization/positions', icon: Briefcase, roles: ['SYSTEM_ADMIN', 'HR_MANAGER'] },
      { label: 'Employees', path: '/enterprise/organization/employees', icon: UserCircle, roles: ['SYSTEM_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER'] },
    ],
  },
  {
    label: 'Competency',
    items: [
      { label: 'Competency Framework', path: '/enterprise/competency-framework', icon: GitBranch, roles: ['HR_MANAGER', 'DEPARTMENT_MANAGER', 'TRAINER'] },
      { label: 'Position Requirements', path: '/enterprise/competency-framework/position-requirements', icon: ClipboardList, roles: ['HR_MANAGER'] },
    ],
  },
  {
    label: 'Learning Management',
    items: [
      { label: 'Courses', path: '/enterprise/courses', icon: BookOpen, roles: ['HR_MANAGER', 'TRAINER', 'DEPARTMENT_MANAGER'] },
      { label: 'Course Assignment', path: '/enterprise/course-assignment', icon: GraduationCap, roles: ['HR_MANAGER', 'DEPARTMENT_MANAGER'] },
    ],
  },
  {
    label: 'Assessment',
    items: [
      { label: 'Question Bank', path: '/enterprise/trainer/question-bank', icon: HelpCircle, roles: ['TRAINER'] },
      { label: 'Assessments', path: '/enterprise/trainer/assessments', icon: FileSpreadsheet, roles: ['TRAINER', 'HR_MANAGER'] },
      { label: 'Learner Results', path: '/enterprise/trainer/learners', icon: BarChart3, roles: ['TRAINER', 'HR_MANAGER'] },
    ],
  },
  {
    label: 'Certificates',
    items: [
      { label: 'Certificate Management', path: '/enterprise/certificates', icon: Award, roles: ['HR_MANAGER', 'DEPARTMENT_MANAGER', 'TRAINER'] },
      { label: 'Certificate Verification', path: '/verify', icon: Search, roles: ['HR_MANAGER', 'DEPARTMENT_MANAGER'] } // trang /verify công khai, không cần role riêng,
    ],
  },
  {
    label: 'Tasks',
    items: [
      { label: 'Task Board', path: '/enterprise/tasks', icon: ClipboardList, roles: ['HR_MANAGER', 'DEPARTMENT_MANAGER', 'EMPLOYEE'] },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { label: 'Skill Gap Analysis', path: '/enterprise/intelligence/skill-gap', icon: Brain, roles: ['HR_MANAGER', 'DEPARTMENT_MANAGER'] },
      { label: 'Training Risk', path: '/enterprise/intelligence/training-risk', icon: BarChart3, roles: ['HR_MANAGER', 'DEPARTMENT_MANAGER'] },
      { label: 'Workforce Readiness', path: '/enterprise/intelligence/readiness', icon: BarChart3, roles: ['HR_MANAGER', 'DEPARTMENT_MANAGER', 'EMPLOYEE'] },
    ],
  },
  {
    label: 'My Learning',
    items: [
      { label: 'My Learning', path: '/enterprise/my-learning', icon: BookOpen, roles: ['EMPLOYEE'] },
      { label: 'My Assessments', path: '/enterprise/my-assessments', icon: HelpCircle, roles: ['EMPLOYEE'] },
      { label: 'My Certificates', path: '/enterprise/my-certificates', icon: Award, roles: ['EMPLOYEE'] },
      { label: 'My Tasks', path: '/enterprise/my-tasks', icon: ClipboardList, roles: ['EMPLOYEE'] },
      { label: 'My Competency Profile', path: '/enterprise/my-competency-profile', icon: UserCircle, roles: ['EMPLOYEE'] },
    ],
  },
  {
    label: 'Notifications',
    items: [
      { label: 'Notification Center', path: '/enterprise/notifications', icon: Bell, roles: ['*'] },
    ],
  },
];

/** Get the default landing page path for a user based on their roles */
export function getDefaultPath(roles: string[]): string {
  if (roles.includes('SYSTEM_ADMIN')) return '/enterprise/admin/dashboard';
  if (roles.includes('HR_MANAGER')) return '/enterprise/hr/dashboard';
  if (roles.includes('DEPARTMENT_MANAGER')) return '/enterprise/manager/dashboard';
  if (roles.includes('TRAINER')) return '/enterprise/trainer/dashboard';
  if (roles.includes('EMPLOYEE')) return '/enterprise/my-dashboard';
  return '/enterprise/my-dashboard';
}
