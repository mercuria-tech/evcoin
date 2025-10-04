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
  GOOGLE_PAY = 'google_pay',
  PAYPAL = 'paypal',
  LOCAL_WALLET = 'local_wallet', // For local payment providers
  BANK_TRANSFER = 'bank_transfer' // For regional bank transfers
}

export enum PaymentProvider {
  // International Providers
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  SQUARE = 'square',
  ADYEN = 'adyen',
  
  // Regional/Local Providers
  STRIPE_LOCAL = 'stripe_local', // Stripe with local payment methods
  MOLPAY = 'molpay', // Southeast Asia
  RAZORPAY = 'razorpay', // India
  PAYSTACK = 'paystack', // Africa
  PAYMENTWALL = 'paymentwall', // Global alternative methods
  KLARNA = 'klarna', // Europe/North America (buy now, pay later)
  SEQURA = 'sequra', // Spain/Europe
  BLIK = 'blik', // Poland
  MOMO = 'momo', // Vietnam
  GRABPAY = 'grabpay', // Southeast Asia
  ZALOPAY = 'zalopay', // Vietnam
  MERCADO_PAGO = 'mercado_pago' // Latin America
}

export enum PaymentMethodStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REMOVED = 'removed',
  PENDING_VERIFICATION = 'pending_verification'
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
  provider: PaymentProvider;
  card?: CardDetails;
  walletId?: string; // For digital wallets
  billingAddress?: BillingAddress;
  setAsDefault?: boolean;
  providerData?: Record<string, any>; // Additional provider-specific data
}

export interface CardDetails {
  number: string;
  expMonth: number;
  expYear: number;
  cvc: string;
  name: string;
}

export interface PaymentProcessor {
  provider: PaymentProvider;
  name: string;
  description: string;
  supportedTypes: PaymentType[];
  supportedCurrencies: string[];
  supportedRegions: string[];
  enabled: boolean;
  config: PaymentProviderConfig;
}

export interface PaymentProviderConfig {
  apiKey: string;
  secretKey?: string;
  webhookSecret?: string;
  merchantId?: string;
  environment: 'sandbox' | 'production';
  additionalConfig?: Record<string, any>;
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
  fees?: TransactionFees;
  exchangeRate?: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum TransactionType {
  CHARGE = 'charge',
  REFUND = 'refund',
  AUTHORIZATION = 'authorization',
  CAPTURE = 'capture',
  FEES = 'fees',
  RESERVATION_FEE = 'reservation_fee',
  SUBSCRIPTION = 'subscription'
}

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
  PARTIALLY_REFUNDED = 'partially_refunded'
}

export interface TransactionFees {
  processingFee: number;
  currency: string;
  effectiveRate: number; // percentage
  fixedFee: number;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  status: PaymentIntentStatus;
  clientSecret?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export enum PaymentIntentStatus {
  CREATED = 'created',
  REQUIRES_PAYMENT_METHOD = 'requires_payment_method',
  REQUIRES_CONFIRMATION = 'requires_confirmation',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  CANCELED = 'canceled',
  REQUIRES_ACTION = 'requires_action'
}

export interface TransactionHistoryRequest {
  userId: string;
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
  type?: TransactionType;
  status?: TransactionStatus;
  provider?: PaymentProvider;
  currency?: string;
}

export interface TransactionHistoryResponse {
  transactions: Transaction[];
  total: number;
  limit: number;
  offset: number;
  summary: TransactionSummary;
}

export interface TransactionSummary {
  totalTransactions: number;
  totalAmount: number;
  currency: string;
  averageAmount: number;
  completedTransactions: number;
  failedTransactions: number;
  refundedAmount: number;
  netAmount: number;
}

export interface RefundRequest {
  transactionId: string;
  amount?: number; // partial refund if specified, full refund if not
  reason: RefundReason;
  description?: string;
  notifyUser?: boolean;
}

export enum RefundReason {
  DUPLICATE = 'duplicate',
  FRAUDULENT = 'fraudulent',
  REQUESTED_BY_CUSTOMER = 'requested_by_customer',
  PRODUCT_DEFECT = 'product_defect',
  SERVICE_NOT_PROVIDED = 'service_not_provided',
  TECHNICAL_FAILURE = 'technical_failure',
  OVERPAYMENT = 'overpayment',
  OTHER = 'other'
}

export interface RefundResponse {
  refundId: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: 'processing' | 'completed' | 'failed' | 'pending';
  reason: RefundReason;
  processedAt?: Date;
  estimatedDelivery: string; // How long until customer sees refund
}

export interface EstimatedCostResponse {
  amount: number;
  currency: string;
  breakdown: {
    serviceCost: number;
    processingFee: number;
    taxes?: number;
    localFees?: number;
  };
  regionalMultiplier?: number; // For regional pricing adjustments
}

export interface PaymentOptionsResponse {
  providers: PaymentProcessor[];
  recommended: PaymentProvider;
  regionalSuggestions: RegionalPaymentOption[];
}

export interface RegionalPaymentOption {
  provider: PaymentProvider;
  name: string;
  localizedName?: string;
  description: string;
  popular: boolean;
  fees: {
    percentage: number;
    fixed: number;
    currency: string;
  };
}

export interface WebhookEvent {
  id: string;
  type: string;
  provider: PaymentProvider;
  data: any;
  processed: boolean;
  createdAt: Date;
  processedAt?: Date;
}

export interface PaymentAnalytics {
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    totalVolume: number;
    totalTransactions: number;
    averageTransactionValue: number;
    successRate: number;
    refundRate: number;
    processingFees: number;
    netRevenue: number;
  };
  providerBreakdown: Record<PaymentProvider, {
    volume: number;
    transactions: number;
    successRate: number;
    averageProcessingTime: number;
  }>;
  regionalBreakdown: Record<string, {
    volume: number;
    transactions: number;
    preferredProvider: PaymentProvider;
  }>;
}
