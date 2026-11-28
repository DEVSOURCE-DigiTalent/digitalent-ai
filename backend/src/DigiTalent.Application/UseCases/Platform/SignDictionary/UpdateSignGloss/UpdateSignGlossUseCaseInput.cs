namespace DigiTalent.Application.UseCases.Platform.SignDictionary;

public class UpdateSignGlossUseCaseInput
{
    public Guid Id { get; set; }
    public string Gloss { get; set; } = string.Empty;
    public string Kind { get; set; } = string.Empty;
    public Guid? VideoAssetId { get; set; }
    public string? SourceName { get; set; }
    public string? SourceUrl { get; set; }
    public string? LicenseNote { get; set; }
    public bool Mirrored { get; set; }

    // ----- Schema v3.13: variants and rights -----
    /// <summary>VSL when empty.</summary>
    public string? SignLanguage { get; set; }
    /// <summary>VN (cả nước, default), VN-BAC, VN-TRUNG, VN-NAM…</summary>
    public string? Region { get; set; }
    /// <summary>Another way to sign the same word (another signer, context, dictionary edition).</summary>
    public string? Variant { get; set; }
    /// <summary>The default sign of the word when it has several variants.</summary>
    public bool IsPreferred { get; set; }
    /// <summary>Higher wins between variants that are not the default.</summary>
    public short Priority { get; set; }
    /// <summary>Other words or phrases this sign says.</summary>
    public List<string>? Synonyms { get; set; }
    /// <summary>The owner of the video and the signer allowed its use in DigiTalent (required with a video).</summary>
    public bool ConsentConfirmed { get; set; }
    public string? SignerName { get; set; }
}
