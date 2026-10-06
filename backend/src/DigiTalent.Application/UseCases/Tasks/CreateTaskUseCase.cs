using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Tasks;

public class CreateTaskUseCase : IUseCase<CreateTaskInput, PracticalTaskDetailDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public CreateTaskUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<PracticalTaskDetailDto> ExecuteAsync(CreateTaskInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var userId = _currentUser.UserId
            ?? throw new ForbiddenException("Chưa xác thực.");

        if (string.IsNullOrWhiteSpace(input.Title))
            throw new BadRequestException("Tiêu đề không được để trống.");
        if (!input.AssignedEmployeeIds.Any())
            throw new BadRequestException("Phải chọn ít nhất 1 nhân viên.");

        var employees = await _context.Employees.AsNoTracking()
            .Where(e => input.AssignedEmployeeIds.Contains(e.Id) && e.Status == "ACTIVE")
            .Select(e => new { e.Id, e.FullName, e.EmployeeCode, e.WorkEmail, e.DepartmentId })
            .ToListAsync();

        if (!employees.Any())
            throw new BadRequestException("Không tìm thấy nhân viên hợp lệ.");

        var template = new PracticalTaskTemplate
        {
            OrganizationId = organizationId,
            Title = input.Title.Trim(),
            Description = input.Description.Trim(),
            ExpectedOutput = input.ExpectedOutput.Trim(),
            GeneralMarkingCriteria = input.RubricCriteria,
            SourceType = "MANUAL",
            Status = "ACTIVE",
            CreatedByUserId = userId,
        };
        _context.PracticalTaskTemplates.Add(template);

        var sortOrder = 0;
        foreach (var compId in input.CompetencyIds)
        {
            _context.PracticalTaskTargets.Add(new PracticalTaskTarget
            {
                TaskTemplateId = template.Id,
                CompetencyId = compId,
                TargetLevel = input.TargetLevel,
                SortOrder = sortOrder++,
            });
        }

        var now = DateTimeOffset.UtcNow;
        var assignmentDtos = new List<AssignedEmployeeDto>();

        foreach (var emp in employees)
        {
            var assignment = new TaskAssignment
            {
                TaskTemplateId = template.Id,
                EmployeeId = emp.Id,
                AssignedByUserId = userId,
                ReviewerUserId = userId,
                AssignedAt = now,
                DueAt = input.DueDate,
                Status = "ASSIGNED",
                TitleSnapshot = template.Title,
                DescriptionSnapshot = template.Description,
                ExpectedOutputSnapshot = template.ExpectedOutput,
            };
            _context.TaskAssignments.Add(assignment);

            var targetSort = 0;
            foreach (var compId in input.CompetencyIds)
            {
                _context.AssignedTaskTargets.Add(new AssignedTaskTarget
                {
                    TaskAssignmentId = assignment.Id,
                    CompetencyId = compId,
                    TargetLevel = input.TargetLevel,
                    SortOrder = targetSort++,
                });
            }

            assignmentDtos.Add(new AssignedEmployeeDto
            {
                Id = emp.Id,
                FullName = emp.FullName,
                EmployeeCode = emp.EmployeeCode,
                WorkEmail = emp.WorkEmail,
            });
        }

        await _context.SaveChangesAsync();

        var deptName = employees.First().DepartmentId != default
            ? await _context.Departments.AsNoTracking()
                .Where(d => d.Id == employees.First().DepartmentId)
                .Select(d => d.Name).FirstOrDefaultAsync()
            : null;

        var assignedByName = await _context.Users.AsNoTracking()
            .Where(u => u.Id == userId).Select(u => u.DisplayName).FirstOrDefaultAsync();

        return new PracticalTaskDetailDto
        {
            Id = template.Id,
            Title = template.Title,
            Description = template.Description,
            ExpectedOutput = template.ExpectedOutput,
            CompetencyIds = input.CompetencyIds,
            TargetLevel = input.TargetLevel,
            DepartmentId = employees.First().DepartmentId,
            DepartmentName = deptName,
            AssignedEmployeeIds = employees.Select(e => e.Id).ToList(),
            AssignedEmployeesCount = employees.Count,
            AssignedByName = assignedByName,
            AssignedAt = now,
            DueDate = input.DueDate?.ToString("yyyy-MM-dd"),
            RubricCriteria = template.GeneralMarkingCriteria,
            Status = template.Status,
            AssignedEmployees = assignmentDtos,
            Submissions = new(),
        };
    }
}
