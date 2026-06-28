using DigiTalent.Domain.Entities.Organization;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations.Organization;

public class OrganizationConfiguration : IEntityTypeConfiguration<Domain.Entities.Organization.Organization>
{
    public void Configure(EntityTypeBuilder<Domain.Entities.Organization.Organization> builder)
    {
        builder.ToTable("organizations");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Code)
            .HasMaxLength(80);

        builder.Property(x => x.Name)
            .HasMaxLength(255);

        builder.Property(x => x.Domain)
            .HasMaxLength(255);

        builder.Property(x => x.Status)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(x => x.CreatedAt)
            .HasColumnType("timestamptz");

        builder.Property(x => x.UpdatedAt)
            .HasColumnType("timestamptz");

        builder.HasIndex(x => x.Code)
            .IsUnique()
            .HasDatabaseName("ux_organizations_code");

        builder.HasMany(o => o.Departments)
            .WithOne(d => d.Organization)
            .HasForeignKey(d => d.OrganizationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(o => o.JobPositions)
            .WithOne(jp => jp.Organization)
            .HasForeignKey(jp => jp.OrganizationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(o => o.Employees)
            .WithOne(e => e.Organization)
            .HasForeignKey(e => e.OrganizationId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
