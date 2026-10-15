using Microsoft.EntityFrameworkCore.Migrations;

namespace DigiTalent.Infrastructure.Persistence;

/// <summary>Migration steps that must also succeed on databases where the object already exists.</summary>
public static class MigrationBuilderExtensions
{
    /// <summary>
    /// <c>ALTER TABLE … ADD CONSTRAINT … FOREIGN KEY</c> only when the constraint is missing (PostgreSQL).
    /// Used by the three 2026-10-09 migrations of PR #63: they re-add foreign keys that
    /// 20261006133827_AddAssessmentCertificateAndLearningProgressTables already creates, so on a new database the plain
    /// AddForeignKey stopped the migration chain with 42710 (constraint already exists). Databases that already ran
    /// those migrations are not affected.
    /// </summary>
    public static void AddForeignKeyIfMissing(
        this MigrationBuilder migrationBuilder,
        string name,
        string table,
        string column,
        string principalTable,
        string principalColumn,
        ReferentialAction onDelete)
    {
        var action = onDelete switch
        {
            ReferentialAction.Cascade => "CASCADE",
            ReferentialAction.SetNull => "SET NULL",
            ReferentialAction.SetDefault => "SET DEFAULT",
            ReferentialAction.NoAction => "NO ACTION",
            _ => "RESTRICT",
        };

        migrationBuilder.Sql($"""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint
                    WHERE conname = '{name}' AND conrelid = to_regclass('{table}'))
                THEN
                    ALTER TABLE "{table}" ADD CONSTRAINT "{name}"
                        FOREIGN KEY ("{column}") REFERENCES "{principalTable}" ("{principalColumn}") ON DELETE {action};
                END IF;
            END $$;
            """);
    }
}
