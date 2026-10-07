namespace DigiTalent.Domain.Constants.Authorization;

/// <summary>
/// MA TRẬN QUYỀN MẶC ĐỊNH (chép từ ma trận quyền chuẩn trong doc 09 mục 6 & 7) — dùng để SEED bảng role_permissions.
///
/// Lúc chạy, quyền được đọc từ database (bảng role_permissions), KHÔNG đọc từ file này:
/// admin có thể chỉnh ma trận trên giao diện. SYSTEM_ADMIN luôn có mọi quyền nên không cần liệt kê.
/// </summary>
public static class RolePermissions
{
    public static readonly IReadOnlyDictionary<string, string[]> Defaults = new Dictionary<string, string[]>
    {
        [Roles.HrManager] = new[]
        {
            Permissions.Account.ViewOwn,
            Permissions.Account.UpdateOwnProfile,
            Permissions.Account.ChangeOwnPassword,

            // Members & roles (OW-02, OW-03, OW-13): HR_MANAGER is the enterprise "Owner"
            Permissions.UserRole.UserRead,
            Permissions.UserRole.UserCreate,
            Permissions.UserRole.UserUpdate,
            Permissions.UserRole.UserLockUnlock,
            Permissions.UserRole.RoleRead,
            Permissions.UserRole.RoleAssignBusiness,

            Permissions.Department.Read,
            Permissions.Department.CreateUpdate,
            Permissions.JobFamily.Read,
            Permissions.JobFamily.CreateUpdate,
            Permissions.JobPosition.Read,
            Permissions.JobPosition.CreateUpdate,
            Permissions.JobGrade.Read,
            Permissions.JobGrade.Manage,
            Permissions.Employee.Read,
            Permissions.Employee.CreateUpdate,
            Permissions.Employee.Transfer,
            Permissions.Employee.ArchiveRestore,
            Permissions.Employee.ManageManagerAssignment,

            Permissions.Competency.CategoryRead,
            Permissions.Competency.CategoryManage,
            Permissions.Competency.Read,
            Permissions.Competency.CreateUpdate,
            Permissions.Competency.Manage,
            Permissions.Competency.PositionRequirementRead,
            Permissions.Competency.PositionRequirementCreateUpdate,
            Permissions.Competency.PositionRequirementManage,
            Permissions.Competency.ProfileRead,
            Permissions.Competency.ProfileOverride,
            Permissions.Competency.EvidenceRead,
            Permissions.Competency.EvidenceCreateManual,

            Permissions.Learning.ReadCatalog,
            Permissions.Learning.CreateAssignment,
            Permissions.Learning.ReadAssignment,
            Permissions.Learning.CancelAssignment,
            Permissions.Learning.ReadProgress,

            Permissions.Assessment.Read,
            Permissions.Assessment.ResultExport,

            Permissions.Certificate.ManageTemplate,
            Permissions.Certificate.IssueAuto,
            Permissions.Certificate.IssueManual,
            Permissions.Certificate.Read,
            Permissions.Certificate.DownloadPdf,
            Permissions.Certificate.Revoke,
            Permissions.Certificate.Renew,
            Permissions.Certificate.ReadVerificationLog,

            Permissions.Intelligence.SkillGapCalculate,
            Permissions.Intelligence.SkillGapRead,
            Permissions.Intelligence.RecommendationGenerate,
            Permissions.Intelligence.RecommendationRead,
            Permissions.Intelligence.TrainingRiskCalculate,
            Permissions.Intelligence.TrainingRiskRead,
            Permissions.Intelligence.ReadinessCalculate,
            Permissions.Intelligence.ReadinessRead,
            Permissions.Intelligence.CareerReadinessRead,
            Permissions.Intelligence.AiExplanationRead,
            Permissions.Intelligence.ScoringConfigManage,

            Permissions.Task.Read,
            Permissions.Task.AttachmentDownload,

            Permissions.Dashboard.HrCompanyRead,
            Permissions.Dashboard.CompetencyHeatmapRead,
            Permissions.Dashboard.ReportExport,

            Permissions.Notification.ReadOwn,
            Permissions.Notification.MarkRead,
            Permissions.Notification.Send,
            Permissions.Notification.SignalRConnect,

            Permissions.System.FileDownloadAuthorized,
            Permissions.System.AuditLogReadDepartment,
            Permissions.System.BusinessConfigManage,
        },

        [Roles.DepartmentManager] = new[]
        {
            Permissions.Account.ViewOwn,
            Permissions.Account.UpdateOwnProfile,
            Permissions.Account.ChangeOwnPassword,

            Permissions.Department.Read,
            Permissions.JobFamily.Read,
            Permissions.JobPosition.Read,
            Permissions.JobGrade.Read,
            Permissions.Employee.Read,

            Permissions.Competency.CategoryRead,
            Permissions.Competency.Read,
            Permissions.Competency.PositionRequirementRead,
            Permissions.Competency.ProfileRead,
            Permissions.Competency.EvidenceRead,
            Permissions.Competency.EvidenceApproveConfirm,

            Permissions.Learning.ReadCatalog,
            Permissions.Learning.ReadAssignment,
            Permissions.Learning.ReadProgress,

            Permissions.Assessment.Read,
            Permissions.Assessment.ResultExport,

            Permissions.Certificate.Read,
            Permissions.Certificate.DownloadPdf,

            Permissions.Intelligence.SkillGapCalculate,
            Permissions.Intelligence.SkillGapRead,
            Permissions.Intelligence.RecommendationRead,
            Permissions.Intelligence.TrainingRiskRead,
            Permissions.Intelligence.ReadinessRead,

            Permissions.Task.SuggestionGenerate,
            Permissions.Task.Create,
            Permissions.Task.Assign,
            Permissions.Task.Read,
            Permissions.Task.UpdateProgress,
            Permissions.Task.Evaluate,
            Permissions.Task.Reopen,
            Permissions.Task.Cancel,
            Permissions.Task.AttachmentDownload,

            Permissions.Dashboard.DepartmentRead,
            Permissions.Dashboard.CompetencyHeatmapRead,
            Permissions.Dashboard.ReportExport,

            Permissions.Notification.ReadOwn,
            Permissions.Notification.MarkRead,
            Permissions.Notification.Send,
            Permissions.Notification.SignalRConnect,

            Permissions.System.FileUploadTaskSubmission,
            Permissions.System.FileDownloadAuthorized,
            Permissions.System.AuditLogReadDepartment,
        },

        [Roles.Trainer] = new[]
        {
            Permissions.Account.ViewOwn,
            Permissions.Account.UpdateOwnProfile,
            Permissions.Account.ChangeOwnPassword,

            Permissions.Department.Read,
            Permissions.JobFamily.Read,
            Permissions.JobPosition.Read,

            Permissions.Competency.CategoryRead,
            Permissions.Competency.Read,
            Permissions.Competency.PositionRequirementRead,

            Permissions.Learning.ReadCatalog,
            Permissions.Learning.Create,
            Permissions.Learning.Update,
            Permissions.Learning.PublishUnpublish,
            Permissions.Learning.Archive,
            Permissions.Learning.ManageCompetencies,
            Permissions.Learning.UploadMaterial,
            Permissions.Learning.DownloadViewMaterial,
            Permissions.Learning.DeleteArchiveMaterial,
            Permissions.Learning.ReadAssignment,
            Permissions.Learning.ReadProgress,

            Permissions.Assessment.QuestionBankRead,
            Permissions.Assessment.QuestionCreateUpdate,
            Permissions.Assessment.QuestionAiGenerateDraft,
            Permissions.Assessment.QuestionApprovePublish,
            Permissions.Assessment.Read,
            Permissions.Assessment.CreateUpdate,
            Permissions.Assessment.PublishClose,
            Permissions.Assessment.AttemptReadResult,
            Permissions.Assessment.AttemptRegradeOverride,
            Permissions.Assessment.ResultExport,

            Permissions.Certificate.Read,
            Permissions.Certificate.DownloadPdf,

            Permissions.Intelligence.RecommendationRead,

            Permissions.Task.Read,
            Permissions.Task.AttachmentDownload,

            Permissions.Dashboard.TrainerRead,

            Permissions.Notification.ReadOwn,
            Permissions.Notification.MarkRead,
            Permissions.Notification.SignalRConnect,

            Permissions.System.FileUploadMaterial,
            Permissions.System.FileDownloadAuthorized,
        },

        [Roles.Employee] = new[]
        {
            Permissions.Account.ViewOwn,
            Permissions.Account.UpdateOwnProfile,
            Permissions.Account.ChangeOwnPassword,

            Permissions.Department.Read,
            Permissions.JobFamily.Read,
            Permissions.JobPosition.Read,

            Permissions.Competency.CategoryRead,
            Permissions.Competency.Read,
            Permissions.Competency.PositionRequirementRead,
            Permissions.Competency.ProfileRead,
            Permissions.Competency.EvidenceRead,

            Permissions.Learning.ReadCatalog,
            Permissions.Learning.ReadAssignment,
            Permissions.Learning.ReadProgress,
            Permissions.Learning.CompleteLesson,
            Permissions.Learning.DownloadViewMaterial,

            Permissions.Assessment.Read,
            Permissions.Assessment.AttemptStart,
            Permissions.Assessment.AttemptSubmit,
            Permissions.Assessment.AttemptReadResult,

            Permissions.Certificate.Read,
            Permissions.Certificate.DownloadPdf,
            Permissions.Certificate.VerifyPublic,

            Permissions.Intelligence.SkillGapRead,
            Permissions.Intelligence.RecommendationRead,
            Permissions.Intelligence.ReadinessRead,

            Permissions.Task.Read,
            Permissions.Task.UpdateProgress,
            Permissions.Task.Submit,
            Permissions.Task.AttachmentDownload,

            Permissions.Dashboard.EmployeeRead,

            Permissions.Notification.ReadOwn,
            Permissions.Notification.MarkRead,
            Permissions.Notification.SignalRConnect,

            Permissions.System.FileUploadTaskSubmission,
            Permissions.System.FileDownloadAuthorized,
        },
    };
}
