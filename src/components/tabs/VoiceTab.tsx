"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Play, Loader2, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VoiceTab() {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState({ transcript: '', summary: '' });

  const toggleRecording = () => {
    setRecording(!recording);
    if (!recording) {
      toast.success("Recording started...");
    } else {
      toast("Processing audio...", { icon: '⏳' });
      handleVoiceSubmit();
    }
  };

  const handleVoiceSubmit = () => {
    setLoading(true);
    // Simulate Whisper API transcription and GPT summary
    setTimeout(() => {
      setResult({
        transcript: "The user spoke about the importance of AI in 2024...",
        summary: "This is a summary of your voice note."
      });
      setLoading(false);
    }, 3000);
  };

  return (
    <div className="space-y-6 text-center">
      <div className="py-10">
        <button 
          onClick={toggleRecording}
          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${recording ? 'bg-red-500 animate-pulse' : 'bg-white text-black hover:scale-105'}`}
        >
          {recording ? <div className="w-6 h-6 bg-white rounded-sm" /> : <Mic size={32} />}
        </button>
        <p className="mt-4 text-gray-400">{recording ? "Recording... Click to stop" : "Click to start recording voice note"}</p>
      </div>

      {loading && <div className="flex items-center justify-center gap-2 text-gray-400"><Loader2 className="animate-spin" /> Transcribing Audio...</div>}

      {result.summary && (
        <div className="text-left space-y-4">
          <div className="p-4 bg-black/20 border border-white/5 rounded-xl">
            <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Transcript</h4>
            <p className="text-sm text-gray-400">{result.transcript}</p>
          </div>
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
            <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">AI Summary</h4>
            <p className="text-gray-200">{result.summary}</p>
          </div>
        </div>
      )}
    </div>
  );
}