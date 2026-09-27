using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

public class PermissionConfiguration : IEntityTypeConfiguration<Permission>
{
    public void Configure(EntityTypeBuilder<Permission> builder)
    {
        builder.ToTable("permissions");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Code).IsRequired().HasMaxLength(120);
        builder.HasIndex(p => p.Code).IsUnique();

        builder.Property(p => p.Module).IsRequired().HasMaxLength(80);
        builder.Property(p => p.Action).IsRequired().HasMaxLength(80);
    }
}
