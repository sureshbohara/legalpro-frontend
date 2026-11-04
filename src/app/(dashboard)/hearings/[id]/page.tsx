"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { hearingService } from "@/services/hearingService";
import { caseService } from "@/services/caseService";
import { Hearing, CaseModel, PaginatedResponse } from "@/types";
import { ArrowLeft, Save, Loader2, Gavel, Calendar, Clock, Building, Scale } from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function HearingFormPage() {
  const router = useRouter();
  const { id } = useParams();
  const isEdit = id !== "create";

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEdit);
  
 
  const [cases, setCases] = useState<CaseModel[]>([]);

  const [formData, setFormData] = useState({
    case_id: "",
    hearing_date: "",
    hearing_time: "",
    court_name: "",
    judge_name: "",
    hearing_type: "Regular",
    purpose: "",
    outcome: "",
    next_hearing_date: "",
    status: "scheduled" as "scheduled" | "completed" | "adjourned" | "cancelled",
    is_active: 1,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const casesRes = await caseService.getAll({ page: 1 }); 
        if (casesRes.success && casesRes.data) {
          const paginator = casesRes.data as unknown as PaginatedResponse<CaseModel>;
          setCases(paginator.data || []);
        }

        if (isEdit) {
          const hearingRes = await hearingService.getHearing(Number(id));
          if (hearingRes.success && hearingRes.hearing) {
            const h = hearingRes.hearing;
            setFormData({
              case_id: String(h.case_id),
              hearing_date: h.hearing_date ? h.hearing_date.split('T')[0] : "",
              hearing_time: h.hearing_time || "",
              court_name: h.court_name,
              judge_name: h.judge_name || "",
              hearing_type: h.hearing_type,
              purpose: h.purpose || "",
              outcome: h.outcome || "",
              next_hearing_date: h.next_hearing_date ? h.next_hearing_date.split('T')[0] : "",
              status: h.status,
              is_active: h.is_active ? 1 : 0,
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
        case_id: Number(formData.case_id),
        is_active: formData.is_active === 1,
      };

      if (isEdit) {
        await hearingService.update(Number(id), payload);
        toast.success("Hearing updated successfully!");
      } else {
        await hearingService.create(payload);
        toast.success("Hearing scheduled successfully!");
      }
      router.push("/hearings");
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Failed to save hearing";
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
          subTitle={isEdit ? "Update Hearing" : "Schedule Hearing"}
          breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Hearings", href: "/hearings" }]}
        />
        <button
          onClick={() => router.push("/hearings")}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft size={16} /> Back to List
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        

        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Gavel size={20} className="text-green-600" /> Hearing Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Related Case <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.case_id}
                onChange={(e) => setFormData({ ...formData, case_id: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
              >
                <option value="">-- Select Case --</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.case_number} - {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Hearing Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="date"
                  required
                  value={formData.hearing_date}
                  onChange={(e) => setFormData({ ...formData, hearing_date: e.target.value })}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Hearing Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="time"
                  value={formData.hearing_time}
                  onChange={(e) => setFormData({ ...formData, hearing_time: e.target.value })}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Court Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  required
                  value={formData.court_name}
                  onChange={(e) => setFormData({ ...formData, court_name: e.target.value })}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                  placeholder="e.g., Kathmandu District Court"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Judge Name</label>
              <div className="relative">
                <Scale className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={formData.judge_name}
                  onChange={(e) => setFormData({ ...formData, judge_name: e.target.value })}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                  placeholder="e.g., Hon. John Doe"
                />
              </div>
            </div>

         

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Purpose of Hearing</label>
              <textarea
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                rows={2}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none resize-none transition-all"
                placeholder="Why is this hearing scheduled?"
              ></textarea>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Outcome / Remarks</label>
              <textarea
                value={formData.outcome}
                onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                rows={2}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none resize-none transition-all"
                placeholder="What was the result? (e.g., Adjourned to next date, Bail granted)"
              ></textarea>
            </div>
          </div>
        </div>

       
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm h-fit space-y-5">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Settings</h2>


             <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Hearing Type <span className="text-red-500">*</span></label>
              <select
                required
                value={formData.hearing_type}
                onChange={(e) => setFormData({ ...formData, hearing_type: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
              >
                <option value="Regular">Regular Hearing</option>
                <option value="Bail">Bail Hearing</option>
                <option value="Evidence">Evidence Recording</option>
                <option value="Final Hearing">Final Hearing / Arguments</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Next Hearing Date</label>
              <input
                type="date"
                value={formData.next_hearing_date}
                onChange={(e) => setFormData({ ...formData, next_hearing_date: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
              />
            </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Hearing Status <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
            >
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="adjourned">Adjourned</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="pt-2 border-t border-gray-200 dark:border-slate-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Active Status</label>
            <div className="flex items-center gap-3 p-3 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800/50">
              <input
                type="checkbox"
                id="hearing-active"
                checked={formData.is_active === 1}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500 cursor-pointer"
              />
              <label htmlFor="hearing-active" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer flex-1">
                {formData.is_active === 1 ? "Active Hearing" : "Archived / Cancelled"}
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
              {isLoading ? "Saving..." : isEdit ? "Update Hearing" : "Schedule Hearing"}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}