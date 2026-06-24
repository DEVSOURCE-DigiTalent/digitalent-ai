using DigiTalent.Domain.Entities.Learning;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations.Learning;

public class CourseConfiguration : IEntityTypeConfiguration<Course>
{
    public void Configure(EntityTypeBuilder<Course> builder)
    {
        builder.ToTable("courses");

        builder.Property(x => x.Id)
            .HasColumnName("id");

        builder.Property(x => x.OrganizationId)
            .HasColumnName("organization_id");

        builder.Property(x => x.Code)
            .HasMaxLength(80)
            .HasColumnName("code");

        builder.Property(x => x.Title)
            .HasMaxLength(255)
            .HasColumnName("title");

        builder.Property(x => x.Description)
            .HasColumnType("text")
            .HasColumnName("description");

        builder.Property(x => x.DifficultyLevel)
            .HasMaxLength(30)
            .HasColumnName("difficulty_level");

        builder.Property(x => x.EstimatedDurationMinutes)
            .HasColumnName("estimated_duration_minutes");

        builder.Property(x => x.OwnerTrainerId)
            .HasColumnName("owner_trainer_id");

        builder.Property(x => x.PassingScore)
            .HasColumnType("numeric(5,2)")
            .HasColumnName("passing_score");

        builder.Property(x => x.Status)
            .HasMaxLength(30)
            .HasColumnName("status");

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

        builder.HasIndex(x => new { x.OrganizationId, x.Code })
            .IsUnique()
            .HasDatabaseName("ux_courses_org_code");

        builder.HasMany(c => c.Modules)
            .WithOne(m => m.Course)
            .HasForeignKey(m => m.CourseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(c => c.CourseCompetencies)
            .WithOne(cc => cc.Course)
            .HasForeignKey(cc => cc.CourseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(c => c.Assignments)
            .WithOne(ca => ca.Course)
            .HasForeignKey(ca => ca.CourseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(c => c.Enrollments)
            .WithOne(e => e.Course)
            .HasForeignKey(e => e.CourseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(c => c.Materials)
            .WithOne()
            .HasForeignKey(lm => lm.CourseId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
