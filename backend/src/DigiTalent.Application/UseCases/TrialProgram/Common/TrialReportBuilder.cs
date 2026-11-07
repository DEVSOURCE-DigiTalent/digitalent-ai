using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>
/// Số liệu báo cáo dùng thử, luôn tính lại từ bài làm đã nộp: mức từng người × lĩnh vực, phân bố mức, % câu đúng theo cấp, câu
/// sai nhiều nhất mỗi lĩnh vực, số bài rủi ro giám sát cao, đề xuất phạm vi đào tạo (<see cref="TrialCeilingPlanner"/>) và số
/// liệu ẩn danh cho AI (<see cref="TrialInsightFacts"/>).
/// </summary>
public class TrialReportBuilder
{
    private readonly IApplicationDbContext _context;
    private readonly TrialAssessmentPaper _paper;
    private readonly PulseRecordingReader _recordings;

    public TrialReportBuilder(IApplicationDbContext context, TrialAssessmentPaper paper, PulseRecordingReader recordings)
    {
        _context = context;
        _paper = paper;
        _recordings = recordings;
    }

    public async Task<TrialReportSnapshot> BuildAsync(Guid organizationId)
    {
        var domains = await _paper.LoadDomainsAsync(organizationId);
        var rows = await (
                from assessment in _context.TrialAssessments.AsNoTracking()
                join employee in _context.Employees.AsNoTracking() on assessment.EmployeeId equals employee.Id
                join user in _context.Users.AsNoTracking() on employee.UserId equals user.Id
                where assessment.OrganizationId == organizationId
                select new
                {
                    assessment.Id,
                    assessment.ProctoringSessionId,
                    assessment.ChoiceScore,
                    assessment.ChoiceTotal,
                    assessment.SubmittedAt,
                    EmployeeId = employee.Id,
                    employee.FullName,
                    user.Email,
                    employee.DepartmentId,
                    employee.JobPositionId,
                })
            .ToListAsync();

        var assessmentIds = rows.Select(r => r.Id).ToList();
        var results = (await _context.TrialAssessmentDomains.AsNoTracking()
                .Where(d => assessmentIds.Contains(d.TrialAssessmentId))
                .ToListAsync())
            .ToLookup(d => d.TrialAssessmentId);
        var departmentNames = await NamesAsync(_context.Departments.AsNoTracking()
            .Where(d => d.OrganizationId == organizationId)
            .Select(d => new { d.Id, d.Name }), d => d.Id, d => d.Name);
        var positionNames = await NamesAsync(_context.JobPositions.AsNoTracking()
            .Where(p => p.OrganizationId == organizationId)
            .Select(p => new { p.Id, p.Name }), p => p.Id, p => p.Name);
        var risks = await _recordings.LoadAsync(rows.Select(r => r.ProctoringSessionId).ToList());

        var employees = rows
            .Select(r =>
            {
                var byCategory = results[r.Id].ToDictionary(d => d.CategoryId);
                return new TrialReportEmployeeDto
                {
                    EmployeeId = r.EmployeeId,
                    AssessmentId = r.Id,
                    FullName = r.FullName,
                    Email = r.Email,
                    DepartmentId = r.DepartmentId,
                    DepartmentName = departmentNames.GetValueOrDefault(r.DepartmentId),
                    PositionName = r.JobPositionId is { } p ? positionNames.GetValueOrDefault(p) : null,
                    Levels = domains.Select(d => byCategory.TryGetValue(d.CategoryId, out var result) ? TrialProgramRules.LevelOf(result) : 0).ToList(),
                    ChoiceScore = r.ChoiceScore,
                    ChoiceTotal = r.ChoiceTotal,
                    SubmittedAt = r.SubmittedAt,
                    RiskLevel = risks.GetValueOrDefault(r.ProctoringSessionId)?.Risk.Level,
                };
            })
            .OrderBy(e => e.DepartmentName).ThenBy(e => e.FullName)
            .ToList();

        var plan = TrialCeilingPlanner.Plan(employees.Select(e => new TrialPlanPerson(e.DepartmentId, e.Levels)).ToList(), domains.Count);
        var scope = domains.Select((d, index) => (d.CategoryId, plan.Domains[index].SuggestedLevel)).ToDictionary(x => x.CategoryId, x => x.SuggestedLevel);
        var missed = await MostMissedAsync(organizationId, assessmentIds, scope);
        var allResults = results.SelectMany(g => g).ToLookup(r => r.CategoryId);

        var summary = domains.Select((domain, index) =>
        {
            var levels = employees.Select(e => e.Levels[index]).ToList();
            var cells = allResults[domain.CategoryId].ToList();
            return new TrialReportDomainDto
            {
                CategoryId = domain.CategoryId,
                Number = domain.Number,
                Name = domain.Name,
                Counts = Enumerable.Range(0, PulseRules.MaxLevel + 1).Select(level => levels.Count(l => l == level)).ToList(),
                Average = plan.Domains[index].Average,
                CorrectRates = new List<int?>
                {
                    Rate(cells.Sum(c => c.BasicCorrect), cells.Sum(c => c.BasicTotal)),
                    Rate(cells.Sum(c => c.IntermediateCorrect), cells.Sum(c => c.IntermediateTotal)),
                    Rate(cells.Sum(c => c.AdvancedCorrect), cells.Sum(c => c.AdvancedTotal)),
                },
                MostMissed = missed.GetValueOrDefault(domain.CategoryId),
            };
        }).ToList();

        var departments = employees
            .GroupBy(e => e.DepartmentId)
            .Select(g => new TrialReportDepartmentDto
            {
                DepartmentId = g.Key,
                Name = departmentNames.GetValueOrDefault(g.Key) ?? string.Empty,
                People = g.Count(),
                Averages = domains.Select((_, index) => Math.Round((decimal)g.Average(e => e.Levels[index]), 1, MidpointRounding.AwayFromZero)).ToList(),
            })
            .OrderBy(d => d.Name)
            .ToList();

        var facts = new TrialInsightFacts
        {
            Assessed = employees.Count,
            HighRisk = employees.Count(e => e.RiskLevel == PulseProctoringRisk.High),
            Domains = summary.Select((domain, index) => new TrialInsightDomainFacts
            {
                Number = domain.Number,
                Name = domain.Name,
                People = plan.Domains[index].People,
                Counts = domain.Counts,
                Average = domain.Average,
                CorrectRates = domain.CorrectRates,
                MissedQuestion = domain.MostMissed?.Content,
                MissedTier = domain.MostMissed?.Tier ?? 0,
                MissedWrong = domain.MostMissed?.Wrong ?? 0,
                MissedAnswered = domain.MostMissed?.Answered ?? 0,
                SuggestedLevel = plan.Domains[index].SuggestedLevel,
                Reason = plan.Domains[index].Reason,
                BelowBasic = plan.Domains[index].BelowBasic,
                Median = plan.Domains[index].Median,
                BelowSuggested = employees.Count(e => e.Levels[index] < plan.Domains[index].SuggestedLevel),
            }).ToList(),
            Departments = departments.Select(d => new TrialInsightDepartmentFacts { Name = d.Name, People = d.People, Averages = d.Averages }).ToList(),
        };

        return new TrialReportSnapshot(domains, summary, employees, departments, plan, facts);
    }

