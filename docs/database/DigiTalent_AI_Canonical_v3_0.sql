-- ============================================================================
-- DigiTalent AI — Canonical Database Schema v3.0
-- Target: PostgreSQL 16+
-- Source: DigiTalent_AI_Canonical_v2_3.sql + Individual Registration & Commerce v3.0
--
-- This file is the SINGLE SOURCE OF TRUTH for the data model in v3.0.
-- EF Core entities, configurations and migrations are written to match it.
--
-- Changes v2.3 -> v3.0:
--   * users: thêm email_verified_at (timestamptz nullable) và trial_used_at (timestamptz nullable).
--   * Bổ sung Section 16: INDIVIDUAL COMMERCE & REGISTRATION (Phase 1):
--       1. individual_registrations: pending registration (TRIAL / PURCHASE), password hash, OTP hash.
--       2. individual_email_verification_challenges: OTP 6 số (HMAC peppered) và magic token hash.
--       3. individual_trial_redemptions: ledger chống lạm dụng dùng thử nhiều lần.
--       4. user_subscriptions: hợp đồng subscription cá nhân (TRIALING, ACTIVE, TRIAL_EXPIRED, EXPIRED).
--       5. purchase_drafts: draft mua gói 7 ngày trước khi checkout.
--       6. orders: đơn hàng thanh toán VietQR / PayOS.
--       7. payment_events: webhook events bất biến từ payment provider (PayOS).
--       8. email_outbox: hàng đợi gửi email giao dịch tin cậy qua background worker.
-- ============================================================================

\i DigiTalent_AI_Canonical_v2_3.sql

BEGIN;

-- ============================================================================
-- CẬP NHẬT USERS (Phase 1)
-- ============================================================================

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS email_verified_at timestamptz,
    ADD COLUMN IF NOT EXISTS trial_used_at timestamptz;

-- ============================================================================
-- 16. INDIVIDUAL COMMERCE & REGISTRATION (Phase 1)
-- ============================================================================

-- 16.1. Pending Registration
CREATE TABLE individual_registrations (
    id                  uuid PRIMARY KEY,
    email               varchar(255) NOT NULL,
    full_name           varchar(200) NOT NULL,
    password_hash       text         NOT NULL,
    access_token_hash   text         NOT NULL,
    intent              varchar(20)  NOT NULL, -- 'TRIAL', 'PURCHASE'
    selected_plan_code  varchar(40),
    selected_cycle      varchar(20),           -- 'MONTH', 'YEAR'
    pricing_version     varchar(40),
    position_code       varchar(80),
    try_orientation_json jsonb,
    source              varchar(30)  DEFAULT 'landing',
    accepted_terms_at   timestamptz  NOT NULL,
    state               varchar(30)  NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'VERIFIED', 'EXPIRED', 'CANCELLED'
    expires_at          timestamptz  NOT NULL,
    used_at             timestamptz,
    user_id             uuid REFERENCES users(id),
    created_at          timestamptz  NOT NULL,
    updated_at          timestamptz  NOT NULL,
    CONSTRAINT ck_ind_reg_intent
        CHECK (intent IN ('TRIAL', 'PURCHASE')),
    CONSTRAINT ck_ind_reg_state
        CHECK (state IN ('PENDING', 'VERIFIED', 'EXPIRED', 'CANCELLED'))
);

CREATE UNIQUE INDEX ux_ind_reg_email_pending
    ON individual_registrations (lower(email))
    WHERE state = 'PENDING';

CREATE UNIQUE INDEX ux_ind_reg_access_token_hash
    ON individual_registrations (access_token_hash);

CREATE INDEX ix_ind_reg_expires_at
    ON individual_registrations (expires_at);

