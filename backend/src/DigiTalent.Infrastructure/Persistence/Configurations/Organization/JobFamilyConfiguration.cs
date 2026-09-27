using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity JobFamily với bảng "job_families".
/// Database là gốc: tên cột tự đổi sang snake_case, không khai báo lại ở đây.
/// </summary>
public class JobFamilyConfiguration : IEntityTypeConfiguration<JobFamily>
{
    public void Configure(EntityTypeBuilder<JobFamily> builder)
    {
        builder.ToTable("job_families");
        builder.HasKey(x => x.Id);
    }
}
