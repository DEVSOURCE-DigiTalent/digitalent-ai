using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.Me;

/// <summary>
/// EM-15 / EM-16 / EM-17 — Chi tiết nhiệm vụ của tôi: yêu cầu, mục tiêu năng lực, rubric,
/// mọi phiên bản bài nộp CỦA MÌNH kèm phản hồi đánh giá và kết quả theo từng năng lực.
/// </summary>
public class GetMyTaskDetailUseCase : IUseCase<GetMyTaskDetailUseCaseInput, GetMyTaskDetailUseCaseOutput>
{
    private readonly MyEmployeeContext _me;
    private readonly MyTaskReader _taskReader;

    public GetMyTaskDetailUseCase(MyEmployeeContext me, MyTaskReader taskReader)
    {
        _me = me;
        _taskReader = taskReader;
    }

    public async Task<GetMyTaskDetailUseCaseOutput> ExecuteAsync(GetMyTaskDetailUseCaseInput input)
    {
        var employee = await _me.GetAsync();
        var task = (await _taskReader.LoadAsync(employee.Id, input.AssignmentId)).FirstOrDefault()
            ?? throw new NotFoundException("Không tìm thấy nhiệm vụ được giao cho bạn.");

        var output = MyTaskCardDto.Map<GetMyTaskDetailUseCaseOutput>(task, DateTimeOffset.UtcNow);
        output.Rubric = task.Rubric.ToList();
        output.Submissions = task.Submissions.Select(MyTaskSubmissionDto.From).ToList();
        output.MaxAttachmentBytes = MyTaskAttachmentRules.MaxBytes;
        output.MaxAttachments = MyTaskAttachmentRules.MaxFilesPerSubmission;
        output.AllowedExtensions = MyTaskAttachmentRules.AllowedExtensions.ToList();
        return output;
    }
}
