"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Trash2, Loader2, BookOpen, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TextTab() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [length, setLength] = useState('medium');

  const handleSummarize = async () => {
    // 1. Basic Validation
    if (!text.trim()) {
      return toast.error("Please paste some text first");
    }

    setLoading(true);

    try {
      // 2. The API Call
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: text, 
          length: length 
        }),
      });

      // 3. Check for Errors
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Server error: ${res.status}`);
      }

      const data = await res.json();
      
      // 4. Update Result
      setResult(data.summary);
      toast.success("Summary generated!");

    } catch (err: any) {
      console.error("Summarize Error:", err);
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setText('');
    setResult('');
    toast.success("Cleared!");
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    toast.success("Copied to clipboard!");
  };

  // Logic for Word Count and Reading Time
  const wordCount = result ? result.split(/\s+/).filter(Boolean).length : 0;
  const readTime = Math.ceil(wordCount / 200) || 1;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-6"
    >
      {/* Input Area */}
      <div className="relative">
        <textarea
          className="w-full h-64 bg-black/40 border border-white/10 rounded-2xl p-6 text-gray-200 focus:ring-2 focus:ring-white/20 outline-none resize-none transition-all placeholder:text-gray-600"
          placeholder="Paste any paragraph, article, notes, research paper or text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={100000}
        />
        <div className="absolute bottom-4 right-4 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
          {text.length.toLocaleString()} / 100,000 Characters
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <select 
          className="w-full sm:w-48 bg-black/60 border border-white/10 rounded-xl p-3 text-sm text-gray-300 outline-none focus:border-white/30 transition-colors cursor-pointer"
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
          className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg active:scale-[0.98]"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>AI is thinking...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Generate Summary</span>
            </>
          )}
        </button>
      </div>

      {/* Results Section */}
      {result && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="mt-8 border-t border-white/10 pt-8"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="text-yellow-400" size={20} /> 
              AI Summary
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={copyToClipboard}
                title="Copy Summary"
                className="p-2.5 hover:bg-white/10 rounded-xl border border-white/5 transition-colors text-gray-400 hover:text-white"
              >
                <Copy size={18} />
              </button>
              <button 
                onClick={clearAll}
                title="Clear Everything"
                className="p-2.5 hover:bg-white/10 rounded-xl border border-white/5 transition-colors text-red-400/70 hover:text-red-400"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-b from-white/[0.03] to-transparent border border-white/10 rounded-2xl p-6 text-gray-300 leading-relaxed max-h-[500px] overflow-y-auto shadow-inner">
            {result}
          </div>

          {/* Stats Bar */}
          <div className="mt-4 flex gap-6 text-[11px] font-bold uppercase tracking-wider text-gray-500">
            <span className="flex items-center gap-1.5">
              <BookOpen size={14} className="text-gray-600"/> 
              {wordCount} Words
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
              ~{readTime} Min Read
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}