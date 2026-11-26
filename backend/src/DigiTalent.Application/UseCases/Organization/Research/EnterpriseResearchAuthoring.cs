using System.Text.Json;
using System.Diagnostics.CodeAnalysis;
using DigiTalent.Application.Common;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Platform.Catalog;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Organization.Research;

public sealed record ResearchAuthoringVersion(int Revision, PlatformCatalogCourseDetail Course, bool HasDraft, bool HasApplied);
public sealed record ResearchAuthoringInput(int Revision, List<PlatformModuleDto> Modules, PlatformCourseFinalDto Final);

public sealed partial class EnterpriseResearch
{
    private const string AuthoringPrefix = Prefix + "editor.";
    private const string AssetPrefix = Prefix + "asset.";
    private sealed record AuthoringContent(List<PlatformModuleDto> Modules, PlatformCourseFinalDto Final);
    private sealed record AuthoringState(int Revision, AuthoringContent? Draft, AuthoringContent? Applied);

    public async Task<ResearchAuthoringVersion> GetAuthoringAsync(Guid courseId, PlatformCourseContentReader reader)
    {
        var orgId = await RequireEnabledAsync();
        var source = await AuthoringSourceAsync(orgId, courseId, reader);
        var state = await ReadAuthoringAsync(context, orgId, source.Code);
        if ((state.Draft ?? state.Applied) is { } saved)
        {
            await RefreshAssetsAsync(orgId, source, saved, reader, saved);
            source.Modules = saved.Modules;
            source.Final = saved.Final;
        }
        return ToAuthoring(state, source);
    }

    public async Task<ResearchAuthoringVersion> SaveAuthoringAsync(Guid courseId, ResearchAuthoringInput input,
        PlatformCourseContentReader reader, IHtmlContentSanitizer sanitizer, bool apply = false)
    {
        ResearchAuthoringVersion? result = null;
        await context.ExecuteInSerializableTransactionAsync(async () =>
        {
            var orgId = await RequireEnabledAsync();
            var source = await AuthoringSourceAsync(orgId, courseId, reader);
            var state = await ReadAuthoringAsync(context, orgId, source.Code);
            if (state.Revision != input.Revision)
                throw new ConflictException("Bản nháp đã thay đổi. Tải lại khóa học trước khi tiếp tục.");
            var content = new AuthoringContent(input.Modules, input.Final);
            Validate(content, sanitizer, apply);
            await RefreshAssetsAsync(orgId, source, content, reader, state.Draft, state.Applied);
            state = new AuthoringState(state.Revision + 1, apply ? null : content, apply ? content : state.Applied);
            await WriteAsync(orgId, AuthoringPrefix + source.Code, state);
            source.Modules = content.Modules;
            source.Final = content.Final;
            result = ToAuthoring(state, source);
        });
        return result!;
    }

    public async Task<ResearchAuthoringVersion> RemoveAuthoringAsync(Guid courseId, int revision,
        PlatformCourseContentReader reader, bool applied)
    {
        await context.ExecuteInSerializableTransactionAsync(async () =>
        {
            var orgId = await RequireEnabledAsync();
            var source = await AuthoringSourceAsync(orgId, courseId, reader);
            var state = await ReadAuthoringAsync(context, orgId, source.Code);
            if (state.Revision != revision)
                throw new ConflictException("Bản nháp đã thay đổi. Tải lại khóa học trước khi tiếp tục.");
            var next = applied
                ? state with { Revision = revision + 1, Applied = null }
                : state with { Revision = revision + 1, Draft = null };
            await WriteAsync(orgId, AuthoringPrefix + source.Code, next);
        });
        return await GetAuthoringAsync(courseId, reader);
    }

    public async Task<PlatformAssetDto> UploadAuthoringAssetAsync(Guid courseId, UploadPlatformAssetUseCaseInput input,
        IUseCase<UploadPlatformAssetUseCaseInput, PlatformAssetDto> uploader, PlatformCourseContentReader reader)
    {
        var orgId = await RequireEnabledAsync();
        await AuthoringSourceAsync(orgId, courseId, reader);
        var asset = await uploader.ExecuteAsync(input);
        await WriteAsync(orgId, AssetPrefix + asset.AssetId, true);
        return asset;
    }

