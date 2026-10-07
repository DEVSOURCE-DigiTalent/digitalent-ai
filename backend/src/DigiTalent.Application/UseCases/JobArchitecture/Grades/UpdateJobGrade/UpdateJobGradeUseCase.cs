using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.JobArchitecture.Grades;

/// <summary>
/// Renames one grade of the scale for the caller's organization (OW-12). The first edit creates the job_grades row,
/// later edits update it. Codes themselves never change.
/// </summary>
public class UpdateJobGradeUseCase : IUseCase<UpdateJobGradeUseCaseInput, UpdateJobGradeUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly IAuditService _auditService;

    public UpdateJobGradeUseCase(IApplicationDbContext context, ICurrentUser currentUser, IAuditService auditService)
    {
        _context = context;
        _currentUser = currentUser;
        _auditService = auditService;
    }

    public async Task<UpdateJobGradeUseCaseOutput> ExecuteAsync(UpdateJobGradeUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var code = input.Code.Trim().ToUpperInvariant();

        // 1. Upsert the organization's row for this grade
        var grade = await _context.JobGrades.FirstOrDefaultAsync(g => g.OrganizationId == organizationId && g.Code == code);
        var oldValues = grade == null ? null : new { grade.Name, grade.Description };
        if (grade == null)
        {
            grade = new JobGrade { OrganizationId = organizationId, Code = code };
            _context.JobGrades.Add(grade);
        }

        grade.Name = input.Name.Trim();
        grade.Description = string.IsNullOrWhiteSpace(input.Description) ? null : input.Description.Trim();
        await _context.SaveChangesAsync();

        await _auditService.LogAsync(
            "JOB_GRADE_UPDATED",
            "job_grades",
            grade.Id,
            oldValues,
            new { grade.Name, grade.Description },
            $"{code} - {grade.Name}");

        // 2. Return the grade with its usage counts
        var item = (await JobGradeReader.ReadAsync(_context, organizationId)).First(g => g.Code == code);
        return new UpdateJobGradeUseCaseOutput
        {
            Code = item.Code,
            Name = item.Name,
            Description = item.Description,
            IsCustomized = item.IsCustomized,
            PositionCount = item.PositionCount,
            EmployeeCount = item.EmployeeCount,
        };
    }
}
