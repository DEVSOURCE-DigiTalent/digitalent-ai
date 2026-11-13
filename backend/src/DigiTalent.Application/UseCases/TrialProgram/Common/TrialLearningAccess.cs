using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.TrialProgram;

internal enum TrialLearningMode { Regular, AwaitingResult, PublicBasics }

internal sealed class TrialLearningAccess(IApplicationDbContext context)
{
    public async Task<TrialLearningMode> GetModeAsync(Employee employee)
    {
        var survey = await context.TrialWorkspaces.AsNoTracking()
            .Where(t => t.OrganizationId == employee.OrganizationId && t.ConvertedAt == null
                && (t.RequestedAt != null || t.ReportPublishedAt != null))
            .Select(t => new { t.ReportPublishedAt })
            .FirstOrDefaultAsync();
        if (survey == null) return TrialLearningMode.Regular;

        if (survey.ReportPublishedAt == null)
        {
            return TrialLearningMode.AwaitingResult;
        }

        var assessment = await context.TrialAssessments.AsNoTracking()
            .FirstOrDefaultAsync(a => a.EmployeeId == employee.Id && a.OrganizationId == employee.OrganizationId);
        var domains = assessment is { ReviewedAt: null, ChoiceTotal: > 0 }
            ? await context.TrialAssessmentDomains.AsNoTracking().Where(d => d.TrialAssessmentId == assessment.Id).ToListAsync()
            : null;
        if (!TrialAssessmentResults.IsReady(assessment, domains))
        {
            return TrialLearningMode.AwaitingResult;
        }

        var frameworkSaved = await context.CapabilityCeilings.AsNoTracking()
            .AnyAsync(c => c.OrganizationId == employee.OrganizationId
                && (c.DepartmentId == null || c.DepartmentId == employee.DepartmentId));
        return frameworkSaved ? TrialLearningMode.Regular : TrialLearningMode.PublicBasics;
    }

    public async Task<IReadOnlyCollection<string>> LoadPublicBasicCodesAsync()
    {
        var codes = await context.PlatformCourses.AsNoTracking()
            .Where(c => c.Level == 1 && c.PublishedAt != null && c.SalesStatus == Statuses.PlatformCourseSales.Open)
            .Select(c => c.Code)
            .ToListAsync();
        // Older organizations use M1 for the catalog's A1 course.
        return codes.Concat(codes.Where(code => code.StartsWith("A1-", StringComparison.Ordinal))
            .Select(code => "M1-" + code[3..])).Distinct().ToArray();
    }

    public async Task<string?> CourseBlockReasonAsync(Employee employee, Guid courseId)
    {
        var mode = await GetModeAsync(employee);
        if (mode == TrialLearningMode.Regular) return null;
        if (mode == TrialLearningMode.AwaitingResult) return "Khóa học thử mở sau khi có kết quả khảo sát.";

        var codes = await LoadPublicBasicCodesAsync();
        var isPublicBasic = await context.Courses.AsNoTracking().AnyAsync(c =>
            c.Id == courseId && c.OrganizationId == employee.OrganizationId
            && c.Status == Statuses.Course.Published && codes.Contains(c.Code)
            && context.CourseCompetencies.Any(t => t.CourseId == c.Id)
            && !context.CourseCompetencies.Any(t => t.CourseId == c.Id && t.TargetLevel > 1));
        return isPublicBasic ? null : "Trong khi chờ thiết lập khung năng lực, bạn có thể học thử các khóa Cơ bản đang công khai.";
    }

    public async Task EnsureCourseAccessAsync(Employee employee, Guid courseId)
    {
        if (await CourseBlockReasonAsync(employee, courseId) is { } reason)
            throw new ForbiddenException(reason);
    }
}
