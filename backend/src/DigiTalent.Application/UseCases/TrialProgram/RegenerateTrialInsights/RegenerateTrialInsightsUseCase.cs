using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>POST /platform/trials/{organizationId}/report/insights — quản trị nền tảng cho AI viết lại gợi ý của báo cáo.</summary>
public class RegenerateTrialInsightsUseCase : IUseCase<RegenerateTrialInsightsUseCaseInput, RegenerateTrialInsightsUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly TrialCloser _closer;

    public RegenerateTrialInsightsUseCase(IApplicationDbContext context, TrialCloser closer)
    {
        _context = context;
        _closer = closer;
    }

    public async Task<RegenerateTrialInsightsUseCaseOutput> ExecuteAsync(RegenerateTrialInsightsUseCaseInput input)
    {
        var exists = await _context.TrialReports.AsNoTracking().AnyAsync(r => r.OrganizationId == input.OrganizationId);
        if (!exists)
        {
            throw new NotFoundException("Doanh nghiệp này chưa có báo cáo dùng thử.");
        }

        await _closer.RefreshInsightsAsync(input.OrganizationId);
        var status = await _context.TrialReports.AsNoTracking()
            .Where(r => r.OrganizationId == input.OrganizationId)
            .Select(r => r.AiStatus)
            .FirstAsync();
        return new RegenerateTrialInsightsUseCaseOutput { Status = status };
    }
}
