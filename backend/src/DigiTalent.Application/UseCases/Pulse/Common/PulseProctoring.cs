using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Me;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Constants.Authorization;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// Phiên làm bài có giám sát của nhân viên đang đăng nhập (docs/specs/2026-10-16-pulse-employee-roadmap-proctoring.md):
/// tìm phiên đang ghi của chính mình, và đóng phiên khi nộp bài (kiểm tra đã có bản ghi màn hình và camera).
/// </summary>
public class PulseProctoring
{
    public const string SessionClosed = "PROCTORING_SESSION_CLOSED";
    public const string SessionMismatch = "PROCTORING_SESSION_MISMATCH";
    public const string RecordingMissing = "PROCTORING_RECORDING_MISSING";

    private readonly IApplicationDbContext _context;
    private readonly MyEmployeeContext _me;
    private readonly TimeProvider _clock;

    public PulseProctoring(IApplicationDbContext context, MyEmployeeContext me, TimeProvider clock)
    {
        _context = context;
        _me = me;
        _clock = clock;
    }

    public DateTimeOffset Now => _clock.GetUtcNow();

    /// <summary>
    /// Phiên (được theo dõi) của chính nhân viên và còn đang ghi; của người khác → 404, đã đóng → 400 PROCTORING_SESSION_CLOSED
    /// (mã riêng để trình duyệt ngừng tải lên ngay thay vì thử lại như với 409).
    /// </summary>
    public async Task<ProctoringSession> LoadOwnOpenAsync(Guid sessionId)
    {
        var employee = await _me.GetAsync();
        var session = await _context.ProctoringSessions.FirstOrDefaultAsync(s => s.Id == sessionId && s.EmployeeId == employee.Id)
                      ?? throw new NotFoundException("Không tìm thấy phiên làm bài.");
        if (session.Status != Statuses.ProctoringSession.Recording)
        {
            throw new BadRequestException("Phiên làm bài đã kết thúc. Hãy bắt đầu lại bài làm.", "sessionId", SessionClosed);
        }

        return session;
    }

    /// <summary>
    /// Đóng phiên khi nộp bài: đúng nhân viên, đúng loại bài, đúng khóa (null = bài dùng thử), còn đang ghi và đã có bản ghi toàn bộ màn hình
    /// lẫn camera. Đánh dấu SUBMITTED, khép các đoạn ghi còn mở và ghi sự kiện nộp bài. Không lưu — người gọi lưu cùng bài nộp.
    /// </summary>
    public async Task<ProctoringSession> CloseForSubmitAsync(Guid sessionId, Guid employeeId, string kind, Guid? courseId, DateTimeOffset now)
    {
        var session = await _context.ProctoringSessions.FirstOrDefaultAsync(s => s.Id == sessionId && s.EmployeeId == employeeId)
                      ?? throw new BadRequestException("Không tìm thấy phiên làm bài có giám sát của bạn.", "proctoringSessionId", SessionMismatch);
        if (session.Kind != kind || session.CourseId != courseId)
        {
            throw new BadRequestException("Phiên làm bài không thuộc bài này. Hãy làm lại từ trang bài làm.", "proctoringSessionId", SessionMismatch);
        }

        if (session.Status != Statuses.ProctoringSession.Recording)
        {
            throw new ConflictException("Phiên làm bài đã kết thúc. Hãy bắt đầu lại bài làm.");
        }

        var recordings = await _context.ProctoringRecordings.Where(r => r.SessionId == session.Id).ToListAsync();
        var hasScreen = recordings.Any(r => r.Track == Statuses.ProctoringTrack.Screen && r.SizeBytes > 0);
        var hasCamera = recordings.Any(r => r.Track == Statuses.ProctoringTrack.Camera && r.SizeBytes > 0);
        if (!hasScreen || !hasCamera)
        {
            throw new BadRequestException(
                "Chưa nhận được bản ghi toàn bộ màn hình và camera của bài làm. Hãy giữ chia sẻ màn hình, camera và micro rồi nộp lại.",
                "proctoringSessionId",
                RecordingMissing);
        }

        var duration = Math.Max(0L, (long)(now - session.StartedAt).TotalMilliseconds);
        session.Status = Statuses.ProctoringSession.Submitted;
        session.EndedAt = now;
        session.DurationMs = duration;
        foreach (var recording in recordings.Where(r => r.EndOffsetMs == null))
        {
            recording.EndOffsetMs = Math.Max(recording.StartOffsetMs, duration);
        }

        _context.ProctoringEvents.Add(new ProctoringEvent
        {
            SessionId = session.Id,
            Kind = Statuses.ProctoringEvent.Submitted,
            OffsetMs = duration,
            OccurredAt = now,
        });
        return session;
    }

