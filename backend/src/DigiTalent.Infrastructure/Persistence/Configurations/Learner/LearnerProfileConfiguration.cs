using DigiTalent.Domain.Entities.Learner;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations.Learner;

public class LearnerProfileConfiguration : IEntityTypeConfiguration<LearnerProfile>
{
    public void Configure(EntityTypeBuilder<LearnerProfile> builder)
    {
        builder.ToTable("learner_profiles");

        builder.HasKey(p => p.Id);

        // 1-1 with User
        builder.HasIndex(p => p.UserId).IsUnique();
        builder.HasOne<User>().WithMany().HasForeignKey(p => p.UserId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.Property(p => p.Headline).HasMaxLength(255);
        builder.Property(p => p.Bio);

        // PostgreSQL text[] for interests
        builder.Property(p => p.Interests)
               .HasColumnType("text[]");
    }
}
