using DigiTalent.Domain.Constants.Authorization;
using FluentAssertions;
using Xunit;

namespace DigiTalent.Tests.Authorization;

/// <summary>MENTOR (mentor@digitalent.ai): platform staff without an organization who grades the enterprise trial assessments (MT-01/MT-02) and the course finals of trial organizations (MT-03).</summary>
public class MentorAccessTests
{
    private const string Role = Roles.Mentor;

    [Theory]
    [InlineData("GET", "api/v1/mentor/trials")] // MT-01 doanh nghiệp được phân công
    [InlineData("GET", "api/v1/mentor/trials/{organizationId:guid}")] // MT-02 bài làm của doanh nghiệp
    [InlineData("PUT", "api/v1/mentor/trials/{organizationId:guid}/assessments/{assessmentId:guid}")] // MT-02 chấm tự luận, đặt mức
    [InlineData("POST", "api/v1/mentor/trials/{organizationId:guid}/assessments/{assessmentId:guid}/ai-review")] // MT-02 gợi ý AI
    [InlineData("POST", "api/v1/mentor/trials/{organizationId:guid}/publish")] // MT-02 công bố bảng năng lực
    [InlineData("GET", "api/v1/pulse/final-reviews")] // MT-03 bài cuối khóa cần chấm
    [InlineData("POST", "api/v1/pulse/final-reviews/{submissionId:guid}/decision")] // MT-03 quyết định bài cuối khóa
    [InlineData("POST", "api/v1/pulse/final-reviews/pre-assessments/{preAssessmentId:guid}/decision")] // MT-03 quyết định bài đầu vào
    [InlineData("GET", "api/v1/auth/me")] // Phiên đăng nhập
    [InlineData("GET", "api/v1/account/profile")] // Hồ sơ của tôi
    [InlineData("GET", "api/v1/notifications")] // Thông báo
    public void Can_call(string verb, string route) =>
        EndpointCatalog.RoleCanCall(Role, verb, route).Should().BeTrue();

    [Theory]
    [InlineData("GET", "api/v1/platform/overview")] // PA-01 console quản trị
    [InlineData("GET", "api/v1/platform/trials")] // PA-14 danh sách dùng thử
    [InlineData("PUT", "api/v1/platform/trials/{organizationId:guid}/mentor")] // tự phân công mentor
    [InlineData("GET", "api/v1/members")] // thành viên doanh nghiệp
    [InlineData("GET", "api/v1/employees")] // hồ sơ nhân viên
    [InlineData("GET", "api/v1/workforce")] // nhân sự doanh nghiệp
    [InlineData("GET", "api/v1/me/pulse/overview")] // cổng nhân viên
    [InlineData("POST", "api/v1/me/trial-assessment")] // làm bài đánh giá thay nhân viên
    [InlineData("POST", "api/v1/submissions/{id:guid}/evaluate")] // chấm nhiệm vụ thực tế
    public void Cannot_call(string verb, string route) =>
        EndpointCatalog.RoleCanCall(Role, verb, route).Should().BeFalse();

    [Fact]
    public void Business_endpoints_are_limited_to_trial_grading()
    {
        var shared = new[] { "api/v1/auth/", "api/v1/account/", "api/v1/notifications", "api/v1/me/dashboard" };
        var grading = new[] { "api/v1/mentor/", "api/v1/pulse/final-reviews" };
        EndpointCatalog.All.Where(e => e.Permissions.Count > 0 && EndpointCatalog.RoleCanCall(Role, e))
            .Where(e => !shared.Concat(grading).Any(prefix => e.Route.StartsWith(prefix))).Select(e => e.ToString())
            .Should().BeEmpty();
    }

    [Fact]
    public void Only_mentors_reach_the_mentor_trial_endpoints()
    {
        var others = new[] { Roles.PlatformAdmin, Roles.Owner, Roles.Manager, Roles.Employee };
        EndpointCatalog.All.Where(e => e.Route.StartsWith("api/v1/mentor/"))
            .Where(e => others.Any(role => EndpointCatalog.RoleCanCall(role, e))).Select(e => e.ToString())
            .Should().BeEmpty();
    }
}
