"use client"
import React, { useEffect } from 'react';
import { Wallet, Settings, Search, PlusCircle, Activity } from 'lucide-react';
import Link from 'next/link';
import { syncOfflineRequests } from '@/services/api';

export default function Shell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleOnline = () => {
      syncOfflineRequests();
    };
    window.addEventListener('online', handleOnline);
    if (navigator.onLine) {
      syncOfflineRequests();
    }
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
      {/* Sidebar for Desktop */}
      <aside className="hidden w-64 bg-white border-r border-slate-200 shadow-sm md:flex flex-col relative z-20">
        <div className="flex items-center gap-3 p-6 border-b border-slate-100">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-sm">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">ExpenseTracker</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/" className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-indigo-50 text-indigo-700 font-semibold transition-colors hover:bg-indigo-100">
            <Activity className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          {/* Add more links if needed */}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-white/80 backdrop-blur-md border-b border-slate-200 md:hidden sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-md">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">ExpenseTracker</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10 scroll-smooth">
          <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
