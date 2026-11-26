using DigiTalent.Application.Common.Interfaces;

namespace DigiTalent.Application.UseCases.Learning.ContentAi;

public class ModuleContentOptionInput
{
    public string Text { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
}

public class ModuleContentQuestionInput
{
    public string Text { get; set; } = string.Empty;
    public List<ModuleContentOptionInput> Options { get; set; } = new();
}

public class ModuleContentLessonInput
{
    public string? Title { get; set; }

    /// <summary>The page as written in the builder (HTML); only its text is sent to the AI.</summary>
    public string? Html { get; set; }
}

/// <summary>
/// One module as the course builder (admin catalog draft or company R&amp;D draft) has it: the client sends the content
/// so the same endpoints serve both drafts.
/// </summary>
public class ModuleContentAiInput
{
    /// <summary>Standard course code (M1-F … M6-A, A-aliases accepted): gives the domain and the level.</summary>
    public string CourseCode { get; set; } = string.Empty;

    /// <summary>0-based position of the module: module k teaches component competency domain.(k+1).</summary>
    public int ModuleIndex { get; set; }

    /// <summary>Optional: the component competency (e.g. "2.4") when the module does not follow the standard order.</summary>
    public string? CompetencyCode { get; set; }

    public string? ModuleTitle { get; set; }
    public List<ModuleContentLessonInput> Lessons { get; set; } = new();
    public List<ModuleContentQuestionInput> Questions { get; set; } = new();
}

/// <summary>What the AI service is given: the module's text and the Circular's requirements at the course level.</summary>
public sealed record ModuleContentAiRequest(
    string CourseCode,
    int Level,
    string LevelName,
    string DomainName,
    string ModuleTitle,
    IReadOnlyList<Tt02Competency> Competencies,
    IReadOnlyList<string> Lessons,
    IReadOnlyList<ModuleContentQuestionInput> Questions);

public class ContentAiOutcomeDto
{
    /// <summary>Stable id the AI answers with: "{competency}-b{bậc}-{n}", e.g. 1.1-b3-2.</summary>
    public string Id { get; set; } = string.Empty;
    public int Bac { get; set; }
    public string Text { get; set; } = string.Empty;
}

/// <summary>The Circular's requirement the module is checked against (competency + the two levels of the course level).</summary>
public class ContentAiCompetencyDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string LevelName { get; set; } = string.Empty;

    /// <summary>"3–4" for Trung cấp.</summary>
    public string Bac { get; set; } = string.Empty;
    public List<ContentAiOutcomeDto> Outcomes { get; set; } = new();
}

public class SuggestedLessonDto
{
    public string Title { get; set; } = string.Empty;

    /// <summary>Cleaned HTML, ready to become a TEXT block.</summary>
    public string Html { get; set; } = string.Empty;
}

public class SuggestedQuestionDto
{
    public string Text { get; set; } = string.Empty;
    public List<ModuleContentOptionInput> Options { get; set; } = new();
    public string? Explanation { get; set; }

    /// <summary>The requirement it checks (<see cref="ContentAiOutcomeDto.Id"/>), when the AI gave one.</summary>
    public string? OutcomeId { get; set; }
}

public class ModuleContentSuggestionOutput
{
    public List<ContentAiCompetencyDto> Competencies { get; set; } = new();
    public List<SuggestedLessonDto> Lessons { get; set; } = new();
    public List<SuggestedQuestionDto> Questions { get; set; } = new();
    public string? Note { get; set; }
    public string? Model { get; set; }
}

public static class ContentCheckVerdict
{
    public const string Met = "DAT";
    public const string NeedsWork = "CAN_SUA";
    public const string NotMet = "CHUA_DAT";
}

public static class ContentOutcomeStatus
{
    public const string Met = "MET";
    public const string Partial = "PARTIAL";
    public const string Missing = "MISSING";

    /// <summary>The AI did not answer for this requirement.</summary>
    public const string Unchecked = "UNCHECKED";
}

public class CheckedOutcomeDto
{
    public string Id { get; set; } = string.Empty;
    public string CompetencyCode { get; set; } = string.Empty;
    public int Bac { get; set; }
    public string Text { get; set; } = string.Empty;
    public string Status { get; set; } = ContentOutcomeStatus.Unchecked;
    public string? Evidence { get; set; }
}

public class ContentIssueDto
{
    /// <summary>SAI_KIEN_THUC, LAC_DE, VUOT_MUC, THIEU_VI_DU or KHO_HIEU.</summary>
    public string Kind { get; set; } = string.Empty;
    public string Detail { get; set; } = string.Empty;
}

public class QuestionProblemDto
{
    /// <summary>1-based number of the question in the module.</summary>
    public int Number { get; set; }
    public string Problem { get; set; } = string.Empty;
}

public static class PageReviewStatus
{
    /// <summary>Right and with examples.</summary>
    public const string Ok = "OK";

    /// <summary>Right but thin (no example, too general).</summary>
    public const string Weak = "WEAK";

    /// <summary>Wrong, off topic or above the course level.</summary>
    public const string Problem = "PROBLEM";
}

/// <summary>The AI's view of one page of the module (page n = the n-th text page sent).</summary>
public class PageReviewDto
{
    public int Number { get; set; }

    /// <summary><see cref="PageReviewStatus"/>.</summary>
    public string Status { get; set; } = PageReviewStatus.Weak;

    /// <summary>Requirement ids the page meets.</summary>
    public List<string> Covers { get; set; } = new();

    /// <summary>What to fix on this page (short sentences).</summary>
    public List<string> Notes { get; set; } = new();
}

/// <summary>One page rewritten by the AI, to replace the page if the author keeps it.</summary>
public class RewrittenPageOutput
{
    public int PageNumber { get; set; }
    public string Title { get; set; } = string.Empty;

    /// <summary>Cleaned HTML, ready to become the TEXT block's content.</summary>
    public string Html { get; set; } = string.Empty;
    public List<string> Covers { get; set; } = new();
    public string? Note { get; set; }
    public string? Model { get; set; }
}

public class ModuleContentCheckOutput
{
    public List<ContentAiCompetencyDto> Competencies { get; set; } = new();

    /// <summary>Per text page: OK / WEAK / PROBLEM, what it meets and what to fix.</summary>
    public List<PageReviewDto> Pages { get; set; } = new();

    /// <summary><see cref="ContentCheckVerdict"/>.</summary>
    public string Verdict { get; set; } = ContentCheckVerdict.NeedsWork;
    public string Summary { get; set; } = string.Empty;
    public List<CheckedOutcomeDto> Outcomes { get; set; } = new();
    public List<ContentIssueDto> Issues { get; set; } = new();
    public List<QuestionProblemDto> QuestionProblems { get; set; } = new();
    public List<string> Suggestions { get; set; } = new();
    public string? Model { get; set; }
}
