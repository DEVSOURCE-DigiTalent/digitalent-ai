using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Competency.Common;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Competency;

public class ArchiveCompetencyUseCase : IUseCase<ArchiveCompetencyUseCaseInput, ArchiveCompetencyUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public ArchiveCompetencyUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<ArchiveCompetencyUseCaseOutput> ExecuteAsync(ArchiveCompetencyUseCaseInput input)
    {
        var orgId = _currentUser.GetRequiredOrganizationId();

        var categoryIds = await _context.CompetencyCategories
            .Where(cat => cat.OrganizationId == orgId)
            .Select(cat => cat.Id)
            .ToListAsync();

        var competency = await _context.Competencies
            .FirstOrDefaultAsync(c => c.Id == input.Id && categoryIds.Contains(c.CategoryId));

        if (competency == null)
        {
            throw new NotFoundException($"Competency with ID '{input.Id}' not found.");
        }

        competency.Status = Statuses.Competency.Archived;
        await _context.SaveChangesAsync();

        return new ArchiveCompetencyUseCaseOutput
        {
            Id = competency.Id,
            Status = competency.Status
        };
    }
}
