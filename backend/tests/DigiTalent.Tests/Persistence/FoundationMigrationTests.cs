using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Infrastructure.Persistence;
using DigiTalent.Infrastructure.Persistence.Seed;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Persistence;

[Collection("PostgresIntegration")]
public class FoundationMigrationTests
{
    private DbContextOptions<AppDbContext> GetOptions(string dbName) =>
        new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;

    [Fact]
    public async Task FoundationModelExposesExpectedDbSets()
    {
        var dbName = Guid.NewGuid().ToString();
        using var context = new AppDbContext(GetOptions(dbName));

        // In-memory only verifies the model surface; PostgreSQL_CanApplyMigrationsAndVerifySchema checks the actual schema.
        var users = await context.Users.ToListAsync();
        var roles = await context.Roles.ToListAsync();
        var departments = await context.Departments.ToListAsync();
        var organizations = await context.Organizations.ToListAsync();

        users.Should().NotBeNull();
        roles.Should().NotBeNull();
        departments.Should().NotBeNull();
        organizations.Should().NotBeNull();
    }

    [Fact]
    public async Task SeedTwiceDoesNotDuplicateRolesOrUsers()
    {
        var dbName = Guid.NewGuid().ToString();
        using var context = new AppDbContext(GetOptions(dbName));

        var passwordHasher = new Mock<IPasswordHasher>();
        passwordHasher.Setup(p => p.Hash(It.IsAny<string>())).Returns("hashed_password");

        await DbSeeder.SeedAsync(context, passwordHasher.Object);
        var initialUserCount = await context.Users.CountAsync();
        var initialRoleCount = await context.Roles.CountAsync();
        var initialOrgCount = await context.Organizations.CountAsync();

        await DbSeeder.SeedAsync(context, passwordHasher.Object);
        var finalUserCount = await context.Users.CountAsync();
        var finalRoleCount = await context.Roles.CountAsync();
        var finalOrgCount = await context.Organizations.CountAsync();

        finalUserCount.Should().Be(initialUserCount);
        finalRoleCount.Should().Be(initialRoleCount);
        finalOrgCount.Should().Be(initialOrgCount);
    }

    [Fact]
    public async Task ReferenceSeedDoesNotCreateDemoUsersOrOrganization()
    {
        using var context = new AppDbContext(GetOptions(Guid.NewGuid().ToString()));

        await DbSeeder.SeedReferenceDataAsync(context);

        (await context.Roles.CountAsync()).Should().BeGreaterThan(0);
        (await context.Permissions.CountAsync()).Should().BeGreaterThan(0);
        (await context.Users.CountAsync()).Should().Be(0);
        (await context.Organizations.CountAsync()).Should().Be(0);
    }

