namespace DigiTalent.Application.Common.Interfaces;

/// <summary>One level (bậc 1–8) of a component competency in Circular 02/2025/TT-BGDĐT.</summary>
public sealed record Tt02Level(int Bac, string Tier, string Context, IReadOnlyList<string> Outcomes);

/// <summary>A component competency (e.g. 1.1) with its description and its level descriptions.</summary>
public sealed record Tt02Competency(string Code, int Domain, string Name, string Description, IReadOnlyList<Tt02Level> Levels)
{
    /// <summary>The two levels of a system level: 1 Cơ bản = bậc 1–2, 2 Trung cấp = bậc 3–4, 3 Nâng cao = bậc 5–6.</summary>
    public IReadOnlyList<Tt02Level> ForSystemLevel(int level) =>
        Levels.Where(l => l.Bac == level * 2 - 1 || l.Bac == level * 2).OrderBy(l => l.Bac).ToList();
}

/// <summary>
/// The digital competency framework of Circular 02/2025/TT-BGDĐT (6 domains, 24 component competencies, bậc 1–8),
/// read from the structured file shipped with the backend — the source the AI checks course content against.
/// </summary>
public interface ITt02Framework
{
    string Source { get; }
    string DomainName(int domain);
    IReadOnlyList<Tt02Competency> OfDomain(int domain);
    Tt02Competency? Find(string code);

    /// <summary>System level name: 1 Cơ bản, 2 Trung cấp, 3 Nâng cao.</summary>
    static string LevelName(int level) => level switch { 1 => "Cơ bản", 2 => "Trung cấp", 3 => "Nâng cao", _ => $"Mức {level}" };
}
