using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.JobArchitecture.JobFamilies;

public class GetJobFamilyByIdUseCase : IUseCase<Guid, GetJobFamilyByIdUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetJobFamilyByIdUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GetJobFamilyByIdUseCaseOutput> ExecuteAsync(Guid id)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();

        var family = await _context.JobFamilies
            .AsNoTracking()
            .FirstOrDefaultAsync(f => f.Id == id && f.OrganizationId == organizationId);

        if (family == null)
        {
            throw new NotFoundException($"Job family with Id '{id}' not found.");
        }

        return new GetJobFamilyByIdUseCaseOutput
        {
            Id = family.Id,
            Code = family.Code,
            Name = family.Name,
            Description = family.Description,
            Status = family.Status,
            CreatedAt = family.CreatedAt,
            UpdatedAt = family.UpdatedAt
        };
    }
}
