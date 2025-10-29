export type PaymentStatus =
  | "created"
  | "pending"
  | "accepted"
  | "declined"
  | "error";

export type PaymentDecision = "ACCEPT" | "REJECT" | "ERROR" | "PENDING";

export interface PaymentStatusResponse {
  status: PaymentStatus;
  decision: PaymentDecision;
  reference: string;
  amount: number;
  currency?: string;
  timestamp?: string;
  errorMessage?: string;
  cardType?: string;
  lastFourDigits?: string;
}

export interface PaymentReceiptParams {
  reference: string;
  sig: string;
  hint: string;
  canceled: string;
}

export interface PaymentReceiptMessage {
  type: "payment_receipt";
  reference: string;
  sig: string;
  hint: string;
  canceled: "0" | "1";
}

export type PaymentModalState = "idle" | "validating" | "completed";

export interface PaymentConfig {
  userId: string;
  appointmentId: number | string;
  amount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface JWTPayload {
  userId?: string;
  sub?: string;
  email?: string;
  iat?: number;
  exp?: number;
  role?: string;
  [key: string]: any;
}

export type PaymentMethod = "CREDIT_CARD" | "ON_CONSULTATION" | "BANK_TRANSFER";

export interface UpdateAppointmentPaymentRequest {
  payment_method_code: PaymentMethod;
  transaction_reference?: string;
}

export interface PollingResult {
  success: boolean;
  data?: PaymentStatusResponse;
  error?: string;
  timeout?: boolean;
}

export interface PollingConfig {
  maxAttempts?: number;
  intervalMs?: number;
  onProgress?: (attempt: number) => void;
  onComplete?: (result: PollingResult) => void;
  onError?: (error: Error) => void;
}

export class PaymentError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = "PaymentError";
  }
}
