"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { caseService } from "@/services/caseService";
import { clientService } from "@/services/clientService";
import { caseCategoryService } from "@/services/caseCategoryService";
import { caseStatusService } from "@/services/caseStatusService";
import { userService } from "@/services/userService";
import { CaseModel, Client, CaseCategory, CaseStatus, User } from "@/types";
import { ArrowLeft, Save, Loader2, Briefcase } from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function CaseFormPage() {
  const router = useRouter();
  const { id } = useParams();
  const isEdit = id !== "create";

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEdit);
  
  // Dropdown Data States
  const [clients, setClients] = useState<Client[]>([]);
  const [categories, setCategories] = useState<CaseCategory[]>([]);
  const [statuses, setStatuses] = useState<CaseStatus[]>([]);
  const [lawyers, setLawyers] = useState<User[]>([]);

  const [formData, setFormData] = useState({
    case_number: "",
    title: "",
    description: "",
    client_id: "",
    category_id: "",
    status_id: "",
    assigned_lawyer_id: "",
    opening_date: "",
    closing_date: "",
    status: 1,
  });

  useEffect(() => {
    const loadData = async () => {
      try {

        const [clientsRes, categoriesRes, statusesRes, usersRes] = await Promise.all([
          clientService.getAllClients(),
          caseCategoryService.getAll(),
          caseStatusService.getAll(),
          userService.getAllUsers(),
        ]);

        if (clientsRes.success) setClients((clientsRes.data as any)?.data || []);
        if (categoriesRes.success) setCategories((categoriesRes.data as any)?.data || []);
        if (statusesRes.success) setStatuses((statusesRes.data as any)?.data || []);
        if (usersRes.success) setLawyers(usersRes.users || []);

  
        if (isEdit) {
          const caseRes = await caseService.getCase(Number(id));
          if (caseRes.success && caseRes.case) {
            const c = caseRes.case;
            setFormData({
              case_number: c.case_number,
              title: c.title,
              description: c.description || "",
              client_id: String(c.client_id),
              category_id: String(c.category_id),
              status_id: String(c.status_id),
              assigned_lawyer_id: c.assigned_lawyer_id ? String(c.assigned_lawyer_id) : "",
              opening_date: c.opening_date ? c.opening_date.split('T')[0] : "",
              closing_date: c.closing_date ? c.closing_date.split('T')[0] : "",
              status: c.status ? 1 : 0,
            });
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load form data");
      } finally {
        setIsFetching(false);
      }
    };
    loadData();
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        client_id: Number(formData.client_id),
        category_id: Number(formData.category_id),
        status_id: Number(formData.status_id),
        assigned_lawyer_id: formData.assigned_lawyer_id ? Number(formData.assigned_lawyer_id) : null,
      };

      if (isEdit) {
        await caseService.update(Number(id), payload);
        toast.success("Case updated successfully!");
      } else {
        await caseService.create(payload);
        toast.success("Case created successfully!");
      }
      router.push("/cases");
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Failed to save case";
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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Breadcrumb
          title="Dashboard"
          subTitle={isEdit ? "Update Case" : "Create Case"}
          breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Cases", href: "/cases" }]}
        />
        <button
          onClick={() => router.push("/cases")}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft size={16} /> Back to List
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
  
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Briefcase size={20} className="text-green-600" /> Case Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Case Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.case_number}
                onChange={(e) => setFormData({ ...formData, case_number: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                placeholder="e.g., CASE-2026-001"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Case Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                placeholder="e.g., Smith vs. Jones"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none resize-none transition-all"
                placeholder="Brief description of the case, parties involved, and key facts..."
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Opening Date</label>
              <input
                type="date"
                value={formData.opening_date}
                onChange={(e) => setFormData({ ...formData, opening_date: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Closing Date</label>
              <input
                type="date"
                value={formData.closing_date}
                onChange={(e) => setFormData({ ...formData, closing_date: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm h-fit space-y-5">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Settings & Assignments</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Client <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
            >
              <option value="">-- Select Client --</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
            >
              <option value="">-- Select Category --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.status_id}
              onChange={(e) => setFormData({ ...formData, status_id: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
            >
              <option value="">-- Select Status --</option>
              {statuses.map((status) => (
                <option key={status.id} value={status.id}>{status.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Assigned Lawyer</label>
            <select
              value={formData.assigned_lawyer_id}
              onChange={(e) => setFormData({ ...formData, assigned_lawyer_id: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
            >
              <option value="">-- Unassigned --</option>
              {lawyers.map((lawyer) => (
                <option key={lawyer.id} value={lawyer.id}>{lawyer.name}</option>
              ))}
            </select>
          </div>

          <div className="pt-2 border-t border-gray-200 dark:border-slate-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Case Active Status</label>
            <div className="flex items-center gap-3 p-3 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800/50">
              <input
                type="checkbox"
                id="case-status"
                checked={formData.status === 1}
                onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 1 : 0 })}
                className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500 cursor-pointer"
              />
              <label htmlFor="case-status" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer flex-1">
                {formData.status === 1 ? "Active Case" : "Archived Case"}
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-all"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {isLoading ? "Saving..." : isEdit ? "Update Case" : "Create Case"}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}