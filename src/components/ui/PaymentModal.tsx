"use client";
import { useState, useEffect } from "react";
import { X, Save, Loader2, DollarSign } from "lucide-react";
import { Invoice } from "@/types";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onSave: (data: any) => void;
  isLoading: boolean;
}

export default function PaymentModal({ isOpen, onClose, invoice, onSave, isLoading }: PaymentModalProps) {
  const [paymentData, setPaymentData] = useState({
    payment_date: new Date().toISOString().split('T')[0],
    amount: "",
    payment_method: "bank_transfer" as "cash" | "bank_transfer" | "cheque" | "online" | "other",
    reference_number: "",
    notes: "", 
  });

  useEffect(() => {
    if (isOpen && invoice) {
      setPaymentData({
        payment_date: new Date().toISOString().split('T')[0],
        amount: "",
        payment_method: "bank_transfer",
        reference_number: "",
        notes: "",
      });
    }
  }, [isOpen, invoice]);

  if (!isOpen || !invoice) return null;

  const outstanding = Number(invoice.total_amount) - Number(invoice.paid_amount);
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'NPR' }).format(amount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(paymentData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 w-full max-w-md p-6 shadow-2xl">
        
    
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <DollarSign size={20} className="text-green-600" /> Record Payment
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            <X size={20} />
          </button>
        </div>
        
     
        <div className="mb-4 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">Invoice: <span className="font-medium text-gray-900 dark:text-white">{invoice.invoice_number}</span></div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Outstanding: <span className="font-bold text-red-600">{formatCurrency(outstanding)}</span></div>
        </div>

    
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Date</label>
              <input 
                type="date" 
                required 
                value={paymentData.payment_date} 
                onChange={(e) => setPaymentData({...paymentData, payment_date: e.target.value})} 
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-green-500" 
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Amount *</label>
              <input 
                type="number" 
                required 
                min="0.01" 
                step="0.01" 
                value={paymentData.amount} 
                onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})} 
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-green-500" 
                placeholder="0.00" 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Method</label>
            <select 
              value={paymentData.payment_method} 
              onChange={(e) => setPaymentData({...paymentData, payment_method: e.target.value as any})} 
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
              <option value="online">Online</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Reference No.</label>
            <input 
              type="text" 
              value={paymentData.reference_number} 
              onChange={(e) => setPaymentData({...paymentData, reference_number: e.target.value})} 
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-green-500" 
              placeholder="e.g., TXN12345" 
            />
          </div>

        
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Notes (Optional)</label>
            <textarea 
              value={paymentData.notes} 
              onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})} 
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-green-500 resize-none" 
              placeholder="Any additional details about this payment..." 
            />
          </div>

   
          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading} 
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-70 flex items-center justify-center gap-2 transition-colors"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
              Save Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}