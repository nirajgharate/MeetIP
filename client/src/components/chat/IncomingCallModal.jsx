import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, Video } from "lucide-react";

export default function IncomingCallModal({
  isOpen,
  caller,
  isVideoCall,
  onAccept,
  onReject,
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 max-w-md w-full mx-4 text-center shadow-2xl"
        >
          <div className="mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-2xl mx-auto mb-4 shadow-xl">
              {caller?.username?.[0]?.toUpperCase() || "?"}
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              {caller?.username || "Unknown"}
            </h2>
            <p className="text-zinc-400 flex items-center justify-center gap-2">
              {isVideoCall ? (
                <>
                  <Video size={16} />
                  Video Call
                </>
              ) : (
                <>
                  <Phone size={16} />
                  Voice Call
                </>
              )}
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={onReject}
              className="flex-1 py-4 px-6 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-all flex items-center justify-center gap-2"
            >
              <PhoneOff size={20} />
              Decline
            </button>
            <button
              onClick={onAccept}
              className="flex-1 py-4 px-6 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-semibold transition-all flex items-center justify-center gap-2"
            >
              {isVideoCall ? <Video size={20} /> : <Phone size={20} />}
              Accept
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
