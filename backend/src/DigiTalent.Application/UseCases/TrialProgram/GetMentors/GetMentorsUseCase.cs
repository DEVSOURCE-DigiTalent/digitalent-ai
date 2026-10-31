using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>GET /platform/mentors — tài khoản mentor của nền tảng kèm số doanh nghiệp đang chấm.</summary>
public class GetMentorsUseCase : IUseCase<GetMentorsUseCaseInput, GetMentorsUseCaseOutput>
{
    private readonly IApplicationDbContext _context;

    public GetMentorsUseCase(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<GetMentorsUseCaseOutput> ExecuteAsync(GetMentorsUseCaseInput input)
    {
        var mentors = await (
                from user in _context.Users.AsNoTracking()
                join userRole in _context.UserRoles.AsNoTracking() on user.Id equals userRole.UserId
                join role in _context.Roles.AsNoTracking() on userRole.RoleId equals role.Id
                where role.Code == Roles.Mentor
                orderby user.DisplayName
                select new MentorItem { UserId = user.Id, FullName = user.DisplayName, Email = user.Email, Status = user.Status, CreatedAt = user.CreatedAt })
            .ToListAsync();
        var load = await _context.TrialWorkspaces.AsNoTracking()
            .Where(t => t.MentorUserId != null && t.ReportPublishedAt == null)
            .GroupBy(t => t.MentorUserId!.Value)
            .Select(g => new { g.Key, Count = g.Count() })
            .ToDictionaryAsync(g => g.Key, g => g.Count);
        foreach (var mentor in mentors)
        {
            mentor.ActiveTrials = load.GetValueOrDefault(mentor.UserId);
        }

        return new GetMentorsUseCaseOutput { Items = mentors };
    }
}
