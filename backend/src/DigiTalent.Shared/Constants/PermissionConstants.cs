namespace DigiTalent.Shared.Constants;

/// <summary>
/// Permission constants mapped from RBAC Permission Matrix (doc 09).
/// Convention: <domain>.<resource/action>
/// </summary>
public static class PermissionConstants
{
    // ═══════════════════════════════════════════
    // Auth & Account (6.1)
    // ═══════════════════════════════════════════
    public const string AuthLogin = "auth.login";
    public const string AuthRefreshToken = "auth.refresh_token";
    public const string AuthLogout = "auth.logout";
    public const string AccountViewOwn = "account.view_own";
    public const string AccountUpdateOwnProfile = "account.update_own_profile";
    public const string AccountChangeOwnPassword = "account.change_own_password";
    public const string AccountResetPasswordForUser = "account.reset_password_for_user";

    // ═══════════════════════════════════════════
    // User & Role (6.2)
    // ═══════════════════════════════════════════
    public const string UserRead = "user.read";
    public const string UserCreate = "user.create";
    public const string UserUpdate = "user.update";
    public const string UserLockUnlock = "user.lock_unlock";
    public const string RoleRead = "role.read";
    public const string RoleAssignBusiness = "role.assign_business";
    public const string PermissionRead = "permission.read";
    public const string PermissionManage = "permission.manage";

    // ═══════════════════════════════════════════
    // Organization (6.3)
    // ═══════════════════════════════════════════
    public const string DepartmentRead = "department.read";
    public const string DepartmentCreateUpdate = "department.create_update";
    public const string JobPositionRead = "job_position.read";
    public const string JobPositionCreateUpdate = "job_position.create_update";
    public const string EmployeeRead = "employee.read";
    public const string EmployeeCreateUpdate = "employee.create_update";
    public const string EmployeeTransfer = "employee.transfer";
    public const string EmployeeArchiveRestore = "employee.archive_restore";
    public const string ManagerAssignmentManage = "manager_assignment.manage";

    // ═══════════════════════════════════════════
    // Competency (6.4)
    // ═══════════════════════════════════════════
    public const string CompetencyCategoryRead = "competency_category.read";
    public const string CompetencyCategoryManage = "competency_category.manage";
    public const string CompetencyRead = "competency.read";
    public const string CompetencyManage = "competency.manage";
    public const string PositionRequirementRead = "position_requirement.read";
    public const string PositionRequirementManage = "position_requirement.manage";
    public const string EmployeeCompetencyProfileRead = "employee_competency_profile.read";
    public const string EmployeeCompetencyProfileOverride = "employee_competency_profile.override";

    // ═══════════════════════════════════════════
    // Competency Evidence (6.5)
    // ═══════════════════════════════════════════
    public const string EvidenceRead = "evidence.read";
    public const string EvidenceCreateManual = "evidence.create_manual";
    public const string EvidenceApproveConfirm = "evidence.approve_confirm";
    public const string EvidenceRevoke = "evidence.revoke";

    // ═══════════════════════════════════════════
    // Course (6.6)
    // ═══════════════════════════════════════════
    public const string CourseReadCatalog = "course.read_catalog";
    public const string CourseCreate = "course.create";
    public const string CourseUpdate = "course.update";
    public const string CoursePublishUnpublish = "course.publish_unpublish";
    public const string CourseArchive = "course.archive";
    public const string CourseCompetencyManage = "course_competency.manage";

    // ═══════════════════════════════════════════
    // Learning Material (6.7)
    // ═══════════════════════════════════════════
    public const string MaterialUpload = "material.upload";
    public const string MaterialDownloadView = "material.download_view";
    public const string MaterialDeleteArchive = "material.delete_archive";

    // ═══════════════════════════════════════════
    // Course Assignment & Learning Progress (6.8, 6.9)
    // ═══════════════════════════════════════════
    public const string CourseAssignmentCreate = "course_assignment.create";
    public const string CourseAssignmentRead = "course_assignment.read";
    public const string CourseAssignmentCancel = "course_assignment.cancel";
    public const string LearningProgressRead = "learning_progress.read";
    public const string LessonComplete = "lesson.complete";

    // ═══════════════════════════════════════════
    // Assessment & Question Bank (6.10)
    // ═══════════════════════════════════════════
    public const string QuestionBankRead = "question_bank.read";
    public const string QuestionCreateUpdate = "question.create_update";
    public const string QuestionAiGenerateDraft = "question.ai_generate_draft";
    public const string QuestionApprovePublish = "question.approve_publish";
    public const string AssessmentRead = "assessment.read";
    public const string AssessmentCreateUpdate = "assessment.create_update";
    public const string AssessmentPublishClose = "assessment.publish_close";

