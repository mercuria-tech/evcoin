export interface PaymentMethod {
  id: string;
  userId: string;
  type: PaymentType;
  provider: PaymentProvider;
  providerPaymentMethodId: string;
  cardBrand?: string;
  cardLast4?: string;
  cardExpMonth?: number;
  cardExpYear?: number;
  billingAddress?: BillingAddress;
  isDefault: boolean;
  status: PaymentMethodStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum PaymentType {
  CARD = 'card',
  WALLET = 'wallet',
  BANK_ACCOUNT = 'bank_account',
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay'
}

export enum PaymentProvider {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  SQUARE = 'square'
}

export enum PaymentMethodStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REMOVED = 'removed'
}

export interface BillingAddress {
  street: string;
  city: string;
  state?: string;
  zip?: string;
  country: string;
}

export interface AddPaymentMethodRequest {
  type: PaymentType;
  card?: CardDetails;
  billingAddress?: BillingAddress;
  setAsDefault?: boolean;
}

export interface CardDetails {
  number: string;
  expMonth: number;
  expYear: number;
  cvc: string;
  name: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  sessionId?: string;
  reservationId?: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  paymentMethodId?: string;
  provider: PaymentProvider;
  providerTransactionId?: string;
  authorizationCode?: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export enum TransactionType {
  CHARGE = 'charge',
  REFUND = 'refund',
  AUTHORIZATION = 'authorization',
  CAPTURE = 'capture',
  FEES = 'fees'
}

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled'
}

export interface TransactionHistoryRequest {
  userId: string;
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
  type?: TransactionType;
  status?: TransactionStatus;
}

export interface TransactionHistoryResponse {
  transactions: Transaction[];
  total: number;
  limit: number;
  offset: number;
}

export interface RefundRequest {
  transactionId: string;
  amount?: number; // partial refund if specified, full refund if not
  reason: string;
  description?: string;
}

export interface RefundResponse {
  refundId: string;
  amount: number;
  currency: string;
  status: 'processing' | 'completed' | 'failed';
  processedAt?: Date;
}
