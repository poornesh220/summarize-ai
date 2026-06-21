"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PDFTab from '@/components/tabs/PDFTab';
import TextTab from '@/components/tabs/TextTab';
import VoiceTab from '@/components/tabs/VoiceTab';

export default function Home() {
  const [activeTab, setActiveTab] = useState('pdf');

  const tabs = [
    { id: 'pdf', label: 'PDF Summary' },
    { id: 'text', label: 'Text Summary' },
    { id: 'voice', label: 'Voice Summary' },
  ];

  return (
    <div className="flex flex-col items-center">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-bold mb-4 tracking-tight">Understand Any Content Instantly</h1>
        <p className="text-gray-400 text-lg">Upload PDFs, voice notes, or text and get AI-generated summaries in seconds.</p>
      </motion.div>

      <div className="w-full max-w-3xl bg-[#161616] border border-white/10 rounded-3xl p-2 shadow-2xl">
        <div className="flex space-x-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-sm font-medium rounded-2xl transition-all duration-200 ${
                activeTab === tab.id ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          <AnimatePresence mode="wait">
            {activeTab === 'pdf' && <PDFTab key="pdf" />}
            {activeTab === 'text' && <TextTab key="text" />}
            {activeTab === 'voice' && <VoiceTab key="voice" />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}