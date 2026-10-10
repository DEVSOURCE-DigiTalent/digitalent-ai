using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Learning;

public class GetCourseStructureUseCase : IUseCase<GetCourseStructureUseCaseInput, GetCourseStructureUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetCourseStructureUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GetCourseStructureUseCaseOutput> ExecuteAsync(GetCourseStructureUseCaseInput input)
    {
        var orgId = _currentUser.GetRequiredOrganizationId();

        var course = await _context.Courses
            .AsNoTracking()
            .Where(c => c.Id == input.CourseId && c.OrganizationId == orgId)
            .Select(c => new { c.Id, c.Title, c.Code, c.Status })
            .FirstOrDefaultAsync()
            ?? throw new NotFoundException($"Course '{input.CourseId}' not found.");

        var employeeId = _currentUser.EmployeeId;

        Enrollment? enrollment = null;
        if (employeeId.HasValue)
        {
            enrollment = await _context.Enrollments
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.EmployeeId == employeeId.Value && e.CourseId == input.CourseId);
        }

        var modules = await _context.CourseModules
            .AsNoTracking()
            .Where(m => m.CourseId == input.CourseId && m.Status == "ACTIVE")
            .OrderBy(m => m.SortOrder)
            .Select(m => new { m.Id, m.Title, m.SortOrder })
            .ToListAsync();

        var moduleIds = modules.Select(m => m.Id).ToList();

        var lessons = await _context.Lessons
            .AsNoTracking()
            .Where(l => moduleIds.Contains(l.ModuleId) && l.Status == "ACTIVE")
            .OrderBy(l => l.SortOrder)
            .Select(l => new { l.Id, l.ModuleId, l.Title, l.LessonType, l.SortOrder, l.EstimatedMinutes })
            .ToListAsync();

        var progressMap = new Dictionary<Guid, (string Status, decimal Percent)>();
        if (enrollment is not null)
        {
            var lessonIds = lessons.Select(l => l.Id).ToList();
            progressMap = await _context.LessonProgresses
                .AsNoTracking()
                .Where(lp => lp.EnrollmentId == enrollment.Id && lessonIds.Contains(lp.LessonId))
                .ToDictionaryAsync(lp => lp.LessonId, lp => (lp.Status, lp.ProgressPercent));
        }

        var moduleDtos = modules.Select(m => new ModuleDto
        {
            ModuleId = m.Id,
            Title = m.Title,
            SortOrder = m.SortOrder,
            Lessons = lessons.Where(l => l.ModuleId == m.Id).Select(l =>
            {
                var progress = progressMap.GetValueOrDefault(l.Id);
                return new LessonDto
                {
                    LessonId = l.Id,
                    Title = l.Title,
                    LessonType = l.LessonType,
                    SortOrder = l.SortOrder,
                    EstimatedMinutes = l.EstimatedMinutes,
                    ProgressStatus = progress.Status ?? Statuses.LessonProgress.NotStarted,
                    ProgressPercent = progress.Percent
                };
            }).ToList()
        }).ToList();

        var assessments = await _context.Assessments
            .AsNoTracking()
            .Where(a => a.CourseId == input.CourseId && a.Status == "PUBLISHED")
            .OrderBy(a => a.IsFinal)
            .ThenBy(a => a.Code)
            .Select(a => new CourseAssessmentDto
            {
                AssessmentId = a.Id,
                Title = a.Title,
                AssessmentType = a.AssessmentType,
                IsFinal = a.IsFinal,
                PassingScore = a.PassingScore,
                TimeLimitMinutes = a.TimeLimitMinutes,
                MaxAttempts = a.MaxAttempts
            })
            .ToListAsync();

        if (enrollment is not null)
        {
            var assessmentIds = assessments.Select(a => a.AssessmentId).ToList();
            var attempts = await _context.AssessmentAttempts
                .AsNoTracking()
                .Where(at => at.EnrollmentId == enrollment.Id && assessmentIds.Contains(at.AssessmentId))
                .ToListAsync();

            foreach (var a in assessments)
            {
                var myAttempts = attempts.Where(at => at.AssessmentId == a.AssessmentId).ToList();
                a.AttemptsUsed = myAttempts.Count;
                a.BestScore = myAttempts.Where(at => at.Score.HasValue).Select(at => at.Score).Max();
                a.Passed = myAttempts.Any(at => at.Passed == true);
            }
        }

        return new GetCourseStructureUseCaseOutput
        {
            CourseId = course.Id,
            CourseTitle = course.Title,
            CourseCode = course.Code,
            Status = course.Status,
            EnrollmentId = enrollment?.Id,
            EnrollmentStatus = enrollment?.Status,
            CourseProgressPercent = enrollment?.ProgressPercent ?? 0,
            Modules = moduleDtos,
            Assessments = assessments
        };
    }
}
