using System.Text.Json;
using DigiTalent.Application.Common;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Learning.CourseUpdates;

/// <summary>
/// What employees keep when a course gets new content in their company — a DigiTalent version applied to it, or the
/// company's R&amp;D applying (or removing) its own content. The new revision is what everyone starts from now on; for the
/// enrollments on the old content:
///   - finished (COMPLETED): a minor change (default) keeps them — the level and certificate the course gave still count;
///     a major change (<c>relearnFinished</c>: the old content is wrong now) cancels them at once — they learn the course
///     again for a new certificate, the old certificate stays (the other courses, e.g. higher levels, are untouched);
///   - not started: cancelled, the next start opens the new content;
///   - in progress: the decider picks the day the content switches for them (<see cref="GraceDayChoices"/>: 0 = at once,
///     or 7 / 14 / 30 days during which they may finish the old content and keep the result; reminders 7 days and 1 day
///     before, <see cref="ProcessGraceAsync"/> runs hourly). On that day a minor change moves them to the new content with
///     their progress (pages read and review quizzes passed carry over by position); a major change makes them start again
///     (the enrollment is cancelled, kept as history; a final waiting for a mentor leaves the queue).
/// Every active employee gets one notification per apply that lists the courses by what it means for them. Changes are
/// tracked; the caller saves. The grace of a course lives in system_settings <c>course.grace.{code}</c> (no new table).
/// </summary>
public static class CourseRelearn
{
    /// <summary>The employee was moved to the new content (at once or when the grace ended): learn again from the start.</summary>
    public const string NotificationType = "COURSE_RELEARN";
    public const string UpdatedNotificationType = "COURSE_CONTENT_UPDATED";
    public const string ReminderNotificationType = "COURSE_GRACE_REMINDER";
    public const int DefaultGraceDays = 30;
    public static readonly IReadOnlyList<int> GraceDayChoices = new[] { 0, 7, 14, 30 };
    public const string GracePrefix = "course.grace.";

    /// <summary>An exam started less than this long ago is not interrupted when the grace ends; the next run moves it.</summary>
    private static readonly TimeSpan OpenExamWindow = TimeSpan.FromHours(4);
    private static readonly TimeSpan VietnamOffset = TimeSpan.FromHours(7);
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public sealed record Result(int InProgress, int Kept, DateTimeOffset? SwitchAt);

    /// <param name="Major">A major change: whoever has not finished starts again; else they keep their progress.</param>
    public sealed record GraceState(DateTimeOffset SwitchAt, bool Reminded7, bool Reminded1, bool Major = false);

    public static void EnsureGraceDays(int graceDays)
    {
        if (!GraceDayChoices.Contains(graceDays))
            throw new BadRequestException("Chọn áp dụng ngay hoặc cho 7, 14, 30 ngày để học xong bản cũ.", "graceDays", "INVALID_GRACE_DAYS");
    }