    /// <summary>Gợi ý đang hiện: bản đã lưu khi còn khớp số bài, ngược lại câu mẫu từ số liệu hiện tại.</summary>
    public static TrialReportInsightsDto InsightsOf(TrialReport? report, TrialInsightFacts facts)
    {
        var stored = TrialInsightsDto.FromJson(report?.Insights);
        var usable = report != null && report.AssessedCount == facts.Assessed && stored.CeilingReasons.Count == facts.Domains.Count;
        var insights = usable ? stored : TrialInsightTemplate.Build(facts);
        return new TrialReportInsightsDto
        {
            Status = report?.AiStatus ?? Statuses.TrialReportAi.Fallback,
            Priorities = insights.Priorities,
            CeilingReasons = insights.CeilingReasons,
            CompletedAt = report?.AiCompletedAt,
        };
    }

    /// <summary>
    /// Câu sai nhiều nhất của mỗi lĩnh vực trong phạm vi đề xuất (cấp ≤ mức tối đa đề xuất — điều đội cần học tiếp; câu Nâng cao
    /// cả đội đều sai không giúp quyết định); ít nhất một người sai, hòa thì câu có nhiều người trả lời hơn.
    /// </summary>
    private async Task<Dictionary<Guid, TrialMissedQuestionDto>> MostMissedAsync(
        Guid organizationId, IReadOnlyCollection<Guid> assessmentIds, IReadOnlyDictionary<Guid, int> scope)
    {
        if (assessmentIds.Count == 0)
        {
            return new Dictionary<Guid, TrialMissedQuestionDto>();
        }

        var answers = await _context.ExamChoiceAnswers.AsNoTracking()
            .Where(a => a.TrialAssessmentId != null && assessmentIds.Contains(a.TrialAssessmentId.Value))
            .GroupBy(a => a.QuestionId)
            .Select(g => new { QuestionId = g.Key, Answered = g.Count(), Wrong = g.Count(a => !a.IsCorrect) })
            .ToListAsync();
        var cells = await _paper.LoadQuestionCellsAsync(organizationId);
        var worst = answers
            .Where(a => a.Wrong > 0 && cells.TryGetValue(a.QuestionId, out var cell) && cell.Tier <= scope.GetValueOrDefault(cell.CategoryId, PulseRules.MaxLevel))
            .GroupBy(a => cells[a.QuestionId].CategoryId)
            .ToDictionary(g => g.Key, g => g.OrderByDescending(a => a.Wrong).ThenByDescending(a => a.Answered).ThenBy(a => a.QuestionId).First());
        var questionIds = worst.Values.Select(a => a.QuestionId).ToList();
        var contents = await _context.Questions.AsNoTracking()
            .Where(q => questionIds.Contains(q.Id))
            .ToDictionaryAsync(q => q.Id, q => q.Content);

        return worst.ToDictionary(
            pair => pair.Key,
            pair => new TrialMissedQuestionDto
            {
                Content = contents.GetValueOrDefault(pair.Value.QuestionId) ?? string.Empty,
                Tier = cells[pair.Value.QuestionId].Tier,
                Wrong = pair.Value.Wrong,
                Answered = pair.Value.Answered,
            });
    }

