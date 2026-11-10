using DigiTalent.Domain.Constants.Authorization;
using FluentAssertions;
using Xunit;

namespace DigiTalent.Tests.Authorization;

/// <summary>MANAGER (manager@digitalent.ai): leads a department — reads the team (scoped to the department by EmployeeScope), grades course finals and practical tasks, and learns in the employee portal.</summary>
public class ManagerAccessTests
{
    private const string Role = Roles.Manager;

    [Theory]
    [InlineData("GET", "api/v1/workforce")] // MG nhân sự của phòng
    [InlineData("GET", "api/v1/employees")] // hồ sơ nhân viên trong phạm vi
    [InlineData("GET", "api/v1/intelligence/dashboard")] // Tổng quan nhóm
    [InlineData("POST", "api/v1/intelligence/skill-gaps/calculate")] // tính khoảng trống năng lực
    [InlineData("GET", "api/v1/pulse/final-reviews")] // MG-13 Chấm bài
    [InlineData("POST", "api/v1/pulse/final-reviews/{submissionId:guid}/decision")] // MG-13 quyết định bài cuối khóa
    [InlineData("POST", "api/v1/tasks")] // MG giao nhiệm vụ thực tế
    [InlineData("POST", "api/v1/submissions/{id:guid}/evaluate")] // MG chấm nhiệm vụ
    [InlineData("GET", "api/v1/review-queue")] // hàng đợi chấm
    [InlineData("POST", "api/v1/notifications/broadcast")] // gửi thông báo cho nhóm
    [InlineData("GET", "api/v1/me/pulse/overview")] // EM-01 học như nhân viên
    [InlineData("POST", "api/v1/me/pulse/courses/{courseId:guid}/final")] // nộp bài cuối khóa của mình
    public void Can_call(string verb, string route) =>
        EndpointCatalog.RoleCanCall(Role, verb, route).Should().BeTrue();

    [Theory]
    [InlineData("GET", "api/v1/members")] // quản trị thành viên
    [InlineData("POST", "api/v1/members/invitations")] // mời thành viên
    [InlineData("PUT", "api/v1/capability-ceilings/organization")] // đặt trần năng lực
    [InlineData("POST", "api/v1/position-requirements/{id:guid}/activate")] // kích hoạt chuẩn năng lực
    [InlineData("POST", "api/v1/course-assignments")] // giao khóa học
    [InlineData("POST", "api/v1/courses/{id:guid}/purchase-seats")] // mua suất học
    [InlineData("GET", "api/v1/organization/overview")] // tổng quan doanh nghiệp
    [InlineData("GET", "api/v1/subscription")] // gói dịch vụ
    [InlineData("GET", "api/v1/trial")] // chương trình dùng thử
    [InlineData("GET", "api/v1/platform/overview")] // console nền tảng
    public void Cannot_call(string verb, string route) =>
        EndpointCatalog.RoleCanCall(Role, verb, route).Should().BeFalse();

    [Fact]
    public void Cannot_change_the_organization_structure_or_its_standards()
    {
        var owned = new[] { "api/v1/members", "api/v1/departments", "api/v1/job-positions", "api/v1/capability-ceilings",
            "api/v1/position-requirements", "api/v1/course-assignments", "api/v1/job-grades" };
        EndpointCatalog.All.Where(e => e.Verb != "GET" && owned.Any(prefix => e.Route.StartsWith(prefix)))
            .Where(e => EndpointCatalog.RoleCanCall(Role, e)).Select(e => e.ToString())
            .Should().BeEmpty();
    }

    [Fact]
    public void Can_learn_in_the_employee_portal()
    {
        EndpointCatalog.All.Where(e => e.Route.StartsWith("api/v1/me/pulse/"))
            .Where(e => !EndpointCatalog.RoleCanCall(Role, e)).Select(e => e.ToString())
            .Should().BeEmpty();
    }
}
