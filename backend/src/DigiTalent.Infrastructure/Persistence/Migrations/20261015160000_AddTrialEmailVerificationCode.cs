using DigiTalent.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiTalent.Infrastructure.Persistence.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20261015160000_AddTrialEmailVerificationCode")]
public sealed class AddTrialEmailVerificationCode : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(name: "otp_hash", table: "trial_registrations", type: "text", nullable: true);
        migrationBuilder.AddColumn<int>(name: "otp_failed_attempts", table: "trial_registrations", type: "integer", nullable: false, defaultValue: 0);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "otp_hash", table: "trial_registrations");
        migrationBuilder.DropColumn(name: "otp_failed_attempts", table: "trial_registrations");
    }
}
