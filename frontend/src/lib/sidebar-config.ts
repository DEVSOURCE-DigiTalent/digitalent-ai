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
      { label: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, roles: ['SYSTEM_ADMIN'] },
      { label: 'HR Dashboard', path: '/hr/dashboard', icon: BarChart3, roles: ['HR_MANAGER'] },
      { label: 'Manager Dashboard', path: '/manager/dashboard', icon: LayoutDashboard, roles: ['DEPARTMENT_MANAGER'] },
      { label: 'Trainer Dashboard', path: '/trainer/dashboard', icon: LayoutDashboard, roles: ['TRAINER'] },
      { label: 'My Dashboard', path: '/my-dashboard', icon: LayoutDashboard, roles: ['EMPLOYEE'] },
    ],
  },
  {
    label: 'Administration',
    items: [
      { label: 'User Management', path: '/admin/users', icon: Users, roles: ['SYSTEM_ADMIN'] },
      { label: 'Role & Permission', path: '/admin/roles', icon: Shield, roles: ['SYSTEM_ADMIN'] },
      { label: 'System Configuration', path: '/admin/settings', icon: Settings, roles: ['SYSTEM_ADMIN'] },
      { label: 'Audit Log', path: '/admin/audit-log', icon: FileText, roles: ['SYSTEM_ADMIN', 'HR_MANAGER'] },
    ],
  },
  {
    label: 'Organization',
    items: [
      { label: 'Departments', path: '/organization/departments', icon: Building2, roles: ['SYSTEM_ADMIN', 'HR_MANAGER'] },
      { label: 'Job Positions', path: '/organization/positions', icon: Briefcase, roles: ['SYSTEM_ADMIN', 'HR_MANAGER'] },
      { label: 'Employees', path: '/organization/employees', icon: UserCircle, roles: ['SYSTEM_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER'] },
    ],
  },
  {
    label: 'Competency',
    items: [
      { label: 'Competency Framework', path: '/competency-framework', icon: GitBranch, roles: ['HR_MANAGER', 'DEPARTMENT_MANAGER', 'TRAINER'] },
      { label: 'Position Requirements', path: '/competency-framework/position-requirements', icon: ClipboardList, roles: ['HR_MANAGER'] },
    ],
  },
  {
    label: 'Learning Management',
    items: [
      { label: 'Courses', path: '/courses', icon: BookOpen, roles: ['HR_MANAGER', 'TRAINER', 'DEPARTMENT_MANAGER'] },
      { label: 'Course Assignment', path: '/course-assignment', icon: GraduationCap, roles: ['HR_MANAGER', 'DEPARTMENT_MANAGER'] },
    ],
  },
  {
    label: 'Assessment',
    items: [
      { label: 'Question Bank', path: '/trainer/question-bank', icon: HelpCircle, roles: ['TRAINER'] },
      { label: 'Assessments', path: '/trainer/assessments', icon: FileSpreadsheet, roles: ['TRAINER', 'HR_MANAGER'] },
      { label: 'Learner Results', path: '/trainer/learners', icon: BarChart3, roles: ['TRAINER', 'HR_MANAGER'] },
    ],
  },
  {
    label: 'Certificates',
    items: [
      { label: 'Certificate Management', path: '/certificates', icon: Award, roles: ['HR_MANAGER', 'DEPARTMENT_MANAGER', 'TRAINER'] },
      { label: 'Certificate Verification', path: '/verify', icon: Search, roles: ['CERTIFICATE_VERIFIER'] },
    ],
  },
  {
    label: 'Tasks',
    items: [
      { label: 'Task Board', path: '/tasks', icon: ClipboardList, roles: ['HR_MANAGER', 'DEPARTMENT_MANAGER', 'EMPLOYEE'] },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { label: 'Skill Gap Analysis', path: '/intelligence/skill-gap', icon: Brain, roles: ['HR_MANAGER', 'DEPARTMENT_MANAGER', 'EMPLOYEE'] },
      { label: 'Training Risk', path: '/intelligence/training-risk', icon: BarChart3, roles: ['HR_MANAGER', 'DEPARTMENT_MANAGER'] },
      { label: 'Workforce Readiness', path: '/intelligence/readiness', icon: BarChart3, roles: ['HR_MANAGER', 'DEPARTMENT_MANAGER', 'EMPLOYEE'] },
    ],
  },
  {
    label: 'My Learning',
    items: [
      { label: 'My Learning', path: '/my-learning', icon: BookOpen, roles: ['EMPLOYEE'] },
      { label: 'My Assessments', path: '/my-assessments', icon: HelpCircle, roles: ['EMPLOYEE'] },
      { label: 'My Certificates', path: '/my-certificates', icon: Award, roles: ['EMPLOYEE'] },
      { label: 'My Tasks', path: '/my-tasks', icon: ClipboardList, roles: ['EMPLOYEE'] },
      { label: 'My Competency Profile', path: '/my-competency-profile', icon: UserCircle, roles: ['EMPLOYEE'] },
    ],
  },
  {
    label: 'Notifications',
    items: [
      { label: 'Notification Center', path: '/notifications', icon: Bell, roles: ['*'] },
    ],
  },
];

/** Get the default landing page path for a user based on their roles */
export function getDefaultPath(roles: string[]): string {
  if (roles.includes('SYSTEM_ADMIN')) return '/admin/dashboard';
  if (roles.includes('HR_MANAGER')) return '/hr/dashboard';
  if (roles.includes('DEPARTMENT_MANAGER')) return '/manager/dashboard';
  if (roles.includes('TRAINER')) return '/trainer/dashboard';
  if (roles.includes('EMPLOYEE')) return '/my-dashboard';
  if (roles.includes('CERTIFICATE_VERIFIER')) return '/verify';
  return '/my-dashboard';
}
