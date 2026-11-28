using System.Text.Json;
using DigiTalent.Application.Common;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Learning.CourseUpdates;
using DigiTalent.Application.UseCases.Platform.Catalog;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Organization.Research;

/// <summary>What R&D applies: the course content of its draft (or the content in use) and the course information form.</summary>
/// <param name="GraceDays">0 = employees learning the course move to the new content at once; 7 / 14 / 30 = they may finish the old one first.</param>
/// <param name="MajorChange">The old content is wrong now: employees who finished the course learn it again (new certificate).</param>
public sealed record ResearchApplyInput(int Revision, ResearchCourseContent? Info, int GraceDays = CourseRelearn.DefaultGraceDays,
    bool MajorChange = false);

/// <summary>One course of a multi-course apply: the editor revision seen, and the information form when it is open on screen.</summary>
public sealed record ResearchApplyCourse(Guid CourseId, int Revision, ResearchCourseContent? Info = null);

public sealed record ResearchApplyManyInput(List<ResearchApplyCourse> Courses, int GraceDays = CourseRelearn.DefaultGraceDays,
    bool MajorChange = false);

/// <summary>Canonical codes of the courses applied.</summary>
public sealed record ResearchApplyManyResult(IReadOnlyList<string> Applied);

/// <summary>
/// The company version of a course. Applying it writes a new course revision in the organization, like a DigiTalent
/// publication, so employees learn, take the review quizzes, the skip test and the final on R&D's content; everyone
/// learns the course again from the start (certificates stay). Removing it writes the standard content again.
/// </summary>
public sealed partial class EnterpriseResearch
{
    private const string DefaultQuizTitle = "Câu hỏi ôn tập";

    /// <summary>system_settings key: ids of every course revision written from a company version (JSON array).</summary>
    private const string RevisionsKey = Prefix + "revisions";

    public async Task<ResearchAuthoringVersion> ApplyCompanyVersionAsync(Guid courseId, ResearchApplyInput input,
        PlatformCourseContentReader reader, IHtmlContentSanitizer sanitizer)
    {
        var info = Normalize(input.Info);
        CourseRelearn.EnsureGraceDays(input.GraceDays);
        ResearchAuthoringVersion? result = null;
        await context.ExecuteInSerializableTransactionAsync(async () =>
        {
            var orgId = await RequireAccessAsync(write: true);
            var prepared = await PrepareApplyAsync(orgId, courseId, input.Revision, info, reader, sanitizer);
            if (prepared.Problems.Count > 0)
                throw new BadRequestException("Chưa áp dụng được: " + string.Join(" ", prepared.Problems.Take(3))
                    + (prepared.Problems.Count > 3 ? $" (và {prepared.Problems.Count - 3} mục khác)" : ""));
            result = await WriteApplyAsync(orgId, prepared);
            await CourseRelearn.ApplyAsync(context, orgId, new[] { prepared.Source.Code }, input.GraceDays, Now(), input.MajorChange);
            await context.SaveChangesAsync();
        });
        return result!;
    }

    /// <summary>
    /// Applies several courses at once (the company version of each, as R&amp;D or the owner left it): all or nothing — a
    /// course that is not ready stops the whole apply with what to fix per course. One choice of grace and change size for
    /// all; each employee gets one notification listing every course.
    /// </summary>
    public async Task<ResearchApplyManyResult> ApplyCompanyVersionsAsync(ResearchApplyManyInput input,
        PlatformCourseContentReader reader, IHtmlContentSanitizer sanitizer)
    {
        CourseRelearn.EnsureGraceDays(input.GraceDays);
        var courses = (input.Courses ?? new List<ResearchApplyCourse>()).DistinctBy(c => c.CourseId).ToList();
        if (courses.Count is 0 or > 30)
            throw new BadRequestException("Chọn từ 1 đến 30 khóa học để áp dụng.", "courses", "INVALID_COURSES");
        var applied = new List<string>();
        await context.ExecuteInSerializableTransactionAsync(async () =>
        {
            var orgId = await RequireAccessAsync(write: true);
            var prepared = new List<PreparedApply>();
            foreach (var course in courses)
                prepared.Add(await PrepareApplyAsync(orgId, course.CourseId, course.Revision, Normalize(course.Info), reader, sanitizer));
            var blocked = prepared.Where(p => p.Problems.Count > 0).ToList();
            if (blocked.Count > 0)
                throw new BadRequestException("Chưa áp dụng được: " + string.Join(" ", blocked.Select(p =>
                    $"{CourseCodes.Canonical(p.Source.Code)} {p.Title}: {string.Join(" ", p.Problems.Take(2))}"
                    + (p.Problems.Count > 2 ? $" (và {p.Problems.Count - 2} mục khác)" : ""))));
            foreach (var course in prepared)
            {
                await WriteApplyAsync(orgId, course);
                applied.Add(CourseCodes.Canonical(course.Source.Code));
            }
            await CourseRelearn.ApplyAsync(context, orgId, prepared.Select(p => p.Source.Code).ToList(), input.GraceDays, Now(), input.MajorChange);
            await context.SaveChangesAsync();
        });
        return new ResearchApplyManyResult(applied);
    }

