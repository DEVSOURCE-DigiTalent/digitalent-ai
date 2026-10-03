using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.JobArchitecture.JobFamilies;

public class CreateJobFamilyUseCase : IUseCase<CreateJobFamilyUseCaseInput, CreateJobFamilyUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public CreateJobFamilyUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<CreateJobFamilyUseCaseOutput> ExecuteAsync(CreateJobFamilyUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var code = input.Code.Trim().ToUpperInvariant();

        var codeExists = await _context.JobFamilies
            .AnyAsync(f => f.OrganizationId == organizationId && f.Code == code);

        if (codeExists)
        {
            throw new ConflictException($"Job family with code '{code}' already exists in your organization.");
        }

        var family = new JobFamily
        {
            Id = Guid.NewGuid(),
            OrganizationId = organizationId,
            Code = code,
            Name = input.Name.Trim(),
            Description = input.Description?.Trim(),
            Status = Statuses.MasterData.Active
        };

        _context.JobFamilies.Add(family);
        await _context.SaveChangesAsync();

        return new CreateJobFamilyUseCaseOutput
        {
            Id = family.Id,
            Code = family.Code,
            Name = family.Name
        };
    }
}
