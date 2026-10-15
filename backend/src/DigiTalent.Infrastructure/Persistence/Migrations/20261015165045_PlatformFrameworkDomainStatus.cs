using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiTalent.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class PlatformFrameworkDomainStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "status",
                table: "platform_framework_domains",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "ACTIVE");

            migrationBuilder.AddCheckConstraint(
                name: "ck_platform_framework_domains_status",
                table: "platform_framework_domains",
                sql: "status IN ('ACTIVE','ARCHIVED')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_platform_framework_domains_status",
                table: "platform_framework_domains");

            migrationBuilder.DropColumn(
                name: "status",
                table: "platform_framework_domains");
        }
    }
}