    [Fact]
    public async Task DevelopmentSeedUsesConfiguredPassword()
    {
        using var context = new AppDbContext(GetOptions(Guid.NewGuid().ToString()));
        var hasher = new Mock<IPasswordHasher>();
        hasher.Setup(h => h.Hash("test-only-password")).Returns("hashed-password");

        await DbSeeder.SeedAsync(context, hasher.Object, "test-only-password");

        hasher.Verify(h => h.Hash("test-only-password"), Times.Once);
        var seededEmails = await context.Users.Select(user => user.Email).ToListAsync();
        seededEmails.Should().HaveCount(8);
        seededEmails.Should().Contain(new[]
        {
            "personal@digitalent.ai",
            "trial@digitalent.ai",
            "free@digitalent.ai",
        });
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task PostgreSQL_CanApplyMigrationsAndVerifySchema()
    {
        using var context = PostgresTestDatabase.CreateContext();
        await PostgresTestDatabase.MigrateAsync(context);

        var applied = await context.Database.GetAppliedMigrationsAsync();
        applied.Should().Contain("20260926060421_InitialFoundation");
        applied.Should().Contain("20260927145053_AddLearnerProfileAndCareerRoleTemplateId");

        var expectedTables = new[]
        {
            "organizations", "permissions", "roles", "job_families", "users",
            "role_permissions", "job_positions", "audit_logs", "refresh_tokens",
            "system_settings", "user_roles", "departments", "employees",
            "learner_profiles"
        };
        foreach (var table in expectedTables)
        {
            var exists = await context.Database.SqlQueryRaw<bool>(
                "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = {0}) AS \"Value\"",
                table).SingleAsync();
            exists.Should().BeTrue($"table {table} must exist after migrations");
        }

        var requiredColumns = new[]
        {
            (Table: "users", Column: "organization_id"),
            (Table: "departments", Column: "organization_id"),
            (Table: "job_positions", Column: "job_family_id"),
            (Table: "job_positions", Column: "career_role_template_id"),
            (Table: "employees", Column: "job_position_id"),
            (Table: "learner_profiles", Column: "user_id"),
            (Table: "learner_profiles", Column: "target_role_id")
        };
        foreach (var (table, column) in requiredColumns)
        {
            var exists = await context.Database.SqlQueryRaw<bool>(
                "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = {0} AND column_name = {1}) AS \"Value\"",
                table, column).SingleAsync();
            exists.Should().BeTrue($"column {table}.{column} must exist after migrations");
        }
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task PostgreSQL_SprintThreeTablesMatchCanonicalConstraints()
    {
        using var context = PostgresTestDatabase.CreateContext();
        await PostgresTestDatabase.MigrateAsync(context);

        var sprintThreeTables = new[]
        {
            "skill_gap_runs", "skill_gap_items", "employee_competency_profiles", "competency_evidences",
            "competency_evaluation_results", "courses", "course_competencies", "course_assignments",
            "enrollments", "scoring_configs", "scoring_config_items", "notifications",
            "practical_task_templates", "task_assignments", "task_submissions", "task_evaluations"
        };
        foreach (var table in sprintThreeTables)
        {
            (await ExistsAsync(context,
                "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = {0}) AS \"Value\"",
                table)).Should().BeTrue($"table {table} must exist after migrations");
        }

        // Các bảng chưa có config đầy đủ phải chưa được tạo (ExcludeFromMigrations)
        (await ExistsAsync(context,
            "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = {0}) AS \"Value\"",
            "certificate_verification_logs")).Should().BeFalse("certificate_verification_logs is excluded until its configuration matches SQL v2.3");

        var canonicalConstraints = new[]
        {
            "ck_skill_gap_items_severity", "ck_gap_current_level", "ck_gap_required_level",
            "ck_skill_gap_runs_generated_by", "ck_profile_confirmed_level",
            "ck_competency_evidences_source_type", "ck_competency_evidences_level_confirming_rule",
            "ck_course_coverage_type", "ck_courses_status", "ck_enrollments_status", "ck_scoring_configs_type"
        };
        foreach (var constraint in canonicalConstraints)
        {
            (await ExistsAsync(context,
                "SELECT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = {0}) AS \"Value\"",
                constraint)).Should().BeTrue($"constraint {constraint} must match the canonical SQL");
        }

        var canonicalIndexes = new[]
        {
            "uq_skill_gap_items_run_competency", "uq_employee_competency_profiles_employee_competency",
            "ix_skill_gap_runs_employee_generated_desc", "ux_enrollments_one_active",
            "ux_scoring_configs_active", "uq_courses_org_code_version",
            "uq_task_submissions_assignment_version", "ix_task_submissions_assignment"
        };
        foreach (var index in canonicalIndexes)
        {
            (await ExistsAsync(context,
                "SELECT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = {0}) AS \"Value\"",
                index)).Should().BeTrue($"index {index} must match the canonical SQL");
        }
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task PostgreSQL_LearnerSelfServiceTablesMatchCanonicalConstraints()
    {
        using var context = PostgresTestDatabase.CreateContext();
        await PostgresTestDatabase.MigrateAsync(context);

        var tables = new[]
        {
            "question_banks", "questions", "question_options", "assessments", "assessment_questions",
            "assessment_attempts", "assessment_answers", "certificate_templates", "certificates", "file_objects",
            "course_learning_outcomes", "learning_materials", "lesson_progress",
            "practical_task_targets", "assigned_task_targets", "task_submission_files"
        };
        foreach (var table in tables)
        {
            (await ExistsAsync(context,
                "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = {0}) AS \"Value\"",
                table)).Should().BeTrue($"table {table} must exist after migrations");
        }

        var canonicalConstraints = new[]
        {
            "ck_questions_type", "ck_assessments_final_type", "ck_assessments_passing_score",
            "ck_assessment_attempts_status", "ck_assessment_attempts_submitted_after_start",
            "ck_certificates_revocation_fields", "ck_certificates_expiry", "ck_file_objects_access_level",
            "ck_learning_materials_exactly_one_source", "ck_lesson_progress_status", "ck_assigned_task_targets_level"
        };
        foreach (var constraint in canonicalConstraints)
        {
            (await ExistsAsync(context,
                "SELECT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = {0}) AS \"Value\"",
                constraint)).Should().BeTrue($"constraint {constraint} must match the canonical SQL");
        }

        var canonicalIndexes = new[]
        {
            "uq_assessments_course_code_version", "ux_assessments_one_published_final",
            "uq_assessment_attempts_assessment_enrollment_attempt", "uq_assessment_answers_attempt_question",
            "ix_certificates_employee", "uq_lesson_progress_enrollment_lesson",
            "uq_practical_task_targets_template_competency", "uq_assigned_task_targets_assignment_competency"
        };
        foreach (var index in canonicalIndexes)
        {
            (await ExistsAsync(context,
                "SELECT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = {0}) AS \"Value\"",
                index)).Should().BeTrue($"index {index} must match the canonical SQL");
        }
    }

    private static Task<bool> ExistsAsync(AppDbContext context, string sql, params object[] parameters) =>
        context.Database.SqlQueryRaw<bool>(sql, parameters).SingleAsync();
}
