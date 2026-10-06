using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

public class OrganizationSubscriptionConfiguration : IEntityTypeConfiguration<OrganizationSubscription>
{
    public void Configure(EntityTypeBuilder<OrganizationSubscription> builder)
    {
        builder.ToTable("organization_subscriptions", table =>
        {
            table.HasCheckConstraint("ck_organization_subscriptions_status", "status IN ('ACTIVE','EXPIRED','PAYMENT_REQUIRED')");
            table.HasCheckConstraint("ck_organization_subscriptions_seat_limit", "seat_limit IS NULL OR seat_limit > 0");
        });
        builder.HasKey(x => x.Id);

        builder.Property(x => x.PlanCode).IsRequired().HasMaxLength(50);
        builder.Property(x => x.PlanName).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Status).IsRequired().HasMaxLength(30);

        builder.HasOne<Organization>().WithMany().HasForeignKey(x => x.OrganizationId);
        builder.HasIndex(x => x.OrganizationId).IsUnique();
    }
}
