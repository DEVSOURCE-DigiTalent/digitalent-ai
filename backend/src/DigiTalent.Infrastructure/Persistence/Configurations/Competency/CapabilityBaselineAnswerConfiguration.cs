using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map CapabilityBaselineAnswer với bảng "capability_baseline_answers" (canonical v3.1 §17.2).
/// </summary>
public class CapabilityBaselineAnswerConfiguration : IEntityTypeConfiguration<CapabilityBaselineAnswer>
{
    public void Configure(EntityTypeBuilder<CapabilityBaselineAnswer> builder)
    {
        builder.ToTable("capability_baseline_answers");
        builder.HasKey(x => x.Id);

        builder.HasOne<Employee>().WithMany().HasForeignKey(x => x.EmployeeId);
        builder.HasOne<Question>().WithMany().HasForeignKey(x => x.QuestionId);
        builder.HasOne<QuestionOption>().WithMany().HasForeignKey(x => x.SelectedOptionId);

        builder.HasIndex(x => new { x.EmployeeId, x.QuestionId })
            .IsUnique()
            .HasDatabaseName("uq_capability_baseline_answers_employee_question");
    }
}
