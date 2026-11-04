"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { timeEntryService } from "@/services/timeEntryService";
import { caseService } from "@/services/caseService";
import { TimeEntry, CaseModel, PaginatedResponse } from "@/types";
import { ArrowLeft, Save, Loader2, Clock, Play, Square, Timer } from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function TimeEntryFormPage() {
  const router = useRouter();
  const { id } = useParams();
  const isEdit = id !== "create";

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEdit);
  const [cases, setCases] = useState<CaseModel[]>([]);

  // Timer States
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerStartTime, setTimerStartTime] = useState<string | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState({
    description: "",
    work_date: new Date().toISOString().split('T')[0],
    start_time: "",
    end_time: "",
    duration_minutes: 0,
    billable_rate: 0,
    is_billable: 1,
    case_id: "",
    status: "draft" as "draft" | "submitted" | "approved" | "invoiced",
  });

  // Load Cases
  useEffect(() => {
    const loadCases = async () => {
      try {
        const casesRes = await caseService.getAll({ page: 1 });
        if (casesRes.success && casesRes.data) {
          setCases((casesRes.data as any)?.data || []);
        }
      } catch (error) {
        console.error(error);
      }
    };
    loadCases();
  }, []);


  useEffect(() => {
    if (isEdit) {
      const loadEntry = async () => {
        try {
          const res = await timeEntryService.getEntry(Number(id));
          if (res.success && res.entry) {
            const e = res.entry;
            setFormData({
              description: e.description,
              work_date: e.work_date.split('T')[0],
              start_time: e.start_time ? e.start_time.substring(0, 5) : "",
              end_time: e.end_time ? e.end_time.substring(0, 5) : "",
              duration_minutes: e.duration_minutes,
              billable_rate: Number(e.billable_rate),
              is_billable: e.is_billable ? 1 : 0,
              case_id: e.case_id ? String(e.case_id) : "",
              status: e.status,
            });
          }
        } catch (error) {
          toast.error("Failed to load time entry");
        } finally {
          setIsFetching(false);
        }
      };
      loadEntry();
    } else {
      setIsFetching(false);
    }
  }, [id, isEdit]);

 
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning]);

  const formatTimerDisplay = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleStartTimer = () => {
    if (!timerStartTime) {
      setTimerStartTime(new Date().toTimeString().slice(0, 5));
      setFormData({ ...formData, start_time: new Date().toTimeString().slice(0, 5) });
    }
    setIsTimerRunning(true);
  };

  const handleStopTimer = () => {
    setIsTimerRunning(false);
    const endTime = new Date().toTimeString().slice(0, 5);
    const minutes = Math.max(1, Math.round(timerSeconds / 60));
    setFormData({ 
      ...formData, 
      end_time: endTime,
      duration_minutes: minutes
    });
    setTimerSeconds(0);
    setTimerStartTime(null);
  };

  const calculatedAmount = formData.is_billable 
    ? (formData.duration_minutes / 60) * formData.billable_rate 
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.duration_minutes < 1) {
      toast.error("Duration must be at least 1 minute");
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        case_id: formData.case_id ? Number(formData.case_id) : null,
        is_billable: formData.is_billable === 1,
        total_amount: calculatedAmount,
      };

      if (isEdit) {
        await timeEntryService.update(Number(id), payload);
        toast.success("Time entry updated successfully!");
      } else {
        await timeEntryService.create(payload);
        toast.success("Time entry logged successfully!");
      }
      router.push("/time-entries");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save");
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
          subTitle={isEdit ? "Update Time Entry" : "Log Time"}
          breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Time Entries", href: "/time-entries" }]}
        />
        <button
          onClick={() => router.push("/time-entries")}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft size={16} /> Back to List
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        
        <div className="lg:col-span-2 space-y-6">
          

          {!isEdit && (
            <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Timer size={20} /> Live Timer
                </h2>
                <div className="text-xs bg-white/20 px-2 py-1 rounded">
                  {isTimerRunning ? "Running" : "Stopped"}
                </div>
              </div>
              <div className="text-center mb-4">
                <div className="text-5xl font-mono font-bold tracking-wider">
                  {formatTimerDisplay(timerSeconds)}
                </div>
              </div>
              <div className="flex gap-3">
                {!isTimerRunning ? (
                  <button
                    type="button"
                    onClick={handleStartTimer}
                    className="flex-1 flex items-center justify-center gap-2 bg-white text-green-700 hover:bg-gray-100 font-semibold py-3 rounded-lg transition-colors"
                  >
                    <Play size={18} /> Start Timer
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStopTimer}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    <Square size={18} /> Stop Timer
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Entry Details */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Clock size={20} className="text-green-600" /> Entry Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none resize-none transition-all"
                  placeholder="What did you work on? (e.g., Drafted client contract, Reviewed case documents)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Work Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.work_date}
                  onChange={(e) => setFormData({ ...formData, work_date: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Related Case (Optional)</label>
                <select
                  value={formData.case_id}
                  onChange={(e) => setFormData({ ...formData, case_id: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                >
                  <option value="">-- General (No Case) --</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>{c.case_number} - {c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Start Time</label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">End Time</label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Duration (minutes) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                >
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="approved">Approved</option>
                  <option value="invoiced">Invoiced</option>
                </select>
              </div>
            </div>
          </div>
        </div>

      
        <div className="space-y-6">
          
          {/* Billing Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Billing</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Billable Rate (per hour)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.billable_rate}
                onChange={(e) => setFormData({ ...formData, billable_rate: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                placeholder="0.00"
              />
            </div>

            <div className="pt-2 border-t border-gray-200 dark:border-slate-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Billable Type</label>
              <div className="flex items-center gap-3 p-3 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800/50">
                <input
                  type="checkbox"
                  id="is-billable"
                  checked={formData.is_billable === 1}
                  onChange={(e) => setFormData({ ...formData, is_billable: e.target.checked ? 1 : 0 })}
                  className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500 cursor-pointer"
                />
                <label htmlFor="is-billable" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer flex-1">
                  {formData.is_billable === 1 ? "Billable (Client pays)" : "Non-Billable (Internal)"}
                </label>
              </div>
            </div>

      
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Calculated Amount</div>
              <div className="text-2xl font-bold text-emerald-600">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'NPR' }).format(calculatedAmount)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {(formData.duration_minutes / 60).toFixed(2)} hours × {formData.billable_rate}/hr
              </div>
            </div>
          </div>

      
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {isLoading ? "Saving..." : isEdit ? "Update Entry" : "Log Time"}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}