    public static async Task<Result> ApplyAsync(IApplicationDbContext context, Guid organizationId, IReadOnlyCollection<string> courseCodes,
        int graceDays, DateTimeOffset now, bool relearnFinished = false)
    {
        EnsureGraceDays(graceDays);
        var canonical = courseCodes.Select(CourseCodes.Canonical).Distinct(StringComparer.OrdinalIgnoreCase).ToList();
        if (canonical.Count == 0) return new Result(0, 0, null);
        var aliases = courseCodes.SelectMany(CourseCodes.Aliases).Distinct(StringComparer.OrdinalIgnoreCase).ToList();
        DateTimeOffset? switchAt = graceDays > 0 ? now.AddDays(graceDays) : null;

        // Every enrollment that exists now is on the old content (the new revision is being written in this unit of work).
        var rows = await (
                from enrollment in context.Enrollments
                join course in context.Courses on enrollment.CourseId equals course.Id
                where course.OrganizationId == organizationId && aliases.Contains(course.Code)
                      && enrollment.Status != Statuses.Enrollment.Cancelled
                select new { Enrollment = enrollment, course.Code })
            .ToListAsync();

        var waiting = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var moving = new List<Enrollment>();
        var byEmployee = new Dictionary<Guid, Dictionary<string, string>>();
        void Mark(Guid employeeId, string code, string what)
        {
            if (!byEmployee.TryGetValue(employeeId, out var courses)) byEmployee[employeeId] = courses = new(StringComparer.OrdinalIgnoreCase);
            // One line per course: an older finished enrollment does not hide one in progress.
            if (!courses.TryGetValue(code, out var current) || Rank(what) > Rank(current)) courses[code] = what;
        }

        foreach (var row in rows)
        {
            var code = CourseCodes.Canonical(row.Code);
            var status = row.Enrollment.Status;
            if (status == Statuses.Enrollment.Completed && relearnFinished)
            {
                row.Enrollment.Status = Statuses.Enrollment.Cancelled;
                Mark(row.Enrollment.EmployeeId, code, Renew);
            }
            else if (status == Statuses.Enrollment.Completed)
            {
                Mark(row.Enrollment.EmployeeId, code, Kept);
            }
            else if (status == Statuses.Enrollment.NotStarted)
            {
                row.Enrollment.Status = Statuses.Enrollment.Cancelled;
                Mark(row.Enrollment.EmployeeId, code, Fresh);
            }
            else if (switchAt is null && relearnFinished)
            {
                row.Enrollment.Status = Statuses.Enrollment.Cancelled;
                Mark(row.Enrollment.EmployeeId, code, Relearn);
            }
            else if (switchAt is null)
            {
                moving.Add(row.Enrollment);
                Mark(row.Enrollment.EmployeeId, code, Moved);
            }
            else
            {
                waiting.Add(code);
                Mark(row.Enrollment.EmployeeId, code, Grace);
            }
        }

        if (moving.Count > 0)
        {
            // The new revision must be saved to carry the progress onto its modules and pages.
            await context.SaveChangesAsync();
            await MoveKeepingProgressAsync(context, moving, now);
        }

        // The grace of each course: written when someone is still learning the old content, cleared otherwise (a new
        // decision replaces an older grace — "at once" ends it for everybody).
        var keys = canonical.Select(code => GracePrefix + code).ToList();
        var settings = await context.SystemSettings
            .Where(s => s.OrganizationId == organizationId && keys.Contains(s.Key)).ToListAsync();
        foreach (var code in canonical)
        {
            var setting = settings.FirstOrDefault(s => s.Key == GracePrefix + code);
            if (switchAt is { } at && waiting.Contains(code))
            {
                if (setting == null)
                {
                    setting = new SystemSetting { OrganizationId = organizationId, Key = GracePrefix + code };
                    context.SystemSettings.Add(setting);
                }
                // A grace of a week or less: the apply notification already says it, only the last-day reminder is left.
                setting.Value = JsonSerializer.Serialize(new GraceState(at, Reminded7: graceDays <= 7, Reminded1: false, Major: relearnFinished), JsonOptions);
                setting.Description = "Hạn học xong nội dung cũ của khóa trước khi chuyển sang nội dung mới.";
            }
            else if (setting != null)
            {
                context.SystemSettings.Remove(setting);
            }
        }

        // Employees without an enrollment hear about a course they can learn: Basic, or bought by the company.
        var employees = await context.Employees.AsNoTracking()
            .Where(e => e.OrganizationId == organizationId && e.Status == Statuses.Employee.Active && e.UserId != null)
            .Select(e => new { e.Id, UserId = e.UserId!.Value }).ToListAsync();
        var purchased = await CourseOwnership.PurchasedCodesAsync(context, organizationId);
        var open = canonical.Where(code => !CourseOwnership.IsPaid(code) || purchased.Contains(code)).ToList();
        foreach (var employee in employees)
            foreach (var code in open)
                Mark(employee.Id, code, Fresh);

        // One general notice, the same for everyone concerned (no per-person lines).
        var titles = await TitlesAsync(context, organizationId, aliases);
        var title = $"Cập nhật {(relearnFinished ? "lớn" : "nhỏ")} {canonical.Count} khóa học";
        var message = ApplyMessage(canonical, titles, now, graceDays > 0 ? now.AddDays(graceDays) : null, relearnFinished);
        foreach (var employee in employees)
        {
            if (!byEmployee.TryGetValue(employee.Id, out var courses) || courses.Count == 0) continue;
            context.Notifications.Add(new Notification
            {
                RecipientUserId = employee.UserId,
                Type = relearnFinished ? NotificationType : UpdatedNotificationType,
                Title = title,
                Message = message,
                RelatedEntityType = "courses",
            });
        }

        return new Result(
            rows.Count(r => r.Enrollment.Status != Statuses.Enrollment.Completed && waiting.Contains(CourseCodes.Canonical(r.Code))),
            rows.Count(r => r.Enrollment.Status == Statuses.Enrollment.Completed),
            waiting.Count > 0 ? switchAt : null);
    }

