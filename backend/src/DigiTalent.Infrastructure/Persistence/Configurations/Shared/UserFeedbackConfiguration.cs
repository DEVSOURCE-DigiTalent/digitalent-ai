using System.Text.Json;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

public class UserFeedbackConfiguration : IEntityTypeConfiguration<UserFeedback>
{
    public void Configure(EntityTypeBuilder<UserFeedback> builder)
    {
        builder.ToTable("user_feedbacks", table =>
        {
            table.HasCheckConstraint("ck_user_feedbacks_type",
                "type IN ('BUG', 'FEEDBACK', 'SUGGESTION')");
            table.HasCheckConstraint("ck_user_feedbacks_status",
                "status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')");
            table.HasCheckConstraint("ck_user_feedbacks_title_length",
                "char_length(title) BETWEEN 5 AND 200");
            table.HasCheckConstraint("ck_user_feedbacks_description_length",
                "char_length(description) BETWEEN 10 AND 5000");
        });
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Type).HasMaxLength(20).IsRequired();
        builder.Property(x => x.Title).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(5000).IsRequired();
        builder.Property(x => x.PageUrl).HasMaxLength(500);
        builder.Property(x => x.Status).HasMaxLength(20).IsRequired();
        builder.Property(x => x.Rating);
        builder.Property(x => x.Screenshots)
            .HasColumnType("jsonb")
            .HasConversion(
                v => v == null ? null : JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                v => v == null ? null : JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null),
                new ValueComparer<List<string>?>(
                    (a, b) => a == b || (a != null && b != null && a.SequenceEqual(b)),
                    v => v == null ? 0 : v.Aggregate(0, (hash, item) => HashCode.Combine(hash, item.GetHashCode())),
                    v => v == null ? null : v.ToList()));
        builder.Property(x => x.AdminNote).HasMaxLength(2000);

        builder.HasOne<User>().WithMany().HasForeignKey(x => x.UserId);
        builder.HasOne<Organization>().WithMany().HasForeignKey(x => x.OrganizationId);
        builder.HasOne<User>().WithMany().HasForeignKey(x => x.ResolvedByUserId);

        builder.HasIndex(x => x.UserId).HasDatabaseName("ix_user_feedbacks_user");
        builder.HasIndex(x => x.Status).HasDatabaseName("ix_user_feedbacks_status");
        builder.HasIndex(x => x.OrganizationId).HasDatabaseName("ix_user_feedbacks_org");
    }
}
