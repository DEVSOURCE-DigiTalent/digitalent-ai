using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Common;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Infrastructure.Persistence;

public class AppDbContext : DbContext, IApplicationDbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // Auth
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<User> Users => Set<User>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();

    // Organization
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<JobFamily> JobFamilies => Set<JobFamily>();
    public DbSet<JobPosition> JobPositions => Set<JobPosition>();
    public DbSet<Organization> Organizations => Set<Organization>();

    // Competency
    public DbSet<Competency> Competencies => Set<Competency>();
    public DbSet<CompetencyCategory> CompetencyCategories => Set<CompetencyCategory>();
    public DbSet<CompetencyEvaluationResult> CompetencyEvaluationResults => Set<CompetencyEvaluationResult>();
    public DbSet<CompetencyEvidence> CompetencyEvidences => Set<CompetencyEvidence>();
    public DbSet<CompetencyFramework> CompetencyFrameworks => Set<CompetencyFramework>();
    public DbSet<CompetencyFrameworkMapping> CompetencyFrameworkMappings => Set<CompetencyFrameworkMapping>();
    public DbSet<CompetencyLevelCriterion> CompetencyLevelCriteria => Set<CompetencyLevelCriterion>();
    public DbSet<EmployeeCompetencyProfile> EmployeeCompetencyProfiles => Set<EmployeeCompetencyProfile>();
    public DbSet<PositionRequirementItem> PositionRequirementItems => Set<PositionRequirementItem>();
    public DbSet<PositionRequirementSet> PositionRequirementSets => Set<PositionRequirementSet>();

    // Learning (khóa học)
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<CourseAssignment> CourseAssignments => Set<CourseAssignment>();
    public DbSet<CourseCompetency> CourseCompetencies => Set<CourseCompetency>();
    public DbSet<CourseLearningOutcome> CourseLearningOutcomes => Set<CourseLearningOutcome>();
    public DbSet<CourseModule> CourseModules => Set<CourseModule>();
    public DbSet<CoursePrerequisite> CoursePrerequisites => Set<CoursePrerequisite>();
    public DbSet<Enrollment> Enrollments => Set<Enrollment>();
    public DbSet<LearningMaterial> LearningMaterials => Set<LearningMaterial>();
    public DbSet<Lesson> Lessons => Set<Lesson>();
    public DbSet<LessonLearningOutcome> LessonLearningOutcomes => Set<LessonLearningOutcome>();
    public DbSet<LessonProgress> LessonProgresses => Set<LessonProgress>();

    // Task (bài tập thực hành)
    public DbSet<AssignedTaskTarget> AssignedTaskTargets => Set<AssignedTaskTarget>();
    public DbSet<PracticalTaskTarget> PracticalTaskTargets => Set<PracticalTaskTarget>();
    public DbSet<PracticalTaskTemplate> PracticalTaskTemplates => Set<PracticalTaskTemplate>();
    public DbSet<TaskAssignment> TaskAssignments => Set<TaskAssignment>();
    public DbSet<TaskEvaluation> TaskEvaluations => Set<TaskEvaluation>();
    public DbSet<TaskSubmission> TaskSubmissions => Set<TaskSubmission>();
    public DbSet<TaskSubmissionFile> TaskSubmissionFiles => Set<TaskSubmissionFile>();

    // Assessment (kiểm tra)
    public DbSet<Assessment> Assessments => Set<Assessment>();
    public DbSet<AssessmentAnswer> AssessmentAnswers => Set<AssessmentAnswer>();
    public DbSet<AssessmentAttempt> AssessmentAttempts => Set<AssessmentAttempt>();
    public DbSet<AssessmentQuestion> AssessmentQuestions => Set<AssessmentQuestion>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<QuestionBank> QuestionBanks => Set<QuestionBank>();
    public DbSet<QuestionOption> QuestionOptions => Set<QuestionOption>();

    // Certificate
    public DbSet<Certificate> Certificates => Set<Certificate>();
    public DbSet<CertificateTemplate> CertificateTemplates => Set<CertificateTemplate>();
    public DbSet<CertificateVerificationLog> CertificateVerificationLogs => Set<CertificateVerificationLog>();

    // Intelligence (chấm điểm, phân tích)
    public DbSet<ReadinessScore> ReadinessScores => Set<ReadinessScore>();
    public DbSet<ScoringConfig> ScoringConfigs => Set<ScoringConfig>();
    public DbSet<ScoringConfigItem> ScoringConfigItems => Set<ScoringConfigItem>();
    public DbSet<SkillGapItem> SkillGapItems => Set<SkillGapItem>();
    public DbSet<SkillGapRun> SkillGapRuns => Set<SkillGapRun>();
    public DbSet<TrainingRiskScore> TrainingRiskScores => Set<TrainingRiskScore>();

    // Shared
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<FileObject> FileObjects => Set<FileObject>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Tự nạp mọi class *Configuration trong thư mục Persistence/Configurations
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Tự điền created_at / updated_at cho entity có 2 cột này
        var now = DateTimeOffset.UtcNow;

        foreach (var entry in ChangeTracker.Entries<IHasTimestamps>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = now;
                entry.Entity.UpdatedAt = now;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = now;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
