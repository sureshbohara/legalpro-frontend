"use client";
import { useState, useEffect } from "react";
import { activityLogService } from "@/services/activityLogService";
import { ActivityLog, PaginatedResponse } from "@/types";
import { Activity, Loader2, User, FileText, Globe } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchData = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const res = await activityLogService.getLogs({ page });
      if (res.success && res.data) {
        const paginator = res.data as unknown as PaginatedResponse<ActivityLog>;
        setLogs(paginator.data || []);
        setCurrentPage(paginator.current_page);
        setLastPage(paginator.last_page);
        setTotal(paginator.total);
      }
    } catch (error) {
      console.error("Failed to fetch logs", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(1); }, []);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= lastPage) fetchData(page);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <Breadcrumb title="Dashboard" subTitle="Activity Logs" breadcrumbItems={[{ label: "Home", href: "/" }, { label: "System" }]} />

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex items-center gap-2">
          <Activity size={20} className="text-green-600" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">System Audit Logs</h2>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-green-50 dark:bg-green-900/20 text-gray-700 dark:text-gray-300 font-semibold">
              <tr>
                <th className="px-6 py-3">Time</th>
                <th className="px-6 py-3">User (Causer)</th>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">Target</th>
                <th className="px-6 py-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center"><Loader2 className="animate-spin mx-auto text-green-600" size={24} /></td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No activity logs found</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">{formatDate(log.created_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
                        <User size={14} className="text-blue-500" />
                        {log.causer?.name || <span className="text-gray-400 italic">System</span>}
                      </div>
                      <div className="text-xs text-gray-500">{log.causer?.email || ''}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        log.description.includes('Created') ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                        log.description.includes('Updated') ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {log.description}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-1.5">
                        <FileText size={14} className="text-gray-400" />
                        <span className="font-medium">{log.subject?.name || 'N/A'}</span>
                        <span className="text-xs text-gray-500">({log.log_name})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono text-xs">
                      <div className="flex items-center gap-1">
                        <Globe size={12} /> {log.ip_address || '127.0.0.1'}
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