"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { menuItems } from "@/constants/menuItems";
import { useSettingStore } from "@/store/settingStore";

export default function Sidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const { settings, fetchSettings } = useSettingStore();

  const toggleMenu = (name: string) => {
    setOpenMenus(prev =>
      prev.includes(name) ? prev.filter(item => item !== name) : [...prev, name]
    );
  };


  const systemName = settings?.system_name || "SP DASH";
  const logoUrl = settings?.logo_url;

  return (
    <aside className="w-72 min-h-screen bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col transition-colors fixed left-0 top-0 bottom-0 z-40">
      <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-slate-800">


         <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="text-white" size={18} />
            </div>
          )}

          <span className="text-xl font-bold text-gray-800 dark:text-white truncate">
            {systemName}
          </span>
        </div>


      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const isOpen = openMenus.includes(item.name);
            const Icon = item.icon;

            if (item.subItems) {
              return (
                <li key={item.name}>
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`w-full flex items-center justify-between px-6 py-3 transition-colors ${
                      isOpen
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} />
                      <span className="font-medium text-sm">{item.name}</span>
                    </div>
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  {isOpen && (
                    <ul className="ml-6 mt-1 space-y-1">
                      {item.subItems.map((sub) => {
                        const SubIcon = sub.icon;
                        return (
                          <li key={sub.name}>
                            <Link
                              href={sub.href}
                              className={`flex items-center gap-3 px-6 py-2.5 text-sm transition-colors ${
                                pathname === sub.href
                                  ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 font-medium'
                                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                              }`}
                            >
                              <SubIcon size={16} />
                              <span>{sub.name}</span>
                              {sub.badge ? (
                                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-auto">
                                  {sub.badge}
                                </span>
                              ) : null}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            }

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                    isActive
                      ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}