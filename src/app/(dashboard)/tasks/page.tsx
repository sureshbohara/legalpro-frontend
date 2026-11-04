"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { taskService } from "@/services/taskService";
import { userService } from "@/services/userService";
import { caseService } from "@/services/caseService";
import { Task, User, CaseModel, PaginatedResponse } from "@/types";
import { CheckSquare, Search, RefreshCw, Loader2, Plus, Pencil, Trash2, Power, Calendar, AlertCircle, Flag } from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Pagination from "@/components/ui/Pagination";

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter States
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterAssignee, setFilterAssignee] = useState("");
  const [filterOverdue, setFilterOverdue] = useState("");
  
  // Dropdown Data
  const [users, setUsers] = useState<User[]>([]);
  const [cases, setCases] = useState<CaseModel[]>([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Load filter data
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [usersRes, casesRes] = await Promise.all([
          userService.getAllUsers(),
          caseService.getAll({ page: 1 }),
        ]);
        if (usersRes.success) setUsers(usersRes.users || []);
        if (casesRes.success && casesRes.data) {
          setCases((casesRes.data as any)?.data || []);
        }
      } catch (error) {
        console.error("Failed to load filters", error);
      }
    };
    loadFilters();
  }, []);

  const fetchData = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const res = await taskService.getAll({ 
        search, 
        status: filterStatus || undefined, 
        priority: filterPriority || undefined,
        assigned_to: filterAssignee || undefined,
        overdue: filterOverdue || undefined,
        page 
      });
      
      if (res.success && res.data) {
        const paginator = res.data as unknown as PaginatedResponse<Task>;
        setTasks(paginator.data || []);
        setCurrentPage(paginator.current_page);
        setLastPage(paginator.last_page);
        setTotal(paginator.total);
      }
    } catch (error) {
      toast.error("Failed to fetch tasks");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(1); }, [search, filterStatus, filterPriority, filterAssignee, filterOverdue]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= lastPage) fetchData(page);
  };

  const handleToggleActive = async (id: number, currentActive: boolean | number) => {
    const newActive = currentActive === 1 || currentActive === true ? false : true;
    try {
      await taskService.toggleActive(id, newActive);
      toast.success(newActive ? "Task activated" : "Task archived");
      fetchData(currentPage);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Delete task "${title}"?`)) return;
    try {
      await taskService.delete(id);
      toast.success("Task deleted successfully");
      fetchData(currentPage);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'medium': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'to_do': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'under_review': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'done': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (task: Task) => {
    if (!task.deadline || task.status === 'done' || task.status === 'cancelled') return false;
    return new Date(task.deadline) < new Date(new Date().toDateString());
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <Breadcrumb title="Dashboard" subTitle="Tasks" breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Tasks" }]} />

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
     
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <CheckSquare size={20} className="text-green-600" /> Task Management
          </h2>
          <button
            onClick={() => router.push("/tasks/create")}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={16} /> Create Task
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none" 
            />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none">
            <option value="">All Statuses</option>
            <option value="to_do">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="under_review">Under Review</option>
            <option value="done">Done</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none">
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

       
        <div className="p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3">
          <select value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none">
            <option value="">All Assignees</option>
            <option value="me">My Tasks</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          <select value={filterOverdue} onChange={(e) => setFilterOverdue(e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none">
            <option value="">All Tasks</option>
            <option value="1">Overdue Only</option>
          </select>
          <button onClick={() => { setSearch(""); setFilterStatus(""); setFilterPriority(""); setFilterAssignee(""); setFilterOverdue(""); }} className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg">
            <RefreshCw size={16} /> Reset Filters
          </button>
        </div>

    
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
           <table className="w-full text-sm text-left min-w-[800px]">
            <thead className="bg-green-50 dark:bg-green-900/20 text-gray-700 dark:text-gray-300 font-semibold">
              <tr>
                <th className="px-6 py-3">Task</th>
                <th className="px-6 py-3">Case</th>
                <th className="px-6 py-3">Priority</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Assigned To</th>
                <th className="px-6 py-3">Deadline</th>
                <th className="px-6 py-3">Active</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {isLoading ? (
                <tr><td colSpan={8} className="px-6 py-8 text-center"><Loader2 className="animate-spin mx-auto text-green-600" size={24} /></td></tr>
              ) : tasks.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-500">No tasks found</td></tr>
              ) : (
                tasks.map((t) => {
                  const overdue = isOverdue(t);
                  return (
                    <tr key={t.id} className={`hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors ${overdue ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2">
                          {overdue && <AlertCircle size={14} className="text-red-500 mt-1 flex-shrink-0" />}
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{t.title}</div>
                            {t.description && <div className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{t.description}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {t.case ? (
                          <div>
                            <div className="text-xs font-mono">{t.case.case_number}</div>
                            <div className="text-xs truncate max-w-[150px]">{t.case.title}</div>
                          </div>
                        ) : <span className="text-gray-400 italic text-xs">General</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getPriorityColor(t.priority)}`}>
                          <Flag size={10} /> {t.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(t.status)}`}>
                          {t.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {t.assignee?.name || <span className="text-gray-400 italic text-xs">Unassigned</span>}
                      </td>
                      <td className="px-6 py-4">
                        {t.deadline ? (
                          <div className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-600 font-semibold' : 'text-gray-600 dark:text-gray-400'}`}>
                            <Calendar size={12} />
                            {formatDate(t.deadline)}
                          </div>
                        ) : <span className="text-gray-400 text-xs">No deadline</span>}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(t.id, t.is_active)}
                          className={`p-1.5 rounded-lg transition-colors ${t.is_active ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                          title={t.is_active ? "Archive" : "Activate"}
                        >
                          <Power size={16} />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => router.push(`/tasks/${t.id}`)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg" title="Edit"><Pencil size={16} /></button>
                          <button onClick={() => handleDelete(t.id, t.title)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Delete"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={currentPage} lastPage={lastPage} total={total} onPageChange={handlePageChange} perPage={15} />
      </div>
    </div>
  );
}