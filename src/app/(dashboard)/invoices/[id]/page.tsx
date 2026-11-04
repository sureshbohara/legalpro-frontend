"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { invoiceService } from "@/services/invoiceService";
import { timeEntryService } from "@/services/timeEntryService";
import { caseService } from "@/services/caseService";
import { clientService } from "@/services/clientService";
import { Invoice, CaseModel, Client, InvoiceItem } from "@/types";
import { ArrowLeft, Save, Loader2, Receipt, Plus, Trash2, Clock, X } from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function InvoiceFormPage() {
  const router = useRouter();
  const { id } = useParams();
  const isEdit = id !== "create";

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEdit);
  
  const [cases, setCases] = useState<CaseModel[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  const [showTimeModal, setShowTimeModal] = useState(false);
  const [approvedEntries, setApprovedEntries] = useState<any[]>([]);
  const [selectedEntries, setSelectedEntries] = useState<number[]>([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);

  const [formData, setFormData] = useState({
    invoice_number: "",
    invoice_date: "",
    due_date: "",
    client_id: "",
    case_id: "",
    tax_rate: 13,
    discount: 0,
    notes: "",
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, rate: 0, amount: 0 }
  ]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [casesRes, clientsRes] = await Promise.all([
          caseService.getAll({ page: 1 }),
          clientService.getAllClients(),
        ]);
        
        if (casesRes.success && casesRes.data) setCases((casesRes.data as any)?.data || []);
        if (clientsRes.success) setClients((clientsRes.data as any)?.data || []);

        if (isEdit) {
          const invRes = await invoiceService.getInvoice(Number(id));
          if (invRes.success && invRes.invoice) {
            const inv = invRes.invoice;
            setFormData({
              invoice_number: inv.invoice_number,
              invoice_date: inv.invoice_date.split('T')[0],
              due_date: inv.due_date.split('T')[0],
              client_id: String(inv.client_id),
              case_id: inv.case_id ? String(inv.case_id) : "",
              tax_rate: Number(inv.tax_rate),
              discount: Number(inv.discount),
              notes: inv.notes || "",
            });
            
            const formattedItems = (inv.items || []).map((item: any) => ({
              id: item.id,
              description: item.description,
              quantity: Number(item.quantity),
              rate: Number(item.rate),
              amount: Number(item.amount)
            }));
            
            setItems(formattedItems.length > 0 ? formattedItems : [{ description: "", quantity: 1, rate: 0, amount: 0 }]);
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load form data");
      } finally {
        setIsFetching(false);
      }
    };
    loadData();
  }, [id, isEdit]);

  const loadApprovedEntries = async () => {
    setIsLoadingEntries(true);
    try {
      const params: any = {
        client_id: Number(formData.client_id), 
      };
      

      if (formData.case_id) {
        params.case_id = Number(formData.case_id);
      }
      
      const res = await timeEntryService.getApprovedEntries(params);
      if (res.success) {
        setApprovedEntries(res.entries || []);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to load time entries";
      console.error("Time entries error:", error);
      toast.error(errorMsg);
    } finally {
      setIsLoadingEntries(false);
    }
  };

  const importTimeEntries = () => {
    if (selectedEntries.length === 0) {
      toast.error("Please select at least one time entry");
      return;
    }

    const newItems: InvoiceItem[] = selectedEntries.map(entryId => {
      const entry = approvedEntries.find(e => e.id === entryId);
      return {
        description: `[${entry.work_date}] ${entry.description} (${Number(entry.duration_hours)}h)`,
        quantity: Number(entry.duration_hours),
        rate: Number(entry.billable_rate),
        amount: Number(entry.total_amount),
      };
    });

    setItems([...items, ...newItems]);
    setShowTimeModal(false);
    setSelectedEntries([]);
    toast.success(`${selectedEntries.length} time entries imported`);
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = Number(newItems[index].quantity) * Number(newItems[index].rate);
    }
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { description: "", quantity: 1, rate: 0, amount: 0 }]);
  const removeItem = (index: number) => {
    if (items.length === 1) { toast.error("At least one item is required"); return; }
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + Number(item.amount), 0);
  const taxAmount = (subtotal * Number(formData.tax_rate)) / 100;
  const totalAmount = subtotal + taxAmount - Number(formData.discount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        client_id: Number(formData.client_id),
        case_id: formData.case_id ? Number(formData.case_id) : null,
        items: items.map(item => ({
          description: item.description,
          quantity: Number(item.quantity),
          rate: Number(item.rate),
        })),
        time_entry_ids: selectedEntries, 
      };

      if (isEdit) {
        await invoiceService.update(Number(id), payload);
        toast.success("Invoice updated successfully!");
      } else {
        await invoiceService.create(payload);
        toast.success("Invoice created successfully!");
      }
      router.push("/invoices");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save invoice");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-green-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Breadcrumb
          title="Dashboard"
          subTitle={isEdit ? "Update Invoice" : "Create Invoice"}
          breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Invoices", href: "/invoices" }]}
        />
        <button
          onClick={() => router.push("/invoices")}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft size={16} /> Back to List
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Receipt size={20} className="text-green-600" /> Invoice Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Invoice Number <span className="text-red-500">*</span></label>
                <input type="text" required value={formData.invoice_number} onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none" placeholder="e.g., INV-2024-001" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Client <span className="text-red-500">*</span></label>
                <select required value={formData.client_id} onChange={(e) => setFormData({ ...formData, client_id: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none">
                  <option value="">-- Select Client --</option>
                  {clients.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Invoice Date <span className="text-red-500">*</span></label>
                <input type="date" required value={formData.invoice_date} onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Due Date <span className="text-red-500">*</span></label>
                <input type="date" required value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Related Case (Optional)</label>
                <select value={formData.case_id} onChange={(e) => setFormData({ ...formData, case_id: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none">
                  <option value="">-- No Case --</option>
                  {cases.map((c) => (<option key={c.id} value={c.id}>{c.case_number} - {c.title}</option>))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Line Items</h2>
              <div className="flex gap-2">
       
                <button 
                  type="button" 
                  onClick={() => {
                    if (!formData.client_id) {
                      toast.error("Please select a Client first");
                      return;
                    }
                    setShowTimeModal(true);
                    loadApprovedEntries();
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  <Clock size={14} /> Import Time Entries
                </button>
                <button type="button" onClick={addItem} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg">
                  <Plus size={14} /> Add Item
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 border border-gray-200 dark:border-slate-700 rounded-lg">
                  <div className="col-span-12 md:col-span-5">
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Description</label>
                    <input type="text" required value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none" placeholder="Service description" />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Qty</label>
                    <input type="number" required min="0.01" step="0.01" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none" />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Rate</label>
                    <input type="number" required min="0" step="0.01" value={item.rate} onChange={(e) => handleItemChange(index, 'rate', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none" />
                  </div>
                  <div className="col-span-3 md:col-span-2">
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Amount</label>
                    <div className="px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-800 rounded-lg">{Number(item.amount).toFixed(2)}</div>
                  </div>
                  <div className="col-span-1">
                    <button type="button" onClick={() => removeItem(index)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                <span className="font-medium text-gray-900 dark:text-white">{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">Tax ({formData.tax_rate}%):</span>
                <span className="font-medium text-gray-900 dark:text-white">{taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <label className="text-gray-600 dark:text-gray-400">Discount:</label>
                <input type="number" min="0" step="0.01" value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })} className="w-24 px-2 py-1 text-sm text-right rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none" />
              </div>
              <div className="border-t border-gray-200 dark:border-slate-700 pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-800 dark:text-white">Total:</span>
                  <span className="text-green-600">{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Settings</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tax Rate (%)</label>
              <input type="number" min="0" max="100" step="0.01" value={formData.tax_rate} onChange={(e) => setFormData({ ...formData, tax_rate: Number(e.target.value) })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Notes</label>
              <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none resize-none" placeholder="Payment instructions, terms, etc."></textarea>
            </div>
            <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-all">
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {isLoading ? "Saving..." : isEdit ? "Update Invoice" : "Create Invoice"}
            </button>
          </div>
        </div>
      </form>

  
      {showTimeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
 
            <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  <Clock size={20} className="text-blue-600" /> Import Approved Time Entries
                </h3>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                    Client: {clients.find(c => c.id === Number(formData.client_id))?.name || 'Unknown'}
                  </span>
                  {formData.case_id && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                      Case: {cases.find(c => c.id === Number(formData.case_id))?.case_number || 'Unknown'}
                    </span>
                  )}
                  {!formData.case_id && (
                    <span className="text-gray-400 italic">
                      (Showing all cases for this client)
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => setShowTimeModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {isLoadingEntries ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin text-green-600" size={32} />
                </div>
              ) : approvedEntries.length === 0 ? (
           
                <div className="text-center py-12">
                  <Clock size={48} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium mb-2">
                    No approved time entries found
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {formData.case_id 
                      ? `No approved time entries for this case. Make sure entries are approved by manager.`
                      : `No approved time entries for this client. Make sure entries are approved by manager.`
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {approvedEntries.map((entry) => (
                    <label key={entry.id} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${selectedEntries.includes(entry.id) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50'}`}>
                      <input
                        type="checkbox"
                        checked={selectedEntries.includes(entry.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEntries([...selectedEntries, entry.id]);
                          } else {
                            setSelectedEntries(selectedEntries.filter(id => id !== entry.id));
                          }
                        }}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white text-sm truncate">{entry.description}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {entry.case_number} • {entry.work_date} • {Number(entry.duration_hours)}h @ {Number(entry.billable_rate)}/hr
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-emerald-600">{Number(entry.total_amount).toFixed(2)}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {selectedEntries.length} entries selected
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowTimeModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700">
                  Cancel
                </button>
                <button onClick={importTimeEntries} disabled={selectedEntries.length === 0} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                  Import Selected
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}