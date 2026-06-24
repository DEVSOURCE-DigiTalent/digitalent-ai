namespace DigiTalent.Shared.Constants;

public static class PermissionConstants
{
    // Auth
    public const string AuthLogin = "auth.login";
    public const string AuthRefreshToken = "auth.refresh_token";

    // User & Role
    public const string UserRead = "user.read";
    public const string UserCreate = "user.create";
    public const string UserUpdate = "user.update";
    public const string RoleAssignBusiness = "role.assign_business";

    // Organization
    public const string EmployeeRead = "employee.read";
    public const string EmployeeCreateUpdate = "employee.create_update";
    public const string DepartmentRead = "department.read";
    public const string DepartmentCreateUpdate = "department.create_update";
    public const string JobPositionRead = "job_position.read";
    public const string JobPositionCreateUpdate = "job_position.create_update";

    // Competency
    public const string CompetencyRead = "competency.read";
    public const string CompetencyManage = "competency.manage";
    public const string PositionRequirementRead = "position_requirement.read";
    public const string PositionRequirementManage = "position_requirement.manage";
    public const string EmployeeCompetencyProfileRead = "employee_competency_profile.read";

    // Course
    public const string CourseReadCatalog = "course.read_catalog";
    public const string CourseCreate = "course.create";
    public const string CourseUpdate = "course.update";
    public const string CoursePublishUnpublish = "course.publish_unpublish";
    public const string CourseAssignmentCreate = "course_assignment.create";

    // Assessment
    public const string AssessmentRead = "assessment.read";
    public const string AssessmentCreateUpdate = "assessment.create_update";
    public const string AttemptStart = "attempt.start";
    public const string AttemptSubmit = "attempt.submit";
    public const string AttemptReadResult = "attempt.read_result";

    // Certificate
    public const string CertificateIssueAuto = "certificate.issue_auto";
    public const string CertificateIssueManual = "certificate.issue_manual";
    public const string CertificateRead = "certificate.read";
    public const string CertificateVerifyPublic = "certificate.verify_public";
    public const string CertificateRevoke = "certificate.revoke";
    public const string CertificateDownloadPdf = "certificate.download_pdf";

    // Task
    public const string TaskCreate = "task.create";
    public const string TaskAssign = "task.assign";
    public const string TaskRead = "task.read";
    public const string TaskSubmit = "task.submit";
    public const string TaskEvaluate = "task.evaluate";
    public const string TaskAttachmentDownload = "task_attachment.download";

    // Dashboard
    public const string DashboardHrCompanyRead = "dashboard.hr_company.read";
    public const string DashboardDepartmentRead = "dashboard.department.read";
    public const string DashboardTrainerRead = "dashboard.trainer.read";
    public const string DashboardEmployeeRead = "dashboard.employee.read";

    // Intelligence
    public const string SkillGapCalculate = "skill_gap.calculate";
    public const string SkillGapRead = "skill_gap.read";
    public const string TrainingRiskRead = "training_risk.read";
    public const string ReadinessRead = "readiness.read";
    public const string ScoringConfigManage = "scoring_config.manage";

    // Evidence
    public const string EvidenceRead = "evidence.read";
    public const string EvidenceApproveConfirm = "evidence.approve_confirm";

    // Notification
    public const string NotificationReadOwn = "notification.read_own";
    public const string NotificationSend = "notification.send";

    // Audit
    public const string AuditLogReadSystem = "audit_log.read_system";
}

public static class RoleConstants
{
    public const string SystemAdmin = "SYSTEM_ADMIN";
    public const string HRManager = "HR_MANAGER";
    public const string DepartmentManager = "DEPARTMENT_MANAGER";
    public const string Trainer = "TRAINER";
    public const string Employee = "EMPLOYEE";
    public const string CertificateVerifier = "CERTIFICATE_VERIFIER";
}
