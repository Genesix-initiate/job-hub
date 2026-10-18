import React, { useState, useEffect } from 'react';
import { ScrollText, Download, FileText, CheckCircle2 } from 'lucide-react';
import { adminService } from '../../../lib/adminService';
import { Invoice } from '../../../types/database';

export function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminService.getInvoices().then((res) => {
      setInvoices(res);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <ScrollText className="w-6 h-6 text-rose-400" />
          Tax Invoices & Billing Records
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Archived customer VAT invoices, corporate tax receipts, and payment references
        </p>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
              <tr>
                <th className="py-3 px-4">Invoice Number</th>
                <th className="py-3 px-4">Billed Enterprise</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Issued Timestamp</th>
                <th className="py-3 px-4">Invoice Status</th>
                <th className="py-3 px-4 text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
                    <p className="text-xs font-semibold text-slate-400">No tax invoices generated yet</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Invoices issued upon successful subscription settlements or featured job purchases will appear here.
                    </p>
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-semibold text-white">
                      {inv.invoice_number}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      <div>{inv.company_name || 'Organization'}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{inv.customer_name}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-200 font-semibold">
                      ${inv.amount.toFixed(2)} {inv.currency}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(inv.issued_at).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        {inv.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {}}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                        title="Download PDF Invoice"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
