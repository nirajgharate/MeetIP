import React from 'react';
import { motion } from 'framer-motion';
import { Check, CheckCheck, FileText, File, ExternalLink } from 'lucide-react'; // Added icons for files

export default function MessageBubble({ message, isOwn, time, status, file, fileType }) {
  // Base URL for your server (Adjust if your backend uses a specific URL)
  const serverUrl = "http://localhost:5000"; 

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}
    >
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[75%]`}>
        {/* The Message Bubble */}
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-lg overflow-hidden
            ${isOwn 
              ? 'bg-indigo-600 text-white rounded-tr-none' 
              : 'bg-white/[0.04] border border-white/10 text-zinc-200 rounded-tl-none backdrop-blur-md'
            }
          `}
        >
          {/* ✅ STEP 12.5: Render Media if present */}
          {file && (
            <div className="mb-2">
              {fileType === "image" ? (
                <div className="relative group cursor-pointer" onClick={() => window.open(`${serverUrl}${file}`, '_blank')}>
                   <img 
                    src={`${serverUrl}${file}`} 
                    alt="attachment" 
                    className="max-h-64 w-full object-cover rounded-xl border border-white/10 hover:opacity-90 transition-opacity" 
                  />
                  <div className="absolute top-2 right-2 p-1.5 bg-black/40 backdrop-blur-md rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink size={14} className="text-white" />
                  </div>
                </div>
              ) : (
                <a 
                  href={`${serverUrl}${file}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5 hover:bg-black/40 transition-all group"
                >
                  <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 group-hover:scale-110 transition-transform">
                    {fileType === "pdf" ? <FileText size={22} /> : <File size={22} />}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Attachment</span>
                    <span className="text-xs font-bold truncate text-indigo-300">
                      {fileType === "pdf" ? "View PDF Document" : "Open System File"}
                    </span>
                  </div>
                </a>
              )}
            </div>
          )}

          {/* Render text message / caption */}
          {message && <p>{message}</p>}
        </div>

        {/* --- Subtle Timestamp & Status --- */}
        <div className="flex items-center gap-1.5 mt-1 px-1">
          <span className="text-[10px] text-zinc-600 font-medium tracking-tight">
            {time}
          </span>
          
          {/* ✅ STEP 11.5: MESSAGE STATUS UI */}
          {isOwn && (
            <div className="flex items-center">
              {status === 'seen' ? (
                <CheckCheck size={13} strokeWidth={3} className="text-indigo-400" />
              ) : status === 'delivered' ? (
                <CheckCheck size={13} strokeWidth={3} className="text-zinc-500" />
              ) : (
                <Check size={13} strokeWidth={3} className="text-zinc-500/70" />
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}