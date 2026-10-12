import { PaymentTransaction, Invoice } from '../types/database';
import { adminService } from './adminService';
import { emailAutomationService } from './emailAutomation';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  rateToUSD: number; // 1 USD = rate units of this currency
  flag: string;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  NGN: {
    code: 'NGN',
    symbol: '₦',
    name: 'Nigerian Naira',
    rateToUSD: 1480, // e.g. 1 USD = 1,480 NGN
    flag: '🇳🇬',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    rateToUSD: 1,
    flag: '🇺🇸',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    rateToUSD: 0.92,
    flag: '🇪🇺',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    rateToUSD: 0.78,
    flag: '🇬🇧',
  },
  CAD: {
    code: 'CAD',
    symbol: 'CA$',
    name: 'Canadian Dollar',
    rateToUSD: 1.36,
    flag: '🇨🇦',
  },
  KES: {
    code: 'KES',
    symbol: 'KSh',
    name: 'Kenyan Shilling',
    rateToUSD: 130,
    flag: '🇰🇪',
  },
  GHS: {
    code: 'GHS',
    symbol: 'GH₵',
    name: 'Ghanaian Cedi',
    rateToUSD: 14.8,
    flag: '🇬🇭',
  },
  ZAR: {
    code: 'ZAR',
    symbol: 'R',
    name: 'South African Rand',
    rateToUSD: 18.5,
    flag: '🇿🇦',
  },
};

export function convertAmount(amountInUSD: number, targetCurrency: string): number {
  const currency = SUPPORTED_CURRENCIES[targetCurrency] || SUPPORTED_CURRENCIES.USD;
  const converted = amountInUSD * currency.rateToUSD;
  // Round nicely: if NGN or KES, round to nearest 100 or whole number; otherwise 2 decimals
  if (['NGN', 'KES'].includes(targetCurrency)) {
    return Math.round(converted);
  }
  return Math.round(converted * 100) / 100;
}

export function formatCurrency(amount: number, currencyCode: string): string {
  const config = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.USD;
  return `${config.symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: ['NGN', 'KES'].includes(currencyCode) ? 0 : 2,
    maximumFractionDigits: ['NGN', 'KES'].includes(currencyCode) ? 0 : 2,
  })}`;
}

export interface BankUSSDConfig {
  id: string;
  name: string;
  shortCode: string;
  syntax: (amount: number, refCode: string) => string;
  popular: boolean;
  color: string;
  textColor: string;
}

