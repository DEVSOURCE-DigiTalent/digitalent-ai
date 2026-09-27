using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity EmployeeCompetencyProfile với bảng "employee_competency_profiles".
/// Database là gốc: tên cột tự đổi sang snake_case, không khai báo lại ở đây.
/// </summary>
public class EmployeeCompetencyProfileConfiguration : IEntityTypeConfiguration<EmployeeCompetencyProfile>
{
    public void Configure(EntityTypeBuilder<EmployeeCompetencyProfile> builder)
    {
        builder.ToTable("employee_competency_profiles");
        builder.HasKey(x => x.Id);
    }
}
