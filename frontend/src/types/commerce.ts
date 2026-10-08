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

/** Result of the no-account "thử nhanh" flow, handed over when the visitor signs up for a trial. */
export interface TryOrientationInput {
  positionCode: string;
  correct: number;
  total: number;
  completedAt: string;
}

export interface RegisterIndividualInput {
  fullName: string;
  email: string;
  password: string;
  acceptTerms?: boolean;
  phone?: string;
  plan?: PlanSelection;
  /** Starts a trial instead of a purchase: no plan is needed and no purchase draft is created. */
  trial?: boolean;
  /** Reference position the visitor tried; ignored when it is not one of them. */
  positionCode?: string;
  tryOrientation?: TryOrientationInput;
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
  /** Mock only: part of the activation link the invited person receives by email. */
  token: string;
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
  status: 'pending' | 'accepted';
}

export interface ActivateInvitationInput {
  token: string;
  fullName: string;
  password: string;
}

export interface PasswordResetRequestResult {
  /** Mock only: the link the reset email would carry. */
  debugLink?: string;
}
