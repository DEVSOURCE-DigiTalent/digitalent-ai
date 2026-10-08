using DigiTalent.Application.Common.Models;

namespace DigiTalent.Application.UseCases.Certificates;

public class GetCertificatesInput
{
    public int PageIndex { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public Guid? EmployeeId { get; set; }
    public string? Status { get; set; }
    public string? Search { get; set; }
}

public class GetCertificatesOutput : PagedList<CertificateDto> { }

public class CertificateDto
{
    public Guid Id { get; set; }
    public string CertificateCode { get; set; } = string.Empty;
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string? EmployeeCode { get; set; }
    public Guid CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public int CourseLevel { get; set; }
    public List<string> FrameworkCompetencyCodes { get; set; } = new();
    public DateTimeOffset IssueDate { get; set; }
    public DateTimeOffset? ExpiryDate { get; set; }
    public decimal Score { get; set; }
    public string Status { get; set; } = string.Empty;
}
