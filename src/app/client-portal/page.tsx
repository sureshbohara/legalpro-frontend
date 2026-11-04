"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { clientPortalService } from "@/services/clientPortalService";
import { Briefcase, FileText, Receipt, Loader2 } from "lucide-react";

export default function ClientDashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ cases: 0, documents: 0, invoices: 0 });
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("client_user");
    if (!userData) {
      router.push("/client/login");
      return;
    }
    setUser(JSON.parse(userData));
    
    const fetchStats = async () => {
      try {
        const [casesRes, docsRes, invRes] = await Promise.all([
          clientPortalService.getCases().catch(() => ({ data: [] })),
          clientPortalService.getDocuments().catch(() => ({ data: [] })),
          clientPortalService.getInvoices().catch(() => ({ data: [] }))
        ]);

        setStats({
          cases: casesRes.data?.length || 0,
          documents: docsRes.data?.length || 0,
          invoices: invRes.data?.length || 0,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-green-600" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name || 'Client'}! 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Here is a quick overview of your legal matters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="My Cases" value={stats.cases} icon={Briefcase} color="blue" href="/client-portal/cases" />
        <StatCard title="Documents" value={stats.documents} icon={FileText} color="purple" href="/client-portal/documents" />
        <StatCard title="Invoices" value={stats.invoices} icon={Receipt} color="green" href="/client-portal/invoices" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Need Assistance?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <h3 className="font-medium text-blue-800 dark:text-blue-300">Contact Your Lawyer</h3>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              Have questions about your case? Reach out to your assigned legal team directly.
            </p>
          </div>
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
            <h3 className="font-medium text-amber-800 dark:text-amber-300">Upcoming Hearings</h3>
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
              Please check your case details regularly for the next court date updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, href }: any) {
  const colors: any = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    green: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  };
  
  return (
    <a 
      href={href} 
      className="block bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 hover:shadow-md transition-shadow cursor-pointer group"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1 group-hover:text-green-600 transition-colors">
            {value}
          </h3>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </a>
  );
}