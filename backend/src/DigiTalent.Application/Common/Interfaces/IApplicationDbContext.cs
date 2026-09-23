using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.Common.Interfaces;

/// <summary>
/// Use case làm việc với database qua interface này (không dùng thẳng AppDbContext).
/// Thêm entity mới → thêm DbSet ở đây VÀ trong Infrastructure/Persistence/AppDbContext.cs.
/// </summary>
public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<Department> Departments { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
