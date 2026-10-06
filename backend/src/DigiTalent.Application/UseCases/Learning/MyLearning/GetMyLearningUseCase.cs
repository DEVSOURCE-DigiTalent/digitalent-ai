using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Learning.MyLearning;

public class GetMyLearningUseCase : IUseCase<GetMyLearningInput, GetMyLearningOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetMyLearningUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GetMyLearningOutput> ExecuteAsync(GetMyLearningInput input)
    {
        var employeeId = _currentUser.EmployeeId
            ?? throw new ForbiddenException("Chỉ nhân viên mới xem khóa học của mình.");

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var query = _context.Enrollments.AsNoTracking()
            .Where(e => e.EmployeeId == employeeId && e.Status != Statuses.Enrollment.Cancelled);

        if (!string.IsNullOrWhiteSpace(input.Status))
        {
            var status = input.Status.Trim().ToUpper();
            query = query.Where(e => e.Status == status);
        }

        var coursesSet = _context.Courses.AsNoTracking();
        var modulesSet = _context.CourseModules.AsNoTracking();
        var lessonsSet = _context.Lessons.AsNoTracking();
        var lessonProgressSet = _context.LessonProgresses.AsNoTracking();
        var assignmentsSet = _context.CourseAssignments.AsNoTracking();
        var usersSet = _context.Users.AsNoTracking();
        var courseCompetencies = _context.CourseCompetencies.AsNoTracking();

        var items = await query
            .OrderByDescending(e => e.CreatedAt)
            .Select(e => new MyCourseItem
            {
                EnrollmentId = e.Id,
                CourseId = e.CourseId,
                CourseCode = coursesSet.Where(c => c.Id == e.CourseId).Select(c => c.Code).FirstOrDefault() ?? "",
                CourseTitle = coursesSet.Where(c => c.Id == e.CourseId).Select(c => c.Title).FirstOrDefault() ?? "",
                CourseDescription = coursesSet.Where(c => c.Id == e.CourseId).Select(c => c.Description).FirstOrDefault(),
                Level = courseCompetencies
                    .Where(cc => cc.CourseId == e.CourseId)
                    .Select(cc => (int)cc.TargetLevel)
                    .OrderByDescending(t => t)
                    .FirstOrDefault(),
                EstimatedDurationMinutes = coursesSet.Where(c => c.Id == e.CourseId).Select(c => c.EstimatedDurationMinutes).FirstOrDefault(),
                TotalModules = modulesSet.Count(m => m.CourseId == e.CourseId),
                TotalLessons = lessonsSet.Count(l => modulesSet.Where(m => m.CourseId == e.CourseId).Select(m => m.Id).Contains(l.ModuleId)),
                CompletedLessons = lessonProgressSet.Count(lp => lp.EnrollmentId == e.Id && lp.Status == "COMPLETED"),
                Status = e.Status,
                ProgressPercent = e.ProgressPercent,
                StartedAt = e.StartedAt,
                CompletedAt = e.CompletedAt,
                DueDate = e.DueDate != null ? e.DueDate.Value.ToString("yyyy-MM-dd") : null,
                Overdue = e.DueDate != null && e.DueDate < today && e.Status != Statuses.Enrollment.Completed,
                AssignedByName = assignmentsSet
                    .Where(ca => ca.Id == e.CourseAssignmentId)
                    .Join(usersSet, ca => ca.AssignedByUserId, u => u.Id, (ca, u) => u.DisplayName)
                    .FirstOrDefault(),
            })
            .ToListAsync();

        return new GetMyLearningOutput
        {
            Items = items,
            Total = items.Count,
            InProgress = items.Count(i => i.Status == Statuses.Enrollment.InProgress),
            Completed = items.Count(i => i.Status == Statuses.Enrollment.Completed),
            NotStarted = items.Count(i => i.Status == Statuses.Enrollment.NotStarted),
        };
    }
}
