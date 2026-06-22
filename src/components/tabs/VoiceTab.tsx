"use client";
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, Loader2, Copy, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VoiceTab() {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState({ transcript: '', summary: '' });
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        handleProcessAudio(audioBlob);
      };

      mediaRecorder.start();
      setRecording(true);
      toast.success("Recording started...");
    } catch (err) {
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleProcessAudio = async (blob: Blob) => {
    setLoading(true);
    try {
      // 1. Transcribe
      const formData = new FormData();
      formData.append('file', blob, 'recording.wav');

      const transRes = await fetch('/api/transcribe', { method: 'POST', body: formData });
      const transData = await transRes.json();
      if (transData.error) throw new Error(transData.error);

      // 2. Summarize the resulting text
      const sumRes = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transData.text, length: 'medium' }),
      });
      const sumData = await sumRes.json();

      setResult({ transcript: transData.text, summary: sumData.summary });
      toast.success("Voice note summarized!");
    } catch (err: any) {
      toast.error("Failed to process audio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-center">
      <div className="py-10 flex flex-col items-center">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={recording ? stopRecording : startRecording}
          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl ${
            recording ? 'bg-red-500 animate-pulse' : 'bg-white text-black hover:bg-gray-200'
          }`}
        >
          {recording ? <Square size={32} fill="white" /> : <Mic size={32} />}
        </motion.button>
        <p className="mt-6 text-gray-400 font-medium">
          {recording ? "Recording... Click to stop" : "Click to start recording voice note"}
        </p>
      </div>

      {loading && (
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 className="animate-spin" size={30} />
          <p className="text-sm animate-pulse">Transcribing & Summarizing...</p>
        </div>
      )}

      {result.summary && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-left space-y-4">
          <div className="p-4 bg-black/20 border border-white/5 rounded-2xl">
            <h4 className="text-[10px] font-bold uppercase text-gray-500 mb-2 tracking-widest">Transcript</h4>
            <p className="text-sm text-gray-400 leading-relaxed italic">"{result.transcript}"</p>
          </div>
          
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3">
               <Sparkles size={16} className="text-yellow-500/50" />
            </div>
            <h4 className="text-[10px] font-bold uppercase text-gray-500 mb-3 tracking-widest">AI Summary</h4>
            <p className="text-gray-200 leading-relaxed">{result.summary}</p>
            <button 
              onClick={() => {navigator.clipboard.writeText(result.summary); toast.success("Copied!");}}
              className="mt-4 flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors"
            >
              <Copy size={14} /> Copy Summary
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}