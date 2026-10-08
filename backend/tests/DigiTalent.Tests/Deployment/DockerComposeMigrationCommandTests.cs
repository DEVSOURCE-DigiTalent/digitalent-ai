using Xunit;

namespace DigiTalent.Tests.Deployment;

public sealed class DockerComposeMigrationCommandTests
{
    [Fact]
    public void BackendApi_ExecutesMigrationScriptThroughShell()
    {
        var repositoryRoot = FindRepositoryRoot();
        var composePath = Path.Combine(repositoryRoot, "docker", "docker-compose.yml");
        var compose = File.ReadAllText(composePath).Replace("\r\n", "\n", StringComparison.Ordinal);

        Assert.Contains("entrypoint: [\"/bin/sh\", \"-c\"]", compose, StringComparison.Ordinal);
        Assert.Contains("command:\n      - |", compose, StringComparison.Ordinal);
        Assert.Contains("dotnet DigiTalent.Api.dll --migrate-only", compose, StringComparison.Ordinal);
        Assert.DoesNotContain("command: >\n      /bin/sh -c", compose, StringComparison.Ordinal);
    }

    private static string FindRepositoryRoot()
    {
        var current = new DirectoryInfo(AppContext.BaseDirectory);

        while (current is not null)
        {
            var composePath = Path.Combine(current.FullName, "docker", "docker-compose.yml");
            if (File.Exists(composePath))
            {
                return current.FullName;
            }

            current = current.Parent;
        }

        throw new DirectoryNotFoundException("Could not locate the repository root from the test output directory.");
    }
}
