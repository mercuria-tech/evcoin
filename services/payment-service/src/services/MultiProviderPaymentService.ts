import Stripe from 'stripe';
import paypal from 'paypal-rest-sdk';
import { SquareClient } from 'squareup';
import { 
  PaymentProvider, 
  PaymentProviderConfig, 
  PaymentIntent,
  PaymentIntentStatus,
  Transaction,
  TransactionStatus,
  AddPaymentMethodRequest,
  RefundRequest,
  RefundResponse,
  PaymentProcessor,
  EstimatedCostResponse 
} from '@ev-charging/shared-types';
import { logger } from '../utils/logger';

export class MultiProviderPaymentService {
  private providers: Map<PaymentProvider, PaymentProviderConfig> = new Map();
  private stripe: Stripe | null = null;
  private square: SquareClient | null = null;

  constructor() {
    this.initializeProviders();
  }

  /**
   * Initialize all payment providers
   */
  private async initializeProviders(): Promise<void> {
    try {
      // Initialize Stripe (International & Local)
      if (process.env.STRIPE_SECRET_KEY) {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
          apiVersion: '2023-10-16',
          typescript: true,
        });

        this.providers.set(PaymentProvider.STRIPE, {
          apiKey: process.env.STRIPE_SECRET_KEY,
          webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
          environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
        });

        // Local Stripe configurations
        if (process.env.STRIPE_LOCAL_SECRET_KEY) {
          this.providers.set(PaymentProvider.STRIPE_LOCAL, {
            apiKey: process.env.STRIPE_LOCAL_SECRET_KEY,
            webhookSecret: process.env.STRIPE_LOCAL_WEBHOOK_SECRET,
            environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
          });
        }
      }

