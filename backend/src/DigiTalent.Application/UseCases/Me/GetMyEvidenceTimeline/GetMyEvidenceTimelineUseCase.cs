using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Me;

/// <summary>
/// EM-04 — Dòng thời gian minh chứng: mọi bài nộp nhiệm vụ thực tế (mọi phiên bản, kèm phản hồi chấm)
/// + minh chứng năng lực đã ghi nhận (competency_evidences), mới nhất trước.
/// </summary>
public class GetMyEvidenceTimelineUseCase : IUseCase<GetMyEvidenceTimelineUseCaseInput, GetMyEvidenceTimelineUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly MyEmployeeContext _me;
    private readonly MyTaskReader _taskReader;

    public GetMyEvidenceTimelineUseCase(IApplicationDbContext context, MyEmployeeContext me, MyTaskReader taskReader)
    {
        _context = context;
        _me = me;
        _taskReader = taskReader;
    }

    public async Task<GetMyEvidenceTimelineUseCaseOutput> ExecuteAsync(GetMyEvidenceTimelineUseCaseInput input)
    {
        var employee = await _me.GetAsync();
        var items = new List<MyEvidenceItemDto>();

        foreach (var task in await _taskReader.LoadAsync(employee.Id))
        {
            var competencies = task.Targets.Select(t => new MyCompetencyRefDto
            {
                CompetencyId = t.CompetencyId,
                Code = t.Code,
                Name = t.Name,
                TargetLevel = t.TargetLevel,
            }).ToList();

            items.AddRange(task.Submissions.Select(submission => new MyEvidenceItemDto
            {
                Id = submission.Id,
                Kind = "TASK_SUBMISSION",
                OccurredAt = submission.Evaluation?.EvaluatedAt ?? submission.SubmittedAt,
                Title = task.Assignment.TitleSnapshot,
                Status = MyTaskSubmissionDto.DisplayStatus(submission) switch
                {
                    "PENDING_REVIEW" => "PENDING",
                    var status => status,
                },
                Description = submission.Note,
                AssignmentId = task.Assignment.Id,
                VersionNo = submission.VersionNo,
                Links = submission.Links.ToList(),
                Files = submission.Files.Select(MyTaskFileDto.From).ToList(),
                Evaluation = MyTaskEvaluationDto.From(submission.Evaluation),
                Score = submission.Evaluation?.Score,
                Competencies = competencies,
            }));
        }

        var evidences = await (
                from evidence in _context.CompetencyEvidences.AsNoTracking()
                join competency in _context.Competencies.AsNoTracking() on evidence.CompetencyId equals competency.Id
                where evidence.EmployeeId == employee.Id
                select new
                {
                    EvidenceId = evidence.Id,
                    evidence.SourceType,
                    evidence.Status,
                    evidence.ConfirmedLevel,
                    evidence.Score,
                    evidence.ReviewNote,
                    evidence.ConfirmedAt,
                    evidence.CreatedAt,
                    ConfirmedByName = _context.Users.Where(u => u.Id == evidence.ConfirmedByUserId).Select(u => u.DisplayName).FirstOrDefault(),
                    CompetencyCode = competency.Code,
                    CompetencyName = competency.Name,
                    CompetencyId = competency.Id,
                })
            .ToListAsync();

        items.AddRange(evidences.Select(e => new MyEvidenceItemDto
        {
            Id = e.EvidenceId,
            Kind = "COMPETENCY_EVIDENCE",
            OccurredAt = e.ConfirmedAt ?? e.CreatedAt,
            Title = $"{e.CompetencyCode} {e.CompetencyName}",
            Status = e.Status switch
            {
                Statuses.EvidenceStatus.Confirmed => "APPROVED",
                Statuses.EvidenceStatus.Rejected => "REJECTED",
                Statuses.EvidenceStatus.Superseded => "SUPERSEDED",
                _ => "PENDING",
            },
            Description = e.ReviewNote,
            SourceType = e.SourceType,
            ConfirmedLevel = e.ConfirmedLevel,
            Score = e.Score,
            ConfirmedByName = e.ConfirmedByName,
            Competencies = new List<MyCompetencyRefDto>
            {
                new() { CompetencyId = e.CompetencyId, Code = e.CompetencyCode, Name = e.CompetencyName, TargetLevel = e.ConfirmedLevel ?? 0 },
            },
        }));

        var ordered = items.OrderByDescending(i => i.OccurredAt).ToList();
        return new GetMyEvidenceTimelineUseCaseOutput
        {
            Items = ordered,
            Counts = new MyEvidenceCountsDto
            {
                Total = ordered.Count,
                Approved = ordered.Count(i => i.Status == "APPROVED"),
                Pending = ordered.Count(i => i.Status == "PENDING"),
                NeedsRevision = ordered.Count(i => i.Status == "NEEDS_REVISION"),
                Rejected = ordered.Count(i => i.Status == "REJECTED"),
            },
        };
    }
}
