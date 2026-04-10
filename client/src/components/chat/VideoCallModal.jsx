import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Settings,
  Users,
  MessageSquare,
} from "lucide-react";

export default function VideoCallModal({
  isOpen,
  onClose,
  otherUser,
  localStream,
  remoteStream,
  isCallActive,
  isMuted,
  isCameraOff,
  onToggleMic,
  onToggleCamera,
  onEndCall,
}) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isRemoteMuted, setIsRemoteMuted] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Attach streams to video elements
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: isMinimized ? 0.3 : 1,
            opacity: 1,
            x: isMinimized ? "80%" : 0,
            y: isMinimized ? "80%" : 0,
          }}
          exit={{ scale: 0.8, opacity: 0 }}
          className={`bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl ${
            isMinimized ? "w-80 h-48" : "w-full max-w-4xl h-[80vh]"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="h-16 bg-black/40 border-b border-white/5 flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-black uppercase text-sm">
                {otherUser?.username?.[0] || "?"}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Video Call with {otherUser?.username || "Unknown"}
                </h3>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
                  {isCallActive ? "Connected" : "Connecting..."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 text-zinc-400 hover:text-white transition-colors"
              >
                {isMinimized ? (
                  <Maximize2 size={18} />
                ) : (
                  <Minimize2 size={18} />
                )}
              </button>
              <button
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Video Area */}
          <div
            className={`relative ${isMinimized ? "h-32" : "flex-1"} bg-[#050505]`}
          >
            {/* Remote Video (Main) */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-cover ${isMinimized ? "rounded-b-3xl" : ""}`}
              muted={isRemoteMuted}
            />

            {/* Local Video (Picture-in-Picture) */}
            {!isMinimized && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute top-4 right-4 w-48 h-36 bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden"
              >
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {isCameraOff && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <VideoOff size={24} className="text-white/50" />
                  </div>
                )}
              </motion.div>
            )}

            {/* Call Status Overlay */}
            {!isMinimized && (
              <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2">
                <div className="px-6 py-3 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10">
                  <p className="text-sm text-white font-medium">
                    {isCallActive
                      ? "Secure video connection established"
                      : "Establishing secure connection..."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="h-20 bg-black/40 border-t border-white/5 flex items-center justify-center gap-4 px-6">
            {/* Mic Toggle */}
            <button
              onClick={onToggleMic}
              className={`p-4 rounded-2xl transition-all ${
                isMuted
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            {/* Camera Toggle */}
            <button
              onClick={onToggleCamera}
              className={`p-4 rounded-2xl transition-all ${
                isCameraOff
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
            >
              {isCameraOff ? <VideoOff size={20} /> : <VideoOff size={20} />}
            </button>

            {/* Volume Toggle (for remote audio) */}
            <button
              onClick={() => setIsRemoteMuted(!isRemoteMuted)}
              className={`p-4 rounded-2xl transition-all ${
                isRemoteMuted
                  ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
            >
              {isRemoteMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>

            {/* End Call */}
            <button
              onClick={onEndCall}
              className="p-4 rounded-2xl bg-red-500 hover:bg-red-600 text-white transition-all shadow-lg shadow-red-500/20"
            >
              <PhoneOff size={20} />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
