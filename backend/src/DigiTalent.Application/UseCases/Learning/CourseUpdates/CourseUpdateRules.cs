using DigiTalent.Application.Common.Exceptions;

namespace DigiTalent.Application.UseCases.Learning.CourseUpdates;

public static class CourseUpdateRules
{
    public const int MinReasonLength = 10;
    public const int MaxReasonLength = 500;

    /// <summary>An organization decides only on the newest version, and only while it does not learn from it yet.</summary>
    public static void EnsureNewest(int requestedVersionNo, int latestVersionNo, int appliedVersionNo)
    {
        if (requestedVersionNo != latestVersionNo)
        {
            throw new BadRequestException(
                $"Chỉ quyết định được trên bản mới nhất (v{latestVersionNo}). Tải lại trang để xem bản mới.", "versionNo", "VERSION_NOT_LATEST");
        }

        if (appliedVersionNo == latestVersionNo)
        {
            throw new BadRequestException($"Doanh nghiệp đang dùng v{latestVersionNo}.", "versionNo", "ALREADY_ON_VERSION");
        }
    }
}
