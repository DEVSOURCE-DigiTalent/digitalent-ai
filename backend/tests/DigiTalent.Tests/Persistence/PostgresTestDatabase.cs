using DigiTalent.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Xunit;

namespace DigiTalent.Tests.Persistence;

[CollectionDefinition("PostgresIntegration", DisableParallelization = true)]
public sealed class PostgresIntegrationCollection { }

internal static class PostgresTestDatabase
{
    public static AppDbContext CreateContext()
    {
        var connectionString = Environment.GetEnvironmentVariable("DIGITALENT_TEST_POSTGRES_CONNECTION");
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "PostgreSQL integration tests require DIGITALENT_TEST_POSTGRES_CONNECTION for a disposable test database.");
        }

        var parsed = new NpgsqlConnectionStringBuilder(connectionString);
        if (string.IsNullOrWhiteSpace(parsed.Database) ||
            !parsed.Database.EndsWith("_test", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Integration tests may only use a database whose name ends with _test.");
        }

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(connectionString)
            .UseSnakeCaseNamingConvention()
            .Options;
        return new AppDbContext(options);
    }

    public static async Task MigrateAsync(AppDbContext context)
    {
        if (!await context.Database.CanConnectAsync())
        {
            throw new InvalidOperationException("PostgreSQL test database is unavailable; integration tests cannot pass without it.");
        }

        await context.Database.MigrateAsync();
    }
}
