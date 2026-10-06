namespace DigiTalent.Application.UseCases.Me;

// DTO dùng chung giữa nhiều API /me/* (để FE dùng 1 kiểu cho cùng 1 khái niệm).

public class MyCompetencySummaryDto
{
    public int TotalRequired { get; set; }
    public int TotalMet { get; set; }
    public int TotalGap { get; set; }
    public int HighCount { get; set; }
    public int MediumCount { get; set; }
    public int LowCount { get; set; }
    public decimal CoveragePercent { get; set; }
}

public class MyCompetencyLineDto
{
    public Guid CompetencyId { get; set; }
    public string CompetencyCode { get; set; } = string.Empty;
    public string CompetencyName { get; set; } = string.Empty;
    public string? CategoryName { get; set; }
    public short RequiredLevel { get; set; }
    public short? CurrentLevel { get; set; }
    public DateTimeOffset? ConfirmedAt { get; set; }
    public short GapSteps { get; set; }
    public string? Severity { get; set; }
    public bool Mandatory { get; set; }
    public decimal WeightPercent { get; set; }
    public bool RequiresPracticalEvidence { get; set; }
    public string? Note { get; set; }
    public decimal PriorityScore { get; set; }

    /// <summary>MET | GAP | NOT_CONFIRMED</summary>
    public string Status { get; set; } = string.Empty;

    public static MyCompetencyLineDto From(MyCompetencyLine line) => Map<MyCompetencyLineDto>(line);

    public static T Map<T>(MyCompetencyLine line) where T : MyCompetencyLineDto, new() => new()
    {
        CompetencyId = line.CompetencyId,
        CompetencyCode = line.CompetencyCode,
        CompetencyName = line.CompetencyName,
        CategoryName = line.CategoryName,
        RequiredLevel = line.RequiredLevel,
        CurrentLevel = line.CurrentLevel,
        ConfirmedAt = line.ConfirmedAt,
        GapSteps = line.GapSteps,
        Severity = line.Severity,
        Mandatory = line.Mandatory,
        WeightPercent = line.WeightPercent,
        RequiresPracticalEvidence = line.RequiresPracticalEvidence,
        Note = line.Note,
        PriorityScore = line.PriorityScore,
        Status = line.GapSteps == 0 ? "MET" : line.CurrentLevel is null or 0 ? "NOT_CONFIRMED" : "GAP",
    };

    public static MyCompetencySummaryDto? Summary(MyCompetencySnapshot snapshot) => snapshot.Summary == null
        ? null
        : new MyCompetencySummaryDto
        {
            TotalRequired = snapshot.Summary.TotalRequired,
            TotalMet = snapshot.Summary.TotalMet,
            TotalGap = snapshot.Summary.TotalGap,
            HighCount = snapshot.Summary.HighCount,
            MediumCount = snapshot.Summary.MediumCount,
            LowCount = snapshot.Summary.LowCount,
            CoveragePercent = snapshot.Summary.CoveragePercent,
        };
}

public class MyConfirmedCompetencyDto
{
    public Guid CompetencyId { get; set; }
    public string CompetencyCode { get; set; } = string.Empty;
    public string CompetencyName { get; set; } = string.Empty;
    public string? CategoryName { get; set; }
    public short Level { get; set; }
    public DateTimeOffset ConfirmedAt { get; set; }

    public static MyConfirmedCompetencyDto From(MyConfirmedCompetency c) => new()
    {
        CompetencyId = c.CompetencyId,
        CompetencyCode = c.Code,
        CompetencyName = c.Name,
        CategoryName = c.CategoryName,
        Level = c.Level,
        ConfirmedAt = c.ConfirmedAt,
    };
}

public class MyCompetencyRefDto
{
    public Guid CompetencyId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public short TargetLevel { get; set; }
}

public class MyAssessmentCardDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string AssessmentType { get; set; } = string.Empty;
    public bool IsFinal { get; set; }
    public Guid CourseId { get; set; }
    public string CourseCode { get; set; } = string.Empty;
    public string CourseTitle { get; set; } = string.Empty;
    public int QuestionCount { get; set; }
    public int? TimeLimitMinutes { get; set; }
    public decimal PassingScore { get; set; }
    public int? MaxAttempts { get; set; }
    public int AttemptsUsed { get; set; }

    /// <summary>null = không giới hạn số lần làm.</summary>
    public int? AttemptsRemaining { get; set; }

    public decimal? BestScore { get; set; }
    public decimal? LatestScore { get; set; }
    public Guid? LatestAttemptId { get; set; }
    public bool Passed { get; set; }

    /// <summary>AVAILABLE | IN_PROGRESS | PASSED | RETAKE | LOCKED | NO_ATTEMPTS_LEFT</summary>
    public string Status { get; set; } = string.Empty;

    public string? LockedReason { get; set; }
    public Guid? InProgressAttemptId { get; set; }
    public DateTimeOffset? InProgressDeadline { get; set; }
    public bool InProgressExpired { get; set; }
    public bool CanStart { get; set; }

    public static MyAssessmentCardDto From(MyAssessmentState state) => Map<MyAssessmentCardDto>(state);

    public static T Map<T>(MyAssessmentState state) where T : MyAssessmentCardDto, new()
    {
        var assessment = state.Visible.Assessment;
        return new T
        {
            Id = assessment.Id,
            Code = assessment.Code,
            Title = assessment.Title,
            AssessmentType = assessment.AssessmentType,
            IsFinal = assessment.IsFinal,
            CourseId = state.Visible.Course.Id,
            CourseCode = state.Visible.Course.Code,
            CourseTitle = state.Visible.Course.Title,
            QuestionCount = state.Visible.QuestionCount,
            TimeLimitMinutes = assessment.TimeLimitMinutes,
            PassingScore = assessment.PassingScore,
            MaxAttempts = assessment.MaxAttempts,
            AttemptsUsed = state.AttemptsUsed,
            AttemptsRemaining = state.AttemptsRemaining,
            BestScore = state.BestScore,
            LatestScore = state.LatestScored?.Score,
            LatestAttemptId = state.LatestScored?.Id,
            Passed = state.Passed,
            Status = state.Status,
            LockedReason = state.LockedReason,
            InProgressAttemptId = state.InProgress?.Id,
            InProgressDeadline = state.InProgress == null ? null : MyAssessmentService.DeadlineOf(state.InProgress, assessment),
            InProgressExpired = state.InProgressExpired,
            CanStart = state.CanStart,
        };
    }
}

