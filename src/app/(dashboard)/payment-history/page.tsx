"use client";
import { useState } from "react";
import { paymentService } from "@/services/paymentService";
import { Invoice, Payment } from "@/types";
import { History, Search, Loader2, Receipt, Calendar, DollarSign, FileText } from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function PaymentHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [invoiceData, setInvoiceData] = useState<Invoice | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error("Please enter an invoice number");
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await paymentService.searchByInvoice(searchQuery.trim());
      if (res.success) {
        setInvoiceData(res.data.invoice);
        setPayments(res.data.payments || []);
      } else {
        setInvoiceData(null);
        setPayments([]);
        toast.error(res.message || "Invoice not found");
      }
    } catch (error: any) {
      setInvoiceData(null);
      setPayments([]);
      toast.error(error.response?.data?.message || "Failed to search");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'NPR' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <Breadcrumb title="Dashboard" subTitle="Payment History" breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Billing" }]} />

      {/* Search Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <History size={20} className="text-green-600" /> Search Invoice Payments
        </h2>
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Enter Invoice Number (e.g., INV-2024-001)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
            Search
          </button>
        </form>
      </div>


      {hasSearched && invoiceData && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
       
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Receipt size={20} className="text-blue-600" />
                  {invoiceData.invoice_number}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Client: <span className="font-medium text-gray-900 dark:text-white">{invoiceData.client?.name}</span>
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Amount</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(Number(invoiceData.total_amount))}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-slate-700">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Paid</div>
                <div className="text-lg font-semibold text-green-600">
                  {formatCurrency(payments.reduce((sum, p) => sum + Number(p.amount), 0))}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Outstanding</div>
                <div className="text-lg font-semibold text-red-600">
                  {formatCurrency(Number(invoiceData.total_amount) - payments.reduce((sum, p) => sum + Number(p.amount), 0))}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Payments</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{payments.length}</div>
              </div>
            </div>
          </div>

         
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-slate-800">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <DollarSign size={20} className="text-green-600" /> Payment Records
              </h3>
            </div>
            
            {payments.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <FileText size={48} className="mx-auto mb-3 opacity-50" />
                <p>No payments have been recorded for this invoice yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-green-50 dark:bg-green-900/20 text-gray-700 dark:text-gray-300 font-semibold">
                    <tr>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Amount</th>
                      <th className="px-6 py-3">Method</th>
                      <th className="px-6 py-3">Reference</th>
                      <th className="px-6 py-3">Notes</th>
                      <th className="px-6 py-3">Recorded By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            {formatDate(payment.payment_date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-green-600">
                          {formatCurrency(Number(payment.amount))}
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400 capitalize">
                          {payment.payment_method?.replace('_', ' ')}
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400 font-mono text-xs">
                          {payment.reference_number || '-'}
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400 max-w-xs truncate" title={payment.notes || ''}>
                          {payment.notes || '-'}
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                          {payment.recorder?.name || 'Unknown'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

    
      {hasSearched && !invoiceData && !isLoading && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-12 text-center shadow-sm">
          <Search size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Invoice Found</h3>
          <p className="text-gray-500 dark:text-gray-400">Please check the invoice number and try again.</p>
        </div>
      )}
    </div>
  );
}