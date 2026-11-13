using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// AI review results kept in pulse_ai_reviews, one row per submission (course final or pre-assessment).
/// Only results that really come from the AI are stored: a keyword hint (AI unavailable) is not, so the next
/// opening of the review queue tries the AI again.
/// </summary>
public static class PulseAiReviewStore
{
    public const string AiSource = "GEMINI";

    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    /// <summary>A result to store for one submission.</summary>
    public sealed record Entry(Guid OrganizationId, string Kind, Guid SubmissionId, string InputHash, PulseAiHintDto Hint);

    /// <summary>
    /// SHA-256 (hex, 64 chars) of everything sent to the AI for one submission. A stored review is only valid while
    /// this value is unchanged (same answer, brief, criteria, course content and proctoring log).
    /// </summary>
    public static string InputHash(
        string evidence,
        string prompt,
        IReadOnlyList<string> criteria,
        string? courseContent,
        string? domainName,
        int? tier,
        IReadOnlyList<PulseCriterionDto> rubric,
        IReadOnlyList<ProctoringEventInfo>? events)
    {
        var signature = new StringBuilder()
            .Append(evidence).Append('|')
            .Append(prompt).Append('|')
            .Append(domainName ?? "").Append('|')
            .Append(tier?.ToString() ?? "").Append('|')
            .Append(string.Join(";", criteria)).Append('|')
            .Append(string.Join(";", rubric.Select(r => $"{r.Number}:{r.Title}:{r.WeightPercent}:{r.IsRequired}"))).Append('|')
            .Append(courseContent ?? "").Append('|')
            .Append(events == null ? "" : string.Join(",", events.Select(e => $"{e.Kind}:{e.OffsetMs}:{e.DurationMs}")));
        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(signature.ToString())));
    }

    /// <summary>Stored reviews of these submissions, by (kind, submission id). Loaded once, before the parallel AI calls.</summary>
    public static async Task<Dictionary<(string Kind, Guid SubmissionId), PulseAiReview>> LoadAsync(
        IApplicationDbContext context,
        IReadOnlyCollection<Guid> submissionIds)
    {
        if (submissionIds.Count == 0)
        {
            return new Dictionary<(string Kind, Guid SubmissionId), PulseAiReview>();
        }

        return (await context.PulseAiReviews.AsNoTracking()
                .Where(r => submissionIds.Contains(r.SubmissionId))
                .ToListAsync())
            .ToDictionary(r => (r.SubmissionKind, r.SubmissionId));
    }

    /// <summary>The stored hint when it was made from exactly these inputs; null when there is none or it is out of date.</summary>
    public static PulseAiHintDto? Reuse(
        IReadOnlyDictionary<(string Kind, Guid SubmissionId), PulseAiReview> stored,
        string kind,
        Guid submissionId,
        string inputHash)
    {
        if (!stored.TryGetValue((kind, submissionId), out var row) || row.InputHash != inputHash)
        {
            return null;
        }

        try
        {
            return JsonSerializer.Deserialize<PulseAiHintDto>(row.Result, Json) is { } hint
                ? hint with { ReviewedAt = row.UpdatedAt }
                : null;
        }
        catch (JsonException)
        {
            return null; // An unreadable row is reviewed again and overwritten.
        }
    }

    /// <summary>
    /// Stores the AI results (a new row, or the submission's row updated in place). Two reviewers opening the queue
    /// at the same moment may both try to insert the same submission: the unique index keeps one row, the other save
    /// is dropped and the next opening reads the stored row.
    /// </summary>
    public static async Task SaveAsync(IApplicationDbContext context, IReadOnlyCollection<Entry> entries)
    {
        var toStore = entries.Where(e => e.Hint.Source == AiSource).ToList();
        if (toStore.Count == 0)
        {
            return;
        }

        var ids = toStore.Select(e => e.SubmissionId).ToList();
        var existing = (await context.PulseAiReviews
                .Where(r => ids.Contains(r.SubmissionId))
                .ToListAsync())
            .ToDictionary(r => (r.SubmissionKind, r.SubmissionId));

        foreach (var entry in toStore)
        {
            if (!existing.TryGetValue((entry.Kind, entry.SubmissionId), out var row))
            {
                row = new PulseAiReview
                {
                    OrganizationId = entry.OrganizationId,
                    SubmissionKind = entry.Kind,
                    SubmissionId = entry.SubmissionId,
                };
                context.PulseAiReviews.Add(row);
            }

            row.InputHash = entry.InputHash;
            row.Result = JsonSerializer.Serialize(entry.Hint, Json);
            row.Model = entry.Hint.Model;
        }

        try
        {
            await context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            // Another reviewer stored the same submission first; their row is kept.
        }
    }
}
