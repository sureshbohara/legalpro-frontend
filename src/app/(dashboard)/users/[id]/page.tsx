"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { userService } from "@/services/userService";
import { roleService } from "@/services/roleService";
import { User, Role } from "@/types";
import { ArrowLeft, Save, Loader2, Image as ImageIcon, User as UserIcon } from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function UserFormPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const isEdit = userId !== "create";

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEdit);
  const [roles, setRoles] = useState<Role[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    bio_info: "",
    role_id: "" as string | number,
    status: 1,
    image: null as File | null,
  });

  const safeFallback = "https://ui-avatars.com/api/?name=User&background=e2e8f0&color=64748b";
  const [imagePreview, setImagePreview] = useState<string>(safeFallback);

  useEffect(() => {
    const loadData = async () => {
      try {
        const rolesRes = await roleService.getAllRoles();
        if (rolesRes.success) {
          setRoles(rolesRes.roles || []); 
        }

        if (isEdit) {
          const userRes = await userService.getAllUsers();
          const user = (userRes.users || []).find((u: User) => u.id === Number(userId));
          if (user) {
            setFormData({
              name: user.name,
              email: user.email,
              password: "",
              phone: user.phone || "",
              bio_info: (user as any).bio_info || "",
              role_id: user.roles?.[0]?.id || "",
              status: user.status,
              image: null,
            });
            setImagePreview((user as any).image_url || safeFallback);
          }
        }
      } catch (error) {
        toast.error("Failed to load form data");
      } finally {
        setIsFetching(false);
      }
    };
    loadData();
  }, [userId, isEdit]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isEdit && !formData.password) {
      toast.error("Password is required for new users");
      return;
    }

    setIsLoading(true);
    try {
      const payload: any = { ...formData, role_id: Number(formData.role_id) };
    
      if (isEdit && !formData.password) {
        delete payload.password;
      }

      if (isEdit) {
        await userService.updateUser(Number(userId), payload);
        toast.success("User updated successfully!");
      } else {
        await userService.createUser(payload);
        toast.success("User created successfully!");
      }
      router.push("/users");
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Failed to save user";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-green-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Breadcrumb
          title="Dashboard"
          subTitle={isEdit ? "Update User" : "Create User"}
          breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Users", href: "/users" }]}
        />
        <button
          onClick={() => router.push("/users")}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
        >
          <ArrowLeft size={16} /> Back to List
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <UserIcon size={20} className="text-green-600" /> User Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="e.g., John Doe"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address <span className="text-red-500">*</span></label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Mobile Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="+977-98XXXXXXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Password {isEdit ? "(Leave blank to keep current)" : "*"}
              </label>
              <input
                type="password"
                required={!isEdit}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Min 8 characters"
              />
            </div>
            
     

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Bio / Details</label>
              <textarea
                value={formData.bio_info}
                onChange={(e) => setFormData({ ...formData, bio_info: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Any additional notes..."
              ></textarea>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm h-fit space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Settings</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">User Role <span className="text-red-500">*</span></label>
            <select
              required
              value={formData.role_id}
              onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="">-- Select Role --</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Profile Image</label>
            <div className="text-center p-4 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-24 h-24 rounded-full mx-auto object-cover mb-3 border-2 border-white dark:border-slate-600 shadow-sm"
              />
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                <ImageIcon size={16} /> Choose File
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">PNG, JPG or WEBP. Max 2MB.</p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {isLoading ? "Saving..." : (isEdit ? "Update User" : "Create User")}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}