using DigiTalent.Domain.Entities.Learning;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations.Learning;

public class CourseCompetencyConfiguration : IEntityTypeConfiguration<CourseCompetency>
{
    public void Configure(EntityTypeBuilder<CourseCompetency> builder)
    {
        builder.ToTable("course_competencies");

        builder.HasKey(x => new { x.CourseId, x.CompetencyId });

        builder.Property(x => x.CourseId)
            .HasColumnName("course_id");

        builder.Property(x => x.CompetencyId)
            .HasColumnName("competency_id");

        builder.Property(x => x.TargetLevelValue)
            .HasColumnName("target_level_value");

        builder.Property(x => x.CoverageWeight)
            .HasColumnType("numeric(5,2)")
            .HasColumnName("coverage_weight");

        builder.Property(x => x.Notes)
            .HasColumnType("text")
            .HasColumnName("notes");

        builder.Property(x => x.CreatedAt)
            .HasColumnType("timestamptz")
            .HasColumnName("created_at");

        builder.Property(x => x.CreatedBy)
            .HasColumnName("created_by");

        builder.Property(x => x.UpdatedAt)
            .HasColumnType("timestamptz")
            .HasColumnName("updated_at");

        builder.Property(x => x.UpdatedBy)
            .HasColumnName("updated_by");

        builder.HasOne(cc => cc.Course)
            .WithMany(c => c.CourseCompetencies)
            .HasForeignKey(cc => cc.CourseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(cc => cc.Competency)
            .WithMany()
            .HasForeignKey(cc => cc.CompetencyId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
