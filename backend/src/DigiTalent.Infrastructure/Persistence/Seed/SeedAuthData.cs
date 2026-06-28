using DigiTalent.Domain.Entities.Auth;
using DigiTalent.Shared.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Infrastructure.Persistence.Seed;

public static class SeedAuthData
{
    public static readonly Guid RoleSystemAdminId = Guid.Parse("A1B2C3D4-E5F6-7890-ABCD-EF1234567890");
    public static readonly Guid RoleHRManagerId = Guid.Parse("B2C3D4E5-F6A7-8901-BCDE-F12345678901");
    public static readonly Guid RoleDeptManagerId = Guid.Parse("C3D4E5F6-A7B8-9012-CDEF-123456789012");
    public static readonly Guid RoleTrainerId = Guid.Parse("D4E5F6A7-B8C9-0123-DEF1-234567890123");
    public static readonly Guid RoleEmployeeId = Guid.Parse("E5F6A7B8-C9D0-1234-EF12-345678901234");
    public static readonly Guid RoleCertVerifierId = Guid.Parse("F6A7B8C9-D0E1-2345-F123-456789012345");

    public static async Task SeedAsync(AppDbContext context)
    {
        if (await context.Roles.AnyAsync()) return;

        // Seed roles
        var roles = new List<Role>
        {
            new() { Id = RoleSystemAdminId, Code = RoleConstants.SystemAdmin, Name = "System Admin", Description = "System administrator with full access", ScopeType = "GLOBAL", IsSystemRole = true, Status = "ACTIVE" },
            new() { Id = RoleHRManagerId, Code = RoleConstants.HRManager, Name = "HR Manager", Description = "Human resources / training manager", ScopeType = "ORGANIZATION", IsSystemRole = true, Status = "ACTIVE" },
            new() { Id = RoleDeptManagerId, Code = RoleConstants.DepartmentManager, Name = "Department Manager", Description = "Department-level manager", ScopeType = "DEPARTMENT", IsSystemRole = true, Status = "ACTIVE" },
            new() { Id = RoleTrainerId, Code = RoleConstants.Trainer, Name = "Trainer", Description = "Internal trainer / content author", ScopeType = "ORGANIZATION", IsSystemRole = true, Status = "ACTIVE" },
            new() { Id = RoleEmployeeId, Code = RoleConstants.Employee, Name = "Employee", Description = "Regular employee / learner", ScopeType = "SELF", IsSystemRole = true, Status = "ACTIVE" },
            new() { Id = RoleCertVerifierId, Code = RoleConstants.CertificateVerifier, Name = "Certificate Verifier", Description = "Can verify certificate validity", ScopeType = "PUBLIC", IsSystemRole = true, Status = "ACTIVE" },
        };
        context.Roles.AddRange(roles);

        // ──────────────────────────────────────────
        // Seed ALL permissions from PermissionConstants
        // ──────────────────────────────────────────
        var idx = 0;
        var permissions = new List<Permission>();

        Permission NewPerm(string code, string module, string action, string desc)
        {
            var p = new Permission { Code = code, Module = module, Action = action, Description = desc };
            p.Id = Guid.Parse($"20000000-0000-0000-0000-{idx++:D12}");
            return p;
        }

        // Auth & Account (6.1)
        permissions.Add(NewPerm(PermissionConstants.AuthLogin, "Auth", "login", "Login to system"));
        permissions.Add(NewPerm(PermissionConstants.AuthRefreshToken, "Auth", "refresh_token", "Refresh access token"));
        permissions.Add(NewPerm(PermissionConstants.AuthLogout, "Auth", "logout", "Logout from system"));
        permissions.Add(NewPerm(PermissionConstants.AccountViewOwn, "Auth", "view_own", "View own account"));
        permissions.Add(NewPerm(PermissionConstants.AccountUpdateOwnProfile, "Auth", "update_own_profile", "Update own profile"));
        permissions.Add(NewPerm(PermissionConstants.AccountChangeOwnPassword, "Auth", "change_own_password", "Change own password"));
        permissions.Add(NewPerm(PermissionConstants.AccountResetPasswordForUser, "Auth", "reset_password", "Reset password for another user"));

        // User & Role (6.2)
        permissions.Add(NewPerm(PermissionConstants.UserRead, "User", "read", "View user accounts"));
        permissions.Add(NewPerm(PermissionConstants.UserCreate, "User", "create", "Create user accounts"));
        permissions.Add(NewPerm(PermissionConstants.UserUpdate, "User", "update", "Update user accounts"));
        permissions.Add(NewPerm(PermissionConstants.UserLockUnlock, "User", "lock_unlock", "Lock/unlock user account"));
        permissions.Add(NewPerm(PermissionConstants.RoleRead, "User", "read_role", "View system roles"));
        permissions.Add(NewPerm(PermissionConstants.RoleAssignBusiness, "User", "assign_business", "Assign business roles"));
        permissions.Add(NewPerm(PermissionConstants.PermissionRead, "User", "read_permission", "View permission catalog"));
        permissions.Add(NewPerm(PermissionConstants.PermissionManage, "User", "manage_permission", "Manage permission definitions"));

        // Organization (6.3)
        permissions.Add(NewPerm(PermissionConstants.DepartmentRead, "Organization", "read_department", "View departments"));
        permissions.Add(NewPerm(PermissionConstants.DepartmentCreateUpdate, "Organization", "create_update_department", "Create/update departments"));
        permissions.Add(NewPerm(PermissionConstants.JobPositionRead, "Organization", "read_position", "View job positions"));
        permissions.Add(NewPerm(PermissionConstants.JobPositionCreateUpdate, "Organization", "create_update_position", "Create/update job positions"));
        permissions.Add(NewPerm(PermissionConstants.EmployeeRead, "Organization", "read_employee", "View employee profiles"));
        permissions.Add(NewPerm(PermissionConstants.EmployeeCreateUpdate, "Organization", "create_update_employee", "Create/update employee profiles"));
        permissions.Add(NewPerm(PermissionConstants.EmployeeTransfer, "Organization", "transfer", "Transfer employee department/position"));
        permissions.Add(NewPerm(PermissionConstants.EmployeeArchiveRestore, "Organization", "archive_restore", "Archive/restore employee"));
        permissions.Add(NewPerm(PermissionConstants.ManagerAssignmentManage, "Organization", "manage_manager", "Assign department manager"));

        // Competency (6.4)
        permissions.Add(NewPerm(PermissionConstants.CompetencyCategoryRead, "Competency", "read_category", "View competency categories"));
        permissions.Add(NewPerm(PermissionConstants.CompetencyCategoryManage, "Competency", "manage_category", "Manage competency categories"));
        permissions.Add(NewPerm(PermissionConstants.CompetencyRead, "Competency", "read", "View competencies"));
        permissions.Add(NewPerm(PermissionConstants.CompetencyManage, "Competency", "manage", "Manage competencies"));
        permissions.Add(NewPerm(PermissionConstants.PositionRequirementRead, "Competency", "read_requirement", "View position requirements"));
        permissions.Add(NewPerm(PermissionConstants.PositionRequirementManage, "Competency", "manage_requirement", "Manage position requirements"));
        permissions.Add(NewPerm(PermissionConstants.EmployeeCompetencyProfileRead, "Competency", "read_profile", "View employee competency profiles"));
        permissions.Add(NewPerm(PermissionConstants.EmployeeCompetencyProfileOverride, "Competency", "override_profile", "Override competency level"));

        // Competency Evidence (6.5)
        permissions.Add(NewPerm(PermissionConstants.EvidenceRead, "Evidence", "read", "View competency evidence"));
        permissions.Add(NewPerm(PermissionConstants.EvidenceCreateManual, "Evidence", "create_manual", "Create manual evidence"));
        permissions.Add(NewPerm(PermissionConstants.EvidenceApproveConfirm, "Evidence", "approve_confirm", "Approve/confirm evidence"));
        permissions.Add(NewPerm(PermissionConstants.EvidenceRevoke, "Evidence", "revoke", "Revoke evidence"));

        // Course (6.6)
        permissions.Add(NewPerm(PermissionConstants.CourseReadCatalog, "Course", "read_catalog", "View course catalog"));
        permissions.Add(NewPerm(PermissionConstants.CourseCreate, "Course", "create", "Create courses"));
        permissions.Add(NewPerm(PermissionConstants.CourseUpdate, "Course", "update", "Update courses"));
        permissions.Add(NewPerm(PermissionConstants.CoursePublishUnpublish, "Course", "publish_unpublish", "Publish/unpublish courses"));
        permissions.Add(NewPerm(PermissionConstants.CourseArchive, "Course", "archive", "Archive courses"));
        permissions.Add(NewPerm(PermissionConstants.CourseCompetencyManage, "Course", "manage_competency", "Map course to competencies"));

        // Learning Material (6.7)
        permissions.Add(NewPerm(PermissionConstants.MaterialUpload, "Material", "upload", "Upload lesson material"));
        permissions.Add(NewPerm(PermissionConstants.MaterialDownloadView, "Material", "download_view", "Download/view material"));
        permissions.Add(NewPerm(PermissionConstants.MaterialDeleteArchive, "Material", "delete_archive", "Delete/archive material"));

        // Course Assignment & Learning Progress (6.8, 6.9)
        permissions.Add(NewPerm(PermissionConstants.CourseAssignmentCreate, "Course", "assign_course", "Assign courses"));
        permissions.Add(NewPerm(PermissionConstants.CourseAssignmentRead, "Course", "read_assignment", "View course assignments"));
        permissions.Add(NewPerm(PermissionConstants.CourseAssignmentCancel, "Course", "cancel_assignment", "Cancel course assignment"));
        permissions.Add(NewPerm(PermissionConstants.LearningProgressRead, "Course", "read_progress", "View learning progress"));
        permissions.Add(NewPerm(PermissionConstants.LessonComplete, "Course", "complete_lesson", "Mark lesson complete"));

        // Assessment & Question Bank (6.10)
        permissions.Add(NewPerm(PermissionConstants.QuestionBankRead, "Assessment", "read_bank", "View question banks"));
        permissions.Add(NewPerm(PermissionConstants.QuestionCreateUpdate, "Assessment", "create_update_question", "Create/update questions"));
        permissions.Add(NewPerm(PermissionConstants.QuestionAiGenerateDraft, "Assessment", "ai_generate_draft", "Generate AI draft questions"));
        permissions.Add(NewPerm(PermissionConstants.QuestionApprovePublish, "Assessment", "approve_publish", "Approve/publish questions"));
        permissions.Add(NewPerm(PermissionConstants.AssessmentRead, "Assessment", "read", "View assessments"));
        permissions.Add(NewPerm(PermissionConstants.AssessmentCreateUpdate, "Assessment", "create_update", "Create/update assessments"));
        permissions.Add(NewPerm(PermissionConstants.AssessmentPublishClose, "Assessment", "publish_close", "Publish/close assessment"));

        // Assessment Attempt (6.11)
        permissions.Add(NewPerm(PermissionConstants.AttemptStart, "Assessment", "start_attempt", "Start assessment attempt"));
        permissions.Add(NewPerm(PermissionConstants.AttemptSubmit, "Assessment", "submit_attempt", "Submit assessment attempt"));
        permissions.Add(NewPerm(PermissionConstants.AttemptReadResult, "Assessment", "read_result", "View attempt results"));
        permissions.Add(NewPerm(PermissionConstants.AttemptRegradeOverride, "Assessment", "regrade_override", "Regrade/override attempt result"));
        permissions.Add(NewPerm(PermissionConstants.AssessmentResultExport, "Assessment", "export_results", "Export assessment results"));

        // Certificate (6.12)
        permissions.Add(NewPerm(PermissionConstants.CertificateTemplateManage, "Certificate", "manage_template", "Manage certificate templates"));
        permissions.Add(NewPerm(PermissionConstants.CertificateIssueAuto, "Certificate", "issue_auto", "Auto-issue certificates"));
        permissions.Add(NewPerm(PermissionConstants.CertificateIssueManual, "Certificate", "issue_manual", "Manually issue certificates"));
        permissions.Add(NewPerm(PermissionConstants.CertificateRead, "Certificate", "read", "View certificates"));
        permissions.Add(NewPerm(PermissionConstants.CertificateDownloadPdf, "Certificate", "download_pdf", "Download certificate PDF"));
        permissions.Add(NewPerm(PermissionConstants.CertificateVerifyPublic, "Certificate", "verify_public", "Verify certificate publicly"));
        permissions.Add(NewPerm(PermissionConstants.CertificateRevoke, "Certificate", "revoke", "Revoke certificates"));
        permissions.Add(NewPerm(PermissionConstants.CertificateRenew, "Certificate", "renew", "Renew certificates"));
        permissions.Add(NewPerm(PermissionConstants.CertificateVerificationLogRead, "Certificate", "read_verification_log", "Read verification logs"));

        // Capability Intelligence (6.13)
        permissions.Add(NewPerm(PermissionConstants.SkillGapCalculate, "Intelligence", "calculate_skill_gap", "Calculate skill gaps"));
        permissions.Add(NewPerm(PermissionConstants.SkillGapRead, "Intelligence", "read_skill_gap", "View skill gap results"));
        permissions.Add(NewPerm(PermissionConstants.LearningRecommendationGenerate, "Intelligence", "generate_recommendation", "Generate learning recommendations"));
        permissions.Add(NewPerm(PermissionConstants.LearningRecommendationRead, "Intelligence", "read_recommendation", "View learning recommendations"));
        permissions.Add(NewPerm(PermissionConstants.TrainingRiskCalculate, "Intelligence", "calculate_risk", "Calculate training risk"));
        permissions.Add(NewPerm(PermissionConstants.TrainingRiskRead, "Intelligence", "read_risk", "View training risks"));
        permissions.Add(NewPerm(PermissionConstants.ReadinessCalculate, "Intelligence", "calculate_readiness", "Calculate readiness score"));
        permissions.Add(NewPerm(PermissionConstants.ReadinessRead, "Intelligence", "read_readiness", "View readiness scores"));
        permissions.Add(NewPerm(PermissionConstants.CareerReadinessRead, "Intelligence", "read_career", "View career readiness"));
        permissions.Add(NewPerm(PermissionConstants.AiExplanationRead, "Intelligence", "read_ai_explanation", "View AI explanation logs"));
        permissions.Add(NewPerm(PermissionConstants.ScoringConfigManage, "Intelligence", "manage_scoring", "Manage scoring configs"));
        permissions.Add(NewPerm(PermissionConstants.AiPromptTemplateManage, "Intelligence", "manage_ai_prompt", "Manage AI prompt templates"));

        // WMS-lite Task (6.14)
        permissions.Add(NewPerm(PermissionConstants.TaskSuggestionGenerate, "Task", "generate_suggestion", "Generate task suggestions"));
        permissions.Add(NewPerm(PermissionConstants.TaskCreate, "Task", "create", "Create practical tasks"));
        permissions.Add(NewPerm(PermissionConstants.TaskAssign, "Task", "assign", "Assign tasks"));
        permissions.Add(NewPerm(PermissionConstants.TaskRead, "Task", "read", "View tasks"));
        permissions.Add(NewPerm(PermissionConstants.TaskUpdateProgress, "Task", "update_progress", "Update task progress"));
        permissions.Add(NewPerm(PermissionConstants.TaskSubmit, "Task", "submit", "Submit task results"));
        permissions.Add(NewPerm(PermissionConstants.TaskEvaluate, "Task", "evaluate", "Evaluate task submissions"));
        permissions.Add(NewPerm(PermissionConstants.TaskReopen, "Task", "reopen", "Reopen task"));
        permissions.Add(NewPerm(PermissionConstants.TaskCancel, "Task", "cancel", "Cancel task"));
        permissions.Add(NewPerm(PermissionConstants.TaskAttachmentDownload, "Task", "download_attachment", "Download task attachments"));

        // Dashboard (6.15)
        permissions.Add(NewPerm(PermissionConstants.DashboardHrCompanyRead, "Dashboard", "hr_read", "View HR company dashboard"));
        permissions.Add(NewPerm(PermissionConstants.DashboardDepartmentRead, "Dashboard", "dept_read", "View department dashboard"));
        permissions.Add(NewPerm(PermissionConstants.DashboardTrainerRead, "Dashboard", "trainer_read", "View trainer dashboard"));
        permissions.Add(NewPerm(PermissionConstants.DashboardEmployeeRead, "Dashboard", "employee_read", "View employee dashboard"));
        permissions.Add(NewPerm(PermissionConstants.DashboardReportExport, "Dashboard", "export_report", "Export reports"));
        permissions.Add(NewPerm(PermissionConstants.DashboardCompetencyHeatmapRead, "Dashboard", "heatmap_read", "View competency heatmap"));

        // Notification (6.16)
        permissions.Add(NewPerm(PermissionConstants.NotificationReadOwn, "Notification", "read_own", "Read own notifications"));
        permissions.Add(NewPerm(PermissionConstants.NotificationMarkRead, "Notification", "mark_read", "Mark notification as read"));
        permissions.Add(NewPerm(PermissionConstants.NotificationSend, "Notification", "send", "Send notifications"));
        permissions.Add(NewPerm(PermissionConstants.NotificationTemplateManage, "Notification", "manage_template", "Manage notification templates"));
        permissions.Add(NewPerm(PermissionConstants.NotificationSignalrConnect, "Notification", "signalr_connect", "Connect to SignalR hub"));

        // File Storage (6.17)
        permissions.Add(NewPerm(PermissionConstants.FileUploadMaterial, "File", "upload_material", "Upload course material"));
        permissions.Add(NewPerm(PermissionConstants.FileUploadTaskSubmission, "File", "upload_task_submission", "Upload task submission"));
        permissions.Add(NewPerm(PermissionConstants.FileDownloadAuthorized, "File", "download", "Download authorized files"));
        permissions.Add(NewPerm(PermissionConstants.FileDeleteArchive, "File", "delete_archive", "Delete/archive files"));

        // Audit & Config (6.18)
        permissions.Add(NewPerm(PermissionConstants.AuditLogReadSystem, "Audit", "read_system", "Read system audit logs"));
        permissions.Add(NewPerm(PermissionConstants.AuditLogReadDepartment, "Audit", "read_dept_logs", "Read department audit logs"));
        permissions.Add(NewPerm(PermissionConstants.SystemConfigManage, "Config", "manage_system", "Manage system config"));
        permissions.Add(NewPerm(PermissionConstants.BusinessConfigManage, "Config", "manage_business", "Manage business config"));
        permissions.Add(NewPerm(PermissionConstants.MasterDataManage, "Config", "manage_master_data", "Manage master data"));

        context.Permissions.AddRange(permissions);

        // ──────────────────────────────────────────
        // Map permissions to roles per RBAC matrix
        // ──────────────────────────────────────────

        var allPerms = permissions.ToDictionary(p => p.Code);

        // SYSTEM_ADMIN: all permissions
        foreach (var perm in allPerms.Values)
            context.RolePermissions.Add(new RolePermission { RoleId = RoleSystemAdminId, PermissionId = perm.Id });

        // HR_MANAGER: full business management access
        var hrPerms = new HashSet<string>
        {
            PermissionConstants.AuthLogin, PermissionConstants.AuthRefreshToken, PermissionConstants.AuthLogout,
            PermissionConstants.AccountViewOwn, PermissionConstants.AccountUpdateOwnProfile, PermissionConstants.AccountChangeOwnPassword,
            PermissionConstants.AccountResetPasswordForUser,
            PermissionConstants.UserRead, PermissionConstants.UserCreate, PermissionConstants.UserUpdate, PermissionConstants.UserLockUnlock,
            PermissionConstants.RoleRead, PermissionConstants.RoleAssignBusiness,
            PermissionConstants.DepartmentRead, PermissionConstants.DepartmentCreateUpdate,
            PermissionConstants.JobPositionRead, PermissionConstants.JobPositionCreateUpdate,
            PermissionConstants.EmployeeRead, PermissionConstants.EmployeeCreateUpdate,
            PermissionConstants.EmployeeTransfer, PermissionConstants.EmployeeArchiveRestore,
            PermissionConstants.ManagerAssignmentManage,
            PermissionConstants.CompetencyCategoryRead, PermissionConstants.CompetencyCategoryManage,
            PermissionConstants.CompetencyRead, PermissionConstants.CompetencyManage,
            PermissionConstants.PositionRequirementRead, PermissionConstants.PositionRequirementManage,
            PermissionConstants.EmployeeCompetencyProfileRead, PermissionConstants.EmployeeCompetencyProfileOverride,
            PermissionConstants.EvidenceRead, PermissionConstants.EvidenceCreateManual,
            PermissionConstants.EvidenceApproveConfirm, PermissionConstants.EvidenceRevoke,
            PermissionConstants.CourseReadCatalog, PermissionConstants.CourseCreate, PermissionConstants.CourseUpdate,
            PermissionConstants.CoursePublishUnpublish, PermissionConstants.CourseArchive, PermissionConstants.CourseCompetencyManage,
            PermissionConstants.MaterialUpload, PermissionConstants.MaterialDownloadView, PermissionConstants.MaterialDeleteArchive,
            PermissionConstants.CourseAssignmentCreate, PermissionConstants.CourseAssignmentRead, PermissionConstants.CourseAssignmentCancel,
            PermissionConstants.LearningProgressRead,
            PermissionConstants.QuestionBankRead, PermissionConstants.QuestionCreateUpdate,
            PermissionConstants.QuestionAiGenerateDraft, PermissionConstants.QuestionApprovePublish,
            PermissionConstants.AssessmentRead, PermissionConstants.AssessmentCreateUpdate, PermissionConstants.AssessmentPublishClose,
            PermissionConstants.AttemptReadResult, PermissionConstants.AttemptRegradeOverride, PermissionConstants.AssessmentResultExport,
            PermissionConstants.CertificateTemplateManage, PermissionConstants.CertificateIssueAuto, PermissionConstants.CertificateIssueManual,
            PermissionConstants.CertificateRead, PermissionConstants.CertificateDownloadPdf,
            PermissionConstants.CertificateRevoke, PermissionConstants.CertificateRenew, PermissionConstants.CertificateVerificationLogRead,
            PermissionConstants.SkillGapCalculate, PermissionConstants.SkillGapRead,
            PermissionConstants.LearningRecommendationGenerate, PermissionConstants.LearningRecommendationRead,
            PermissionConstants.TrainingRiskCalculate, PermissionConstants.TrainingRiskRead,
            PermissionConstants.ReadinessCalculate, PermissionConstants.ReadinessRead,
            PermissionConstants.CareerReadinessRead, PermissionConstants.AiExplanationRead,
            PermissionConstants.ScoringConfigManage, PermissionConstants.AiPromptTemplateManage,
            PermissionConstants.TaskSuggestionGenerate, PermissionConstants.TaskCreate, PermissionConstants.TaskAssign,
            PermissionConstants.TaskRead, PermissionConstants.TaskEvaluate, PermissionConstants.TaskReopen,
            PermissionConstants.TaskCancel, PermissionConstants.TaskAttachmentDownload,
            PermissionConstants.DashboardHrCompanyRead, PermissionConstants.DashboardDepartmentRead,
            PermissionConstants.DashboardTrainerRead, PermissionConstants.DashboardEmployeeRead,
            PermissionConstants.DashboardReportExport, PermissionConstants.DashboardCompetencyHeatmapRead,
            PermissionConstants.NotificationReadOwn, PermissionConstants.NotificationMarkRead,
            PermissionConstants.NotificationSend, PermissionConstants.NotificationTemplateManage, PermissionConstants.NotificationSignalrConnect,
            PermissionConstants.FileUploadMaterial, PermissionConstants.FileDownloadAuthorized, PermissionConstants.FileDeleteArchive,
            PermissionConstants.AuditLogReadSystem, PermissionConstants.AuditLogReadDepartment,
            PermissionConstants.BusinessConfigManage, PermissionConstants.MasterDataManage,
        };
        foreach (var code in hrPerms)
            if (allPerms.TryGetValue(code, out var p))
                context.RolePermissions.Add(new RolePermission { RoleId = RoleHRManagerId, PermissionId = p.Id });

        // DEPT_MANAGER: department-scoped access
        var deptPerms = new HashSet<string>
        {
            PermissionConstants.AuthLogin, PermissionConstants.AuthRefreshToken, PermissionConstants.AuthLogout,
            PermissionConstants.AccountViewOwn, PermissionConstants.AccountUpdateOwnProfile, PermissionConstants.AccountChangeOwnPassword,
            PermissionConstants.DepartmentRead, PermissionConstants.JobPositionRead,
            PermissionConstants.EmployeeRead,
            PermissionConstants.CompetencyCategoryRead, PermissionConstants.CompetencyRead, PermissionConstants.PositionRequirementRead, PermissionConstants.EmployeeCompetencyProfileRead,
            PermissionConstants.EvidenceRead, PermissionConstants.EvidenceCreateManual, PermissionConstants.EvidenceApproveConfirm,
            PermissionConstants.CourseReadCatalog, PermissionConstants.CourseAssignmentCreate, PermissionConstants.CourseAssignmentRead,
            PermissionConstants.LearningProgressRead,
            PermissionConstants.AssessmentRead, PermissionConstants.AttemptReadResult,
            PermissionConstants.CertificateRead, PermissionConstants.CertificateDownloadPdf,
            PermissionConstants.SkillGapRead, PermissionConstants.LearningRecommendationRead, PermissionConstants.TrainingRiskRead, PermissionConstants.ReadinessRead,
            PermissionConstants.TaskCreate, PermissionConstants.TaskAssign, PermissionConstants.TaskRead, PermissionConstants.TaskEvaluate,
            PermissionConstants.TaskReopen, PermissionConstants.TaskCancel, PermissionConstants.TaskAttachmentDownload, PermissionConstants.TaskUpdateProgress,
            PermissionConstants.DashboardDepartmentRead, PermissionConstants.DashboardEmployeeRead, PermissionConstants.DashboardCompetencyHeatmapRead,
            PermissionConstants.NotificationReadOwn, PermissionConstants.NotificationMarkRead, PermissionConstants.NotificationSend, PermissionConstants.NotificationSignalrConnect,
            PermissionConstants.FileUploadTaskSubmission, PermissionConstants.FileDownloadAuthorized,
            PermissionConstants.AuditLogReadDepartment,
        };
        foreach (var code in deptPerms)
            if (allPerms.TryGetValue(code, out var p))
                context.RolePermissions.Add(new RolePermission { RoleId = RoleDeptManagerId, PermissionId = p.Id });

        // TRAINER: course authoring + assessment + task evaluation
        var trainerPerms = new HashSet<string>
        {
            PermissionConstants.AuthLogin, PermissionConstants.AuthRefreshToken, PermissionConstants.AuthLogout,
            PermissionConstants.AccountViewOwn, PermissionConstants.AccountUpdateOwnProfile, PermissionConstants.AccountChangeOwnPassword,
            PermissionConstants.DepartmentRead, PermissionConstants.JobPositionRead, PermissionConstants.EmployeeRead,
            PermissionConstants.CompetencyCategoryRead, PermissionConstants.CompetencyRead, PermissionConstants.PositionRequirementRead,
            PermissionConstants.EmployeeCompetencyProfileRead,
            PermissionConstants.EvidenceRead, PermissionConstants.EvidenceCreateManual, PermissionConstants.EvidenceApproveConfirm,
            PermissionConstants.CourseReadCatalog, PermissionConstants.CourseCreate, PermissionConstants.CourseUpdate,
            PermissionConstants.CoursePublishUnpublish, PermissionConstants.CourseCompetencyManage,
            PermissionConstants.MaterialUpload, PermissionConstants.MaterialDownloadView, PermissionConstants.MaterialDeleteArchive,
            PermissionConstants.CourseAssignmentRead, PermissionConstants.LearningProgressRead,
            PermissionConstants.QuestionBankRead, PermissionConstants.QuestionCreateUpdate, PermissionConstants.QuestionAiGenerateDraft,
            PermissionConstants.QuestionApprovePublish, PermissionConstants.AssessmentRead, PermissionConstants.AssessmentCreateUpdate,
            PermissionConstants.AssessmentPublishClose, PermissionConstants.AttemptReadResult,
            PermissionConstants.CertificateRead, PermissionConstants.CertificateDownloadPdf,
            PermissionConstants.SkillGapRead, PermissionConstants.LearningRecommendationRead, PermissionConstants.TrainingRiskRead,
            PermissionConstants.TaskCreate, PermissionConstants.TaskRead, PermissionConstants.TaskEvaluate,
            PermissionConstants.TaskAttachmentDownload, PermissionConstants.TaskSuggestionGenerate,
            PermissionConstants.DashboardTrainerRead, PermissionConstants.DashboardEmployeeRead,
            PermissionConstants.NotificationReadOwn, PermissionConstants.NotificationMarkRead, PermissionConstants.NotificationSend, PermissionConstants.NotificationSignalrConnect,
            PermissionConstants.FileUploadMaterial, PermissionConstants.FileDownloadAuthorized,
        };
        foreach (var code in trainerPerms)
            if (allPerms.TryGetValue(code, out var p))
                context.RolePermissions.Add(new RolePermission { RoleId = RoleTrainerId, PermissionId = p.Id });

        // EMPLOYEE: own data + learn + attempt + submit
        var empPerms = new HashSet<string>
        {
            PermissionConstants.AuthLogin, PermissionConstants.AuthRefreshToken, PermissionConstants.AuthLogout,
            PermissionConstants.AccountViewOwn, PermissionConstants.AccountUpdateOwnProfile, PermissionConstants.AccountChangeOwnPassword,
            PermissionConstants.EmployeeRead,
            PermissionConstants.CompetencyCategoryRead, PermissionConstants.CompetencyRead, PermissionConstants.PositionRequirementRead,
            PermissionConstants.EmployeeCompetencyProfileRead,
            PermissionConstants.EvidenceRead,
            PermissionConstants.CourseReadCatalog, PermissionConstants.LearningProgressRead, PermissionConstants.LessonComplete,
            PermissionConstants.AttemptStart, PermissionConstants.AttemptSubmit, PermissionConstants.AttemptReadResult,
            PermissionConstants.CertificateRead, PermissionConstants.CertificateDownloadPdf,
            PermissionConstants.SkillGapRead, PermissionConstants.LearningRecommendationRead, PermissionConstants.TrainingRiskRead, PermissionConstants.ReadinessRead,
            PermissionConstants.TaskRead, PermissionConstants.TaskSubmit, PermissionConstants.TaskUpdateProgress, PermissionConstants.TaskAttachmentDownload,
            PermissionConstants.DashboardEmployeeRead,
            PermissionConstants.NotificationReadOwn, PermissionConstants.NotificationMarkRead, PermissionConstants.NotificationSignalrConnect,
            PermissionConstants.FileUploadTaskSubmission, PermissionConstants.FileDownloadAuthorized,
        };
        foreach (var code in empPerms)
            if (allPerms.TryGetValue(code, out var p))
                context.RolePermissions.Add(new RolePermission { RoleId = RoleEmployeeId, PermissionId = p.Id });

        // CERT_VERIFIER: verification only
        var verPerms = new HashSet<string>
        {
            PermissionConstants.AuthLogin, PermissionConstants.AuthRefreshToken,
            PermissionConstants.CertificateRead, PermissionConstants.CertificateVerifyPublic,
            PermissionConstants.NotificationSignalrConnect,
        };
        foreach (var code in verPerms)
            if (allPerms.TryGetValue(code, out var p))
                context.RolePermissions.Add(new RolePermission { RoleId = RoleCertVerifierId, PermissionId = p.Id });

        await context.SaveChangesAsync();
    }
}
