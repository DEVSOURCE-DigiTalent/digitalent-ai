using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiTalent.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ProctoringFaceEvents : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_proctoring_events_kind",
                table: "proctoring_events");

            migrationBuilder.AddCheckConstraint(
                name: "ck_proctoring_events_kind",
                table: "proctoring_events",
                sql: "kind IN ('STARTED', 'TAB_HIDDEN', 'FOCUS_LOST', 'SHARE_STOPPED', 'SHARE_RESUMED', 'CAMERA_STOPPED', 'CAMERA_RESUMED', 'MIC_STOPPED', 'MIC_RESUMED', 'SUBMITTED', 'FACE_MISSING', 'MULTIPLE_FACES', 'LOOKING_AWAY', 'FACE_CHECK_ON', 'FACE_CHECK_OFF')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_proctoring_events_kind",
                table: "proctoring_events");

            migrationBuilder.AddCheckConstraint(
                name: "ck_proctoring_events_kind",
                table: "proctoring_events",
                sql: "kind IN ('STARTED', 'TAB_HIDDEN', 'FOCUS_LOST', 'SHARE_STOPPED', 'SHARE_RESUMED', 'CAMERA_STOPPED', 'CAMERA_RESUMED', 'MIC_STOPPED', 'MIC_RESUMED', 'SUBMITTED')");
        }
    }
}
