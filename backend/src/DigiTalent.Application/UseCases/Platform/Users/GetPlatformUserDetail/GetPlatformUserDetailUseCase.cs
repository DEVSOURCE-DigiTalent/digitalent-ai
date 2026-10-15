using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Users;

public class GetPlatformUserDetailUseCase : IUseCase<GetPlatformUserDetailUseCaseInput, PlatformUserDetailOutput>
{
    private readonly IApplicationDbContext _context;

    public GetPlatformUserDetailUseCase(IApplicationDbContext context) => _context = context;

    public Task<PlatformUserDetailOutput> ExecuteAsync(GetPlatformUserDetailUseCaseInput input) =>
        ReadAsync(_context, input.Id);

    public static async Task<PlatformUserDetailOutput> ReadAsync(IApplicationDbContext context, Guid userId)
    {
        var user = (await PlatformUserReader.ReadAsync(context, new[] { userId })).FirstOrDefault()
            ?? throw new NotFoundException($"User '{userId}' not found.");
        var organizationStatus = user.OrganizationId == null
            ? null
            : await context.Organizations.Where(o => o.Id == user.OrganizationId).Select(o => o.Status).FirstOrDefaultAsync();

        var history = await (
            from log in context.AuditLogs.AsNoTracking()
            join actor in context.Users on log.ActorUserId equals actor.Id into actors
            from actor in actors.DefaultIfEmpty()
            where log.EntityType == "users" && log.EntityId == userId
            orderby log.CreatedAt descending
            select new PlatformUserActivityItem
            {
                Action = log.Action,
                EntityLabel = log.EntityLabel,
                NewValues = log.NewValues,
                ActorEmail = actor == null ? null : actor.Email,
                CreatedAt = log.CreatedAt,
            }).Take(20).ToListAsync();

        return new PlatformUserDetailOutput { User = user, OrganizationStatus = organizationStatus, SupportHistory = history };
    }
}
