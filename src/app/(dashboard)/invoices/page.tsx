"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { invoiceService } from "@/services/invoiceService";
import { paymentService } from "@/services/paymentService"; 
import { clientService } from "@/services/clientService";
import { Invoice, Client, PaginatedResponse } from "@/types";
import { Receipt, Search, RefreshCw, Loader2, Plus, Pencil, Trash2, DollarSign, Download, Mail } from "lucide-react"; 
import toast from "react-hot-toast";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Pagination from "@/components/ui/Pagination";
import PaymentModal from "@/components/ui/PaymentModal"; 

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterClient, setFilterClient] = useState("");
  
  const [clients, setClients] = useState<Client[]>([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);


  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const clientsRes = await clientService.getAllClients();
        if (clientsRes.success) setClients((clientsRes.data as any)?.data || []);
      } catch (error) {
        console.error("Failed to load filters", error);
      }
    };
    loadFilters();
  }, []);

  const fetchData = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const res = await invoiceService.getAll({ 
        search, 
        status: filterStatus || undefined,
        client_id: filterClient || undefined,
        page 
      });
      
      if (res.success && res.data) {
        const paginator = res.data as unknown as PaginatedResponse<Invoice>;
        setInvoices(paginator.data || []);
        setCurrentPage(paginator.current_page);
        setLastPage(paginator.last_page);
        setTotal(paginator.total);
      }
    } catch (error) {
      toast.error("Failed to fetch invoices");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(1); }, [search, filterStatus, filterClient]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= lastPage) fetchData(page);
  };

  const handleDelete = async (id: number, invoiceNumber: string) => {
    if (!window.confirm(`Delete invoice "${invoiceNumber}"?`)) return;
    try {
      await invoiceService.delete(id);
      toast.success("Invoice deleted successfully");
      fetchData(currentPage);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };

  const openPaymentModal = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setShowPaymentModal(true);
  };


  const handleSavePayment = async (paymentData: any) => {
    if (!selectedInvoice) return;
    
    const amountNum = Number(paymentData.amount);
    const outstanding = Number(selectedInvoice.total_amount) - Number(selectedInvoice.paid_amount);
    
    if (!amountNum || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (amountNum > outstanding) {
      toast.error("Payment amount cannot exceed outstanding amount");
      return;
    }

    setIsPaymentLoading(true);
    try {
      await paymentService.create(selectedInvoice.id, {
        ...paymentData,
        amount: amountNum,
      });
      toast.success("Payment recorded successfully!");
      setShowPaymentModal(false);
      fetchData(currentPage); 
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to record payment");
    } finally {
      setIsPaymentLoading(false);
    }
  };


  const handleSendInvoiceReminder = async (id: number) => {
    try {
      await invoiceService.sendReminder(id);
      toast.success("Invoice reminder sent successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send reminder");
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      case 'sent': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'partial': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'cancelled': return 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };



  const handleDownloadPdf = async (id: number, invoiceNumber: string) => {
    try {
      const blob = await invoiceService.downloadPdf(id);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("PDF downloaded successfully");
    } catch (error) {
      toast.error("Failed to download PDF");
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
      <Breadcrumb title="Dashboard" subTitle="Invoices" breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Billing" }]} />

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <Receipt size={20} className="text-green-600" /> Invoice Management
          </h2>
          <button
            onClick={() => router.push("/invoices/create")}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={16} /> Create Invoice
          </button>
        </div>

   
        <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by invoice # or client..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none" 
            />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none">
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
          <button onClick={() => { setSearch(""); setFilterStatus(""); setFilterClient(""); }} className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg">
            <RefreshCw size={16} /> Reset
          </button>
        </div>

 
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-green-50 dark:bg-green-900/20 text-gray-700 dark:text-gray-300 font-semibold">
              <tr>
                <th className="px-6 py-3">Invoice #</th>
                <th className="px-6 py-3">Client</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center"><Loader2 className="animate-spin mx-auto text-green-600" size={24} /></td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No invoices found</td></tr>
              ) : (
                invoices.map((inv) => {
                  const outstanding = Number(inv.total_amount) - Number(inv.paid_amount);
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm font-medium text-gray-900 dark:text-white">{inv.invoice_number}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{inv.client?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-xs">
                        <div>{formatDate(inv.invoice_date)}</div>
                        <div className="text-gray-500">Due: {formatDate(inv.due_date)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900 dark:text-white">{formatCurrency(Number(inv.total_amount))}</div>
                        {Number(inv.paid_amount) > 0 && (
                          <div className="text-xs text-green-600">Paid: {formatCurrency(Number(inv.paid_amount))}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(inv.status)}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">

                          <button 
                          onClick={() => handleSendInvoiceReminder(inv.id)} 
                          className="p-1.5 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg" 
                          title="Send Email Reminder"
                        >
                          <Mail size={16} />
                        </button>


                           <button 
                            onClick={() => handleDownloadPdf(inv.id, inv.invoice_number)} 
                            className="p-1.5 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg" 
                            title="Download PDF"
                          >
                            <Download size={16} />
                          </button>
                          
                          {outstanding > 0 && inv.status !== 'cancelled' && (
                            <button 
                              onClick={() => openPaymentModal(inv)} 
                              className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg" 
                              title="Record Payment"
                            >
                              <DollarSign size={16} />
                            </button>
                          )}
                          <button onClick={() => router.push(`/invoices/${inv.id}`)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg" title="View/Edit"><Pencil size={16} /></button>
                          <button onClick={() => handleDelete(inv.id, inv.invoice_number)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Delete"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={currentPage} lastPage={lastPage} total={total} onPageChange={handlePageChange} perPage={15} />
      </div>

  
      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        invoice={selectedInvoice}
        onSave={handleSavePayment}
        isLoading={isPaymentLoading}
      />
    </div>
  );
}