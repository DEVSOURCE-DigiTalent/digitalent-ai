using DigiTalent.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Competency.Common;

public static class DbContextExtensions
{
    public static DbSet<T> GetDbSet<T>(this IApplicationDbContext context) where T : class
    {
        if (context is DbContext dbContext)
        {
            return dbContext.Set<T>();
        }

        throw new InvalidOperationException($"IApplicationDbContext implementation '{context.GetType().Name}' must be an EF Core DbContext.");
    }
}
