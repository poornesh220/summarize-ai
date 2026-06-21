import Link from 'next/link';
import { Moon } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="border-b border-white/5 bg-[#0b0b0b]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tighter">SummarizeAI</Link>
        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
          <Link href="/" className="hover:text-white">Home</Link>
          <Link href="/about" className="hover:text-white">About</Link>
          <Link href="/contact" className="hover:text-white">Contact</Link>
        </div>
        <button className="p-2 rounded-full hover:bg-white/5 transition-colors">
          <Moon size={20} />
        </button>
      </div>
    </nav>
  );
}