    private sealed record PreparedApply(PlatformCatalogCourseDetail Source, AuthoringState State, AuthoringContent Content,
        ResearchCourseContent? Info, SystemSetting? InfoSetting, string Title, string Outcome, List<string> Problems);

    /// <summary>Reads and checks one course to apply (nothing is written): the content, its information and what blocks it.</summary>
    private async Task<PreparedApply> PrepareApplyAsync(Guid orgId, Guid courseId, int revision, ResearchCourseContent? info,
        PlatformCourseContentReader reader, IHtmlContentSanitizer sanitizer)
    {
        var source = await AuthoringSourceAsync(orgId, courseId, reader);
        var state = await ReadAuthoringAsync(context, orgId, source.Code);
        if (state.Revision != revision)
            throw new ConflictException("Bản nháp đã thay đổi. Tải lại khóa học trước khi tiếp tục.");
        var content = state.Draft ?? state.Applied ?? new AuthoringContent(source.Modules, source.Final);
        Validate(content, sanitizer, apply: true);
        await RefreshAssetsAsync(orgId, source, content, reader, state.Draft, state.Applied);

        var infoSetting = await context.SystemSettings.FirstOrDefaultAsync(s => s.OrganizationId == orgId && s.Key == Key(source.Code));
        var saved = ReadVersion(infoSetting?.Value);
        var applied = info ?? saved.Draft ?? saved.Applied;
        var title = applied?.Title is { Length: > 0 } ownTitle ? ownTitle : source.Title;
        var outcome = applied?.Objective is { Length: > 0 } objective ? objective : source.Outcome;
        var problems = Problems(content, sanitizer);
        if (outcome.Trim().Length < 10)
            problems.Insert(0, "Mục tiêu học tập cần ít nhất 10 ký tự (để trống thì dùng mục tiêu của khóa chuẩn).");
        return new PreparedApply(source, state, content, applied, infoSetting, title, outcome, problems);
    }

    /// <summary>Writes the new course revision and moves the course's R&amp;D state to "applied" (relearn is the caller's).</summary>
    private async Task<ResearchAuthoringVersion> WriteApplyAsync(Guid orgId, PreparedApply prepared)
    {
        var source = prepared.Source;
        source.CourseId = (await WriteCompanyRevisionAsync(orgId, source, prepared.Content, prepared.Title, prepared.Outcome)).Id;
        await WriteAsync(orgId, RevisionsKey, (await CompanyRevisionIdsAsync(context, orgId)).Append(source.CourseId).ToList());
        var state = new AuthoringState(prepared.State.Revision + 1, null, prepared.Content);
        await WriteAsync(orgId, AuthoringPrefix + source.Code, state);
        await WriteAsync(orgId, Key(source.Code), new ResearchCourseVersion(null, prepared.Info), prepared.InfoSetting);
        source.Modules = prepared.Content.Modules;
        source.Final = prepared.Content.Final;
        return ToAuthoring(state, source, new List<string>());
    }

    /// <summary>Employees go back to the standard content (a new revision too); R&D keeps its version as a draft.</summary>
    public async Task<ResearchAuthoringVersion> RemoveCompanyVersionAsync(Guid courseId, int revision,
        PlatformCourseContentReader reader, IHtmlContentSanitizer sanitizer, int graceDays = CourseRelearn.DefaultGraceDays,
        bool majorChange = false)
    {
        CourseRelearn.EnsureGraceDays(graceDays);
        var code = "";
        await context.ExecuteInSerializableTransactionAsync(async () =>
        {
            var orgId = await RequireAccessAsync(write: true);
            var origin = await SourceRowAsync(orgId, courseId);
            code = origin.Code;
            var state = await ReadAuthoringAsync(context, orgId, origin.Code);
            if (state.Revision != revision)
                throw new ConflictException("Bản nháp đã thay đổi. Tải lại khóa học trước khi tiếp tục.");
            var info = await context.SystemSettings.AsNoTracking()
                .Where(s => s.OrganizationId == orgId && s.Key == Key(origin.Code)).Select(s => s.Value).SingleOrDefaultAsync();
            if (state.Applied is null && ReadVersion(info).Applied is null)
                throw new BadRequestException("Khóa học đang dùng nội dung chuẩn, không có bản doanh nghiệp để gỡ.");

            // The publisher releases the company version (applied -> draft) for the course it writes.
            await new PlatformLearningPublisher(context).PublishAsync(origin.VersionId, currentUser.UserId, Now(), orgId,
                onlyCourseIds: new[] { origin.PlatformCourseId }, reapply: true);
            await CourseRelearn.ApplyAsync(context, orgId, new[] { origin.Code }, graceDays, Now(), majorChange);
            await context.SaveChangesAsync();
        });
        // The course now has a new revision (a new id).
        var current = (await AllowedCoursesAsync(currentUser.GetRequiredOrganizationId()))
            .First(c => CourseCodes.Canonical(c.Code) == code);
        return await GetAuthoringAsync(current.CourseId, reader, sanitizer);
    }

