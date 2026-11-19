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
    private readonly IAuditService _auditService;

    public CreateJobPositionUseCase(IApplicationDbContext context, ICurrentUser currentUser, IAuditService auditService)
    {
        _context = context;
        _currentUser = currentUser;
        _auditService = auditService;
    }

    public async Task<CreateJobPositionUseCaseOutput> ExecuteAsync(CreateJobPositionUseCaseInput input)
    {
        CreateJobPositionUseCaseOutput? result = null;
        await _context.ExecuteInSerializableTransactionAsync(async () =>
        {
            result = await SaveAsync(input);
        });
        return result!;
    }

    private async Task<CreateJobPositionUseCaseOutput> SaveAsync(CreateJobPositionUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var code = input.Code.Trim().ToUpperInvariant();
        if (!JobPositionCatalog.Positions.TryGetValue(code, out var name))
            throw new BadRequestException("Chọn một trong 5 vị trí chuẩn.", "code", "INVALID_POSITION_CODE");

        var position = await _context.JobPositions.SingleOrDefaultAsync(p => p.OrganizationId == organizationId && p.Code == code);
        // One position per standard code, shared by every department: an active one already exists.
        if (position is not null && position.Status == Statuses.MasterData.Active)
        {
            throw new ConflictException($"Vị trí {name} đã có trong doanh nghiệp và dùng được ở mọi phòng ban.");
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

        await JobPositionRules.EnsureNameAvailableAsync(_context, organizationId, name, position?.Id);

        if (position == null)
        {
            position = new JobPosition { OrganizationId = organizationId, Code = code };
            _context.JobPositions.Add(position);
        }
        position.JobFamilyId = input.JobFamilyId;
        position.DepartmentId = null; // legacy binding: a position is not owned by one department
        position.Name = name;
        position.Description = input.Description;
        position.JobGrade = JobPositionRules.NormalizeGrade(input.JobGrade);
        position.Status = Statuses.MasterData.Active;
        await _context.SaveChangesAsync();

        await _auditService.LogAsync("POSITION_CREATED", "job_positions", position.Id,
            newValues: new { position.Code, position.Name, position.JobGrade }, entityLabel: position.Name);

        return new CreateJobPositionUseCaseOutput { Id = position.Id };
    }
}