// Complete directory of USSD codes for all banks in Nigeria
export const NIGERIAN_BANKS_USSD: BankUSSDConfig[] = [
  {
    id: 'gtbank',
    name: 'Guaranty Trust Bank (GTBank)',
    shortCode: '*737#',
    syntax: (amount, ref) => `*737*2*${amount}*${ref}#`,
    popular: true,
    color: 'bg-orange-600',
    textColor: 'text-orange-400',
  },
  {
    id: 'zenith',
    name: 'Zenith Bank',
    shortCode: '*966#',
    syntax: (amount, ref) => `*966*${amount}*${ref}#`,
    popular: true,
    color: 'bg-red-600',
    textColor: 'text-red-400',
  },
  {
    id: 'access',
    name: 'Access Bank',
    shortCode: '*901#',
    syntax: (amount, ref) => `*901*3*${amount}*${ref}#`,
    popular: true,
    color: 'bg-amber-600',
    textColor: 'text-amber-400',
  },
  {
    id: 'uba',
    name: 'United Bank for Africa (UBA)',
    shortCode: '*919#',
    syntax: (amount, ref) => `*919*4*${ref}*${amount}#`,
    popular: true,
    color: 'bg-red-700',
    textColor: 'text-red-400',
  },
  {
    id: 'firstbank',
    name: 'First Bank of Nigeria',
    shortCode: '*894#',
    syntax: (amount, ref) => `*894*${amount}*${ref}#`,
    popular: true,
    color: 'bg-blue-800',
    textColor: 'text-blue-400',
  },
  {
    id: 'opay',
    name: 'OPay Digital Bank',
    shortCode: '*955#',
    syntax: (amount, ref) => `*955*1*${amount}*${ref}#`,
    popular: true,
    color: 'bg-emerald-600',
    textColor: 'text-emerald-400',
  },
  {
    id: 'kuda',
    name: 'Kuda Microfinance Bank',
    shortCode: '*894# / App',
    syntax: (amount, ref) => `*894*${amount}*${ref}#`,
    popular: true,
    color: 'bg-purple-600',
    textColor: 'text-purple-400',
  },
  {
    id: 'sterling',
    name: 'Sterling Bank',
    shortCode: '*822#',
    syntax: (amount, ref) => `*822*4*${ref}*${amount}#`,
    popular: false,
    color: 'bg-red-500',
    textColor: 'text-red-300',
  },
  {
    id: 'fidelity',
    name: 'Fidelity Bank',
    shortCode: '*770#',
    syntax: (amount, ref) => `*770*${ref}*${amount}#`,
    popular: false,
    color: 'bg-indigo-700',
    textColor: 'text-indigo-400',
  },
  {
    id: 'stanbic',
    name: 'Stanbic IBTC Bank',
    shortCode: '*909#',
    syntax: (amount, ref) => `*909*22*${amount}*${ref}#`,
    popular: false,
    color: 'bg-blue-600',
    textColor: 'text-blue-300',
  },
  {
    id: 'fcmb',
    name: 'First City Monument Bank (FCMB)',
    shortCode: '*329#',
    syntax: (amount, ref) => `*329*${amount}*${ref}#`,
    popular: false,
    color: 'bg-purple-700',
    textColor: 'text-purple-400',
  },
  {
    id: 'union',
    name: 'Union Bank',
    shortCode: '*826#',
    syntax: (amount, ref) => `*826*2*${amount}*${ref}#`,
    popular: false,
    color: 'bg-sky-600',
    textColor: 'text-sky-400',
  },
  {
    id: 'ecobank',
    name: 'Ecobank Nigeria',
    shortCode: '*326#',
    syntax: (amount, ref) => `*326*1*${amount}*${ref}#`,
    popular: false,
    color: 'bg-teal-600',
    textColor: 'text-teal-400',
  },
  {
    id: 'wema',
    name: 'Wema Bank / ALAT',
    shortCode: '*945#',
    syntax: (amount, ref) => `*945*1*${amount}*${ref}#`,
    popular: false,
    color: 'bg-fuchsia-700',
    textColor: 'text-fuchsia-400',
  },
  {
    id: 'polaris',
    name: 'Polaris Bank',
    shortCode: '*833#',
    syntax: (amount, ref) => `*833*${amount}*${ref}#`,
    popular: false,
    color: 'bg-violet-700',
    textColor: 'text-violet-400',
  },
  {
    id: 'keystone',
    name: 'Keystone Bank',
    shortCode: '*7111#',
    syntax: (amount, ref) => `*7111*${amount}*${ref}#`,
    popular: false,
    color: 'bg-cyan-700',
    textColor: 'text-cyan-400',
  },
  {
    id: 'taj',
    name: 'TAJ Bank',
    shortCode: '*898#',
    syntax: (amount, ref) => `*898*${amount}*${ref}#`,
    popular: false,
    color: 'bg-emerald-800',
    textColor: 'text-emerald-300',
  },
  {
    id: 'jaiz',
    name: 'Jaiz Bank',
    shortCode: '*773#',
    syntax: (amount, ref) => `*773*${amount}*${ref}#`,
    popular: false,
    color: 'bg-green-700',
    textColor: 'text-green-400',
  },
  {
    id: 'unity',
    name: 'Unity Bank',
    shortCode: '*7799#',
    syntax: (amount, ref) => `*7799*${amount}*${ref}#`,
    popular: false,
    color: 'bg-lime-700',
    textColor: 'text-lime-400',
  },
];

export interface VirtualAccountDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
  expiresInMinutes: number;
  transferReference: string;
  sessionExpiryTimestamp: number;
}

export function generateVirtualAccount(payerName: string, amount: number, currency: string): VirtualAccountDetails {
  // Generate random 10-digit virtual NUBAN account
  const bankOptions = ['Wema Bank / Paystack Titan', 'Providus Bank', 'GTBank Virtual Treasury', 'Sterling Bank'];
  const bank = bankOptions[Math.floor(Math.random() * bankOptions.length)];
  const randomNuban = '8' + Math.floor(100000000 + Math.random() * 900000000).toString();
  const ref = 'VTR-' + Math.floor(100000 + Math.random() * 900000);

  return {
    bankName: bank,
    accountNumber: randomNuban,
    accountName: `JOBHUB / ${payerName || 'Enterprise Guest'}`,
    expiresInMinutes: 30,
    transferReference: ref,
    sessionExpiryTimestamp: Date.now() + 30 * 60 * 1000,
  };
}

export interface OPayPaymentDetails {
  merchantName: string;
  merchantWalletNumber: string;
  opayId: string;
  qrPayload: string;
  promptExpiresInMinutes: number;
}

export function generateOPayDetails(reference: string, amount: number, currency: string): OPayPaymentDetails {
  return {
    merchantName: 'JOBHUB powered by genesix initiate group ltd (OPay Merchant)',
    merchantWalletNumber: '6102948190',
    opayId: `OPAY-${reference}`,
    qrPayload: `opay://pay?merchant=JOBHUB&amount=${amount}&currency=${currency}&ref=${reference}`,
    promptExpiresInMinutes: 15,
  };
}

