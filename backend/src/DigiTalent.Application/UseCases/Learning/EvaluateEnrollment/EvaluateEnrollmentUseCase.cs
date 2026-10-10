using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Learning;

public class EvaluateEnrollmentUseCase : IUseCase<EvaluateEnrollmentUseCaseInput, EvaluateEnrollmentUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public EvaluateEnrollmentUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<EvaluateEnrollmentUseCaseOutput> ExecuteAsync(EvaluateEnrollmentUseCaseInput input)
    {
        if (input.Verdict is not ("PASSED" or "FAILED"))
            throw new BadRequestException("Verdict must be PASSED or FAILED.", "Verdict", "INVALID_VERDICT");

        var enrollment = await _context.Enrollments
            .FirstOrDefaultAsync(e => e.Id == input.EnrollmentId)
            ?? throw new NotFoundException($"Enrollment '{input.EnrollmentId}' not found.");

        if (enrollment.Status != Statuses.Enrollment.ReadyForAssessment)
            throw new BadRequestException("Enrollment is not ready for assessment.", "EnrollmentId", "NOT_READY");

        var now = DateTimeOffset.UtcNow;
        string? certificateCode = null;
        var competencyUpdates = new List<CompetencyUpdateDto>();

        if (input.Verdict == "PASSED")
        {
            enrollment.Status = Statuses.Enrollment.Completed;
            enrollment.ProgressPercent = 100;
            enrollment.CompletedAt = now;

            var course = await _context.Courses
                .AsNoTracking()
                .Where(c => c.Id == enrollment.CourseId)
                .Select(c => new { c.Title })
                .FirstAsync();

            var employee = await _context.Employees
                .AsNoTracking()
                .Where(e => e.Id == enrollment.EmployeeId)
                .Select(e => new { e.FullName })
                .FirstAsync();

            var orgId = _currentUser.GetRequiredOrganizationId();

            var template = await _context.CertificateTemplates
                .AsNoTracking()
                .Where(t => t.OrganizationId == orgId && t.Status == "ACTIVE")
                .OrderByDescending(t => t.VersionNo)
                .Select(t => new { t.Id })
                .FirstOrDefaultAsync();

            if (template is not null)
            {
                var passedAttempt = await _context.AssessmentAttempts
                    .AsNoTracking()
                    .Where(at => at.EnrollmentId == enrollment.Id && at.Passed == true)
                    .OrderByDescending(at => at.ScoredAt)
                    .Select(at => new { at.Id })
                    .FirstOrDefaultAsync();

                if (passedAttempt is null)
                {
                    var latestAttempt = await _context.AssessmentAttempts
                        .AsNoTracking()
                        .Where(at => at.EnrollmentId == enrollment.Id)
                        .OrderByDescending(at => at.ScoredAt)
                        .Select(at => new { at.Id })
                        .FirstOrDefaultAsync();
                    passedAttempt = latestAttempt;
                }

                if (passedAttempt is not null)
                {
                    certificateCode = $"DT-{now:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";

                    var primaryCompetency = await _context.CourseCompetencies
                        .AsNoTracking()
                        .Where(cc => cc.CourseId == enrollment.CourseId && cc.CoverageType == "PRIMARY")
                        .Join(_context.Competencies, cc => cc.CompetencyId, c => c.Id, (cc, c) => c.Name)
                        .FirstOrDefaultAsync();

                    var cert = new Certificate
                    {
                        EmployeeId = enrollment.EmployeeId,
                        EnrollmentId = enrollment.Id,
                        AssessmentAttemptId = passedAttempt.Id,
                        CertificateTemplateId = template.Id,
                        CertificateCode = certificateCode,
                        HolderNameSnapshot = employee.FullName,
                        CourseTitleSnapshot = course.Title,
                        PrimaryCompetencySnapshot = primaryCompetency,
                        IssuedAt = now,
                        Status = "VALID"
                    };
                    _context.Certificates.Add(cert);
                }
            }

            var courseCompetencies = await _context.CourseCompetencies
                .AsNoTracking()
                .Where(cc => cc.CourseId == enrollment.CourseId)
                .ToListAsync();

            var competencyIds = courseCompetencies.Select(cc => cc.CompetencyId).ToList();

            var competencyNames = await _context.Competencies
                .AsNoTracking()
                .Where(c => competencyIds.Contains(c.Id))
                .ToDictionaryAsync(c => c.Id, c => c.Name);

            foreach (var cc in courseCompetencies)
            {
                var profile = await _context.EmployeeCompetencyProfiles
                    .FirstOrDefaultAsync(p => p.EmployeeId == enrollment.EmployeeId && p.CompetencyId == cc.CompetencyId);

                short previousLevel = profile?.ConfirmedLevel ?? 0;

                if (profile is null)
                {
                    _context.EmployeeCompetencyProfiles.Add(new EmployeeCompetencyProfile
                    {
                        EmployeeId = enrollment.EmployeeId,
                        CompetencyId = cc.CompetencyId,
                        ConfirmedLevel = (short)cc.TargetLevel,
                        ConfirmedAt = now,
                        RowVersion = 1
                    });
                }
                else if (profile.ConfirmedLevel < cc.TargetLevel)
                {
                    profile.ConfirmedLevel = (short)cc.TargetLevel;
                    profile.ConfirmedAt = now;
                    profile.RowVersion++;
                }
                else
                {
                    continue;
                }

                competencyUpdates.Add(new CompetencyUpdateDto
                {
                    CompetencyId = cc.CompetencyId,
                    CompetencyName = competencyNames.GetValueOrDefault(cc.CompetencyId, ""),
                    PreviousLevel = previousLevel,
                    NewLevel = (short)cc.TargetLevel
                });
            }
        }
        else
        {
            enrollment.Status = Statuses.Enrollment.InProgress;
        }

        await _context.SaveChangesAsync();

        return new EvaluateEnrollmentUseCaseOutput
        {
            EnrollmentId = enrollment.Id,
            EnrollmentStatus = enrollment.Status,
            Verdict = input.Verdict,
            CertificateCode = certificateCode,
            CompetencyUpdates = competencyUpdates
        };
    }
}
