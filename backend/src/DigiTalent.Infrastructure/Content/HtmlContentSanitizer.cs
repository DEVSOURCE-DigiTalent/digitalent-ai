using System.Net;
using System.Text.RegularExpressions;
using DigiTalent.Application.Common.Interfaces;
using Ganss.Xss;

namespace DigiTalent.Infrastructure.Content;

/// <summary>
/// Allow-list sanitizer for course rich text (HtmlSanitizer / AngleSharp): the formatting the course editor can
/// produce, links over http(s)/mailto only, and text-align as the only style.
/// </summary>
public sealed partial class HtmlContentSanitizer : IHtmlContentSanitizer
{
    private static readonly string[] Tags =
    {
        "p", "br", "b", "strong", "i", "em", "u", "s", "h2", "h3", "h4", "ul", "ol", "li", "a", "blockquote", "span",
    };

    private readonly HtmlSanitizer _sanitizer;

    public HtmlContentSanitizer()
    {
        _sanitizer = new HtmlSanitizer(new HtmlSanitizerOptions
        {
            AllowedTags = new HashSet<string>(Tags, StringComparer.OrdinalIgnoreCase),
            AllowedAttributes = new HashSet<string>(new[] { "href", "target", "rel", "style" }, StringComparer.OrdinalIgnoreCase),
            AllowedCssProperties = new HashSet<string>(new[] { "text-align" }, StringComparer.OrdinalIgnoreCase),
            AllowedSchemes = new HashSet<string>(new[] { "http", "https", "mailto" }, StringComparer.OrdinalIgnoreCase),
            UriAttributes = new HashSet<string>(new[] { "href" }, StringComparer.OrdinalIgnoreCase),
        });
        _sanitizer.PostProcessNode += (_, e) =>
        {
            if (e.Node is AngleSharp.Dom.IElement { LocalName: "a" } link)
            {
                link.SetAttribute("target", "_blank");
                link.SetAttribute("rel", "noopener noreferrer");
            }
        };
    }

    public string Sanitize(string? html) => string.IsNullOrWhiteSpace(html) ? string.Empty : _sanitizer.Sanitize(html).Trim();

    public string PlainText(string? html) =>
        string.IsNullOrEmpty(html) ? string.Empty : WebUtility.HtmlDecode(Tag().Replace(html, " ")).Trim();

    [GeneratedRegex("<[^>]+>")]
    private static partial Regex Tag();
}
