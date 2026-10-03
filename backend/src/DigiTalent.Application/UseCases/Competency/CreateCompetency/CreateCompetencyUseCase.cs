using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Competency.Common;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Competency;

public class CreateCompetencyUseCase : IUseCase<CreateCompetencyUseCaseInput, CreateCompetencyUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public CreateCompetencyUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<CreateCompetencyUseCaseOutput> ExecuteAsync(CreateCompetencyUseCaseInput input)
    {
        var orgId = _currentUser.GetRequiredOrganizationId();

        var category = await _context.GetDbSet<CompetencyCategory>()
            .FirstOrDefaultAsync(c => c.Id == input.CategoryId && c.OrganizationId == orgId);

        if (category == null || category.Status == Statuses.MasterData.Archived)
        {
            throw new BadRequestException("Competency category does not exist or is archived in your organization.");
        }

        var code = input.Code.Trim().ToUpperInvariant();
        var codeExists = await _context.GetDbSet<Domain.Entities.Competency>()
            .AnyAsync(c => c.CategoryId == input.CategoryId && c.Code.ToUpper() == code);

        if (codeExists)
        {
            throw new ConflictException($"Competency code '{code}' already exists in this category.");
        }

        if (input.Criteria != null && input.Criteria.Count > 0)
        {
            var duplicate = input.Criteria
                .GroupBy(cr => new { cr.Level, IndicatorCode = cr.IndicatorCode.Trim().ToUpperInvariant() })
                .FirstOrDefault(g => g.Count() > 1);

            if (duplicate != null)
            {
                throw new BadRequestException($"Duplicate criterion indicator code '{duplicate.Key.IndicatorCode}' at level {duplicate.Key.Level}.");
            }
        }

        var competency = new Domain.Entities.Competency
        {
            CategoryId = input.CategoryId,
            Code = code,
            Name = input.Name.Trim(),
            Description = input.Description?.Trim(),
            CompetencyType = !string.IsNullOrWhiteSpace(input.CompetencyType)
                ? input.CompetencyType.Trim().ToUpperInvariant()
                : Statuses.CompetencyType.CoreDigital,
            Status = !string.IsNullOrWhiteSpace(input.Status)
                ? input.Status.Trim().ToUpperInvariant()
                : Statuses.Competency.Active
        };

        if (input.Criteria != null)
        {
            foreach (var cr in input.Criteria)
            {
                competency.Criteria.Add(new CompetencyLevelCriterion
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

        _context.GetDbSet<Domain.Entities.Competency>().Add(competency);
        await _context.SaveChangesAsync();

        return new CreateCompetencyUseCaseOutput { Id = competency.Id };
    }
}
