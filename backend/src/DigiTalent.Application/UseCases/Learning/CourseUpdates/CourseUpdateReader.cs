using System.Text.Json;
using DigiTalent.Application.Common;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Platform.Catalog;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Learning.CourseUpdates;

/// <summary>
/// The organization's side of a course version DigiTalent published without applying it to everyone: what the newest
/// version changes, whether the organization kept its version, and who decides (<see cref="CourseUpdateDeciders"/>:
/// the company's R&amp;D when it has one, otherwise the owner).
/// </summary>
public static class CourseUpdateReader
{
    /// <summary>system_settings key (per organization): the newest version the organization chose not to apply.</summary>
    public const string KeptSettingKey = "PLATFORM_CATALOG_KEPT";

    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    public static async Task<CourseUpdatesOutput> ReadAsync(IApplicationDbContext context, Guid organizationId, Guid? userId)
    {
        var deciders = await CourseUpdateDeciders.ForAsync(context, organizationId);
        var latest = await context.PlatformCatalogVersions.AsNoTracking()
            .FirstOrDefaultAsync(v => v.Status == Statuses.PlatformCatalogVersion.Current);
        if (latest == null)
        {
            return new CourseUpdatesOutput { DecidedBy = deciders.DecidedBy, CanDecide = deciders.Includes(userId) };
        }

        var applier = new PlatformCatalogApplier(context);
        var applied = (await applier.VersionsAsync(new[] { organizationId }, latest.VersionNo))[organizationId];
        var output = new CourseUpdatesOutput
        {
            CurrentVersionNo = applied,
            LatestVersionNo = latest.VersionNo,
            LatestPublishedAt = latest.PublishedAt,
            ReleaseNote = latest.ReleaseNote,
            DecidedBy = deciders.DecidedBy,
            CanDecide = deciders.Includes(userId),
        };

        var changes = applied == latest.VersionNo || !await applier.IsProvisionedAsync(organizationId)
            ? new List<PlatformCatalogApplyChange>()
            : await applier.PlanAsync(applied, latest.VersionNo);
        if (changes.Count == 0)
        {
            return output;
        }

        var purchased = await CourseOwnership.PurchasedCodesAsync(context, organizationId);
        var learners = await LearnersAsync(context, organizationId);
        var companyVersions = await DigiTalent.Application.UseCases.Organization.Research.EnterpriseResearch
            .CompanyVersionCodesAsync(context, organizationId, changes.Select(c => c.Code).ToList());
        output.Courses = changes
            .Select(change => new CourseUpdateCourseDto
            {
                CourseId = change.CourseId,
                Code = CourseCodes.Canonical(change.Code),
                Title = change.Title,
                Level = change.Level,
                Kind = change.Kind,
                Owned = !CourseOwnership.IsPaid(change.Code) || purchased.Contains(CourseCodes.Canonical(change.Code)),
                LearnersInProgress = learners.GetValueOrDefault(CourseCodes.Canonical(change.Code)).InProgress,
                LearnersPassed = learners.GetValueOrDefault(CourseCodes.Canonical(change.Code)).Passed,
                CompanyVersion = companyVersions.Contains(CourseCodes.Canonical(change.Code)),
            })
            .OrderByDescending(c => c.Owned)
            .ThenBy(c => c.Code, StringComparer.OrdinalIgnoreCase)
            .ToList();

        var kept = await ReadKeptAsync(context, organizationId);
        if (kept?.VersionNo == latest.VersionNo)
        {
            output.Status = CourseUpdateStatus.Kept;
            output.Kept = kept;
        }
        else
        {
            output.Status = CourseUpdateStatus.Available;
        }

        return output;
    }

    /// <summary>The organization's last "keep my version" decision, or null.</summary>
    public static async Task<CourseUpdateKeptDto?> ReadKeptAsync(IApplicationDbContext context, Guid organizationId)
    {
        var value = await context.SystemSettings.AsNoTracking()
            .Where(s => s.OrganizationId == organizationId && s.Key == KeptSettingKey)
            .Select(s => s.Value)
            .FirstOrDefaultAsync();
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        KeptRecord? record;
        try
        {
            record = JsonSerializer.Deserialize<KeptRecord>(value, Json);
        }
        catch (JsonException)
        {
            return null;
        }

        if (record == null)
        {
            return null;
        }

        var keptBy = record.UserId is { } userId
            ? await context.Users.AsNoTracking().Where(u => u.Id == userId).Select(u => u.DisplayName != "" ? u.DisplayName : u.Email).FirstOrDefaultAsync()
            : null;
        return new CourseUpdateKeptDto { VersionNo = record.VersionNo, Reason = record.Reason, KeptAt = record.KeptAt, KeptBy = keptBy };
    }

    /// <summary>Records that the organization keeps its version instead of <paramref name="versionNo"/> (the caller saves).</summary>
    public static async Task SaveKeptAsync(
        IApplicationDbContext context, Guid organizationId, int versionNo, string reason, Guid? userId, DateTimeOffset now)
    {
        var value = JsonSerializer.Serialize(new KeptRecord(versionNo, reason, now, userId), Json);
        var setting = await context.SystemSettings.FirstOrDefaultAsync(s => s.OrganizationId == organizationId && s.Key == KeptSettingKey);
        if (setting == null)
        {
            context.SystemSettings.Add(new SystemSetting
            {
                OrganizationId = organizationId,
                Key = KeptSettingKey,
                Value = value,
                Description = "Phiên bản khóa học doanh nghiệp chọn giữ nguyên thay cho bản DigiTalent mới công bố",
                UpdatedByUserId = userId,
            });
            return;
        }

        setting.Value = value;
        setting.UpdatedByUserId = userId;
    }

    /// <summary>Employees per canonical course code who started a course of the organization and have not finished it.</summary>
    /// <summary>Per canonical course code: employees learning it now and employees who passed it (both learn it again on apply).</summary>
    private static async Task<Dictionary<string, (int InProgress, int Passed)>> LearnersAsync(IApplicationDbContext context, Guid organizationId)
    {
        var rows = await (
                from enrollment in context.Enrollments.AsNoTracking()
                join course in context.Courses.AsNoTracking() on enrollment.CourseId equals course.Id
                where course.OrganizationId == organizationId && enrollment.Status != Statuses.Enrollment.Cancelled
                select new { course.Code, enrollment.EmployeeId, Passed = enrollment.Status == Statuses.Enrollment.Completed })
            .ToListAsync();
        return rows
            .GroupBy(r => CourseCodes.Canonical(r.Code), StringComparer.OrdinalIgnoreCase)
            .ToDictionary(
                g => g.Key,
                g => (g.Where(r => !r.Passed).Select(r => r.EmployeeId).Distinct().Count(), g.Where(r => r.Passed).Select(r => r.EmployeeId).Distinct().Count()),
                StringComparer.OrdinalIgnoreCase);
    }

    private sealed record KeptRecord(int VersionNo, string Reason, DateTimeOffset KeptAt, Guid? UserId);
}
