"use client";
import { useState, useEffect } from "react";
import { documentTemplateService } from "@/services/documentTemplateService";
import { clientService } from "@/services/clientService";
import { caseService } from "@/services/caseService";
import { DocumentTemplate, Client, CaseModel } from "@/types";
import { FileText, Copy, Loader2, X, Check } from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function DocumentTemplatesPage() {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [cases, setCases] = useState<CaseModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [filledContent, setFilledContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tempRes, clientRes, caseRes] = await Promise.all([
          documentTemplateService.getAll(),
          clientService.getAllClients(),
          caseService.getAll({ page: 1 }),
        ]);
        if (tempRes.success) setTemplates(tempRes.data || []);
        if (clientRes.success) setClients((clientRes.data as any)?.data || []);
        if (caseRes.success) setCases((caseRes.data as any)?.data || []);
      } catch (error) {
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleGenerate = async () => {
    if (!selectedTemplate || !selectedClientId) {
      toast.error("Please select a client");
      return;
    }

    setIsGenerating(true);
    setFilledContent("");
    try {
      const res = await documentTemplateService.fillTemplate(
        selectedTemplate.id,
        Number(selectedClientId),
        selectedCaseId ? Number(selectedCaseId) : undefined
      );
      
      if (res.success && res.data) {
        setFilledContent(res.data.filled_content);
        toast.success("Document filled successfully!");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to generate document");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(filledContent);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-green-600" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Breadcrumb title="Dashboard" subTitle="Document Templates" breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Templates" }]} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <FileText size={24} className="text-green-600" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 rounded-full capitalize">
                {template.category}
              </span>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{template.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
              {template.description || "No description provided."}
            </p>

             <div className="flex flex-wrap gap-1 mb-4">
              {(template.variables || []).slice(0, 3).map((v: string, i: number) => (
                <span key={i} className="text-[10px] px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded">
                  {`{{${v}}}`}
                </span>
              ))}
              {(template.variables || []).length > 3 && (
                <span className="text-[10px] px-2 py-0.5 text-gray-500">
                  +{(template.variables || []).length - 3} more
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setSelectedTemplate(template);
                setShowModal(true);
                setFilledContent("");
                setSelectedClientId("");
                setSelectedCaseId("");
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Generate Document
            </button>
          </div>
        ))}
      </div>

 
      {showModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            
      
            <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Generate: {selectedTemplate.name}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>

         
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              
            
              <div className="lg:col-span-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Select Client *</label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">-- Choose Client --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Select Case (Optional)</label>
                  <select
                    value={selectedCaseId}
                    onChange={(e) => setSelectedCaseId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">-- General (No Case) --</option>
                    {cases.map((c) => (
                      <option key={c.id} value={c.id}>{c.case_number} - {c.title}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !selectedClientId}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
                >
                  {isGenerating ? <Loader2 size={18} className="animate-spin" /> : "Preview Document"}
                </button>
              </div>

           
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Preview</label>
                  {filledContent && (
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-green-600 transition-colors"
                    >
                      {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                      {copied ? "Copied!" : "Copy Text"}
                    </button>
                  )}
                </div>
                <textarea
                  readOnly
                  value={filledContent || "Filled document will appear here..."}
                  className="w-full h-[400px] p-4 rounded-lg border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 text-gray-800 dark:text-gray-200 text-sm font-mono leading-relaxed resize-none focus:outline-none"
                />
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}