using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity Notification với bảng "notifications" (thông báo in-app, được push realtime qua SignalR).
/// </summary>
public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("notifications", table =>
        {
            table.HasCheckConstraint("ck_notifications_read_at", "(is_read = false AND read_at IS NULL) OR is_read = true");
        });
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Type).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Title).IsRequired().HasMaxLength(250);
        builder.Property(x => x.Message).IsRequired();
        builder.Property(x => x.RelatedEntityType).HasMaxLength(80);
        builder.Property(x => x.IsRead).HasDefaultValue(false);

        builder.HasOne<User>().WithMany().HasForeignKey(x => x.RecipientUserId);

        builder.HasIndex(x => new { x.RecipientUserId, x.IsRead, x.CreatedAt })
            .IsDescending(false, false, true)
            .HasDatabaseName("ix_notifications_recipient_unread");
    }
}
