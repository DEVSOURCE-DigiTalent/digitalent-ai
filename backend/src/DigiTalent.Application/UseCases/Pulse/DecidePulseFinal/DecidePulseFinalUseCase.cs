using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Learning.Content;
using DigiTalent.Application.UseCases.Me;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using DigiTalent.Domain.Events;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// POST /pulse/final-reviews/{submissionId}/decision — quản lý ghi quyết định cho bài cuối khóa đang chờ (§10). "Đạt" cần
/// phần trắc nghiệm đủ số câu đúng (<see cref="PulseExamPaper.BelowPass"/>):
///   - PASSED: lượt học COMPLETED → nâng mức đã xác nhận (CompetencyEvidence → EmployeeCompetencyProfile →
///     EmployeeCompetencyLevelConfirmed để tính lại Skill Gap), cấp chứng chỉ (MyCertificateIssuer), ghi AuditLog.
///   - NOT_YET lần 1: chụp cửa sổ nộp lại theo chính sách doanh nghiệp (chờ cooldown, hạn deadline).
///   - NOT_YET lần 2: cờ cần hỗ trợ, không mở cấp tiếp.
/// Nhân viên nhận thông báo kèm lý do. Ghi nhật ký kiểm tra sau khi lưu.
/// </summary>
public class DecidePulseFinalUseCase : IUseCase<DecidePulseFinalUseCaseInput, DecidePulseFinalUseCaseOutput>
{
    public const string NotificationType = "PULSE_FINAL_DECIDED";

    private readonly IApplicationDbContext _context;
    private readonly PulseReviewScope _scope;
    private readonly PulseRetryPolicyProvider _policy;
    private readonly IAuditService _audit;
    private readonly TimeProvider _clock;
    private readonly MyCertificateIssuer _certificateIssuer;

    public DecidePulseFinalUseCase(
        IApplicationDbContext context,
        PulseReviewScope scope,
        PulseRetryPolicyProvider policy,
        IAuditService audit,
        TimeProvider clock,
        MyCertificateIssuer? certificateIssuer = null)
    {
        _context = context;
        _scope = scope;
        _policy = policy;
        _audit = audit;
        _clock = clock;
        _certificateIssuer = certificateIssuer ?? new MyCertificateIssuer(context, audit);
    }

