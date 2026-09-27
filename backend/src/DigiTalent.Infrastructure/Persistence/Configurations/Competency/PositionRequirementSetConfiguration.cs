using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity PositionRequirementSet với bảng "position_requirement_sets".
/// Database là gốc: tên cột tự đổi sang snake_case, không khai báo lại ở đây.
/// </summary>
public class PositionRequirementSetConfiguration : IEntityTypeConfiguration<PositionRequirementSet>
{
    public void Configure(EntityTypeBuilder<PositionRequirementSet> builder)
    {
        builder.ToTable("position_requirement_sets");
        builder.HasKey(x => x.Id);
    }
}
