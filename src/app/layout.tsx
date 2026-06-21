import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Navbar from '../components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0b0b0b] text-gray-100 min-h-screen`}>
        <Toaster position="bottom-right" />
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 py-12">
          {children}
        </main>
      </body>
    </html>
  );
}