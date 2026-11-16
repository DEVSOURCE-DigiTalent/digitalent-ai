using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Organization.Members;

namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>
/// POST /trial/participants — mời nhân viên dùng thử. Phòng ban và vị trí được tìm theo tên (không phân biệt hoa thường),
/// chưa có thì tạo mới; mỗi dòng hợp lệ thành một lời mời nhân viên (<see cref="InviteMembersUseCase"/>): email chứa link
/// kích hoạt tài khoản kèm hạn làm bài (nếu đã đặt). Dòng lỗi được trả lại kèm lý do, không chặn cả danh sách.
/// </summary>
public class InviteTrialParticipantsUseCase : IUseCase<InviteTrialParticipantsUseCaseInput, InviteTrialParticipantsUseCaseOutput>
{
    private readonly TrialProgramReader _reader;
    private readonly IUseCase<InviteMembersUseCaseInput, InviteMembersUseCaseOutput> _invite;

    public InviteTrialParticipantsUseCase(
        TrialProgramReader reader,
        IUseCase<InviteMembersUseCaseInput, InviteMembersUseCaseOutput> invite)
    {
        _reader = reader;
        _invite = invite;
    }

    public async Task<InviteTrialParticipantsUseCaseOutput> ExecuteAsync(InviteTrialParticipantsUseCaseInput input)
    {
        var trial = await _reader.ForOwnerAsync();
        if (input.TestDeadline is { } chosenDeadline)
        {
            if (chosenDeadline <= _reader.Now.AddMinutes(30) || chosenDeadline > _reader.Now.AddDays(TrialProgramRules.MaxDeadlineDays))
                throw new BadRequestException("Hạn làm bài cần sau ít nhất 30 phút và trong vòng 60 ngày.", "testDeadline", "TRIAL_DEADLINE_INVALID");
            trial.TestDeadline = chosenDeadline;
        }
        if (trial.ReportPublishedAt != null)
        {
            throw new BadRequestException("Kết quả dùng thử đã được công bố, không mời thêm nhân viên.", "rows", "TRIAL_REPORTED");
        }

        var output = new InviteTrialParticipantsUseCaseOutput();

        var rows = new List<InviteMemberRow>();
        foreach (var row in input.Rows)
        {
            var email = row.Email?.Trim().ToLowerInvariant() ?? string.Empty;
            var departmentName = TrialOrgStructure.Clean(row.Department);
            var positionName = TrialOrgStructure.Clean(row.Position);
            var reason = TrialOrgStructure.Problem(departmentName, positionName);
            if (row.Role is not (MemberRoles.Employee or MemberRoles.Manager)) reason = "Vai trò phải là Nhân viên hoặc Trưởng phòng.";
            if (reason != null)
            {
                output.Rejected.Add(new TrialRejectedDto { Email = email, Reason = reason });
                continue;
            }

            rows.Add(new InviteMemberRow
            {
                Email = email,
                FullName = row.FullName?.Trim() ?? string.Empty,
                Role = row.Role,
                DepartmentName = departmentName,
                JobPositionName = positionName,
            });
        }

        if (rows.Count == 0)
        {
            return output;
        }

        var invited = await _invite.ExecuteAsync(new InviteMembersUseCaseInput
        {
            Rows = rows,
            EmailNote = trial.TestDeadline is { } deadline
                ? $"Bài đánh giá năng lực dùng thử cần hoàn thành trước {TrialProgramRules.FormatVietnamTime(deadline)}."
                : "Sau khi kích hoạt, hãy đăng nhập để làm bài đánh giá năng lực dùng thử.",
        });
        output.Invited.AddRange(invited.Created.Select(c => new TrialInvitedDto { Email = c.Email, FullName = c.FullName, DebugLink = c.DebugLink }));
        output.Rejected.AddRange(invited.Rejected.Select(r => new TrialRejectedDto { Email = r.Email, Reason = r.Reason }));
        return output;
    }
}
