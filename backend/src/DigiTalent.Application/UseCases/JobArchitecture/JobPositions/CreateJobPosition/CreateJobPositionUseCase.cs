using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.JobArchitecture.JobPositions;

public class CreateJobPositionUseCase : IUseCase<CreateJobPositionUseCaseInput, CreateJobPositionUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public CreateJobPositionUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<CreateJobPositionUseCaseOutput> ExecuteAsync(CreateJobPositionUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var code = input.Code.Trim().ToUpper();

        var codeExists = await _context.JobPositions
            .AnyAsync(p => p.OrganizationId == organizationId && p.Code == code);
        if (codeExists)
        {
            throw new ConflictException($"Job position code '{code}' already exists in your organization.");
        }

        if (input.JobFamilyId.HasValue)
        {
            var familyExists = await _context.JobFamilies.AnyAsync(f =>
                f.Id == input.JobFamilyId.Value
                && f.OrganizationId == organizationId
                && f.Status != Statuses.MasterData.Archived);
            if (!familyExists)
            {
                throw new BadRequestException("Job family does not exist or is archived.");
            }
        }

        var position = new JobPosition
        {
            OrganizationId = organizationId,
            JobFamilyId = input.JobFamilyId,
            Code = code,
            Name = input.Name.Trim(),
            Description = input.Description,
            Status = Statuses.MasterData.Active,
        };

        _context.JobPositions.Add(position);
        await _context.SaveChangesAsync();

        return new CreateJobPositionUseCaseOutput { Id = position.Id };
    }
}
