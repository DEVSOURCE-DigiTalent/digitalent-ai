using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.ToTable("refresh_tokens");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.TokenHash).IsRequired();
        builder.HasIndex(t => t.TokenHash).IsUnique();
        builder.Property(t => t.IpHash).HasMaxLength(128);

        builder.Property(t => t.RevokedAt).IsConcurrencyToken();

        builder.HasOne<User>().WithMany().HasForeignKey(t => t.UserId);
        builder.HasOne<RefreshToken>().WithMany().HasForeignKey(t => t.ReplacedByTokenId);

        builder.HasIndex(t => t.UserId).HasDatabaseName("ix_refresh_tokens_user");
    }
}
