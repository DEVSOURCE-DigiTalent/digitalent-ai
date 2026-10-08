using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

public class PracticalTaskTargetConfiguration : IEntityTypeConfiguration<PracticalTaskTarget>
{
    public void Configure(EntityTypeBuilder<PracticalTaskTarget> builder)
    {
        builder.ToTable("practical_task_targets", table =>
        {
            table.HasCheckConstraint("ck_practical_task_targets_level", "target_level BETWEEN 1 AND 3");
        });
        builder.HasKey(x => x.Id);

        builder.Property(x => x.RubricCriteria).HasColumnType("jsonb");

        builder.HasOne<PracticalTaskTemplate>().WithMany().HasForeignKey(x => x.TaskTemplateId);
        builder.HasOne<Competency>().WithMany().HasForeignKey(x => x.CompetencyId);

        builder.HasIndex(x => new { x.TaskTemplateId, x.CompetencyId }, "uq_practical_task_targets_template_competency")
            .IsUnique()
            .HasDatabaseName("uq_practical_task_targets_template_competency");
    }
}
