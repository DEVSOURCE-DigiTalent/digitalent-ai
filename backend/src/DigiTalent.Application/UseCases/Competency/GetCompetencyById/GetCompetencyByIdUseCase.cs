using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Competency.Common;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Competency;

public class GetCompetencyByIdUseCase : IUseCase<GetCompetencyByIdUseCaseInput, GetCompetencyByIdUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetCompetencyByIdUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GetCompetencyByIdUseCaseOutput> ExecuteAsync(GetCompetencyByIdUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();

        var categories = _context.GetDbSet<CompetencyCategory>()
            .AsNoTracking()
            .Where(cat => cat.OrganizationId == organizationId);

        var competencies = _context.GetDbSet<Domain.Entities.Competency>()
            .AsNoTracking()
            .Where(c => c.Id == input.Id);

        var competencyInfo = await (from c in competencies
                                    join cat in categories on c.CategoryId equals cat.Id
                                    select new
                                    {
                                        Competency = c,
                                        Category = cat
                                    }).FirstOrDefaultAsync();

        if (competencyInfo == null)
        {
            throw new NotFoundException($"Competency with ID '{input.Id}' not found.");
        }

        var criteria = await _context.GetDbSet<CompetencyLevelCriterion>()
            .AsNoTracking()
            .Where(cr => cr.CompetencyId == input.Id)
            .OrderBy(cr => cr.Level)
            .ThenBy(cr => cr.SortOrder)
            .ThenBy(cr => cr.IndicatorCode)
            .Select(cr => new CompetencyCriterionDto
            {
                Id = cr.Id,
                Level = cr.Level,
                IndicatorCode = cr.IndicatorCode,
                BehaviorIndicator = cr.BehaviorIndicator,
                AssessmentGuidance = cr.AssessmentGuidance,
                EvidenceGuidance = cr.EvidenceGuidance,
                SortOrder = cr.SortOrder
            })
            .ToListAsync();

        return new GetCompetencyByIdUseCaseOutput
        {
            Id = competencyInfo.Competency.Id,
            CategoryId = competencyInfo.Competency.CategoryId,
            CategoryName = competencyInfo.Category.Name,
            CategoryCode = competencyInfo.Category.Code,
            Code = competencyInfo.Competency.Code,
            Name = competencyInfo.Competency.Name,
            Description = competencyInfo.Competency.Description,
            CompetencyType = competencyInfo.Competency.CompetencyType,
            Status = competencyInfo.Competency.Status,
            Criteria = criteria
        };
    }
}