    public static async Task<ResearchAppliedCurriculum?> GetAppliedCurriculumAsync(IApplicationDbContext db,
        Guid orgId, string code, IPlatformAssetUrlSigner signer)
    {
        var applied = (await ReadAuthoringAsync(db, orgId, CourseCodes.Canonical(code))).Applied;
        if (applied is null) return null;

        foreach (var block in applied.Modules.SelectMany(m => m.Blocks))
        {
            if (block.Asset is not null) block.Asset.Url = signer.ContentPath(block.Asset.AssetId);
            foreach (var item in block.Items) item.Asset.Url = signer.ContentPath(item.Asset.AssetId);
        }
        return new ResearchAppliedCurriculum(applied.Modules.Select(module => new ResearchAppliedModule(
            module.ModuleId, module.Title, module.Blocks, module.Questions
                .Where(question => !question.IsFinalQuiz)
                .Select(question => new ResearchPracticeQuestion(question.QuestionId, question.Text,
                    question.Options.Select(option => new ResearchPracticeOption(option.OptionId, option.Text)).ToList())).ToList())).ToList(), applied.Final);
    }

    private async Task<PlatformCatalogCourseDetail> AuthoringSourceAsync(Guid orgId, Guid courseId, PlatformCourseContentReader reader)
    {
        var course = (await AllowedCoursesAsync(orgId)).FirstOrDefault(item => item.CourseId == courseId)
            ?? throw new NotFoundException("Khóa học không thuộc danh mục R&D của doanh nghiệp.");
        var aliases = CourseCodes.Aliases(course.Code);
        var source = await (from entry in context.PlatformCatalogCourses.AsNoTracking()
                            join version in context.PlatformCatalogVersions on entry.VersionId equals version.Id
                            join platformCourse in context.PlatformCourses on entry.CourseId equals platformCourse.Id
                            where version.Status == Statuses.PlatformCatalogVersion.Current && aliases.Contains(platformCourse.Code)
                            orderby platformCourse.Id == courseId descending, version.VersionNo descending
                            select new { Version = version.VersionNo, Id = entry.CourseId }).FirstOrDefaultAsync()
            ?? throw new NotFoundException("Khóa học chưa có phiên bản biên soạn được công bố.");
        var detail = await reader.ReadAsync(source.Version, source.Id);
        detail.CourseId = courseId;
        detail.Code = CourseCodes.Canonical(course.Code);
        return detail;
    }

    private async Task RefreshAssetsAsync(Guid orgId, PlatformCatalogCourseDetail source, AuthoringContent content,
        PlatformCourseContentReader reader, params AuthoringContent?[] trustedVersions)
    {
        var blocks = content.Modules.SelectMany(m => m.Blocks).ToList();
        var ids = blocks.SelectMany(AssetIds).Distinct().ToList();
        if (ids.Count == 0) return;
        var keys = ids.Select(id => AssetPrefix + id).ToArray();
        var uploaded = await context.SystemSettings.AsNoTracking().Where(s => s.OrganizationId == orgId && keys.Contains(s.Key))
            .Select(s => s.Key).ToListAsync();
        var allowed = source.Modules.SelectMany(m => m.Blocks).SelectMany(AssetIds)
            .Concat(trustedVersions.OfType<AuthoringContent>().SelectMany(v => v.Modules).SelectMany(m => m.Blocks).SelectMany(AssetIds))
            .Concat(ids.Where(id => uploaded.Contains(AssetPrefix + id))).ToHashSet();
        if (ids.Any(id => !allowed.Contains(id))) throw new BadRequestException("Tệp không thuộc khóa học hoặc doanh nghiệp.");
        var assets = await context.PlatformAssets.AsNoTracking().Where(asset => ids.Contains(asset.Id)).ToDictionaryAsync(a => a.Id);
        foreach (var block in blocks)
        {
            if (block.Asset is not null) block.Asset = Resolve(block.Asset.AssetId, block.Type);
            foreach (var item in block.Items) item.Asset = Resolve(item.Asset.AssetId, null);
        }
        PlatformAssetDto Resolve(Guid id, string? kind)
        {
            if (!assets.TryGetValue(id, out var asset) ||
                (kind is null ? asset.Kind is not ("IMAGE" or "VIDEO") : asset.Kind != kind))
                throw new BadRequestException("Loại tệp không phù hợp với khối.");
            return reader.Asset(asset);
        }
    }

    private static IEnumerable<Guid> AssetIds(PlatformBlockDto block) =>
        block.Items.Select(item => item.Asset.AssetId).Concat(block.Asset is null ? Array.Empty<Guid>() : new[] { block.Asset.AssetId });

