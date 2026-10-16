using DigiTalent.Infrastructure.Persistence;
using DigiTalent.Infrastructure.Persistence.Seed;
using Microsoft.EntityFrameworkCore;
using Npgsql;

if (args.Length != 2 || args[0] is not ("--dry-run" or "--apply" or "--import-sql"))
{
    Console.Error.WriteLine("Usage: Domain1SeedRunner --dry-run|--apply <organization-id> | --import-sql <generated-sql-file>");
    return 2;
}

var connectionString = Environment.GetEnvironmentVariable("DIGITALENT_DB_CONNECTION");
if (string.IsNullOrWhiteSpace(connectionString))
{
    Console.Error.WriteLine("Set DIGITALENT_DB_CONNECTION in the current process.");
    return 2;
}

if (args[0] == "--import-sql")
{
    if (!File.Exists(args[1]) || Path.GetExtension(args[1]) != ".sql")
    {
        Console.Error.WriteLine("Generated SQL file not found.");
        return 2;
    }
    var sql = await File.ReadAllTextAsync(args[1]);
    const string directive = "\\set ON_ERROR_STOP on";
    var firstLineEnd = sql.IndexOf('\n');
    if (!sql.StartsWith(directive, StringComparison.Ordinal) || firstLineEnd < 0)
    {
        Console.Error.WriteLine("Expected a generated Domain I SQL file.");
        return 2;
    }
    var statement = sql[(firstLineEnd + 1)..];
    var mode = statement.TrimEnd().EndsWith("ROLLBACK;", StringComparison.Ordinal) ? "dry-run"
        : statement.TrimEnd().EndsWith("COMMIT;", StringComparison.Ordinal) ? "apply" : null;
    if (mode == null)
    {
        Console.Error.WriteLine("Generated SQL must end in ROLLBACK or COMMIT.");
        return 2;
    }
    await using var connection = new NpgsqlConnection(connectionString);
    await connection.OpenAsync();
    await using var command = new NpgsqlCommand(statement, connection) { CommandTimeout = 120 };
    await command.ExecuteNonQueryAsync();
    Console.WriteLine($"Domain I SQL {mode} completed.");
    return 0;
}

if (!Guid.TryParse(args[1], out var organizationId))
{
    Console.Error.WriteLine("Invalid organization ID.");
    return 2;
}

var options = new DbContextOptionsBuilder<AppDbContext>()
    .UseNpgsql(connectionString)
    .UseSnakeCaseNamingConvention()
    .Options;
await using var db = new AppDbContext(options);
if (!await db.Organizations.AnyAsync(o => o.Id == organizationId))
{
    Console.Error.WriteLine("Organization not found.");
    return 2;
}

await using var transaction = await db.Database.BeginTransactionAsync();
await SkillGapSeeder.EnsureOrganizationFrameworkAndCoursesAsync(db, organizationId);
var categories = await db.CompetencyCategories.CountAsync(c => c.OrganizationId == organizationId);
var courses = await db.Courses.CountAsync(c => c.OrganizationId == organizationId);
var domain1 = await db.Courses.CountAsync(c => c.OrganizationId == organizationId &&
    (c.Code == "A1-F" || c.Code == "A1-I" || c.Code == "A1-A"));
if (categories < 6 || courses < 18 || domain1 < 3)
    throw new InvalidOperationException($"Incomplete catalog: {categories} domains, {courses} courses, {domain1} Domain I courses.");

if (args[0] == "--apply") await transaction.CommitAsync();
else await transaction.RollbackAsync();

Console.WriteLine($"{args[0]}: {categories} domains, {courses} courses, {domain1} Domain I courses.");
return 0;
