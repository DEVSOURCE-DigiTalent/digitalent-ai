using DigiTalent.Domain.Entities.Auth;
using DigiTalent.Domain.Entities.Organization;
using DigiTalent.Domain.Entities.Competency;
using DigiTalent.Domain.Entities.Learning;
using DigiTalent.Domain.Entities.Assessment;
using DigiTalent.Domain.Entities.Certificate;
using DigiTalent.Domain.Entities.Task;
using DigiTalent.Domain.Entities.Intelligence;
using DigiTalent.Domain.Entities.Shared;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Organization> Organizations => Set<Organization>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<JobPosition> JobPositions => Set<JobPosition>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<CompetencyCategory> CompetencyCategories => Set<CompetencyCategory>();
    public DbSet<Competency> Competencies => Set<Competency>();
    public DbSet<CompetencyLevel> CompetencyLevels => Set<CompetencyLevel>();
    public DbSet<PositionCompetencyRequirement> PositionCompetencyRequirements => Set<PositionCompetencyRequirement>();
    public DbSet<EmployeeCompetencyProfile> EmployeeCompetencyProfiles => Set<EmployeeCompetencyProfile>();
    public DbSet<CompetencyEvidence> CompetencyEvidences => Set<CompetencyEvidence>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<CourseModule> CourseModules => Set<CourseModule>();
    public DbSet<Lesson> Lessons => Set<Lesson>();
    public DbSet<LearningMaterial> LearningMaterials => Set<LearningMaterial>();
    public DbSet<CourseCompetency> CourseCompetencies => Set<CourseCompetency>();
    public DbSet<CourseAssignment> CourseAssignments => Set<CourseAssignment>();
    public DbSet<Enrollment> Enrollments => Set<Enrollment>();
    public DbSet<LessonProgress> LessonProgresses => Set<LessonProgress>();
    public DbSet<QuestionBank> QuestionBanks => Set<QuestionBank>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<QuestionOption> QuestionOptions => Set<QuestionOption>();
    public DbSet<Assessment> Assessments => Set<Assessment>();
    public DbSet<AssessmentQuestion> AssessmentQuestions => Set<AssessmentQuestion>();
    public DbSet<AssessmentAttempt> AssessmentAttempts => Set<AssessmentAttempt>();
    public DbSet<AssessmentAnswer> AssessmentAnswers => Set<AssessmentAnswer>();
    public DbSet<CertificateTemplate> CertificateTemplates => Set<CertificateTemplate>();
    public DbSet<Certificate> Certificates => Set<Certificate>();
    public DbSet<CertificateVerificationLog> CertificateVerificationLogs => Set<CertificateVerificationLog>();
    public DbSet<PracticalTask> PracticalTasks => Set<PracticalTask>();
    public DbSet<TaskAssignment> TaskAssignments => Set<TaskAssignment>();
    public DbSet<TaskSubmission> TaskSubmissions => Set<TaskSubmission>();
    public DbSet<TaskEvaluation> TaskEvaluations => Set<TaskEvaluation>();
    public DbSet<SkillGapResult> SkillGapResults => Set<SkillGapResult>();
    public DbSet<SkillGapItem> SkillGapItems => Set<SkillGapItem>();
    public DbSet<LearningRecommendation> LearningRecommendations => Set<LearningRecommendation>();
    public DbSet<TrainingRiskScore> TrainingRiskScores => Set<TrainingRiskScore>();
    public DbSet<ReadinessScore> ReadinessScores => Set<ReadinessScore>();
    public DbSet<AiExplanationLog> AiExplanationLogs => Set<AiExplanationLog>();
    public DbSet<FileObject> FileObjects => Set<FileObject>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();
    public DbSet<ScoringConfig> ScoringConfigs => Set<ScoringConfig>();
    public DbSet<ScoringConfigItem> ScoringConfigItems => Set<ScoringConfigItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
