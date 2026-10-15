namespace DigiTalent.Application.Common.Interfaces;

/// <summary>
/// Cleans rich text written by an author (course pages, final prompts) before it is stored: keeps formatting tags
/// (paragraphs, headings, bold, lists, links, alignment) and removes scripts, event handlers and unsafe URLs.
/// </summary>
public interface IHtmlContentSanitizer
{
    string Sanitize(string? html);

    /// <summary>The visible text of sanitized HTML (used to tell an empty editor from real content).</summary>
    string PlainText(string? html);
}
