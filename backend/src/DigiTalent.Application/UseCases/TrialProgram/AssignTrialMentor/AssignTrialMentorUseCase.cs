using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>
/// PUT /platform/trials/{organizationId}/mentor — quản trị nền tảng phân công (hoặc đổi) mentor chấm bài cuối khóa học thử
/// Cơ bản của một doanh nghiệp dùng thử (bài đánh giá năng lực do máy chấm). Mentor và chủ doanh nghiệp nhận thông báo.
/// </summary>
public class AssignTrialMentorUseCase : IUseCase<AssignTrialMentorUseCaseInput, AssignTrialMentorUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly TrialProgramReader _reader;
    private readonly IAuditService _audit;

    public AssignTrialMentorUseCase(IApplicationDbContext context, TrialProgramReader reader, IAuditService audit)
    {
        _context = context;
        _reader = reader;
        _audit = audit;
    }

    public async Task<AssignTrialMentorUseCaseOutput> ExecuteAsync(AssignTrialMentorUseCaseInput input)
    {
        var trial = await _context.TrialWorkspaces.FirstOrDefaultAsync(t => t.OrganizationId == input.OrganizationId)
                    ?? throw new NotFoundException(TrialProgramReader.NotTrialMessage);
        var mentor = await (
                from user in _context.Users
                join userRole in _context.UserRoles on user.Id equals userRole.UserId
                join role in _context.Roles on userRole.RoleId equals role.Id
                where user.Id == input.MentorUserId && role.Code == Roles.Mentor && user.Status == Statuses.User.Active
                select new { user.Id, user.DisplayName })
            .FirstOrDefaultAsync()
            ?? throw new BadRequestException("Chọn một mentor đang hoạt động.", "mentorUserId", "MENTOR_INVALID");

        var previous = trial.MentorUserId;
        var now = _reader.Now;
        trial.MentorUserId = mentor.Id;
        trial.MentorAssignedAt = now;
        trial.Revision++;

        var organizationName = await _reader.OrganizationNameAsync(trial.OrganizationId);
        _reader.Notify(new[] { mentor.Id }, TrialProgramRules.NotificationMentorAssigned, "Bạn được phân công chấm bài học thử",
            $"{organizationName}: bài cuối khóa Cơ bản của nhân viên.", trial.OrganizationId);
        _reader.Notify(new[] { trial.OwnerUserId }, TrialProgramRules.NotificationMentorAssigned, "Đã có mentor chấm bài học thử",
            $"{mentor.DisplayName} chấm bài cuối khóa Cơ bản của nhân viên.", trial.OrganizationId);
        await _context.SaveChangesAsync();

        await _audit.LogAsync("TRIAL_MENTOR_ASSIGNED", "trial_workspaces", trial.Id,
            oldValues: new { mentorUserId = previous }, newValues: new { mentorUserId = mentor.Id }, entityLabel: organizationName);

        return new AssignTrialMentorUseCaseOutput
        {
            OrganizationId = trial.OrganizationId,
            MentorUserId = mentor.Id,
            MentorName = mentor.DisplayName,
            AssignedAt = now,
        };
    }
}
