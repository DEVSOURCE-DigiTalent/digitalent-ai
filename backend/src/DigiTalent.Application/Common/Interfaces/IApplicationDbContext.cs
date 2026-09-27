using DigiTalent.Domain.Entities;
using DigiTalent.Domain.Entities.Learner;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.Common.Interfaces;

/// <summary>
/// Use case làm việc với database qua interface này (không dùng thẳng AppDbContext).
/// Thêm entity mới → thêm DbSet ở đây VÀ trong Infrastructure/Persistence/AppDbContext.cs.
/// Schema chuẩn: docs/database/DigiTalent_AI_Canonical_v2_3.sql.
/// </summary>
public interface IApplicationDbContext
{
    // Identity & Access
    DbSet<User> Users { get; }
    DbSet<Role> Roles { get; }
    DbSet<Permission> Permissions { get; }
    DbSet<UserRole> UserRoles { get; }
    DbSet<RolePermission> RolePermissions { get; }
    DbSet<RefreshToken> RefreshTokens { get; }

    // Organization & Job Architecture
    DbSet<Organization> Organizations { get; }
    DbSet<Department> Departments { get; }
    DbSet<JobFamily> JobFamilies { get; }
    DbSet<JobPosition> JobPositions { get; }
    DbSet<Employee> Employees { get; }

    // Competency & Position Requirements
    DbSet<CompetencyCategory> CompetencyCategories { get; }
    DbSet<Competency> Competencies { get; }
    DbSet<CompetencyLevelCriterion> CompetencyLevelCriteria { get; }
    DbSet<PositionRequirementSet> PositionRequirementSets { get; }
    DbSet<PositionRequirementItem> PositionRequirementItems { get; }

    // Learner Surface (SEP-09)
    DbSet<LearnerProfile> LearnerProfiles { get; }

    // Shared
    DbSet<AuditLog> AuditLogs { get; }
    DbSet<SystemSetting> SystemSettings { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
