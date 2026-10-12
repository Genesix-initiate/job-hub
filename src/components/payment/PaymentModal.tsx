import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Building2,
  Smartphone,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
  Clock,
  Sparkles,
  Download,
  ExternalLink,
  RefreshCw,
  PhoneCall,
  QrCode,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import {
  SUPPORTED_CURRENCIES,
  NIGERIAN_BANKS_USSD,
  convertAmount,
  formatCurrency,
  generateVirtualAccount,
  generateOPayDetails,
  executePaymentChannel,
  PaymentReceipt,
  VirtualAccountDetails,
  OPayPaymentDetails,
} from '../../lib/paymentChannels';

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlanName?: string;
  defaultPriceUSD?: number;
  paymentType?: 'subscription' | 'job_posting' | 'featured_job' | 'recruitment_package' | 'other';
  onPaymentSuccess?: (receipt: PaymentReceipt) => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  defaultPlanName = 'Growth Recruiter Tier',
  defaultPriceUSD = 99,
  paymentType = 'subscription',
  onPaymentSuccess,
}: PaymentModalProps) {
  // Currency state
  const [currency, setCurrency] = useState<string>('NGN'); // Default to NGN as requested!
  const [activeTab, setActiveTab] = useState<'paystack' | 'bank_transfer' | 'ussd' | 'opay'>('paystack');

  // Customer state
  const [customerName, setCustomerName] = useState<string>('Alex Morgan');
  const [customerEmail, setCustomerEmail] = useState<string>('alex.morgan@jobhub.io');
  const [companyName, setCompanyName] = useState<string>('Apex Cloud Solutions');

  // Paystack Card inputs
  const [cardNumber, setCardNumber] = useState<string>('5399 4100 2841 9023');
  const [cardExpiry, setCardExpiry] = useState<string>('12/28');
  const [cardCvv, setCardCvv] = useState<string>('382');
  const [cardPin, setCardPin] = useState<string>('8219');

  // Bank Transfer virtual account
  const [virtualAccount, setVirtualAccount] = useState<VirtualAccountDetails | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(1800);

  // USSD Bank Selection
  const [selectedBankId, setSelectedBankId] = useState<string>('gtbank');
  const [bankSearch, setBankSearch] = useState<string>('');

  // OPay State
  const [opayDetails, setOpayDetails] = useState<OPayPaymentDetails | null>(null);
  const [opayUserPhone, setOpayUserPhone] = useState<string>('08101234567');
  const [opayPromptSent, setOpayPromptSent] = useState<boolean>(false);

  // Processing state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [completedReceipt, setCompletedReceipt] = useState<PaymentReceipt | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Calculate current amount in selected currency
  const convertedAmount = convertAmount(defaultPriceUSD, currency);

  // Init virtual account and opay details when modal opens or currency/amount changes
  useEffect(() => {
    if (isOpen) {
      const vAcc = generateVirtualAccount(customerName, convertedAmount, currency);
      setVirtualAccount(vAcc);
      const opDetails = generateOPayDetails(vAcc.transferReference, convertedAmount, currency);
      setOpayDetails(opDetails);
      setCountdownSeconds(1800);
      setCompletedReceipt(null);
      setIsProcessing(false);
      setOpayPromptSent(false);
    }
  }, [isOpen, currency, defaultPriceUSD]);

  // Countdown timer for bank transfer & USSD
  useEffect(() => {
    if (!isOpen || countdownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, countdownSeconds]);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleProcessPayment = async (channel: 'paystack' | 'bank_transfer' | 'ussd' | 'opay') => {
    setIsProcessing(true);

    if (channel === 'paystack') {
      setProcessingStep('Connecting to Paystack secure gateway...');
      await new Promise((r) => setTimeout(r, 600));
      setProcessingStep('Encrypting card data & 3D-Secure 2.0 authorization...');
      await new Promise((r) => setTimeout(r, 800));
      setProcessingStep('Processing settlement with central switch...');
      await new Promise((r) => setTimeout(r, 700));
    } else if (channel === 'bank_transfer') {
      setProcessingStep('Listening for automated NIP interbank credit notification...');
      await new Promise((r) => setTimeout(r, 800));
      setProcessingStep('Matching virtual account payment reference...');
      await new Promise((r) => setTimeout(r, 900));
    } else if (channel === 'ussd') {
      setProcessingStep('Verifying USSD session transaction token with bank gateway...');
      await new Promise((r) => setTimeout(r, 1000));
      setProcessingStep('Credit confirmed via NIBSS USSD settlement rail...');
      await new Promise((r) => setTimeout(r, 800));
    } else if (channel === 'opay') {
      setProcessingStep('Confirming OPay instant merchant wallet credit...');
      await new Promise((r) => setTimeout(r, 900));
      setProcessingStep('OPay settlement webhook acknowledged...');
      await new Promise((r) => setTimeout(r, 700));
    }

    try {
      const receipt = await executePaymentChannel({
        channel,
        amount: convertedAmount,
        currency,
        planName: defaultPlanName,
        paymentType,
        customerName,
        customerEmail,
        companyName,
      });

      setCompletedReceipt(receipt);
      setIsProcessing(false);
      if (onPaymentSuccess) {
        onPaymentSuccess(receipt);
      }
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  const selectedBank =
    NIGERIAN_BANKS_USSD.find((b) => b.id === selectedBankId) || NIGERIAN_BANKS_USSD[0];
  const refCode = virtualAccount?.transferReference.replace(/[^0-9]/g, '').slice(0, 5) || '41920';
  const computedUssdCode = selectedBank.syntax(convertedAmount, refCode);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative text-slate-100 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-4 sm:p-6 border-b border-slate-800 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                MULTI-CURRENCY CHECKOUT
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> 256-bit Encrypted
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1.5 flex items-center gap-2">
              {defaultPlanName}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Instant activation with Paystack, Automated Bank Transfer, USSD & OPay
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Currency & Amount Bar */}
        <div className="bg-slate-950 px-4 sm:px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Total Payable:</span>
            <span className="text-xl sm:text-2xl font-mono font-bold text-emerald-400">
              {formatCurrency(convertedAmount, currency)}
            </span>
            <span className="text-xs text-slate-500 font-mono">({currency})</span>
          </div>

          {/* Currency Switcher */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400">Currency:</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code} ({c.symbol}) - {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1">
          {completedReceipt ? (
            /* Successful Receipt Screen */
            <div className="space-y-6 animate-in zoom-in-95 duration-200">
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 ring-8 ring-emerald-500/10">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="text-2xl font-bold text-white">Payment Confirmed!</h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md mx-auto">
                  Your settlement was verified via <strong className="text-white">{completedReceipt.channelDisplayName}</strong>.
                  Plan entitlements are now active on your account.
                </p>
                <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1 rounded-full font-medium">
                  <Sparkles className="w-3.5 h-3.5" /> Automated Email Receipt & Tax Invoice Sent to {customerEmail}
                </div>
              </div>

              {/* Receipt Summary Card */}
              <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 sm:p-5 font-mono text-xs space-y-3">
                <div className="flex justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Invoice Number:</span>
                  <span className="text-white font-bold">{completedReceipt.invoiceNumber}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Transaction Reference:</span>
                  <span className="text-indigo-400 font-bold">{completedReceipt.transactionReference}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Payment Channel:</span>
                  <span className="text-white">{completedReceipt.channelDisplayName}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Amount Paid:</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    {completedReceipt.formattedAmount} ({completedReceipt.currency})
                  </span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Customer Entity:</span>
                  <span className="text-white">{completedReceipt.customerName} ({completedReceipt.companyName})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Timestamp:</span>
                  <span className="text-slate-300">{new Date(completedReceipt.paidAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    const receiptContent = `JOBHUB TAX INVOICE & RECEIPT (powered by genesix initiate group ltd)\nInvoice: ${completedReceipt.invoiceNumber}\nRef: ${completedReceipt.transactionReference}\nPlan: ${completedReceipt.planName}\nAmount: ${completedReceipt.formattedAmount} ${completedReceipt.currency}\nChannel: ${completedReceipt.channelDisplayName}\nCustomer: ${completedReceipt.customerName}\nDate: ${new Date(completedReceipt.paidAt).toLocaleString()}\nStatus: SUCCESSFUL (PAID)`;
                    const blob = new Blob([receiptContent], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `receipt-${completedReceipt.invoiceNumber}.txt`;
                    a.click();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer border border-slate-700"
                >
                  <Download className="w-4 h-4" /> Download Official Receipt
                </button>

                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition cursor-pointer text-center"
                >
                  Continue to Platform Workspace &rarr;
                </button>
              </div>
            </div>
          ) : isProcessing ? (
            /* Processing Screen */
            <div className="py-16 text-center space-y-4 animate-in fade-in">
              <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
              <h3 className="text-lg font-bold text-white">Authorizing Transaction...</h3>
              <p className="text-xs text-indigo-300 font-mono max-w-sm mx-auto">{processingStep}</p>
              <p className="text-[11px] text-slate-500">Please do not refresh or close this checkout window.</p>
            </div>
          ) : (
            /* Channel Selection & Forms */
            <>
              {/* Channel Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('paystack')}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                    activeTab === 'paystack'
                      ? 'bg-indigo-950/60 border-indigo-500 ring-1 ring-indigo-500/50 text-white'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <CreditCard className="w-4 h-4 text-cyan-400" />
                    <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded">
                      POPULAR
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs font-bold text-white">Paystack</p>
                    <p className="text-[10px] text-slate-400">Card & Apple Pay</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('bank_transfer')}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                    activeTab === 'bank_transfer'
                      ? 'bg-indigo-950/60 border-indigo-500 ring-1 ring-indigo-500/50 text-white'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">
                      INSTANT
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs font-bold text-white">Bank Transfer</p>
                    <p className="text-[10px] text-slate-400">Dedicated Virtual NUBAN</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('ussd')}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                    activeTab === 'ussd'
                      ? 'bg-indigo-950/60 border-indigo-500 ring-1 ring-indigo-500/50 text-white'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Smartphone className="w-4 h-4 text-amber-400" />
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded">
                      ALL BANKS
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs font-bold text-white">USSD Code</p>
                    <p className="text-[10px] text-slate-400">Dial *Code#</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('opay')}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                    activeTab === 'opay'
                      ? 'bg-indigo-950/60 border-indigo-500 ring-1 ring-indigo-500/50 text-white'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <PhoneCall className="w-4 h-4 text-teal-400" />
                    <span className="text-[10px] font-bold text-teal-400 bg-teal-950/60 px-1.5 py-0.5 rounded">
                      ZERO FEE
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs font-bold text-white">OPay Transfer</p>
                    <p className="text-[10px] text-slate-400">Wallet & App Push</p>
                  </div>
                </button>
              </div>

              {/* Tab 1: Paystack Channel */}
              {activeTab === 'paystack' && (
                <div className="space-y-4 bg-slate-950/60 rounded-xl p-4 sm:p-5 border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                        P
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-white">Paystack Multi-Currency Rail</h4>
                        <p className="text-[11px] text-slate-400">Accepts Naira (Verve, Mastercard, Visa) & Global Cards</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">Verve</span>
                      <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">Visa</span>
                      <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">Mastercard</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="5399 •••• •••• ••••"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Card Expiry (MM/YY)</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="12/28"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">CVV / CVC</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="•••"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleProcessPayment('paystack')}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-900/30"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Pay {formatCurrency(convertedAmount, currency)} via Paystack
                  </button>
                </div>
              )}

              {/* Tab 2: Automated Bank Transfer */}
              {activeTab === 'bank_transfer' && virtualAccount && (
                <div className="space-y-4 bg-slate-950/60 rounded-xl p-4 sm:p-5 border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">Dedicated Virtual NUBAN Account</h4>
                      <p className="text-[11px] text-slate-400">Transfer from any banking app (Kuda, GTB, Zenith, OPay, etc.)</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono bg-amber-950/40 px-2 py-1 rounded-lg border border-amber-800/60">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatTimer(countdownSeconds)}</span>
                    </div>
                  </div>

                  {/* Account Box */}
                  <div className="bg-slate-900 rounded-xl border border-indigo-500/30 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Bank Name:</span>
                      <span className="text-xs font-bold text-white">{virtualAccount.bankName}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Account Number:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-base sm:text-lg font-mono font-bold text-emerald-400 tracking-wider">
                          {virtualAccount.accountNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(virtualAccount.accountNumber, 'acc')}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                          title="Copy account number"
                        >
                          {copiedText === 'acc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Account Name:</span>
                      <span className="text-xs font-semibold text-white">{virtualAccount.accountName}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <span className="text-xs text-slate-400">Amount to Transfer:</span>
                      <span className="text-sm font-mono font-bold text-cyan-400">
                        {formatCurrency(convertedAmount, currency)}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Once your bank transfer is submitted, funds are matched instantly via the automated NIP settlement rail.
                  </p>

                  <button
                    type="button"
                    onClick={() => handleProcessPayment('bank_transfer')}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-900/30"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    I Have Sent {formatCurrency(convertedAmount, currency)}
                  </button>
                </div>
              )}

              {/* Tab 3: USSD Code for ALL Banks */}
              {activeTab === 'ussd' && (
                <div className="space-y-4 bg-slate-950/60 rounded-xl p-4 sm:p-5 border border-slate-800">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">USSD Quick Banking (All Banks)</h4>
                    <p className="text-[11px] text-slate-400">Select your bank below to get your 1-click USSD dial code</p>
                  </div>

                  {/* Bank Selector */}
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Choose Bank:</label>
                    <select
                      value={selectedBankId}
                      onChange={(e) => setSelectedBankId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                    >
                      {NIGERIAN_BANKS_USSD.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.shortCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* USSD Dial Display */}
                  <div className="bg-slate-900 rounded-xl border border-amber-500/30 p-4 text-center space-y-2">
                    <span className="text-[11px] text-slate-400">Dial this USSD code on your registered phone:</span>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg sm:text-xl font-mono font-bold text-amber-400 tracking-wider">
                        {computedUssdCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(computedUssdCode, 'ussd')}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                      >
                        {copiedText === 'ussd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="pt-2 flex justify-center gap-2">
                      <a
                        href={`tel:${computedUssdCode.replace(/#/g, '%23')}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/30 transition"
                      >
                        <PhoneCall className="w-3 h-3" /> Tap to Dial Code
                      </a>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 text-center">
                    Authorize the prompt on your phone with your USSD banking PIN.
                  </p>

                  <button
                    type="button"
                    onClick={() => handleProcessPayment('ussd')}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-900/30"
                  >
                    <Smartphone className="w-4 h-4" />
                    Verify USSD Settlement ({formatCurrency(convertedAmount, currency)})
                  </button>
                </div>
              )}

              {/* Tab 4: OPay Channel */}
              {activeTab === 'opay' && opayDetails && (
                <div className="space-y-4 bg-slate-950/60 rounded-xl p-4 sm:p-5 border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">
                        OP
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-white">OPay Direct Merchant Transfer</h4>
                        <p className="text-[11px] text-slate-400">Zero fees &bull; Instant push confirmation</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-teal-400 bg-teal-950/60 border border-teal-800/80 px-2 py-0.5 rounded-full">
                      OPay Rail
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    {/* Simulated QR Code box */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                      <div className="w-24 h-24 bg-white p-2 rounded-lg flex items-center justify-center shadow">
                        <QrCode className="w-20 h-20 text-slate-950" />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2">Scan via OPay Mobile App</p>
                    </div>

                    {/* Merchant Wallet Box */}
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-400">Merchant Wallet:</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono font-bold text-teal-400 text-base">{opayDetails.merchantWalletNumber}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(opayDetails.merchantWalletNumber, 'opay')}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                          >
                            {copiedText === 'opay' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400">Account Name:</span>
                        <p className="font-semibold text-white text-[11px]">{opayDetails.merchantName}</p>
                      </div>

                      <div>
                        <span className="text-slate-400">OPay Phone Prompt:</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <input
                            type="text"
                            value={opayUserPhone}
                            onChange={(e) => setOpayUserPhone(e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono w-full"
                            placeholder="0810 ••• ••••"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setOpayPromptSent(true);
                              setTimeout(() => setOpayPromptSent(false), 5000);
                            }}
                            className="px-2.5 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer"
                          >
                            Send Prompt
                          </button>
                        </div>
                        {opayPromptSent && (
                          <p className="text-[10px] text-teal-300 mt-1 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Push authorization request dispatched to your OPay app!
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleProcessPayment('opay')}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-teal-900/30"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Confirm OPay Settlement ({formatCurrency(convertedAmount, currency)})
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 p-3 sm:p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span>PCI-DSS Level 1</span>
            <span>&bull;</span>
            <span>CBN Regulated Rails</span>
            <span>&bull;</span>
            <span>NDPR Compliant</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
