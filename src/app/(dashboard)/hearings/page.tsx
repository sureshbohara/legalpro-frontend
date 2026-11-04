"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { hearingService } from "@/services/hearingService";
import { Hearing, PaginatedResponse } from "@/types";
import { Gavel, Search, RefreshCw, Loader2, Plus, Pencil, Trash2, Power, Calendar, Mail } from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Pagination from "@/components/ui/Pagination";

export default function HearingsPage() {
  const router = useRouter();
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchData = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const res = await hearingService.getAll({ search, status: filterStatus || undefined, page });
      if (res.success && res.data) {
        const paginator = res.data as unknown as PaginatedResponse<Hearing>;
        setHearings(paginator.data || []);
        setCurrentPage(paginator.current_page);
        setLastPage(paginator.last_page);
        setTotal(paginator.total);
      }
    } catch (error) {
      toast.error("Failed to fetch hearings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(1); }, [search, filterStatus]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= lastPage) fetchData(page);
  };

  const handleToggleActive = async (id: number, currentActive: boolean | number) => {
    const newActive = currentActive === 1 || currentActive === true ? false : true;
    try {
      await hearingService.toggleActive(id, newActive);
      toast.success(newActive ? "Hearing activated" : "Hearing archived");
      fetchData(currentPage);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this hearing record?")) return;
    try {
      await hearingService.delete(id);
      toast.success("Hearing deleted successfully");
      fetchData(currentPage);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };


  const handleSendHearingReminder = async (id: number) => {
    try {
      await hearingService.sendReminder(id);
      toast.success("Hearing reminder sent successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send reminder");
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'adjourned': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb title="Dashboard" subTitle="Hearings" breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Hearings" }]} />

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <Gavel size={20} className="text-green-600" /> Court Hearings
          </h2>
          <button
            onClick={() => router.push("/hearings/create")}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={16} /> Schedule Hearing
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by Case No, Title or Court..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none" 
            />
          </div>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)} 
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none"
          >
            <option value="">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="adjourned">Adjourned</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-green-50 dark:bg-green-900/20 text-gray-700 dark:text-gray-300 font-semibold">
              <tr>
                <th className="px-6 py-3">Case Details</th>
                <th className="px-6 py-3">Date & Time</th>
                <th className="px-6 py-3">Court / Judge</th>
                <th className="px-6 py-3">Type & Status</th>
                <th className="px-6 py-3">Active</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center"><Loader2 className="animate-spin mx-auto text-green-600" size={24} /></td></tr>
              ) : hearings.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No hearings found</td></tr>
              ) : (
                hearings.map((h) => (
                  <tr key={h.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{h.case?.case_number || 'N/A'}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[200px]">{h.case?.title || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {h.hearing_date}
                      </div>
                      <div className="text-xs text-gray-500 ml-5">{h.hearing_time || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      <div className="font-medium">{h.court_name}</div>
                      <div className="text-xs text-gray-500">{h.judge_name || 'Judge TBA'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">{h.hearing_type}</div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(h.status)}`}>
                        {h.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(h.id, h.is_active)}
                        className={`p-1.5 rounded-lg transition-colors ${h.is_active ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                        title={h.is_active ? "Archive" : "Activate"}
                      >
                        <Power size={16} />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">

                        <button 
                            onClick={() => handleSendHearingReminder(h.id)} 
                            className="p-1.5 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg" 
                            title="Send Email Reminder"
                          >
                            <Mail size={16} />
                          </button>

                        <button onClick={() => router.push(`/hearings/${h.id}`)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg" title="Edit"><Pencil size={16} /></button>
                        <button onClick={() => handleDelete(h.id)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Delete"><Trash2 size={16} /></button>
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