    /// <summary>Grace end per course code of an organization (courses whose old content is still learned).</summary>
    public static async Task<Dictionary<string, DateTimeOffset>> GraceEndsAsync(IApplicationDbContext context, Guid organizationId) =>
        (await GracesAsync(context, organizationId)).ToDictionary(g => g.Key, g => g.Value.SwitchAt, StringComparer.OrdinalIgnoreCase);

    /// <summary>The grace of every course of an organization whose old content is still learned, by course code.</summary>
    public static async Task<Dictionary<string, GraceState>> GracesAsync(IApplicationDbContext context, Guid organizationId)
    {
        var settings = await context.SystemSettings.AsNoTracking()
            .Where(s => s.OrganizationId == organizationId && s.Key.StartsWith(GracePrefix))
            .Select(s => new { s.Key, s.Value }).ToListAsync();
        var graces = new Dictionary<string, GraceState>(StringComparer.OrdinalIgnoreCase);
        foreach (var setting in settings)
            if (Read(setting.Value) is { } state)
                graces[setting.Key[GracePrefix.Length..]] = state;
        return graces;
    }

    /// <summary>
    /// Hourly: reminds the employees still on the old content 7 days and 1 day before the switch, and moves them to the new
    /// content once the grace is over — except an exam in progress or a final waiting for its reviewer, moved on a later run.
    /// </summary>
    public static async Task<int> ProcessGraceAsync(IApplicationDbContext context, DateTimeOffset now)
    {
        var settings = await context.SystemSettings
            .Where(s => s.OrganizationId != null && s.Key.StartsWith(GracePrefix)).ToListAsync();
        var handled = 0;
        foreach (var setting in settings)
        {
            var organizationId = setting.OrganizationId!.Value;
            var code = setting.Key[GracePrefix.Length..];
            var state = Read(setting.Value);
            var aliases = CourseCodes.Aliases(code).ToList();
            var revisions = await context.Courses.AsNoTracking()
                .Where(c => c.OrganizationId == organizationId && aliases.Contains(c.Code))
                .Select(c => new { c.Id, c.VersionNo, c.Title }).ToListAsync();
            if (state == null || revisions.Count == 0)
            {
                context.SystemSettings.Remove(setting);
                await context.SaveChangesAsync();
                continue;
            }

            var newest = revisions.MaxBy(r => r.VersionNo)!;
            var oldIds = revisions.Where(r => r.Id != newest.Id).Select(r => r.Id).ToList();
            var learning = await context.Enrollments
                .Where(e => oldIds.Contains(e.CourseId) && e.Status != Statuses.Enrollment.Cancelled
                            && e.Status != Statuses.Enrollment.Completed)
                .ToListAsync();
            if (learning.Count == 0)
            {
                context.SystemSettings.Remove(setting);
                await context.SaveChangesAsync();
                continue;
            }

            var users = await UsersAsync(context, learning.Select(e => e.EmployeeId).Distinct().ToList());
            var date = Day(state.SwitchAt);
            if (now >= state.SwitchAt)
            {
                var ids = learning.Select(e => e.Id).ToList();
                var reviewing = await context.CourseFinalSubmissions.AsNoTracking()
                    .Where(s => ids.Contains(s.EnrollmentId) && s.Decision == null).Select(s => s.EnrollmentId).ToListAsync();
                var examSince = now - OpenExamWindow;
                var examining = await context.ProctoringSessions.AsNoTracking()
                    .Where(s => s.CourseId != null && oldIds.Contains(s.CourseId.Value) && s.Status == Statuses.ProctoringSession.Recording
                                && s.StartedAt > examSince)
                    .Select(s => new { s.EmployeeId, CourseId = s.CourseId!.Value }).ToListAsync();
                var due = learning.Where(enrollment => !reviewing.Contains(enrollment.Id)
                    && !examining.Any(x => x.EmployeeId == enrollment.EmployeeId && x.CourseId == enrollment.CourseId)).ToList();
                if (state.Major)
                    foreach (var enrollment in due) enrollment.Status = Statuses.Enrollment.Cancelled;
                else
                    await MoveKeepingProgressAsync(context, due, now);
                var moved = due.Count;
                foreach (var enrollment in due)
                {
                    if (!users.TryGetValue(enrollment.EmployeeId, out var userId)) continue;
                    context.Notifications.Add(new Notification
                    {
                        RecipientUserId = userId,
                        Type = state.Major ? NotificationType : UpdatedNotificationType,
                        Title = "Khóa học đã chuyển sang nội dung mới",
                        Message = state.Major
                            ? $"Khóa {newest.Title} đã chuyển sang nội dung mới ngày {date}. Bạn học lại từ đầu nội dung mới; chứng nhận đã nhận vẫn được giữ."
                            : $"Khóa {newest.Title} đã chuyển sang nội dung mới ngày {date}. Tiến trình của bạn được giữ, bạn học tiếp từ chỗ đang học.",
                        RelatedEntityType = "courses",
                        RelatedEntityId = newest.Id,
                    });
                }
                if (moved == learning.Count) context.SystemSettings.Remove(setting);
                handled += moved;
            }
            else
            {
                var left = state.SwitchAt - now;
                var remind1 = left <= TimeSpan.FromDays(1) && !state.Reminded1;
                var remind7 = !remind1 && left <= TimeSpan.FromDays(7) && !state.Reminded7;
                if (!remind1 && !remind7) continue;
                var days = Math.Max(1, (int)Math.Ceiling(left.TotalDays));
                foreach (var userId in learning.Select(e => e.EmployeeId).Distinct()
                             .Where(users.ContainsKey).Select(id => users[id]))
                    context.Notifications.Add(new Notification
                    {
                        RecipientUserId = userId,
                        Type = ReminderNotificationType,
                        Title = $"Còn {days} ngày để học xong khóa {newest.Title}",
                        Message = state.Major
                            ? $"Khóa {newest.Title} chuyển sang nội dung mới ngày {date}. Học xong trước hạn để giữ kết quả, sau hạn bạn học lại từ đầu."
                            : $"Khóa {newest.Title} cập nhật nội dung ngày {date}. Học xong trước ngày đó thì giữ kết quả, chưa xong thì học tiếp trên nội dung mới, tiến trình được giữ.",
                        RelatedEntityType = "courses",
                        RelatedEntityId = newest.Id,
                    });
                setting.Value = JsonSerializer.Serialize(state with { Reminded7 = true, Reminded1 = state.Reminded1 || remind1 }, JsonOptions);
                handled += learning.Count;
            }
            await context.SaveChangesAsync();
        }
        return handled;
    }

