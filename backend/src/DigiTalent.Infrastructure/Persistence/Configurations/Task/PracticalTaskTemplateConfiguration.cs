using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity PracticalTaskTemplate với bảng "practical_task_templates" (mẫu bài tập thực hành).
/// </summary>
public class PracticalTaskTemplateConfiguration : IEntityTypeConfiguration<PracticalTaskTemplate>
{
    public void Configure(EntityTypeBuilder<PracticalTaskTemplate> builder)
    {
        builder.ToTable("practical_task_templates", table =>
        {
            table.HasCheckConstraint("ck_practical_task_templates_source_type", "source_type IN ('MANUAL','AI_DRAFT')");
            table.HasCheckConstraint("ck_practical_task_templates_status", "status IN ('DRAFT','ACTIVE','ARCHIVED')");
        });
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Title).IsRequired().HasMaxLength(250);
        builder.Property(x => x.Description).IsRequired();
        builder.Property(x => x.ExpectedOutput).IsRequired();
        builder.Property(x => x.GeneralMarkingCriteria).HasColumnType("jsonb");
        builder.Property(x => x.SourceType).IsRequired().HasMaxLength(30);
        builder.Property(x => x.Status).IsRequired().HasMaxLength(30);

        builder.HasOne<Organization>().WithMany().HasForeignKey(x => x.OrganizationId);
        builder.HasOne<Course>().WithMany().HasForeignKey(x => x.RelatedCourseId);
        builder.HasOne<User>().WithMany().HasForeignKey(x => x.CreatedByUserId);
    }
}
