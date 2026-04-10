import React, { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings as SettingsIcon, Shield, Bell, Eye, 
  Database, Globe, Lock, Smartphone, ChevronRight,
  User, Check, AlertTriangle, Moon, Palette, Cpu,
  Search, Mail, Fingerprint, Languages, Zap, HardDrive
} from 'lucide-react';

export default function Settings() {
  const [activeCategory, setActiveCategory] = useState('Account');
  const [searchQuery, setSearchQuery] = useState("");

  // Category Configuration
  const categories = [
    { id: 'Account', icon: <User size={18} />, desc: 'Identity & Access' },
    { id: 'Security', icon: <Shield size={18} />, desc: 'Encryption & Safety' },
    { id: 'Appearance', icon: <Palette size={18} />, desc: 'UI & Theme' },
    { id: 'Network', icon: <Zap size={18} />, desc: 'Node Connectivity' }
  ];

  // Helper Component for Setting Rows
  const SettingRow = ({ icon, title, desc, action, danger }) => (
    <div className={`p-6 rounded-[32px] bg-white/[0.02] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/[0.04] transition-all group ${danger ? 'hover:border-red-500/30' : 'hover:border-indigo-500/30'}`}>
      <div className="flex items-start md:items-center gap-5">
        <div className={`p-4 rounded-2xl shrink-0 border transition-transform group-hover:scale-110 ${danger ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
          {icon}
        </div>
        <div>
          <p className={`text-sm font-black tracking-tight ${danger ? 'text-red-200' : 'text-zinc-100'}`}>{title}</p>
          <p className="text-[11px] text-zinc-500 font-bold leading-relaxed mt-1 max-w-md">{desc}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {action}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden selection:bg-indigo-500/30">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent">
        
        {/* TOP HEADER */}
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-10 bg-black/40 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-transparent border border-indigo-500/20 flex items-center justify-center text-indigo-500 shadow-2xl">
              <SettingsIcon size={24} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tighter">NODE_SETTINGS</h1>
              <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.3em]">Protocol Configuration v2.0</p>
            </div>
          </div>

          <div className="relative group hidden sm:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Filter settings..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none w-72 transition-all"
            />
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          
          {/* CATEGORY SUB-SIDEBAR */}
          <aside className="w-80 border-r border-white/5 bg-[#070707]/50 p-8 space-y-3 hidden lg:block overflow-y-auto">
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-6 px-4">System Domains</p>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full flex items-center gap-4 p-5 rounded-[24px] transition-all group ${
                  activeCategory === cat.id 
                  ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/20' 
                  : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-200'
                }`}
              >
                <div className={`${activeCategory === cat.id ? 'text-white' : 'text-zinc-600 group-hover:text-indigo-400'}`}>
                  {cat.icon}
                </div>
                <div className="text-left">
                  <p className="text-xs font-black uppercase tracking-wider">{cat.id}</p>
                  <p className={`text-[9px] font-bold mt-0.5 ${activeCategory === cat.id ? 'text-indigo-200' : 'text-zinc-700'}`}>
                    {cat.desc}
                  </p>
                </div>
                <ChevronRight size={14} className={`ml-auto transition-transform ${activeCategory === cat.id ? 'translate-x-1 opacity-100' : 'opacity-0'}`} />
              </button>
            ))}
            
            <div className="mt-12 p-6 rounded-3xl bg-indigo-600/5 border border-indigo-500/10">
               <div className="flex items-center gap-2 mb-2">
                 <HardDrive size={14} className="text-indigo-500" />
                 <span className="text-[10px] font-black text-indigo-200 uppercase">Cloud Storage</span>
               </div>
               <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                 <div className="w-[65%] h-full bg-indigo-500" />
               </div>
               <p className="text-[9px] text-zinc-600 font-bold mt-2 uppercase tracking-tighter">6.5GB of 10GB Used</p>
            </div>
          </aside>

          {/* DYNAMIC SETTINGS PANEL */}
          <main className="flex-1 overflow-y-auto p-8 md:p-12 lg:p-16 scroll-smooth">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-4xl space-y-12"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-4xl font-black tracking-tighter">{activeCategory}</h2>
                    <p className="text-zinc-500 text-sm font-medium">Manage the parameters for your {activeCategory.toLowerCase()} cluster.</p>
                  </div>
                </div>

                {/* --- RENDER LOGIC BASED ON CATEGORY --- */}
                <div className="grid gap-4">
                  {activeCategory === 'Account' && (
                    <>
                      <SettingRow 
                        icon={<Mail size={20} />}
                        title="Primary Contact Email"
                        desc="Used for security alerts and node recovery procedures."
                        action={<button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase hover:bg-white/10">Update</button>}
                      />
                      <SettingRow 
                        icon={<Smartphone size={20} />}
                        title="Mobile Device Link"
                        desc="Sync your node identity with the MeetIP mobile application."
                        action={<div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase">Linked</div>}
                      />
                      <SettingRow 
                        icon={<AlertTriangle size={20} />}
                        danger
                        title="Delete Entire Node"
                        desc="Permanently wipe all logs, media, and encryption keys. This is irreversible."
                        action={<button className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-red-600/20 hover:bg-red-500">Deactivate</button>}
                      />
                    </>
                  )}

                  {activeCategory === 'Security' && (
                    <>
                      <SettingRow 
                        icon={<Fingerprint size={20} />}
                        title="Biometric Access Control"
                        desc="Require fingerprint or facial scan to unlock the dashboard on compatible devices."
                        action={
                          <div className="w-12 h-6 bg-indigo-600 rounded-full flex items-center px-1 cursor-pointer">
                            <div className="w-4 h-4 bg-white rounded-full translate-x-6" />
                          </div>
                        }
                      />
                      <SettingRow 
                        icon={<Eye size={20} />}
                        title="Stealth Mode"
                        desc="Hide your 'Online' status and read receipts from all other nodes."
                        action={
                          <div className="w-12 h-6 bg-zinc-800 rounded-full flex items-center px-1 cursor-pointer">
                            <div className="w-4 h-4 bg-zinc-500 rounded-full" />
                          </div>
                        }
                      />
                    </>
                  )}

                  {activeCategory === 'Appearance' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      {['Void Black', 'Nebula Indigo', 'Slate Gray', 'Matrix'].map((theme) => (
                        <button key={theme} className="p-1 rounded-[32px] bg-gradient-to-br from-white/10 to-transparent hover:from-indigo-500/40 transition-all">
                          <div className="bg-[#0D0D0D] p-6 rounded-[31px] text-left">
                            <div className="h-32 rounded-2xl bg-zinc-900 mb-4 border border-white/5 overflow-hidden flex">
                               <div className="w-1/4 h-full bg-indigo-600/20 border-r border-white/5" />
                               <div className="flex-1 p-3 space-y-2">
                                  <div className="w-full h-2 bg-white/5 rounded-full" />
                                  <div className="w-2/3 h-2 bg-white/5 rounded-full" />
                               </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{theme}</p>
                              {theme === 'Nebula Indigo' && <Check size={14} className="text-indigo-500" />}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}