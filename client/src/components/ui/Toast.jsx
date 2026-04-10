import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';

export default function Toast({ notification, onClose }) {
  if (!notification) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className="fixed top-6 right-6 z-[100] w-72 bg-[#0d0d0d]/90 backdrop-blur-xl border border-indigo-500/30 rounded-2xl shadow-[0_0_30px_rgba(79,70,229,0.2)] p-4 flex items-start gap-4"
    >
      <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
        <Bell size={18} />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-0.5">
          New Incoming Node
        </p>
        <p className="text-sm font-bold text-white truncate">
          {notification.message?.sender?.username || "Unknown Sender"}
        </p>
        <p className="text-xs text-zinc-500 truncate mt-1">
          {notification.message?.text || "Sent a file..."}
        </p>
      </div>

      <button 
        onClick={onClose}
        className="text-zinc-600 hover:text-white transition-colors"
      >
        <X size={16} />
      </button>
      
      {/* Progress Bar (Auto-dismiss visual) */}
      <motion.div 
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: 4, ease: "linear" }}
        className="absolute bottom-0 left-0 h-[2px] bg-indigo-500/50 rounded-full"
      />
    </motion.div>
  );
}