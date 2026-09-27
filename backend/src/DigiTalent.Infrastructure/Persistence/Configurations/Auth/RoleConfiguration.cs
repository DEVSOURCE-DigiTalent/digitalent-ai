using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

public class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.ToTable("roles", table =>
        {
            table.HasCheckConstraint("ck_roles_scope_type", "scope_type IN ('GLOBAL','ORGANIZATION','DEPARTMENT','SELF')");
            table.HasCheckConstraint("ck_roles_status", "status IN ('ACTIVE','INACTIVE')");
        });

        builder.HasKey(r => r.Id);

        builder.Property(r => r.Code).IsRequired().HasMaxLength(80);
        builder.HasIndex(r => r.Code).IsUnique();

        builder.Property(r => r.Name).IsRequired().HasMaxLength(120);
        builder.Property(r => r.ScopeType).IsRequired().HasMaxLength(30);
        builder.Property(r => r.Status).IsRequired().HasMaxLength(30);
    }
}
