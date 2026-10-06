namespace DigiTalent.Application.Trial;

public sealed record TrialRegistrationRequest(string OrganizationName, string OwnerName, string Email, string Password, string Industry, string Size, string Goal, bool AcceptedTerms);
public sealed record TrialTokenRequest(string Token);
public sealed record TrialAccountDto(Guid UserId, Guid OrganizationId, string Email, string Role);
public sealed record TrialRegistrationDto(string State, DateTimeOffset ExpiresAt, string? DevelopmentLink);
public sealed record TrialSelectionRequest(string CatalogKey, string DepartmentName);
public sealed record TrialInviteRequest(string Name, string Email, string Role);
public sealed record TrialAcceptRequest(string Token, string Password);
public sealed record TrialInvitationDto(Guid Id, string Name, string Email, string Role, Guid DepartmentId, Guid AssignedPositionId, string State, DateTimeOffset SentAt, DateTimeOffset ExpiresAt, bool CanResend, string? DevelopmentLink);
public sealed record TrialUsageDto(int Accounts, int PendingInvitations);
public sealed record TrialChecklistDto(string Key, bool Complete, string NextAction);
public sealed record TrialContextDto(Guid OrganizationId, string Status, DateTimeOffset StartedAt, DateTimeOffset EndsAt, string PolicyVersion, TrialOptions Limits, TrialUsageDto Usage, string[] AllowedActions, TrialSelectedPositionDto? SelectedPosition, TrialChecklistDto[] Checklist, TrialReadinessDto PublicationReadiness);
public sealed record TrialSelectedPositionDto(Guid PositionId, Guid DepartmentId, string Name, string RequirementVersion);
public sealed record TrialReadinessDto(bool CanRegister, bool ProductionReady, bool DevelopmentOnly, string[] MissingReasons);
public sealed record TrialEligiblePositionDto(string CatalogKey, string Name, string RequirementVersion, string AssessmentVersion, string RubricVersion, bool Eligible, string[] MissingReasons, TrialRequirement[] Requirements, bool DevelopmentOnly);
public sealed record TrialOptionDto(string Id, string Text);
public sealed record TrialQuestionDto(string Id, string CompetencyId, string Text, TrialOptionDto[] Options);
public sealed record TrialAnswerDto(string QuestionId, string OptionId);
public sealed record TrialSaveAnswersRequest(int Revision, TrialAnswerDto[] Answers);
public sealed record TrialDiagnosticDto(Guid AttemptId, string Status, Guid EmployeeId, Guid PositionId, string PositionName, string RequirementVersion, string AssessmentVersion, string RubricVersion, int Revision, TrialQuestionDto[] Questions, TrialAnswerDto[] SavedAnswers, DateTimeOffset StartedAt, DateTimeOffset? SubmittedAt);
public sealed record TrialGapItemDto(string CompetencyId, string Name, int RequiredLevel, int? CurrentLevel, int? GapSteps, string Classification, string Basis);
public sealed record TrialGapResultDto(Guid SourceAttemptId, string RequirementVersion, string RubricVersion, string CalculationVersion, DateTimeOffset MeasuredAt, TrialGapItemDto[] Items);
public sealed record TrialPathItemDto(string Id, string Title, string Version, string CompetencyId, string[] Reasons, string[] Prerequisites, bool AllowedToStart, string Status, int ProgressPercent);
public sealed record TrialLearningPathDto(Guid Id, Guid SourceAttemptId, string State, TrialPathItemDto[] Items, string[] MissingContentReasons);
public sealed record TrialProgressRequest(int Percent);
public sealed record TrialLearningContentDto(string ItemId, string Title, string Version, string Body);
public sealed record TrialResultRowDto(Guid InvitationId, Guid? EmployeeId, string Name, string Role, string State, TrialGapResultDto? Result, TrialLearningPathDto? Path);
public sealed record TrialConversionRequest(string Reference);

// Private content model: never return TrialBundle, TrialPrivateQuestion, or grading keys from API.
public sealed record TrialRequirement(string CompetencyId, string Name, int RequiredLevel, int MinimumAnswers);
public sealed record TrialPrivateQuestion(string Id, string CompetencyId, string Text, TrialOptionDto[] Options, string CorrectOptionId);
public sealed record TrialPublishedContent(string Id, string Title, string Version, string CompetencyId, int TargetLevel, string[] Prerequisites, string Body, bool Published);
public sealed record TrialBundle(string CatalogKey, string Name, string RequirementVersion, string AssessmentVersion, string RubricVersion, bool Active, bool Approved, TrialRequirement[] Requirements, TrialPrivateQuestion[] Questions, TrialPublishedContent[] Content);

public interface ITrialCatalog
{
    bool IsProductionApproved { get; }
    IReadOnlyList<TrialBundle> Bundles { get; }
}

public interface ITrialEmailSender
{
    bool IsReady { get; }
    Task SendAsync(string email, string kind, string token, CancellationToken ct = default);
}
