using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

public class IndividualRegistrationConfiguration : IEntityTypeConfiguration<IndividualRegistration>
{
    public void Configure(EntityTypeBuilder<IndividualRegistration> builder)
    {
        builder.ToTable("individual_registrations", table =>
        {
            table.HasCheckConstraint("ck_ind_reg_intent", "intent IN ('TRIAL', 'PURCHASE')");
            table.HasCheckConstraint("ck_ind_reg_state", "state IN ('PENDING', 'VERIFIED', 'EXPIRED', 'CANCELLED')");
        });

        builder.HasKey(r => r.Id);
        builder.Property(r => r.Email).IsRequired().HasMaxLength(255);
        builder.Property(r => r.FullName).IsRequired().HasMaxLength(200);
        builder.Property(r => r.PasswordHash).IsRequired();
        builder.Property(r => r.AccessTokenHash).IsRequired();
        builder.Property(r => r.Intent).IsRequired().HasMaxLength(20);
        builder.Property(r => r.SelectedPlanCode).HasMaxLength(40);
        builder.Property(r => r.SelectedCycle).HasMaxLength(20);
        builder.Property(r => r.PricingVersion).HasMaxLength(40);
        builder.Property(r => r.PositionCode).HasMaxLength(80);
        builder.Property(r => r.Source).HasMaxLength(30).HasDefaultValue("landing");
        builder.Property(r => r.State).IsRequired().HasMaxLength(30).HasDefaultValue(IndividualRegistrationStates.Pending);

        builder.HasIndex(r => r.AccessTokenHash).IsUnique().HasDatabaseName("ux_ind_reg_access_token_hash");
        builder.HasIndex(r => r.ExpiresAt).HasDatabaseName("ix_ind_reg_expires_at");

        builder.HasOne(r => r.User).WithMany().HasForeignKey(r => r.UserId).OnDelete(DeleteBehavior.Restrict);
    }
}

public class IndividualEmailVerificationChallengeConfiguration : IEntityTypeConfiguration<IndividualEmailVerificationChallenge>
{
    public void Configure(EntityTypeBuilder<IndividualEmailVerificationChallenge> builder)
    {
        builder.ToTable("individual_email_verification_challenges", table =>
        {
            table.HasCheckConstraint("ck_ind_challenge_attempts", "attempt_count >= 0 AND attempt_count <= 5");
        });

        builder.HasKey(c => c.Id);
        builder.Property(c => c.CodeHash).IsRequired();
        builder.Property(c => c.MagicTokenHash).IsRequired();
        builder.Property(c => c.AttemptCount).HasDefaultValue(0);

        builder.HasIndex(c => c.MagicTokenHash).IsUnique().HasDatabaseName("ux_ind_challenge_magic_token");
        builder.HasIndex(c => new { c.RegistrationId, c.ConsumedAt }).HasDatabaseName("ix_ind_challenge_reg_active");

        builder.HasOne(c => c.Registration).WithMany().HasForeignKey(c => c.RegistrationId).OnDelete(DeleteBehavior.Cascade);
    }
}

public class IndividualTrialRedemptionConfiguration : IEntityTypeConfiguration<IndividualTrialRedemption>
{
    public void Configure(EntityTypeBuilder<IndividualTrialRedemption> builder)
    {
        builder.ToTable("individual_trial_redemptions");

        builder.HasKey(t => t.Id);
        builder.Property(t => t.NormalizedEmailHmac).IsRequired();
        builder.HasIndex(t => t.NormalizedEmailHmac).IsUnique().HasDatabaseName("ux_ind_trial_redemptions_email");
        builder.HasIndex(t => t.UserId).HasDatabaseName("ix_ind_trial_redemptions_user");

        builder.HasOne(t => t.User).WithMany().HasForeignKey(t => t.UserId).OnDelete(DeleteBehavior.Restrict);
    }
}

public class UserSubscriptionConfiguration : IEntityTypeConfiguration<UserSubscription>
{
    public void Configure(EntityTypeBuilder<UserSubscription> builder)
    {
        builder.ToTable("user_subscriptions", table =>
        {
            table.HasCheckConstraint("ck_user_subscriptions_status", "status IN ('TRIALING', 'ACTIVE', 'TRIAL_EXPIRED', 'EXPIRED')");
        });

        builder.HasKey(s => s.Id);
        builder.Property(s => s.PlanCode).IsRequired().HasMaxLength(40);
        builder.Property(s => s.Status).IsRequired().HasMaxLength(30);
        builder.Property(s => s.BillingCycle).HasMaxLength(20);
        builder.Property(s => s.TrialCourseLimit).HasDefaultValue(3);
        builder.Property(s => s.RenewalMode).IsRequired().HasMaxLength(20).HasDefaultValue("MANUAL");
        builder.Property(s => s.AutoRenew).HasDefaultValue(false);
        builder.Property(s => s.CancelAtPeriodEnd).HasDefaultValue(false);

        builder.HasIndex(s => s.UserId).HasDatabaseName("ix_user_subscriptions_user_id");

        builder.HasOne(s => s.User).WithMany().HasForeignKey(s => s.UserId).OnDelete(DeleteBehavior.Restrict);
    }
}

