using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiTalent.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddTrialEssayScores : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ai_essay_review",
                table: "trial_assessments",
                type: "jsonb",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "ai_essay_reviewed_at",
                table: "trial_assessments",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<short>(
                name: "essay_advanced_score",
                table: "trial_assessments",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<short>(
                name: "essay_basic_score",
                table: "trial_assessments",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<short>(
                name: "essay_intermediate_score",
                table: "trial_assessments",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddCheckConstraint(
                name: "ck_trial_assessments_ai_review",
                table: "trial_assessments",
                sql: "(ai_essay_review IS NULL) = (ai_essay_reviewed_at IS NULL)");

            migrationBuilder.AddCheckConstraint(
                name: "ck_trial_assessments_essay_scores",
                table: "trial_assessments",
                sql: "(essay_basic_score IS NULL OR essay_basic_score BETWEEN 0 AND 10) AND (essay_intermediate_score IS NULL OR essay_intermediate_score BETWEEN 0 AND 10) AND (essay_advanced_score IS NULL OR essay_advanced_score BETWEEN 0 AND 10)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_trial_assessments_ai_review",
                table: "trial_assessments");

            migrationBuilder.DropCheckConstraint(
                name: "ck_trial_assessments_essay_scores",
                table: "trial_assessments");

            migrationBuilder.DropColumn(
                name: "ai_essay_review",
                table: "trial_assessments");

            migrationBuilder.DropColumn(
                name: "ai_essay_reviewed_at",
                table: "trial_assessments");

            migrationBuilder.DropColumn(
                name: "essay_advanced_score",
                table: "trial_assessments");

            migrationBuilder.DropColumn(
                name: "essay_basic_score",
                table: "trial_assessments");

            migrationBuilder.DropColumn(
                name: "essay_intermediate_score",
                table: "trial_assessments");
        }
    }
}
