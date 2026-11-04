
"use client";

import { useState, useEffect } from "react";
import { permissionService } from "@/services/permissionService";
import { Permission } from "@/types";
import { Plus, Key, Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPermName, setNewPermName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);

    try {
      const res = await permissionService.getAllPermissions();

      if (res.success) {
        setPermissions(res.permissions || []);
      }
    } catch (error) {
      toast.error("Failed to fetch permissions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPermName.trim()) return;

    setIsCreating(true);

    try {
      await permissionService.createPermission(newPermName);

      toast.success("Permission created successfully!");

      setNewPermName("");
      fetchData();

    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
        "Failed to create permission"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the permission "${name}"?`
      )
    ) {
      return;
    }

    try {
      await permissionService.deletePermission(id);

      toast.success("Permission deleted successfully!");

      fetchData();

    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
        "Failed to delete permission"
      );
    }
  };

  return (
    <div className="space-y-6">

      <Breadcrumb
        title="Dashboard"
        subTitle="Permissions Management"
        breadcrumbItems={[
          { label: "Home", href: "/" },
          { label: "Permissions" }
        ]}
      />

   
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-4 shadow-sm">

        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <Plus size={20} className="text-green-600" />
          Create New Permission
        </h2>

        <form onSubmit={handleCreate} className="flex gap-3">

          <input
            type="text"
            required
            value={newPermName}
            onChange={(e) => setNewPermName(e.target.value)}
            placeholder="e.g., user.create, case.manage"
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
          />

          <button
            type="submit"
            disabled={isCreating}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-70"
          >
            {isCreating ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Plus size={18} />
            )}

            {isCreating ? "Creating..." : "Create Permission"}
          </button>

        </form>
      </div>

   
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full text-sm text-left">

            <thead className="bg-green-50 dark:bg-green-900/20 text-gray-700 dark:text-gray-300 font-semibold">
              <tr>
                <th className="px-6 py-3">
                  Permission Name
                </th>

                <th className="px-6 py-3">
                  Guard
                </th>

                <th className="px-6 py-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">

              {isLoading ? (

                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Loading permissions...
                  </td>
                </tr>

              ) : permissions.length === 0 ? (

                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No permissions found
                  </td>
                </tr>

              ) : (

                permissions.map((perm) => (

                  <tr
                    key={perm.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                  >

                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <Key
                          size={16}
                          className="text-blue-600"
                        />
                        {perm.name}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">

                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                        {perm.guard_name}
                      </span>

                    </td>

                    <td className="px-6 py-4 text-right">

                      <button
                        onClick={() =>
                          handleDelete(perm.id, perm.name)
                        }
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete Permission"
                      >
                        <Trash2 size={16} />
                      </button>

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
