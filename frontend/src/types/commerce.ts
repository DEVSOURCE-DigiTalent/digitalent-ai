import type { BillingCycle } from '../lib/plans';

/** A plan picked on a pricing page. `seats` is 1 for plans that are not sold per seat. */
export interface PlanSelection {
  planCode: string;
  seats: number;
  cycle: BillingCycle;
}

export interface RegisterEnterpriseInput {
  fullName: string;
  email: string;
  password: string;
  acceptTerms?: boolean;
  phone?: string;
  jobTitle?: string;
  organizationName?: string;
  organizationSize?: string;
  plan?: PlanSelection;
}

export interface RegisterIndividualInput {
  fullName: string;
  email: string;
  password: string;
  acceptTerms?: boolean;
  phone?: string;
  plan?: PlanSelection;
}

export interface RegistrationResult {
  draftId?: string;
  /** Mock only: the link the verification email would carry. */
  debugVerifyLink?: string;
}

export type DraftStatus = 'DRAFT' | 'PAYMENT_PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';

export interface StoredPurchaseDraft {
  id: string;            // "pd_xxxxxxxx"
  userId: string | null; // null before register or bound to userId
  audience: 'enterprise' | 'individual';
  planCode: string;
  seats: number;         // clampSeats
  cycle: BillingCycle;
  amount: number;        // priceFor(plan, seats, cycle)
  currency: 'VND';
  status: DraftStatus;
  createdAt: string;
  expiresAt: string;     // +7 days
  companyInfo?: {
    organizationName: string;
    taxCode: string;
    address?: string;
    signerName?: string;
    signerTitle?: string;
  };
}

export type PurchaseDraft = StoredPurchaseDraft;

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'expired' | 'cancelled';

export interface Order {
  id: string;
  /** Transfer reference printed in the QR code. */
  code: string;
  draftId?: string;
  planCode: string;
  seats: number;
  cycle: BillingCycle;
  amount: number;
  status: OrderStatus;
  createdAt: string;
  expiresAt?: string;
  paidAt?: string;
}

export interface EContract {
  id: string;
  contractNumber: string;
  orderId: string;
  draftId?: string;
  userId: string;
  organizationName: string;
  taxCode: string;
  address?: string;
  signerName: string;
  signerTitle: string;
  signatureData?: string;
  signMethod: 'draw' | 'otp' | 'email_otp';
  signedAt: string;
  status: 'signed';
  planCode: string;
  seats: number;
  cycle: BillingCycle;
  amount: number;
}

/** What the (simulated) bank reports after the customer scans the code. */
export type PaymentOutcome = 'paid' | 'failed' | 'pending' | 'expired' | 'cancelled';

export interface OrganizationInput {
  name: string;
  industry: string;
  size: string;
  logoUrl?: string;
  timezone?: string;
}

export interface SetupDepartment {
  id: string;
  name: string;
}

export interface SetupGrade {
  code: string;
  name: string;
  description: string;
}

export interface SetupPosition {
  id: string;
  code: string;
  name: string;
  isCustom: boolean;
  departmentName?: string;
  jobGrade?: string;
}

export type MemberRole = 'OWNER' | 'MANAGER' | 'EMPLOYEE';

export interface InviteRow {
  email: string;
  fullName: string;
  employeeCode?: string;
  departmentName?: string;
  positionName?: string;
  jobGrade?: string;
  role: MemberRole;
}

export interface InvitationSummary extends InviteRow {
  /** Invitation id: the id of the pending row in GET /members, used to resend or revoke it. */
  id?: string;
  /** Activation token of the emailed link. Only the mock and the Development backend return it (no email provider yet). */
  token?: string | null;
  /** Full activation link, Development backend only. */
  debugLink?: string | null;
  expiresAt?: string;
  status: 'pending' | 'accepted';
}

export interface InviteResult {
  created: InvitationSummary[];
  rejected: { email: string; reason: string }[];
}

export interface OrganizationSetup {
  organization: (OrganizationInput & { id: string }) | null;
  grades?: SetupGrade[];
  departments: SetupDepartment[];
  positions: SetupPosition[];
  invitations: InvitationSummary[];
  seatLimit?: number;
  seatsUsed: number;
  completed: boolean;
  setupStep?: number;
  /** Whether the plan includes bulk import (CSV). */
  canBulkImport: boolean;
}

export interface InvitationDetail {
  organizationName: string;
  email: string;
  fullName: string;
  role: MemberRole;
  /** The backend only answers for a usable link, so it is always 'pending' there (otherwise 404). */
  status: 'pending' | 'accepted';
  expiresAt?: string;
}

export interface ActivateInvitationInput {
  token: string;
  fullName: string;
  password: string;
}

/** The account created from an invitation; the activation page then signs in with this email. */
export interface ActivateInvitationResult {
  email: string;
  userId?: string;
  /** null when the organization had no active department to place the new employee in. */
  employeeId?: string | null;
}

export interface PasswordResetRequestResult {
  /** Mock only: the link the reset email would carry. */
  debugLink?: string;
}