    private static int? Rate(int correct, int total) => total == 0 ? null : (int)Math.Round(100m * correct / total, MidpointRounding.AwayFromZero);

    private static async Task<Dictionary<Guid, string>> NamesAsync<T>(IQueryable<T> query, Func<T, Guid> id, Func<T, string> name) =>
        (await query.ToListAsync()).ToDictionary(id, name);
}

/// <summary>Kết quả dựng báo cáo: dùng cho GET /trial (báo cáo), GET /trial/roadmap (phạm vi đào tạo) và lúc viết gợi ý AI.</summary>
public sealed record TrialReportSnapshot(
    IReadOnlyList<TrialDomainInfo> Domains,
    IReadOnlyList<TrialReportDomainDto> Summary,
    IReadOnlyList<TrialReportEmployeeDto> Employees,
    IReadOnlyList<TrialReportDepartmentDto> Departments,
    TrialPlanDto Plan,
    TrialInsightFacts Facts);

/// <summary>Báo cáo năng lực của doanh nghiệp dùng thử sau khi bài đóng.</summary>
public class TrialReportDto
{
    public DateTimeOffset? PublishedAt { get; set; }
    public int Assessed { get; set; }
    /// <summary>Số bài có rủi ro giám sát cao (vẫn tính vào kết quả, chỉ đánh dấu).</summary>
    public int HighRisk { get; set; }
    public List<TrialDomainDto> Domains { get; set; } = new();
    public List<TrialReportDomainDto> Summary { get; set; } = new();
    public List<TrialReportDepartmentDto> Departments { get; set; } = new();
    public List<TrialReportEmployeeDto> Employees { get; set; } = new();
    public TrialReportInsightsDto Insights { get; set; } = new();

    public static TrialReportDto From(TrialReportSnapshot snapshot, DateTimeOffset? publishedAt, TrialReport? report) => new()
    {
        PublishedAt = publishedAt,
        Assessed = snapshot.Facts.Assessed,
        HighRisk = snapshot.Facts.HighRisk,
        Domains = snapshot.Domains.Select(TrialDomainDto.From).ToList(),
        Summary = snapshot.Summary.ToList(),
        Departments = snapshot.Departments.ToList(),
        Employees = snapshot.Employees.ToList(),
        Insights = TrialReportBuilder.InsightsOf(report, snapshot.Facts),
    };
}

public class TrialReportDomainDto
{
    public Guid CategoryId { get; set; }
    public int Number { get; set; }
    public string Name { get; set; } = string.Empty;
    /// <summary>Số nhân viên ở mức 0 (chưa đạt Cơ bản), 1, 2, 3.</summary>
    public List<int> Counts { get; set; } = new();
    public decimal Average { get; set; }
    /// <summary>% câu đúng của cả đội ở Cơ bản, Trung cấp, Nâng cao (null khi cấp đó không có câu).</summary>
    public List<int?> CorrectRates { get; set; } = new();
    public TrialMissedQuestionDto? MostMissed { get; set; }
}

public class TrialMissedQuestionDto
{
    public string Content { get; set; } = string.Empty;
    /// <summary>Cấp của câu: 1 Cơ bản, 2 Trung cấp, 3 Nâng cao.</summary>
    public int Tier { get; set; }
    public int Wrong { get; set; }
    public int Answered { get; set; }
}

/// <summary>Mức trung bình mỗi lĩnh vực của một phòng ban (thứ tự <see cref="TrialReportDto.Domains"/>).</summary>
public class TrialReportDepartmentDto
{
    public Guid DepartmentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int People { get; set; }
    public List<decimal> Averages { get; set; } = new();
}

public class TrialReportEmployeeDto
{
    public Guid EmployeeId { get; set; }
    public Guid AssessmentId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public Guid DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public string? PositionName { get; set; }
    /// <summary>Mức theo thứ tự <see cref="TrialReportDto.Domains"/>.</summary>
    public List<int> Levels { get; set; } = new();
    public int ChoiceScore { get; set; }
    public int ChoiceTotal { get; set; }
    public DateTimeOffset SubmittedAt { get; set; }
    /// <summary>LOW | MEDIUM | HIGH — rủi ro gian lận của phiên làm bài (null khi không có bản ghi).</summary>
    public string? RiskLevel { get; set; }
}

/// <summary>Gợi ý ✦ của báo cáo: trạng thái AI, 3 ưu tiên và lý do mức tối đa từng lĩnh vực.</summary>
public class TrialReportInsightsDto
{
    /// <summary>PENDING (AI đang viết, tạm hiện câu mẫu) | DONE | FALLBACK (câu mẫu).</summary>
    public string Status { get; set; } = Statuses.TrialReportAi.Fallback;
    public List<TrialInsightItemDto> Priorities { get; set; } = new();
    public List<TrialInsightItemDto> CeilingReasons { get; set; } = new();
    public DateTimeOffset? CompletedAt { get; set; }
}
