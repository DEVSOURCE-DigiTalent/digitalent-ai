namespace DigiTalent.Application.UseCases.Intelligence.SkillGap.GetCapabilityProgress;

/// <summary>Gaps now and since the survey. A gap counts missing levels; "people below" counts people with any gap.</summary>
public sealed record GetCapabilityProgressOutput(
    DateTimeOffset? SurveyedAt,
    int Employees,
    int Assessed,
    CapabilityProgressTotals Totals,
    IReadOnlyList<CapabilityProgressDomain> Domains,
    IReadOnlyList<CapabilityProgressPosition> Positions,
    IReadOnlyList<CapabilityProgressEmployee> People);

public sealed record CapabilityProgressTotals(
    int GapsAtSurvey, int GapsNow, int PeopleBelowAtSurvey, int PeopleBelowNow, int PeopleMet);

/// <summary>One domain over the surveyed employees who must reach a level in it: average levels and people below.</summary>
public sealed record CapabilityProgressDomain(
    Guid CategoryId, int Number, string Name,
    decimal? Required, decimal? AtSurvey, decimal? Now,
    int Assessed, int BelowAtSurvey, int BelowNow);

public sealed record CapabilityProgressPositionDomain(int Number, int Assessed, int BelowNow);

/// <summary>The people holding one position, whatever their department; PositionId null = people without a position.</summary>
public sealed record CapabilityProgressPosition(
    Guid? PositionId, string Name, int Employees, int Assessed,
    int GapsAtSurvey, int GapsNow, int PeopleBelowNow,
    IReadOnlyList<CapabilityProgressPositionDomain> Domains);

/// <summary>A domain the employee must reach (required &gt; 0); levels null when the employee has no survey result.</summary>
public sealed record CapabilityProgressEmployeeDomain(
    Guid CategoryId, int Number, string Name, int Required, int? AtSurvey, int? Now);

public sealed record CapabilityProgressEmployee(
    Guid EmployeeId, string Name, string? DepartmentName, string? PositionName, Guid DepartmentId, Guid? PositionId,
    bool Assessed, int GapsAtSurvey, int GapsNow, int LevelsGained,
    IReadOnlyList<CapabilityProgressEmployeeDomain> Domains);
