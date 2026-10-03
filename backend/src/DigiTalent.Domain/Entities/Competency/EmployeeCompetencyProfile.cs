using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng employee_competency_profiles. Bậc năng lực đã được công nhận của nhân viên.
/// </summary>
public class EmployeeCompetencyProfile : IHasTimestamps
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EmployeeId { get; set; }
    public Guid CompetencyId { get; set; }
    public short ConfirmedLevel { get; set; }
    public Guid? LatestConfirmingEvidenceId { get; set; }
    public DateTimeOffset ConfirmedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public long RowVersion { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
