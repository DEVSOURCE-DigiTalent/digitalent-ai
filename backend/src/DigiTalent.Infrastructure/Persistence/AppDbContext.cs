using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Common;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Infrastructure.Persistence;

/// <summary>
/// Schema chuẩn: docs/database/DigiTalent_AI_Canonical_v2_3.sql — entity + configuration viết khớp file đó.
/// </summary>
public class AppDbContext : DbContext, IApplicationDbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // Thêm entity mới → thêm DbSet ở đây VÀ trong IApplicationDbContext

    // Identity & Access
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    // Organization & Job Architecture
    public DbSet<Organization> Organizations => Set<Organization>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<JobFamily> JobFamilies => Set<JobFamily>();
    public DbSet<JobPosition> JobPositions => Set<JobPosition>();
    public DbSet<Employee> Employees => Set<Employee>();

    // Shared
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Tự nạp mọi class *Configuration trong thư mục Persistence/Configurations
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        // Không xóa dây chuyền (cascade) — dữ liệu lịch sử phải được giữ lại (SQL v2.3 dùng RESTRICT/NO ACTION)
        foreach (var foreignKey in modelBuilder.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
        {
            foreignKey.DeleteBehavior = DeleteBehavior.Restrict;
        }
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Tự điền CreatedAt / UpdatedAt cho mọi entity kế thừa BaseEntity
        var now = DateTimeOffset.UtcNow;

        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = now;
                entry.Entity.UpdatedAt = now;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = now;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
