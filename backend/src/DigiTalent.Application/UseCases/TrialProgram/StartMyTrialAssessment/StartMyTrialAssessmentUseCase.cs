using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Me;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>
/// POST /me/trial-assessment/proctoring — mở phiên làm bài có giám sát (TRIAL_ASSESSMENT, không gắn khóa) cho bài đánh giá
/// tổng hợp. Phiên cũ còn đang ghi bị bỏ. Trình duyệt sau đó tải bản ghi màn hình, camera, micro và nhật ký lên các endpoint
/// /me/pulse/proctoring/{sessionId}/… như bài làm Pulse.
/// </summary>
public class StartMyTrialAssessmentUseCase : IUseCase<StartMyTrialAssessmentUseCaseInput, StartMyTrialAssessmentUseCaseOutput>
{
    public const string NotOpen = "TRIAL_ASSESSMENT_NOT_OPEN";
    public const string PaperEmpty = "TRIAL_PAPER_EMPTY";

    private readonly IApplicationDbContext _context;
    private readonly MyEmployeeContext _me;
    private readonly TrialProgramReader _reader;
    private readonly TrialAssessmentPaper _paper;
    private readonly PulseProctoring _proctoring;

    public StartMyTrialAssessmentUseCase(
        IApplicationDbContext context, MyEmployeeContext me, TrialProgramReader reader, TrialAssessmentPaper paper, PulseProctoring proctoring)
    {
        _context = context;
        _me = me;
        _reader = reader;
        _paper = paper;
        _proctoring = proctoring;
    }

    public async Task<StartMyTrialAssessmentUseCaseOutput> ExecuteAsync(StartMyTrialAssessmentUseCaseInput input)
    {
        var employee = await _me.GetAsync();
        var trial = await _reader.ForEmployeeAsync(employee);
        var now = _reader.Now;
        var assessment = await _context.TrialAssessments.AsNoTracking().FirstOrDefaultAsync(a => a.EmployeeId == employee.Id);
        if (TrialProgramReader.ClosedReason(trial, assessment, now) is { } reason)
        {
            throw new BadRequestException(reason, "session", NotOpen);
        }

        var paper = await _paper.BuildAsync(trial.OrganizationId, employee.Id);
        if (paper.Items.Count == 0)
        {
            throw new BadRequestException("Đề đánh giá chưa sẵn sàng. Hãy báo cho chủ doanh nghiệp.", "session", PaperEmpty);
        }

        await _proctoring.AbandonOpenAsync(employee.Id, null, Statuses.ProctoringKind.TrialAssessment, now);
        var session = new ProctoringSession
        {
            EmployeeId = employee.Id,
            CourseId = null,
            Kind = Statuses.ProctoringKind.TrialAssessment,
            Status = Statuses.ProctoringSession.Recording,
            StartedAt = now,
        };
        _context.ProctoringSessions.Add(session);
        _context.ProctoringEvents.Add(new ProctoringEvent
        {
            SessionId = session.Id,
            Kind = Statuses.ProctoringEvent.Started,
            OffsetMs = 0,
            OccurredAt = now,
        });
        await _context.SaveChangesAsync();

        return new StartMyTrialAssessmentUseCaseOutput
        {
            SessionId = session.Id,
            Kind = session.Kind,
            StartedAt = now,
            MaxChunkBytes = PulseRules.MaxRecordingChunkBytes,
            Questions = TrialAssessmentPaper.ToDto(paper),
            Essays = TrialProgramRules.Essays.ToList(),
        };
    }
}
