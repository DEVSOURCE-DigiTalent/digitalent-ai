using DigiTalent.Domain.Constants.Authorization;
using FluentAssertions;
using Xunit;

namespace DigiTalent.Tests.Authorization;

/// <summary>OWNER (owner@digitalent.ai): administers the organization — members and invitations, structure, capability ceilings, position requirements, course purchase and assignment, the trial, reports.</summary>
public class OwnerAccessTests
{
    private const string Role = Roles.Owner;

    [Theory]
    [InlineData("GET", "api/v1/organization/overview")] // OW-01 Tổng quan
    [InlineData("GET", "api/v1/members")] // OW-02 Thành viên
    [InlineData("POST", "api/v1/members/invitations")] // OW-02 mời thành viên
    [InlineData("POST", "api/v1/members/{id:guid}/deactivate")] // OW-03 vô hiệu hóa thành viên
    [InlineData("POST", "api/v1/departments")] // OW-06 tạo phòng ban
    [InlineData("POST", "api/v1/job-positions")] // OW-09 tạo vị trí
    [InlineData("PUT", "api/v1/capability-ceilings/organization")] // OW-05 trần năng lực doanh nghiệp
    [InlineData("PUT", "api/v1/capability-ceilings/departments/{departmentId:guid}")] // OW-05 trần phòng ban
    [InlineData("POST", "api/v1/position-requirements/{id:guid}/activate")] // OW-16 kích hoạt chuẩn năng lực
    [InlineData("POST", "api/v1/competency-evidences/manual")] // OW-22 xác nhận mức năng lực
    [InlineData("POST", "api/v1/courses/{id:guid}/purchase-seats")] // OW-23 mua suất học
    [InlineData("POST", "api/v1/course-assignments")] // OW-24 giao khóa học
    [InlineData("POST", "api/v1/training-batches")] // OW-25 tạo đợt đào tạo
    [InlineData("GET", "api/v1/trial")] // OW-T1 Dùng thử
    [InlineData("PUT", "api/v1/trial/request")] // OW-T1 gửi yêu cầu chấm
    [InlineData("GET", "api/v1/workforce")] // Nhân sự và khoảng trống
    [InlineData("GET", "api/v1/subscription")] // Gói dịch vụ
    [InlineData("GET", "api/v1/pulse/final-reviews")] // Chấm bài cuối khóa
    public void Can_call(string verb, string route) =>
        EndpointCatalog.RoleCanCall(Role, verb, route).Should().BeTrue();

    [Theory]
    [InlineData("GET", "api/v1/platform/overview")] // console quản trị nền tảng
    [InlineData("GET", "api/v1/platform/organizations")] // danh sách tổ chức của nền tảng
    [InlineData("POST", "api/v1/platform/catalog/versions")] // tạo phiên bản catalog
    [InlineData("PUT", "api/v1/reference-positions/levels")] // sửa mẫu vị trí của nền tảng
    [InlineData("GET", "api/v1/mentor/trials")] // việc của mentor
    [InlineData("POST", "api/v1/me/pulse/courses/{courseId:guid}/final")] // nộp bài cuối khóa (chỉ người học)
    [InlineData("POST", "api/v1/learning/courses/{courseId}/enroll")] // tự ghi danh như nhân viên
    public void Cannot_call(string verb, string route) =>
        EndpointCatalog.RoleCanCall(Role, verb, route).Should().BeFalse();

    [Fact]
    public void Can_call_every_member_administration_endpoint()
    {
        EndpointCatalog.All.Where(e => e.Route.StartsWith("api/v1/members"))
            .Where(e => !EndpointCatalog.RoleCanCall(Role, e)).Select(e => e.ToString())
            .Should().BeEmpty();
    }

    [Fact]
    public void Reaches_no_platform_or_mentor_endpoint()
    {
        EndpointCatalog.All.Where(e => (e.Route.StartsWith("api/v1/platform/") || e.Route.StartsWith("api/v1/mentor/")) && e.Permissions.Count > 0)
            .Where(e => EndpointCatalog.RoleCanCall(Role, e)).Select(e => e.ToString())
            .Should().BeEmpty();
    }
}
