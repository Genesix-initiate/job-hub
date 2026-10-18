import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Search,
  CheckCircle2,
  Clock,
  Download,
  ArrowUpRight,
  CreditCard,
  Building2,
  Send,
  AlertCircle,
  RefreshCw,
  Wallet,
  Landmark,
  ShieldCheck,
  Check,
  X,
  FileText,
  TrendingDown,
} from 'lucide-react';
import { adminService } from '../../../lib/adminService';
import { PaymentTransaction } from '../../../types/database';
import { useAuth } from '../../../context/AuthContext';
import { PaymentModal } from '../../../components/payment/PaymentModal';
import {
  treasuryPayoutService,
  AdminBankAccount,
  PayoutRecord,
  POPULAR_BANKS,
} from '../../../lib/treasuryPayoutService';

export function AdminPaymentsPage() {
  const { profile: currentAdmin } = useAuth();
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Treasury & Payout State
  const [treasuryMetrics, setTreasuryMetrics] = useState(() => treasuryPayoutService.getTreasuryMetrics());
  const [bankAccount, setBankAccount] = useState<AdminBankAccount>(() => treasuryPayoutService.getBankAccount());
  const [payoutHistory, setPayoutHistory] = useState<PayoutRecord[]>(() => treasuryPayoutService.getPayoutHistory());

  // Withdrawal Modal State
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [isAllFunds, setIsAllFunds] = useState(true);
  const [withdrawNotes, setWithdrawNotes] = useState('');
  const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState(false);

  // Bank Edit Modal State
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [bankForm, setBankForm] = useState<AdminBankAccount>(bankAccount);

  // Feedback Notification
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = () => {
    adminService.getPayments().then((res) => {
      try {
        const local = JSON.parse(
          localStorage.getItem('jobhub_local_payments') ||
          localStorage.getItem('talentforge_local_payments') ||
          '[]'
        );
        const merged = [
          ...local,
          ...res.filter((p) => !local.some((l: PaymentTransaction) => l.transaction_reference === p.transaction_reference)),
        ];
        setPayments(merged);
      } catch (e) {
        setPayments(res);
      }
      setIsLoading(false);
    });

    setTreasuryMetrics(treasuryPayoutService.getTreasuryMetrics());
    setBankAccount(treasuryPayoutService.getBankAccount());
    setPayoutHistory(treasuryPayoutService.getPayoutHistory());
  };

  useEffect(() => {
    loadData();

    const handleTreasuryUpdate = () => {
      setTreasuryMetrics(treasuryPayoutService.getTreasuryMetrics());
      setPayoutHistory(treasuryPayoutService.getPayoutHistory());
    };

    const handleBankUpdate = () => {
      setBankAccount(treasuryPayoutService.getBankAccount());
    };

    window.addEventListener('jobhub_treasury_updated', handleTreasuryUpdate);
    window.addEventListener('jobhub_bank_updated', handleBankUpdate);
    return () => {
      window.removeEventListener('jobhub_treasury_updated', handleTreasuryUpdate);
      window.removeEventListener('jobhub_bank_updated', handleBankUpdate);
    };
  }, []);

  const handleOpenWithdrawAll = () => {
    const metrics = treasuryPayoutService.getTreasuryMetrics();
    setWithdrawAmount(metrics.availableBalance);
    setIsAllFunds(true);
    setWithdrawNotes('Direct disbursement of full available platform payments to company bank account');
    setIsWithdrawModalOpen(true);
  };

  const handleExecuteWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingWithdrawal(true);

    try {
      let res;
      if (isAllFunds || withdrawAmount >= treasuryMetrics.availableBalance) {
        res = treasuryPayoutService.withdrawAllPayments(bankAccount, withdrawNotes);
      } else {
        res = treasuryPayoutService.withdrawCustomAmount(withdrawAmount, bankAccount, withdrawNotes);
      }

      setIsProcessingWithdrawal(false);
      setIsWithdrawModalOpen(false);
      setNotification({ type: 'success', message: res.message });
      loadData();
      setTimeout(() => setNotification(null), 6000);
    } catch (err: any) {
      setIsProcessingWithdrawal(false);
      setNotification({ type: 'error', message: err.message || 'Withdrawal processing failed.' });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleSaveBankDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankForm.accountNumber || !bankForm.bankName || !bankForm.accountName) {
      alert('Please fill out all bank account fields.');
      return;
    }

    const saved = treasuryPayoutService.saveBankAccount(bankForm);
    setBankAccount(saved);
    setIsBankModalOpen(false);
    setNotification({
      type: 'success',
      message: `Destination bank account updated to ${saved.bankName} (${saved.accountNumber}).`,
    });
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            Treasury, Bank Withdrawals &amp; Payments Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time platform revenue ledger and instant bank account settlement withdrawals
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenWithdrawAll}
            disabled={treasuryMetrics.availableBalance <= 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-xs text-white font-bold transition shadow-lg shadow-emerald-600/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Landmark className="w-4 h-4" />
            <span>Withdraw All Payments to Bank</span>
          </button>

          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs text-slate-200 transition cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Process Payment Test</span>
          </button>

          <button
            onClick={async () => {
              const csv = await adminService.exportDataset('payments', currentAdmin?.id || 'admin');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `jobhub-payments-${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs text-slate-200 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-3 animate-in fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* TREASURY & BANK WITHDRAWAL COMMAND PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Available Balance & Instant Withdrawal CTA */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 flex flex-col justify-between space-y-4 shadow-xl shadow-emerald-950/20">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5" /> Available Withdrawable Revenue
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                100% UNLOCKED
              </span>
            </div>
            <div className="mt-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                ₦{treasuryMetrics.availableBalance.toLocaleString()}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Net funds collected from employer subscriptions and recruitment posting fees.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <button
              onClick={handleOpenWithdrawAll}
              disabled={treasuryMetrics.availableBalance <= 0}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer disabled:opacity-50"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Withdraw All Payments Now (₦{treasuryMetrics.availableBalance.toLocaleString()})</span>
            </button>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Settlement Fee: 0%</span>
              <span className="text-emerald-400">Direct Bank Transfer</span>
            </div>
          </div>
        </div>

        {/* Configured Destination Bank Account Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-indigo-400" /> Admin Destination Bank Account
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <Check className="w-3 h-3" /> Verified
              </span>
            </div>

            <div className="mt-3 space-y-2 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Beneficiary Account Name</span>
                <p className="text-sm font-bold text-white tracking-wide">{bankAccount.accountName}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/60 font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Bank Name</span>
                  <p className="text-xs text-slate-200 font-semibold truncate">{bankAccount.bankName}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Account Number</span>
                  <p className="text-xs text-emerald-400 font-bold">{bankAccount.accountNumber}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setBankForm({ ...bankAccount });
                setIsBankModalOpen(true);
              }}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Change / Update Payout Bank Account</span>
            </button>
          </div>
        </div>

        {/* Total Platform Revenue & Historical Payout Summary */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-amber-400" /> Lifetime Settlement Summary
            </span>

            <div className="mt-3 space-y-3 font-mono">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs text-slate-400">Total Gross Captured:</span>
                <span className="text-sm font-bold text-white">₦{treasuryMetrics.totalGrossRevenue.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs text-slate-400">Total Withdrawn:</span>
                <span className="text-sm font-bold text-amber-400">₦{treasuryMetrics.totalWithdrawn.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs text-slate-400">Settlements Processed:</span>
                <span className="text-sm font-bold text-emerald-400">{payoutHistory.length} Transactions</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 font-sans">
            Settlement settlements execute directly via official Nigerian automated clearing House (NIBSS) / Wire.
          </p>
        </div>
      </div>

      {/* WITHDRAWAL & SETTLEMENT HISTORY */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Landmark className="w-4 h-4 text-emerald-400" />
            Bank Withdrawal &amp; Payout Settlements History ({payoutHistory.length})
          </h2>
          <span className="text-xs text-slate-400">Disbursements transferred to admin bank account</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                <tr>
                  <th className="py-3 px-4">Payout Ref</th>
                  <th className="py-3 px-4">Destination Bank</th>
                  <th className="py-3 px-4">Account Number</th>
                  <th className="py-3 px-4">Beneficiary Name</th>
                  <th className="py-3 px-4">Amount Withdrawn</th>
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {payoutHistory.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-300">
                      {p.reference}
                    </td>
                    <td className="py-3.5 px-4 text-white font-semibold">
                      {p.bankName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {p.accountNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-200">
                      {p.accountName}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-extrabold text-white text-sm">
                      ₦{p.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(p.payoutDate).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        Transferred (Completed)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* INCOMING CLIENT PAYMENT TRANSACTIONS */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-indigo-400" />
            Incoming Client Transactions &amp; Revenue Ledger ({payments.length})
          </h2>
          <span className="text-xs text-slate-400">Employer subscriptions and recruitment payments</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                <tr>
                  <th className="py-3 px-4">Transaction Ref</th>
                  <th className="py-3 px-4">Customer Entity</th>
                  <th className="py-3 px-4">Payment Type</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      <CreditCard className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
                      <p className="text-xs font-semibold text-slate-400">No payment transactions recorded yet</p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Settlements via Paystack, Bank Transfer, USSD, and cards will be audited here in real time.
                      </p>
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-mono font-semibold text-white">
                        {p.transaction_reference}
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        <div>{p.company_name || 'Direct Payer / Organization'}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{p.payer_name}</div>
                      </td>

                      <td className="py-3.5 px-4 capitalize text-slate-300 font-mono text-[11px]">
                        {p.payment_type.replace('_', ' ')}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-semibold text-white">
                        ${p.amount.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 capitalize text-slate-300 font-mono text-[11px]">
                        {p.payment_method}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* WITHDRAW ALL PAYMENTS MODAL */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5 text-emerald-400">
                <Landmark className="w-6 h-6" />
                <h3 className="font-bold text-white text-base">Withdraw Payments to Bank Account</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteWithdrawal} className="space-y-4 text-xs">
              {/* Amount Selection */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Available Withdrawable Balance:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    ₦{treasuryMetrics.availableBalance.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAllFunds(true);
                      setWithdrawAmount(treasuryMetrics.availableBalance);
                    }}
                    className={`flex-1 py-2 px-3 rounded-xl font-bold transition cursor-pointer ${
                      isAllFunds
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    Withdraw All (100%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAllFunds(false)}
                    className={`flex-1 py-2 px-3 rounded-xl font-bold transition cursor-pointer ${
                      !isAllFunds
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    Custom Amount
                  </button>
                </div>

                {!isAllFunds && (
                  <div className="pt-2">
                    <label className="block text-slate-400 mb-1 font-mono">Specify Amount (NGN)</label>
                    <input
                      type="number"
                      value={withdrawAmount}
                      max={treasuryMetrics.availableBalance}
                      onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Destination Bank Account Confirmation */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400 uppercase">Destination Bank Details</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsWithdrawModalOpen(false);
                      setIsBankModalOpen(true);
                    }}
                    className="text-[11px] text-indigo-400 hover:underline font-semibold"
                  >
                    Change Bank
                  </button>
                </div>

                <div className="font-mono text-xs text-white space-y-0.5">
                  <p className="font-bold">{bankAccount.accountName}</p>
                  <p className="text-slate-300">
                    {bankAccount.bankName} &bull; Acc: <span className="text-emerald-400 font-bold">{bankAccount.accountNumber}</span>
                  </p>
                </div>
              </div>

              {/* Transfer Notes */}
              <div>
                <label className="block text-slate-400 font-mono mb-1">Transfer Memo / Reference Note</label>
                <input
                  type="text"
                  value={withdrawNotes}
                  onChange={(e) => setWithdrawNotes(e.target.value)}
                  placeholder="e.g. October platform dividend / operating settlement"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="px-3 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingWithdrawal || withdrawAmount <= 0}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 text-white font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30 disabled:opacity-50"
                >
                  {isProcessingWithdrawal ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Processing Settlement...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Confirm &amp; Transfer ₦{withdrawAmount.toLocaleString()}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT DESTINATION BANK MODAL */}
      {isBankModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5 text-indigo-400">
                <Building2 className="w-5 h-5" />
                <h3 className="font-bold text-white text-base">Provide Destination Bank Account</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBankModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Payments withdrawn by the administrator will be credited directly to this verified bank account.
            </p>

            <form onSubmit={handleSaveBankDetails} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1 font-mono">Select Bank</label>
                <select
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  required
                >
                  {POPULAR_BANKS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1 font-mono">Account Number (NUBAN / IBAN)</label>
                <input
                  type="text"
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                  placeholder="e.g., 1015893240"
                  maxLength={20}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1 font-mono">Beneficiary Account Name</label>
                <input
                  type="text"
                  value={bankForm.accountName}
                  onChange={(e) => setBankForm({ ...bankForm, accountName: e.target.value })}
                  placeholder="e.g., GENESIX INITIATE GROUP LTD"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1 font-mono">Payout Currency</label>
                  <select
                    value={bankForm.currency}
                    onChange={(e) => setBankForm({ ...bankForm, currency: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  >
                    <option value="NGN">NGN (₦)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1 font-mono">Swift / Sort Code (Optional)</label>
                  <input
                    type="text"
                    value={bankForm.routingOrSwift || ''}
                    onChange={(e) => setBankForm({ ...bankForm, routingOrSwift: e.target.value })}
                    placeholder="e.g., ZEIBNGLA"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBankModalOpen(false)}
                  className="px-3 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition cursor-pointer shadow-md shadow-indigo-600/30"
                >
                  Save Payout Bank Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Test Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        defaultPlanName="Admin Test Platform Payment"
        defaultPriceUSD={150}
        onPaymentSuccess={() => {
          loadData();
          setIsPaymentModalOpen(false);
          setNotification({ type: 'success', message: 'Test transaction processed successfully.' });
          setTimeout(() => setNotification(null), 4000);
        }}
      />
    </div>
  );
}
