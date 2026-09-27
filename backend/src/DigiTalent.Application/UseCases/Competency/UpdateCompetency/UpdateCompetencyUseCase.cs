using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Competency.Common;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Competency;

public class UpdateCompetencyUseCase : IUseCase<UpdateCompetencyUseCaseInput, UpdateCompetencyUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public UpdateCompetencyUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<UpdateCompetencyUseCaseOutput> ExecuteAsync(UpdateCompetencyUseCaseInput input)
    {
        var orgId = _currentUser.GetRequiredOrganizationId();

        var categories = _context.GetDbSet<CompetencyCategory>()
            .AsNoTracking()
            .Where(cat => cat.OrganizationId == orgId);

        var competency = await (from c in _context.GetDbSet<Domain.Entities.Competency>()
                                join cat in categories on c.CategoryId equals cat.Id
                                where c.Id == input.Id
                                select c).FirstOrDefaultAsync();

        if (competency == null)
        {
            throw new NotFoundException($"Competency with ID '{input.Id}' not found.");
        }

        competency.Name = input.Name.Trim();
        competency.Description = input.Description?.Trim();

        if (!string.IsNullOrWhiteSpace(input.CompetencyType))
        {
            competency.CompetencyType = input.CompetencyType.Trim().ToUpperInvariant();
        }

        if (input.Criteria != null)
        {
            var duplicate = input.Criteria
                .GroupBy(cr => new { cr.Level, IndicatorCode = cr.IndicatorCode.Trim().ToUpperInvariant() })
                .FirstOrDefault(g => g.Count() > 1);

            if (duplicate != null)
            {
                throw new BadRequestException($"Duplicate criterion indicator code '{duplicate.Key.IndicatorCode}' at level {duplicate.Key.Level}.");
            }

            var existingCriteria = await _context.GetDbSet<CompetencyLevelCriterion>()
                .Where(cr => cr.CompetencyId == input.Id)
                .ToListAsync();

            _context.GetDbSet<CompetencyLevelCriterion>().RemoveRange(existingCriteria);

            foreach (var cr in input.Criteria)
            {
                _context.GetDbSet<CompetencyLevelCriterion>().Add(new CompetencyLevelCriterion
                {
                    CompetencyId = competency.Id,
                    Level = cr.Level,
                    IndicatorCode = cr.IndicatorCode.Trim().ToUpperInvariant(),
                    BehaviorIndicator = cr.BehaviorIndicator.Trim(),
                    AssessmentGuidance = cr.AssessmentGuidance?.Trim(),
                    EvidenceGuidance = cr.EvidenceGuidance?.Trim(),
                    SourceNote = cr.SourceNote?.Trim(),
                    SortOrder = cr.SortOrder
                });
            }
        }

        await _context.SaveChangesAsync();

        return new UpdateCompetencyUseCaseOutput { Id = competency.Id };
    }
}
