using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Framework;

/// <summary>Loads a framework that can still be changed (archived frameworks are read-only).</summary>
public static class PlatformFrameworkGuard
{
    public static async Task<PlatformFramework> ActiveAsync(IApplicationDbContext context, Guid frameworkId)
    {
        var framework = await context.PlatformFrameworks.FirstOrDefaultAsync(f => f.Id == frameworkId)
            ?? throw new NotFoundException("Không tìm thấy khung chuẩn.");
        if (framework.Status == Statuses.PlatformFramework.Archived)
        {
            throw new BadRequestException("Khung đã bị xóa.", "frameworkId", "FRAMEWORK_ARCHIVED");
        }

        return framework;
    }

    /// <summary>True when the domain is active and its framework is not archived (a course can be placed in it).</summary>
    public static Task<bool> IsUsableDomainAsync(IApplicationDbContext context, Guid domainId) =>
        (from domain in context.PlatformFrameworkDomains
         join framework in context.PlatformFrameworks on domain.FrameworkId equals framework.Id
         where domain.Id == domainId
               && domain.Status == Statuses.PlatformFrameworkDomain.Active
               && framework.Status != Statuses.PlatformFramework.Archived
         select domain.Id).AnyAsync();
}