    /// <summary>Bỏ các phiên còn đang ghi của cùng bài (mở bài làm lần nữa ở tab khác, tải lại trang…).</summary>
    public async Task AbandonOpenAsync(Guid employeeId, Guid? courseId, string kind, DateTimeOffset now)
    {
        var open = await _context.ProctoringSessions
            .Where(s => s.EmployeeId == employeeId && s.CourseId == courseId && s.Kind == kind && s.Status == Statuses.ProctoringSession.Recording)
            .ToListAsync();
        foreach (var session in open)
        {
            session.Status = Statuses.ProctoringSession.Abandoned;
            session.EndedAt = now < session.StartedAt ? session.StartedAt : now;
            session.DurationMs = Math.Max(0L, (long)(session.EndedAt.Value - session.StartedAt).TotalMilliseconds);
        }
    }
}

/// <summary>
/// Người nhận thông báo khi nhân viên nộp bài: quản lý phòng ban, hoặc chủ doanh nghiệp khi nhân viên là quản lý; doanh
/// nghiệp dùng thử → mentor được phân công (chưa phân công → không ai).
/// </summary>
public static class PulseReviewers
{
    public static async Task<List<Guid>> UserIdsAsync(IApplicationDbContext context, Employee employee)
    {
        var trial = await context.TrialWorkspaces.AsNoTracking()
            .Where(t => t.OrganizationId == employee.OrganizationId && t.ConvertedAt == null)
            .Select(t => new { t.MentorUserId })
            .FirstOrDefaultAsync();
        if (trial != null)
        {
            return trial.MentorUserId is { } mentor ? new List<Guid> { mentor } : new List<Guid>();
        }

        var manager = await (
                from department in context.Departments.AsNoTracking()
                join head in context.Employees.AsNoTracking() on department.ManagerEmployeeId equals head.Id
                where department.Id == employee.DepartmentId && head.Id != employee.Id && head.UserId != null
                select head.UserId)
            .FirstOrDefaultAsync();
        if (manager is { } managerUserId && managerUserId != employee.UserId)
        {
            return new List<Guid> { managerUserId };
        }

        return await (
                from userRole in context.UserRoles.AsNoTracking()
                join role in context.Roles.AsNoTracking() on userRole.RoleId equals role.Id
                join user in context.Users.AsNoTracking() on userRole.UserId equals user.Id
                where role.Code == Roles.Owner && user.OrganizationId == employee.OrganizationId && user.Id != employee.UserId
                select user.Id)
            .Distinct()
            .ToListAsync();
    }
}

/// <summary>Một đoạn ghi trên dòng thời gian của phiên, kèm link đã ký để phát.</summary>
public class PulseRecordingSegmentDto
{
    public Guid RecordingId { get; set; }
    /// <summary>SCREEN | CAMERA.</summary>
    public string Track { get; set; } = string.Empty;
    public int SegmentNo { get; set; }
    public string ContentType { get; set; } = string.Empty;
    public string? DisplaySurface { get; set; }
    public long StartOffsetMs { get; set; }
    public long? EndOffsetMs { get; set; }
    public long SizeBytes { get; set; }
    /// <summary>Đường dẫn tương đối với gốc API (api/v1/), có hạn — chỉ có khi đoạn đã có dữ liệu.</summary>
    public string? ContentPath { get; set; }
}

