using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiTalent.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddIndividualCommerceV3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "email_verified_at",
                table: "users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "trial_used_at",
                table: "users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "email_outbox",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    recipient_email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    template_name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    subject = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    body_html = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "QUEUED"),
                    attempt_count = table.Column<int>(type: "integer", nullable: false),
                    sent_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    error_message = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_email_outbox", x => x.id);
                    table.CheckConstraint("ck_email_outbox_status", "status IN ('QUEUED', 'SENT', 'FAILED')");
                });

            migrationBuilder.CreateTable(
                name: "individual_registrations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    full_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    password_hash = table.Column<string>(type: "text", nullable: false),
                    access_token_hash = table.Column<string>(type: "text", nullable: false),
                    intent = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    selected_plan_code = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: true),
                    selected_cycle = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    pricing_version = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: true),
                    position_code = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    try_orientation_json = table.Column<string>(type: "text", nullable: true),
                    source = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "landing"),
                    accepted_terms_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    state = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "PENDING"),
                    expires_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    used_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_individual_registrations", x => x.id);
                    table.CheckConstraint("ck_ind_reg_intent", "intent IN ('TRIAL', 'PURCHASE')");
                    table.CheckConstraint("ck_ind_reg_state", "state IN ('PENDING', 'VERIFIED', 'EXPIRED', 'CANCELLED')");
                    table.ForeignKey(
                        name: "fk_individual_registrations_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "individual_trial_redemptions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    normalized_email_hmac = table.Column<string>(type: "text", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    registration_id = table.Column<Guid>(type: "uuid", nullable: true),
                    redeemed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_individual_trial_redemptions", x => x.id);
                    table.ForeignKey(
                        name: "fk_individual_trial_redemptions_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "payment_events",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    provider = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "payos"),
                    provider_event_id = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    order_code = table.Column<long>(type: "bigint", nullable: false),
                    amount = table.Column<long>(type: "bigint", nullable: false),
                    currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "VND"),
                    raw_payload = table.Column<string>(type: "text", nullable: false),
                    signature_valid = table.Column<bool>(type: "boolean", nullable: false),
                    processing_status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    processed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_payment_events", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "purchase_drafts",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    plan_code = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    cycle = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    amount = table.Column<long>(type: "bigint", nullable: false),
                    currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "VND"),
                    pricing_version = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "DRAFT"),
                    expires_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_purchase_drafts", x => x.id);
                    table.CheckConstraint("ck_purchase_drafts_amount", "amount > 0");
                    table.CheckConstraint("ck_purchase_drafts_status", "status IN ('DRAFT', 'PAYMENT_PENDING', 'PAID', 'EXPIRED', 'CANCELLED')");
                    table.ForeignKey(
                        name: "fk_purchase_drafts_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "user_subscriptions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    plan_code = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    billing_cycle = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    started_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    current_period_start = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    current_period_end = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    trial_started_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    trial_ends_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    trial_course_limit = table.Column<int>(type: "integer", nullable: false, defaultValue: 3),
                    renewal_mode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "MANUAL"),
                    auto_renew = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    cancel_at_period_end = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_user_subscriptions", x => x.id);
                    table.CheckConstraint("ck_user_subscriptions_status", "status IN ('TRIALING', 'ACTIVE', 'TRIAL_EXPIRED', 'EXPIRED')");
                    table.ForeignKey(
                        name: "fk_user_subscriptions_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "individual_email_verification_challenges",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    registration_id = table.Column<Guid>(type: "uuid", nullable: false),
                    code_hash = table.Column<string>(type: "text", nullable: false),
                    magic_token_hash = table.Column<string>(type: "text", nullable: false),
                    attempt_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    sent_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    expires_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    consumed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    invalidated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_individual_email_verification_challenges", x => x.id);
                    table.CheckConstraint("ck_ind_challenge_attempts", "attempt_count >= 0 AND attempt_count <= 5");
                    table.ForeignKey(
                        name: "fk_individual_email_verification_challenges_individual_registr",
                        column: x => x.registration_id,
                        principalTable: "individual_registrations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "orders",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    order_code = table.Column<long>(type: "bigint", nullable: false),
                    public_code = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    purchase_draft_id = table.Column<Guid>(type: "uuid", nullable: false),
                    amount = table.Column<long>(type: "bigint", nullable: false),
                    currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "VND"),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "PENDING"),
                    payment_method = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "BANK_QR"),
                    payos_payment_link_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    payos_checkout_url = table.Column<string>(type: "text", nullable: true),
                    payos_qr_code = table.Column<string>(type: "text", nullable: true),
                    expires_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    paid_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_orders", x => x.id);
                    table.CheckConstraint("ck_orders_amount", "amount > 0");
                    table.CheckConstraint("ck_orders_status", "status IN ('PENDING', 'PAID', 'FAILED', 'EXPIRED', 'CANCELLED')");
                    table.ForeignKey(
                        name: "fk_orders_purchase_drafts_purchase_draft_id",
                        column: x => x.purchase_draft_id,
                        principalTable: "purchase_drafts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_orders_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_email_outbox_status_attempt",
                table: "email_outbox",
                columns: new[] { "status", "attempt_count" });

            migrationBuilder.CreateIndex(
                name: "ix_ind_challenge_reg_active",
                table: "individual_email_verification_challenges",
                columns: new[] { "registration_id", "consumed_at" });

            migrationBuilder.CreateIndex(
                name: "ux_ind_challenge_magic_token",
                table: "individual_email_verification_challenges",
                column: "magic_token_hash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_ind_reg_expires_at",
                table: "individual_registrations",
                column: "expires_at");

            migrationBuilder.CreateIndex(
                name: "ix_individual_registrations_user_id",
                table: "individual_registrations",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ux_ind_reg_access_token_hash",
                table: "individual_registrations",
                column: "access_token_hash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_ind_trial_redemptions_user",
                table: "individual_trial_redemptions",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ux_ind_trial_redemptions_email",
                table: "individual_trial_redemptions",
                column: "normalized_email_hmac",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_orders_draft",
                table: "orders",
                column: "purchase_draft_id");

            migrationBuilder.CreateIndex(
                name: "ix_orders_user_status",
                table: "orders",
                columns: new[] { "user_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ux_orders_order_code",
                table: "orders",
                column: "order_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_orders_public_code",
                table: "orders",
                column: "public_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_payment_events_provider_order",
                table: "payment_events",
                columns: new[] { "provider", "order_code", "provider_event_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_purchase_drafts_user_status",
                table: "purchase_drafts",
                columns: new[] { "user_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ix_user_subscriptions_user_id",
                table: "user_subscriptions",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "email_outbox");

            migrationBuilder.DropTable(
                name: "individual_email_verification_challenges");

            migrationBuilder.DropTable(
                name: "individual_trial_redemptions");

            migrationBuilder.DropTable(
                name: "orders");

            migrationBuilder.DropTable(
                name: "payment_events");

            migrationBuilder.DropTable(
                name: "user_subscriptions");

            migrationBuilder.DropTable(
                name: "individual_registrations");

            migrationBuilder.DropTable(
                name: "purchase_drafts");

            migrationBuilder.DropColumn(
                name: "email_verified_at",
                table: "users");

            migrationBuilder.DropColumn(
                name: "trial_used_at",
                table: "users");
        }
    }
}
