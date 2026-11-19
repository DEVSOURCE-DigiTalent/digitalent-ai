using DigiTalent.Application.Common;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Competency.Common;
using DigiTalent.Application.UseCases.JobArchitecture.JobPositions;
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
            .Select(t => new { t.ReportPublishedAt, t.OwnerUserId })
            .FirstOrDefaultAsync();
        if (survey == null) return TrialLearningMode.Regular;

        var isOwnerParticipant = employee.UserId == survey.OwnerUserId;
        if (isOwnerParticipant && survey.ReportPublishedAt == null)
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

        // Khung năng lực số saved: a course bought (organization row) or a level the owner set for the employee's position.
        var positionId = await EffectiveJobPositions.Resolve(context, context.Employees.AsNoTracking().Where(e => e.Id == employee.Id))
            .Select(row => row.PositionId).FirstOrDefaultAsync();
        var frameworkSaved = await context.CapabilityCeilings.AsNoTracking()
                .AnyAsync(c => c.OrganizationId == employee.OrganizationId && c.DepartmentId == null)
            || (positionId != null && await (
                    from set in context.PositionRequirementSets.AsNoTracking()
                    join item in context.PositionRequirementItems.AsNoTracking() on set.Id equals item.RequirementSetId
                    where set.JobPositionId == positionId && set.Status == Statuses.PositionRequirementSet.Active
                        && item.Note == PositionTargets.OwnerItemNote
                    select item.Id).AnyAsync());
        var roadmapReady = frameworkSaved && (isOwnerParticipant || positionId.HasValue);
        return roadmapReady ? TrialLearningMode.Regular : TrialLearningMode.PublicBasics;
    }

    public async Task<IReadOnlyCollection<string>> LoadPublicBasicCodesAsync()
    {
        var codes = await context.PlatformCourses.AsNoTracking()
            .Where(c => c.Level == 1 && c.PublishedAt != null && c.SalesStatus == Statuses.PlatformCourseSales.Open)
            .Select(c => c.Code)
            .ToListAsync();
        return codes.SelectMany(CourseCodes.Aliases).Distinct().ToArray();
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
