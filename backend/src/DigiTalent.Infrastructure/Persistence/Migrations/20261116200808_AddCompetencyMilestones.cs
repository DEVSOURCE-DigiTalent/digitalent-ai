using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiTalent.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCompetencyMilestones : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "competency_milestones",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    organization_id = table.Column<Guid>(type: "uuid", nullable: false),
                    competency_category_id = table.Column<Guid>(type: "uuid", nullable: false),
                    milestone_level = table.Column<short>(type: "smallint", nullable: false),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_competency_milestones", x => x.id);
                    table.CheckConstraint("ck_competency_milestones_level", "milestone_level BETWEEN 0 AND 3");
                    table.ForeignKey(
                        name: "fk_competency_milestones_competency_categories_competency_cate",
                        column: x => x.competency_category_id,
                        principalTable: "competency_categories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_competency_milestones_organizations_organization_id",
                        column: x => x.organization_id,
                        principalTable: "organizations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_competency_milestones_users_updated_by_user_id",
                        column: x => x.updated_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_competency_milestones_competency_category_id",
                table: "competency_milestones",
                column: "competency_category_id");

            migrationBuilder.CreateIndex(
                name: "ix_competency_milestones_updated_by_user_id",
                table: "competency_milestones",
                column: "updated_by_user_id");

            migrationBuilder.CreateIndex(
                name: "uq_competency_milestones_organization_category",
                table: "competency_milestones",
                columns: new[] { "organization_id", "competency_category_id" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "competency_milestones");
        }
    }
}
