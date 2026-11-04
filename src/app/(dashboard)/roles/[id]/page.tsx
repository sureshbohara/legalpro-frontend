"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { roleService } from "@/services/roleService";
import { permissionService } from "@/services/permissionService";
import { Role, Permission } from "@/types";
import { ArrowLeft, Save, Loader2, Shield, CheckSquare, Square } from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function EditRolePage() {
  const router = useRouter();
  const { id } = useParams();
  const roleId = Number(id);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [roleName, setRoleName] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [rolesRes, permsRes] = await Promise.all([
          roleService.getAllRoles(),
          permissionService.getAllPermissions(),
        ]);

        if (permsRes.success) setPermissions(permsRes.permissions || []);
        
        if (rolesRes.success) {
          const foundRole = (rolesRes.roles || []).find((r: Role) => r.id === roleId);
          if (foundRole) {
            setRole(foundRole);
            setRoleName(foundRole.name);
            setSelectedPermissions(foundRole.permissions?.map((p) => p.id) || []);
          }
        }
      } catch (error) {
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [roleId]);

  const togglePermission = (permId: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {

      if (roleName !== role?.name) {
        await roleService.updateRole(roleId, roleName);
        toast.success("Role name updated!");
      }
     
      await roleService.assignPermissions(roleId, selectedPermissions);
      toast.success("Permissions assigned successfully!");
      

      const rolesRes = await roleService.getAllRoles();
      if (rolesRes.success) {
        const updatedRole = (rolesRes.roles || []).find((r: Role) => r.id === roleId);
        if (updatedRole) setRole(updatedRole);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-green-600" size={32} />
      </div>
    );
  }

  if (!role) {
    return <div className="p-6 text-center text-gray-500">Role not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Breadcrumb title="Dashboard" subTitle="Edit Role" breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Roles", href: "/roles" }]} />
        <button onClick={() => router.push("/roles")} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700">
          <ArrowLeft size={16} /> Back to Roles
        </button>
      </div>

      <form onSubmit={handleSaveAll} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm h-fit">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Shield size={20} className="text-green-600" /> Role Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Role Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-70"
              >
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <CheckSquare size={20} className="text-blue-600" /> Assign Permissions
            <span className="text-sm font-normal text-gray-500 ml-2">({selectedPermissions.length} selected)</span>
          </h2>
          
          {permissions.length === 0 ? (
            <p className="text-gray-500 text-sm">No permissions available. Please create permissions first.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-2">
              {permissions.map((perm) => {
                const isSelected = selectedPermissions.includes(perm.id);
                return (
                  <button
                    key={perm.id}
                    type="button"
                    onClick={() => togglePermission(perm.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                        : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-slate-600"
                    }`}
                  >
                    {isSelected ? <CheckSquare size={18} className="text-green-600 flex-shrink-0" /> : <Square size={18} className="text-gray-400 flex-shrink-0" />}
                    <span className="text-sm font-medium break-words">{perm.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}