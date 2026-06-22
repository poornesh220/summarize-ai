"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Loader2, Copy, Sparkles, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ImageTab() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [length, setLength] = useState('medium');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleExtract = async () => {
    if (!file) return toast.error("Please upload an image first");
    setLoading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('length', length);

    try {
      const res = await fetch('/api/extract-image', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to talk to Vision AI");

      const data = await res.json();
      setResult(data.result);
      toast.success("Extracted & Saved to SQLite Database!");
    } catch (err: any) {
      toast.error(err.message || "Failed to process image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-white/10 rounded-3xl p-12 text-center hover:border-white/20 transition-all cursor-pointer relative bg-black/20">
        <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
        <ImageIcon className="mx-auto mb-4 text-gray-500" size={40} />
        <p className="text-gray-300 font-medium">{file ? file.name : "Drop a receipt, invoice, recipe or screenshot here"}</p>
        <p className="text-xs text-gray-600 mt-2">Supports PNG, JPG, WEBP</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <select 
          className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 outline-none text-gray-300 shadow-sm cursor-pointer" 
          value={length} 
          onChange={(e)=>setLength(e.target.value)}
        >
          <option value="short">Short Summary</option>
          <option value="medium">Medium Summary</option>
          <option value="detailed">Detailed Summary</option>
        </select>
        <button 
          onClick={handleExtract} 
          disabled={loading} 
          className="bg-white text-black px-8 py-3 font-bold rounded-xl hover:bg-gray-200 disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-lg"
        >
          {loading ? <Loader2 className="animate-spin" /> : <><Sparkles size={18}/> Analyze Image</>}
        </button>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-white/5 rounded-2xl border border-white/10 shadow-xl space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2 text-white">
              <Sparkles className="text-yellow-400" size={18}/> Structured AI Output
            </h3>
            <button onClick={() => {navigator.clipboard.writeText(result); toast.success("Copied!");}} className="p-2 hover:bg-white/10 rounded-lg text-gray-400"><Copy size={16}/></button>
          </div>
          <div className="text-gray-300 text-sm leading-relaxed font-mono bg-black/40 p-4 rounded-xl border border-white/5 whitespace-pre-wrap">
            {result}
          </div>
        </motion.div>
      )}
    </div>
  );
}