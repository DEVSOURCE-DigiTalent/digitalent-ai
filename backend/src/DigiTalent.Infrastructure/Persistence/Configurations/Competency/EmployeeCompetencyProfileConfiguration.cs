using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity EmployeeCompetencyProfile với bảng "employee_competency_profiles".
/// Cấp độ đã xác nhận — chỉ được ghi qua competency_evidences đã CONFIRMED.
/// </summary>
public class EmployeeCompetencyProfileConfiguration : IEntityTypeConfiguration<EmployeeCompetencyProfile>
{
    public void Configure(EntityTypeBuilder<EmployeeCompetencyProfile> builder)
    {
        builder.ToTable("employee_competency_profiles", table =>
        {
            table.HasCheckConstraint("ck_profile_confirmed_level", "confirmed_level BETWEEN 1 AND 3");
            table.HasCheckConstraint("ck_employee_competency_profiles_row_version", "row_version > 0");
        });
        builder.HasKey(x => x.Id);

        // Ghi đồng thời → DbUpdateConcurrencyException (use case tự tăng row_version)
        builder.Property(x => x.RowVersion).HasDefaultValue(1L).IsConcurrencyToken();

        builder.HasOne<Employee>().WithMany().HasForeignKey(x => x.EmployeeId);
        builder.HasOne<Competency>().WithMany().HasForeignKey(x => x.CompetencyId);
        builder.HasOne<CompetencyEvidence>().WithMany().HasForeignKey(x => x.LatestConfirmingEvidenceId);

        builder.HasIndex(x => new { x.EmployeeId, x.CompetencyId })
            .IsUnique()
            .HasDatabaseName("uq_employee_competency_profiles_employee_competency");
    }
}