public class MyTaskFileDto
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string? ContentType { get; set; }
    public long SizeBytes { get; set; }

    public static MyTaskFileDto From(MyTaskFile file) => new()
    {
        Id = file.Id,
        FileName = file.FileName,
        ContentType = file.ContentType,
        SizeBytes = file.SizeBytes,
    };
}

public class MyCompetencyResultDto
{
    public Guid CompetencyId { get; set; }
    public string CompetencyCode { get; set; } = string.Empty;
    public string CompetencyName { get; set; } = string.Empty;
    public short TargetLevel { get; set; }
    public string Verdict { get; set; } = string.Empty;
    public decimal? Score { get; set; }
    public bool LevelConfirming { get; set; }
    public short? ConfirmedLevel { get; set; }
    public string? Feedback { get; set; }
}

public class MyTaskEvaluationDto
{
    public Guid Id { get; set; }

    /// <summary>PASSED | NEEDS_REVISION | FAILED</summary>
    public string Verdict { get; set; } = string.Empty;

    public decimal? Score { get; set; }
    public string? Feedback { get; set; }
    public string? ReviewerName { get; set; }
    public DateTimeOffset EvaluatedAt { get; set; }
    public bool CountsAsEvidence { get; set; }
    public List<MyCompetencyResultDto> CompetencyResults { get; set; } = new();

    public static MyTaskEvaluationDto? From(MyTaskEvaluation? evaluation) => evaluation == null
        ? null
        : new MyTaskEvaluationDto
        {
            Id = evaluation.Id,
            Verdict = evaluation.Verdict,
            Score = evaluation.Score,
            Feedback = evaluation.Feedback,
            ReviewerName = evaluation.ReviewerName,
            EvaluatedAt = evaluation.EvaluatedAt,
            CountsAsEvidence = evaluation.CountsAsEvidence,
            CompetencyResults = evaluation.CompetencyResults.Select(r => new MyCompetencyResultDto
            {
                CompetencyId = r.CompetencyId,
                CompetencyCode = r.Code,
                CompetencyName = r.Name,
                TargetLevel = r.TargetLevel,
                Verdict = r.Verdict,
                Score = r.Score,
                LevelConfirming = r.LevelConfirming,
                ConfirmedLevel = r.ConfirmedLevel,
                Feedback = r.Feedback,
            }).ToList(),
        };
}

public class MyTaskSubmissionDto
{
    public Guid Id { get; set; }
    public int VersionNo { get; set; }

    /// <summary>Trạng thái hiển thị: PENDING_REVIEW | APPROVED | NEEDS_REVISION | REJECTED | SUPERSEDED</summary>
    public string Status { get; set; } = string.Empty;

    public DateTimeOffset SubmittedAt { get; set; }
    public string? Note { get; set; }
    public List<string> Links { get; set; } = new();
    public List<MyTaskFileDto> Files { get; set; } = new();
    public MyTaskEvaluationDto? Evaluation { get; set; }

    public static MyTaskSubmissionDto From(MyTaskSubmission submission) => new()
    {
        Id = submission.Id,
        VersionNo = submission.VersionNo,
        Status = DisplayStatus(submission),
        SubmittedAt = submission.SubmittedAt,
        Note = submission.Note,
        Links = submission.Links.ToList(),
        Files = submission.Files.Select(MyTaskFileDto.From).ToList(),
        Evaluation = MyTaskEvaluationDto.From(submission.Evaluation),
    };

    public static string DisplayStatus(MyTaskSubmission submission) => submission.Evaluation?.Verdict switch
    {
        Domain.Constants.Statuses.TaskVerdict.Passed => "APPROVED",
        Domain.Constants.Statuses.TaskVerdict.NeedsRevision => "NEEDS_REVISION",
        Domain.Constants.Statuses.TaskVerdict.Failed => "REJECTED",
        _ => submission.Status == Domain.Constants.Statuses.TaskSubmission.Superseded ? "SUPERSEDED" : "PENDING_REVIEW",
    };
}
