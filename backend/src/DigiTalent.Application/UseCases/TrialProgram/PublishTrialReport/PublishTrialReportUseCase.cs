using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>
/// POST /mentor/trials/{organizationId}/publish — mentor công bố bảng năng lực khi mọi bài đã nộp đều đã chấm. Chủ doanh
/// nghiệp thấy bảng năng lực; nhân viên thấy mức của mình và được học thử các khóa Cơ bản. Bài chưa nộp đóng lại.
/// </summary>
public class PublishTrialReportUseCase : IUseCase<PublishTrialReportUseCaseInput, PublishTrialReportUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly TrialProgramReader _reader;

    public PublishTrialReportUseCase(IApplicationDbContext context, TrialProgramReader reader)
    {
        _context = context;
        _reader = reader;
    }

    public async Task<PublishTrialReportUseCaseOutput> ExecuteAsync(PublishTrialReportUseCaseInput input)
    {
        var trial = await _reader.ForMentorAsync(input.OrganizationId);
        if (trial.ReportPublishedAt != null)
        {
            throw new ConflictException("Kết quả đã được công bố.");
        }

        var assessments = await _context.TrialAssessments.AsNoTracking()
            .Where(a => a.OrganizationId == trial.OrganizationId)
            .Select(a => new { a.ReviewedAt })
            .ToListAsync();
        if (assessments.Count == 0 || assessments.Any(a => a.ReviewedAt == null))
        {
            throw new BadRequestException("Chấm xong mọi bài đã nộp trước khi công bố.", "organizationId", "TRIAL_REPORT_NOT_READY");
        }

        var now = _reader.Now;
        trial.ReportPublishedAt = now;
        trial.Revision++;

        var participants = await _context.Employees.AsNoTracking()
            .Where(e => e.OrganizationId == trial.OrganizationId && e.UserId != null && e.UserId != trial.OwnerUserId)
            .Select(e => e.UserId!.Value)
            .ToListAsync();
        _reader.Notify(new[] { trial.OwnerUserId }, TrialProgramRules.NotificationReported, "Đã có bảng năng lực",
            $"Mentor đã chấm {assessments.Count} bài. Xem kết quả ở trang Dùng thử.", trial.OrganizationId);
        _reader.Notify(participants, TrialProgramRules.NotificationReported, "Đã có kết quả đánh giá",
            "Xem mức năng lực của bạn và bắt đầu học thử các khóa Cơ bản.", trial.OrganizationId);
        await _context.SaveChangesAsync();

        return new PublishTrialReportUseCaseOutput { PublishedAt = now, Assessed = assessments.Count };
    }
}