public class PurchaseDraftConfiguration : IEntityTypeConfiguration<PurchaseDraft>
{
    public void Configure(EntityTypeBuilder<PurchaseDraft> builder)
    {
        builder.ToTable("purchase_drafts", table =>
        {
            table.HasCheckConstraint("ck_purchase_drafts_status", "status IN ('DRAFT', 'PAYMENT_PENDING', 'PAID', 'EXPIRED', 'CANCELLED')");
            table.HasCheckConstraint("ck_purchase_drafts_amount", "amount > 0");
        });

        builder.HasKey(d => d.Id);
        builder.Property(d => d.PlanCode).IsRequired().HasMaxLength(40);
        builder.Property(d => d.Cycle).IsRequired().HasMaxLength(20);
        builder.Property(d => d.Currency).IsRequired().HasMaxLength(10).HasDefaultValue("VND");
        builder.Property(d => d.PricingVersion).IsRequired().HasMaxLength(40);
        builder.Property(d => d.Status).IsRequired().HasMaxLength(30).HasDefaultValue(PurchaseDraftStatuses.Draft);

        builder.HasIndex(d => new { d.UserId, d.Status }).HasDatabaseName("ix_purchase_drafts_user_status");

        builder.HasOne(d => d.User).WithMany().HasForeignKey(d => d.UserId).OnDelete(DeleteBehavior.Restrict);
    }
}

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("orders", table =>
        {
            table.HasCheckConstraint("ck_orders_status", "status IN ('PENDING', 'PAID', 'FAILED', 'EXPIRED', 'CANCELLED')");
            table.HasCheckConstraint("ck_orders_amount", "amount > 0");
        });

        builder.HasKey(o => o.Id);
        builder.Property(o => o.OrderCode).IsRequired();
        builder.Property(o => o.PublicCode).IsRequired().HasMaxLength(30);
        builder.Property(o => o.Currency).IsRequired().HasMaxLength(10).HasDefaultValue("VND");
        builder.Property(o => o.Status).IsRequired().HasMaxLength(30).HasDefaultValue(OrderStatuses.Pending);
        builder.Property(o => o.PaymentMethod).IsRequired().HasMaxLength(30).HasDefaultValue("BANK_QR");
        builder.Property(o => o.PayosPaymentLinkId).HasMaxLength(100);

        builder.HasIndex(o => o.OrderCode).IsUnique().HasDatabaseName("ux_orders_order_code");
        builder.HasIndex(o => o.PublicCode).IsUnique().HasDatabaseName("ux_orders_public_code");
        builder.HasIndex(o => new { o.UserId, o.Status }).HasDatabaseName("ix_orders_user_status");
        builder.HasIndex(o => o.PurchaseDraftId).HasDatabaseName("ix_orders_draft");

        builder.HasOne(o => o.User).WithMany().HasForeignKey(o => o.UserId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(o => o.PurchaseDraft).WithMany().HasForeignKey(o => o.PurchaseDraftId).OnDelete(DeleteBehavior.Restrict);
    }
}

public class PaymentEventConfiguration : IEntityTypeConfiguration<PaymentEvent>
{
    public void Configure(EntityTypeBuilder<PaymentEvent> builder)
    {
        builder.ToTable("payment_events");

        builder.HasKey(p => p.Id);
        builder.Property(p => p.Provider).IsRequired().HasMaxLength(30).HasDefaultValue("payos");
        builder.Property(p => p.ProviderEventId).HasMaxLength(150);
        builder.Property(p => p.Currency).IsRequired().HasMaxLength(10).HasDefaultValue("VND");
        builder.Property(p => p.RawPayload).IsRequired();
        builder.Property(p => p.ProcessingStatus).IsRequired().HasMaxLength(30);

        builder.HasIndex(p => new { p.Provider, p.OrderCode, p.ProviderEventId })
            .IsUnique()
            .HasDatabaseName("ux_payment_events_provider_order");
    }
}

public class EmailOutboxItemConfiguration : IEntityTypeConfiguration<EmailOutboxItem>
{
    public void Configure(EntityTypeBuilder<EmailOutboxItem> builder)
    {
        builder.ToTable("email_outbox", table =>
        {
            table.HasCheckConstraint("ck_email_outbox_status", "status IN ('QUEUED', 'SENT', 'FAILED')");
        });

        builder.HasKey(e => e.Id);
        builder.Property(e => e.RecipientEmail).IsRequired().HasMaxLength(255);
        builder.Property(e => e.TemplateName).IsRequired().HasMaxLength(50);
        builder.Property(e => e.Subject).IsRequired().HasMaxLength(255);
        builder.Property(e => e.BodyHtml).IsRequired();
        builder.Property(e => e.Status).IsRequired().HasMaxLength(30).HasDefaultValue(EmailOutboxStatuses.Queued);

        builder.HasIndex(e => new { e.Status, e.AttemptCount }).HasDatabaseName("ix_email_outbox_status_attempt");
    }
}