    private const string Fresh = "FRESH";
    private const string Kept = "KEPT";
    private const string Grace = "GRACE";
    private const string Relearn = "RELEARN";
    /// <summary>In progress, minor change at once: moved to the new content with the progress.</summary>
    private const string Moved = "MOVED";
    /// <summary>Finished, and the change is major: learn it again for a new certificate.</summary>
    private const string Renew = "RENEW";

    /// <summary>What matters most for one employee and one course when several enrollments exist.</summary>
    private static int Rank(string what) => what switch { Relearn => 6, Renew => 5, Grace => 4, Moved => 3, Kept => 2, _ => 1 };

    /// <summary>
    /// The general notice everyone gets: minor or major, which courses, from which day, what people who finished and people
    /// half-way through should do. No colon near the start: the activity page reads "course: note" there.
    /// </summary>
    private static string ApplyMessage(IReadOnlyList<string> codes, Dictionary<string, string> titles, DateTimeOffset now,
        DateTimeOffset? switchAt, bool major)
    {
        var names = string.Join(", ", codes.Select(code => titles.GetValueOrDefault(code, code)).OrderBy(name => name));
        var head = $"Công ty vừa cập nhật {(major ? "lớn" : "nhỏ")} {codes.Count} khóa học ({names}), áp dụng từ ngày {Day(now)}.";
        var finished = major
            ? "Nội dung cũ không còn đúng nên ai đã học xong các khóa này cần học lại để lấy chứng nhận mới; chứng nhận cũ vẫn giữ."
            : "Đây là thay đổi nhỏ, ai đã học xong không cần học lại.";
        var learning = switchAt is { } until
            ? major
                ? $"Ai đang học dở hãy học xong trước ngày {Day(until)} để giữ kết quả; sau hạn học lại từ đầu nội dung mới."
                : $"Ai đang học dở hãy học xong trước ngày {Day(until)} để giữ kết quả; chưa xong thì học tiếp trên nội dung mới, tiến trình được giữ."
            : major
                ? "Ai đang học dở học lại từ đầu theo nội dung mới."
                : "Ai đang học dở học tiếp trên nội dung mới, tiến trình được giữ.";
        return $"{head} {finished} {learning}";
    }

