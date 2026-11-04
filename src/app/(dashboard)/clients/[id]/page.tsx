"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { clientService } from "@/services/clientService";
import { Client } from "@/types";
import { ArrowLeft, Save, Loader2, Users } from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function ClientFormPage() {
  const router = useRouter();
  const { id } = useParams();
  const isEdit = id !== "create";

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEdit);
  
  const [formData, setFormData] = useState({
    name: "",
    type: "individual" as "individual" | "corporate",
    email: "",
    phone: "",
    registration_number: "",
    date_of_birth: "",
    website: "",
    address: "",
    city: "",
    postcode: "",
    country: "Nepal",
    notes: "",
    status: 1,
  });

  useEffect(() => {
    if (isEdit) {
      const loadClient = async () => {
        try {
          const res = await clientService.getAllClients();
          const client = res.data?.data?.find((c: Client) => c.id === Number(id));
          if (client) {
            setFormData({
              name: client.name,
              type: client.type,
              email: client.email,
              phone: client.phone || "",
              registration_number: client.registration_number || "",
              date_of_birth: client.date_of_birth || "",
              website: client.website || "",
              address: client.address || "",
              city: client.city || "",
              postcode: client.postcode || "",
              country: client.country || "Nepal",
              notes: client.notes || "",
              status: client.status ? 1 : 0,
            });
          }
        } catch (error) {
          toast.error("Failed to load client data");
        } finally {
          setIsFetching(false);
        }
      };
      loadClient();
    } else {
      setIsFetching(false);
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isEdit) {
        await clientService.updateClient(Number(id), formData);
        toast.success("Client updated successfully!");
      } else {
        await clientService.createClient(formData);
        toast.success("Client created successfully!");
      }
      router.push("/clients");
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Failed to save client";
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
          subTitle={isEdit ? "Update Client" : "Create Client"}
          breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Clients", href: "/clients" }]}
        />
        <button
          onClick={() => router.push("/clients")}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
        >
          <ArrowLeft size={16} /> Back to List
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Users size={20} className="text-green-600" /> Client Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Full Name / Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="e.g., John Doe or ABC Corp"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Client Type <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as "individual" | "corporate" })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
              >
                <option value="individual">Individual</option>
                <option value="corporate">Corporate</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="client@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="+977-98XXXXXXXX"
              />
            </div>

            {/* Dynamic Field based on Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {formData.type === 'corporate' ? 'Registration / PAN No.' : 'Date of Birth'}
              </label>
              <input
                type={formData.type === 'corporate' ? 'text' : 'date'}
                value={formData.type === 'corporate' ? formData.registration_number : formData.date_of_birth}
                onChange={(e) => {
                  if (formData.type === 'corporate') {
                    setFormData({ ...formData, registration_number: e.target.value });
                  } else {
                    setFormData({ ...formData, date_of_birth: e.target.value });
                  }
                }}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            {formData.type === 'corporate' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="https://example.com"
                />
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Full street address"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none resize-none"
                placeholder="Any additional details about the client..."
              ></textarea>
            </div>
          </div>
        </div>

    
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm h-fit space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Settings</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="e.g., Kathmandu"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Postcode / ZIP</label>
            <input
              type="text"
              value={formData.postcode}
              onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="e.g., 44600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Country</label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          <div className="pt-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Client Status</label>
            <div className="flex items-center gap-3 p-3 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800/50">
              <input
                type="checkbox"
                id="status"
                checked={formData.status === 1}
                onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 1 : 0 })}
                className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500 cursor-pointer"
              />
              <label htmlFor="status" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer flex-1">
                {formData.status === 1 ? "Active Client" : "Inactive Client"}
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {isLoading ? "Saving..." : isEdit ? "Update Client" : "Create Client"}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}