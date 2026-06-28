import { useCurrentUser } from './use-current-user';

/**
 * Hook to check permissions in components.
 * Usage: const { can } = usePermission();
 *         if (can('courses.create')) { ... }
 */
export function usePermission() {
  const hasPermission = useCurrentUser((s) => s.hasPermission);
  const hasRole = useCurrentUser((s) => s.hasRole);
  const user = useCurrentUser((s) => s.user);

  return {
    /** Check if current user has a specific permission */
    can: (permission: string) => hasPermission(permission),
    /** Check if current user has a specific role */
    is: (role: string) => hasRole(role),
    /** Current user object */
    user,
  };
}

/** Named permission keys matching backend PermissionConstants.cs (RBAC doc §6) */
export const PERMISSIONS = {
  // Auth & Account (6.1)
  AUTH_LOGIN: 'auth.login',
  AUTH_REFRESH_TOKEN: 'auth.refresh_token',
  AUTH_LOGOUT: 'auth.logout',
  ACCOUNT_VIEW_OWN: 'account.view_own',
  ACCOUNT_UPDATE_OWN_PROFILE: 'account.update_own_profile',
  ACCOUNT_CHANGE_OWN_PASSWORD: 'account.change_own_password',
  ACCOUNT_RESET_PASSWORD: 'account.reset_password_for_user',

  // User & Role (6.2)
  USER_READ: 'user.read',
  USER_CREATE: 'user.create',
  USER_UPDATE: 'user.update',
  USER_LOCK_UNLOCK: 'user.lock_unlock',
  ROLE_READ: 'role.read',
  ROLE_ASSIGN_BUSINESS: 'role.assign_business',
  PERMISSION_READ: 'permission.read',
  PERMISSION_MANAGE: 'permission.manage',

  // Organization (6.3)
  DEPARTMENT_READ: 'department.read',
  DEPARTMENT_CREATE_UPDATE: 'department.create_update',
  JOB_POSITION_READ: 'job_position.read',
  JOB_POSITION_CREATE_UPDATE: 'job_position.create_update',
  EMPLOYEE_READ: 'employee.read',
  EMPLOYEE_CREATE_UPDATE: 'employee.create_update',
  EMPLOYEE_TRANSFER: 'employee.transfer',
  EMPLOYEE_ARCHIVE_RESTORE: 'employee.archive_restore',
  MANAGER_ASSIGNMENT_MANAGE: 'manager_assignment.manage',

  // Competency (6.4)
  COMPETENCY_CATEGORY_READ: 'competency_category.read',
  COMPETENCY_CATEGORY_MANAGE: 'competency_category.manage',
  COMPETENCY_READ: 'competency.read',
  COMPETENCY_MANAGE: 'competency.manage',
  POSITION_REQUIREMENT_READ: 'position_requirement.read',
  POSITION_REQUIREMENT_MANAGE: 'position_requirement.manage',
  EMPLOYEE_COMPETENCY_PROFILE_READ: 'employee_competency_profile.read',
  EMPLOYEE_COMPETENCY_PROFILE_OVERRIDE: 'employee_competency_profile.override',

  // Evidence (6.5)
  EVIDENCE_READ: 'evidence.read',
  EVIDENCE_CREATE_MANUAL: 'evidence.create_manual',
  EVIDENCE_APPROVE_CONFIRM: 'evidence.approve_confirm',
  EVIDENCE_REVOKE: 'evidence.revoke',

  // Course (6.6)
  COURSE_READ_CATALOG: 'course.read_catalog',
  COURSE_CREATE: 'course.create',
  COURSE_UPDATE: 'course.update',
  COURSE_PUBLISH_UNPUBLISH: 'course.publish_unpublish',
  COURSE_ARCHIVE: 'course.archive',
  COURSE_COMPETENCY_MANAGE: 'course_competency.manage',

  // Material (6.7)
  MATERIAL_UPLOAD: 'material.upload',
  MATERIAL_DOWNLOAD_VIEW: 'material.download_view',
  MATERIAL_DELETE_ARCHIVE: 'material.delete_archive',

  // Assignment & Progress (6.8-6.9)
  COURSE_ASSIGNMENT_CREATE: 'course_assignment.create',
  COURSE_ASSIGNMENT_READ: 'course_assignment.read',
  COURSE_ASSIGNMENT_CANCEL: 'course_assignment.cancel',
  LEARNING_PROGRESS_READ: 'learning_progress.read',
  LESSON_COMPLETE: 'lesson.complete',

  // Assessment & Question Bank (6.10)
  QUESTION_BANK_READ: 'question_bank.read',
  QUESTION_CREATE_UPDATE: 'question.create_update',
  QUESTION_AI_GENERATE_DRAFT: 'question.ai_generate_draft',
  QUESTION_APPROVE_PUBLISH: 'question.approve_publish',
  ASSESSMENT_READ: 'assessment.read',
  ASSESSMENT_CREATE_UPDATE: 'assessment.create_update',
  ASSESSMENT_PUBLISH_CLOSE: 'assessment.publish_close',

  // Attempt (6.11)
  ATTEMPT_START: 'attempt.start',
  ATTEMPT_SUBMIT: 'attempt.submit',
  ATTEMPT_READ_RESULT: 'attempt.read_result',
  ATTEMPT_REGRADE_OVERRIDE: 'attempt.regrade_override',
  ASSESSMENT_RESULT_EXPORT: 'assessment_result.export',

  // Certificate (6.12)
  CERTIFICATE_TEMPLATE_MANAGE: 'certificate_template.manage',
  CERTIFICATE_ISSUE_AUTO: 'certificate.issue_auto',
  CERTIFICATE_ISSUE_MANUAL: 'certificate.issue_manual',
  CERTIFICATE_READ: 'certificate.read',
  CERTIFICATE_DOWNLOAD_PDF: 'certificate.download_pdf',
  CERTIFICATE_VERIFY_PUBLIC: 'certificate.verify_public',
  CERTIFICATE_REVOKE: 'certificate.revoke',
  CERTIFICATE_RENEW: 'certificate.renew',
  CERTIFICATE_VERIFICATION_LOG_READ: 'certificate_verification_log.read',

  // Intelligence (6.13)
  SKILL_GAP_CALCULATE: 'skill_gap.calculate',
  SKILL_GAP_READ: 'skill_gap.read',
  LEARNING_RECOMMENDATION_GENERATE: 'learning_recommendation.generate',
  LEARNING_RECOMMENDATION_READ: 'learning_recommendation.read',
  TRAINING_RISK_CALCULATE: 'training_risk.calculate',
  TRAINING_RISK_READ: 'training_risk.read',
  READINESS_CALCULATE: 'readiness.calculate',
  READINESS_READ: 'readiness.read',
  CAREER_READINESS_READ: 'career_readiness.read',
  AI_EXPLANATION_READ: 'ai_explanation.read',
  SCORING_CONFIG_MANAGE: 'scoring_config.manage',
  AI_PROMPT_TEMPLATE_MANAGE: 'ai_prompt_template.manage',

  // Task (6.14)
  TASK_SUGGESTION_GENERATE: 'task_suggestion.generate',
  TASK_CREATE: 'task.create',
  TASK_ASSIGN: 'task.assign',
  TASK_READ: 'task.read',
  TASK_UPDATE_PROGRESS: 'task.update_progress',
  TASK_SUBMIT: 'task.submit',
  TASK_EVALUATE: 'task.evaluate',
  TASK_REOPEN: 'task.reopen',
  TASK_CANCEL: 'task.cancel',
  TASK_ATTACHMENT_DOWNLOAD: 'task_attachment.download',

  // Dashboard (6.15)
  DASHBOARD_HR_COMPANY_READ: 'dashboard.hr_company.read',
  DASHBOARD_DEPARTMENT_READ: 'dashboard.department.read',
  DASHBOARD_TRAINER_READ: 'dashboard.trainer.read',
  DASHBOARD_EMPLOYEE_READ: 'dashboard.employee.read',
  REPORT_EXPORT: 'report.export',
  COMPETENCY_HEATMAP_READ: 'competency_heatmap.read',

  // Notification (6.16)
  NOTIFICATION_READ_OWN: 'notification.read_own',
  NOTIFICATION_MARK_READ: 'notification.mark_read',
  NOTIFICATION_SEND: 'notification.send',
  NOTIFICATION_TEMPLATE_MANAGE: 'notification_template.manage',
  SIGNALR_CONNECT: 'signalr.connect',

  // File Storage (6.17)
  FILE_UPLOAD_MATERIAL: 'file.upload_material',
  FILE_UPLOAD_TASK_SUBMISSION: 'file.upload_task_submission',
  FILE_DOWNLOAD_AUTHORIZED: 'file.download_authorized',
  FILE_DELETE_ARCHIVE: 'file.delete_archive',

  // Audit & Config (6.18)
  AUDIT_LOG_READ_SYSTEM: 'audit_log.read_system',
  AUDIT_LOG_READ_DEPARTMENT: 'audit_log.read_department',
  SYSTEM_CONFIG_MANAGE: 'system_config.manage',
  BUSINESS_CONFIG_MANAGE: 'business_config.manage',
  MASTER_DATA_MANAGE: 'master_data.manage',
} as const;
