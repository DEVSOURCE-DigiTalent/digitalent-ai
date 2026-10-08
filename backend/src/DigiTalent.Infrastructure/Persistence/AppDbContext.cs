using DigiTalent.Application.Common.Events;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Common;
using DigiTalent.Domain.Entities;
using DigiTalent.Domain.Entities.Learner;
using DigiTalent.Infrastructure.Events;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Infrastructure.Persistence;

/// <summary>
/// Schema chuẩn: docs/database/DigiTalent_AI_Canonical_v2_3.sql — entity + configuration viết khớp file đó.
/// </summary>
public class AppDbContext : DbContext, IApplicationDbContext
{
    /// <summary>Event sinh event mới được xử lý ở vòng sau; quá số vòng này coi là vòng lặp vô hạn.</summary>
    private const int MaxDomainEventRounds = 3;

    private readonly List<IDomainEvent> _pendingEvents = new();
    private readonly IDomainEventDispatcher? _eventDispatcher;
    private readonly AfterCommitQueue? _afterCommitQueue;
    private bool _inManagedTransaction;

    /// <summary>Dùng cho test / công cụ: domain event bị bỏ qua (không có dispatcher).</summary>
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    /// <summary>Dùng khi chạy thật (DI chọn constructor này): domain event được xử lý khi SaveChangesAsync.</summary>
    public AppDbContext(
        DbContextOptions<AppDbContext> options,
        IDomainEventDispatcher eventDispatcher,
        AfterCommitQueue afterCommitQueue) : base(options)
    {
        _eventDispatcher = eventDispatcher;
        _afterCommitQueue = afterCommitQueue;
    }

    // Auth
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<User> Users => Set<User>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();

    // Organization & Job Architecture
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<JobFamily> JobFamilies => Set<JobFamily>();
    public DbSet<JobPosition> JobPositions => Set<JobPosition>();
    public DbSet<Organization> Organizations => Set<Organization>();

    // Competency & Position Requirements
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

    // Learner Surface (SEP-09)
    public DbSet<LearnerProfile> LearnerProfiles => Set<LearnerProfile>();

    public DbSet<TrialRegistration> TrialRegistrations => Set<TrialRegistration>();
    public DbSet<TrialWorkspace> TrialWorkspaces => Set<TrialWorkspace>();
    public DbSet<TrialInvitation> TrialInvitations => Set<TrialInvitation>();
    public DbSet<PositionDiagnosticAttempt> PositionDiagnosticAttempts => Set<PositionDiagnosticAttempt>();

    // Individual Commerce & Registration (v3.0)
    public DbSet<IndividualRegistration> IndividualRegistrations => Set<IndividualRegistration>();
    public DbSet<IndividualEmailVerificationChallenge> IndividualEmailVerificationChallenges => Set<IndividualEmailVerificationChallenge>();
    public DbSet<IndividualTrialRedemption> IndividualTrialRedemptions => Set<IndividualTrialRedemption>();
    public DbSet<UserSubscription> UserSubscriptions => Set<UserSubscription>();
    public DbSet<PurchaseDraft> PurchaseDrafts => Set<PurchaseDraft>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<PaymentEvent> PaymentEvents => Set<PaymentEvent>();
    public DbSet<EmailOutboxItem> EmailOutboxItems => Set<EmailOutboxItem>();

    // Shared
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<FileObject> FileObjects => Set<FileObject>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Tự nạp mọi class *Configuration trong thư mục Persistence/Configurations
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        // Không xóa dây chuyền (cascade) — dữ liệu lịch sử phải được giữ lại (SQL v2.3 dùng RESTRICT/NO ACTION)
        foreach (var foreignKey in modelBuilder.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
        {
            foreignKey.DeleteBehavior = DeleteBehavior.Restrict;
        }
    }

    public void AddDomainEvent(IDomainEvent domainEvent) => _pendingEvents.Add(domainEvent);

