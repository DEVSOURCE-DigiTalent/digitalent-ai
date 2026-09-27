namespace DigiTalent.Domain.Common;

/// <summary>
/// Entity nào có 2 cột created_at + updated_at thì implement interface này.
/// AppDbContext tự điền khi SaveChanges, không cần gán tay.
/// </summary>
public interface IHasTimestamps
{
    DateTimeOffset CreatedAt { get; set; }
    DateTimeOffset UpdatedAt { get; set; }
}
