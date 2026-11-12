namespace DigiTalent.Application.UseCases.Intelligence.SkillGap;

public class LearningNeedsCourseGroup
{
    public int RequiredLevel { get; set; }
    public Guid? CourseId { get; set; }
    public string? CourseCode { get; set; }
    public string? CourseTitle { get; set; }
    public int Employees { get; set; }
    public List<string> MissingCompetencies { get; set; } = new();
}

public class LearningNeedsDomainOverview
{
    public Guid CategoryId { get; set; }
    public string Name { get; set; } = "";
    public int Number { get; set; }
    public int Assessed { get; set; }
    public int Met { get; set; }
    public int Waiting { get; set; }
    public int NeedsLearning { get; set; }
    public List<LearningNeedsCourseGroup> Courses { get; set; } = new();
}

public class LearningNeedsOverview
{
    public int Employees { get; set; }
    public int AssessedEmployees { get; set; }
    public int WaitingEmployees { get; set; }
    public int NoStandardEmployees { get; set; }
    public List<LearningNeedsDomainOverview> Domains { get; set; } = new();

    public static LearningNeedsOverview From(List<EmployeeLearningNeeds> employees) => new()
    {
        Employees = employees.Count,
        AssessedEmployees = employees.Count(e => e.Domains.Any(d => d.State != "WAITING_ASSESSMENT")),
        WaitingEmployees = employees.Count(e => e.Domains.Any(d => d.State == "WAITING_ASSESSMENT")),
        NoStandardEmployees = employees.Count(e => e.State == "NO_STANDARD"),
        Domains = employees.SelectMany(e => e.Domains).GroupBy(d => d.CategoryId).OrderBy(g => g.First().Number)
            .Select(g => new LearningNeedsDomainOverview
            {
                CategoryId = g.Key, Name = g.First().Name, Number = g.First().Number,
                Assessed = g.Count(d => d.State != "WAITING_ASSESSMENT"),
                Met = g.Count(d => d.State == "MET"),
                Waiting = g.Count(d => d.State == "WAITING_ASSESSMENT"),
                NeedsLearning = g.Count(d => d.State == "NEEDS_LEARNING"),
                Courses = g.Where(d => d.State == "NEEDS_LEARNING").GroupBy(d => d.RequiredLevel).OrderBy(c => c.Key)
                    .Select(c => new LearningNeedsCourseGroup
                    {
                        RequiredLevel = c.Key, CourseId = c.First().CourseId,
                        CourseCode = c.First().CourseCode, CourseTitle = c.First().CourseTitle,
                        Employees = c.Count(), MissingCompetencies = c.SelectMany(d => d.MissingCompetencies).Distinct().ToList(),
                    }).ToList(),
            }).ToList(),
    };
}
