"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Loader2, Download, Copy, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PDFTab() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [length, setLength] = useState('medium');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        return toast.error("Please upload a valid PDF file");
      }
      setFile(selectedFile);
    }
  };

  const handleSummarize = async () => {
    if (!file) return toast.error("Please upload a PDF first");
    setLoading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('length', length);

    try {
      const res = await fetch('/api/summarize-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setSummary(data.summary);
      toast.success("PDF Summarized!");
    } catch (err: any) {
      toast.error(err.message || "Failed to process PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-white/10 rounded-3xl p-12 text-center hover:border-white/20 transition-all cursor-pointer relative bg-black/20">
        <input type="file" accept=".pdf" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
        <Upload className="mx-auto mb-4 text-gray-500" size={40} />
        <p className="text-gray-300 font-medium">{file ? file.name : "Drop PDF here or click to upload"}</p>
        <p className="text-xs text-gray-600 mt-2">Maximum size: 50 MB</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <select 
          className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 outline-none text-gray-300" 
          value={length} 
          onChange={(e)=>setLength(e.target.value)}
        >
          <option value="short">Short Summary</option>
          <option value="medium">Medium Summary</option>
          <option value="detailed">Detailed Summary</option>
        </select>
        <button 
          onClick={handleSummarize} 
          disabled={loading} 
          className="bg-white text-black px-8 py-3 font-bold rounded-xl hover:bg-gray-200 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : <><Sparkles size={18}/> Generate</>}
        </button>
      </div>

      {summary && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-white/5 rounded-2xl border border-white/10 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold flex items-center gap-2 text-white"><FileText size={18} className="text-blue-400"/> Summary</h3>
            <div className="flex gap-2">
              <button onClick={() => {navigator.clipboard.writeText(summary); toast.success("Copied!");}} className="p-2 hover:bg-white/10 rounded-lg text-gray-400"><Copy size={18}/></button>
            </div>
          </div>
          <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{summary}</div>
        </motion.div>
      )}
    </div>
  );
}