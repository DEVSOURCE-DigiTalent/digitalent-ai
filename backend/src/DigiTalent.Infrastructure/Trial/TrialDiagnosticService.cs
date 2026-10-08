using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Trial;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Infrastructure.Trial;

public sealed partial class TrialService
{
    public async Task<TrialDiagnosticDto?> DiagnosticAsync()
    {
        var trial = await Workspace(); var employee = await Self(trial);
        var attempt = await db.PositionDiagnosticAttempts.SingleOrDefaultAsync(x => x.OrganizationId == trial.OrganizationId && x.EmployeeId == employee.Id);
        return attempt == null ? null : Diagnostic(attempt);
    }

    public async Task<TrialDiagnosticDto> StartAsync()
    {
        var trial = await Workspace(true); var employee = await Self(trial);
        var existing = await db.PositionDiagnosticAttempts.SingleOrDefaultAsync(x => x.OrganizationId == trial.OrganizationId && x.EmployeeId == employee.Id);
        if (existing != null) return Diagnostic(existing);
        var bundle = Bundle(trial);
        if (!bundle.Active || !bundle.Approved) throw new ForbiddenException("The selected diagnostic is not approved.");
        var attempt = new PositionDiagnosticAttempt
        {
            OrganizationId = trial.OrganizationId, EmployeeId = employee.Id, PositionId = employee.JobPositionId!.Value,
            StartedAt = Now, BundleJson = Json(bundle)
        };
        db.PositionDiagnosticAttempts.Add(attempt);
        await Save(trial);
        return Diagnostic(attempt);
    }

    public async Task<TrialDiagnosticDto> SaveAnswersAsync(Guid attemptId, TrialSaveAnswersRequest request)
    {
        var trial = await Workspace(true); var attempt = await OwnAttempt(trial, attemptId);
        if (attempt.SubmittedAt != null) throw new ConflictException("This diagnostic was already submitted.");
        if (request.Revision != attempt.AnswerRevision) throw new ConflictException("Answers changed in another session. Reload before saving.");
        var bundle = Read<TrialBundle>(attempt.BundleJson);
        if (request.Answers == null || request.Answers.Length > bundle.Questions.Length || request.Answers.Select(x => x.QuestionId).Distinct().Count() != request.Answers.Length)
            throw new BadRequestException("Provide one valid option per question.");
        foreach (var answer in request.Answers)
        {
            var question = bundle.Questions.SingleOrDefault(x => x.Id == answer.QuestionId);
            if (question == null || !question.Options.Any(x => x.Id == answer.OptionId)) throw new BadRequestException("Question or option does not belong to this diagnostic.");
        }
        var answers = Read<TrialAnswerDto[]>(attempt.AnswersJson).ToDictionary(x => x.QuestionId);
        foreach (var answer in request.Answers) answers[answer.QuestionId] = answer;
        attempt.AnswersJson = Json(answers.Values.OrderBy(x => x.QuestionId).ToArray());
        attempt.AnswerRevision++;
        await Save(trial);
        return Diagnostic(attempt);
    }

    public async Task<TrialGapResultDto> SubmitAsync(Guid attemptId)
    {
        var trial = await Workspace(true); var attempt = await OwnAttempt(trial, attemptId);
        if (attempt.ResultJson != null) return Read<TrialGapResultDto>(attempt.ResultJson);
        var bundle = Read<TrialBundle>(attempt.BundleJson);
        var answers = Read<TrialAnswerDto[]>(attempt.AnswersJson);
        var result = TrialAnalysis.Grade(attempt.Id, bundle, answers, Now);
        var path = TrialAnalysis.BuildPath(result, bundle);
        attempt.ResultJson = Json(result); attempt.PathJson = Json(path); attempt.SubmittedAt = Now;
        attempt.AnswerRevision++;
        await Save(trial);
        return result;
    }

    public async Task<TrialGapResultDto?> ResultAsync()
    {
        var trial = await Workspace(); var employee = await Self(trial);
        var attempt = await db.PositionDiagnosticAttempts.SingleOrDefaultAsync(x => x.OrganizationId == trial.OrganizationId && x.EmployeeId == employee.Id);
        return attempt?.ResultJson == null ? null : Read<TrialGapResultDto>(attempt.ResultJson);
    }

    public async Task<TrialLearningPathDto?> PathAsync()
    {
        var trial = await Workspace(); var employee = await Self(trial);
        var attempt = await db.PositionDiagnosticAttempts.SingleOrDefaultAsync(x => x.OrganizationId == trial.OrganizationId && x.EmployeeId == employee.Id);
        if (attempt?.PathJson == null) return null;
        // Observational events stop writing at expiry; the historical path remains readable.
        if (attempt.PathViewedAt == null && (trial.ConvertedAt != null || Now < trial.EndsAt))
        {
            attempt.PathViewedAt = Now; await Save(trial);
        }
        return Read<TrialLearningPathDto>(attempt.PathJson);
    }

