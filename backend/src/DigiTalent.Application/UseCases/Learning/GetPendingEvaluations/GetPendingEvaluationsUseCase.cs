using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Learning;

public class GetPendingEvaluationsUseCase : IUseCase<GetPendingEvaluationsUseCaseInput, GetPendingEvaluationsUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetPendingEvaluationsUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GetPendingEvaluationsUseCaseOutput> ExecuteAsync(GetPendingEvaluationsUseCaseInput input)
    {
        var orgId = _currentUser.GetRequiredOrganizationId();

        var query = _context.Enrollments
            .AsNoTracking()
            .Where(e => e.Status == Statuses.Enrollment.ReadyForAssessment);

        if (_currentUser.IsDepartmentManager && !_currentUser.IsAdmin)
        {
            var deptId = _currentUser.GetRequiredDepartmentId();
            var deptEmployeeIds = await _context.Employees
                .AsNoTracking()
                .Where(emp => emp.DepartmentId == deptId)
                .Select(emp => emp.Id)
                .ToListAsync();
            query = query.Where(e => deptEmployeeIds.Contains(e.EmployeeId));
        }

        var enrollments = await query
            .Join(_context.Courses, e => e.CourseId, c => c.Id, (e, c) => new { e, c })
            .Where(x => x.c.OrganizationId == orgId)
            .Join(_context.Employees, x => x.e.EmployeeId, emp => emp.Id, (x, emp) => new PendingEvaluationDto
            {
                EnrollmentId = x.e.Id,
                EmployeeId = emp.Id,
                EmployeeName = emp.FullName,
                CourseId = x.c.Id,
                CourseCode = x.c.Code,
                CourseTitle = x.c.Title,
                SubmittedAt = x.e.UpdatedAt
            })
            .OrderBy(x => x.SubmittedAt)
            .ToListAsync();

        return new GetPendingEvaluationsUseCaseOutput { Enrollments = enrollments };
    }
}
