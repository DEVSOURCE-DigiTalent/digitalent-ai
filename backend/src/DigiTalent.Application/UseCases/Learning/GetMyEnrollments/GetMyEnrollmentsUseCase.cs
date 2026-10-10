using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Learning;

public class GetMyEnrollmentsUseCase : IUseCase<GetMyEnrollmentsUseCaseInput, GetMyEnrollmentsUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetMyEnrollmentsUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GetMyEnrollmentsUseCaseOutput> ExecuteAsync(GetMyEnrollmentsUseCaseInput input)
    {
        var employeeId = _currentUser.EmployeeId
            ?? throw new ForbiddenException("Employee profile required.");

        var enrollments = await _context.Enrollments
            .AsNoTracking()
            .Where(e => e.EmployeeId == employeeId)
            .Join(_context.Courses, e => e.CourseId, c => c.Id, (e, c) => new EnrollmentSummaryDto
            {
                EnrollmentId = e.Id,
                CourseId = c.Id,
                CourseCode = c.Code,
                CourseTitle = c.Title,
                Status = e.Status,
                ProgressPercent = e.ProgressPercent,
                StartedAt = e.StartedAt,
                CompletedAt = e.CompletedAt,
                DueDate = e.DueDate
            })
            .OrderByDescending(e => e.StartedAt)
            .ToListAsync();

        return new GetMyEnrollmentsUseCaseOutput { Enrollments = enrollments };
    }
}