    public async Task ExecuteInTransactionAsync(Func<Task> work, CancellationToken cancellationToken = default)
    {
        if (!Database.IsRelational())
        {
            await work(); // InMemory (test): không có transaction
            return;
        }

        if (_inManagedTransaction || Database.CurrentTransaction != null)
        {
            throw new InvalidOperationException("ExecuteInTransactionAsync cannot be nested inside another transaction.");
        }

        await using var transaction = await Database.BeginTransactionAsync(cancellationToken);
        _inManagedTransaction = true;
        try
        {
            await work();
            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            ResetAfterFailure();
            throw;
        }
        finally
        {
            _inManagedTransaction = false;
        }

        if (_afterCommitQueue != null)
        {
            await _afterCommitQueue.RunAsync(cancellationToken);
        }
    }

    /// <summary>
    /// Không có event: lưu như cũ. Có event: 1 transaction gồm thay đổi chính + thay đổi của handler,
    /// rồi mới chạy tác vụ sau commit (spec Sprint 3 §6.1, §6.4 E2–E4).
    /// </summary>
    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        if (_eventDispatcher == null)
        {
            _pendingEvents.Clear();
            return await SaveWithTimestampsAsync(cancellationToken);
        }

        // Transaction do caller tự mở (không qua ExecuteInTransactionAsync): không biết khi nào commit
        // → tác vụ sau commit (SignalR…) sẽ bị mất âm thầm. Chặn tường minh thay vì để lỗi ngầm (review S3-T018).
        if (_pendingEvents.Count > 0 && Database.IsRelational() && Database.CurrentTransaction != null && !_inManagedTransaction)
        {
            _pendingEvents.Clear();
            throw new InvalidOperationException(
                "Domain events cannot be dispatched inside a caller-owned transaction; use ExecuteInTransactionAsync.");
        }

        await using var transaction = _pendingEvents.Count > 0 && Database.IsRelational() && Database.CurrentTransaction == null
            ? await Database.BeginTransactionAsync(cancellationToken)
            : null;
        int saved;
        try
        {
            saved = await SaveWithTimestampsAsync(cancellationToken);
            saved += await DispatchPendingEventsAsync(cancellationToken);

            if (transaction != null)
            {
                await transaction.CommitAsync(cancellationToken);
            }
        }
        catch
        {
            // Transaction bị dispose khi chưa commit → rollback
            ResetAfterFailure();
            throw;
        }

        // Trong ExecuteInTransactionAsync: đợi transaction ngoài commit rồi mới chạy
        if (!_inManagedTransaction)
        {
            await _afterCommitQueue!.RunAsync(cancellationToken);
        }

        return saved;
    }

    /// <summary>
    /// Sau khi lưu thất bại: bỏ event, tác vụ sau commit và thay đổi đang theo dõi, để lần SaveChanges sau
    /// trong cùng request không lưu lại dữ liệu của lần thất bại.
    /// </summary>
    private void ResetAfterFailure()
    {
        _pendingEvents.Clear();
        _afterCommitQueue?.Clear();
        ChangeTracker.Clear();
    }

    private async Task<int> DispatchPendingEventsAsync(CancellationToken cancellationToken)
    {
        var saved = 0;
        for (var round = 1; _pendingEvents.Count > 0; round++)
        {
            if (round > MaxDomainEventRounds)
            {
                throw new InvalidOperationException(
                    $"Domain events were still being raised after {MaxDomainEventRounds} rounds; a handler probably raises events in a loop.");
            }

            var batch = _pendingEvents.ToList();
            _pendingEvents.Clear();
            await _eventDispatcher!.DispatchAsync(batch, cancellationToken);
            saved += await SaveWithTimestampsAsync(cancellationToken);
        }

        return saved;
    }

    /// <summary>
    /// Điền created_at / updated_at rồi lưu. Lỗi xung đột (DbUpdateConcurrencyException, unique violation) được giữ nguyên
    /// để use case tự xử lý nếu muốn (VD: LoginUseCase thử lại); ExceptionHandlingMiddleware đổi thành 409 (spec §6.4 E7).
    /// </summary>
    private Task<int> SaveWithTimestampsAsync(CancellationToken cancellationToken)
    {
        // Tự điền created_at / updated_at cho entity có 2 cột này (IHasTimestamps & BaseEntity)
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
