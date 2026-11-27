using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.BehaviorReports;

/// <summary>
/// GET /behavior-reports — báo cáo hành vi khi làm bài cuối khóa, gom theo nhân viên để trang Khoảng trống năng lực (OW-21)
/// đặt cạnh mức năng lực của từng người: mỗi bài kèm lĩnh vực và cấp của khóa, mức (kết luận AI, chưa có thì mức tổng hợp
/// từ nhật ký) và dải các đoạn đáng chú ý. Lập bù báo cáo cho các bài nộp trước khi có tính năng này (AI phân tích ở nền).
/// </summary>
public class GetBehaviorReportsUseCase : IUseCase<GetBehaviorReportsUseCaseInput, GetBehaviorReportsUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly BehaviorReportReader _reader;
    private readonly IBehaviorAnalysisQueue _queue;

    public GetBehaviorReportsUseCase(IApplicationDbContext context, BehaviorReportReader reader, IBehaviorAnalysisQueue queue)
    {
        _context = context;
        _reader = reader;
        _queue = queue;
    }

    public async Task<GetBehaviorReportsUseCaseOutput> ExecuteAsync(GetBehaviorReportsUseCaseInput input)
    {
        foreach (var reportId in await BehaviorReportStore.EnsureForOrganizationAsync(_context, _reader.OrganizationId))
        {
            _queue.Enqueue(reportId);
        }

        var rows = await _reader.Query()
            .OrderByDescending(x => x.SubmittedAt)
            .ThenBy(x => x.Report.Id)
            .ToListAsync();
        var domains = await _reader.CourseDomainsAsync();
        var items = rows
            .Select(row => BehaviorReportReader.Fill(new BehaviorReportItemDto(), row, BehaviorReportComposer.Deserialize(row.Report.Details), domains))
            .ToList();

        var employees = items
            .GroupBy(i => i.EmployeeId)
            .Select(g => new BehaviorEmployeeDto
            {
                EmployeeId = g.Key,
                Level = Worst(g.Select(i => i.Level)),
                High = g.Count(i => i.Level == Statuses.RiskLevel.High),
                Medium = g.Count(i => i.Level == Statuses.RiskLevel.Medium),
                Low = g.Count(i => i.Level == Statuses.RiskLevel.Low),
                Analyzing = g.Count(i => i.Status == Statuses.BehaviorReport.Pending),
                Reports = g.ToList(),
            })
            .OrderByDescending(e => Array.IndexOf(Statuses.RiskLevel.All, e.Level))
            .ThenByDescending(e => e.Reports[0].SubmittedAt)
            .ToList();

        return new GetBehaviorReportsUseCaseOutput
        {
            Counts = new BehaviorReportCountsDto
            {
                All = items.Count,
                High = items.Count(i => i.Level == Statuses.RiskLevel.High),
                Medium = items.Count(i => i.Level == Statuses.RiskLevel.Medium),
                Low = items.Count(i => i.Level == Statuses.RiskLevel.Low),
                Analyzing = items.Count(i => i.Status == Statuses.BehaviorReport.Pending),
                PeopleHigh = employees.Count(e => e.Level == Statuses.RiskLevel.High),
            },
            Employees = employees,
        };
    }

    private static string Worst(IEnumerable<string> levels) =>
        levels.OrderByDescending(level => Array.IndexOf(Statuses.RiskLevel.All, level)).First();
}
