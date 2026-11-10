using DigiTalent.Domain.Constants.Authorization;
using FluentAssertions;
using Xunit;

namespace DigiTalent.Tests.Authorization;

/// <summary>Personal learner (personal@digitalent.ai): an individual account with no persisted role, shown as LEARNER. PermissionService only adds account.view_own and learner.access, so the personal portal (/personal/*, [Authorize]) and the own account are reachable, no organization or platform screen is.</summary>
public class PersonalLearnerAccessTests
{
    private const string Role = EndpointCatalog.PersonalLearner;

    [Theory]
    [InlineData("GET", "api/v1/auth/me")] // phiên đăng nhập (account.view_own)
    [InlineData("GET", "api/v1/account/profile")] // hồ sơ của tôi
    [InlineData("GET", "api/v1/personal/overview")] // tổng quan cá nhân
    [InlineData("GET", "api/v1/personal/access")] // quyền theo gói / dùng thử
    [InlineData("PUT", "api/v1/personal/target")] // chọn vị trí mục tiêu
    [InlineData("POST", "api/v1/personal/diagnostic")] // bài đánh giá đầu vào
    [InlineData("GET", "api/v1/personal/path")] // lộ trình cá nhân
    [InlineData("POST", "api/v1/personal/courses/{id}/assessment")] // bài đánh giá khóa học
    [InlineData("GET", "api/v1/personal/certificates")] // chứng nhận
    [InlineData("GET", "api/v1/individual/subscription")] // gói cá nhân
    public void Can_call(string verb, string route) =>
        EndpointCatalog.RoleCanCall(Role, verb, route).Should().BeTrue();

    [Theory]
    [InlineData("GET", "api/v1/me/pulse/overview")] // cổng nhân viên doanh nghiệp
    [InlineData("GET", "api/v1/members")] // thành viên doanh nghiệp
    [InlineData("GET", "api/v1/workforce")] // nhân sự doanh nghiệp
    [InlineData("GET", "api/v1/intelligence/skill-gaps/me/latest")] // khoảng trống năng lực doanh nghiệp
    [InlineData("GET", "api/v1/notifications")] // thông báo doanh nghiệp
    [InlineData("POST", "api/v1/feedbacks")] // góp ý trong workspace
    [InlineData("GET", "api/v1/platform/overview")] // console nền tảng
    public void Cannot_call(string verb, string route) =>
        EndpointCatalog.RoleCanCall(Role, verb, route).Should().BeFalse();

    [Fact]
    public void Reaches_the_personal_portal_with_a_sign_in_only()
    {
        var personal = EndpointCatalog.All.Where(e => e.Route.StartsWith("api/v1/personal/") && !e.AllowsAnonymous).ToList();
        personal.Should().NotBeEmpty().And.OnlyContain(e => e.RequiresSignIn && e.Permissions.Count == 0);
    }

    [Fact]
    public void Passes_only_the_own_account_permission_filters()
    {
        EndpointCatalog.All.Where(e => e.Permissions.Count > 0 && EndpointCatalog.RoleCanCall(Role, e))
            .Should().OnlyContain(e => e.Permissions.Contains(Permissions.Account.ViewOwn));
    }
}
