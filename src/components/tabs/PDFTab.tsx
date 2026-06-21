"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Loader2, Download, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PDFTab() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [length, setLength] = useState('medium');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSummarize = async () => {
    if (!file) return toast.error("Please upload a PDF");
    setLoading(true);
    
    // In a real app, you'd send the file to your /api/summarize-pdf route
    // For now, we will simulate the process for the build to pass
    setTimeout(() => {
      setSummary("This is a placeholder summary. To fully enable PDF parsing, you need to configure the PDF-parse library in your API route.");
      setLoading(false);
      toast.success("PDF Processed!");
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-white/10 rounded-3xl p-12 text-center hover:border-white/20 transition-colors cursor-pointer relative">
        <input type="file" accept=".pdf" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
        <Upload className="mx-auto mb-4 text-gray-500" size={40} />
        <p className="text-gray-400">{file ? file.name : "Drop PDF here or click to upload"}</p>
        <p className="text-xs text-gray-600 mt-2">Maximum size: 50 MB</p>
      </div>

      <div className="flex gap-4">
        <select className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 outline-none" value={length} onChange={(e)=>setLength(e.target.value)}>
          <option value="short">Short Summary</option>
          <option value="medium">Medium Summary</option>
          <option value="detailed">Detailed Summary</option>
        </select>
        <button onClick={handleSummarize} disabled={loading} className="bg-white text-black px-8 font-bold rounded-xl hover:bg-gray-200 disabled:opacity-50">
          {loading ? <Loader2 className="animate-spin" /> : "Generate"}
        </button>
      </div>

      {summary && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 bg-white/5 rounded-2xl border border-white/10">
          <div className="flex justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2"><FileText size={18}/> Summary</h3>
            <div className="flex gap-2">
              <button onClick={() => {navigator.clipboard.writeText(summary); toast.success("Copied!");}} className="p-2 hover:bg-white/10 rounded-lg"><Copy size={16}/></button>
              <button className="p-2 hover:bg-white/10 rounded-lg"><Download size={16}/></button>
            </div>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">{summary}</p>
        </motion.div>
      )}
    </div>
  );
}