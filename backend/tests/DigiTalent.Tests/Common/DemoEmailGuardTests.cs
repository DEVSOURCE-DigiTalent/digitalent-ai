using DigiTalent.Application.Common.Email;
using FluentAssertions;
using Xunit;

namespace DigiTalent.Tests.Common;

public class DemoEmailGuardTests
{
    [Theory]
    [InlineData("owner@demo.nanglucso.pro.vn", true)]
    [InlineData("  OWNER@DEMO.NANGLUCSO.PRO.VN  ", true)]
    [InlineData("emp.01@demo.nanglucso.pro.vn", true)]
    [InlineData("user@nanglucso.pro.vn", false)]
    [InlineData("user@digitalent.ai", false)]
    [InlineData("demo.nanglucso.pro.vn", false)]
    [InlineData("", false)]
    [InlineData(null, false)]
    public void IsDemoAddress_DetectsDemoDomainCaseInsensitively(string? email, bool expected) =>
        DemoEmailGuard.IsDemoAddress(email).Should().Be(expected);
}
