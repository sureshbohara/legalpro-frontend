"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { clientService } from "@/services/clientService";
import { Client, PaginatedResponse } from "@/types";
import { Plus, Pencil, Trash2, Users, Search, RefreshCw, Loader2, Power, Mail } from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Pagination from "@/components/ui/Pagination";

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchData = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const res = await clientService.getAllClients({ search, type: filterType || undefined, page });
      if (res.success && res.data) {
        const paginator = res.data as unknown as PaginatedResponse<Client>;
        setClients(paginator.data || []);
        setCurrentPage(paginator.current_page);
        setLastPage(paginator.last_page);
        setTotal(paginator.total);
      }
    } catch (error) {
      toast.error("Failed to fetch clients");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(1); }, [search, filterType]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= lastPage) fetchData(page);
  };

  const handleToggleStatus = async (clientId: number, currentStatus: number | boolean) => {
    const newStatus = (currentStatus === 1 || currentStatus === true) ? 0 : 1;
    try {
      await clientService.toggleClientStatus(clientId, newStatus);
      toast.success(newStatus === 1 ? "Client activated" : "Client deactivated");
      fetchData(currentPage); 
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };



   const handleSendInvite = async (clientId: number, clientName: string, clientEmail: string) => {
    if (!window.confirm(`Send portal login credentials to ${clientEmail}?`)) return;
      try {
        const res = await clientService.sendPortalInvite(clientId);
        if (res.success) {
          toast.success(`Invite sent successfully to ${clientEmail}`);
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to send invite");
      }
    };


  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Delete client "${name}"?`)) return;
    try {
      await clientService.deleteClient(id);
      toast.success("Client deleted successfully");
      fetchData(currentPage);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb title="Dashboard" subTitle="Client Management" breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Clients" }]} />

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <Users size={20} className="text-green-600" /> Clients
          </h2>
          <button onClick={() => router.push("/clients/create")} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">
            <Plus size={16} /> Add New Client
          </button>
        </div>

        {/* Filters (Cases jastai eutai card vitra) */}
        <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none">
            <option value="">All Types</option>
            <option value="individual">Individual</option>
            <option value="corporate">Corporate</option>
          </select>
          <button onClick={() => { setSearch(""); setFilterType(""); }} className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <RefreshCw size={16} /> Reset
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-green-50 dark:bg-green-900/20 text-gray-700 dark:text-gray-300 font-semibold">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center"><Loader2 className="animate-spin mx-auto text-green-600" size={24} /></td></tr>
              ) : clients.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No clients found</td></tr>
              ) : (
                clients.map((client) => {
                  const isActive = client.status === 1 || client.status === true;
                  return (
                    <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{client.name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${client.type === 'corporate' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                          {client.type === 'corporate' ? 'Corporate' : 'Individual'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        <div>{client.email}</div>
                        <div className="text-xs">{client.phone || 'N/A'}</div>
                        {client.city && <div className="text-xs text-gray-500 mt-1">📍 {client.city}{client.postcode ? `, ${client.postcode}` : ''}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => handleToggleStatus(client.id, client.status)} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer hover:opacity-80 ${isActive ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"}`}>
                          <Power size={12} /> {isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">

                           <button 
                              onClick={() => handleSendInvite(client.id, client.name, client.email)}
                              className="p-1.5 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg" 
                              title="Send Portal Login Credentials"
                            >
                              <Mail size={16} />
                            </button>
                          <button onClick={() => router.push(`/clients/${client.id}`)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg" title="Edit"><Pencil size={16} /></button>
                          <button onClick={() => handleDelete(client.id, client.name)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Delete"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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