"use client";
import { useState, useEffect } from "react";
import { clientPortalService } from "@/services/clientPortalService";
import { Briefcase, Loader2, Calendar, User, Tag } from "lucide-react";

export default function ClientCasesPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await clientPortalService.getCases();
        setCases(res.data || []);
      } catch (error) {
        console.error("Failed to fetch cases", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCases();
  }, []);

  const getStatusColor = (statusName: string) => {
    const name = statusName?.toLowerCase() || '';
    if (name.includes('closed') || name.includes('won')) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    if (name.includes('pending') || name.includes('active')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    if (name.includes('lost')) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Briefcase className="text-green-600" size={28} /> My Cases
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Track the progress of your legal matters.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-green-600" size={32} />
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <Briefcase size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No cases found.</p>
            <p className="text-sm mt-1">You don't have any active legal cases at the moment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-semibold border-b border-gray-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4">Case Number</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Lawyer</th>
                  <th className="px-6 py-4">Opened</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-gray-900 dark:text-white">{c.case_number}</td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300 max-w-xs truncate" title={c.title}>{c.title}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                        <Tag size={10} /> {c.category?.name || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(c.status?.name)}`}>
                        {c.status?.name || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <User size={14} /> {c.lawyer?.name || 'Unassigned'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {new Date(c.opening_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}