-- 16.2. Email Verification Challenges (OTP & Magic link)
CREATE TABLE individual_email_verification_challenges (
    id                  uuid PRIMARY KEY,
    registration_id     uuid NOT NULL REFERENCES individual_registrations(id) ON DELETE CASCADE,
    code_hash           text NOT NULL, -- HMAC-SHA256(pepper, challengeId + otp)
    magic_token_hash    text NOT NULL,
    attempt_count       integer NOT NULL DEFAULT 0,
    sent_at             timestamptz NOT NULL,
    expires_at          timestamptz NOT NULL,
    consumed_at         timestamptz,
    invalidated_at      timestamptz,
    created_at          timestamptz NOT NULL,
    updated_at          timestamptz NOT NULL,
    CONSTRAINT ck_ind_challenge_attempts
        CHECK (attempt_count >= 0 AND attempt_count <= 5)
);

CREATE UNIQUE INDEX ux_ind_challenge_magic_token
    ON individual_email_verification_challenges (magic_token_hash);

CREATE INDEX ix_ind_challenge_reg_active
    ON individual_email_verification_challenges (registration_id, consumed_at)
    WHERE consumed_at IS NULL AND invalidated_at IS NULL;

-- 16.3. Trial Redemption Ledger (Anti-abuse)
CREATE TABLE individual_trial_redemptions (
    id                      uuid PRIMARY KEY,
    normalized_email_hmac   text NOT NULL UNIQUE,
    user_id                 uuid NOT NULL REFERENCES users(id),
    registration_id         uuid REFERENCES individual_registrations(id),
    redeemed_at             timestamptz NOT NULL,
    created_at              timestamptz NOT NULL
);

CREATE INDEX ix_ind_trial_redemptions_user
    ON individual_trial_redemptions (user_id);

-- 16.4. User Subscriptions (Cá nhân)
CREATE TABLE user_subscriptions (
    id                  uuid PRIMARY KEY,
    user_id             uuid NOT NULL REFERENCES users(id),
    plan_code           varchar(40)  NOT NULL, -- 'IND_PLUS', 'IND_PRO'
    status              varchar(30)  NOT NULL, -- 'TRIALING', 'ACTIVE', 'TRIAL_EXPIRED', 'EXPIRED'
    billing_cycle       varchar(20),           -- 'MONTH', 'YEAR'
    started_at          timestamptz  NOT NULL,
    current_period_start timestamptz,
    current_period_end   timestamptz,
    trial_started_at    timestamptz,
    trial_ends_at       timestamptz,
    trial_course_limit  integer      DEFAULT 3,
    renewal_mode        varchar(20)  NOT NULL DEFAULT 'MANUAL',
    auto_renew          boolean      NOT NULL DEFAULT false,
    cancel_at_period_end boolean     NOT NULL DEFAULT false,
    created_at          timestamptz  NOT NULL,
    updated_at          timestamptz  NOT NULL,
    CONSTRAINT ck_user_subscriptions_status
        CHECK (status IN ('TRIALING', 'ACTIVE', 'TRIAL_EXPIRED', 'EXPIRED'))
);

CREATE UNIQUE INDEX ux_user_subscriptions_active_per_user
    ON user_subscriptions (user_id)
    WHERE status IN ('TRIALING', 'ACTIVE');

-- 16.5. Purchase Drafts
CREATE TABLE purchase_drafts (
    id                  uuid PRIMARY KEY,
    user_id             uuid NOT NULL REFERENCES users(id),
    plan_code           varchar(40) NOT NULL,
    cycle               varchar(20) NOT NULL, -- 'MONTH', 'YEAR'
    amount              bigint      NOT NULL,
    currency            varchar(10) NOT NULL DEFAULT 'VND',
    pricing_version     varchar(40) NOT NULL,
    status              varchar(30) NOT NULL DEFAULT 'DRAFT', -- 'DRAFT', 'PAYMENT_PENDING', 'PAID', 'EXPIRED', 'CANCELLED'
    expires_at          timestamptz NOT NULL,
    created_at          timestamptz NOT NULL,
    updated_at          timestamptz NOT NULL,
    CONSTRAINT ck_purchase_drafts_status
        CHECK (status IN ('DRAFT', 'PAYMENT_PENDING', 'PAID', 'EXPIRED', 'CANCELLED')),
    CONSTRAINT ck_purchase_drafts_amount
        CHECK (amount > 0)
);

