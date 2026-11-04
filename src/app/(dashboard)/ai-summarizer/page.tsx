"use client";
import { useState } from "react";
import { documentService } from "@/services/documentService";
import { Sparkles, Loader2, Copy, Check, FileText } from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function AiSummarizerPage() {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState<"ne" | "en">("ne");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSummarize = async () => {
    if (text.trim().length < 50) {
      toast.error("Please enter at least 50 characters of legal text.");
      return;
    }

    setIsLoading(true);
    setSummary("");
    
    try {
      const res = await documentService.summarizeText(text, language);

      if (res.success && res.data) {
        setSummary(res.data.summary);
        toast.success("Summary generated successfully!");
      } else {
        toast.error(res.message || "Failed to generate summary");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        title="Dashboard"
        subTitle="AI Document Summarizer"
        breadcrumbItems={[{ label: "Home", href: "/" }, { label: "AI Tools" }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
     
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm flex flex-col h-[600px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <FileText size={20} className="text-blue-600" /> Input Legal Text
            </h2>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as "ne" | "en")}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ne">नेपाली (Nepali)</option>
              <option value="en">English</option>
            </select>
          </div>
          
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste legal document text here (e.g., FIR, Court Order, Contract)..."
            className="flex-1 w-full p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 text-gray-800 dark:text-gray-200 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm leading-relaxed"
          />
          
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {text.length} / 10000 characters
            </span>
            <button
              onClick={handleSummarize}
              disabled={isLoading || text.length < 50}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate Summary
                </>
              )}
            </button>
          </div>
        </div>

     
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm flex flex-col h-[600px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <Sparkles size={20} className="text-amber-500" /> AI Summary
            </h2>
            {summary && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            )}
          </div>

          <div className="flex-1 w-full p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 overflow-y-auto">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 space-y-3">
                <Loader2 size={32} className="animate-spin text-blue-600" />
                <p className="text-sm animate-pulse">AI is reading and analyzing the legal text...</p>
              </div>
            ) : summary ? (
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
                {summary}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 space-y-3">
                <Sparkles size={40} className="opacity-20" />
                <p className="text-sm text-center">
                  Your AI-generated summary will appear here.<br/>
                  <span className="text-xs opacity-70">Paste text on the left and click "Generate Summary"</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}