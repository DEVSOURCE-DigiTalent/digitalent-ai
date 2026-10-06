using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

public class TaskSubmissionFileConfiguration : IEntityTypeConfiguration<TaskSubmissionFile>
{
    public void Configure(EntityTypeBuilder<TaskSubmissionFile> builder)
    {
        builder.ToTable("task_submission_files");
        builder.HasKey(x => new { x.SubmissionId, x.FileObjectId });

        builder.HasOne<TaskSubmission>().WithMany().HasForeignKey(x => x.SubmissionId);
        builder.HasOne<FileObject>().WithMany().HasForeignKey(x => x.FileObjectId);
    }
}