CREATE INDEX ix_purchase_drafts_user_status
    ON purchase_drafts (user_id, status);

-- 16.6. Orders (PayOS / VietQR)
CREATE TABLE orders (
    id                  uuid PRIMARY KEY,
    order_code          bigint       NOT NULL UNIQUE, -- PayOS orderCode (positive int64)
    public_code         varchar(30)  NOT NULL UNIQUE,
    user_id             uuid         NOT NULL REFERENCES users(id),
    purchase_draft_id   uuid         NOT NULL REFERENCES purchase_drafts(id),
    amount              bigint       NOT NULL,
    currency            varchar(10)  NOT NULL DEFAULT 'VND',
    status              varchar(30)  NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'PAID', 'FAILED', 'EXPIRED', 'CANCELLED'
    payment_method      varchar(30)  NOT NULL DEFAULT 'BANK_QR',
    payos_payment_link_id varchar(100),
    payos_checkout_url  text,
    payos_qr_code       text,
    expires_at          timestamptz  NOT NULL,
    paid_at             timestamptz,
    created_at          timestamptz  NOT NULL,
    updated_at          timestamptz  NOT NULL,
    CONSTRAINT ck_orders_status
        CHECK (status IN ('PENDING', 'PAID', 'FAILED', 'EXPIRED', 'CANCELLED')),
    CONSTRAINT ck_orders_amount
        CHECK (amount > 0)
);

CREATE INDEX ix_orders_user_status
    ON orders (user_id, status);

CREATE INDEX ix_orders_draft
    ON orders (purchase_draft_id);

-- 16.7. Payment Events (Webhook Audit & Idempotency)
CREATE TABLE payment_events (
    id                  uuid PRIMARY KEY,
    provider            varchar(30)  NOT NULL DEFAULT 'payos',
    provider_event_id   varchar(150),
    order_code          bigint       NOT NULL,
    amount              bigint       NOT NULL,
    currency            varchar(10)  NOT NULL DEFAULT 'VND',
    raw_payload         text         NOT NULL,
    signature_valid     boolean      NOT NULL,
    processing_status   varchar(30)  NOT NULL, -- 'SUCCESS', 'DUPLICATE', 'INVALID_SIGNATURE', 'AMOUNT_MISMATCH', 'FAILED'
    processed_at        timestamptz  NOT NULL,
    created_at          timestamptz  NOT NULL
);

CREATE UNIQUE INDEX ux_payment_events_provider_order
    ON payment_events (provider, order_code, provider_event_id);

-- 16.8. Email Outbox (Transactional Email Delivery)
CREATE TABLE email_outbox (
    id                  uuid PRIMARY KEY,
    recipient_email     varchar(255) NOT NULL,
    template_name       varchar(50)  NOT NULL,
    subject             varchar(255) NOT NULL,
    body_html           text         NOT NULL,
    status              varchar(30)  NOT NULL DEFAULT 'QUEUED', -- 'QUEUED', 'SENT', 'FAILED'
    attempt_count       integer      NOT NULL DEFAULT 0,
    sent_at             timestamptz,
    error_message       text,
    created_at          timestamptz  NOT NULL,
    updated_at          timestamptz  NOT NULL,
    CONSTRAINT ck_email_outbox_status
        CHECK (status IN ('QUEUED', 'SENT', 'FAILED'))
);

CREATE INDEX ix_email_outbox_status_attempt
    ON email_outbox (status, attempt_count)
    WHERE status = 'QUEUED';

-- ============================================================================
-- 17. INDIVIDUAL LEARNER WORKSPACE (Phase 2)
-- ============================================================================

ALTER TABLE learner_profiles
    ADD COLUMN IF NOT EXISTS target_position_code varchar(80),
    ADD COLUMN IF NOT EXISTS target_set_at timestamptz,
    ADD COLUMN IF NOT EXISTS target_change_count integer DEFAULT 0,
    ADD COLUMN IF NOT EXISTS workspace_state_json jsonb;

COMMIT;
