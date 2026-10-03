using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.JobArchitecture.JobPositions;

public class GetJobPositionByIdUseCase : IUseCase<GetJobPositionByIdUseCaseInput, GetJobPositionByIdUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetJobPositionByIdUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GetJobPositionByIdUseCaseOutput> ExecuteAsync(GetJobPositionByIdUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();

        var position = await _context.JobPositions
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == input.Id && p.OrganizationId == organizationId);

        if (position == null)
        {
            throw new NotFoundException($"Job position with Id '{input.Id}' not found.");
        }

        string? familyName = null;
        if (position.JobFamilyId.HasValue)
        {
            familyName = await _context.JobFamilies
                .Where(f => f.Id == position.JobFamilyId.Value)
                .Select(f => f.Name)
                .FirstOrDefaultAsync();
        }

        return new GetJobPositionByIdUseCaseOutput
        {
            Id = position.Id,
            Code = position.Code,
            Name = position.Name,
            Description = position.Description,
            JobFamilyId = position.JobFamilyId,
            JobFamilyName = familyName,
            Status = position.Status,
            CreatedAt = position.CreatedAt,
            UpdatedAt = position.UpdatedAt,
        };
    }
}
