using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Certificates;

public class GetCertificatesUseCase : IUseCase<GetCertificatesInput, GetCertificatesOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetCertificatesUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GetCertificatesOutput> ExecuteAsync(GetCertificatesInput input)
    {
        var query =
            from cert in _context.Certificates.AsNoTracking()
            join emp in _context.Employees.AsNoTracking() on cert.EmployeeId equals emp.Id
            select new { cert, emp };

        if (input.EmployeeId.HasValue)
            query = query.Where(x => x.cert.EmployeeId == input.EmployeeId.Value);
        else if (_currentUser.EmployeeId.HasValue && !_currentUser.IsAdmin)
            query = query.Where(x => x.cert.EmployeeId == _currentUser.EmployeeId.Value);

        if (!string.IsNullOrWhiteSpace(input.Status))
            query = query.Where(x => x.cert.Status == input.Status.Trim().ToUpper());

        if (!string.IsNullOrWhiteSpace(input.Search))
        {
            var search = input.Search.Trim().ToLower();
            query = query.Where(x =>
                x.cert.CourseTitleSnapshot.ToLower().Contains(search) ||
                x.emp.FullName.ToLower().Contains(search) ||
                x.cert.CertificateCode.ToLower().Contains(search));
        }

        var totalItems = await query.CountAsync();
        var pageIndex = Math.Max(1, input.PageIndex);
        var pageSize = Math.Max(1, input.PageSize);

        var attempts = _context.AssessmentAttempts.AsNoTracking();
        var courseCompetencies = _context.CourseCompetencies.AsNoTracking();
        var competencies = _context.Competencies.AsNoTracking();

        var items = await query
            .OrderByDescending(x => x.cert.IssuedAt)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new CertificateDto
            {
                Id = x.cert.Id,
                CertificateCode = x.cert.CertificateCode,
                EmployeeId = x.cert.EmployeeId,
                EmployeeName = x.emp.FullName,
                EmployeeCode = x.emp.EmployeeCode,
                CourseId = _context.Enrollments.AsNoTracking()
                    .Where(e => e.Id == x.cert.EnrollmentId)
                    .Select(e => e.CourseId).FirstOrDefault(),
                CourseTitle = x.cert.CourseTitleSnapshot,
                CourseLevel = courseCompetencies
                    .Where(cc => cc.CourseId == _context.Enrollments.AsNoTracking()
                        .Where(e => e.Id == x.cert.EnrollmentId).Select(e => e.CourseId).FirstOrDefault())
                    .Select(cc => (int)cc.TargetLevel)
                    .OrderByDescending(l => l)
                    .FirstOrDefault(),
                FrameworkCompetencyCodes = courseCompetencies
                    .Where(cc => cc.CourseId == _context.Enrollments.AsNoTracking()
                        .Where(e => e.Id == x.cert.EnrollmentId).Select(e => e.CourseId).FirstOrDefault())
                    .Join(competencies, cc => cc.CompetencyId, c => c.Id, (cc, c) => c.Code)
                    .ToList(),
                IssueDate = x.cert.IssuedAt,
                ExpiryDate = x.cert.ExpiresAt,
                Score = attempts.Where(a => a.Id == x.cert.AssessmentAttemptId)
                    .Select(a => a.Score ?? 0m).FirstOrDefault(),
                Status = x.cert.Status,
            })
            .ToListAsync();

        return new GetCertificatesOutput
        {
            Items = items,
            TotalItems = totalItems,
            PageIndex = pageIndex,
            PageSize = pageSize,
        };
    }
}
