using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity QuestionTagAssignment với bảng "question_tag_assignments".
/// Database là gốc: tên cột tự đổi sang snake_case, không khai báo lại ở đây.
/// </summary>
public class QuestionTagAssignmentConfiguration : IEntityTypeConfiguration<QuestionTagAssignment>
{
    public void Configure(EntityTypeBuilder<QuestionTagAssignment> builder)
    {
        builder.ToTable("question_tag_assignments");
        builder.HasKey(x => x.Id);
        builder.HasIndex(x => new { x.QuestionId, x.TagId }).IsUnique();

        builder.HasOne<Question>().WithMany().HasForeignKey(x => x.QuestionId);
        builder.HasOne<QuestionTag>().WithMany().HasForeignKey(x => x.TagId);
    }
}