    public async Task<DecidePulseFinalUseCaseOutput> ExecuteAsync(DecidePulseFinalUseCaseInput input)
    {
        var (submission, enrollment, employee) = await _scope.LoadAsync(input.SubmissionId);
        if (submission.Decision != null)
        {
            throw new ConflictException("Bài nộp này đã có quyết định.");
        }

        if (enrollment.Status == Statuses.Enrollment.Cancelled)
        {
            // The company applied new content to the course: the employee learns it again from the start (CourseRelearn).
            throw new BadRequestException(
                "Bài này đã hủy vì công ty áp dụng nội dung mới cho khóa; nhân viên học lại từ đầu.", "submissionId", "SUBMISSION_CANCELLED");
        }

        var latest = await _context.CourseFinalSubmissions
            .Where(s => s.EnrollmentId == enrollment.Id)
            .MaxAsync(s => s.AttemptNo);
        if (latest != submission.AttemptNo)
        {
            throw new ConflictException("Chỉ chấm được lần nộp mới nhất.");
        }

        PulseExamPaper.EnsureCanPass(input.Decision, submission.ChoiceScore, submission.ChoiceTotal);
        if (input.CriterionEvaluations is { } evaluations && evaluations.Any(c => c.ScorePercent.HasValue))
        {
            var finals = await new LearningContentReader(_context).FinalsAsync(new[] { enrollment.CourseId });
            var expectedWeights = PulseEssayRubric.ReadStatedWeights(finals.GetValueOrDefault(enrollment.CourseId)?.Criteria);
            if (expectedWeights != null && !evaluations.Select(c => (c.Title.Trim(), c.WeightPercent))
                    .SequenceEqual(expectedWeights.Select(c => (c.Title, (int?)c.Weight))))
            {
                throw new ConflictException("Trọng số của bài chấm đã thay đổi. Làm mới danh sách trước khi lưu quyết định.");
            }
        }
        var rubricMetrics = PulseEssayRubric.ComputeAuditMetrics(input.CriterionEvaluations);
        if (input.Decision == Statuses.FinalSubmissionDecision.Passed && rubricMetrics.GateFailed)
        {
            throw new BadRequestException(
                "Tiêu chí bắt buộc (Gate) chưa đạt nên chưa đủ điều kiện công nhận.",
                "CriterionEvaluations",
                "RUBRIC_GATE_FAILED");
        }

        var now = _clock.GetUtcNow();
        var reason = input.Reason.Trim();
        submission.Decision = input.Decision;
        submission.DecisionReason = reason;
        submission.ReviewedByUserId = _scope.ReviewerUserId;
        submission.ReviewedAt = now;

        var course = await _context.Courses.AsNoTracking()
            .FirstAsync(c => c.Id == enrollment.CourseId);

        string status;
        var confirmedChanges = new List<(Guid ProfileId, Guid CompetencyId, short? PreviousLevel, short NewLevel, Guid EvidenceId)>();
        Certificate? issuedCertificate = null;

        if (input.Decision == Statuses.FinalSubmissionDecision.Passed)
        {
            enrollment.Status = Statuses.Enrollment.Completed;
            enrollment.ProgressPercent = 100;
            enrollment.StartedAt ??= submission.SubmittedAt;
            enrollment.CompletedAt = now;
            status = PulseFinalStatus.Approved;

            if (employee.UserId is { } employeeUserId)
            {
                _context.Notifications.Add(new Notification
                {
                    RecipientUserId = employeeUserId,
                    Type = NotificationType,
                    Title = "Bài cuối khóa đã được duyệt",
                    Message = $"{course.Title}: {reason}",
                    RelatedEntityType = "course_final_submissions",
                    RelatedEntityId = submission.Id,
                });
            }

            try
            {
                await _context.ExecuteInTransactionAsync(async () =>
                {
                    confirmedChanges.AddRange(await ConfirmCourseCompetenciesAsync(employee, course, submission, now));

                    if (course.CertificateEnabled)
                    {
                        await EnsureActiveCertificateTemplateAsync(course.OrganizationId);
                        var attempt = await EnsurePassedFinalAttemptAsync(course, enrollment, submission, now);
                        await _context.SaveChangesAsync();
                        issuedCertificate = await _certificateIssuer.IssueAsync(employee, course, enrollment, attempt, now);
                    }
                    else
                    {
                        await _context.SaveChangesAsync();
                    }
                });
            }
            catch (DbUpdateException)
            {
                throw new ConflictException("Bài nộp vừa được cập nhật, vui lòng tải lại hàng chờ.");
            }
        }
        else
        {
            if (submission.AttemptNo < PulseRules.MaxFinalAttempts)
            {
                var policy = await _policy.GetAsync(employee.OrganizationId);
                submission.RetryOpensAt = now.AddHours(policy.CooldownHours);
                submission.RetryDueAt = submission.RetryOpensAt.Value.AddDays(policy.DeadlineDays);
                enrollment.Status = Statuses.Enrollment.InProgress;
                status = PulseFinalStatus.RetryWait;
            }
            else
            {
                enrollment.Status = Statuses.Enrollment.InProgress;
                status = PulseFinalStatus.Flagged;
            }

            if (employee.UserId is { } employeeUserId)
            {
                _context.Notifications.Add(new Notification
                {
                    RecipientUserId = employeeUserId,
                    Type = NotificationType,
                    Title = status == PulseFinalStatus.RetryWait
                        ? "Bài cuối khóa cần chỉnh sửa"
                        : "Bài cuối khóa cần hỗ trợ thêm",
                    Message = $"{course.Title}: {reason}",
                    RelatedEntityType = "course_final_submissions",
                    RelatedEntityId = submission.Id,
                });
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                throw new ConflictException("Bài nộp vừa được cập nhật, vui lòng tải lại hàng chờ.");
            }
        }

        var criteriaAudit = input.CriterionEvaluations is { Count: > 0 } evals
            ? evals.Select(c => new
            {
                Number = (c.Number ?? string.Empty).Trim(),
                Title = (c.Title ?? string.Empty).Trim(),
                Status = (c.Status ?? string.Empty).Trim(),
                Note = string.IsNullOrWhiteSpace(c.Note) ? null : c.Note.Trim(),
                c.WeightPercent,
                c.ScorePercent,
                c.IsRequired,
            }).ToList()
            : null;

        await _audit.LogAsync(
            "PULSE_FINAL_DECIDED",
            "course_final_submissions",
            submission.Id,
            newValues: new
            {
                submission.Decision,
                submission.AttemptNo,
                EnrollmentId = enrollment.Id,
                EmployeeId = employee.Id,
                CertificateCode = issuedCertificate?.CertificateCode,
                ConfirmedCompetencies = confirmedChanges.Select(c => new { c.CompetencyId, c.PreviousLevel, c.NewLevel }).ToList(),
                EssayScorePercent = criteriaAudit != null ? rubricMetrics.WeightedScorePercent : (int?)null,
                GateFailed = criteriaAudit != null ? rubricMetrics.GateFailed : (bool?)null,
                CriterionEvaluations = criteriaAudit,
            },
            entityLabel: $"{employee.FullName} · {course.Title}");

        foreach (var change in confirmedChanges)
        {
            await _audit.LogAsync(
                "COMPETENCY_LEVEL_CONFIRMED",
                "employee_competency_profiles",
                change.ProfileId,
                oldValues: change.PreviousLevel.HasValue ? new { confirmedLevel = change.PreviousLevel.Value } : null,
                newValues: new
                {
                    confirmedLevel = change.NewLevel,
                    competencyId = change.CompetencyId,
                    evidenceId = change.EvidenceId,
                    source = "COURSE_FINAL",
                    submissionId = submission.Id,
                },
                entityLabel: $"{employee.FullName} · {course.Code}");
        }

        return new DecidePulseFinalUseCaseOutput
        {
            SubmissionId = submission.Id,
            Decision = input.Decision,
            Status = status,
            EnrollmentStatus = enrollment.Status,
            RetryOpensAt = submission.RetryOpensAt,
            RetryDueAt = submission.RetryDueAt,
            CertificateCode = issuedCertificate?.CertificateCode,
        };
    }

