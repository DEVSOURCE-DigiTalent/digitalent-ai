using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>Map PulseAiReview với bảng "pulse_ai_reviews" (canonical v3.7).</summary>
public class PulseAiReviewConfiguration : IEntityTypeConfiguration<PulseAiReview>
{
    public void Configure(EntityTypeBuilder<PulseAiReview> builder)
    {
        builder.ToTable("pulse_ai_reviews", table =>
        {
            table.HasCheckConstraint("ck_pulse_ai_reviews_kind", "submission_kind IN ('FINAL', 'PRE_ASSESSMENT')");
            table.HasCheckConstraint("ck_pulse_ai_reviews_input_hash", "char_length(input_hash) = 64");
        });
        builder.HasKey(x => x.Id);

        builder.Property(x => x.SubmissionKind).HasMaxLength(20).IsRequired();
        builder.Property(x => x.InputHash).HasMaxLength(64).IsRequired();
        builder.Property(x => x.Result).HasColumnType("jsonb").IsRequired();
        builder.Property(x => x.Model).HasMaxLength(100);

        builder.HasOne<Organization>().WithMany().HasForeignKey(x => x.OrganizationId);

        builder.HasIndex(x => new { x.SubmissionKind, x.SubmissionId })
            .IsUnique()
            .HasDatabaseName("uq_pulse_ai_reviews_submission");
        builder.HasIndex(x => x.OrganizationId)
            .HasDatabaseName("ix_pulse_ai_reviews_organization_id");
    }
}
