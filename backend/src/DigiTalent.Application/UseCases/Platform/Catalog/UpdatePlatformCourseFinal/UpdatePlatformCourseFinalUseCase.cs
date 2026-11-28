using System.Text.Json;
using System.Text.Json.Nodes;
using DigiTalent.Application.Common;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>
/// Saves draft content or adjusts the grading weights on the currently published final.
/// </summary>
public class UpdatePlatformCourseFinalUseCase : IUseCase<UpdatePlatformCourseFinalUseCaseInput, PlatformCatalogCourseDetail>
{
    private readonly IApplicationDbContext _context;
    private readonly PlatformCatalogEditor _editor;
    private readonly PlatformCourseContentReader _reader;

    public UpdatePlatformCourseFinalUseCase(IApplicationDbContext context, PlatformCatalogEditor editor, PlatformCourseContentReader reader)
    {
        _context = context;
        _editor = editor;
        _reader = reader;
    }

    public async Task<PlatformCatalogCourseDetail> ExecuteAsync(UpdatePlatformCourseFinalUseCaseInput input)
    {
        var criteria = input.Criteria.Select(c => c.Trim()).ToList();
        if (input.CriterionWeights is { } weights)
        {
            if (criteria.Count == 0 || criteria.Count != weights.Count
                || criteria.Any(c => string.IsNullOrWhiteSpace(c) || PulseEssayRubric.HasStatedWeight(c))
                || weights.Any(w => w is < 1 or > 100) || weights.Sum() != 100)
            {
                throw new BadRequestException("Mỗi tiêu chí cần có trọng số dương và tổng phải đúng 100%.",
                    "criterionWeights", "INVALID_CRITERION_WEIGHTS");
            }
        }
        else if (criteria.Any(PulseEssayRubric.HasStatedWeight) && PulseEssayRubric.ReadStatedWeights(criteria) == null)
        {
            throw new BadRequestException("Tổng trọng số của bộ tiêu chí phải đúng 100%.",
                "criterionWeights", "INVALID_CRITERION_WEIGHTS");
        }

        var storedCriteria = input.CriterionWeights is { } values
            ? criteria.Select((criterion, i) => FormattableString.Invariant($"{criterion} ({values[i]}%)")).ToList()
            : criteria;
        await _context.ExecuteInSerializableTransactionAsync(async () =>
        {
            var version = await _editor.VersionAsync(input.VersionNo);
            if (version.Status == Statuses.PlatformCatalogVersion.Current && input.CriterionWeights != null)
            {
                await UpdateCurrentWeightsAsync(input, version.Id, criteria, storedCriteria);
            }
            else
            {
                var course = await _editor.DraftCourseAsync(input.VersionNo, input.CourseId);
                if (string.IsNullOrWhiteSpace(input.Title))
                    throw new BadRequestException("Bài cuối khóa cần có tên.", "title", "REQUIRED");
                course.FinalTitle = input.Title.Trim();
                course.FinalPrompt = _editor.Sanitize(input.PromptHtml);
                course.FinalCriteria = JsonSerializer.Serialize(storedCriteria);
                PlatformCatalogEditor.MarkEdited(course);
            }

            await _context.SaveChangesAsync();
        });
        return await _reader.ReadAsync(input.VersionNo, input.CourseId);
    }

    private async Task UpdateCurrentWeightsAsync(UpdatePlatformCourseFinalUseCaseInput input, Guid versionId,
        List<string> titles, List<string> storedCriteria)
    {
        var current = await _reader.ReadAsync(input.VersionNo, input.CourseId);
        var rubric = current.FinalRubric!;
        if (!titles.SequenceEqual(rubric.Select(c => c.Title), StringComparer.Ordinal)
            || input.ExpectedCriterionWeights == null
            || !input.ExpectedCriterionWeights.SequenceEqual(rubric.Select(c => c.WeightPercent)))
        {
            throw new ConflictException("Bộ tiêu chí hoặc trọng số đã thay đổi. Tải lại khóa học trước khi lưu.");
        }

        var catalogRows = await _context.PlatformCatalogCourses.Where(c => c.CourseId == input.CourseId).ToListAsync();
        var currentRow = catalogRows.Single(c => c.VersionId == versionId);
        var previousCriteria = PlatformCourseContentReader.Criteria(currentRow.FinalCriteria);
        currentRow.FinalCriteria = JsonSerializer.Serialize(storedCriteria);
        PlatformCatalogEditor.MarkEdited(currentRow);

        // Carry the same weights into a draft that still uses the current rubric.
        var draft = await _context.PlatformCatalogVersions.FirstOrDefaultAsync(v => v.Status == Statuses.PlatformCatalogVersion.Draft);
        var draftRow = draft is null ? null : catalogRows.FirstOrDefault(c => c.VersionId == draft.Id);
        if (draftRow != null && draftRow.DomainId == currentRow.DomainId && draftRow.Level == currentRow.Level
            && PlatformCourseContentReader.Criteria(draftRow.FinalCriteria).SequenceEqual(previousCriteria))
        {
            draftRow.FinalCriteria = currentRow.FinalCriteria;
        }

        var catalogSourceIds = catalogRows.Select(c => c.Id).ToHashSet();
        var aliases = CourseCodes.Aliases(current.Code);
        var templates = await (from task in _context.PracticalTaskTemplates
                               join course in _context.Courses on task.RelatedCourseId equals (Guid?)course.Id
                               where task.Status == "ACTIVE" && course.Status == Statuses.Course.Published
                                   && aliases.Contains(course.Code) && task.GeneralMarkingCriteria != null
                               select task).ToListAsync();
        var applied = await new PlatformCatalogApplier(_context)
            .VersionsAsync(templates.Select(t => t.OrganizationId).Distinct().ToList(), input.VersionNo);
        foreach (var template in templates.Where(t => applied[t.OrganizationId] == input.VersionNo))
        {
            JsonObject? data;
            try { data = JsonNode.Parse(template.GeneralMarkingCriteria!) as JsonObject; }
            catch (JsonException) { continue; }
            if (data?["catalogCourseId"] is not JsonValue source || !source.TryGetValue<Guid>(out var sourceId)
                || !catalogSourceIds.Contains(sourceId)
                || data["criteria"] is not JsonArray existing
                || !PlatformCourseContentReader.Criteria(existing.ToJsonString()).SequenceEqual(previousCriteria))
            {
                continue;
            }

            data["criteria"] = JsonSerializer.SerializeToNode(storedCriteria);
            template.GeneralMarkingCriteria = data.ToJsonString();
            template.UpdatedAt = _editor.Now;
        }
    }
}
