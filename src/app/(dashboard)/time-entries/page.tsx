"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { timeEntryService } from "@/services/timeEntryService";
import { userService } from "@/services/userService";
import { caseService } from "@/services/caseService";
import { TimeEntry, TimeEntrySummary, User, CaseModel, PaginatedResponse } from "@/types";
import { Clock, Search, RefreshCw, Loader2, Plus, Pencil, Trash2, Calendar, DollarSign, Users } from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Pagination from "@/components/ui/Pagination";

export default function TimeEntriesPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [summary, setSummary] = useState<TimeEntrySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [filterCase, setFilterCase] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterBillable, setFilterBillable] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  
  const [users, setUsers] = useState<User[]>([]);
  const [cases, setCases] = useState<CaseModel[]>([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [usersRes, casesRes] = await Promise.all([
          userService.getAllUsers(),
          caseService.getAll({ page: 1 }),
        ]);
        if (usersRes.success) setUsers(usersRes.users || []);
        if (casesRes.success && casesRes.data) setCases((casesRes.data as any)?.data || []);
      } catch (error) {
        console.error("Failed to load filters", error);
      }
    };
    loadFilters();
  }, []);

  const fetchData = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const res = await timeEntryService.getAll({ 
        search, 
        user_id: filterUser || undefined,
        case_id: filterCase || undefined,
        status: filterStatus || undefined,
        is_billable: filterBillable || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        page 
      });
      
      if (res.success && res.data) {
        const paginator = res.data as unknown as PaginatedResponse<TimeEntry>;
        setEntries(paginator.data || []);
        setCurrentPage(paginator.current_page);
        setLastPage(paginator.last_page);
        setTotal(paginator.total);
        if (res.summary) setSummary(res.summary);
      }
    } catch (error) {
      toast.error("Failed to fetch time entries");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(1); }, [search, filterUser, filterCase, filterStatus, filterBillable, dateFrom, dateTo]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= lastPage) fetchData(page);
  };

  const handleDelete = async (id: number, description: string) => {
    if (!window.confirm(`Delete time entry "${description}"?`)) return;
    try {
      await timeEntryService.delete(id);
      toast.success("Time entry deleted successfully");
      fetchData(currentPage);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'NPR' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      case 'submitted': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'invoiced': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb title="Dashboard" subTitle="Time Tracking" breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Time Entries" }]} />

    
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Clock size={20} className="text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Total Entries</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{summary.total_entries}</div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <Calendar size={20} className="text-amber-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Total Hours</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{formatDuration(summary.total_minutes)}</div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <DollarSign size={20} className="text-green-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Billable Hours</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{formatDuration(summary.total_billable_minutes)}</div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <DollarSign size={20} className="text-emerald-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Billable Amount</div>
                <div className="text-xl font-bold text-emerald-600">{formatCurrency(summary.total_amount)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <Clock size={20} className="text-green-600" /> Time Entries
          </h2>
          <button
            onClick={() => router.push("/time-entries/create")}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={16} /> Log Time
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search description..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none" 
              />
            </div>
            <select value={filterUser} onChange={(e) => setFilterUser(e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none">
              <option value="">All Users</option>
              <option value="me">My Entries</option>
              {users.map((u) => (<option key={u.id} value={u.id}>{u.name}</option>))}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none">
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="invoiced">Invoiced</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <select value={filterCase} onChange={(e) => setFilterCase(e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none">
              <option value="">All Cases</option>
              {cases.map((c) => (<option key={c.id} value={c.id}>{c.case_number}</option>))}
            </select>
            <select value={filterBillable} onChange={(e) => setFilterBillable(e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none">
              <option value="">All Types</option>
              <option value="1">Billable Only</option>
              <option value="0">Non-Billable Only</option>
            </select>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none" placeholder="From Date" />
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none" placeholder="To Date" />
          </div>
          <button onClick={() => { setSearch(""); setFilterUser(""); setFilterCase(""); setFilterStatus(""); setFilterBillable(""); setDateFrom(""); setDateTo(""); }} className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg">
            <RefreshCw size={16} /> Reset Filters
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-green-50 dark:bg-green-900/20 text-gray-700 dark:text-gray-300 font-semibold">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Case / User</th>
                <th className="px-6 py-3">Duration</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {isLoading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center"><Loader2 className="animate-spin mx-auto text-green-600" size={24} /></td></tr>
              ) : entries.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">No time entries found</td></tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-xs whitespace-nowrap">
                      {formatDate(entry.work_date)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white max-w-xs truncate">{entry.description}</div>
                      {!entry.is_billable && (
                        <div className="text-xs text-gray-500 italic">Non-billable</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {entry.case ? (
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{entry.case.case_number}</div>
                          <div className="text-gray-500 truncate max-w-[150px]">{entry.case.title}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">General</span>
                      )}
                      <div className="text-gray-500 mt-1 flex items-center gap-1">
                        <Users size={10} /> {entry.user?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 dark:text-white">{formatDuration(entry.duration_minutes)}</div>
                      {entry.start_time && (
                        <div className="text-xs text-gray-500">{entry.start_time} - {entry.end_time}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {entry.is_billable ? (
                        <div className="font-semibold text-emerald-600">{formatCurrency(entry.total_amount)}</div>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(entry.status)}`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => router.push(`/time-entries/${entry.id}`)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg" title="Edit"><Pencil size={16} /></button>
                        <button onClick={() => handleDelete(entry.id, entry.description)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Delete"><Trash2 size={16} /></button>
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