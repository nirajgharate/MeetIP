import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import { motion } from 'framer-motion';

export default function Meetip() {
  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      {/* 1. Sidebar Component (Fixed on the left) */}
      <Sidebar />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col transition-all duration-300 pl-20 lg:pl-64">
        
        {/* Dashboard Header / Top Bar (Optional but recommended for modern UI) */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/20 backdrop-blur-md sticky top-0 z-40">
          <div className="flex flex-col">
            <h2 className="text-lg font-bold tracking-tight">Dashboard Overview</h2>
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black">
              Welcome back, User
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            </div>
            <span className="text-xs font-bold text-zinc-400">System Online</span>
          </div>
        </header>

        {/* --- MAIN DISPLAY AREA --- */}
        <main className="p-8 flex-1 flex flex-col items-center justify-center relative overflow-hidden">
          
          {/* Subtle background glow to add depth to the content area */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] pointer-events-none" />

          {/* Placeholder Glassmorphism Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 p-12 rounded-[40px] bg-white/[0.02] border border-white/5 backdrop-blur-3xl text-center max-w-2xl"
          >
            <div className="mb-6 mx-auto w-20 h-20 rounded-3xl bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20">
              <div className="w-10 h-10 bg-indigo-600 rounded-2xl rotate-45 flex items-center justify-center">
                <span className="text-white font-black text-xl -rotate-45">M</span>
              </div>
            </div>
            
            <h1 className="text-4xl font-black tracking-tighter mb-4 text-white">
              Welcome to <span className="text-indigo-500">MeetIP</span> Dashboard
            </h1>
            
            <p className="text-zinc-400 text-lg leading-relaxed mb-8">
              Select a conversation from the sidebar or update your status 
              to start connecting with users in real-time.
            </p>

            <div className="flex items-center justify-center gap-3">
              <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                v1.0.4 Stable
              </span>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}