public class PulseProctoringEventDto
{
    public string Kind { get; set; } = string.Empty;
    public long OffsetMs { get; set; }
    public long? DurationMs { get; set; }
    public string? Detail { get; set; }
    /// <summary>Sự kiện người chấm cần xem (rời bài làm hoặc mất một nguồn ghi).</summary>
    public bool Flagged { get; set; }
}

/// <summary>Bản ghi của một phiên làm bài có giám sát cho người chấm.</summary>
public class PulseRecordingDto
{
    public Guid SessionId { get; set; }
    public string Kind { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset? EndedAt { get; set; }
    public long? DurationMs { get; set; }
    public int FlaggedCount { get; set; }
    /// <summary>Điểm rủi ro gian lận và các điểm đáng ngờ tổng hợp từ nhật ký (<see cref="PulseProctoringRisk"/>).</summary>
    public PulseProctoringRiskDto Risk { get; set; } = new();
    public List<PulseRecordingSegmentDto> Segments { get; set; } = new();
    public List<PulseProctoringEventDto> Events { get; set; } = new();
}

/// <summary>Đọc bản ghi (đoạn ghi + nhật ký) của các phiên cho trang chấm bài, kèm link đã ký tới từng tệp.</summary>
public class PulseRecordingReader
{
    private readonly IApplicationDbContext _context;
    private readonly IProctoringRecordingUrlSigner _signer;

    public PulseRecordingReader(IApplicationDbContext context, IProctoringRecordingUrlSigner signer)
    {
        _context = context;
        _signer = signer;
    }

    public async Task<Dictionary<Guid, PulseRecordingDto>> LoadAsync(IReadOnlyCollection<Guid> sessionIds)
    {
        var ids = sessionIds.Distinct().ToList();
        if (ids.Count == 0)
        {
            return new Dictionary<Guid, PulseRecordingDto>();
        }

        var sessions = await _context.ProctoringSessions.AsNoTracking().Where(s => ids.Contains(s.Id)).ToListAsync();
        var recordings = await _context.ProctoringRecordings.AsNoTracking()
            .Where(r => ids.Contains(r.SessionId))
            .OrderBy(r => r.Track).ThenBy(r => r.SegmentNo)
            .ToListAsync();
        var events = await _context.ProctoringEvents.AsNoTracking()
            .Where(e => ids.Contains(e.SessionId))
            .OrderBy(e => e.OffsetMs).ThenBy(e => e.CreatedAt)
            .ToListAsync();

        return sessions.ToDictionary(s => s.Id, s =>
        {
            var sessionEvents = events.Where(e => e.SessionId == s.Id).Select(e => new PulseProctoringEventDto
            {
                Kind = e.Kind,
                OffsetMs = e.OffsetMs,
                DurationMs = e.DurationMs,
                Detail = e.Detail,
                Flagged = Statuses.ProctoringEvent.Flagged.Contains(e.Kind),
            }).ToList();
            var sessionEnd = s.DurationMs ?? recordings.Where(r => r.SessionId == s.Id).Select(r => r.EndOffsetMs ?? r.StartOffsetMs).DefaultIfEmpty(0).Max();
            return new PulseRecordingDto
            {
                SessionId = s.Id,
                Kind = s.Kind,
                Status = s.Status,
                StartedAt = s.StartedAt,
                EndedAt = s.EndedAt,
                DurationMs = s.DurationMs,
                FlaggedCount = sessionEvents.Count(e => e.Flagged),
                Risk = PulseProctoringRisk.Analyze(sessionEvents, sessionEnd),
                Segments = recordings.Where(r => r.SessionId == s.Id).Select(r => new PulseRecordingSegmentDto
                {
                    RecordingId = r.Id,
                    Track = r.Track,
                    SegmentNo = r.SegmentNo,
                    ContentType = r.ContentType,
                    DisplaySurface = r.DisplaySurface,
                    StartOffsetMs = r.StartOffsetMs,
                    EndOffsetMs = r.EndOffsetMs,
                    SizeBytes = r.SizeBytes,
                    ContentPath = r.StoragePath != null && r.SizeBytes > 0 ? _signer.ContentPath(r.Id) : null,
                }).ToList(),
                Events = sessionEvents,
            };
        });
    }
}
