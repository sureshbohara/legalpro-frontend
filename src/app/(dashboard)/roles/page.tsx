"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { roleService } from "@/services/roleService";
import { Role } from "@/types";
import { Plus, Pencil, Trash2, Shield, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function RolesPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newRoleName, setNewRoleName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await roleService.getAllRoles();
      if (res.success) setRoles(res.roles || []);
    } catch (error) {
      toast.error("Failed to fetch roles");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    setIsCreating(true);
    try {
      await roleService.createRole(newRoleName);
      toast.success("Role created successfully!");
      setNewRoleName("");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create role");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the role "${name}"?`)) return;
    try {
      await roleService.deleteRole(id);
      toast.success("Role deleted successfully");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete role");
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb title="Dashboard" subTitle="Roles Management" breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Roles" }]} />

      {/* Create Role Form */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <Plus size={20} className="text-green-600" /> Create New Role
        </h2>
        <form onSubmit={handleCreate} className="flex gap-3">
          <input
            type="text"
            required
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            placeholder="e.g., Manager, Editor"
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
          />
          <button
            type="submit"
            disabled={isCreating}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-70"
          >
            {isCreating ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
            {isCreating ? "Creating..." : "Create Role"}
          </button>
        </form>
      </div>

      {/* Roles Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-green-50 dark:bg-green-900/20 text-gray-700 dark:text-gray-300 font-semibold">
              <tr>
                <th className="px-6 py-3">Role Name</th>
                <th className="px-6 py-3">Permissions Count</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {isLoading ? (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">Loading roles...</td></tr>
              ) : roles.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">No roles found</td></tr>
              ) : (
                roles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <Shield size={16} className="text-green-600" /> {role.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {role.permissions?.length || 0} Permissions
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => router.push(`/roles/${role.id}`)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Edit & Assign Permissions"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(role.id, role.name)}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete Role"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}