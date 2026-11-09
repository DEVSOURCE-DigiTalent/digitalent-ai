using DigiTalent.Domain.Constants.Authorization;
using FluentAssertions;
using Xunit;

namespace DigiTalent.Tests.Authorization;

/// <summary>Every API endpoint is either guarded (permission or sign-in) or public on purpose.</summary>
public class EndpointCoverageTests
{
    /// <summary>
    /// Endpoints reachable without signing in by design: sign-in and password flows, invitation links, payment
    /// webhooks, HMAC-signed media links, the public individual plans/registration and the public enterprise trial.
    /// </summary>
    private static readonly string[] PublicRoutes =
    {
        "api/v1/auth/login", "api/v1/auth/refresh", "api/v1/auth/logout", "api/v1/auth/forgot-password",
        "api/v1/auth/reset-password", "api/v1/auth/reset-password/validate", "api/v1/auth/send-email-verification",
        "api/v1/auth/verify-business-email", "api/v1/auth/verify-email",
        "api/v1/invitations/{token}", "api/v1/invitations/activate",
        "api/v1/payment-webhooks/payos",
        "api/v1/platform/assets/{id:guid}/content", "api/v1/pulse/recordings/{recordingId:guid}/content",
        "api/v1/individual/plans", "api/v1/individual/plans/{planCode}",
        "api/v1/individual-registrations", "api/v1/individual-registrations/{id:guid}",
        "api/v1/individual-registrations/{id:guid}/resend", "api/v1/individual-registrations/{id:guid}/verify",
    };

    [Fact]
    public void The_catalog_reads_the_api_controllers()
    {
        EndpointCatalog.All.Should().HaveCountGreaterThan(300);
        EndpointCatalog.Find("GET", "api/v1/members").Permissions.Should().Equal(Permissions.UserRole.UserRead);
    }

    [Fact]
    public void Every_endpoint_is_guarded_or_public_on_purpose()
    {
        var open = EndpointCatalog.All.Where(e => !e.RequiresSignIn && !e.AllowsAnonymous && !PublicRoutes.Contains(e.Route));

        open.Select(e => e.ToString()).Should().BeEmpty("a new endpoint needs [HasPermission], [Authorize] or a reason to be public");
    }

    [Fact]
    public void Public_routes_still_exist()
    {
        PublicRoutes.Should().OnlyContain(route => EndpointCatalog.All.Any(e => e.Route == route));
    }

    [Fact]
    public void Every_permission_asked_by_an_endpoint_is_declared()
    {
        var declared = Permissions.All().ToHashSet();

        EndpointCatalog.All.SelectMany(e => e.Permissions).Distinct().Where(p => !declared.Contains(p))
            .Should().BeEmpty();
    }

    [Fact]
    public void Every_default_grant_is_a_declared_permission()
    {
        var declared = Permissions.All().ToHashSet();

        RolePermissions.Defaults.SelectMany(r => r.Value.Select(p => $"{r.Key}:{p}")).Where(g => !declared.Contains(g.Split(':')[1]))
            .Should().BeEmpty();
    }
}
