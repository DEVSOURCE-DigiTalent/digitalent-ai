namespace DigiTalent.Application.UseCases.Me;

/// <summary>Controller chuyển IFormFile thành stream + metadata (Application không phụ thuộc ASP.NET).</summary>
public class UploadMyTaskAttachmentUseCaseInput
{
    public Guid AssignmentId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string? ContentType { get; set; }
    public long SizeBytes { get; set; }
    public Stream? Content { get; set; }
}
