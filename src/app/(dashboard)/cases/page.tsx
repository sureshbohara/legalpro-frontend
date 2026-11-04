"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { caseService } from "@/services/caseService";
import { caseCategoryService } from "@/services/caseCategoryService";
import { caseStatusService } from "@/services/caseStatusService";
import { CaseModel, CaseCategory, CaseStatus, PaginatedResponse } from "@/types";
import { Briefcase, Search, RefreshCw, Loader2, Plus, Pencil, Trash2, Eye } from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Pagination from "@/components/ui/Pagination";

export default function CasesPage() {
  const router = useRouter();
  const [cases, setCases] = useState<CaseModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter States
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  
  // Dynamic Dropdown Data States
  const [categories, setCategories] = useState<CaseCategory[]>([]);
  const [statuses, setStatuses] = useState<CaseStatus[]>([]);
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  // 1. Page load हुँदा Filters (Categories & Statuses) को data ल्याउने
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [catRes, statusRes] = await Promise.all([
          caseCategoryService.getAll({ status: '1' }), // केवल Active Category हरू
          caseStatusService.getAll({ status: '1' })    // केवल Active Status हरू
        ]);
        
        if (catRes.success && catRes.data) {
          setCategories((catRes.data as any)?.data || []);
        }
        if (statusRes.success && statusRes.data) {
          setStatuses((statusRes.data as any)?.data || []);
        }
      } catch (error) {
        console.error("Failed to load filters", error);
      }
    };
    loadFilters();
  }, []);

  // 2. Cases को data ल्याउने (जब search वा filter बदलिन्छ)
  const fetchData = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const res = await caseService.getAll({ 
        search, 
        category_id: filterCategory || undefined, 
        status_id: filterStatus || undefined, 
        page 
      });
      
      if (res.success && res.data) {
        const paginator = res.data as unknown as PaginatedResponse<CaseModel>;
        setCases(paginator.data || []);
        setCurrentPage(paginator.current_page);
        setLastPage(paginator.last_page);
        setTotal(paginator.total);
      }
    } catch (error) {
      toast.error("Failed to fetch cases");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(1); }, [search, filterCategory, filterStatus]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= lastPage) fetchData(page);
  };

  const handleDelete = async (id: number, caseNumber: string) => {
    if (!window.confirm(`Delete case "${caseNumber}"? This action cannot be undone.`)) return;
    try {
      await caseService.delete(id);
      toast.success("Case deleted successfully");
      fetchData(currentPage);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb title="Dashboard" subTitle="All Cases" breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Case Management" }]} />

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <Briefcase size={20} className="text-green-600" /> All Cases
          </h2>
          <button onClick={() => router.push("/cases/create")} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">
            <Plus size={16} /> Create New Case
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by Case No. or Title..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none" 
            />
          </div>
          
          {/* 👇 Dynamic Category Filter */}
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)} 
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* 👇 Dynamic Status Filter */}
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)} 
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none"
          >
            <option value="">All Statuses</option>
            {statuses.map((status) => (
              <option key={status.id} value={status.id}>{status.name}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-green-50 dark:bg-green-900/20 text-gray-700 dark:text-gray-300 font-semibold">
              <tr>
                <th className="px-6 py-3">Case No.</th>
                <th className="px-6 py-3">Title & Client</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Assigned Lawyer</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center"><Loader2 className="animate-spin mx-auto text-green-600" size={24} /></td></tr>
              ) : cases.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No cases found</td></tr>
              ) : (
                cases.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm font-medium text-gray-900 dark:text-white">{c.case_number}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{c.title}</div>
                      <div className="text-xs text-gray-500">Client: {c.client?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: c.category?.color || '#6b7280' }}>
                        {c.category?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: c.status?.color || '#6b7280' }}>
                        {c.status?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{c.lawyer?.name || <span className="text-gray-400 italic">Unassigned</span>}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => router.push(`/cases/${c.id}`)} className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg" title="Edit"><Pencil size={16} /></button>
                        <button onClick={() => handleDelete(c.id, c.case_number)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-800">
          <Pagination currentPage={currentPage} lastPage={lastPage} total={total} onPageChange={handlePageChange} perPage={15} />
        </div>
      </div>
    </div>
  );
}