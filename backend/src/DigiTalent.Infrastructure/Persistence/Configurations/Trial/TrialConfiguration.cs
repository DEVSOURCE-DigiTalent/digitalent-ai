using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

public sealed class TrialRegistrationConfiguration : IEntityTypeConfiguration<TrialRegistration>
{
    public void Configure(EntityTypeBuilder<TrialRegistration> b)
    {
        b.ToTable("trial_registrations"); b.HasKey(x => x.Id);
        b.Property(x => x.Email).HasMaxLength(255);
        b.HasIndex(x => x.Email).IsUnique(); b.HasIndex(x => x.TokenHash).IsUnique();
        b.Property(x => x.Revision).IsConcurrencyToken();
        b.HasOne<Organization>().WithMany().HasForeignKey(x => x.OrganizationId);
    }
}
public sealed class TrialWorkspaceConfiguration : IEntityTypeConfiguration<TrialWorkspace>
{
    public void Configure(EntityTypeBuilder<TrialWorkspace> b)
    {
        b.ToTable("trial_workspaces", t =>
        {
            t.HasCheckConstraint("ck_trial_workspaces_request", "requested_at IS NULL OR test_deadline IS NOT NULL");
            t.HasCheckConstraint("ck_trial_workspaces_mentor", "(mentor_user_id IS NULL) = (mentor_assigned_at IS NULL)");
            t.HasCheckConstraint("ck_trial_workspaces_report", "report_published_at IS NULL OR mentor_user_id IS NOT NULL");
        });
        b.HasKey(x => x.Id);
        b.HasIndex(x => x.OrganizationId).IsUnique(); b.HasIndex(x => x.OwnerUserId).IsUnique();
        b.Property(x => x.Revision).IsConcurrencyToken();
        b.Property(x => x.RequestNote).HasMaxLength(500);
        b.HasOne<Organization>().WithMany().HasForeignKey(x => x.OrganizationId);
        b.HasOne<User>().WithMany().HasForeignKey(x => x.OwnerUserId);
        b.HasOne<User>().WithMany().HasForeignKey(x => x.MentorUserId);
        b.HasIndex(x => x.MentorUserId).HasDatabaseName("ix_trial_workspaces_mentor_user_id");
        b.HasOne<Department>().WithMany().HasForeignKey(x => x.DepartmentId);
        b.HasOne<JobPosition>().WithMany().HasForeignKey(x => x.PositionId);
    }
}
public sealed class TrialInvitationConfiguration : IEntityTypeConfiguration<TrialInvitation>
{
    public void Configure(EntityTypeBuilder<TrialInvitation> b)
    {
        b.ToTable("trial_invitations"); b.HasKey(x => x.Id);
        b.Property(x => x.Email).HasMaxLength(255);
        b.HasIndex(x => new { x.OrganizationId, x.Email }).IsUnique();
        b.HasIndex(x => x.TokenHash).IsUnique();
        b.HasOne<Organization>().WithMany().HasForeignKey(x => x.OrganizationId);
        b.HasOne<Department>().WithMany().HasForeignKey(x => x.DepartmentId);
        b.HasOne<JobPosition>().WithMany().HasForeignKey(x => x.PositionId);
        b.HasOne<Employee>().WithMany().HasForeignKey(x => x.EmployeeId);
    }
}
public sealed class PositionDiagnosticAttemptConfiguration : IEntityTypeConfiguration<PositionDiagnosticAttempt>
{
    public void Configure(EntityTypeBuilder<PositionDiagnosticAttempt> b)
    {
        b.ToTable("position_diagnostic_attempts"); b.HasKey(x => x.Id);
        b.HasIndex(x => new { x.OrganizationId, x.EmployeeId }).IsUnique();
        b.Property(x => x.AnswerRevision).IsConcurrencyToken();
        b.HasOne<Organization>().WithMany().HasForeignKey(x => x.OrganizationId);
        b.HasOne<Employee>().WithMany().HasForeignKey(x => x.EmployeeId);
        b.HasOne<JobPosition>().WithMany().HasForeignKey(x => x.PositionId);
    }
}

