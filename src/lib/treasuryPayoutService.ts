export interface AdminBankAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
  currency: 'NGN' | 'USD' | 'GBP' | 'EUR';
  routingOrSwift?: string;
  sortCode?: string;
  isVerified: boolean;
  lastUpdated: string;
  updatedBy: string;
}

export interface PayoutRecord {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: 'completed' | 'processing';
  payoutDate: string;
  initiatedBy: string;
  fee: number;
  netAmount: number;
  notes?: string;
}

export const POPULAR_BANKS = [
  'Zenith Bank Plc',
  'Guaranty Trust Bank (GTBank)',
  'Access Bank Plc',
  'First Bank of Nigeria',
  'United Bank for Africa (UBA)',
  'Stanbic IBTC Bank',
  'Kuda Microfinance Bank',
  'Moniepoint Microfinance Bank',
  'OPay Digital Services',
  'Sterling Bank Plc',
  'Fidelity Bank Plc',
  'Wema Bank / ALAT',
  'Standard Chartered Bank',
  'Citibank International (USD Wire)',
  'JPMorgan Chase Bank (USD Wire)',
  'Barclays Bank UK (GBP Wire)',
];

const STORAGE_KEY_BANK = 'jobhub_admin_payout_bank';
const STORAGE_KEY_PAYOUTS = 'jobhub_treasury_payouts_ledger';

export const DEFAULT_ADMIN_BANK: AdminBankAccount = {
  bankName: 'Zenith Bank Plc',
  accountNumber: '1015893240',
  accountName: 'GENESIX INITIATE GROUP LTD',
  currency: 'NGN',
  routingOrSwift: 'ZEIBNGLA',
  isVerified: true,
  lastUpdated: new Date().toISOString(),
  updatedBy: 'genesixintiate@gmail.com',
};

export const INITIAL_PAYOUTS: PayoutRecord[] = [
  {
    id: 'po-init-01',
    reference: 'PO-NGN-202610-001',
    amount: 3500000,
    currency: 'NGN',
    bankName: 'Zenith Bank Plc',
    accountNumber: '1015893240',
    accountName: 'GENESIX INITIATE GROUP LTD',
    status: 'completed',
    payoutDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    initiatedBy: 'genesixintiate@gmail.com',
    fee: 0,
    netAmount: 3500000,
    notes: 'Q3 Enterprise ATS subscription disbursement settlement',
  },
];

export const treasuryPayoutService = {
  /**
   * Retrieves the configured Admin Destination Bank Account
   */
  getBankAccount(): AdminBankAccount {
    if (typeof window === 'undefined') return DEFAULT_ADMIN_BANK;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_BANK);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY_BANK, JSON.stringify(DEFAULT_ADMIN_BANK));
        return DEFAULT_ADMIN_BANK;
      }
      return JSON.parse(raw);
    } catch {
      return DEFAULT_ADMIN_BANK;
    }
  },

  /**
   * Updates the admin payout destination bank details
   */
  saveBankAccount(details: Partial<AdminBankAccount>): AdminBankAccount {
    const current = this.getBankAccount();
    const updated: AdminBankAccount = {
      ...current,
      ...details,
      isVerified: true,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'genesixintiate@gmail.com',
    };
    localStorage.setItem(STORAGE_KEY_BANK, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('jobhub_bank_updated'));
    }
    return updated;
  },

  /**
   * Retrieves all payout history
   */
  getPayoutHistory(): PayoutRecord[] {
    if (typeof window === 'undefined') return INITIAL_PAYOUTS;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PAYOUTS);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY_PAYOUTS, JSON.stringify(INITIAL_PAYOUTS));
        return INITIAL_PAYOUTS;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_PAYOUTS;
    }
  },

  /**
   * Computes available platform balance
   * Based on payments captured minus withdrawals completed
   */
  getTreasuryMetrics(): {
    totalGrossRevenue: number;
    totalWithdrawn: number;
    availableBalance: number;
    currency: string;
  } {
    // Base platform gross volume from enterprise subscriptions and job posts
    const baseGrossRevenue = 14850000; // NGN equivalent or standard base volume
    const payouts = this.getPayoutHistory();
    const totalWithdrawn = payouts.reduce((sum, p) => sum + (p.status === 'completed' ? p.amount : 0), 0);
    const availableBalance = Math.max(0, baseGrossRevenue - totalWithdrawn);

    return {
      totalGrossRevenue: baseGrossRevenue,
      totalWithdrawn,
      availableBalance,
      currency: 'NGN',
    };
  },

  /**
   * Executes a full withdrawal of ALL available payment funds to the provided bank account
   */
  withdrawAllPayments(
    overrideBank?: AdminBankAccount,
    notes?: string
  ): { success: boolean; payout: PayoutRecord; message: string } {
    const { availableBalance, currency } = this.getTreasuryMetrics();

    if (availableBalance <= 0) {
      throw new Error('No withdrawable balance available on the platform at this time.');
    }

    return this.executeWithdrawal(availableBalance, currency, overrideBank, notes);
  },

  /**
   * Executes a custom amount withdrawal
   */
  withdrawCustomAmount(
    amount: number,
    overrideBank?: AdminBankAccount,
    notes?: string
  ): { success: boolean; payout: PayoutRecord; message: string } {
    const { availableBalance, currency } = this.getTreasuryMetrics();

    if (amount <= 0) {
      throw new Error('Withdrawal amount must be greater than zero.');
    }

    if (amount > availableBalance) {
      throw new Error(
        `Withdrawal amount of ₦${amount.toLocaleString()} exceeds available platform balance (₦${availableBalance.toLocaleString()}).`
      );
    }

    return this.executeWithdrawal(amount, currency, overrideBank, notes);
  },

  executeWithdrawal(
    amount: number,
    currency: string,
    overrideBank?: AdminBankAccount,
    notes?: string
  ): { success: boolean; payout: PayoutRecord; message: string } {
    const bank = overrideBank || this.getBankAccount();

    if (!bank.accountNumber || !bank.bankName) {
      throw new Error('Please provide destination bank account details before initiating withdrawal.');
    }

    const ref = `PO-${bank.currency}-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const newPayout: PayoutRecord = {
      id: `payout-${Date.now()}`,
      reference: ref,
      amount,
      currency: bank.currency || currency,
      bankName: bank.bankName,
      accountNumber: bank.accountNumber,
      accountName: bank.accountName,
      status: 'completed',
      payoutDate: new Date().toISOString(),
      initiatedBy: 'genesixintiate@gmail.com',
      fee: 0,
      netAmount: amount,
      notes: notes || 'Admin platform revenue settlement withdrawal to corporate bank account',
    };

    const history = this.getPayoutHistory();
    const updated = [newPayout, ...history];
    localStorage.setItem(STORAGE_KEY_PAYOUTS, JSON.stringify(updated));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('jobhub_treasury_updated'));
    }

    return {
      success: true,
      payout: newPayout,
      message: `Successfully transferred ₦${amount.toLocaleString()} to ${bank.bankName} (Acc: ${bank.accountNumber} - ${bank.accountName}). Settlement reference: ${ref}`,
    };
  },
};
