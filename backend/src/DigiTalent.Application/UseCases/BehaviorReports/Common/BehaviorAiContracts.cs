namespace DigiTalent.Application.UseCases.BehaviorReports;

/// <summary>
/// Dữ liệu gửi cho AI để phân tích hành vi của một lần làm bài cuối khóa. Không có tên, email hay nội dung bài làm của
/// nhân viên — chỉ bối cảnh của bài và nhật ký sự kiện (đã đánh số để AI dẫn chứng đúng sự kiện).
/// </summary>
public sealed record BehaviorAiInput(
    string CourseTitle,
    string? DomainName,
    int? Tier,
    int AttemptNo,
    long DurationMs,
    int EssayChars,
    int? ChoiceScore,
    int? ChoiceTotal,
    /// <summary>ON | OFF | PARTIAL | NONE — nhận diện khuôn mặt trên trình duyệt có chạy không.</summary>
    string FaceCheck,
    int RuleScore,
    string RuleLevel,
    IReadOnlyList<BehaviorAiEvent> Events,
    /// <summary>Nhật ký dài hơn giới hạn gửi đi: chỉ các sự kiện đáng chú ý được gửi.</summary>
    bool EventsTruncated);

/// <summary>Một sự kiện trong nhật ký gửi cho AI; Number là số thứ tự AI dùng để dẫn chứng.</summary>
public sealed record BehaviorAiEvent(int Number, string Kind, long OffsetMs, long? DurationMs, string? Detail);

/// <summary>Kết quả AI đã đọc được (chưa đối chiếu sự kiện — <see cref="BehaviorReportComposer.Findings"/> làm việc đó).</summary>
public sealed record BehaviorAiResult(
    string Level,
    string Summary,
    string? Advice,
    IReadOnlyList<BehaviorAiFinding> Findings,
    string Model);

/// <summary>Một phát hiện của AI: các số thứ tự sự kiện làm bằng chứng.</summary>
public sealed record BehaviorAiFinding(string Severity, string Title, string Explanation, IReadOnlyList<int> EventNumbers);