    /// <summary>
    /// Moves enrollments on old content to the newest revision of their course, keeping what was done: pages read and module
    /// review quizzes passed carry over by position (module i, page j); a page or module added is still to do. The entry test
    /// and a final waiting for review belong to the enrollment and stay.
    /// </summary>
    private static async Task MoveKeepingProgressAsync(IApplicationDbContext context, IReadOnlyList<Enrollment> enrollments, DateTimeOffset now)
    {
        if (enrollments.Count == 0) return;
        var oldIds = enrollments.Select(e => e.CourseId).Distinct().ToList();
        var sources = await context.Courses.AsNoTracking().Where(c => oldIds.Contains(c.Id))
            .Select(c => new { c.Id, c.OrganizationId, c.Code }).ToListAsync();
        var organizations = sources.Select(c => c.OrganizationId).Distinct().ToList();
        var aliases = sources.SelectMany(c => CourseCodes.Aliases(c.Code)).Distinct(StringComparer.OrdinalIgnoreCase).ToList();
        var revisions = await context.Courses.AsNoTracking()
            .Where(c => organizations.Contains(c.OrganizationId) && aliases.Contains(c.Code))
            .Select(c => new { c.Id, c.OrganizationId, c.Code, c.VersionNo }).ToListAsync();
        var targets = enrollments.ToDictionary(e => e.Id, e =>
        {
            var source = sources.First(c => c.Id == e.CourseId);
            return revisions.Where(r => r.OrganizationId == source.OrganizationId
                    && string.Equals(CourseCodes.Canonical(r.Code), CourseCodes.Canonical(source.Code), StringComparison.OrdinalIgnoreCase))
                .MaxBy(r => r.VersionNo)!.Id;
        });

        var reader = new Pulse.PulseModuleReader(context);
        var modules = await reader.LoadModulesAsync(oldIds.Concat(targets.Values).Distinct().ToList(), includeContent: false);
        var progress = await reader.LoadProgressAsync(enrollments.Select(e => (e.Id, e.Status, e.CourseId)).ToList(), modules);
        var ids = enrollments.Select(e => e.Id).ToList();
        var read = (await context.LessonProgresses.AsNoTracking()
                .Where(p => ids.Contains(p.EnrollmentId) && p.Status == Statuses.LessonProgress.Completed)
                .Select(p => new { p.EnrollmentId, p.LessonId }).ToListAsync())
            .ToLookup(p => p.EnrollmentId, p => p.LessonId);

        foreach (var enrollment in enrollments)
        {
            var target = targets[enrollment.Id];
            if (target == enrollment.CourseId) continue;
            var from = modules.GetValueOrDefault(enrollment.CourseId) ?? new List<Pulse.PulseModuleInfo>();
            var to = modules.GetValueOrDefault(target) ?? new List<Pulse.PulseModuleInfo>();
            var pages = read[enrollment.Id].ToHashSet();
            var before = progress.GetValueOrDefault(enrollment.Id);
            for (var i = 0; i < Math.Min(from.Count, to.Count); i++)
            {
                var module = before?.GetValueOrDefault(from[i].ModuleId);
                for (var j = 0; j < Math.Min(from[i].Slides.Count, to[i].Slides.Count); j++)
                    if (module?.Viewed == true || pages.Contains(from[i].Slides[j].LessonId))
                        context.LessonProgresses.Add(new LessonProgress
                        {
                            EnrollmentId = enrollment.Id, LessonId = to[i].Slides[j].LessonId, Status = Statuses.LessonProgress.Completed,
                            ProgressPercent = 100, LastAccessedAt = now, CompletedAt = now,
                        });
                if (module?.QuizPassed == true && to[i].QuizAssessmentId is { } quiz)
                    context.AssessmentAttempts.Add(new AssessmentAttempt
                    {
                        AssessmentId = quiz, EnrollmentId = enrollment.Id, AttemptNo = 1, Status = Statuses.AssessmentAttempt.Scored,
                        StartedAt = now, SubmittedAt = now, ScoredAt = now, Score = 100, Passed = true,
                    });
            }
            enrollment.CourseId = target;
        }
    }

