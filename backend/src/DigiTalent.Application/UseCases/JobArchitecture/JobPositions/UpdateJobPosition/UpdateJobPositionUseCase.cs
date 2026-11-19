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
        UpdateJobPositionUseCaseOutput? result = null;
        await _context.ExecuteInSerializableTransactionAsync(async () =>
        {
            result = await SaveAsync(input);
        });
        return result!;
    }

    private async Task<UpdateJobPositionUseCaseOutput> SaveAsync(UpdateJobPositionUseCaseInput input)
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

        var code = input.Code.Trim().ToUpperInvariant();
        if (!string.Equals(code, position.Code, StringComparison.OrdinalIgnoreCase))
            throw new BadRequestException("Mã vị trí đã được cố định theo bộ chuẩn.", "code", "POSITION_CODE_IMMUTABLE");
        var name = JobPositionCatalog.Positions.TryGetValue(code, out var canonicalName)
            ? canonicalName : input.Name.Trim();
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

        if (!string.Equals(position.Name.Trim(), name, StringComparison.OrdinalIgnoreCase))
            await JobPositionRules.EnsureNameAvailableAsync(_context, organizationId, name, position.Id);

        var oldValues = new { position.Code, position.Name, position.JobGrade, position.Status };
        position.Code = code;
        position.Name = name;
        position.Description = input.Description;
        position.JobFamilyId = input.JobFamilyId;
        position.DepartmentId = null; // legacy binding: a position is shared by every department
        position.JobGrade = JobPositionRules.NormalizeGrade(input.JobGrade);
        position.Status = input.Status;

        await _context.SaveChangesAsync();

        await _auditService.LogAsync("POSITION_UPDATED", "job_positions", position.Id, oldValues,
            new { position.Code, position.Name, position.JobGrade, position.Status }, position.Name);

        return new UpdateJobPositionUseCaseOutput { Id = position.Id };
    }
}