    /// <summary>
    /// DigiTalent content was just written for a course of the organization: the company version R&D applied is no
    /// longer what employees learn, so it goes back to R&D's draft (unless R&D has a newer draft). Tracked; the caller saves.
    /// </summary>
    public static async Task ReleaseCompanyVersionAsync(IApplicationDbContext db, Guid organizationId, string code)
    {
        var canonical = CourseCodes.Canonical(code);
        var keys = new[] { AuthoringPrefix + canonical, CoursePrefix + canonical };
        var settings = await db.SystemSettings.Where(s => s.OrganizationId == organizationId && keys.Contains(s.Key)).ToListAsync();
        foreach (var setting in settings)
        {
            if (setting.Key.StartsWith(AuthoringPrefix, StringComparison.Ordinal))
            {
                var state = JsonSerializer.Deserialize<AuthoringState>(setting.Value, JsonOptions);
                if (state?.Applied is null) continue;
                setting.Value = JsonSerializer.Serialize(new AuthoringState(state.Revision + 1, state.Draft ?? state.Applied, null), JsonOptions);
            }
            else
            {
                var version = ReadVersion(setting.Value);
                if (version.Applied is null) continue;
                setting.Value = JsonSerializer.Serialize(new ResearchCourseVersion(version.Draft ?? version.Applied, null), JsonOptions);
            }
        }
    }

    /// <summary>
    /// Course revisions written from a company version: what DigiTalent's measures (the competency survey) leave out so
    /// they keep comparing with the standard content.
    /// </summary>
    public static async Task<List<Guid>> CompanyRevisionIdsAsync(IApplicationDbContext db, Guid organizationId)
    {
        var value = await db.SystemSettings.AsNoTracking()
            .Where(s => s.OrganizationId == organizationId && s.Key == RevisionsKey).Select(s => s.Value).SingleOrDefaultAsync();
        return value is null ? new List<Guid>() : JsonSerializer.Deserialize<List<Guid>>(value, JsonOptions) ?? new List<Guid>();
    }

