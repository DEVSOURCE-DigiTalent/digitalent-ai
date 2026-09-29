using DigiTalent.Domain.Entities;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace DigiTalent.Tests.Persistence;

/// <summary>
/// competency_frameworks, competency_framework_mappings và course_prerequisites phải khớp SQL v2.3
/// (căn cứ Thông tư 02/2025 — Giai đoạn B, bước B2).
/// </summary>
[Collection("PostgresIntegration")]
public class CompetencyFrameworkMigrationTests
{
    [Fact]
    [Trait("Category", "Integration")]
    public async Task PostgreSQL_FrameworkMappingAndPrerequisiteTablesMatchCanonicalSql()
    {
        using var context = PostgresTestDatabase.CreateContext();
        await PostgresTestDatabase.MigrateAsync(context);

        foreach (var table in new[] { "competency_frameworks", "competency_framework_mappings", "course_prerequisites" })
        {
            (await ExistsAsync(context,
                "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = {0}) AS \"Value\"",
                table)).Should().BeTrue($"table {table} must exist after migrations");
        }

        var constraints = new[]
        {
            "uq_competency_frameworks_code_version",
            "uq_competency_framework_mapping",
            "ck_competency_framework_mapping_relationship",
            "ck_course_prerequisite_not_self",
        };
        foreach (var constraint in constraints)
        {
            (await ExistsAsync(context,
                "SELECT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = {0} " +
                "UNION ALL SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = {0}) AS \"Value\"",
                constraint)).Should().BeTrue($"constraint {constraint} must match the canonical SQL");
        }

        var foreignKeys = await context.Database.SqlQueryRaw<string>(
            "SELECT c.relname || '.' || a.attname AS \"Value\" FROM pg_constraint k " +
            "JOIN pg_class c ON c.oid = k.conrelid JOIN pg_attribute a ON a.attrelid = k.conrelid AND a.attnum = ANY (k.conkey) " +
            "WHERE k.contype = 'f' AND c.relname IN ('competency_framework_mappings', 'course_prerequisites')")
            .ToListAsync();
        foreignKeys.Should().Contain(new[]
        {
            "competency_framework_mappings.competency_id",
            "competency_framework_mappings.framework_id",
            "competency_framework_mappings.reviewed_by_user_id",
            "course_prerequisites.course_id",
            "course_prerequisites.prerequisite_course_id",
        });
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task PostgreSQL_FrameworkCodeAndVersionAreUnique()
    {
        using var context = PostgresTestDatabase.CreateContext();
        await PostgresTestDatabase.MigrateAsync(context);

        var code = $"FW_{Guid.NewGuid():N}"[..20];
        context.CompetencyFrameworks.Add(new CompetencyFramework { Code = code, Version = "v1", Name = "Framework", IsActive = true });
        await context.SaveChangesAsync();

        using var second = PostgresTestDatabase.CreateContext();
        second.CompetencyFrameworks.Add(new CompetencyFramework { Code = code, Version = "v1", Name = "Duplicate", IsActive = true });
        var duplicate = async () => await second.SaveChangesAsync();

        await duplicate.Should().ThrowAsync<DbUpdateException>();
    }

    private static Task<bool> ExistsAsync(DbContext context, string sql, params object[] parameters) =>
        context.Database.SqlQueryRaw<bool>(sql, parameters).SingleAsync();
}
