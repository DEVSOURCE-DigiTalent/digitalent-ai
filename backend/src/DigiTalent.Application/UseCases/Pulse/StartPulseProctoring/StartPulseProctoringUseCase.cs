using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// POST /me/pulse/courses/{courseId}/proctoring — bắt đầu một phiên làm bài có giám sát (đánh giá trước khi học hoặc
/// bài cuối khóa) khi bài đang mở cho nhân viên. Phiên cũ còn đang ghi của cùng bài bị bỏ. Trình duyệt sau đó mở các đoạn
/// ghi (toàn bộ màn hình, camera kèm micro), tải từng mẩu lên và gửi nhật ký giám sát.
/// </summary>
public class StartPulseProctoringUseCase : IUseCase<StartPulseProctoringUseCaseInput, StartPulseProctoringUseCaseOutput>
{
    public const string NotOpen = "ASSESSMENT_NOT_OPEN";

    private readonly IApplicationDbContext _context;
    private readonly PulseCourseWorkspace _workspace;
    private readonly PulseProctoring _proctoring;

    public StartPulseProctoringUseCase(IApplicationDbContext context, PulseCourseWorkspace workspace, PulseProctoring proctoring)
    {
        _context = context;
        _workspace = workspace;
        _proctoring = proctoring;
    }

    public async Task<StartPulseProctoringUseCaseOutput> ExecuteAsync(StartPulseProctoringUseCaseInput input)
    {
        var (snapshot, state) = await _workspace.ResolveAsync(input.CourseId);
        Guid courseId;
        if (input.Kind == Statuses.ProctoringKind.PreAssessment)
        {
            if (!state.CanStartPreAssessment)
            {
                throw new BadRequestException(PulseCourseWorkspace.PreAssessmentClosedMessage(state), "kind", NotOpen);
            }

            courseId = state.Course.CourseId;
        }
        else
        {
            PulseCourseWorkspace.EnsureCanWork(state);
            if (!state.CanStartFinal)
            {
                throw new BadRequestException(PulseCourseWorkspace.FinalClosedMessage(state), "kind", NotOpen);
            }

            courseId = state.Enrollment!.CourseId;
        }

        var now = _proctoring.Now;
        await _proctoring.AbandonOpenAsync(snapshot.Employee.Id, courseId, input.Kind, now);
        var session = new ProctoringSession
        {
            EmployeeId = snapshot.Employee.Id,
            CourseId = courseId,
            Kind = input.Kind,
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

        return new StartPulseProctoringUseCaseOutput
        {
            SessionId = session.Id,
            Kind = session.Kind,
            StartedAt = now,
            MaxChunkBytes = PulseRules.MaxRecordingChunkBytes,
        };
    }
}
