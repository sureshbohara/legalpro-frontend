"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Search, Command, Users, Briefcase, Receipt, Gavel, X, Loader2 } from "lucide-react";

interface SearchResult {
  id: number;
  title: string;
  subtitle: string;
  type: 'client' | 'case' | 'invoice' | 'hearing';
}

export default function GlobalSearchModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Record<string, SearchResult[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults({});
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.length < 2) {
      setResults({});
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.get("/api/global-search", { params: { q: query } });
        if (res.data.success) {
          setResults(res.data.data);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300); 

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item: SearchResult) => {
    setIsOpen(false);
    switch (item.type) {
      case 'client': router.push(`/clients/${item.id}`); break;
      case 'case': router.push(`/cases/${item.id}`); break;
      case 'invoice': router.push(`/invoices/${item.id}`); break;
      case 'hearing': router.push(`/hearings/${item.id}`); break;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'client': return <Users size={16} className="text-blue-500" />;
      case 'case': return <Briefcase size={16} className="text-green-500" />;
      case 'invoice': return <Receipt size={16} className="text-amber-500" />;
      case 'hearing': return <Gavel size={16} className="text-purple-500" />;
      default: return <Search size={16} />;
    }
  };

  const getCategoryTitle = (type: string) => {
    switch (type) {
      case 'clients': return 'Clients';
      case 'cases': return 'Cases';
      case 'invoices': return 'Invoices';
      case 'hearings': return 'Hearings';
      default: return 'Results';
    }
  };

  return (
    <>

      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-between w-80 px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Search size={14} />
          <span className="hidden md:inline">Search clients, cases, invoices...</span>
        </div>
        <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded text-gray-500 dark:text-gray-400">
          <Command size={10} /> K
        </kbd>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[60vh]">
            
            <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-slate-800">
              <Search size={20} className="text-gray-400 mr-3" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search clients, cases, invoices..."
                className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none text-base"
              />
              {isLoading ? (
                <Loader2 size={16} className="animate-spin text-green-600" />
              ) : (
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="overflow-y-auto p-2 flex-1">
              {Object.keys(results).length === 0 && !isLoading && query.length >= 2 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Search size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No results found for "{query}"</p>
                </div>
              )}

              {Object.entries(results).map(([category, items]) => (
                <div key={category} className="mb-4">
                  <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {getCategoryTitle(category)}
                  </div>
                  <div className="space-y-1">
                    {items.map((item) => (
                      <button
                        key={`${item.type}-${item.id}`}
                        onClick={() => handleSelect(item)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-left group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center group-hover:border-gray-300 dark:group-hover:border-slate-600 transition-colors">
                          {getIcon(item.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.title}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.subtitle}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-4 py-2 border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded font-mono">↑↓</kbd> Navigate</span>
                <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded font-mono">↵</kbd> Open</span>
              </div>
              <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded font-mono">esc</kbd> Close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}