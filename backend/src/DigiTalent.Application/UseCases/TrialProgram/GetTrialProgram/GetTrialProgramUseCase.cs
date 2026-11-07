using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>
/// GET /trial — tình trạng dùng thử của doanh nghiệp cho chủ doanh nghiệp. Bài đến hạn (hết hạn / mọi người đã nộp) được đóng
/// lúc đọc; sau khi đóng có báo cáo năng lực kèm gợi ý ✦.
/// </summary>
public class GetTrialProgramUseCase : IUseCase<GetTrialProgramUseCaseInput, GetTrialProgramUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly TrialProgramReader _reader;
    private readonly TrialCloser _closer;
    private readonly TrialReportBuilder _builder;

    public GetTrialProgramUseCase(IApplicationDbContext context, TrialProgramReader reader, TrialCloser closer, TrialReportBuilder builder)
    {
        _context = context;
        _reader = reader;
        _closer = closer;
        _builder = builder;
    }

    public async Task<GetTrialProgramUseCaseOutput> ExecuteAsync(GetTrialProgramUseCaseInput input)
    {
        var trial = await _reader.ForOwnerAsync();
        await _closer.CloseIfDueAsync(trial);
        var domains = await _reader.LoadDomainsAsync(trial.OrganizationId);
        var stage = TrialProgramRules.StageOf(trial);

        TrialReportDto? report = null;
        if (stage == TrialProgramRules.StageReported)
        {
            var saved = await _context.TrialReports.AsNoTracking().FirstOrDefaultAsync(r => r.OrganizationId == trial.OrganizationId);
            report = TrialReportDto.From(await _builder.BuildAsync(trial.OrganizationId), trial.ReportPublishedAt, saved);
        }

        return new GetTrialProgramUseCaseOutput
        {
            OrganizationId = trial.OrganizationId,
            OrganizationName = await _reader.OrganizationNameAsync(trial.OrganizationId),
            Stage = stage,
            TestDeadline = trial.TestDeadline,
            ReportPublishedAt = trial.ReportPublishedAt,
            MaxParticipants = TrialProgramRules.MaxParticipants,
            ChoiceCount = domains.Count * 3 * TrialProgramRules.ChoicePerCell,
            Participants = await _reader.LoadParticipantsAsync(trial),
            Departments = await _context.Departments.AsNoTracking()
                .Where(d => d.OrganizationId == trial.OrganizationId && d.Status == Statuses.MasterData.Active)
                .OrderBy(d => d.Name).Select(d => d.Name).ToListAsync(),
            Positions = await _context.JobPositions.AsNoTracking()
                .Where(p => p.OrganizationId == trial.OrganizationId && p.Status == Statuses.MasterData.Active)
                .OrderBy(p => p.Name).Select(p => p.Name).ToListAsync(),
            Report = report,
        };
    }
}
