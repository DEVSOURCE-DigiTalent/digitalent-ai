namespace DigiTalent.Application.UseCases.TrialProgram;

public class GetMentorsUseCaseOutput
{
    public List<MentorItem> Items { get; set; } = new();
}

public class MentorItem
{
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    /// <summary>Số doanh nghiệp đang chấm (đã phân công, chưa công bố).</summary>
    public int ActiveTrials { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
