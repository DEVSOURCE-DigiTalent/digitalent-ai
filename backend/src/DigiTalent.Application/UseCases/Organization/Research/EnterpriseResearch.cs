using System.Text.Json;
using DigiTalent.Application.Common;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Learning.Content;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Constants.Authorization;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Organization.Research;

public sealed record ResearchCourseContent(string Title, string Objective, string Practice);
public sealed record ResearchCourseVersion(ResearchCourseContent? Draft, ResearchCourseContent? Applied);
public sealed record ResearchCourseItem(Guid CourseId, string Code, string Title, string? Description, int Tier,
    IReadOnlyList<string> Modules, ResearchCourseContent? Draft, ResearchCourseContent? Applied);
public sealed record ResearchModulePreview(Guid Id, string Title, IReadOnlyList<PulseSlideDto> Lessons);

public sealed partial class EnterpriseResearch(IApplicationDbContext context, ICurrentUser currentUser, PulseCatalogReader catalog,
    TimeProvider? time = null)
{
    public const string Prefix = "rnd.";
    private const string EnabledKey = Prefix + "enabled";
    private const string CoursePrefix = Prefix + "course.";
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public const string PurchaseRequiredMessage =
        "Tùy chỉnh khóa học mở khi công ty đã mua ít nhất 1 khóa học. Các khóa Cơ bản miễn phí vẫn học bình thường.";

    /// <summary>
    /// Customising courses (R&amp;D, or the owner when the company has no R&amp;D) is for companies that bought at least one
    /// course; the free Basic courses alone are learned as they are.
    /// </summary>
    public static Task<bool> HasPurchaseAsync(IApplicationDbContext context, Guid organizationId) =>
        context.CourseOrders.AsNoTracking().AnyAsync(order => order.OrganizationId == organizationId);

    public static async Task<bool> IsEnabledAsync(IApplicationDbContext context, Guid organizationId)
    {
        var value = await context.SystemSettings.AsNoTracking()
            .Where(s => s.OrganizationId == organizationId && s.Key == EnabledKey)
            .Select(s => s.Value).SingleOrDefaultAsync();
        return value == "true";
    }

    public async Task<bool> GetEnabledAsync()
    {
        var orgId = await RequireRoleAsync();
        return await IsEnabledAsync(context, orgId);
    }

    /// <summary>Turning R&amp;D off also revokes the R&amp;D invitations not activated yet: they would open an account with nothing to do.</summary>
    public async Task<bool> SetEnabledAsync(bool enabled)
    {
        var orgId = await RequireRoleAsync(ownerOnly: true);
        await context.ExecuteInSerializableTransactionAsync(async () =>
        {
            if (!enabled)
            {
                foreach (var invitation in await OpenResearchInvitations(context, orgId).ToListAsync())
                    invitation.Status = Statuses.MemberInvitation.Revoked;
            }
            await WriteAsync(orgId, EnabledKey, enabled);
        });
        return enabled;
    }

    public async Task<IReadOnlyList<ResearchCourseItem>> ListAsync()
    {
        var orgId = await RequireAccessAsync(write: false);
        var courses = await AllowedCoursesAsync(orgId);
        var ids = courses.Select(course => course.CourseId).ToArray();
        var modules = await context.CourseModules.AsNoTracking()
            .Where(module => ids.Contains(module.CourseId) && module.Status == Statuses.CourseContent.Active)
            .OrderBy(module => module.SortOrder).ThenBy(module => module.Id)
            .Select(module => new { module.CourseId, module.Title })
            .ToListAsync();
        var settings = await context.SystemSettings.AsNoTracking()
            .Where(s => s.OrganizationId == orgId && s.Key.StartsWith(CoursePrefix))
            .ToDictionaryAsync(s => s.Key, s => s.Value);
        return courses.Select(course =>
        {
            var version = ReadVersion(settings.GetValueOrDefault(Key(course.Code)));
            return new ResearchCourseItem(course.CourseId, CourseCodes.Canonical(course.Code), course.Title,
                course.Description, course.Tier, modules.Where(m => m.CourseId == course.CourseId).Select(m => m.Title).ToList(),
                version.Draft, version.Applied);
        }).ToList();
    }

    public async Task<IReadOnlyList<ResearchModulePreview>> PreviewAsync(Guid courseId, IPlatformAssetUrlSigner signer)
    {
        var orgId = await RequireAccessAsync(write: false);
        if (!(await AllowedCoursesAsync(orgId)).Any(course => course.CourseId == courseId))
            throw new NotFoundException("Khóa học không thuộc danh mục R&D của doanh nghiệp.");

        var modules = (await new PulseModuleReader(context).LoadModulesAsync(new[] { courseId }, includeContent: true))
            .GetValueOrDefault(courseId) ?? new();
        var media = await new LearningContentReader(context, signer)
            .MediaAsync(modules.SelectMany(m => m.Slides).Select(lesson => lesson.LessonId).ToList());
        return modules.Select(module => new ResearchModulePreview(module.ModuleId, module.Title,
            module.Slides.Select(lesson => new PulseSlideDto
            {
                LessonId = lesson.LessonId, Title = lesson.Title, LessonType = lesson.LessonType,
                ContentBody = lesson.ContentBody, EstimatedMinutes = lesson.EstimatedMinutes,
                Media = media.GetValueOrDefault(lesson.LessonId) ?? new(),
            }).ToList())).ToList();
    }

    /// <summary>Saves the information form as R&D's draft; it reaches employees with <see cref="ApplyCompanyVersionAsync"/>.</summary>
    public async Task<ResearchCourseVersion> SaveAsync(Guid courseId, ResearchCourseContent content)
    {
        var normalized = Normalize(content)!;
        ResearchCourseVersion? version = null;
        await context.ExecuteInSerializableTransactionAsync(async () =>
        {
            var orgId = await RequireAccessAsync(write: true);
            var course = (await AllowedCoursesAsync(orgId)).FirstOrDefault(item => item.CourseId == courseId)
                ?? throw new NotFoundException("Khóa học không thuộc danh mục R&D của doanh nghiệp.");
            var key = Key(course.Code);
            var existing = await context.SystemSettings.FirstOrDefaultAsync(s => s.OrganizationId == orgId && s.Key == key);
            version = new ResearchCourseVersion(normalized, ReadVersion(existing?.Value).Applied);
            await WriteAsync(orgId, key, version, existing);
        });
        return version!;
    }

    public static async Task<ResearchCourseContent?> GetAppliedAsync(IApplicationDbContext context, Guid organizationId, string code)
    {
        var key = Key(code);
        var value = await context.SystemSettings.AsNoTracking()
            .Where(s => s.OrganizationId == organizationId && s.Key == key)
            .Select(s => s.Value).SingleOrDefaultAsync();
        return ReadVersion(value).Applied;
    }

    private async Task<Guid> RequireRoleAsync(bool ownerOnly = false)
    {
        var orgId = currentUser.GetRequiredOrganizationId();
        var userId = currentUser.UserId;
        // Read the current role assignment, so revocation takes effect even with an old session token.
        var allowed = await (from user in context.Users
                             join assignment in context.UserRoles on user.Id equals assignment.UserId
                             join role in context.Roles on assignment.RoleId equals role.Id
                             where user.Id == userId && user.OrganizationId == orgId
                                 && (role.Code == Roles.Owner || (!ownerOnly && role.Code == Roles.Research))
                             select user.Id).AnyAsync();
        return allowed ? orgId : throw new ForbiddenException("Bạn không có quyền sử dụng R&D của doanh nghiệp.");
    }

    private async Task<List<PulseCourseRef>> AllowedCoursesAsync(Guid organizationId)
    {
        var purchased = await CourseOwnership.PurchasedCodesAsync(context, organizationId);
        return (await catalog.LoadAsync(organizationId))
            .Where(course => IsStandardBasic(course) || purchased.Contains(CourseCodes.Canonical(course.Code)))
            .OrderBy(course => course.Tier).ThenBy(course => CourseCodes.Canonical(course.Code))
            .ToList();
    }

    private static bool IsStandardBasic(PulseCourseRef course)
    {
        var code = CourseCodes.Canonical(course.Code);
        return course.Tier == 1 && code.Length == 4 && code[0] == 'M' && code[1] is >= '1' and <= '6' && code.EndsWith("-F");
    }

    private async Task WriteAsync<T>(Guid organizationId, string key, T value, SystemSetting? existing = null)
    {
        var setting = existing ?? await context.SystemSettings.FirstOrDefaultAsync(s => s.OrganizationId == organizationId && s.Key == key);
        if (setting == null)
        {
            setting = new SystemSetting { OrganizationId = organizationId, Key = key };
            context.SystemSettings.Add(setting);
        }
        setting.Value = JsonSerializer.Serialize(value, JsonOptions);
        setting.UpdatedByUserId = currentUser.UserId;
        await context.SaveChangesAsync();
    }

    private static string Key(string code) => CoursePrefix + CourseCodes.Canonical(code);

    private static ResearchCourseVersion ReadVersion(string? value) =>
        value == null ? new(null, null) : JsonSerializer.Deserialize<ResearchCourseVersion>(value, JsonOptions) ?? new(null, null);
}
