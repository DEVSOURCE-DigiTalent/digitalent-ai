using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

public sealed record PulseBaselineOption(Guid OptionId, string Content, bool IsCorrect);

public sealed record PulseBaselineQuestion(Guid QuestionId, Guid CategoryId, int Level, string Content, IReadOnlyList<PulseBaselineOption> Options);

/// <summary>
/// Câu hỏi bài đầu vào (§7.1): ngân hàng <see cref="PulseRules.BaselineBankTitle"/> của tổ chức, câu APPROVED gắn
/// năng lực (→ lĩnh vực) và độ khó L1..L3. Mỗi lĩnh vực trong mục tiêu vị trí lấy một câu cho mỗi mức 1..mục tiêu.
/// </summary>
public class PulseBaselineReader
{
    private readonly IApplicationDbContext _context;

    public PulseBaselineReader(IApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>Câu hỏi theo lĩnh vực, sắp theo mức; chỉ các lĩnh vực có mục tiêu ≥ 1.</summary>
    public async Task<Dictionary<Guid, List<PulseBaselineQuestion>>> LoadAsync(Guid organizationId, IReadOnlyDictionary<Guid, int> targets)
    {
        var categoryIds = targets.Where(t => t.Value > 0).Select(t => t.Key).ToList();
        var result = categoryIds.ToDictionary(id => id, _ => new List<PulseBaselineQuestion>());
        if (categoryIds.Count == 0)
        {
            return result;
        }

        var rows = await (
                from bank in _context.QuestionBanks.AsNoTracking()
                join question in _context.Questions.AsNoTracking() on bank.Id equals question.BankId
                join competency in _context.Competencies.AsNoTracking() on question.CompetencyId equals competency.Id
                where bank.OrganizationId == organizationId
                      && bank.Title == PulseRules.BaselineBankTitle
                      && bank.Status == Statuses.QuestionBank.Active
                      && question.Status == Statuses.Question.Approved
                      && categoryIds.Contains(competency.CategoryId)
                select new { question.Id, question.Content, question.Difficulty, question.CreatedAt, competency.CategoryId })
            .ToListAsync();

        var chosen = rows
            .Select(r => new { r.Id, r.Content, r.CreatedAt, r.CategoryId, Level = PulseRules.LevelOfDifficulty(r.Difficulty) })
            .Where(r => r.Level.HasValue && r.Level.Value <= targets[r.CategoryId])
            .GroupBy(r => (r.CategoryId, r.Level))
            .Select(g => g.OrderBy(r => r.CreatedAt).ThenBy(r => r.Id).First())
            .ToList();

        var questionIds = chosen.Select(c => c.Id).ToList();
        var options = await _context.QuestionOptions
            .AsNoTracking()
            .Where(o => questionIds.Contains(o.QuestionId))
            .OrderBy(o => o.SortOrder)
            .Select(o => new { o.Id, o.QuestionId, o.Content, o.IsCorrect })
            .ToListAsync();
        var optionsByQuestion = options.GroupBy(o => o.QuestionId)
            .ToDictionary(g => g.Key, g => g.Select(o => new PulseBaselineOption(o.Id, o.Content, o.IsCorrect)).ToList());

        foreach (var question in chosen.OrderBy(c => c.Level))
        {
            var questionOptions = optionsByQuestion.GetValueOrDefault(question.Id);
            if (questionOptions is not { Count: >= 2 })
            {
                continue; // câu thiếu phương án: không phục vụ, mức đó không thể đạt
            }

            result[question.CategoryId].Add(new PulseBaselineQuestion(question.Id, question.CategoryId, question.Level!.Value, question.Content, questionOptions));
        }

        return result;
    }
}
