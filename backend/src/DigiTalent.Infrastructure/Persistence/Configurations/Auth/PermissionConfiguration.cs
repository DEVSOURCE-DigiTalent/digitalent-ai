using DigiTalent.Domain.Entities.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations.Auth;

public class PermissionConfiguration : IEntityTypeConfiguration<Permission>
{
    public void Configure(EntityTypeBuilder<Permission> builder)
    {
        builder.ToTable("permissions");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Code)
            .HasMaxLength(120)
            .IsRequired();

        builder.Property(x => x.Module)
            .HasMaxLength(80)
            .IsRequired();

        builder.Property(x => x.Action)
            .HasMaxLength(80)
            .IsRequired();

        builder.Property(x => x.Description)
            .HasColumnType("text");

        builder.HasIndex(x => x.Code)
            .IsUnique()
            .HasDatabaseName("ux_permissions_code");
    }
}
