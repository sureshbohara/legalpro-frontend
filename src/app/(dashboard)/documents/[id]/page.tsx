"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { documentService } from "@/services/documentService";
import { caseService } from "@/services/caseService";
import { clientService } from "@/services/clientService";
import { Document, CaseModel, Client, PaginatedResponse } from "@/types";
import { ArrowLeft, Save, Loader2, FileText, Upload } from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function DocumentFormPage() {
  const router = useRouter();
  const { id } = useParams();
  const isEdit = id !== "create";

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEdit);
  
  const [cases, setCases] = useState<CaseModel[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "general" as "evidence" | "contract" | "correspondence" | "general",
    description: "",
    case_id: "",
    client_id: "",
    is_active: 1,
  });

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
          const docRes = await documentService.getDocument(Number(id));
          if (docRes.success && docRes.document) {
            const d = docRes.document;
            setFormData({
              name: d.name,
              category: d.category,
              description: d.description || "",
              case_id: d.case_id ? String(d.case_id) : "",
              client_id: d.client_id ? String(d.client_id) : "",
              is_active: d.is_active ? 1 : 0,
            });
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
      if (!formData.name) {
        setFormData({ ...formData, name: file.name.replace(/\.[^/.]+$/, "") });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isEdit && !selectedFile) {
      toast.error("Please select a file");
      return;
    }

    setIsLoading(true);
    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('category', formData.category);
      payload.append('description', formData.description);
      payload.append('case_id', formData.case_id || '');
      payload.append('client_id', formData.client_id || '');
      payload.append('is_active', String(formData.is_active));
      
      if (selectedFile) {
        payload.append('file', selectedFile);
      }

      if (isEdit) {
        await documentService.update(Number(id), payload);
        toast.success("Document updated successfully!");
      } else {
        await documentService.create(payload);
        toast.success("Document uploaded successfully!");
      }
      router.push("/documents");
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Failed to save document";
      toast.error(errorMsg);
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
          subTitle={isEdit ? "Update Document" : "Upload Document"}
          breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Documents", href: "/documents" }]}
        />
        <button
          onClick={() => router.push("/documents")}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft size={16} /> Back to List
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Document Details */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <FileText size={20} className="text-green-600" /> Document Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {isEdit ? "Replace File (Optional)" : "Upload File"} <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max 10MB)</p>
                </label>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Document Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                placeholder="e.g., Evidence Document - Case #001"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none resize-none transition-all"
                placeholder="Brief description of the document..."
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Link to Case (Optional)</label>
              <select
                value={formData.case_id}
                onChange={(e) => setFormData({ ...formData, case_id: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
              >
                <option value="">-- No Case --</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.case_number} - {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Link to Client (Optional)</label>
              <select
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
              >
                <option value="">-- No Client --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm h-fit space-y-5">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Settings</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category <span className="text-red-500">*</span></label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
            >
              <option value="evidence">📋 Evidence</option>
              <option value="contract">📄 Contract</option>
              <option value="correspondence">✉️ Correspondence</option>
              <option value="general">📁 General</option>
            </select>
          </div>

          <div className="pt-2 border-t border-gray-200 dark:border-slate-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Active Status</label>
            <div className="flex items-center gap-3 p-3 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800/50">
              <input
                type="checkbox"
                id="doc-active"
                checked={formData.is_active === 1}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500 cursor-pointer"
              />
              <label htmlFor="doc-active" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer flex-1">
                {formData.is_active === 1 ? "Active Document" : "Archived Document"}
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-all"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {isLoading ? "Saving..." : isEdit ? "Update Document" : "Upload Document"}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}