using DigiTalent.Domain.Entities.Task;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations.Task;

public class PracticalTaskConfiguration : IEntityTypeConfiguration<PracticalTask>
{
    public void Configure(EntityTypeBuilder<PracticalTask> builder)
    {
        builder.ToTable("practical_tasks");

        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamptz");
        builder.Property(x => x.CreatedBy).HasColumnName("created_by");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamptz");
        builder.Property(x => x.UpdatedBy).HasColumnName("updated_by");

        builder.Property(x => x.OrganizationId).HasColumnName("organization_id");
        builder.Property(x => x.RelatedCourseId).HasColumnName("related_course_id");
        builder.Property(x => x.CompetencyId).HasColumnName("competency_id");
        builder.Property(x => x.Title).HasColumnName("title").HasMaxLength(255);
        builder.Property(x => x.Description).HasColumnName("description").HasColumnType("text");
        builder.Property(x => x.ExpectedOutput).HasColumnName("expected_output").HasColumnType("text");
        builder.Property(x => x.EvaluationCriteria).HasColumnName("evaluation_criteria").HasColumnType("jsonb");
        builder.Property(x => x.SourceType).HasColumnName("source_type").HasMaxLength(30);
        builder.Property(x => x.Status).HasColumnName("status").HasMaxLength(30);

        builder.HasMany(pt => pt.Assignments)
            .WithOne(ta => ta.Task)
            .HasForeignKey(ta => ta.TaskId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