    public async Task<TrialLearningPathDto> StartItemAsync(string itemId)
    {
        var trial = await Workspace(true); var attempt = await OwnCompletedAttempt(trial);
        var path = Read<TrialLearningPathDto>(attempt.PathJson!);
        var item = path.Items.SingleOrDefault(x => x.Id == itemId) ?? throw new NotFoundException("Learning item not found in your path.");
        if (!item.AllowedToStart || item.Prerequisites.Any(id => !path.Items.Any(x => x.Id == id && x.Status == "completed")))
            throw new ForbiddenException("Complete the learning prerequisites first.");
        var updated = item.Status == "not_started" ? item with { Status = "in_progress" } : item;
        path = path with { Items = path.Items.Select(x => x.Id == itemId ? updated : x).ToArray() };
        attempt.PathJson = Json(path); await Save(trial);
        return path;
    }

    public async Task<TrialLearningPathDto> ProgressAsync(string itemId, TrialProgressRequest request)
    {
        if (request.Percent is < 0 or > 100) throw new BadRequestException("Progress must be between 0 and 100.");
        var trial = await Workspace(true); var attempt = await OwnCompletedAttempt(trial);
        var path = Read<TrialLearningPathDto>(attempt.PathJson!);
        var item = path.Items.SingleOrDefault(x => x.Id == itemId) ?? throw new NotFoundException("Learning item not found in your path.");
        if (item.Status == "not_started") throw new ConflictException("Start the learning item before saving progress.");
        var percent = Math.Max(request.Percent, item.ProgressPercent);
        path = path with { Items = path.Items.Select(x => x.Id == itemId ? x with { ProgressPercent = percent, Status = percent == 100 ? "completed" : "in_progress" } : x).ToArray() };
        path = path with { Items = path.Items.Select(x => x with { AllowedToStart = x.Prerequisites.All(id => path.Items.Any(prerequisite => prerequisite.Id == id && prerequisite.Status == "completed")) }).ToArray() };
        attempt.PathJson = Json(path); await Save(trial);
        return path;
    }

    public async Task<TrialLearningContentDto> ContentAsync(string itemId)
    {
        var trial = await Workspace(); var attempt = await OwnCompletedAttempt(trial);
        var item = Read<TrialLearningPathDto>(attempt.PathJson!).Items.SingleOrDefault(x => x.Id == itemId)
            ?? throw new NotFoundException("Learning item not found in your path.");
        if (item.Status == "not_started") throw new ForbiddenException("Start this learning item first.");
        var content = Read<TrialBundle>(attempt.BundleJson).Content.SingleOrDefault(x => x.Id == itemId && x.Version == item.Version && x.Published)
            ?? throw new NotFoundException("Published learning content unavailable.");
        return new(content.Id, content.Title, content.Version, content.Body);
    }

    private async Task<PositionDiagnosticAttempt> OwnAttempt(TrialWorkspace trial, Guid id)
    {
        var employee = await Self(trial);
        return await db.PositionDiagnosticAttempts.SingleOrDefaultAsync(x => x.Id == id && x.OrganizationId == trial.OrganizationId && x.EmployeeId == employee.Id)
            ?? throw new NotFoundException("Diagnostic not found in your trial account.");
    }
    private async Task<PositionDiagnosticAttempt> OwnCompletedAttempt(TrialWorkspace trial)
    {
        var employee = await Self(trial);
        return await db.PositionDiagnosticAttempts.SingleOrDefaultAsync(x => x.OrganizationId == trial.OrganizationId && x.EmployeeId == employee.Id && x.PathJson != null)
            ?? throw new ConflictException("Submit your diagnostic before accessing a learning path.");
    }
    private static TrialDiagnosticDto Diagnostic(PositionDiagnosticAttempt attempt)
    {
        var bundle = Read<TrialBundle>(attempt.BundleJson);
        return new(attempt.Id, attempt.SubmittedAt == null ? "in_progress" : "submitted", attempt.EmployeeId, attempt.PositionId,
            bundle.Name, bundle.RequirementVersion, bundle.AssessmentVersion, bundle.RubricVersion, attempt.AnswerRevision,
            bundle.Questions.Select(x => new TrialQuestionDto(x.Id, x.CompetencyId, x.Text, x.Options)).ToArray(),
            Read<TrialAnswerDto[]>(attempt.AnswersJson), attempt.StartedAt, attempt.SubmittedAt);
    }
}
