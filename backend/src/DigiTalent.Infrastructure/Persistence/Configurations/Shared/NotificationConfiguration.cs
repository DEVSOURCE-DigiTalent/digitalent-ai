using DigiTalent.Domain.Entities.Shared;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations.Shared;

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("notifications");

        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamptz");
        builder.Property(x => x.CreatedBy).HasColumnName("created_by");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamptz");
        builder.Property(x => x.UpdatedBy).HasColumnName("updated_by");

        builder.Property(x => x.RecipientUserId).HasColumnName("recipient_user_id");
        builder.Property(x => x.Type).HasColumnName("type").HasMaxLength(80);
        builder.Property(x => x.Title).HasColumnName("title").HasMaxLength(255);
        builder.Property(x => x.Message).HasColumnName("message").HasColumnType("text");
        builder.Property(x => x.RelatedEntityType).HasColumnName("related_entity_type").HasMaxLength(80);
        builder.Property(x => x.RelatedEntityId).HasColumnName("related_entity_id");
        builder.Property(x => x.IsRead).HasColumnName("is_read");
        builder.Property(x => x.ReadAt).HasColumnName("read_at").HasColumnType("timestamptz");

        builder.HasIndex(x => new { x.RecipientUserId, x.IsRead })
            .HasDatabaseName("ix_notifications_recipient_isread");
    }
}
