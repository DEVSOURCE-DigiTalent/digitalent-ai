using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity TaskSubmission với bảng "task_submissions" (bài nộp có version).
/// </summary>
public class TaskSubmissionConfiguration : IEntityTypeConfiguration<TaskSubmission>
{
    public void Configure(EntityTypeBuilder<TaskSubmission> builder)
    {
        builder.ToTable("task_submissions", table =>
        {
            table.HasCheckConstraint("ck_task_submissions_version", "version_no > 0");
            table.HasCheckConstraint("ck_task_submissions_status", "status IN ('SUBMITTED','UNDER_REVIEW','SUPERSEDED')");
            table.HasCheckConstraint(
                "ck_task_submissions_not_self_supersede",
                "supersedes_submission_id IS NULL OR supersedes_submission_id <> id");
        });
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Status).IsRequired().HasMaxLength(30);

        builder.HasOne<TaskAssignment>().WithMany().HasForeignKey(x => x.TaskAssignmentId);
        builder.HasOne<TaskSubmission>().WithMany().HasForeignKey(x => x.SupersedesSubmissionId);

        // 2 index cùng cột → phải dùng overload có tên (nếu không EF gộp làm một)
        // và vẫn khai báo HasDatabaseName vì convention snake_case ghi đè tên trong DB.
        builder.HasIndex(x => new { x.TaskAssignmentId, x.VersionNo }, "uq_task_submissions_assignment_version")
            .IsUnique()
            .HasDatabaseName("uq_task_submissions_assignment_version");
        builder.HasIndex(x => new { x.TaskAssignmentId, x.VersionNo }, "ix_task_submissions_assignment")
            .IsDescending(false, true)
            .HasDatabaseName("ix_task_submissions_assignment");
    }
}
