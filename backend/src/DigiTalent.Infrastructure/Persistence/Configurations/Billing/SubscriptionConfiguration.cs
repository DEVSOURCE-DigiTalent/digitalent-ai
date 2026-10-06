using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

public class SubscriptionConfiguration : IEntityTypeConfiguration<Subscription>
{
    public void Configure(EntityTypeBuilder<Subscription> builder)
    {
        builder.ToTable("subscriptions", table =>
        {
            table.ExcludeFromMigrations();
            table.HasCheckConstraint("ck_subscriptions_status", "status IN ('ACTIVE','EXPIRED','PAYMENT_REQUIRED','CANCELLED')");
            table.HasCheckConstraint("ck_subscriptions_cycle", "cycle IN ('month','year')");
        });
        builder.HasKey(x => x.Id);

        builder.Property(x => x.PlanCode).IsRequired().HasMaxLength(50);
        builder.Property(x => x.PlanName).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Status).IsRequired().HasMaxLength(30);
        builder.Property(x => x.Cycle).IsRequired().HasMaxLength(10);
        builder.Property(x => x.AmountPerPeriod).HasPrecision(18, 2);

        builder.HasOne<Organization>().WithMany().HasForeignKey(x => x.OrganizationId);

        builder.HasIndex(x => x.OrganizationId)
            .IsUnique()
            .HasDatabaseName("ux_subscriptions_org");
    }
}

public class SubscriptionEntitlementConfiguration : IEntityTypeConfiguration<SubscriptionEntitlement>
{
    public void Configure(EntityTypeBuilder<SubscriptionEntitlement> builder)
    {
        builder.ToTable("subscription_entitlements", table => table.ExcludeFromMigrations());
        builder.HasKey(x => x.Id);

        builder.Property(x => x.EntitlementKey).IsRequired().HasMaxLength(100);

        builder.HasOne<Subscription>().WithMany().HasForeignKey(x => x.SubscriptionId);

        builder.HasIndex(x => new { x.SubscriptionId, x.EntitlementKey })
            .IsUnique()
            .HasDatabaseName("ux_subscription_entitlements_sub_key");
    }
}

public class InvoiceConfiguration : IEntityTypeConfiguration<Invoice>
{
    public void Configure(EntityTypeBuilder<Invoice> builder)
    {
        builder.ToTable("invoices", table =>
        {
            table.ExcludeFromMigrations();
            table.HasCheckConstraint("ck_invoices_status", "status IN ('PAID','PENDING','FAILED','REFUNDED')");
        });
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Code).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Description).HasMaxLength(500);
        builder.Property(x => x.Amount).HasPrecision(18, 2);
        builder.Property(x => x.Status).IsRequired().HasMaxLength(30);

        builder.HasOne<Subscription>().WithMany().HasForeignKey(x => x.SubscriptionId);
        builder.HasOne<Organization>().WithMany().HasForeignKey(x => x.OrganizationId);

        builder.HasIndex(x => x.OrganizationId)
            .HasDatabaseName("ix_invoices_org");
    }
}
