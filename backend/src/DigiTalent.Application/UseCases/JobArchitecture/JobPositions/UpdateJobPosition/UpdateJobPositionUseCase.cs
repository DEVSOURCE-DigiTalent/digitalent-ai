using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.JobArchitecture.JobPositions;

public class UpdateJobPositionUseCase : IUseCase<UpdateJobPositionUseCaseInput, UpdateJobPositionUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly IAuditService _auditService;

    public UpdateJobPositionUseCase(IApplicationDbContext context, ICurrentUser currentUser, IAuditService auditService)
    {
        _context = context;
        _currentUser = currentUser;
        _auditService = auditService;
    }

    public async Task<UpdateJobPositionUseCaseOutput> ExecuteAsync(UpdateJobPositionUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();

        var position = await _context.JobPositions
            .FirstOrDefaultAsync(p => p.Id == input.Id && p.OrganizationId == organizationId);

        if (position == null)
        {
            throw new NotFoundException($"Job position with Id '{input.Id}' not found.");
        }

        if (position.Status == Statuses.MasterData.Archived)
        {
            throw new ConflictException("Archived job positions cannot be edited.");
        }

        var code = input.Code.Trim().ToUpper();
        var codeExists = await _context.JobPositions
            .AnyAsync(p => p.OrganizationId == organizationId && p.Code == code && p.Id != input.Id);
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

        await JobPositionRules.EnsureValidDepartmentAsync(_context, organizationId, input.DepartmentId);

        var oldValues = new { position.Code, position.Name, position.DepartmentId, position.JobGrade, position.Status };
        position.Code = code;
        position.Name = input.Name.Trim();
        position.Description = input.Description;
        position.JobFamilyId = input.JobFamilyId;
        position.DepartmentId = input.DepartmentId;
        position.JobGrade = JobPositionRules.NormalizeGrade(input.JobGrade);
        position.Status = input.Status;

        await _context.SaveChangesAsync();

        await _auditService.LogAsync("POSITION_UPDATED", "job_positions", position.Id, oldValues,
            new { position.Code, position.Name, position.DepartmentId, position.JobGrade, position.Status }, position.Name);

        return new UpdateJobPositionUseCaseOutput { Id = position.Id };
    }
}
