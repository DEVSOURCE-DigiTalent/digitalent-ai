using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity JobPosition với bảng "job_positions".
/// Database là gốc: tên cột tự đổi sang snake_case, không khai báo lại ở đây.
/// </summary>
public class JobPositionConfiguration : IEntityTypeConfiguration<JobPosition>
{
    public void Configure(EntityTypeBuilder<JobPosition> builder)
    {
        builder.ToTable("job_positions");
        builder.HasKey(x => x.Id);
    }
}
