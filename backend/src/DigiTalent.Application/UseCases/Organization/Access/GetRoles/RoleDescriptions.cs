using DigiTalent.Application.UseCases.Organization.Members;
using DigiTalent.Domain.Constants.Authorization;

namespace DigiTalent.Application.UseCases.Organization.Access;

/// <summary>
/// Plain-language description of each enterprise role (UI text, Vietnamese). Kept identical to
/// frontend lib/role-policy.ts ROLE_DESCRIPTIONS so the screen reads the same with or without the backend.
/// </summary>
public static class RoleDescriptions
{
    public sealed record Description(string Role, string RoleCode, string Name, string Summary, IReadOnlyList<string> Can);

    public static readonly IReadOnlyList<Description> All = new[]
    {
        new Description(
            MemberRoles.Owner,
            Roles.Owner,
            "Chủ doanh nghiệp",
            "Toàn quyền quản trị doanh nghiệp, tổ chức, năng lực, đào tạo, gói dịch vụ và phân quyền.",
            new[]
            {
                "Quản lý gói dịch vụ, thanh toán, quyền sử dụng và cài đặt tổ chức",
                "Thêm, gán vai trò và quản lý thành viên (có thể cấp quyền Chủ doanh nghiệp khác)",
                "Quản lý phòng ban, vị trí, cấp bậc (G1–G3) và gán Quản lý phòng ban",
                "Thiết lập yêu cầu năng lực theo vị trí (chuẩn TT 02/2025)",
                "Tạo đợt đào tạo, phân công khóa học và theo dõi toàn diện",
                "Giao nhiệm vụ thực tế và đánh giá minh chứng trên toàn tổ chức (khi không có Quản lý)",
            }),
        new Description(
            MemberRoles.Manager,
            Roles.Manager,
            "Quản lý",
            "Theo dõi tiến độ, giao nhiệm vụ thực tế và đánh giá minh chứng trong phạm vi phòng ban được phân công.",
            new[]
            {
                "Xem danh sách thành viên, năng lực và khoảng trống năng lực trong phạm vi nhóm phụ trách",
                "Theo dõi tiến độ đào tạo của nhân viên trong nhóm",
                "Giao nhiệm vụ thực tế và đánh giá minh chứng của nhân viên trong nhóm",
                "Sử dụng các tính năng học tập và phát triển cá nhân của Nhân viên",
            }),
        new Description(
            MemberRoles.Employee,
            Roles.Employee,
            "Nhân viên",
            "Học tập, làm bài đánh giá, thực hiện nhiệm vụ thực tế và phát triển năng lực bản thân.",
            new[]
            {
                "Xem hồ sơ năng lực cá nhân và khoảng trống năng lực so với yêu cầu vị trí",
                "Tham gia các khóa học được phân công theo lộ trình",
                "Làm các bài đánh giá năng lực",
                "Thực hiện nhiệm vụ thực tế, nộp minh chứng và xem phản hồi đánh giá",
                "Xem thành tựu và chứng nhận đã đạt được",
            }),
    };
}