    private static async Task<Dictionary<string, string>> TitlesAsync(IApplicationDbContext context, Guid organizationId, List<string> aliases)
    {
        var rows = await context.Courses.AsNoTracking()
            .Where(c => c.OrganizationId == organizationId && aliases.Contains(c.Code))
            .Select(c => new { c.Code, c.Title, c.VersionNo }).ToListAsync();
        // The new revision may still be waiting for the caller's save: its title is the one to show.
        rows.AddRange(context.Courses.Local
            .Where(c => c.OrganizationId == organizationId && aliases.Contains(c.Code, StringComparer.OrdinalIgnoreCase))
            .Select(c => new { c.Code, c.Title, c.VersionNo }));
        return rows.GroupBy(r => CourseCodes.Canonical(r.Code), StringComparer.OrdinalIgnoreCase)
            .ToDictionary(g => g.Key, g => g.MaxBy(r => r.VersionNo)!.Title, StringComparer.OrdinalIgnoreCase);
    }

    private static Task<Dictionary<Guid, Guid>> UsersAsync(IApplicationDbContext context, List<Guid> employeeIds) =>
        context.Employees.AsNoTracking()
            .Where(e => employeeIds.Contains(e.Id) && e.UserId != null)
            .ToDictionaryAsync(e => e.Id, e => e.UserId!.Value);

    private static GraceState? Read(string value)
    {
        try { return JsonSerializer.Deserialize<GraceState>(value, JsonOptions); }
        catch (JsonException) { return null; }
    }

    /// <summary>Dates are written for people in Vietnam.</summary>
    public static string Day(DateTimeOffset at) => at.ToOffset(VietnamOffset).ToString("dd/MM");
}
