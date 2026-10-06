using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Me;

/// <summary>
/// EM-07 — Chi tiết khóa học: đề cương (học phần, bài học kèm trạng thái của mình), mục tiêu, tiên quyết,
/// bài đánh giá của khóa và trạng thái ghi danh. Xem được khóa mình đã ghi danh, hoặc khóa PUBLISHED (để tự ghi danh).
/// </summary>
public class GetMyCourseDetailUseCase : IUseCase<GetMyCourseDetailUseCaseInput, GetMyCourseDetailUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly MyEmployeeContext _me;
    private readonly MyLearningProgressService _progress;
    private readonly MyAssessmentService _assessments;
    private readonly MyEnrollmentRules _enrollmentRules;

    public GetMyCourseDetailUseCase(
        IApplicationDbContext context,
        MyEmployeeContext me,
        MyLearningProgressService progress,
        MyAssessmentService assessments,
        MyEnrollmentRules enrollmentRules)
    {
        _context = context;
        _me = me;
        _progress = progress;
        _assessments = assessments;
        _enrollmentRules = enrollmentRules;
    }

    public async Task<GetMyCourseDetailUseCaseOutput> ExecuteAsync(GetMyCourseDetailUseCaseInput input)
    {
        var employee = await _me.GetAsync();
        var course = await _context.Courses
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == input.CourseId && c.OrganizationId == employee.OrganizationId);

        var enrollment = course == null ? null : await FindEnrollmentAsync(employee.Id, course.Id);
        if (course == null || (enrollment == null && course.Status != Statuses.Course.Published))
        {
            throw new NotFoundException("Không tìm thấy khóa học.");
        }

        var now = DateTimeOffset.UtcNow;
        var teachings = await (
                from teaching in _context.CourseCompetencies.AsNoTracking()
                join competency in _context.Competencies.AsNoTracking() on teaching.CompetencyId equals competency.Id
                join category in _context.CompetencyCategories.AsNoTracking() on competency.CategoryId equals category.Id
                where teaching.CourseId == course.Id
                orderby competency.Code
                select new { teaching.TargetLevel, teaching.CoverageType, competency.Id, competency.Code, competency.Name, CategoryName = category.Name })
            .ToListAsync();

        var outcomes = await _context.CourseLearningOutcomes
            .AsNoTracking()
            .Where(o => o.CourseId == course.Id)
            .OrderBy(o => o.SortOrder)
            .Select(o => new MyLearningOutcomeDto { Code = o.Code, Statement = o.Statement, OutcomeType = o.OutcomeType, TargetLevel = o.TargetLevel })
            .ToListAsync();

        var lessons = await _progress.LoadLessonsAsync(course.Id);
        var progressByLesson = enrollment == null
            ? new Dictionary<Guid, LessonProgress>()
            : await _context.LessonProgresses
                .AsNoTracking()
                .Where(p => p.EnrollmentId == enrollment.Id)
                .ToDictionaryAsync(p => p.LessonId);
        var completedIds = progressByLesson.Values
            .Where(p => p.Status == Statuses.LessonProgress.Completed)
            .Select(p => p.LessonId)
            .ToHashSet();

        var modules = await _context.CourseModules
            .AsNoTracking()
            .Where(m => m.CourseId == course.Id && m.Status == Statuses.CourseContent.Active)
            .OrderBy(m => m.SortOrder)
            .ToListAsync();

        var output = new GetMyCourseDetailUseCaseOutput
        {
            Id = course.Id,
            Code = course.Code,
            Title = course.Title,
            Description = course.Description,
            Purpose = course.Purpose,
            Level = MyCourseReader.LevelOf(course, teachings.Select(t => t.TargetLevel)),
            EntryLevel = course.EntryLevel,
            EstimatedDurationMinutes = course.EstimatedDurationMinutes,
            CertificateEnabled = course.CertificateEnabled,
            CertificateValidityDays = course.CertificateValidityDays,
            CategoryName = teachings.OrderBy(t => t.CoverageType == Statuses.CourseCoverageType.Primary ? 0 : 1).Select(t => t.CategoryName).FirstOrDefault(),
            Competencies = teachings.Select(t => new MyCompetencyRefDto { CompetencyId = t.Id, Code = t.Code, Name = t.Name, TargetLevel = t.TargetLevel }).ToList(),
            Outcomes = outcomes,
            Prerequisites = (await _enrollmentRules.LoadPrerequisitesAsync(employee.Id, course.Id)).ToList(),
            Modules = modules.Select(m => new MyCourseModuleDto
            {
                Id = m.Id,
                Title = m.Title,
                Description = m.Description,
                EstimatedMinutes = m.EstimatedMinutes,
                IsRequired = m.IsRequired,
                Lessons = lessons.Where(l => l.ModuleId == m.Id).Select(l =>
                {
                    var progress = progressByLesson.GetValueOrDefault(l.LessonId);
                    return new MyCourseLessonDto
                    {
                        Id = l.LessonId,
                        Code = l.Code,
                        Title = l.Title,
                        LessonType = l.LessonType,
                        EstimatedMinutes = l.EstimatedMinutes,
                        IsRequired = l.IsRequired,
                        CompletionRule = l.CompletionRule,
                        SelfCompletable = MyLearningProgressService.IsSelfCompletable(l.CompletionRule),
                        ProgressStatus = progress?.Status ?? Statuses.LessonProgress.NotStarted,
                        CompletedAt = progress?.CompletedAt,
                    };
                }).ToList(),
            }).ToList(),
            TotalLessons = lessons.Count(l => l.CountsForProgress),
            CompletedLessons = lessons.Count(l => l.CountsForProgress && completedIds.Contains(l.LessonId)),
            NextLessonId = NextLesson(lessons, completedIds),
        };

        if (enrollment != null)
        {
            output.Enrollment = await ToEnrollmentDtoAsync(enrollment, now);
            var visible = (await _assessments.LoadVisibleAsync(employee)).Where(v => v.Course.Id == course.Id).ToList();
            output.Assessments = (await _assessments.BuildStatesAsync(visible, now)).Select(MyAssessmentCardDto.From).ToList();

            var certificate = await _context.Certificates
                .AsNoTracking()
                .Where(c => c.EnrollmentId == enrollment.Id && c.Status != Statuses.Certificate.Revoked)
                .OrderByDescending(c => c.IssuedAt)
                .FirstOrDefaultAsync();
            if (certificate != null)
            {
                output.Certificate = new MyCertificateRefDto
                {
                    Id = certificate.Id,
                    Code = certificate.CertificateCode,
                    IssuedAt = certificate.IssuedAt,
                    ExpiresAt = certificate.ExpiresAt,
                    Status = certificate.Status,
                };
            }
        }
        else
        {
            var check = await _enrollmentRules.CheckAsync(employee, course);
            output.CanEnroll = check.CanEnroll;
            output.EnrollBlockedReason = check.Reason;
        }

        return output;
    }

    /// <summary>Bài bắt buộc chưa xong đầu tiên → bài chưa xong bất kỳ → bài đầu tiên.</summary>
    internal static Guid? NextLesson(IReadOnlyList<CourseLessonInfo> lessons, IReadOnlySet<Guid> completedIds) =>
        lessons.FirstOrDefault(l => l.CountsForProgress && !completedIds.Contains(l.LessonId))?.LessonId
        ?? lessons.FirstOrDefault(l => !completedIds.Contains(l.LessonId))?.LessonId
        ?? lessons.FirstOrDefault()?.LessonId;

    private async Task<Enrollment?> FindEnrollmentAsync(Guid employeeId, Guid courseId) =>
        await _context.Enrollments
            .AsNoTracking()
            .Where(e => e.EmployeeId == employeeId && e.CourseId == courseId && e.Status != Statuses.Enrollment.Cancelled)
            .OrderByDescending(e => e.CreatedAt)
            .FirstOrDefaultAsync();

    private async Task<MyEnrollmentDto> ToEnrollmentDtoAsync(Enrollment enrollment, DateTimeOffset now)
    {
        string? assignedBy = null;
        if (enrollment.CourseAssignmentId.HasValue)
        {
            assignedBy = await (
                    from assignment in _context.CourseAssignments.AsNoTracking()
                    join user in _context.Users.AsNoTracking() on assignment.AssignedByUserId equals user.Id
                    where assignment.Id == enrollment.CourseAssignmentId.Value
                    select user.DisplayName)
                .FirstOrDefaultAsync();
        }

        var today = DateOnly.FromDateTime(now.UtcDateTime);
        return new MyEnrollmentDto
        {
            Id = enrollment.Id,
            Status = enrollment.Status,
            ProgressPercent = enrollment.ProgressPercent,
            StartedAt = enrollment.StartedAt,
            CompletedAt = enrollment.CompletedAt,
            DueDate = enrollment.DueDate?.ToString("yyyy-MM-dd"),
            IsOverdue = enrollment.Status != Statuses.Enrollment.Completed && enrollment.DueDate.HasValue && enrollment.DueDate.Value < today,
            Source = enrollment.CourseAssignmentId.HasValue ? "ASSIGNED" : "SELF_ENROLLED",
            AssignedByName = assignedBy,
        };
    }
}
