"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { dashboardService, DashboardStats } from "@/services/dashboardService";
import Breadcrumb from "@/components/ui/Breadcrumb";
import {
  Briefcase, Users, Gavel, FolderOpen, Activity, 
  Calendar, Clock, ArrowRight, Loader2, Banknote, 
  AlertCircle, FileClock, Receipt, TrendingUp
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await dashboardService.getStats();
        if (res.success) setStats(res.stats);
      } catch (error) {
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    loadStats();
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-green-600" size={48} />
        <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">Loading dashboard analytics...</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'NPR', maximumFractionDigits: 0 }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      sent: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      partial: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      paid: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      overdue: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    };
    return colors[status] || colors.draft;
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Welcome back! Here's what's happening with your firm today.</p>
        </div>
        <button 
          onClick={() => router.push("/cases/create")}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-all shadow-sm hover:shadow-md"
        >
          <Briefcase size={16} /> New Case
        </button>
      </div>

  
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <StatCard
          title="Active Cases"
          value={stats.total_active_cases}
          subtext="Currently handling"
          icon={Briefcase}
          iconBg="bg-green-600"
          trend="+12% from last month"
          onClick={() => router.push("/cases")}
        />
        <StatCard
          title="Total Clients"
          value={stats.total_clients}
          subtext="Registered clients"
          icon={Users}
          iconBg="bg-blue-600"
          trend="+5 new this week"
          onClick={() => router.push("/clients")}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.total_revenue)}
          subtext="Total amount collected"
          icon={Banknote}
          iconBg="bg-emerald-600"
          trend="On track"
          onClick={() => router.push("/invoices")}
        />
        <StatCard
          title="Outstanding"
          value={formatCurrency(stats.total_outstanding)}
          subtext="Unpaid invoice balance"
          icon={AlertCircle}
          iconBg="bg-red-600"
          trend="Requires attention"
          onClick={() => router.push("/invoices?filterStatus=partial,overdue")}
        />
        <StatCard
          title="Pending Invoices"
          value={stats.pending_invoices_count}
          subtext="Awaiting payment"
          icon={FileClock}
          iconBg="bg-amber-500"
          trend="Action needed"
          onClick={() => router.push("/invoices")}
        />
        <StatCard
          title="Upcoming Hearings"
          value={stats.upcoming_hearings}
          subtext="Scheduled soon"
          icon={Gavel}
          iconBg="bg-purple-600"
          trend="Next 30 days"
          onClick={() => router.push("/hearings")}
        />
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FolderOpen size={20} className="text-green-600" /> Cases by Category
            </h3>
          </div>
          {stats.cases_by_category.length === 0 ? (
            <EmptyState message="No case data available yet" />
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.cases_by_category}
                    cx="50%" cy="50%" innerRadius={65} outerRadius={95}
                    paddingAngle={3} dataKey="value"
                    stroke="none"
                  >
                    {stats.cases_by_category.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity" />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>


        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity size={20} className="text-blue-600" /> Cases by Status
            </h3>
          </div>
          {stats.cases_by_status.length === 0 ? (
            <EmptyState message="No status data available yet" />
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.cases_by_status} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-slate-800" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={50}>
                    {stats.cases_by_status.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar size={20} className="text-amber-500" /> Next 7 Days Hearings
            </h3>
            <button onClick={() => router.push("/hearings")} className="text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 flex items-center gap-1 font-medium transition-colors">
              View All <ArrowRight size={14} />
            </button>
          </div>
          {stats.next_hearings.length === 0 ? (
            <EmptyState message="No upcoming hearings scheduled" />
          ) : (
            <div className="space-y-3">
              {stats.next_hearings.map((hearing) => (
                <div
                  key={hearing.id}
                  onClick={() => router.push(`/hearings/${hearing.id}`)}
                  className="group flex items-center gap-4 p-4 border border-gray-100 dark:border-slate-800 rounded-xl hover:border-green-200 dark:hover:border-green-900/50 hover:bg-green-50/50 dark:hover:bg-green-900/10 transition-all cursor-pointer"
                >
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Gavel size={20} className="text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 dark:text-white text-sm truncate group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
                      {hearing.case_number}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{hearing.case_title}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      {hearing.court_name}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      {new Date(hearing.hearing_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 justify-end mt-1">
                      <Clock size={12} /> {hearing.hearing_time || 'TBA'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

    
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Receipt size={20} className="text-emerald-600" /> Recent Invoices
            </h3>
            <button onClick={() => router.push("/invoices")} className="text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 flex items-center gap-1 font-medium transition-colors">
              View All <ArrowRight size={14} />
            </button>
          </div>
          {stats.recent_invoices.length === 0 ? (
            <EmptyState message="No invoices generated yet" />
          ) : (
            <div className="space-y-3">
              {stats.recent_invoices.map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => router.push(`/invoices/${inv.id}`)}
                  className="group flex items-center gap-4 p-4 border border-gray-100 dark:border-slate-800 rounded-xl hover:border-emerald-200 dark:hover:border-emerald-900/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all cursor-pointer"
                >
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Receipt size={20} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 dark:text-white text-sm truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                      {inv.invoice_number}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{inv.client_name}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{inv.created_at}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      {formatCurrency(inv.total_amount)}
                    </div>
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full inline-block mt-1.5 ${getStatusColor(inv.status)}`}>
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



interface StatCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: React.ElementType;
  iconBg: string;
  trend: string;
  onClick: () => void;
}

function StatCard({ title, value, subtext, icon: Icon, iconBg, trend, onClick }: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className="group bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 hover:shadow-lg hover:border-green-200 dark:hover:border-green-900/50 transition-all duration-300 cursor-pointer relative overflow-hidden"
    >
    
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
            {value}
          </h3>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{subtext}</span>
            <span className="text-[10px] font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded-full flex items-center gap-1">
              <TrendingUp size={10} /> {trend}
            </span>
          </div>
        </div>
        <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="h-64 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
      <FolderOpen size={40} className="mb-3 opacity-20" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}