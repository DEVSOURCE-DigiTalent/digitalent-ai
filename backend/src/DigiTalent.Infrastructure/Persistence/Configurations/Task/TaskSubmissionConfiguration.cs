using DigiTalent.Domain.Entities.Task;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations.Task;

public class TaskSubmissionConfiguration : IEntityTypeConfiguration<TaskSubmission>
{
    public void Configure(EntityTypeBuilder<TaskSubmission> builder)
    {
        builder.ToTable("task_submissions");

        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamptz");
        builder.Property(x => x.CreatedBy).HasColumnName("created_by");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamptz");
        builder.Property(x => x.UpdatedBy).HasColumnName("updated_by");

        builder.Property(x => x.TaskAssignmentId).HasColumnName("task_assignment_id");
        builder.Property(x => x.SubmittedByUserId).HasColumnName("submitted_by_user_id");
        builder.Property(x => x.SubmissionText).HasColumnName("submission_text").HasColumnType("text");
        builder.Property(x => x.FileObjectId).HasColumnName("file_object_id");
        builder.Property(x => x.SubmittedAt).HasColumnName("submitted_at").HasColumnType("timestamptz");
        builder.Property(x => x.Status).HasColumnName("status").HasMaxLength(30);
    }
}