    private static void Validate(AuthoringContent content, IHtmlContentSanitizer sanitizer, bool apply)
    {
        static void Check([DoesNotReturnIf(false)] bool valid)
        {
            if (!valid) throw new BadRequestException("Cấu trúc hoặc nội dung khóa học chưa hợp lệ.");
        }

        Check(content.Modules is { Count: <= 60 } && content.Final is not null);
        Check(content.Final.Title is { Length: > 0 and <= 250 } && content.Final.Criteria is { Count: <= 10 } &&
            content.Final.Criteria.All(c => c is { Length: <= 1000 }) && content.Final.PromptHtml is { Length: <= 250000 });
        content.Final.PromptHtml = sanitizer.Sanitize(content.Final.PromptHtml);
        var ids = new HashSet<Guid>();
        for (var i = 0; i < content.Modules.Count; i++)
        {
            var module = content.Modules[i];
            Check(module is not null && module.Title is { Length: >= 2 and <= 250 } && module.QuizTitle is { Length: <= 250 } &&
                module.Blocks is { Count: <= 100 } && module.Questions is { Count: <= 150 } && AddId(module.ModuleId));
            module.Index = i;
            var moduleBlocks = new HashSet<Guid>();
            for (var j = 0; j < module.Blocks.Count; j++)
            {
                var block = module.Blocks[j];
                Check(block is not null && block.Type is "TEXT" or "VIDEO" or "PDF" or "SLIDE" or "IMAGE" &&
                    (block.BodyHtml?.Length ?? 0) <= 250000 && (block.Caption?.Length ?? 0) <= 2000 &&
                    (block.AltText?.Length ?? 0) <= 1000 && block.Items is { Count: <= 50 } && AddId(block.BlockId));
                block.Index = j;
                moduleBlocks.Add(block.BlockId);
                if (block.BodyHtml is not null) block.BodyHtml = sanitizer.Sanitize(block.BodyHtml);
                Check(block.Items.All(item => item is not null && item.Asset is not null && AddId(item.ItemId) && (item.Caption?.Length ?? 0) <= 2000));
            }
            for (var j = 0; j < module.Questions.Count; j++)
            {
                var question = module.Questions[j];
                Check(question is not null && question.Text is { Length: <= 1000 } && (question.Explanation?.Length ?? 0) <= 4000 &&
                    question.Options is { Count: <= 6 } && AddId(question.QuestionId) &&
                    (question.BlockId is null || moduleBlocks.Contains(question.BlockId.Value)) &&
                    question.Options.All(option => option is not null && option.Text is { Length: <= 1000 } && AddId(option.OptionId)));
                if (apply)
                    Check(!string.IsNullOrWhiteSpace(question.Text) && question.Options.Count >= 2 &&
                        question.Options.Count(option => option.IsCorrect) == 1 &&
                        question.Options.All(option => !string.IsNullOrWhiteSpace(option.Text)));
                question.Index = j;
            }
        }
        bool AddId(Guid id) => id != Guid.Empty && ids.Add(id);
    }

    private static async Task<AuthoringState> ReadAuthoringAsync(IApplicationDbContext db, Guid orgId, string code)
    {
        var key = AuthoringPrefix + code;
        var value = await db.SystemSettings.AsNoTracking().Where(s => s.OrganizationId == orgId && s.Key == key)
            .Select(s => s.Value).SingleOrDefaultAsync();
        return value is null ? new(0, null, null) : JsonSerializer.Deserialize<AuthoringState>(value, JsonOptions)!;
    }

    private static ResearchAuthoringVersion ToAuthoring(AuthoringState state, PlatformCatalogCourseDetail course)
    {
        course.Editable = true;
        return new(state.Revision, course, state.Draft is not null, state.Applied is not null);
    }
}

public sealed record ResearchAppliedCurriculum(IReadOnlyList<ResearchAppliedModule> Modules, PlatformCourseFinalDto Final);
public sealed record ResearchAppliedModule(Guid ModuleId, string Title, List<PlatformBlockDto> Blocks, List<ResearchPracticeQuestion> Questions);
public sealed record ResearchPracticeQuestion(Guid QuestionId, string Text, List<ResearchPracticeOption> Options);
public sealed record ResearchPracticeOption(Guid OptionId, string Text);
