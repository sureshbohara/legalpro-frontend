"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { clientPortalService } from "@/services/clientPortalService";
import { LayoutDashboard, Briefcase, FileText, Receipt, LogOut } from "lucide-react";

const menuItems = [
  { name: "Dashboard", href: "/client-portal", icon: LayoutDashboard },
  { name: "My Cases", href: "/client-portal/cases", icon: Briefcase },
  { name: "Documents", href: "/client-portal/documents", icon: FileText },
  { name: "Invoices", href: "/client-portal/invoices", icon: Receipt },
];

export default function ClientPortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("client_token");
    const userData = localStorage.getItem("client_user");

    if (!token || !userData) {
      router.replace("/client/login");
    } else {
      setUser(JSON.parse(userData));
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      await clientPortalService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("client_token");
      localStorage.removeItem("client_user");
      router.push("/client/login");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950">
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-gray-200 dark:border-slate-800">
          <h1 className="text-xl font-bold text-green-600">LegalPro <span className="text-gray-800 dark:text-white text-sm font-normal">Client</span></h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800"
                }`}
              >
                <item.icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'C'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 p-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-green-600">LegalPro Client</h1>
          <button onClick={handleLogout} className="text-gray-600 dark:text-gray-400">
            <LogOut size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}