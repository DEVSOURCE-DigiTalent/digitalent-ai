using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Learning;

public class SubmitForEvaluationUseCase : IUseCase<SubmitForEvaluationUseCaseInput, SubmitForEvaluationUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public SubmitForEvaluationUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<SubmitForEvaluationUseCaseOutput> ExecuteAsync(SubmitForEvaluationUseCaseInput input)
    {
        var employeeId = _currentUser.EmployeeId
            ?? throw new ForbiddenException("Employee profile required.");

        var enrollment = await _context.Enrollments
            .FirstOrDefaultAsync(e => e.Id == input.EnrollmentId && e.EmployeeId == employeeId)
            ?? throw new NotFoundException($"Enrollment '{input.EnrollmentId}' not found.");

        if (enrollment.Status != Statuses.Enrollment.InProgress)
            throw new BadRequestException("Enrollment is not in progress.", "EnrollmentId", "NOT_IN_PROGRESS");

        enrollment.Status = Statuses.Enrollment.ReadyForAssessment;

        await _context.SaveChangesAsync();

        return new SubmitForEvaluationUseCaseOutput
        {
            EnrollmentId = enrollment.Id,
            Status = enrollment.Status
        };
    }
}
