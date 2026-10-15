using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiTalent.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCapabilityCeilings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "capability_ceilings",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    organization_id = table.Column<Guid>(type: "uuid", nullable: false),
                    department_id = table.Column<Guid>(type: "uuid", nullable: true),
                    competency_category_id = table.Column<Guid>(type: "uuid", nullable: false),
                    ceiling_level = table.Column<short>(type: "smallint", nullable: false),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_capability_ceilings", x => x.id);
                    table.CheckConstraint("ck_capability_ceilings_level", "ceiling_level BETWEEN 0 AND 3");
                    table.ForeignKey(
                        name: "fk_capability_ceilings_competency_categories_competency_catego",
                        column: x => x.competency_category_id,
                        principalTable: "competency_categories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_capability_ceilings_departments_department_id",
                        column: x => x.department_id,
                        principalTable: "departments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_capability_ceilings_organizations_organization_id",
                        column: x => x.organization_id,
                        principalTable: "organizations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_capability_ceilings_users_updated_by_user_id",
                        column: x => x.updated_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_capability_ceilings_competency_category_id",
                table: "capability_ceilings",
                column: "competency_category_id");

            migrationBuilder.CreateIndex(
                name: "ix_capability_ceilings_updated_by_user_id",
                table: "capability_ceilings",
                column: "updated_by_user_id");

            migrationBuilder.CreateIndex(
                name: "uq_capability_ceilings_department_category",
                table: "capability_ceilings",
                columns: new[] { "department_id", "competency_category_id" },
                unique: true,
                filter: "department_id IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "uq_capability_ceilings_organization_category",
                table: "capability_ceilings",
                columns: new[] { "organization_id", "competency_category_id" },
                unique: true,
                filter: "department_id IS NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "capability_ceilings");
        }
    }
}
