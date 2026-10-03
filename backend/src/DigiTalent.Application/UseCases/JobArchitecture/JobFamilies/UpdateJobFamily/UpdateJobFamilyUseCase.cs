using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.JobArchitecture.JobFamilies;

public class UpdateJobFamilyUseCase : IUseCase<UpdateJobFamilyUseCaseInput, UpdateJobFamilyUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public UpdateJobFamilyUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<UpdateJobFamilyUseCaseOutput> ExecuteAsync(UpdateJobFamilyUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();

        var family = await _context.JobFamilies
            .FirstOrDefaultAsync(f => f.Id == input.Id && f.OrganizationId == organizationId);

        if (family == null)
        {
            throw new NotFoundException($"Job family with Id '{input.Id}' not found.");
        }

        family.Name = input.Name.Trim();
        family.Description = input.Description?.Trim();
        family.Status = input.Status;

        await _context.SaveChangesAsync();

        return new UpdateJobFamilyUseCaseOutput
        {
            Id = family.Id,
            Code = family.Code,
            Name = family.Name,
            Status = family.Status
        };
    }
}
