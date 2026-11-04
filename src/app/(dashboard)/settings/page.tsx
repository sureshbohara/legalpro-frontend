"use client";
import { useState, useEffect, ChangeEvent } from "react";
import { settingService } from "@/services/settingService";
import { Setting } from "@/types";
import { Save, Loader2, Upload, Image as ImageIcon, Mail, Globe, Key } from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await settingService.getSettings();
      if (res.success && res.data) {
        setSettings(res.data);
        setLogoPreview(res.data.logo_url);
        setFaviconPreview(res.data.favicon_url);
      }
    } catch (error) {
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setSettings((prev) => (prev ? {
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    } : null));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, field: 'logo' | 'favicon') => {
    const file = e.target.files?.[0];
    if (file) {
      setSettings((prev) => prev ? { ...prev, [field]: file as any } : null);
      const previewUrl = URL.createObjectURL(file);
      if (field === 'logo') setLogoPreview(previewUrl);
      else setFaviconPreview(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSaving(true);
    const formData = new FormData();


    Object.entries(settings).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {

        if (key === 'logo_url' || key === 'favicon_url') return;
        
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });

    try {
      const res = await settingService.updateSettings(formData);
      if (res.success) {
        toast.success("Settings updated successfully!");
        loadSettings(); 
      } else {
        toast.error(res.message || "Failed to update settings");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Network error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-green-600" size={40} />
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="space-y-6">
      <Breadcrumb title="Dashboard" subTitle="Settings" breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Settings" }]} />

      <form onSubmit={handleSubmit} className="space-y-6">
        
      
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Globe size={20} className="text-green-600" /> General Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">System Name</label>
              <input name="system_name" value={settings.system_name || ''} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Email</label>
              <input name="email" type="email" value={settings.email || ''} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Phone</label>
              <input name="phone" value={settings.phone || ''} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
              <input name="address" value={settings.address || ''} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Opening Hours</label>
              <input name="opening_hr" value={settings.opening_hr || ''} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Work Hours Description</label>
              <input name="work_hours" value={settings.work_hours || ''} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
        </div>

       
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <ImageIcon size={20} className="text-green-600" /> Branding
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Logo</label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 border border-gray-300 dark:border-slate-700 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-slate-800 overflow-hidden">
                  {logoPreview ? <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" /> : <ImageIcon size={32} className="text-gray-400" />}
                </div>
                <label className="cursor-pointer px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium flex items-center gap-2">
                  <Upload size={16} /> Choose File
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} className="hidden" />
                </label>
              </div>
            </div>
   
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Favicon</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 border border-gray-300 dark:border-slate-700 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-slate-800 overflow-hidden">
                  {faviconPreview ? <img src={faviconPreview} alt="Favicon" className="w-full h-full object-contain" /> : <ImageIcon size={24} className="text-gray-400" />}
                </div>
                <label className="cursor-pointer px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium flex items-center gap-2">
                  <Upload size={16} /> Choose File
                  <input type="file" accept="image/*,.ico" onChange={(e) => handleFileChange(e, 'favicon')} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        </div>

       
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Globe size={20} className="text-green-600" /> Social Media
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['facebook', 'twitter', 'linkedin', 'instagram', 'youtube'].map((social) => (
              <div key={social}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">{social} URL</label>
                <input name={social} type="url" value={(settings as any)[social] || ''} onChange={handleChange} placeholder={`https://${social}.com/...`} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            ))}
          </div>
        </div>

  
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Mail size={20} className="text-green-600" /> SMTP / Mail Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mail Host</label>
              <input name="mail_host" value={settings.mail_host || ''} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mail Port</label>
              <input name="mail_port" type="number" value={settings.mail_port || ''} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mail Username</label>
              <input name="mail_username" value={settings.mail_username || ''} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mail Password</label>
              <input name="mail_password" type="password" value={settings.mail_password === '********' ? '' : (settings.mail_password || '')} onChange={handleChange} placeholder="Leave blank to keep current" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mail From Address</label>
              <input name="mail_from" type="email" value={settings.mail_from || ''} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mail From Name</label>
              <input name="mail_from_name" value={settings.mail_from_name || ''} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input name="smtp_check" type="checkbox" checked={Boolean(settings.smtp_check)} onChange={handleChange} className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable SMTP Check</label>
            </div>
          </div>
        </div>

     
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Key size={20} className="text-green-600" /> API Settings
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">OpenAI API Key</label>
            <input name="open_api_key" type="password" value={settings.open_api_key || ''} onChange={handleChange} placeholder="sk-..." className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-green-500" />
            <p className="text-xs text-gray-500 mt-1">Used for AI Document Summarizer and other AI features.</p>
          </div>
        </div>


        <div className="flex justify-end pt-4 pb-8">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
        </div>

      </form>
    </div>
  );
}