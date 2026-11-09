using System.Reflection;
using DigiTalent.Api.Authorization;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;

namespace DigiTalent.Tests.Authorization;

/// <summary>One HTTP endpoint of the API and the permissions its [HasPermission] filter asks for (any one of them).</summary>
public sealed record ApiEndpoint(
    string Verb, string Route, string Controller, string Action, IReadOnlyList<string> Permissions, bool AllowsAnonymous, bool RequiresSignIn)
{
    public override string ToString() => $"{Verb} {Route}";
}

/// <summary>
/// Reads every controller action of DigiTalent.Api by reflection. The runtime check is the same as
/// <see cref="HasPermissionAttribute"/>: the caller needs at least one of the listed permissions, granted to one of
/// its roles in role_permissions — which Development seeds from <see cref="RolePermissions.Defaults"/>.
/// </summary>
public static class EndpointCatalog
{
    private static readonly Lazy<IReadOnlyList<ApiEndpoint>> Endpoints = new(Load);

    public static IReadOnlyList<ApiEndpoint> All => Endpoints.Value;

    /// <summary>The endpoint answering <paramref name="verb"/> on <paramref name="route"/> (route template as written, e.g. api/v1/members/{id}).</summary>
    public static ApiEndpoint Find(string verb, string route)
    {
        var matches = All.Where(e => e.Verb == verb && string.Equals(e.Route, route, StringComparison.OrdinalIgnoreCase)).ToList();
        return matches.Count switch
        {
            1 => matches[0],
            0 => throw new InvalidOperationException($"No endpoint {verb} {route}."),
            _ => throw new InvalidOperationException($"Several endpoints answer {verb} {route}."),
        };
    }

    /// <summary>Whether a signed-in account holding only <paramref name="role"/> passes the permission filter.</summary>
    public static bool RoleCanCall(string role, ApiEndpoint endpoint)
    {
        if (endpoint.Permissions.Count == 0)
        {
            return true;
        }

        return RolePermissions.Defaults.TryGetValue(role, out var granted) && endpoint.Permissions.Any(granted.Contains);
    }

    public static bool RoleCanCall(string role, string verb, string route) => RoleCanCall(role, Find(verb, route));

    private static IReadOnlyList<ApiEndpoint> Load()
    {
        var controllers = typeof(HasPermissionAttribute).Assembly.GetTypes()
            .Where(t => t is { IsClass: true, IsAbstract: false } && typeof(ControllerBase).IsAssignableFrom(t));
        var endpoints = new List<ApiEndpoint>();
        foreach (var controller in controllers)
        {
            var name = controller.Name.EndsWith("Controller", StringComparison.Ordinal) ? controller.Name[..^"Controller".Length] : controller.Name;
            var prefix = (controller.GetCustomAttribute<RouteAttribute>()?.Template ?? string.Empty).Replace("[controller]", name.ToLowerInvariant());
            var controllerPermissions = PermissionsOf(controller);
            var controllerAnonymous = controller.GetCustomAttribute<AllowAnonymousAttribute>() != null;
            var controllerAuthorize = controller.GetCustomAttribute<AuthorizeAttribute>() != null;
            foreach (var action in controller.GetMethods(BindingFlags.Instance | BindingFlags.Public | BindingFlags.DeclaredOnly))
            {
                foreach (var http in action.GetCustomAttributes<HttpMethodAttribute>())
                {
                    var template = http.Template ?? action.GetCustomAttribute<RouteAttribute>()?.Template ?? string.Empty;
                    var route = template.StartsWith('/') || template.StartsWith('~')
                        ? template.TrimStart('~', '/')
                        : string.Join('/', new[] { prefix, template }.Where(p => p.Length > 0));
                    var permissions = PermissionsOf(action).Concat(controllerPermissions).Distinct().ToList();
                    var anonymous = controllerAnonymous || action.GetCustomAttribute<AllowAnonymousAttribute>() != null;
                    // [HasPermission] answers 401 to a visitor; [Authorize] asks for a signed-in account of any role.
                    var signIn = !anonymous && (permissions.Count > 0 || controllerAuthorize || action.GetCustomAttribute<AuthorizeAttribute>() != null);
                    foreach (var verb in http.HttpMethods)
                    {
                        endpoints.Add(new ApiEndpoint(verb, route, controller.Name, action.Name, permissions, anonymous, signIn));
                    }
                }
            }
        }

        return endpoints.OrderBy(e => e.Route, StringComparer.Ordinal).ThenBy(e => e.Verb, StringComparer.Ordinal).ToList();
    }

    /// <summary>Constructor arguments of every [HasPermission] on the member (params string[]).</summary>
    private static IEnumerable<string> PermissionsOf(MemberInfo member) =>
        member.GetCustomAttributesData()
            .Where(a => a.AttributeType == typeof(HasPermissionAttribute))
            .SelectMany(a => a.ConstructorArguments)
            .SelectMany(arg => arg.Value is IReadOnlyCollection<CustomAttributeTypedArgument> values
                ? values.Select(v => (string)v.Value!)
                : new[] { (string)arg.Value! });
}
