namespace DigiTalent.Domain.Constants.Authorization;

/// <summary>
/// Mã quyền (doc 09 mục 6). Frontend dùng mã y hệt (hooks/use-permission.ts).
/// Nguồn sự thật phân quyền của toàn bộ hệ thống DigiTalent AI.
/// </summary>
public static class Permissions
{
    public static class Account
    {
        public const string ViewOwn = "account.view_own";
        public const string UpdateOwnProfile = "account.update_own_profile";
        public const string ChangeOwnPassword = "account.change_own_password";
        public const string ResetPasswordForUser = "account.reset_password_for_user";
    }

    public static class UserRole
    {
        public const string UserRead = "user.read";
        public const string UserCreate = "user.create";
        public const string UserUpdate = "user.update";
        public const string UserLockUnlock = "user.lock_unlock";
        public const string RoleRead = "role.read";
        public const string RoleAssignBusiness = "role.assign_business";
        public const string PermissionRead = "permission.read";
        public const string PermissionManage = "permission.manage";
    }

    public static class Department
    {
        public const string Read = "department.read";
        public const string CreateUpdate = "department.create_update";
    }

    public static class JobFamily
    {
        public const string Read = "job_family.read";
        public const string CreateUpdate = "job_family.create_update";
    }

    public static class JobPosition
    {
        public const string Read = "job_position.read";
        public const string CreateUpdate = "job_position.create_update";
    }

    public static class JobGrade
    {
        public const string Read = "job_grade.read";
        public const string Manage = "job_grade.manage";
    }

    public static class Employee
    {
        public const string Read = "employee.read";
        public const string CreateUpdate = "employee.create_update";
        public const string Transfer = "employee.transfer";
        public const string ArchiveRestore = "employee.archive_restore";
        public const string ManageManagerAssignment = "manager_assignment.manage";
    }

    public static class Competency
    {
        public const string CategoryRead = "competency_category.read";
        public const string CategoryManage = "competency_category.manage";
        public const string Read = "competency.read";
        public const string CreateUpdate = "competency.create_update";
        public const string Manage = "competency.manage";
        public const string PositionRequirementRead = "position_requirement.read";
        public const string PositionRequirementCreateUpdate = "position_requirement.create_update";
        public const string PositionRequirementManage = "position_requirement.manage";
        public const string ProfileRead = "employee_competency_profile.read";
        public const string ProfileOverride = "employee_competency_profile.override";
        public const string EvidenceRead = "evidence.read";
        public const string EvidenceCreateManual = "evidence.create_manual";
        public const string EvidenceApproveConfirm = "evidence.approve_confirm";
        public const string EvidenceRevoke = "evidence.revoke";
    }

    public static class PositionRequirement
    {
        public const string Read = "position_requirement.read";
        public const string CreateUpdate = "position_requirement.create_update";
        public const string Manage = "position_requirement.manage";
    }

    public static class Learning
    {
        public const string ReadCatalog = "course.read_catalog";
        public const string Create = "course.create";
        public const string Update = "course.update";
        public const string PublishUnpublish = "course.publish_unpublish";
        public const string Archive = "course.archive";
        public const string ManageCompetencies = "course_competency.manage";
        public const string UploadMaterial = "material.upload";
        public const string DownloadViewMaterial = "material.download_view";
        public const string DeleteArchiveMaterial = "material.delete_archive";
        public const string CreateAssignment = "course_assignment.create";
        public const string ReadAssignment = "course_assignment.read";
        public const string CancelAssignment = "course_assignment.cancel";
        public const string ReadProgress = "learning_progress.read";
        public const string CompleteLesson = "lesson.complete";
        public const string SelfEnroll = "enrollment.self_enroll";
    }

