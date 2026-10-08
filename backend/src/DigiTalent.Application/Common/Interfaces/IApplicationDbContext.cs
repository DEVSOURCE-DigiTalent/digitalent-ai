using DigiTalent.Domain.Common;
using DigiTalent.Domain.Entities;
using DigiTalent.Domain.Entities.Learner;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.Common.Interfaces;

/// <summary>
/// Use case làm việc với database qua interface này (không dùng thẳng AppDbContext).
/// Mỗi DbSet là 1 bảng. Thêm entity mới → thêm DbSet ở đây VÀ trong AppDbContext.cs.
/// Schema chuẩn: docs/database/DigiTalent_AI_Canonical_v2_3.sql.
/// </summary>
public interface IApplicationDbContext
{
    // Auth
    DbSet<Permission> Permissions { get; }
    DbSet<RefreshToken> RefreshTokens { get; }
    DbSet<Role> Roles { get; }
    DbSet<RolePermission> RolePermissions { get; }
    DbSet<User> Users { get; }
    DbSet<UserRole> UserRoles { get; }

    // Organization & Job Architecture
    DbSet<Department> Departments { get; }
    DbSet<Employee> Employees { get; }
    DbSet<JobFamily> JobFamilies { get; }
    DbSet<JobPosition> JobPositions { get; }
    DbSet<Organization> Organizations { get; }

    // Competency & Position Requirements
    DbSet<Competency> Competencies { get; }
    DbSet<CompetencyCategory> CompetencyCategories { get; }
    DbSet<CompetencyEvaluationResult> CompetencyEvaluationResults { get; }
    DbSet<CompetencyEvidence> CompetencyEvidences { get; }
    DbSet<CompetencyFramework> CompetencyFrameworks { get; }
    DbSet<CompetencyFrameworkMapping> CompetencyFrameworkMappings { get; }
    DbSet<CompetencyLevelCriterion> CompetencyLevelCriteria { get; }
    DbSet<EmployeeCompetencyProfile> EmployeeCompetencyProfiles { get; }
    DbSet<PositionRequirementItem> PositionRequirementItems { get; }
    DbSet<PositionRequirementSet> PositionRequirementSets { get; }

    // Learning (khóa học)
    DbSet<Course> Courses { get; }
    DbSet<CourseAssignment> CourseAssignments { get; }
    DbSet<CourseCompetency> CourseCompetencies { get; }
    DbSet<CourseLearningOutcome> CourseLearningOutcomes { get; }
    DbSet<CourseModule> CourseModules { get; }
    DbSet<CoursePrerequisite> CoursePrerequisites { get; }
    DbSet<Enrollment> Enrollments { get; }
    DbSet<LearningMaterial> LearningMaterials { get; }
    DbSet<Lesson> Lessons { get; }
    DbSet<LessonLearningOutcome> LessonLearningOutcomes { get; }
    DbSet<LessonProgress> LessonProgresses { get; }

    // Task (bài tập thực hành)
    DbSet<AssignedTaskTarget> AssignedTaskTargets { get; }
    DbSet<PracticalTaskTarget> PracticalTaskTargets { get; }
    DbSet<PracticalTaskTemplate> PracticalTaskTemplates { get; }
    DbSet<TaskAssignment> TaskAssignments { get; }
    DbSet<TaskEvaluation> TaskEvaluations { get; }
    DbSet<TaskSubmission> TaskSubmissions { get; }
    DbSet<TaskSubmissionFile> TaskSubmissionFiles { get; }

    // Assessment (kiểm tra)
    DbSet<Assessment> Assessments { get; }
    DbSet<AssessmentAnswer> AssessmentAnswers { get; }
    DbSet<AssessmentAttempt> AssessmentAttempts { get; }
    DbSet<AssessmentQuestion> AssessmentQuestions { get; }
    DbSet<Question> Questions { get; }
    DbSet<QuestionBank> QuestionBanks { get; }
    DbSet<QuestionOption> QuestionOptions { get; }

    // Certificate
    DbSet<Certificate> Certificates { get; }
    DbSet<CertificateTemplate> CertificateTemplates { get; }
    DbSet<CertificateVerificationLog> CertificateVerificationLogs { get; }

    // Intelligence (chấm điểm, phân tích)
    DbSet<ReadinessScore> ReadinessScores { get; }
    DbSet<ScoringConfig> ScoringConfigs { get; }
    DbSet<ScoringConfigItem> ScoringConfigItems { get; }
    DbSet<SkillGapItem> SkillGapItems { get; }
    DbSet<SkillGapRun> SkillGapRuns { get; }
    DbSet<TrainingRiskScore> TrainingRiskScores { get; }

    // Learner Surface (SEP-09)
    DbSet<LearnerProfile> LearnerProfiles { get; }

    DbSet<TrialRegistration> TrialRegistrations { get; }
    DbSet<TrialWorkspace> TrialWorkspaces { get; }
    DbSet<TrialInvitation> TrialInvitations { get; }
    DbSet<PositionDiagnosticAttempt> PositionDiagnosticAttempts { get; }

    // Individual Commerce & Registration (v3.0)
    DbSet<IndividualRegistration> IndividualRegistrations { get; }
    DbSet<IndividualEmailVerificationChallenge> IndividualEmailVerificationChallenges { get; }
    DbSet<IndividualTrialRedemption> IndividualTrialRedemptions { get; }
    DbSet<UserSubscription> UserSubscriptions { get; }
    DbSet<PurchaseDraft> PurchaseDrafts { get; }
    DbSet<Order> Orders { get; }
    DbSet<PaymentEvent> PaymentEvents { get; }
    DbSet<EmailOutboxItem> EmailOutboxItems { get; }

    // Shared
    DbSet<AuditLog> AuditLogs { get; }
    DbSet<FileObject> FileObjects { get; }
    DbSet<Notification> Notifications { get; }
    DbSet<SystemSetting> SystemSettings { get; }

    /// <summary>
    /// Phát domain event; handler chạy trong cùng transaction ở lần SaveChangesAsync kế tiếp
    /// (spec Sprint 3 §6.4 E1–E4).
    /// </summary>
    void AddDomainEvent(IDomainEvent domainEvent);

    /// <summary>
    /// Chạy nhiều lần SaveChangesAsync trong 1 transaction (VD: cần thứ tự câu lệnh để không vi phạm unique index).
    /// Domain event vẫn được xử lý; tác vụ sau commit chạy khi transaction này commit. Không lồng nhau.
    /// </summary>
    Task ExecuteInTransactionAsync(Func<Task> work, CancellationToken cancellationToken = default);

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
