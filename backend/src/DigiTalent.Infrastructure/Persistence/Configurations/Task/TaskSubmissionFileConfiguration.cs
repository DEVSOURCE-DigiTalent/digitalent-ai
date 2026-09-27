using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity TaskSubmissionFile với bảng "task_submission_files".
/// Database là gốc: tên cột tự đổi sang snake_case, không khai báo lại ở đây.
/// </summary>
public class TaskSubmissionFileConfiguration : IEntityTypeConfiguration<TaskSubmissionFile>
{
    public void Configure(EntityTypeBuilder<TaskSubmissionFile> builder)
    {
        builder.ToTable("task_submission_files");
        builder.HasKey(x => new { x.SubmissionId, x.FileObjectId });
    }
}
