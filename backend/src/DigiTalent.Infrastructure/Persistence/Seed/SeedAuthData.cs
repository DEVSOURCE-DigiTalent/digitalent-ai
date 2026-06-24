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

        // Seed permissions
        var permissions = new List<Permission>
        {
            // Auth
            new() { Code = PermissionConstants.AuthLogin, Module = "Auth", Action = "login", Description = "Login to system" },
            new() { Code = PermissionConstants.AuthRefreshToken, Module = "Auth", Action = "refresh_token", Description = "Refresh access token" },

            // User & Role
            new() { Code = PermissionConstants.UserRead, Module = "User", Action = "read", Description = "View user accounts" },
            new() { Code = PermissionConstants.UserCreate, Module = "User", Action = "create", Description = "Create user accounts" },
            new() { Code = PermissionConstants.UserUpdate, Module = "User", Action = "update", Description = "Update user accounts" },
            new() { Code = PermissionConstants.RoleAssignBusiness, Module = "User", Action = "assign_business", Description = "Assign business roles" },

            // Organization
            new() { Code = PermissionConstants.EmployeeRead, Module = "Organization", Action = "read", Description = "View employee profiles" },
            new() { Code = PermissionConstants.EmployeeCreateUpdate, Module = "Organization", Action = "create_update", Description = "Create/update employee profiles" },
            new() { Code = PermissionConstants.DepartmentRead, Module = "Organization", Action = "read", Description = "View departments" },
            new() { Code = PermissionConstants.DepartmentCreateUpdate, Module = "Organization", Action = "create_update", Description = "Create/update departments" },
            new() { Code = PermissionConstants.JobPositionRead, Module = "Organization", Action = "read", Description = "View job positions" },
            new() { Code = PermissionConstants.JobPositionCreateUpdate, Module = "Organization", Action = "create_update", Description = "Create/update job positions" },

            // Competency
            new() { Code = PermissionConstants.CompetencyRead, Module = "Competency", Action = "read", Description = "View competencies" },
            new() { Code = PermissionConstants.CompetencyManage, Module = "Competency", Action = "manage", Description = "Manage competencies" },
            new() { Code = PermissionConstants.PositionRequirementRead, Module = "Competency", Action = "read", Description = "View position requirements" },
            new() { Code = PermissionConstants.PositionRequirementManage, Module = "Competency", Action = "manage", Description = "Manage position requirements" },
            new() { Code = PermissionConstants.EmployeeCompetencyProfileRead, Module = "Competency", Action = "read", Description = "View employee competency profiles" },

            // Course
            new() { Code = PermissionConstants.CourseReadCatalog, Module = "Course", Action = "read_catalog", Description = "View course catalog" },
            new() { Code = PermissionConstants.CourseCreate, Module = "Course", Action = "create", Description = "Create courses" },
            new() { Code = PermissionConstants.CourseUpdate, Module = "Course", Action = "update", Description = "Update courses" },
            new() { Code = PermissionConstants.CoursePublishUnpublish, Module = "Course", Action = "publish_unpublish", Description = "Publish/unpublish courses" },
            new() { Code = PermissionConstants.CourseAssignmentCreate, Module = "Course", Action = "assign", Description = "Assign courses" },

            // Assessment
            new() { Code = PermissionConstants.AssessmentRead, Module = "Assessment", Action = "read", Description = "View assessments" },
            new() { Code = PermissionConstants.AssessmentCreateUpdate, Module = "Assessment", Action = "create_update", Description = "Create/update assessments" },
            new() { Code = PermissionConstants.AttemptStart, Module = "Assessment", Action = "start", Description = "Start assessment attempt" },
            new() { Code = PermissionConstants.AttemptSubmit, Module = "Assessment", Action = "submit", Description = "Submit assessment attempt" },
            new() { Code = PermissionConstants.AttemptReadResult, Module = "Assessment", Action = "read_result", Description = "View attempt results" },

            // Certificate
            new() { Code = PermissionConstants.CertificateIssueAuto, Module = "Certificate", Action = "issue_auto", Description = "Auto-issue certificates" },
            new() { Code = PermissionConstants.CertificateIssueManual, Module = "Certificate", Action = "issue_manual", Description = "Manually issue certificates" },
            new() { Code = PermissionConstants.CertificateRead, Module = "Certificate", Action = "read", Description = "View certificates" },
            new() { Code = PermissionConstants.CertificateVerifyPublic, Module = "Certificate", Action = "verify_public", Description = "Verify certificate publicly" },
            new() { Code = PermissionConstants.CertificateRevoke, Module = "Certificate", Action = "revoke", Description = "Revoke certificates" },
            new() { Code = PermissionConstants.CertificateDownloadPdf, Module = "Certificate", Action = "download_pdf", Description = "Download certificate PDF" },

            // Task
            new() { Code = PermissionConstants.TaskCreate, Module = "Task", Action = "create", Description = "Create practical tasks" },
            new() { Code = PermissionConstants.TaskAssign, Module = "Task", Action = "assign", Description = "Assign practical tasks" },
            new() { Code = PermissionConstants.TaskRead, Module = "Task", Action = "read", Description = "View tasks" },
            new() { Code = PermissionConstants.TaskSubmit, Module = "Task", Action = "submit", Description = "Submit task results" },
            new() { Code = PermissionConstants.TaskEvaluate, Module = "Task", Action = "evaluate", Description = "Evaluate task submissions" },
            new() { Code = PermissionConstants.TaskAttachmentDownload, Module = "Task", Action = "download", Description = "Download task attachments" },

            // Dashboard
            new() { Code = PermissionConstants.DashboardHrCompanyRead, Module = "Dashboard", Action = "hr_company_read", Description = "View HR company dashboard" },
            new() { Code = PermissionConstants.DashboardDepartmentRead, Module = "Dashboard", Action = "department_read", Description = "View department dashboard" },
            new() { Code = PermissionConstants.DashboardTrainerRead, Module = "Dashboard", Action = "trainer_read", Description = "View trainer dashboard" },
            new() { Code = PermissionConstants.DashboardEmployeeRead, Module = "Dashboard", Action = "employee_read", Description = "View employee dashboard" },

            // Intelligence
            new() { Code = PermissionConstants.SkillGapCalculate, Module = "Intelligence", Action = "calculate", Description = "Calculate skill gaps" },
            new() { Code = PermissionConstants.SkillGapRead, Module = "Intelligence", Action = "read", Description = "View skill gap results" },
            new() { Code = PermissionConstants.TrainingRiskRead, Module = "Intelligence", Action = "read", Description = "View training risks" },
            new() { Code = PermissionConstants.ReadinessRead, Module = "Intelligence", Action = "read", Description = "View readiness scores" },
            new() { Code = PermissionConstants.ScoringConfigManage, Module = "Intelligence", Action = "manage", Description = "Manage scoring configs" },

            // Evidence
            new() { Code = PermissionConstants.EvidenceRead, Module = "Evidence", Action = "read", Description = "View evidence" },
            new() { Code = PermissionConstants.EvidenceApproveConfirm, Module = "Evidence", Action = "approve_confirm", Description = "Approve evidence" },

            // Notification
            new() { Code = PermissionConstants.NotificationReadOwn, Module = "Notification", Action = "read_own", Description = "Read own notifications" },
            new() { Code = PermissionConstants.NotificationSend, Module = "Notification", Action = "send", Description = "Send notifications" },

            // Audit
            new() { Code = PermissionConstants.AuditLogReadSystem, Module = "Audit", Action = "read_system", Description = "Read system audit logs" },
        };
        for (int i = 0; i < permissions.Count; i++)
            permissions[i].Id = Guid.Parse($"20000000-0000-0000-0000-{i:D12}");

        context.Permissions.AddRange(permissions);

        // Map permissions to roles (based on RBAC matrix: A=all, M=manage, R=read)
        // For simplicity, assign appropriate permission sets to each role

        // SYSTEM_ADMIN: all permissions
        foreach (var perm in permissions)
            context.RolePermissions.Add(new RolePermission { RoleId = RoleSystemAdminId, PermissionId = perm.Id });

        // HR_MANAGER: most permissions (excluding system-level audit)
        var hrPermCodes = new HashSet<string>
        {
            PermissionConstants.AuthLogin, PermissionConstants.AuthRefreshToken,
            PermissionConstants.UserRead, PermissionConstants.UserCreate, PermissionConstants.UserUpdate, PermissionConstants.RoleAssignBusiness,
            PermissionConstants.EmployeeRead, PermissionConstants.EmployeeCreateUpdate,
            PermissionConstants.DepartmentRead, PermissionConstants.DepartmentCreateUpdate,
            PermissionConstants.JobPositionRead, PermissionConstants.JobPositionCreateUpdate,
            PermissionConstants.CompetencyRead, PermissionConstants.CompetencyManage,
            PermissionConstants.PositionRequirementRead, PermissionConstants.PositionRequirementManage,
            PermissionConstants.EmployeeCompetencyProfileRead,
            PermissionConstants.CourseReadCatalog, PermissionConstants.CourseCreate, PermissionConstants.CourseUpdate, PermissionConstants.CoursePublishUnpublish, PermissionConstants.CourseAssignmentCreate,
            PermissionConstants.AssessmentRead, PermissionConstants.AssessmentCreateUpdate,
            PermissionConstants.AttemptReadResult,
            PermissionConstants.CertificateIssueAuto, PermissionConstants.CertificateIssueManual, PermissionConstants.CertificateRead, PermissionConstants.CertificateRevoke, PermissionConstants.CertificateDownloadPdf,
            PermissionConstants.TaskCreate, PermissionConstants.TaskAssign, PermissionConstants.TaskRead, PermissionConstants.TaskEvaluate, PermissionConstants.TaskAttachmentDownload,
            PermissionConstants.DashboardHrCompanyRead, PermissionConstants.DashboardDepartmentRead, PermissionConstants.DashboardTrainerRead,
            PermissionConstants.SkillGapCalculate, PermissionConstants.SkillGapRead, PermissionConstants.TrainingRiskRead, PermissionConstants.ReadinessRead, PermissionConstants.ScoringConfigManage,
            PermissionConstants.EvidenceRead, PermissionConstants.EvidenceApproveConfirm,
            PermissionConstants.NotificationReadOwn, PermissionConstants.NotificationSend,
        };
        foreach (var perm in permissions.Where(p => hrPermCodes.Contains(p.Code)))
            context.RolePermissions.Add(new RolePermission { RoleId = RoleHRManagerId, PermissionId = perm.Id });

        // DEPT_MANAGER: read + department-scoped manage
        var deptPermCodes = new HashSet<string>
        {
            PermissionConstants.AuthLogin, PermissionConstants.AuthRefreshToken,
            PermissionConstants.EmployeeRead, PermissionConstants.DepartmentRead, PermissionConstants.JobPositionRead,
            PermissionConstants.CompetencyRead, PermissionConstants.PositionRequirementRead, PermissionConstants.EmployeeCompetencyProfileRead,
            PermissionConstants.CourseReadCatalog, PermissionConstants.CourseAssignmentCreate,
            PermissionConstants.AttemptReadResult,
            PermissionConstants.CertificateRead, PermissionConstants.CertificateDownloadPdf,
            PermissionConstants.TaskCreate, PermissionConstants.TaskAssign, PermissionConstants.TaskRead, PermissionConstants.TaskEvaluate, PermissionConstants.TaskAttachmentDownload,
            PermissionConstants.DashboardDepartmentRead, PermissionConstants.DashboardEmployeeRead,
            PermissionConstants.SkillGapRead, PermissionConstants.TrainingRiskRead, PermissionConstants.ReadinessRead,
            PermissionConstants.EvidenceRead, PermissionConstants.EvidenceApproveConfirm,
            PermissionConstants.NotificationReadOwn,
        };
        foreach (var perm in permissions.Where(p => deptPermCodes.Contains(p.Code)))
            context.RolePermissions.Add(new RolePermission { RoleId = RoleDeptManagerId, PermissionId = perm.Id });

        // TRAINER: course authoring + assessment + task evaluation
        var trainerPermCodes = new HashSet<string>
        {
            PermissionConstants.AuthLogin, PermissionConstants.AuthRefreshToken,
            PermissionConstants.EmployeeRead, PermissionConstants.DepartmentRead, PermissionConstants.JobPositionRead,
            PermissionConstants.CompetencyRead, PermissionConstants.PositionRequirementRead, PermissionConstants.EmployeeCompetencyProfileRead,
            PermissionConstants.CourseReadCatalog, PermissionConstants.CourseCreate, PermissionConstants.CourseUpdate,
            PermissionConstants.AssessmentRead, PermissionConstants.AssessmentCreateUpdate, PermissionConstants.AttemptReadResult,
            PermissionConstants.CertificateRead, PermissionConstants.CertificateDownloadPdf,
            PermissionConstants.TaskCreate, PermissionConstants.TaskRead, PermissionConstants.TaskEvaluate, PermissionConstants.TaskAttachmentDownload,
            PermissionConstants.DashboardTrainerRead, PermissionConstants.DashboardEmployeeRead,
            PermissionConstants.SkillGapRead, PermissionConstants.TrainingRiskRead,
            PermissionConstants.EvidenceRead, PermissionConstants.EvidenceApproveConfirm,
            PermissionConstants.NotificationReadOwn,
        };
        foreach (var perm in permissions.Where(p => trainerPermCodes.Contains(p.Code)))
            context.RolePermissions.Add(new RolePermission { RoleId = RoleTrainerId, PermissionId = perm.Id });

        // EMPLOYEE: own data + learn + attempt + submit
        var empPermCodes = new HashSet<string>
        {
            PermissionConstants.AuthLogin, PermissionConstants.AuthRefreshToken,
            PermissionConstants.EmployeeRead,
            PermissionConstants.CompetencyRead, PermissionConstants.EmployeeCompetencyProfileRead, PermissionConstants.PositionRequirementRead,
            PermissionConstants.CourseReadCatalog,
            PermissionConstants.AttemptStart, PermissionConstants.AttemptSubmit, PermissionConstants.AttemptReadResult,
            PermissionConstants.CertificateRead, PermissionConstants.CertificateDownloadPdf,
            PermissionConstants.TaskRead, PermissionConstants.TaskSubmit, PermissionConstants.TaskAttachmentDownload,
            PermissionConstants.DashboardEmployeeRead,
            PermissionConstants.SkillGapRead, PermissionConstants.TrainingRiskRead, PermissionConstants.ReadinessRead,
            PermissionConstants.EvidenceRead,
            PermissionConstants.NotificationReadOwn,
        };
        foreach (var perm in permissions.Where(p => empPermCodes.Contains(p.Code)))
            context.RolePermissions.Add(new RolePermission { RoleId = RoleEmployeeId, PermissionId = perm.Id });

        // CERT_VERIFIER: verification only
        var verPermCodes = new HashSet<string>
        {
            PermissionConstants.AuthLogin, PermissionConstants.AuthRefreshToken,
            PermissionConstants.CertificateRead, PermissionConstants.CertificateVerifyPublic,
        };
        foreach (var perm in permissions.Where(p => verPermCodes.Contains(p.Code)))
            context.RolePermissions.Add(new RolePermission { RoleId = RoleCertVerifierId, PermissionId = perm.Id });

        await context.SaveChangesAsync();
    }
}
