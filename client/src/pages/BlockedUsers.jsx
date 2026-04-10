import React, { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, UserCheck, Search, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BlockedUsers() {
  const [blockedList, setBlockedList] = useState([
    { id: 101, name: "SpamBot_01", reason: "Spamming", date: "2026-03-01" },
    { id: 102, name: "Unknown User", reason: "Harassment", date: "2026-02-15" },
    { id: 103, name: "MaliciousLinker", reason: "Phishing", date: "2026-01-20" },
  ]);

  const handleUnblock = (id) => {
    setBlockedList(prev => prev.filter(user => user.id !== id));
  };

  return (
    <div className="flex h-screen bg-[#050505] text-white">
      <Sidebar />
      
      <main className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-[#080808] to-[#050505]">
        {/* Header */}
        <header className="h-20 px-8 border-b border-white/5 flex items-center justify-between backdrop-blur-md bg-black/20">
          <div className="flex items-center gap-4">
            <Link to="/settings" className="p-2 hover:bg-white/5 rounded-xl text-zinc-500 hover:text-white transition-all">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Privacy & Security</h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Blocked Terminals</p>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto w-full p-8">
          <div className="mb-8 p-6 rounded-[32px] bg-red-500/5 border border-red-500/10 flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-500 shadow-lg shadow-red-500/10">
              <ShieldAlert size={28} />
            </div>
            <div>
              <h2 className="font-bold text-white">Restricted Access</h2>
              <p className="text-sm text-zinc-500">Users in this list cannot message you or view your online status.</p>
            </div>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {blockedList.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/10 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center font-bold text-zinc-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      {user.name[0]}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-200">{user.name}</h3>
                      <p className="text-[10px] text-zinc-600 uppercase tracking-tighter">Blocked on {user.date} • {user.reason}</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleUnblock(user.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-emerald-500/10 text-zinc-400 hover:text-emerald-500 rounded-xl text-xs font-bold transition-all border border-transparent hover:border-emerald-500/20"
                  >
                    <UserCheck size={14} />
                    Unblock
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {blockedList.length === 0 && (
              <div className="text-center py-20 opacity-20">
                <Search size={48} className="mx-auto mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest">No blocked users found</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}