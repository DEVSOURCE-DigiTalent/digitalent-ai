namespace DigiTalent.Domain.Common;

/// <summary>
/// Sự kiện nghiệp vụ đã xảy ra. Use case phát qua IApplicationDbContext.AddDomainEvent;
/// handler chạy trong cùng transaction khi SaveChangesAsync (docs/specs/2026-09-28-sprint3-skill-gap-recommendation-spec.md §6).
/// </summary>
public interface IDomainEvent
{
    DateTimeOffset OccurredAt { get; }
}
