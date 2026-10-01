using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng certificate_templates. Mẫu chứng chỉ.
/// </summary>
public class CertificateTemplate : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrganizationId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int VersionNo { get; set; }
    public string TemplateHtml { get; set; } = string.Empty;
    public Guid? BackgroundFileObjectId { get; set; }
    public string Status { get; set; } = string.Empty;
    public Guid? CreatedByUserId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