export interface ProcessPaymentParams {
  channel: 'paystack' | 'bank_transfer' | 'ussd' | 'opay';
  amount: number;
  currency: string;
  planName: string;
  paymentType: 'subscription' | 'job_posting' | 'featured_job' | 'recruitment_package' | 'other';
  customerName: string;
  customerEmail: string;
  companyName?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentReceipt {
  transactionReference: string;
  invoiceNumber: string;
  channel: string;
  channelDisplayName: string;
  amount: number;
  currency: string;
  formattedAmount: string;
  customerName: string;
  customerEmail: string;
  companyName: string;
  planName: string;
  paidAt: string;
  status: 'successful';
  receiptUrl?: string;
}

export async function executePaymentChannel(params: ProcessPaymentParams): Promise<PaymentReceipt> {
  const refPrefix =
    params.channel === 'paystack'
      ? 'PSTK'
      : params.channel === 'bank_transfer'
      ? 'BNK_TRF'
      : params.channel === 'ussd'
      ? 'USSD'
      : 'OPAY';

  const transactionRef = `${refPrefix}-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
  const invoiceNum = `INV-2026-${Math.floor(10000 + Math.random() * 90000)}`;
  const paidAt = new Date().toISOString();

  let channelDisplayName = 'Paystack Direct Gateway';
  if (params.channel === 'bank_transfer') channelDisplayName = 'Automated Bank Transfer (Virtual NUBAN)';
  if (params.channel === 'ussd') channelDisplayName = 'Instant USSD Banking Rail';
  if (params.channel === 'opay') channelDisplayName = 'OPay Merchant Instant Transfer';

  const newTransaction: PaymentTransaction = {
    id: `pay-${Date.now()}`,
    transaction_reference: transactionRef,
    user_id: 'usr-customer-active',
    employer_id: 'comp-customer-active',
    amount: params.amount,
    currency: params.currency,
    payment_method: channelDisplayName,
    payment_type: params.paymentType,
    status: 'successful',
    metadata: {
      channel: params.channel,
      plan_name: params.planName,
      customer_email: params.customerEmail,
      invoice_number: invoiceNum,
      ...(params.metadata || {}),
    },
    paid_at: paidAt,
    payer_name: params.customerName,
    company_name: params.companyName || 'JOBHUB Client',
    created_at: paidAt,
    updated_at: paidAt,
  };

  const newInvoice: Invoice = {
    id: `inv-${Date.now()}`,
    invoice_number: invoiceNum,
    user_id: 'usr-customer-active',
    employer_id: 'comp-customer-active',
    transaction_id: newTransaction.id,
    amount: params.amount,
    currency: params.currency,
    status: 'paid',
    invoice_url: `#invoice-${invoiceNum}`,
    issued_at: paidAt,
    customer_name: params.customerName,
    company_name: params.companyName || 'JOBHUB Client',
    created_at: paidAt,
    updated_at: paidAt,
  };

  // Push to local storage / memory so admin payments & billing update immediately
  try {
    const existingPayments = JSON.parse(
      localStorage.getItem('jobhub_local_payments') ||
        localStorage.getItem('talentforge_local_payments') ||
        '[]'
    );
    existingPayments.unshift(newTransaction);
    localStorage.setItem('jobhub_local_payments', JSON.stringify(existingPayments));

    const existingInvoices = JSON.parse(
      localStorage.getItem('jobhub_local_invoices') ||
        localStorage.getItem('talentforge_local_invoices') ||
        '[]'
    );
    existingInvoices.unshift(newInvoice);
    localStorage.setItem('jobhub_local_invoices', JSON.stringify(existingInvoices));
  } catch (e) {
    console.warn('LocalStorage save error', e);
  }

  // Trigger automated email & notification
  await emailAutomationService.triggerPaymentConfirmation({
    customerName: params.customerName,
    customerEmail: params.customerEmail,
    planName: params.planName,
    amount: params.amount,
    currency: params.currency,
    formattedAmount: formatCurrency(params.amount, params.currency),
    paymentChannel: channelDisplayName,
    transactionReference: transactionRef,
    invoiceNumber: invoiceNum,
    paidAt,
  });

  return {
    transactionReference: transactionRef,
    invoiceNumber: invoiceNum,
    channel: params.channel,
    channelDisplayName,
    amount: params.amount,
    currency: params.currency,
    formattedAmount: formatCurrency(params.amount, params.currency),
    customerName: params.customerName,
    customerEmail: params.customerEmail,
    companyName: params.companyName || 'JOBHUB Partner',
    planName: params.planName,
    paidAt,
    status: 'successful',
  };
}