    public static class Assessment
    {
        public const string QuestionBankRead = "question_bank.read";
        public const string QuestionCreateUpdate = "question.create_update";
        public const string QuestionAiGenerateDraft = "question.ai_generate_draft";
        public const string QuestionApprovePublish = "question.approve_publish";
        public const string Read = "assessment.read";
        public const string CreateUpdate = "assessment.create_update";
        public const string PublishClose = "assessment.publish_close";
        public const string AttemptStart = "attempt.start";
        public const string AttemptSubmit = "attempt.submit";
        public const string AttemptReadResult = "attempt.read_result";
        public const string AttemptRegradeOverride = "attempt.regrade_override";
        public const string ResultExport = "assessment_result.export";
    }

    public static class Certificate
    {
        public const string ManageTemplate = "certificate_template.manage";
        public const string IssueAuto = "certificate.issue_auto";
        public const string IssueManual = "certificate.issue_manual";
        public const string Read = "certificate.read";
        public const string DownloadPdf = "certificate.download_pdf";
        public const string VerifyPublic = "certificate.verify_public";
        public const string Revoke = "certificate.revoke";
        public const string Renew = "certificate.renew";
        public const string ReadVerificationLog = "certificate_verification_log.read";
    }

    public static class Intelligence
    {
        public const string SkillGapCalculate = "skill_gap.calculate";
        public const string SkillGapRead = "skill_gap.read";
        public const string RecommendationGenerate = "learning_recommendation.generate";
        public const string RecommendationRead = "learning_recommendation.read";
        public const string TrainingRiskCalculate = "training_risk.calculate";
        public const string TrainingRiskRead = "training_risk.read";
        public const string ReadinessCalculate = "readiness.calculate";
        public const string ReadinessRead = "readiness.read";
        public const string CareerReadinessRead = "career_readiness.read";
        public const string AiExplanationRead = "ai_explanation.read";
        public const string ScoringConfigManage = "scoring_config.manage";
        public const string AiPromptTemplateManage = "ai_prompt_template.manage";
    }

    public static class Task
    {
        public const string SuggestionGenerate = "task_suggestion.generate";
        public const string Create = "task.create";
        public const string Assign = "task.assign";
        public const string Read = "task.read";
        public const string UpdateProgress = "task.update_progress";
        public const string Submit = "task.submit";
        public const string Evaluate = "task.evaluate";
        public const string Reopen = "task.reopen";
        public const string Cancel = "task.cancel";
        public const string AttachmentDownload = "task_attachment.download";
    }

    public static class Dashboard
    {
        public const string HrCompanyRead = "dashboard.hr_company.read";
        public const string DepartmentRead = "dashboard.department.read";
        public const string TrainerRead = "dashboard.trainer.read";
        public const string EmployeeRead = "dashboard.employee.read";
        public const string ReportExport = "report.export";
        public const string CompetencyHeatmapRead = "competency_heatmap.read";
    }

    public static class Notification
    {
        public const string ReadOwn = "notification.read_own";
        public const string MarkRead = "notification.mark_read";
        public const string Send = "notification.send";
        public const string ManageTemplate = "notification_template.manage";
        public const string SignalRConnect = "signalr.connect";
    }

    public static class System
    {
        public const string FileUploadMaterial = "file.upload_material";
        public const string FileUploadTaskSubmission = "file.upload_task_submission";
        public const string FileDownloadAuthorized = "file.download_authorized";
        public const string FileDeleteArchive = "file.delete_archive";
        public const string AuditLogReadSystem = "audit_log.read_system";
        public const string AuditLogReadDepartment = "audit_log.read_department";
        public const string SystemConfigManage = "system_config.manage";
        public const string BusinessConfigManage = "business_config.manage";
        public const string MasterDataManage = "master_data.manage";
    }

    /// <summary>
    /// Mọi mã quyền khai báo trong class này (đọc tự động) — DbSeeder dùng để seed bảng permissions.
    /// </summary>
    public static IReadOnlyList<string> All() =>
        typeof(Permissions)
            .GetNestedTypes()
            .SelectMany(type => type.GetFields())
            .Where(field => field.IsLiteral && field.FieldType == typeof(string))
            .Select(field => (string)field.GetRawConstantValue()!)
            .Distinct()
            .ToList();
}
