using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;

namespace DigiTalent.Application.UseCases.Me;

/// <summary>EM-06 — Khóa học của tôi: các khóa đang ghi danh (được giao hoặc tự ghi danh) và tiến độ.</summary>
public class GetMyCoursesUseCase : IUseCase<GetMyCoursesUseCaseInput, GetMyCoursesUseCaseOutput>
{
    private readonly MyEmployeeContext _me;
    private readonly MyCourseReader _courseReader;

    public GetMyCoursesUseCase(MyEmployeeContext me, MyCourseReader courseReader)
    {
        _me = me;
        _courseReader = courseReader;
    }

    public async Task<GetMyCoursesUseCaseOutput> ExecuteAsync(GetMyCoursesUseCaseInput input)
    {
        var employee = await _me.GetAsync();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var items = (await _courseReader.LoadAsync(employee.Id))
            .Select(row => MyCourseCardDto.From(row, today))
            // Đang học trước, rồi tới hạn gần nhất, khóa đã xong xuống cuối
            .OrderBy(c => c.Status == Statuses.Enrollment.Completed ? 1 : 0)
            .ThenBy(c => c.Status == Statuses.Enrollment.NotStarted ? 1 : 0)
            .ThenBy(c => c.DueDate ?? "9999-12-31", StringComparer.Ordinal)
            .ThenBy(c => c.CourseCode, StringComparer.OrdinalIgnoreCase)
            .ToList();

        return new GetMyCoursesUseCaseOutput
        {
            Items = items,
            Summary = new MyCourseSummaryDto
            {
                Total = items.Count,
                NotStarted = items.Count(c => c.Status == Statuses.Enrollment.NotStarted),
                InProgress = items.Count(c => c.Status == Statuses.Enrollment.InProgress),
                ReadyForAssessment = items.Count(c => c.Status == Statuses.Enrollment.ReadyForAssessment),
                Completed = items.Count(c => c.Status == Statuses.Enrollment.Completed),
                Overdue = items.Count(c => c.IsOverdue),
            },
        };
    }
}
