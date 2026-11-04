"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { taskService } from "@/services/taskService";
import { caseService } from "@/services/caseService";
import { userService } from "@/services/userService";
import { Task, CaseModel, User, PaginatedResponse } from "@/types";
import { ArrowLeft, Save, Loader2, CheckSquare } from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function TaskFormPage() {
  const router = useRouter();
  const { id } = useParams();
  const isEdit = id !== "create";

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEdit);
  
  const [cases, setCases] = useState<CaseModel[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as "high" | "medium" | "low",
    status: "to_do" as "to_do" | "in_progress" | "under_review" | "done" | "cancelled",
    case_id: "",
    assigned_to: "",
    deadline: "",
    is_active: 1,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [casesRes, usersRes] = await Promise.all([
          caseService.getAll({ page: 1 }),
          userService.getAllUsers(),
        ]);
        
        if (casesRes.success && casesRes.data) {
          setCases((casesRes.data as any)?.data || []);
        }
        if (usersRes.success) setUsers(usersRes.users || []);

        if (isEdit) {
          const taskRes = await taskService.getTask(Number(id));
          if (taskRes.success && taskRes.task) {
            const t = taskRes.task;
            setFormData({
              title: t.title,
              description: t.description || "",
              priority: t.priority,
              status: t.status,
              case_id: t.case_id ? String(t.case_id) : "",
              assigned_to: t.assigned_to ? String(t.assigned_to) : "",
              deadline: t.deadline ? t.deadline.split('T')[0] : "",
              is_active: t.is_active ? 1 : 0,
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
        case_id: formData.case_id ? Number(formData.case_id) : null,
        assigned_to: formData.assigned_to ? Number(formData.assigned_to) : null,
        is_active: formData.is_active === 1,
      };

      if (isEdit) {
        await taskService.update(Number(id), payload);
        toast.success("Task updated successfully!");
      } else {
        await taskService.create(payload);
        toast.success("Task created successfully!");
      }
      router.push("/tasks");
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Failed to save task";
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
          subTitle={isEdit ? "Update Task" : "Create Task"}
          breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Tasks", href: "/tasks" }]}
        />
        <button
          onClick={() => router.push("/tasks")}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft size={16} /> Back to List
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Task Details */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <CheckSquare size={20} className="text-green-600" /> Task Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Task Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                placeholder="e.g., Prepare court documents for Case #001"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none resize-none transition-all"
                placeholder="Detailed description of what needs to be done..."
              ></textarea>
            </div>

               <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Related Case (Optional)</label>
              <select
                value={formData.case_id}
                onChange={(e) => setFormData({ ...formData, case_id: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
              >
                <option value="">-- No Case (General Task) --</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.case_number} - {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Deadline</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm h-fit space-y-5">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Settings</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Priority <span className="text-red-500">*</span></label>
            <select
              required
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
            >
              <option value="high">🔴 High (Urgent)</option>
              <option value="medium">🟡 Medium (Normal)</option>
              <option value="low">🟢 Low (Can Wait)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status <span className="text-red-500">*</span></label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
            >
              <option value="to_do">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="under_review">Under Review</option>
              <option value="done">Done</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Assign To</label>
            <select
              value={formData.assigned_to}
              onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
            >
              <option value="">-- Unassigned --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          <div className="pt-2 border-t border-gray-200 dark:border-slate-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Active Status</label>
            <div className="flex items-center gap-3 p-3 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800/50">
              <input
                type="checkbox"
                id="task-active"
                checked={formData.is_active === 1}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500 cursor-pointer"
              />
              <label htmlFor="task-active" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer flex-1">
                {formData.is_active === 1 ? "Active Task" : "Archived Task"}
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
              {isLoading ? "Saving..." : isEdit ? "Update Task" : "Create Task"}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}