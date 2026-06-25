using DigiTalent.Domain.Entities.Assessment;
using DigiTalent.Domain.Entities.Auth;
using DigiTalent.Domain.Entities.Certificate;
using DigiTalent.Domain.Entities.Competency;
using DigiTalent.Domain.Entities.Intelligence;
using DigiTalent.Domain.Entities.Learning;
using DigiTalent.Domain.Entities.Shared;
using DigiTalent.Domain.Entities.Task;
using Microsoft.EntityFrameworkCore;
// Organization entity aliased to avoid conflict with DigiTalent.Application.Organization namespace
using OrgEntity = DigiTalent.Domain.Entities.Organization.Organization;
using DeptEntity = DigiTalent.Domain.Entities.Organization.Department;
using PositionEntity = DigiTalent.Domain.Entities.Organization.JobPosition;
using EmpEntity = DigiTalent.Domain.Entities.Organization.Employee;

namespace DigiTalent.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<Role> Roles { get; }
    DbSet<Permission> Permissions { get; }
    DbSet<UserRole> UserRoles { get; }
    DbSet<RolePermission> RolePermissions { get; }
    DbSet<RefreshToken> RefreshTokens { get; }
    DbSet<OrgEntity> Organizations { get; }
    DbSet<DeptEntity> Departments { get; }
    DbSet<PositionEntity> JobPositions { get; }
    DbSet<EmpEntity> Employees { get; }
    DbSet<CompetencyCategory> CompetencyCategories { get; }
    DbSet<Competency> Competencies { get; }
    DbSet<CompetencyLevel> CompetencyLevels { get; }
    DbSet<PositionCompetencyRequirement> PositionCompetencyRequirements { get; }
    DbSet<EmployeeCompetencyProfile> EmployeeCompetencyProfiles { get; }
    DbSet<CompetencyEvidence> CompetencyEvidences { get; }
    DbSet<Course> Courses { get; }
    DbSet<CourseModule> CourseModules { get; }
    DbSet<Lesson> Lessons { get; }
    DbSet<LearningMaterial> LearningMaterials { get; }
    DbSet<CourseCompetency> CourseCompetencies { get; }
    DbSet<CourseAssignment> CourseAssignments { get; }
    DbSet<Enrollment> Enrollments { get; }
    DbSet<LessonProgress> LessonProgresses { get; }
    DbSet<QuestionBank> QuestionBanks { get; }
    DbSet<Question> Questions { get; }
    DbSet<QuestionOption> QuestionOptions { get; }
    DbSet<Assessment> Assessments { get; }
    DbSet<AssessmentQuestion> AssessmentQuestions { get; }
    DbSet<AssessmentAttempt> AssessmentAttempts { get; }
    DbSet<AssessmentAnswer> AssessmentAnswers { get; }
    DbSet<CertificateTemplate> CertificateTemplates { get; }
    DbSet<Certificate> Certificates { get; }
    DbSet<CertificateVerificationLog> CertificateVerificationLogs { get; }
    DbSet<PracticalTask> PracticalTasks { get; }
    DbSet<TaskAssignment> TaskAssignments { get; }
    DbSet<TaskSubmission> TaskSubmissions { get; }
    DbSet<TaskEvaluation> TaskEvaluations { get; }
    DbSet<SkillGapResult> SkillGapResults { get; }
    DbSet<SkillGapItem> SkillGapItems { get; }
    DbSet<LearningRecommendation> LearningRecommendations { get; }
    DbSet<TrainingRiskScore> TrainingRiskScores { get; }
    DbSet<ReadinessScore> ReadinessScores { get; }
    DbSet<AiExplanationLog> AiExplanationLogs { get; }
    DbSet<FileObject> FileObjects { get; }
    DbSet<Notification> Notifications { get; }
    DbSet<AuditLog> AuditLogs { get; }
    DbSet<SystemSetting> SystemSettings { get; }
    DbSet<ScoringConfig> ScoringConfigs { get; }
    DbSet<ScoringConfigItem> ScoringConfigItems { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    DbSet<TEntity> Set<TEntity>() where TEntity : class;
}
