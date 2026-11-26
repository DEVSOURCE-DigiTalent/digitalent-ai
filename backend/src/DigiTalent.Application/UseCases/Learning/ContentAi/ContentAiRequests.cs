using DigiTalent.Application.Common;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using FluentValidation;

namespace DigiTalent.Application.UseCases.Learning.ContentAi;

/// <summary>
/// Turns a module of the course builder into what the AI is given: the course code gives the domain and the level
/// (F = Cơ bản → bậc 1–2, I = Trung cấp → bậc 3–4, A = Nâng cao → bậc 5–6), module k teaches competency domain.k
/// (or the competency given), and only the requirements of those two levels are sent — never the whole Circular.
/// </summary>
public static class ContentAiRequests
{
    /// <summary>Stands for a page without text (an image or an empty page), so the page numbers stay aligned.</summary>
    public const string EmptyPage = "(trang này không có chữ)";

    public const int MaxLessons = 40;

    public static bool HasText(ModuleContentAiRequest request) => request.Lessons.Any(l => l != EmptyPage);
    public const int MaxQuestions = 60;
    public const int MaxTextLength = 60_000;

    public static (ModuleContentAiRequest Request, List<ContentAiCompetencyDto> Competencies) Build(
        ModuleContentAiInput input, ITt02Framework framework, IHtmlContentSanitizer sanitizer)
    {
        var code = CourseCodes.Canonical(input.CourseCode).ToUpperInvariant();
        if (code.Length != 4 || code[0] != 'M' || code[1] is < '1' or > '6' || code[2] != '-' || code[3] is not ('F' or 'I' or 'A'))
        {
            throw new BadRequestException(
                "Chỉ gợi ý và kiểm tra được 18 khóa chuẩn theo Thông tư 02 (mã M1-F … M6-A).", "courseCode", "COURSE_NOT_STANDARD");
        }

        var domain = code[1] - '0';
        var level = code[3] switch { 'F' => 1, 'I' => 2, _ => 3 };
        var competencies = Resolve(input, framework, domain);
        var dtos = competencies.Select(c => ToDto(c, level)).ToList();

        // Every page keeps its place (page n = the n-th page sent), so the AI's per-page review maps back to the block.
        var lessons = input.Lessons
            .Select(l => string.Join("\n", new[] { l.Title?.Trim(), Squeeze(sanitizer.PlainText(l.Html)) }.Where(s => !string.IsNullOrWhiteSpace(s))))
            .Select(text => text.Length > 0 ? text : EmptyPage)
            .ToList();
        var questions = input.Questions
            .Where(q => !string.IsNullOrWhiteSpace(q.Text))
            .Select(q => new ModuleContentQuestionInput
            {
                Text = q.Text.Trim(),
                Options = q.Options.Where(o => !string.IsNullOrWhiteSpace(o.Text))
                    .Select(o => new ModuleContentOptionInput { Text = o.Text.Trim(), IsCorrect = o.IsCorrect }).ToList(),
            })
            .ToList();

        var request = new ModuleContentAiRequest(
            code, level, ITt02Framework.LevelName(level), framework.DomainName(domain),
            string.IsNullOrWhiteSpace(input.ModuleTitle) ? $"Mô-đun {input.ModuleIndex + 1}" : input.ModuleTitle.Trim(),
            competencies, lessons, questions);
        return (request, dtos);
    }

    /// <summary>Plain text with runs of spaces collapsed (removed tags leave double spaces).</summary>
    private static string Squeeze(string text) =>
        System.Text.RegularExpressions.Regex.Replace(text, @"[ \t]{2,}", " ").Trim();

    /// <summary>Stable id of one requirement: "{competency}-b{bậc}-{n}".</summary>
    public static string OutcomeId(string competency, int bac, int index) => $"{competency}-b{bac}-{index + 1}";

    private static IReadOnlyList<Tt02Competency> Resolve(ModuleContentAiInput input, ITt02Framework framework, int domain)
    {
        if (!string.IsNullOrWhiteSpace(input.CompetencyCode))
        {
            var chosen = framework.Find(input.CompetencyCode)
                         ?? throw new BadRequestException("Không có năng lực thành phần này trong Thông tư 02.", "competencyCode", "COMPETENCY_UNKNOWN");
            if (chosen.Domain != domain)
            {
                throw new BadRequestException("Năng lực này không thuộc miền của khóa học.", "competencyCode", "COMPETENCY_OTHER_DOMAIN");
            }

            return new[] { chosen };
        }

        // Module k teaches competency domain.k; a module past the domain's competencies is checked against the domain.
        var standard = framework.Find($"{domain}.{input.ModuleIndex + 1}");
        return standard != null ? new[] { standard } : framework.OfDomain(domain);
    }

    private static ContentAiCompetencyDto ToDto(Tt02Competency competency, int level)
    {
        var levels = competency.ForSystemLevel(level);
        return new ContentAiCompetencyDto
        {
            Code = competency.Code,
            Name = competency.Name,
            LevelName = ITt02Framework.LevelName(level),
            Bac = $"{level * 2 - 1}–{level * 2}",
            Outcomes = levels
                .SelectMany(l => l.Outcomes.Select((text, i) => new ContentAiOutcomeDto { Id = OutcomeId(competency.Code, l.Bac, i), Bac = l.Bac, Text = text }))
                .ToList(),
        };
    }
}

/// <summary>Shared limits of the module sent by the builder.</summary>
public abstract class ModuleContentAiInputValidator<T> : AbstractValidator<T> where T : ModuleContentAiInput
{
    protected ModuleContentAiInputValidator()
    {
        RuleFor(x => x.CourseCode).NotEmpty().WithMessage("Thiếu mã khóa học.");
        RuleFor(x => x.ModuleIndex).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Lessons).Must(l => l.Count <= ContentAiRequests.MaxLessons)
            .WithMessage($"Một mô-đun gửi tối đa {ContentAiRequests.MaxLessons} trang.");
        RuleFor(x => x.Questions).Must(q => q.Count <= ContentAiRequests.MaxQuestions)
            .WithMessage($"Một mô-đun gửi tối đa {ContentAiRequests.MaxQuestions} câu hỏi.");
        RuleFor(x => x).Must(x => x.Lessons.Sum(l => (l.Html?.Length ?? 0) + (l.Title?.Length ?? 0)) + x.Questions.Sum(q => q.Text.Length) <= ContentAiRequests.MaxTextLength)
            .WithName("Lessons").WithMessage("Nội dung mô-đun quá dài để AI đọc một lần.");
    }
}
