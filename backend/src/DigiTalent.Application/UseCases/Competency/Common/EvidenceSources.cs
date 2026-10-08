using DigiTalent.Domain.Constants;

namespace DigiTalent.Application.UseCases.Competency.Common;

/// <summary>
/// Source of a confirmed level as the frontend names it (EvidenceSource: MIGRATION / TASK / MANUAL) from
/// competency_evidences.source_type.
/// </summary>
public static class EvidenceSources
{
    public static string? ToApi(string? sourceType) => sourceType switch
    {
        null => null,
        Statuses.EvidenceSourceType.PracticalTask => "TASK",
        Statuses.EvidenceSourceType.ManualOverride => "MANUAL",
        _ => sourceType,
    };
}