    private async Task<List<(Guid ProfileId, Guid CompetencyId, short? PreviousLevel, short NewLevel, Guid EvidenceId)>>
        ConfirmCourseCompetenciesAsync(Employee employee, Course course, CourseFinalSubmission submission, DateTimeOffset now)
    {
        var courseCompetencies = await _context.CourseCompetencies.AsNoTracking()
            .Where(cc => cc.CourseId == course.Id)
            .ToListAsync();
        if (courseCompetencies.Count == 0)
        {
            return new List<(Guid, Guid, short?, short, Guid)>();
        }

        var competencyIds = courseCompetencies.Select(cc => cc.CompetencyId).Distinct().ToList();
        var existingProfiles = await _context.EmployeeCompetencyProfiles
            .Where(p => p.EmployeeId == employee.Id && competencyIds.Contains(p.CompetencyId))
            .ToDictionaryAsync(p => p.CompetencyId);
        var existingConfirmingEvidences = await _context.CompetencyEvidences
            .Where(e => e.EmployeeId == employee.Id
                        && competencyIds.Contains(e.CompetencyId)
                        && e.Status == Statuses.EvidenceStatus.Confirmed
                        && e.IsLevelConfirming)
            .ToListAsync();

        decimal? choiceScorePercent = submission.ChoiceTotal is > 0 && submission.ChoiceScore is { } score
            ? Math.Round(score * 100m / submission.ChoiceTotal.Value, 2, MidpointRounding.AwayFromZero)
            : null;
        var changes = new List<(Guid ProfileId, Guid CompetencyId, short? PreviousLevel, short NewLevel, Guid EvidenceId)>();

        foreach (var group in courseCompetencies.GroupBy(cc => cc.CompetencyId))
        {
            var competencyId = group.Key;
            var targetLevel = (short)Math.Clamp((int)group.Max(cc => cc.TargetLevel), 1, PulseRules.MaxLevel);
            existingProfiles.TryGetValue(competencyId, out var profile);
            if (profile != null && profile.ConfirmedLevel >= targetLevel)
            {
                continue;
            }

            var previousConfirming = existingConfirmingEvidences
                .Where(e => e.CompetencyId == competencyId)
                .OrderByDescending(e => e.ConfirmedAt)
                .ToList();
            foreach (var prev in previousConfirming)
            {
                prev.Status = Statuses.EvidenceStatus.Superseded;
                prev.IsLevelConfirming = false;
            }

            var evidence = new CompetencyEvidence
            {
                EmployeeId = employee.Id,
                CompetencyId = competencyId,
                SourceType = Statuses.EvidenceSourceType.ManualOverride,
                Status = Statuses.EvidenceStatus.Confirmed,
                IsLevelConfirming = true,
                ConfirmedLevel = targetLevel,
                Score = choiceScorePercent,
                ConfirmedByUserId = _scope.ReviewerUserId,
                ConfirmedAt = now,
                ReviewNote = $"Hoàn thành bài cuối khóa {course.Code} (lần {submission.AttemptNo})",
                SupersedesEvidenceId = previousConfirming.FirstOrDefault()?.Id,
            };
            _context.CompetencyEvidences.Add(evidence);

            short? previousLevel = profile?.ConfirmedLevel;
            if (profile == null)
            {
                profile = new EmployeeCompetencyProfile
                {
                    EmployeeId = employee.Id,
                    CompetencyId = competencyId,
                    ConfirmedLevel = targetLevel,
                    LatestConfirmingEvidenceId = evidence.Id,
                    ConfirmedAt = now,
                    RowVersion = 1,
                };
                _context.EmployeeCompetencyProfiles.Add(profile);
            }
            else
            {
                profile.ConfirmedLevel = targetLevel;
                profile.LatestConfirmingEvidenceId = evidence.Id;
                profile.ConfirmedAt = now;
                profile.RowVersion += 1;
            }

            _context.AddDomainEvent(new EmployeeCompetencyLevelConfirmed(employee.Id, competencyId, targetLevel, evidence.Id));
            changes.Add((profile.Id, competencyId, previousLevel, targetLevel, evidence.Id));
        }

        return changes;
    }

