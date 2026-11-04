"use client";
import { useState, useEffect } from "react";
import { clientPortalService } from "@/services/clientPortalService";
import { FileText, Loader2, Download } from "lucide-react";
import toast from "react-hot-toast";

export default function ClientDocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await clientPortalService.getDocuments();
        setDocuments(res.data || []);
      } catch (error) {
        console.error("Failed to fetch documents", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  const handleDownload = async (docId: number, fileName: string) => {
    try {
      const res = await clientPortalService.downloadDocument(docId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download failed", error);
      toast.error("Failed to download document");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FileText className="text-green-600" size={28} /> My Documents
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Access your case-related files and evidence.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-green-600" size={32} />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <FileText size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No documents found.</p>
            <p className="text-sm mt-1">Your lawyer hasn't uploaded any documents for you yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {documents.map((doc) => (
              <div key={doc.id} className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:shadow-md transition-shadow bg-gray-50 dark:bg-slate-800/50">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600">
                    <FileText size={20} />
                  </div>
                  <button 
                    onClick={() => handleDownload(doc.id, doc.file_name)}
                    className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download size={16} />
                  </button>
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white truncate mb-1" title={doc.name}>{doc.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{doc.description || 'No description provided.'}</p>
                <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-200 dark:border-slate-700">
                  <span>{doc.file_size_human}</span>
                  <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}