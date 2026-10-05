using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity TrainingBatch với bảng "training_batches" (đợt đào tạo).
/// </summary>
public class TrainingBatchConfiguration : IEntityTypeConfiguration<TrainingBatch>
{
    public void Configure(EntityTypeBuilder<TrainingBatch> builder)
    {
        builder.ToTable("training_batches", table =>
        {
            table.HasCheckConstraint("ck_training_batches_status", "status IN ('DRAFT','RUNNING','COMPLETED','CANCELLED')");
            table.HasCheckConstraint("ck_training_batches_dates", "start_date IS NULL OR end_date IS NULL OR end_date >= start_date");
        });
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Status).IsRequired().HasMaxLength(30);

        builder.HasOne<Organization>().WithMany().HasForeignKey(x => x.OrganizationId);
        builder.HasOne<User>().WithMany().HasForeignKey(x => x.CreatedByUserId);

        builder.HasIndex(x => new { x.OrganizationId, x.Status })
            .HasDatabaseName("ix_training_batches_org_status");
    }
}
