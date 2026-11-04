"use client";
import { useState, useEffect } from "react";
import { caseCategoryService } from "@/services/caseCategoryService";
import { CaseCategory, PaginatedResponse } from "@/types";
import { Plus, Pencil, Trash2, FolderOpen, Search, RefreshCw, Loader2, Save, X, Power } from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Pagination from "@/components/ui/Pagination";

export default function CaseCategoriesPage() {
  const [categories, setCategories] = useState<CaseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", color: "#3b82f6", description: "", status: 1 });
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const res = await caseCategoryService.getAll({ search, page });
      if (res.success && res.data) {
        const paginator = res.data as unknown as PaginatedResponse<CaseCategory>;
        setCategories(paginator.data || []);
        setCurrentPage(paginator.current_page);
        setLastPage(paginator.last_page);
        setTotal(paginator.total);
      }
    } catch (error) {
      toast.error("Failed to fetch categories");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(1); }, [search]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= lastPage) fetchData(page);
  };

  const openCreateForm = () => {
    setEditingId(null);
    setFormData({ name: "", color: "#3b82f6", description: "", status: 1 });
    setShowForm(true);
  };

  const openEditForm = (category: CaseCategory) => {
    setEditingId(category.id);
    setFormData({ name: category.name, color: category.color, description: category.description || "", status: category.status ? 1 : 0 });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingId) {
        await caseCategoryService.update(editingId, formData);
        toast.success("Category updated successfully!");
      } else {
        await caseCategoryService.create(formData);
        toast.success("Category created successfully!");
      }
      setShowForm(false);
      fetchData(currentPage);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await caseCategoryService.delete(id);
      toast.success("Category deleted");
      fetchData(currentPage);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: number | boolean) => {
    const newStatus = (currentStatus === 1 || currentStatus === true) ? 0 : 1;
    try {
      await caseCategoryService.toggleStatus(id, newStatus);
      toast.success(newStatus === 1 ? "Category activated" : "Category deactivated");
      fetchData(currentPage);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb title="Dashboard" subTitle="Case Categories" breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Case Management" }]} />

      {showForm && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{editingId ? "Edit Category" : "Create New Category"}</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category Name <span className="text-red-500">*</span></label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none" placeholder="e.g., Civil, Criminal" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="h-10 w-14 rounded border border-gray-300 dark:border-slate-700 cursor-pointer" />
                <input type="text" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
              <div className="flex items-center gap-2 p-2.5 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800">
                <input type="checkbox" id="cat-status" checked={formData.status === 1} onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 1 : 0 })} className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500" />
                <label htmlFor="cat-status" className="text-sm text-gray-700 dark:text-gray-300">{formData.status === 1 ? "Active" : "Inactive"}</label>
              </div>
            </div>
            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none resize-none" placeholder="Brief description..."></textarea>
            </div>
            <div className="md:col-span-4 flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 rounded-lg hover:bg-gray-200">Cancel</button>
              <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg disabled:opacity-70">
                {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {isSaving ? "Saving..." : (editingId ? "Update" : "Create")}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <FolderOpen size={20} className="text-green-600" /> Case Categories
          </h2>
          <button onClick={openCreateForm} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg">
            <Plus size={16} /> Add Category
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search categories..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <button onClick={() => setSearch("")} className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg">
            <RefreshCw size={16} /> Reset
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-green-50 dark:bg-green-900/20 text-gray-700 dark:text-gray-300 font-semibold">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Color</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center"><Loader2 className="animate-spin mx-auto text-green-600" size={24} /></td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No categories found</td></tr>
              ) : (
                categories.map((cat) => {
                  const isActive = cat.status === 1 || cat.status === true;
                  return (
                    <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{cat.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full border border-gray-200 dark:border-slate-700" style={{ backgroundColor: cat.color }}></div>
                          <span className="text-xs text-gray-500 font-mono">{cat.color}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400 max-w-xs truncate">{cat.description || '-'}</td>
                      <td className="px-6 py-4">
                        <button onClick={() => handleToggleStatus(cat.id, cat.status)} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer hover:opacity-80 ${isActive ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"}`}>
                          <Power size={12} /> {isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEditForm(cat)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><Pencil size={16} /></button>
                          <button onClick={() => handleDelete(cat.id, cat.name)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-800">
          <Pagination currentPage={currentPage} lastPage={lastPage} total={total} onPageChange={handlePageChange} perPage={15} />
        </div>
      </div>
    </div>
  );
}