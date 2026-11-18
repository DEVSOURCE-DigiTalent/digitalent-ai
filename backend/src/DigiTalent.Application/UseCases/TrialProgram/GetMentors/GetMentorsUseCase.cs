using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>GET /platform/mentors — tài khoản mentor của nền tảng kèm doanh nghiệp đang phụ trách và bài cuối khóa chờ chấm.</summary>
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
        // A mentor keeps a trial organization until it is converted: after the report its employees learn the Basic
        // courses and only the assigned mentor grades their course finals.
        var openTrials = await _context.TrialWorkspaces.AsNoTracking()
            .Where(t => t.MentorUserId != null && t.ConvertedAt == null)
            .Select(t => new { t.OrganizationId, MentorUserId = t.MentorUserId!.Value })
            .ToListAsync();
        var waiting = await GetPlatformTrialsUseCase.WaitingFinalsAsync(_context, openTrials.Select(t => t.OrganizationId).ToList());
        foreach (var mentor in mentors)
        {
            var organizations = openTrials.Where(t => t.MentorUserId == mentor.UserId).Select(t => t.OrganizationId).ToList();
            mentor.ActiveTrials = organizations.Count;
            mentor.WaitingFinals = organizations.Sum(id => waiting.GetValueOrDefault(id));
        }

        return new GetMentorsUseCaseOutput { Items = mentors };
    }
}
