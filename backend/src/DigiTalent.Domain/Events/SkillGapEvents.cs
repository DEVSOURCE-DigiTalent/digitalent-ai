using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Events;

/// <summary>Cấp độ năng lực của nhân viên vừa được xác nhận (bằng chứng thủ công; Sprint 4: chấm bài thực hành).</summary>
public sealed record EmployeeCompetencyLevelConfirmed(Guid EmployeeId, Guid CompetencyId, short ConfirmedLevel, Guid EvidenceId) : IDomainEvent
{
    public DateTimeOffset OccurredAt { get; } = DateTimeOffset.UtcNow;
}

/// <summary>Một bộ tiêu chuẩn năng lực vừa được kích hoạt cho vị trí.</summary>
public sealed record PositionRequirementSetActivated(Guid RequirementSetId, Guid JobPositionId) : IDomainEvent
{
    public DateTimeOffset OccurredAt { get; } = DateTimeOffset.UtcNow;
}

/// <summary>Nhân viên được chuyển sang vị trí công việc khác.</summary>
public sealed record EmployeeJobPositionChanged(Guid EmployeeId, Guid? PreviousJobPositionId, Guid NewJobPositionId) : IDomainEvent
{
    public DateTimeOffset OccurredAt { get; } = DateTimeOffset.UtcNow;
}
