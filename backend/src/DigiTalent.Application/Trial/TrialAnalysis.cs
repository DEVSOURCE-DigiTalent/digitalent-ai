namespace DigiTalent.Application.Trial;

public static class TrialAnalysis
{
    // Rubric v1 measures only the explicitly covered introductory levels, never untested higher levels.
    public static TrialGapResultDto Grade(Guid attemptId, TrialBundle bundle, TrialAnswerDto[] answers, DateTimeOffset now)
    {
        var items = bundle.Requirements.Select(requirement =>
        {
            var questions = bundle.Questions.Where(q => q.CompetencyId == requirement.CompetencyId).ToArray();
            var measured = questions.Where(q => answers.Any(a => a.QuestionId == q.Id)).ToArray();
            if (requirement.MinimumAnswers <= 0 || measured.Length < requirement.MinimumAnswers)
                return new TrialGapItemDto(requirement.CompetencyId, requirement.Name, requirement.RequiredLevel, null, null,
                    "insufficient_data", $"Answered {measured.Length}/{requirement.MinimumAnswers} required evidence questions; no level inferred.");
            var correct = measured.Count(q => answers.Any(a => a.QuestionId == q.Id && a.OptionId == q.CorrectOptionId));
            var level = correct == measured.Length ? 2 : 1;
            var gap = Math.Max(0, requirement.RequiredLevel - level);
            return new TrialGapItemDto(requirement.CompetencyId, requirement.Name, requirement.RequiredLevel, level, gap,
                gap > 0 ? "gap" : "met", $"{bundle.RubricVersion}: {correct}/{measured.Length} evidence questions; introductory level {level}, frozen standard {bundle.RequirementVersion}.");
        }).ToArray();
        return new(attemptId, bundle.RequirementVersion, bundle.RubricVersion, "trial-measurement-v1", now, items);
    }

    public static TrialLearningPathDto BuildPath(TrialGapResultDto result, TrialBundle bundle)
    {
        var gaps = result.Items.Where(x => x.Classification == "gap").OrderByDescending(x => x.GapSteps).ToArray();
        if (gaps.Length == 0)
            return new(Guid.NewGuid(), result.SourceAttemptId, result.Items.Any(x => x.CurrentLevel != null) ? "no_measured_gap" : "insufficient_data", [], []);
        var items = new List<TrialPathItemDto>();
        var missing = new List<string>();
        foreach (var gap in gaps)
        {
            var candidates = bundle.Content.Where(c => c.Published && !string.IsNullOrWhiteSpace(c.Body) && c.CompetencyId == gap.CompetencyId && c.TargetLevel >= gap.RequiredLevel).ToArray();
            if (candidates.Length == 0) missing.Add($"No published content for {gap.CompetencyId}: level {gap.CurrentLevel} → {gap.RequiredLevel}.");
            foreach (var content in candidates)
            {
                // Publication alone does not satisfy a prerequisite: it must be completed in this employee's path.
                var prerequisitesAvailable = content.Prerequisites.Length == 0;
                items.Add(new(content.Id, content.Title, content.Version, content.CompetencyId,
                    [$"{gap.CompetencyId}: measured {gap.CurrentLevel}, required {gap.RequiredLevel}, deficit {gap.GapSteps}; attempt {result.SourceAttemptId}."],
                    content.Prerequisites, prerequisitesAvailable, "not_started", 0));
            }
        }
        return new(Guid.NewGuid(), result.SourceAttemptId, items.Count == 0 ? "no_matching_content" : "ready", items.DistinctBy(x => x.Id).ToArray(), missing.ToArray());
    }
}