    // ═══════════════════════════════════════════
    // Assessment Attempt (6.11)
    // ═══════════════════════════════════════════
    public const string AttemptStart = "attempt.start";
    public const string AttemptSubmit = "attempt.submit";
    public const string AttemptReadResult = "attempt.read_result";
    public const string AttemptRegradeOverride = "attempt.regrade_override";
    public const string AssessmentResultExport = "assessment_result.export";

    // ═══════════════════════════════════════════
    // Certificate (6.12)
    // ═══════════════════════════════════════════
    public const string CertificateTemplateManage = "certificate_template.manage";
    public const string CertificateIssueAuto = "certificate.issue_auto";
    public const string CertificateIssueManual = "certificate.issue_manual";
    public const string CertificateRead = "certificate.read";
    public const string CertificateDownloadPdf = "certificate.download_pdf";
    public const string CertificateVerifyPublic = "certificate.verify_public";
    public const string CertificateRevoke = "certificate.revoke";
    public const string CertificateRenew = "certificate.renew";
    public const string CertificateVerificationLogRead = "certificate_verification_log.read";

    // ═══════════════════════════════════════════
    // Capability Intelligence (6.13)
    // ═══════════════════════════════════════════
    public const string SkillGapCalculate = "skill_gap.calculate";
    public const string SkillGapRead = "skill_gap.read";
    public const string LearningRecommendationGenerate = "learning_recommendation.generate";
    public const string LearningRecommendationRead = "learning_recommendation.read";
    public const string TrainingRiskCalculate = "training_risk.calculate";
    public const string TrainingRiskRead = "training_risk.read";
    public const string ReadinessCalculate = "readiness.calculate";
    public const string ReadinessRead = "readiness.read";
    public const string CareerReadinessRead = "career_readiness.read";
    public const string AiExplanationRead = "ai_explanation.read";
    public const string ScoringConfigManage = "scoring_config.manage";
    public const string AiPromptTemplateManage = "ai_prompt_template.manage";

    // ═══════════════════════════════════════════
    // WMS-lite Task (6.14)
    // ═══════════════════════════════════════════
    public const string TaskSuggestionGenerate = "task_suggestion.generate";
    public const string TaskCreate = "task.create";
    public const string TaskAssign = "task.assign";
    public const string TaskRead = "task.read";
    public const string TaskUpdateProgress = "task.update_progress";
    public const string TaskSubmit = "task.submit";
    public const string TaskEvaluate = "task.evaluate";
    public const string TaskReopen = "task.reopen";
    public const string TaskCancel = "task.cancel";
    public const string TaskAttachmentDownload = "task_attachment.download";

    // ═══════════════════════════════════════════
    // Dashboard (6.15)
    // ═══════════════════════════════════════════
    public const string DashboardHrCompanyRead = "dashboard.hr_company.read";
    public const string DashboardDepartmentRead = "dashboard.department.read";
    public const string DashboardTrainerRead = "dashboard.trainer.read";
    public const string DashboardEmployeeRead = "dashboard.employee.read";
    public const string DashboardReportExport = "report.export";
    public const string DashboardCompetencyHeatmapRead = "competency_heatmap.read";

    // ═══════════════════════════════════════════
    // Notification (6.16)
    // ═══════════════════════════════════════════
    public const string NotificationReadOwn = "notification.read_own";
    public const string NotificationMarkRead = "notification.mark_read";
    public const string NotificationSend = "notification.send";
    public const string NotificationTemplateManage = "notification_template.manage";
    public const string NotificationSignalrConnect = "signalr.connect";

    // ═══════════════════════════════════════════
    // File Storage (6.17)
    // ═══════════════════════════════════════════
    public const string FileUploadMaterial = "file.upload_material";
    public const string FileUploadTaskSubmission = "file.upload_task_submission";
    public const string FileDownloadAuthorized = "file.download_authorized";
    public const string FileDeleteArchive = "file.delete_archive";

    // ═══════════════════════════════════════════
    // Audit & Config (6.18)
    // ═══════════════════════════════════════════
    public const string AuditLogReadSystem = "audit_log.read_system";
    public const string AuditLogReadDepartment = "audit_log.read_department";
    public const string SystemConfigManage = "system_config.manage";
    public const string BusinessConfigManage = "business_config.manage";
    public const string MasterDataManage = "master_data.manage";
}

/// <summary>
/// Role codes defined in the RBAC matrix.
/// </summary>
public static class RoleConstants
{
    public const string SystemAdmin = "SYSTEM_ADMIN";
    public const string HRManager = "HR_MANAGER";
    public const string DepartmentManager = "DEPARTMENT_MANAGER";
    public const string Trainer = "TRAINER";
    public const string Employee = "EMPLOYEE";
    public const string CertificateVerifier = "CERTIFICATE_VERIFIER";

    /// <summary>
    /// All role codes for validation/iteration.
    /// </summary>
    public static readonly string[] AllRoles =
    [
        SystemAdmin, HRManager, DepartmentManager, Trainer, Employee, CertificateVerifier
    ];
}
