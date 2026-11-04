"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { userService } from "@/services/userService";
import { User, PaginatedResponse } from "@/types";
import { Plus, Pencil, Trash2, Power, Search, RefreshCw, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Pagination from "@/components/ui/Pagination";

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchData = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const usersRes = await userService.getAllUsers({ search: searchName, page });
      if (usersRes.success) {
        const paginator = usersRes.data as unknown as PaginatedResponse<User> || usersRes;
        setUsers(paginator.data || usersRes.users || []);
        setCurrentPage(paginator.current_page || page);
        setLastPage(paginator.last_page || 1);
        setTotal(paginator.total || usersRes.users?.length || 0);
      }
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(1); }, [searchName]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= lastPage) fetchData(page);
  };

  const handleDelete = async (userId: number, userName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}?`)) return;
    try {
      await userService.deleteUser(userId);
      toast.success("User deleted successfully");
      fetchData(currentPage);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const handleToggleStatus = async (userId: number, currentStatus: number | boolean) => {
    const newStatus = (currentStatus === 1 || currentStatus === true) ? 0 : 1;
    try {
      await userService.toggleUserStatus(userId, newStatus);
      toast.success(newStatus === 1 ? "User activated" : "User deactivated");
      fetchData(currentPage);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb title="Dashboard" subTitle="User List" breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Users" }]} />

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <Plus size={20} className="text-green-600" /> Admin Users
          </h2>
          <button onClick={() => router.push("/users/create")} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">
            <Plus size={16} /> Create New
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search by name..." value={searchName} onChange={(e) => setSearchName(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <button onClick={() => { setSearchName(""); fetchData(1); }} className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <RefreshCw size={16} /> Reset Search
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-green-50 dark:bg-green-900/20 text-gray-700 dark:text-gray-300 font-semibold">
              <tr>
                <th className="px-6 py-3">Image</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center"><Loader2 className="animate-spin mx-auto text-green-600" size={24} /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No users found</td></tr>
              ) : (
                users.map((user) => {
                  const isActive = user.status === 1 || user.status === true;
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <img src={user.image_url || `https://ui-avatars.com/api/?name=${user.name}`} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-slate-700" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.phone || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          {user.roles?.[0]?.name || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => handleToggleStatus(user.id, user.status)} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer hover:opacity-80 ${isActive ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"}`}>
                          <Power size={12} /> {isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => router.push(`/users/${user.id}`)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Edit"><Pencil size={16} /></button>
                          <button onClick={() => handleDelete(user.id, user.name)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete"><Trash2 size={16} /></button>
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