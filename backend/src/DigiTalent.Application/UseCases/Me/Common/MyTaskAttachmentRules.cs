namespace DigiTalent.Application.UseCases.Me;

/// <summary>Giới hạn tệp minh chứng nhân viên đính kèm khi nộp nhiệm vụ (EM-16).</summary>
public static class MyTaskAttachmentRules
{
    public const long MaxBytes = 20L * 1024 * 1024;
    public const int MaxFilesPerSubmission = 10;
    public const int MaxLinksPerSubmission = 10;
    public const string Bucket = "task-submissions";

    public static readonly IReadOnlySet<string> AllowedExtensions = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
    {
        ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".csv",
        ".png", ".jpg", ".jpeg", ".gif", ".webp", ".zip", ".mp4",
    };

    /// <summary>Thư mục lưu tệp của 1 nhiệm vụ — dùng để kiểm tra tệp đính kèm thuộc đúng nhiệm vụ.</summary>
    public static string FolderFor(Guid assignmentId) => $"{Bucket}/{assignmentId:N}";

    public static bool IsAllowed(string fileName) => AllowedExtensions.Contains(Path.GetExtension(fileName));
}
