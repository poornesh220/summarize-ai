import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Trash2, Loader2, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TextTab() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [length, setLength] = useState('medium');

  const handleSummarize = async () => {
    if (!text) return toast.error("Please paste some text first");
    setLoading(true);
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        body: JSON.stringify({ text, length }),
      });
      const data = await res.json();
      setResult(data.summary);
      toast.success("Summary generated!");
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const wordCount = result.split(/\s+/).filter(Boolean).length;
  const readTime = Math.ceil(wordCount / 200);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="relative">
        <textarea
          className="w-full h-64 bg-black/40 border border-white/10 rounded-2xl p-6 focus:ring-2 focus:ring-white/20 outline-none resize-none transition-all"
          placeholder="Paste any paragraph, article, or research paper here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={100000}
        />
        <div className="absolute bottom-4 right-4 text-xs text-gray-500">
          {text.length.toLocaleString()} / 100,000 chars
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <select 
          className="w-full sm:w-48 bg-black/40 border border-white/10 rounded-xl p-3 outline-none"
          value={length}
          onChange={(e) => setLength(e.target.value)}
        >
          <option value="short">Short Summary</option>
          <option value="medium">Medium Summary</option>
          <option value="detailed">Detailed Summary</option>
        </select>
        
        <button 
          onClick={handleSummarize}
          disabled={loading}
          className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : 'Generate Summary'}
        </button>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 border-t border-white/10 pt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Summary</h3>
            <div className="flex gap-2">
              <button onClick={() => { navigator.clipboard.writeText(result); toast.success("Copied!"); }} className="p-2 hover:bg-white/5 rounded-lg"><Copy size={18} /></button>
              <button onClick={() => { setResult(''); setText(''); }} className="p-2 hover:bg-white/5 rounded-lg text-red-400"><Trash2 size={18} /></button>
            </div>
          </div>
          <div className="bg-black/20 border border-white/5 rounded-2xl p-6 text-gray-300 leading-relaxed max-h-96 overflow-y-auto">
            {result}
          </div>
          <div className="mt-4 flex gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><BookOpen size={14}/> {wordCount} words</span>
            <span>~{readTime} min read</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}