    private async Task EnsureActiveCertificateTemplateAsync(Guid organizationId)
    {
        var hasActive = await _context.CertificateTemplates.AsNoTracking()
            .AnyAsync(t => t.OrganizationId == organizationId && t.Status == Statuses.CertificateTemplate.Active);
        if (hasActive)
        {
            return;
        }

        var nextVersion = (await _context.CertificateTemplates.AsNoTracking()
            .Where(t => t.OrganizationId == organizationId)
            .MaxAsync(t => (int?)t.VersionNo) ?? 0) + 1;

        _context.CertificateTemplates.Add(new CertificateTemplate
        {
            OrganizationId = organizationId,
            Name = "Chứng chỉ hoàn thành khóa học DigiTalent",
            VersionNo = nextVersion,
            TemplateHtml = "<h1>{{holderName}}</h1><p>Hoàn thành khóa {{courseTitle}}</p><p>Mã: {{certificateCode}}</p>",
            Status = Statuses.CertificateTemplate.Active,
            CreatedByUserId = _scope.ReviewerUserId,
        });
    }

    private async Task<AssessmentAttempt> EnsurePassedFinalAttemptAsync(
        Course course, Enrollment enrollment, CourseFinalSubmission submission, DateTimeOffset now)
    {
        var finalAssessment = await _context.Assessments
            .FirstOrDefaultAsync(a => a.CourseId == course.Id && a.IsFinal && a.Status == Statuses.Assessment.Published);

        if (finalAssessment == null)
        {
            var code = $"{course.Code}-FINAL";
            if (code.Length > 50)
            {
                code = code[..50];
            }

            var nextVersion = (await _context.Assessments.AsNoTracking()
                .Where(a => a.CourseId == course.Id && a.Code == code)
                .MaxAsync(a => (int?)a.VersionNo) ?? 0) + 1;

            var title = $"Đánh giá cuối khóa · {course.Title}";
            if (title.Length > 250)
            {
                title = title[..250];
            }

            finalAssessment = new Assessment
            {
                CourseId = course.Id,
                Code = code,
                VersionNo = nextVersion,
                Title = title,
                AssessmentType = Statuses.AssessmentType.Final,
                IsFinal = true,
                PassingScore = 70m,
                Status = Statuses.Assessment.Published,
                CreatedByUserId = course.CreatedByUserId,
                RowVersion = 1,
            };
            _context.Assessments.Add(finalAssessment);
        }

        var existingUnissued = await _context.AssessmentAttempts
            .Where(a => a.AssessmentId == finalAssessment.Id
                        && a.EnrollmentId == enrollment.Id
                        && a.Passed == true
                        && !_context.Certificates.Any(c => c.AssessmentAttemptId == a.Id))
            .OrderByDescending(a => a.AttemptNo)
            .FirstOrDefaultAsync();
        if (existingUnissued != null)
        {
            return existingUnissued;
        }

        var nextAttemptNo = (await _context.AssessmentAttempts.AsNoTracking()
            .Where(a => a.AssessmentId == finalAssessment.Id && a.EnrollmentId == enrollment.Id)
            .MaxAsync(a => (int?)a.AttemptNo) ?? 0) + 1;

        var scorePercent = submission.ChoiceTotal is > 0 && submission.ChoiceScore is { } s
            ? Math.Round(s * 100m / submission.ChoiceTotal.Value, 2, MidpointRounding.AwayFromZero)
            : 100m;
        var scoredAt = now >= submission.SubmittedAt ? now : submission.SubmittedAt;

        var attempt = new AssessmentAttempt
        {
            AssessmentId = finalAssessment.Id,
            EnrollmentId = enrollment.Id,
            AttemptNo = nextAttemptNo,
            Status = Statuses.AssessmentAttempt.Scored,
            StartedAt = submission.SubmittedAt,
            SubmittedAt = submission.SubmittedAt,
            ScoredAt = scoredAt,
            Score = scorePercent,
            Passed = true,
        };
        _context.AssessmentAttempts.Add(attempt);
        return attempt;
    }
}
