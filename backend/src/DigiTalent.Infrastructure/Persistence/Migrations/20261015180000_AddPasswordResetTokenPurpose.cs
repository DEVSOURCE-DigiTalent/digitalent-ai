using DigiTalent.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiTalent.Infrastructure.Persistence.Migrations;

/// <summary>
/// Thêm cột purpose vào bảng password_reset_tokens để phân biệt:
///   RESET_PASSWORD — quên mật khẩu (hành vi cũ, mặc định)
///   VERIFY_EMAIL   — OTP xác minh email Business Owner mới đăng ký
/// </summary>
[DbContext(typeof(AppDbContext))]
[Migration("20261015180000_AddPasswordResetTokenPurpose")]
public sealed class AddPasswordResetTokenPurpose : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Thêm cột purpose với default RESET_PASSWORD cho các row cũ
        migrationBuilder.AddColumn<string>(
            name: "purpose",
            table: "password_reset_tokens",
            type: "character varying(30)",
            maxLength: 30,
            nullable: false,
            defaultValue: "RESET_PASSWORD");

        // CHECK constraint đảm bảo chỉ 2 giá trị hợp lệ
        migrationBuilder.Sql(@"
            ALTER TABLE password_reset_tokens
            ADD CONSTRAINT ck_password_reset_tokens_purpose
            CHECK (purpose IN ('RESET_PASSWORD','VERIFY_EMAIL'));
        ");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            ALTER TABLE password_reset_tokens
            DROP CONSTRAINT IF EXISTS ck_password_reset_tokens_purpose;
        ");

        migrationBuilder.DropColumn(
            name: "purpose",
            table: "password_reset_tokens");
    }
}