/// <summary>Map TrialAssessment với bảng "trial_assessments" (canonical v3.5).</summary>
public sealed class TrialAssessmentConfiguration : IEntityTypeConfiguration<TrialAssessment>
{
    public void Configure(EntityTypeBuilder<TrialAssessment> b)
    {
        b.ToTable("trial_assessments", t =>
        {
            t.HasCheckConstraint("ck_trial_assessments_choice", "choice_total >= 0 AND choice_score BETWEEN 0 AND choice_total");
            t.HasCheckConstraint("ck_trial_assessments_review", "(reviewed_at IS NULL) = (reviewed_by_user_id IS NULL)");
            t.HasCheckConstraint(
                "ck_trial_assessments_essay_scores",
                "(essay_basic_score IS NULL OR essay_basic_score BETWEEN 0 AND 10) AND (essay_intermediate_score IS NULL OR essay_intermediate_score BETWEEN 0 AND 10) AND (essay_advanced_score IS NULL OR essay_advanced_score BETWEEN 0 AND 10)");
            t.HasCheckConstraint("ck_trial_assessments_ai_review", "(ai_essay_review IS NULL) = (ai_essay_reviewed_at IS NULL)");
        });
        b.HasKey(x => x.Id);
        b.Property(x => x.EssayBasic).IsRequired();
        b.Property(x => x.EssayIntermediate).IsRequired();
        b.Property(x => x.EssayAdvanced).IsRequired();
        b.Property(x => x.ReviewNote).HasMaxLength(2000);
        b.Property(x => x.AiEssayReview).HasColumnType("jsonb");
        b.HasOne<Organization>().WithMany().HasForeignKey(x => x.OrganizationId);
        b.HasOne<Employee>().WithMany().HasForeignKey(x => x.EmployeeId);
        b.HasOne<ProctoringSession>().WithMany().HasForeignKey(x => x.ProctoringSessionId);
        b.HasOne<User>().WithMany().HasForeignKey(x => x.ReviewedByUserId);
        b.HasIndex(x => x.EmployeeId).IsUnique().HasDatabaseName("uq_trial_assessments_employee");
        b.HasIndex(x => x.OrganizationId).HasDatabaseName("ix_trial_assessments_organization_id");
        b.HasIndex(x => x.ProctoringSessionId).IsUnique().HasDatabaseName("uq_trial_assessments_session");
    }
}

/// <summary>Map TrialAssessmentDomain với bảng "trial_assessment_domains" (canonical v3.5).</summary>
public sealed class TrialAssessmentDomainConfiguration : IEntityTypeConfiguration<TrialAssessmentDomain>
{
    public void Configure(EntityTypeBuilder<TrialAssessmentDomain> b)
    {
        b.ToTable("trial_assessment_domains", t =>
        {
            t.HasCheckConstraint("ck_trial_assessment_domains_counts",
                "basic_correct BETWEEN 0 AND basic_total AND intermediate_correct BETWEEN 0 AND intermediate_total " +
                "AND advanced_correct BETWEEN 0 AND advanced_total");
            t.HasCheckConstraint("ck_trial_assessment_domains_levels",
                "suggested_level BETWEEN 0 AND 3 AND (mentor_level IS NULL OR mentor_level BETWEEN 0 AND 3)");
        });
        b.HasKey(x => x.Id);
        b.HasOne<TrialAssessment>().WithMany().HasForeignKey(x => x.TrialAssessmentId);
        b.HasOne<CompetencyCategory>().WithMany().HasForeignKey(x => x.CategoryId);
        b.HasIndex(x => new { x.TrialAssessmentId, x.CategoryId }).IsUnique().HasDatabaseName("uq_trial_assessment_domains_category");
        b.HasIndex(x => x.CategoryId).HasDatabaseName("ix_trial_assessment_domains_category_id");
    }
}
