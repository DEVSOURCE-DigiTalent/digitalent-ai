using DigiTalent.Domain.Constants.Authorization;
using FluentAssertions;
using Xunit;

namespace DigiTalent.Tests.Authorization;

/// <summary>EMPLOYEE (employee@digitalent.ai): learns in the Pulse portal (roadmap, proctored pre-assessment and final, module quizzes), submits practical tasks, takes the trial test; sees only their own data.</summary>
public class EmployeeAccessTests
{
    private const string Role = Roles.Employee;

    [Theory]
    [InlineData("GET", "api/v1/me/pulse/overview")] // EM-01 Hôm nay
    [InlineData("GET", "api/v1/me/pulse/courses/{courseId:guid}")] // EM-03 khóa học
    [InlineData("POST", "api/v1/me/pulse/courses/{courseId:guid}/pre-assessment")] // EM-05 bài đánh giá đầu vào
    [InlineData("POST", "api/v1/me/pulse/courses/{courseId:guid}/proctoring")] // phiên thi có giám sát
    [InlineData("POST", "api/v1/me/pulse/courses/{courseId:guid}/modules/{moduleId:guid}/quiz")] // câu hỏi ôn tập mô đun
    [InlineData("POST", "api/v1/me/pulse/courses/{courseId:guid}/final")] // EM-06 bài cuối khóa
    [InlineData("GET", "api/v1/me/pulse/outcomes")] // EM-09 kết quả
    [InlineData("GET", "api/v1/me/tasks")] // nhiệm vụ thực tế của tôi
    [InlineData("POST", "api/v1/me/tasks/{assignmentId:guid}/submissions")] // nộp minh chứng
    [InlineData("GET", "api/v1/me/trial-assessment")] // EM-T1 bài test dùng thử
    [InlineData("POST", "api/v1/me/trial-assessment")] // EM-T1 nộp bài test
    [InlineData("POST", "api/v1/feedbacks")] // EM-13 góp ý
    [InlineData("POST", "api/v1/assistant/chat")] // trợ lý AI
    public void Can_call(string verb, string route) =>
        EndpointCatalog.RoleCanCall(Role, verb, route).Should().BeTrue();

    [Theory]
    [InlineData("GET", "api/v1/employees")] // danh sách nhân viên
    [InlineData("GET", "api/v1/workforce")] // nhân sự toàn doanh nghiệp
    [InlineData("GET", "api/v1/members")] // quản trị thành viên
    [InlineData("GET", "api/v1/pulse/final-reviews")] // chấm bài của người khác
    [InlineData("POST", "api/v1/submissions/{id:guid}/evaluate")] // chấm nhiệm vụ
    [InlineData("POST", "api/v1/tasks")] // giao nhiệm vụ
    [InlineData("GET", "api/v1/intelligence/dashboard")] // tổng quan quản lý
    [InlineData("POST", "api/v1/intelligence/skill-gaps/calculate")] // tính khoảng trống cho người khác
    [InlineData("GET", "api/v1/review-queue")] // hàng đợi chấm
    [InlineData("GET", "api/v1/platform/overview")] // console nền tảng
    public void Cannot_call(string verb, string route) =>
        EndpointCatalog.RoleCanCall(Role, verb, route).Should().BeFalse();

    [Fact]
    public void Can_call_every_employee_portal_endpoint()
    {
        EndpointCatalog.All.Where(e => e.Route.StartsWith("api/v1/me/pulse/") || e.Route.StartsWith("api/v1/me/tasks") || e.Route.StartsWith("api/v1/me/trial-assessment"))
            .Where(e => !EndpointCatalog.RoleCanCall(Role, e)).Select(e => e.ToString())
            .Should().BeEmpty();
    }

    [Fact]
    public void Cannot_evaluate_anyone()
    {
        var grading = EndpointCatalog.All.Where(e => e.Route.StartsWith("api/v1/pulse/final-reviews") || e.Route.EndsWith("/evaluate")
            || e.Route.StartsWith("api/v1/mentor/"));
        grading.Where(e => EndpointCatalog.RoleCanCall(Role, e)).Select(e => e.ToString()).Should().BeEmpty();
    }
}
