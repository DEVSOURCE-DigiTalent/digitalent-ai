using System.Text.Json;
using DigiTalent.Application.Common.Interfaces;

namespace DigiTalent.Infrastructure.AI.Frameworks;

/// <summary>
/// Reads <c>tt02-2025-framework.json</c> (embedded in this assembly): the framework of Circular 02/2025/TT-BGDĐT
/// extracted from its text (docs/tt02). Loaded once; the AI course content suggestions and checks use it.
/// </summary>
public sealed class Tt02Framework : ITt02Framework
{
    private const string ResourceSuffix = "tt02-2025-framework.json";
    private static readonly Lazy<Data> Loaded = new(Load);

    public string Source => Loaded.Value.Source;

    public string DomainName(int domain) =>
        Loaded.Value.Domains.FirstOrDefault(d => d.Number == domain)?.Name ?? $"Miền {domain}";

    public IReadOnlyList<Tt02Competency> OfDomain(int domain) =>
        Loaded.Value.Competencies.Where(c => c.Domain == domain).ToList();

    public Tt02Competency? Find(string code) =>
        Loaded.Value.Competencies.FirstOrDefault(c => string.Equals(c.Code, code?.Trim(), StringComparison.Ordinal));

    private static Data Load()
    {
        var assembly = typeof(Tt02Framework).Assembly;
        var name = assembly.GetManifestResourceNames().Single(n => n.EndsWith(ResourceSuffix, StringComparison.Ordinal));
        using var stream = assembly.GetManifestResourceStream(name)!;
        var file = JsonSerializer.Deserialize<FileModel>(stream, new JsonSerializerOptions(JsonSerializerDefaults.Web))
                   ?? throw new InvalidOperationException("The TT02 framework file is empty.");
        var competencies = file.Domains
            .SelectMany(d => d.Competencies.Select(c => new Tt02Competency(
                c.Code, d.Number, c.Name, c.Description,
                c.Levels.Select(l => new Tt02Level(l.Bac, l.Tier, l.Context, l.Outcomes)).ToList())))
            .ToList();
        return new Data(file.Source, file.Domains, competencies);
    }

    private sealed record Data(string Source, IReadOnlyList<DomainModel> Domains, IReadOnlyList<Tt02Competency> Competencies);

    private sealed class FileModel
    {
        public string Source { get; set; } = string.Empty;
        public List<DomainModel> Domains { get; set; } = new();
    }

    private sealed class DomainModel
    {
        public int Number { get; set; }
        public string Name { get; set; } = string.Empty;
        public List<CompetencyModel> Competencies { get; set; } = new();
    }

    private sealed class CompetencyModel
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<LevelModel> Levels { get; set; } = new();
    }

    private sealed class LevelModel
    {
        public int Bac { get; set; }
        public string Tier { get; set; } = string.Empty;
        public string Context { get; set; } = string.Empty;
        public List<string> Outcomes { get; set; } = new();
    }
}
