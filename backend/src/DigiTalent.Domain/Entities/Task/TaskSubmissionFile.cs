namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng task_submission_files. File đính kèm trong bài nộp.
/// </summary>
public class TaskSubmissionFile
{
    public Guid SubmissionId { get; set; }
    public Guid FileObjectId { get; set; }
    public int SortOrder { get; set; }
}
