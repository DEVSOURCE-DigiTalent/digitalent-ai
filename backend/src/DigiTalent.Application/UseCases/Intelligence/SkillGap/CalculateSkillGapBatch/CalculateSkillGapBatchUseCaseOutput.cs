namespace DigiTalent.Application.UseCases.Intelligence.SkillGap;

public class CalculateSkillGapBatchUseCaseOutput
{
    public int CalculatedCount { get; set; }
    public List<CalculatedSkillGapRun> Runs { get; set; } = new();
    public List<SkippedEmployee> Skipped { get; set; } = new();
}

public class CalculatedSkillGapRun
{
    public Guid EmployeeId { get; set; }
    public Guid RunId { get; set; }
    public int GapCount { get; set; }
}

public class SkippedEmployee
{
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    /// <summary>NO_JOB_POSITION / NO_ACTIVE_REQUIREMENT_SET</summary>
    public string Reason { get; set; } = string.Empty;
}
