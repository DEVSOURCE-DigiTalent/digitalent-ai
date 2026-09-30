using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity QuestionTag với bảng "question_tags".
/// Database là gốc: tên cột tự đổi sang snake_case, không khai báo lại ở đây.
/// </summary>
public class QuestionTagConfiguration : IEntityTypeConfiguration<QuestionTag>
{
    public void Configure(EntityTypeBuilder<QuestionTag> builder)
    {
        builder.ToTable("question_tags");
        builder.HasKey(x => x.Id);
        builder.HasIndex(x => new { x.OrganizationId, x.Name }).IsUnique();
    }
}
