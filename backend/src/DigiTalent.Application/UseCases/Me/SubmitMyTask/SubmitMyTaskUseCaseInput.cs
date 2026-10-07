namespace DigiTalent.Application.UseCases.Me;

public class SubmitMyTaskUseCaseInput
{
    public Guid AssignmentId { get; set; }

    /// <summary>Mô tả giải pháp, quy trình và kết quả đạt được.</summary>
    public string Content { get; set; } = string.Empty;

    public List<string> LinkUrls { get; set; } = new();

    /// <summary>Id tệp đã tải lên qua POST /me/tasks/{id}/attachments.</summary>
    public List<Guid> AttachmentIds { get; set; } = new();
}
