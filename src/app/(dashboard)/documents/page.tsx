"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { documentService } from "@/services/documentService";
import { caseService } from "@/services/caseService";
import { clientService } from "@/services/clientService";
import { Document, CaseModel, Client, PaginatedResponse } from "@/types";
import { FileText, Search, RefreshCw, Loader2, Plus, Pencil, Trash2, Power, Download, Eye } from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Pagination from "@/components/ui/Pagination";

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterCase, setFilterCase] = useState("");
  const [filterClient, setFilterClient] = useState("");
  
  const [cases, setCases] = useState<CaseModel[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [casesRes, clientsRes] = await Promise.all([
          caseService.getAll({ page: 1 }),
          clientService.getAllClients(),
        ]);
        if (casesRes.success && casesRes.data) setCases((casesRes.data as any)?.data || []);
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
      const res = await documentService.getAll({ 
        search, 
        category: filterCategory || undefined,
        case_id: filterCase || undefined,
        client_id: filterClient || undefined,
        page 
      });
      
      if (res.success && res.data) {
        const paginator = res.data as unknown as PaginatedResponse<Document>;
        setDocuments(paginator.data || []);
        setCurrentPage(paginator.current_page);
        setLastPage(paginator.last_page);
        setTotal(paginator.total);
      }
    } catch (error) {
      toast.error("Failed to fetch documents");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(1); }, [search, filterCategory, filterCase, filterClient]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= lastPage) fetchData(page);
  };

  const handleDownload = async (id: number, fileName: string) => {
    try {
      const response = await documentService.download(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Download started");
    } catch (error) {
      toast.error("Failed to download");
    }
  };

  const handleToggleActive = async (id: number, currentActive: boolean | number) => {
    const newActive = currentActive === 1 || currentActive === true ? false : true;
    try {
      await documentService.toggleActive(id, newActive);
      toast.success(newActive ? "Document activated" : "Document archived");
      fetchData(currentPage);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Delete document "${name}"? This cannot be undone.`)) return;
    try {
      await documentService.delete(id);
      toast.success("Document deleted successfully");
      fetchData(currentPage);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'evidence': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'contract': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'correspondence': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <Breadcrumb title="Dashboard" subTitle="Documents" breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Documents" }]} />

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <FileText size={20} className="text-green-600" /> Document Management
          </h2>
          <button
            onClick={() => router.push("/documents/create")}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={16} /> Upload Document
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search documents..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none" 
            />
          </div>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none">
            <option value="">All Categories</option>
            <option value="evidence">Evidence</option>
            <option value="contract">Contract</option>
            <option value="correspondence">Correspondence</option>
            <option value="general">General</option>
          </select>
          <button onClick={() => { setSearch(""); setFilterCategory(""); setFilterCase(""); setFilterClient(""); }} className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg">
            <RefreshCw size={16} /> Reset
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-green-50 dark:bg-green-900/20 text-gray-700 dark:text-gray-300 font-semibold">
              <tr>
                <th className="px-6 py-3">Document</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Linked To</th>
                <th className="px-6 py-3">Uploaded By</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Active</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {isLoading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center"><Loader2 className="animate-spin mx-auto text-green-600" size={24} /></td></tr>
              ) : documents.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">No documents found</td></tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText size={20} className="text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white truncate">{doc.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{doc.file_size_human}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getCategoryColor(doc.category)}`}>
                        {doc.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-xs">
                      {doc.case ? (
                        <div>
                          <div className="font-medium">Case: {doc.case.case_number}</div>
                          <div className="truncate max-w-[150px]">{doc.case.title}</div>
                        </div>
                      ) : doc.client ? (
                        <div>Client: {doc.client.name}</div>
                      ) : (
                        <span className="text-gray-400 italic">General</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-xs">
                      {doc.uploader?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-xs">
                      {formatDate(doc.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(doc.id, doc.is_active)}
                        className={`p-1.5 rounded-lg transition-colors ${doc.is_active ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                        title={doc.is_active ? "Archive" : "Activate"}
                      >
                        <Power size={16} />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleDownload(doc.id, doc.file_name)} className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg" title="Download"><Download size={16} /></button>
                        <button onClick={() => router.push(`/documents/${doc.id}`)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg" title="Edit"><Pencil size={16} /></button>
                        <button onClick={() => handleDelete(doc.id, doc.name)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={currentPage} lastPage={lastPage} total={total} onPageChange={handlePageChange} perPage={15} />
      </div>
    </div>
  );
}