"use client";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { profileService } from "@/services/profileService";
import { Save, Loader2, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.password_confirmation) {
      toast.error("New passwords do not match!");
      return;
    }

    setIsLoading(true);
    try {
      const response = await profileService.changePassword(formData);
      if (response.success) {
        toast.success(response.message || "Password changed successfully!");
        setFormData({ current_password: "", password: "", password_confirmation: "" });
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Failed to change password";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        title="Dashboard"
        subTitle="Update Password"
        breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Profile" }]}
      />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            Password Fields
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Current Password <span className="text-red-500">*</span></label>
              <input
                type="password"
                required
                value={formData.current_password}
                onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Enter your current password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New Password <span className="text-red-500">*</span></label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Minimum 8 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm New Password <span className="text-red-500">*</span></label>
              <input
                type="password"
                required
                value={formData.password_confirmation}
                onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Re-enter new password"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2.5 rounded-lg transition-colors mt-2"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {isLoading ? "Updating..." : "Save & Update"}
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm h-fit">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <CheckCircle size={20} className="text-blue-500" /> Password Requirements
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
              <span className="text-yellow-500 mt-0.5">🔑</span>
              <span>Enter your <strong>current password</strong> correctly.</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
              <span className="text-blue-500 mt-0.5">🆕</span>
              <span>New password must be at least <strong>8 characters</strong> long.</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
              <span className="text-purple-500 mt-0.5">🔄</span>
              <span>Must include a mix of letters and numbers for better security.</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
              <span className="text-green-500 mt-0.5">✅</span>
              <span>Confirm by re-typing the exact same new password.</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
              <span className="text-red-500 mt-0.5">⚠️</span>
              <span>New password must be <strong>different</strong> from your current password.</span>
            </li>
          </ul>
        </div>
      </form>
    </div>
  );
}