    /// <summary>Whether R&D applied a company version of these courses (canonical codes).</summary>
    public static async Task<HashSet<string>> CompanyVersionCodesAsync(IApplicationDbContext db, Guid organizationId,
        IReadOnlyCollection<string> codes)
    {
        var canonical = codes.Select(CourseCodes.Canonical).Distinct().ToList();
        var keys = canonical.Select(c => AuthoringPrefix + c).Concat(canonical.Select(c => CoursePrefix + c)).ToList();
        var settings = await db.SystemSettings.AsNoTracking()
            .Where(s => s.OrganizationId == organizationId && keys.Contains(s.Key)).ToListAsync();
        var result = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var setting in settings)
        {
            var authoring = setting.Key.StartsWith(AuthoringPrefix, StringComparison.Ordinal);
            var applied = authoring
                ? JsonSerializer.Deserialize<AuthoringState>(setting.Value, JsonOptions)?.Applied is not null
                : ReadVersion(setting.Value).Applied is not null;
            if (applied) result.Add(setting.Key[(authoring ? AuthoringPrefix : CoursePrefix).Length..]);
        }
        return result;
    }

    /// <summary>What must be fixed before the content can be applied: the BLOCK rules of a DigiTalent publication.</summary>
    private static List<string> Problems(AuthoringContent content, IHtmlContentSanitizer sanitizer)
    {
        var problems = new List<string>();
        if (content.Modules.Count == 0) problems.Add("Khóa học chưa có mô đun nào.");
        foreach (var (module, index) in content.Modules.Select((m, i) => (m, i + 1)))
        {
            var label = $"Mô đun {index}:";
            if (module.Blocks.Count == 0) problems.Add($"{label} chưa có nội dung.");
            foreach (var block in module.Blocks)
            {
                var what = block.Type switch
                {
                    PlatformCatalog.BlockType.Text when string.IsNullOrWhiteSpace(sanitizer.PlainText(block.BodyHtml)) => "một khối chữ đang trống",
                    PlatformCatalog.BlockType.Slide when block.Items.Count == 0 => "một slide chưa có ảnh hoặc video",
                    PlatformCatalog.BlockType.Image when block.Asset is null => "một khối ảnh chưa tải ảnh",
                    PlatformCatalog.BlockType.Pdf when block.Asset is null => "một khối PDF chưa tải tệp PDF",
                    PlatformCatalog.BlockType.Video when block.Asset is null => "một khối video chưa tải video",
                    _ => null,
                };
                if (what is not null) problems.Add($"{label} {what}.");
            }
            if (module.Questions.Count < PlatformCatalog.MinQuestionsPerModule)
                problems.Add($"{label} cần ít nhất {PlatformCatalog.MinQuestionsPerModule} câu hỏi ôn tập (đang có {module.Questions.Count}).");
            if (module.Questions.Any(q => string.IsNullOrWhiteSpace(q.Text) || q.Options.Count < PlatformCatalog.MinOptionsPerQuestion
                    || q.Options.Any(o => string.IsNullOrWhiteSpace(o.Text)) || q.Options.Count(o => o.IsCorrect) != 1))
                problems.Add($"{label} có câu hỏi chưa đủ nội dung, phương án hoặc đáp án đúng.");
        }
        if (string.IsNullOrWhiteSpace(content.Final.Title)) problems.Add("Bài cuối khóa chưa có tên.");
        if (string.IsNullOrWhiteSpace(sanitizer.PlainText(content.Final.PromptHtml))) problems.Add("Chưa có đề bài cuối khóa.");
        if (!content.Final.Criteria.Any(c => !string.IsNullOrWhiteSpace(c))) problems.Add("Bài cuối khóa cần ít nhất một tiêu chí chấm.");
        return problems;
    }

    private async Task<Course> WriteCompanyRevisionAsync(Guid orgId, PlatformCatalogCourseDetail source, AuthoringContent content,
        string title, string outcome)
    {
        var aliases = CourseCodes.Aliases(source.Code);
        var previous = await context.Courses.AsNoTracking()
            .Where(c => c.OrganizationId == orgId && aliases.Contains(c.Code) && c.Status == Statuses.Course.Published)
            .OrderByDescending(c => c.VersionNo).FirstOrDefaultAsync()
            ?? throw new NotFoundException("Doanh nghiệp chưa có khóa học này.");
        var versionNo = await context.Courses.Where(c => c.OrganizationId == orgId && c.Code == previous.Code).MaxAsync(c => c.VersionNo) + 1;
        var modules = content.Modules.Select(module => new CourseRevisionModule(
            module.Title.Trim(),
            string.IsNullOrWhiteSpace(module.QuizTitle) ? DefaultQuizTitle : module.QuizTitle.Trim(),
            module.Blocks.Select((block, index) => new PlatformModuleBlock
            {
                Id = block.BlockId, ModuleId = module.ModuleId, SortOrder = index, BlockType = block.Type,
                BodyHtml = block.BodyHtml, AssetId = block.Asset?.AssetId, Caption = block.Caption, AltText = block.AltText,
            }).ToList(),
            module.Blocks.SelectMany(block => block.Items.Select((item, index) => new PlatformSlideItem
            {
                Id = item.ItemId, BlockId = block.BlockId, SortOrder = index, AssetId = item.Asset.AssetId, Caption = item.Caption,
            })).ToList(),
            module.Questions.Select(question => new CourseRevisionQuestion(question.Text.Trim(), question.Explanation,
                question.IsFinalQuiz, question.BlockId,
                question.Options.Select((option, index) => new CourseRevisionOption(option.Text.Trim(), option.IsCorrect, index + 1)).ToList())).ToList()))
            .ToList();
        var revision = new CourseRevisionContent(title, outcome, source.Level, content.Final.Title.Trim(), content.Final.PromptHtml,
            content.Final.Criteria.Where(c => !string.IsNullOrWhiteSpace(c)).Select(c => c.Trim()).ToList(), modules);
        return await CourseRevisionWriter.WriteAsync(context, previous, CourseRevisionWriter.Id($"rnd-learning:{orgId}:{previous.Code}:v{versionNo}"),
            previous.Code, versionNo, isNew: false, revision, currentUser.UserId, Now());
    }

    private static ResearchCourseContent? Normalize(ResearchCourseContent? content)
    {
        if (content is null) return null;
        var normalized = new ResearchCourseContent(content.Title?.Trim() ?? "", content.Objective?.Trim() ?? "", content.Practice?.Trim() ?? "");
        if (normalized.Title.Length > 200 || normalized.Objective.Length > 2000 || normalized.Practice.Length > 8000)
            throw new BadRequestException("Tên, mục tiêu hoặc hướng dẫn thực hành dài quá giới hạn cho phép.");
        return normalized;
    }

    private DateTimeOffset Now() => (time ?? TimeProvider.System).GetUtcNow();
}
