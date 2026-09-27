using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

public class OrganizationConfiguration : IEntityTypeConfiguration<Organization>
{
    public void Configure(EntityTypeBuilder<Organization> builder)
    {
        builder.ToTable("organizations", table =>
            table.HasCheckConstraint("ck_organizations_status", "status IN ('ACTIVE','INACTIVE')"));

        builder.HasKey(o => o.Id);

        builder.Property(o => o.Code).IsRequired().HasMaxLength(50);
        builder.HasIndex(o => o.Code).IsUnique();

        builder.Property(o => o.Name).IsRequired().HasMaxLength(200);
        builder.Property(o => o.Domain).HasMaxLength(255);
        builder.Property(o => o.Status).IsRequired().HasMaxLength(30);
    }
}