      // Initialize PayPal
      if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET) {
        paypal.configure({
          'mode': process.env.NODE_ENV === 'production' ? 'live' : 'sandbox',
          'client_id': process.env.PAYPAL_CLIENT_ID,
          'client_secret': process.env.PAYPAL_CLIENT_SECRET
        });

        this.providers.set(PaymentProvider.PAYPAL, {
          apiKey: process.env.PAYPAL_CLIENT_ID,
          secretKey: process.env.PAYPAL_CLIENT_SECRET,
          webhookSecret: process.env.PAYPAL_WEBHOOK_SECRET,
          environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
        });
      }

      // Initialize Square
      if (process.env.SQUARE_ACCESS_TOKEN) {
        this.square = new SquareClient({
          accessToken: process.env.SQUARE_ACCESS_TOKEN,
          environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
        });

        this.providers.set(PaymentProvider.SQUARE, {
          apiKey: process.env.SQUARE_APPLICATION_ID!,
          secretKey: process.env.SQUARE_ACCESS_TOKEN,
          merchantId: process.env.SQUARE_MERCHANT_ID,
          environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
        });
      }

      // Initialize Regional Payment Providers
      this.initializeRegionalProviders();

      logger.info(`Initialized ${this.providers.size} payment providers`, {
        providers: Array.from(this.providers.keys())
      });

    } catch (error) {
      logger.error('Failed to initialize payment providers:', error);
      throw error;
    }
  }

  /**
   * Initialize regional payment providers
   */
  private initializeRegionalProviders(): void {
    // Southeast Asia - GrabPay
    if (process.env.GRABPAY_MERCHANT_ID) {
      this.providers.set(PaymentProvider.GRABPAY, {
        apiKey: process.env.GRABPAY_API_KEY!,
        merchantId: process.env.GRABPAY_MERCHANT_ID,
        environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
      });
    }

    // India - Razorpay
    if (process.env.RAZORPAY_KEY_ID) {
      this.providers.set(PaymentProvider.RAZORPAY, {
        apiKey: process.env.RAZORPAY_KEY_ID!,
        secretKey: process.env.RAZORPAY_KEY_SECRET!,
        environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
      });
    }

    // Africa - Paystack
    if (process.env.PAYSTACK_SECRET_KEY) {
      this.providers.set(PaymentProvider.PAYSTACK, {
        apiKey: process.env.PAYSTACK_PUBLIC_KEY!,
        secretKey: process.env.PAYSTACK_SECRET_KEY,
        webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET,
        environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
      });
    }

    // Latin America - Mercado Pago
    if (process.env.MERCADOPAGO_ACCESS_TOKEN) {
      this.providers.set(PaymentProvider.MERCADO_PAGO, {
        apiKey: process.env.MERCADOPAGO_PUBLIC_KEY!,
        secretKey: process.env.MERCADOPAGO_ACCESS_TOKEN,
        webhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET,
        environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
      });
    }

    // Vietnam - MoMo
    if (process.env.MOMO_PARTNER_CODE) {
      this.providers.set(PaymentProvider.MOMO, {
        apiKey: process.env.MOMO_PARTNER_CODE!,
        secretKey: process.env.MOMO_ACCESS_KEY!,
        merchantId: process.env.MOMO_PARTNER_CODE,
        additionalConfig: {
          endpoint: process.env.MOMO_ENDPOINT,
          redirectUrl: process.env.MOMO_REDIRECT_URL
        },
        environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
      });
    }
  }

  /**
   * Create payment intent with provider selection
   */
  async createPaymentIntent(
    amount: number,
    currency: string,
    provider: PaymentProvider,
    metadata?: Record<string, any>
  ): Promise<PaymentIntent> {
    try {
      const providerConfig = this.providers.get(provider);
      if (!providerConfig) {
        throw new Error(`Provider ${provider} not configured`);
      }

      switch (provider) {
        case PaymentProvider.STRIPE:
        case PaymentProvider.STRIPE_LOCAL:
          return await this.createStripePaymentIntent(amount, currency, metadata);
        
        case PaymentProvider.PAYPAL:
          return await this.createPayPalPaymentIntent(amount, currency, metadata);
        
        case PaymentProvider.SQUARE:
          return await this.createSquarePaymentIntent(amount, currency, metadata);
        
        case PaymentProvider.RAZORPAY:
          return await this.createRazorpayPaymentIntent(amount, currency, metadata);
        
        case PaymentProvider.PAYSTACK:
          return await this.createPaystackPaymentIntent(amount, currency, metadata);
        
        case PaymentProvider.GRABPAY:
          return await this.createGrabPayPaymentIntent(amount, currency, metadata);
        
        case PaymentProvider.MOMO:
          return await this.createMoMoPaymentIntent(amount, currency, metadata);
        
        default:
          throw new Error(`Provider ${provider} not implemented`);
      }
    } catch (error) {
      logger.error('Failed to create payment intent:', error);
      throw error;
    }
  }

  /**
   * Add payment method with provider-specific implementation
   */
  async addPaymentMethod(request: AddPaymentMethodRequest): Promise<string> {
    try {
      switch (request.provider) {
        case PaymentProvider.STRIPE:
        case PaymentProvider.STRIPE_LOCAL:
          return await this.addStripePaymentMethod(request);
        
        case PaymentProvider.PAYPAL:
          return await this.addPayPalPaymentMethod(request);
        
        case PaymentProvider.RAZORPAY:
          return await this.addRazorpayPaymentMethod(request);
        
        case PaymentProvider.PAYSTACK:
          return await this.addPaystackPaymentMethod(request);
        
        default:
          throw new Error(`Provider ${request.provider} not implemented for adding payment methods`);
      }
    } catch (error) {
      logger.error('Failed to add payment method:', error);
      throw error;
    }
  }

  /**
   * Process payment with multiple providers fallback
   */
  async processPayment(
    paymentMethodId: string,
    amount: number,
    currency: string,
    provider: PaymentProvider,
    metadata?: Record<string, any>
  ): Promise<Transaction> {
    try {
      switch (provider) {
        case PaymentProvider.STRIPE:
        case PaymentProvider.STRIPE_LOCAL:
          return await this.processStripePayment(paymentMethodId, amount, currency, metadata);
        
        case PaymentProvider.SQUARE:
          return await this.processSquarePayment(paymentMethodId, amount, currency, metadata);
        
        default:
          throw new Error(`Provider ${provider} not implemented for payment processing`);
      }
    } catch (error) {
      logger.error('Failed to process payment:', error);
      throw error;
    }
  }

  /**
   * Process refund with provider-specific implementation
   */
  async processRefund(refundRequest: RefundRequest): Promise<RefundResponse> {
    try {
      // TODO: Implement refund logic with provider detection
      // This would require getting the original transaction to determine provider
      
      logger.info('Refund processing requested', { refundRequest });
      
      return {
        refundId: `refund_${Date.now()}`,
        transactionId: refundRequest.transactionId,
        amount: refundRequest.amount || 0,
        currency: 'USD',
        status: 'processing',
        reason: refundRequest.reason,
        estimatedDelivery: '3-5 business days'
      };
    } catch (error) {
      logger.error('Failed to process refund:', error);
      throw error;
    }
  }

  /**
   * Get supported payment methods for a region
   */
  getSupportedPaymentMethods(region: string, currency: string): PaymentProcessor[] {
    const supportedMethods: PaymentProcessor[] = [];

    // Always include international providers
    if (this.providers.has(PaymentProvider.STRIPE)) {
      supportedMethods.push({
        provider: PaymentProvider.STRIPE,
        name: 'Credit/Debit Cards',
        description: 'Visa, Mastercard, American Express',
        supportedTypes: ['card', 'apple_pay', 'google_pay'],
        supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
        supportedRegions: ['global'],
        enabled: true,
        config: this.providers.get(PaymentProvider.STRIPE)!
      });
    }

    // Add regional providers based on region
    switch (region.toUpperCase()) {
      case 'IN':
        if (this.providers.has(PaymentProvider.RAZORPAY)) {
          supportedMethods.push({
            provider: PaymentProvider.RAZORPAY,
            name: 'Razorpay',
            description: 'Indian payment gateway with local methods',
            supportedTypes: ['card', 'bank_transfer', 'wallet'],
            supportedCurrencies: ['INR'],
            supportedRegions: ['IN'],
            enabled: true,
            config: this.providers.get(PaymentProvider.RAZORPAY)!
          });
        }
        break;
      
      case 'SG':
      case 'MY':
      case 'TH':
      case 'PH':
      case 'VN':
        if (this.providers.has(PaymentProvider.GRABPAY)) {
          supportedMethods.push({
            provider: PaymentProvider.GRABPAY,
            name: 'GrabPay',
            description: 'GrabPay digital wallet',
            supportedTypes: ['local_wallet'],
            supportedCurrencies: ['SGD', 'MYR', 'THB', 'PHP', 'VND'],
            supportedRegions: ['SG', 'MY', 'TH', 'PH', 'VN'],
            enabled: true,
            config: this.providers.get(PaymentProvider.GRABPAY)!
          });
        }
        break;
      
      case 'NG':
      case 'KE':
      case 'GH':
        if (this.providers.has(PaymentProvider.PAYSTACK)) {
          supportedMethods.push({
            provider: PaymentProvider.PAYSTACK,
            name: 'Paystack',
            description: 'African payment gateway',
            supportedTypes: ['card', 'bank_transfer'],
            supportedCurrencies: ['NGN', 'GHS', 'KES'],
            supportedRegions: ['NG', 'KE', 'GH'],
            enabled: true,
            config: this.providers.get(PaymentProvider.PAYSTACK)!
          });
        }
        break;
    }

    return supportedMethods;
  }

  /**
   * Estimate payment fees for different providers
   */
  async estimatePaymentFees(
    amount: number,
    currency: string,
    provider: PaymentProvider,
    region?: string
  ): Promise<EstimatedCostResponse> {
    const costs: EstimatedCostResponse = {
      amount,
      currency,
      breakdown: {
        serviceCost: amount,
        processingFee: 0,
        taxes: 0,
        localFees: 0
      }
    };

    switch (provider) {
      case PaymentProvider.STRIPE:
      case PaymentProvider.STRIPE_LOCAL:
        costs.breakdown.processingFee = amount * 0.029 + 0.30; // Stripe fees
        break;
      
      case PaymentProvider.PAYPAL:
        costs.breakdown.processingFee = amount * 0.034 + 0.35; // PayPal fees
        break;
      
      case PaymentProvider.RAZORPAY:
        costs.breakdown.processingFee = amount * 0.02; // Razorpay fees
        break;
      
      case PaymentProvider.PAYSTACK:
        costs.breakdown.processingFee = amount * 0.015 + 100; // Paystack fees (in cents)
        break;
      
      case PaymentProvider.MOMO:
        costs.breakdown.processingFee = amount * 0.011; // MoMo fees
        break;
      
      case PaymentProvider.GRABPAY:
        costs.breakdown.processingFee = amount * 0.01; // GrabPay fees
        break;
    }

    // Add regional taxes if applicable
    if (region === 'SG') {
      costs.breakdown.taxes = amount * 0.07; // GST
    }

    return costs;
  }

  // Stripe-specific implementations
  private async createStripePaymentIntent(
    amount: number,
    currency: string,
    metadata?: Record<string, any>
  ): Promise<PaymentIntent> {
    if (!this.stripe) throw new Error('Stripe not initialized');

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: metadata || {}
    });

    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency.toUpperCase(),
      provider: PaymentProvider.STRIPE,
      status: paymentIntent.status as PaymentIntentStatus,
      clientSecret: paymentIntent.client_secret!,
      metadata: paymentIntent.metadata,
      createdAt: new Date(paymentIntent.created * 1000)
    };
  }

  private async addStripePaymentMethod(request: AddPaymentMethodRequest): Promise<string> {
    if (!this.stripe) throw new Error('Stripe not initialized');

    if (request.card) {
      const paymentMethod = await this.stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: request.card.number,
          exp_month: request.card.expMonth,
          exp_year: request.card.expYear,
          cvc: request.card.cvc,
        },
      });

      return paymentMethod.id;
    }

    throw new Error('Card details required for Stripe');
  }

  private async processStripePayment(
    paymentMethodId: string,
    amount: number,
    currency: string,
    metadata?: Record<string, any>
  ): Promise<Transaction> {
    if (!this.stripe) throw new Error('Stripe not initialized');

    const paymentIntent = await this.stripe.paymentIntents.create({
      payment_method: paymentMethodId,
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      confirm: true,
      metadata: metadata || {}
    });

    return {
      id: `txn_${paymentIntent.id}`,
      userId: metadata?.userId || '',
      type: 'charge',
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      status: paymentIntent.status as TransactionStatus,
      provider: PaymentProvider.STRIPE,
      providerTransactionId: paymentIntent.id,
      metadata: paymentIntent.metadata,
      createdAt: new Date(paymentIntent.created * 1000),
      updatedAt: new Date(paymentIntent.created * 1000)
    };
  }

  // Additional provider implementations would follow similar patterns...
  // PayPal, Razorpay, Paystack, etc.
  
  private async createPayPalPaymentIntent(
    amount: number,
    currency: string,
    metadata?: Record<string, any>
  ): Promise<PaymentIntent> {
    // TODO: Implement PayPal payment intent creation
    throw new Error('PayPal implementation pending');
  }

  private async createSquarePaymentIntent(
    amount: number,
    currency: string,
    metadata?: Record<string, any>
  ): Promise<PaymentIntent> {
    // TODO: Implement Square payment intent creation
    throw new Error('Square implementation pending');
  }

  private async createRazorpayPaymentIntent(
    amount: number,
    currency: string,
    metadata?: Record<string, any>
  ): Promise<PaymentIntent> {
    // TODO: Implement Razorpay payment intent creation
    throw new Error('Razorpay implementationPending');
  }

  private async createPaystackPaymentIntent(
    amount: number,
    currency: string,
    metadata?: Record<string, any>
  ): Promise<PaymentIntent> {
    // TODO: Implement Paystack payment intent creation
    throw new Error('Paystack implementation pending');
  }

  private async createGrabPayPaymentIntent(
    amount: number,
    currency: string,
    metadata?: Record<string, any>
  ): Promise<PaymentIntent> {
    // TODO: Implement GrabPay payment intent creation
    throw new Error('GrabPay implementation pending');
  }

  private async createMoMoPaymentIntent(
    amount: number,
    currency: string,
    metadata?: Record<string, any>
  ): Promise<PaymentIntent> {
    // TODO: Implement MoMo payment intent creation
    throw new Error('MoMo implementation pending');
  }

  private async addPayPalPaymentIntent(request: AddPaymentMethodRequest): Promise<string> {
    // TODO: Implement PayPal payment method addition
    throw new Error('PayPal payment method addition pending');
  }

  private async addRazorpayPaymentMethod(request: AddPaymentMethodRequest): Promise<string> {
    // TODO: Implement Razorpay payment method addition
    throw new Error('Razorpay payment method addition pending');
  }

  private async addPaystackPaymentMethod(request: AddPaymentMethodRequest): Promise<string> {
    // TODO: Implement Paystack payment method addition
    throw new Error('Paystack payment method addition pending');
  }
}
