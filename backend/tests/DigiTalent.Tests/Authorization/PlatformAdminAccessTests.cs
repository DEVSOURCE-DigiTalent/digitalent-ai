using DigiTalent.Domain.Constants.Authorization;
using FluentAssertions;
using Xunit;

namespace DigiTalent.Tests.Authorization;

/// <summary>PLATFORM_ADMIN (platform@digitalent.ai): the DigiTalent console (PA-01..PA-14) — frameworks, catalog versions, organizations, users, prices, trials, mentors, audit log — and nothing of an organization workspace.</summary>
public class PlatformAdminAccessTests
{
    private const string Role = Roles.PlatformAdmin;

    [Theory]
    [InlineData("GET", "api/v1/platform/overview")] // PA-01 Tổng quan
    [InlineData("GET", "api/v1/platform/frameworks")] // PA-02 Khung chuẩn
    [InlineData("PUT", "api/v1/platform/frameworks/{id:guid}/domains/{domainId:guid}")] // PA-02 sửa lĩnh vực
    [InlineData("GET", "api/v1/platform/catalog/versions")] // PA-03 Phiên bản khóa học
    [InlineData("POST", "api/v1/platform/catalog/versions/{versionNo:int}/publish")] // PA-12 công bố phiên bản
    [InlineData("POST", "api/v1/platform/catalog/versions/{versionNo:int}/courses/{courseId:guid}/modules")] // PA-04 trình biên soạn
    [InlineData("GET", "api/v1/platform/organizations")] // PA-05 Tổ chức
    [InlineData("POST", "api/v1/platform/organizations/{id:guid}/suspend")] // PA-05 tạm ngưng tổ chức
    [InlineData("POST", "api/v1/platform/organizations/{id:guid}/seat-grants")] // PA-06 cấp suất học
    [InlineData("GET", "api/v1/platform/users")] // PA-07 Người dùng
    [InlineData("POST", "api/v1/platform/users/{id:guid}/lock")] // PA-08 khóa tài khoản
    [InlineData("PUT", "api/v1/platform/catalog/versions/{versionNo:int}/prices")] // PA-09 Đơn giá
    [InlineData("GET", "api/v1/platform/audit-logs")] // PA-10 Nhật ký kiểm tra
    [InlineData("PUT", "api/v1/reference-positions/levels")] // Mẫu vị trí tham chiếu
    [InlineData("GET", "api/v1/platform/trials")] // PA-14 Dùng thử
    [InlineData("PUT", "api/v1/platform/trials/{organizationId:guid}/mentor")] // PA-14 phân công mentor
    [InlineData("POST", "api/v1/platform/mentors")] // PA-14 tạo tài khoản mentor
    [InlineData("GET", "api/v1/platform/feedbacks")] // Góp ý và báo lỗi
    [InlineData("GET", "api/v1/auth/me")] // Phiên đăng nhập
    [InlineData("GET", "api/v1/notifications")] // Thông báo
    public void Can_call(string verb, string route) =>
        EndpointCatalog.RoleCanCall(Role, verb, route).Should().BeTrue();

    [Theory]
    [InlineData("GET", "api/v1/members")] // OW-02 thành viên của doanh nghiệp
    [InlineData("GET", "api/v1/organization/overview")] // OW-01 tổng quan doanh nghiệp
    [InlineData("GET", "api/v1/employees")] // hồ sơ nhân viên
    [InlineData("GET", "api/v1/workforce")] // OW-03 nhân sự
    [InlineData("POST", "api/v1/course-assignments")] // giao khóa học
    [InlineData("GET", "api/v1/trial")] // OW-T1 dùng thử của doanh nghiệp
    [InlineData("GET", "api/v1/me/pulse/overview")] // EM-01 cổng nhân viên
    [InlineData("GET", "api/v1/mentor/trials")] // MT-01 việc của mentor
    [InlineData("GET", "api/v1/pulse/final-reviews")] // chấm bài cuối khóa
    public void Cannot_call(string verb, string route) =>
        EndpointCatalog.RoleCanCall(Role, verb, route).Should().BeFalse();

    [Fact]
    public void Can_call_every_platform_console_endpoint()
    {
        EndpointCatalog.All.Where(e => e.Route.StartsWith("api/v1/platform/") && e.Permissions.Count > 0)
            .Where(e => !EndpointCatalog.RoleCanCall(Role, e)).Select(e => e.ToString())
            .Should().BeEmpty();
    }

    [Fact]
    public void Reaches_no_organization_workspace_screen()
    {
        var workspace = new[] { "api/v1/members", "api/v1/organization", "api/v1/employees", "api/v1/workforce", "api/v1/me/pulse", "api/v1/trial" };
        EndpointCatalog.All.Where(e => workspace.Any(prefix => e.Route.StartsWith(prefix)) && e.Permissions.Count > 0)
            .Where(e => EndpointCatalog.RoleCanCall(Role, e)).Select(e => e.ToString())
            .Should().BeEmpty();
    }
}
