using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Platform.Common;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;

namespace DigiTalent.Application.UseCases.Platform.Courses;

/// <summary>
/// Adds a question to the course's draft question bank (published with the next course version).
/// </summary>
public class AddPlatformCourseQuestionUseCase : IUseCase<AddPlatformCourseQuestionUseCaseInput, PlatformCourseDetailOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly IAuditService _auditService;

    public AddPlatformCourseQuestionUseCase(IApplicationDbContext context, ICurrentUser currentUser, IAuditService auditService)
    {
        _context = context;
        _currentUser = currentUser;
        _auditService = auditService;
    }

    public async Task<PlatformCourseDetailOutput> ExecuteAsync(AddPlatformCourseQuestionUseCaseInput input)
    {
        var course = await PlatformCatalogReader.FindCourseAsync(_context, input.Code);
        var question = new PlatformCourseQuestion
        {
            CourseId = course.Id,
            QuestionText = input.QuestionText.Trim(),
            CorrectAnswer = input.CorrectAnswer.Trim(),
            Explanation = input.Explanation.Trim(),
            Status = Statuses.PlatformCourseQuestion.Draft,
            CreatedByUserId = _currentUser.UserId,
        };
        _context.PlatformCourseQuestions.Add(question);
        await _context.SaveChangesAsync();

        await _auditService.LogAsync(
            "PLATFORM_COURSE_QUESTION_ADDED",
            "platform_course_questions",
            question.Id,
            newValues: new { courseCode = course.Code, question.QuestionText },
            entityLabel: course.Code);

        return await PlatformCourseDetailOutput.ReadAsync(_context, course.Code);
    }
}
