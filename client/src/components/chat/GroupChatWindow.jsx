import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Smile,
  Plus,
  Image as ImageIcon,
  File,
  X,
  MoreVertical,
  Search,
  ShieldCheck,
  Trash2,
  Palette,
  CheckCircle2,
  ChevronLeft,
  Check,
  CheckCheck,
  Loader2,
  Users,
  Video,
  Phone,
  PhoneOff,
  Menu,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

// ✅ IMPORT API & SOCKET
import {
  getMessages,
  sendMessage,
  markMessagesAsSeen,
} from "../../services/chatService";
import { socket } from "../../socket/socket";
import { useAuth } from "../../context/AuthContext";

export default function GroupChatWindow({
  group,
  myId,
  onBack,
  onToggleSidebar,
}) {
  const [msgText, setMsgText] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeWallpaper, setActiveWallpaper] = useState("carbon");
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);
  const localVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const wallpapers = {
    carbon:
      "bg-[#0c0c0c] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]",
    stardust:
      "bg-[#050505] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]",
    circuit:
      "bg-[#080808] bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')]",
    solid: "bg-[#0f0f0f]",
  };

  const emojis = [
    "😊",
    "😂",
    "🔥",
    "🚀",
    "❤️",
    "👍",
    "🙌",
    "✨",
    "💻",
    "🔒",
    "✅",
    "📍",
  ];

  const members = group?.members || [];
  const memberCount = members.length;
  const isAdmin = group?.admin?._id === currentUser?._id;

  // ✅ FETCH HISTORY & MARK AS SEEN
  useEffect(() => {
    if (group?._id) {
      socket.emit("joinChat", group._id);
      setIsOtherUserTyping(false);

      const fetchHistory = async () => {
        setLoading(true);
        try {
          const data = await getMessages(group._id);
          setMessages(data);
          await markMessagesAsSeen(group._id);
          socket.emit("messageSeen", { chatId: group._id, userId: myId });
        } catch (err) {
          console.error("FETCH_ERROR:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    }
  }, [group?._id, myId]);

  // ✅ REAL-TIME SOCKET LISTENERS
  useEffect(() => {
    const handleNewMessage = (payload) => {
      if (payload.chatId !== group?._id) return;
      const newMessage = payload.message;
      const senderId = newMessage.sender?._id || newMessage.sender;
      if (senderId !== myId) {
        setMessages((prev) => {
          if (
            prev.some(
              (m) => (m._id || m.id) === (newMessage._id || newMessage.id),
            )
          )
            return prev;
          return [...prev, newMessage];
        });
        markMessagesAsSeen(group._id);
        socket.emit("messageSeen", { chatId: group._id, userId: myId });
      }
    };

    const handleStatusUpdate = (data) => {
      if (data.chatId === group?._id) {
        setMessages((prev) =>
          prev.map((m) => {
            const isMe = m.sender === myId || m.sender?._id === myId;
            return isMe ? { ...m, status: "seen" } : m;
          }),
        );
      }
    };

    socket.on("receiveMessage", handleNewMessage);
    socket.on("messages_seen", handleStatusUpdate);
    socket.on(
      "typing",
      (data) => data.chatId === group?._id && setIsOtherUserTyping(true),
    );
    socket.on(
      "stopTyping",
      (data) => data.chatId === group?._id && setIsOtherUserTyping(false),
    );

    return () => {
      socket.off("receiveMessage", handleNewMessage);
      socket.off("messages_seen", handleStatusUpdate);
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [group?._id, myId]);

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOtherUserTyping]);

  const handleInputChange = (e) => {
    setMsgText(e.target.value);
    socket.emit("typing", group._id);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", group._id);
    }, 2000);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await handleSendMessage(null, file);
    e.target.value = null;
  };

  const handleSendMessage = async (e, fileToUpload = null) => {
    if (e) e.preventDefault();
    const textToSend = msgText.trim();
    if (!textToSend && !fileToUpload) return;

    socket.emit("stopTyping", group._id);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    const formData = new FormData();
    formData.append("chatId", group._id);
    if (textToSend) formData.append("text", textToSend);
    if (fileToUpload) formData.append("file", fileToUpload);

    setMsgText("");
    setShowEmoji(false);
    setShowAttachMenu(false);

    try {
      const savedMsg = await sendMessage(group._id, formData);
      // Note: Socket emission is now handled by the server
      setMessages((prev) => [...prev, savedMsg]);
    } catch (err) {
      console.error("TRANSMISSION_ERROR:", err);
    }
  };

  const handleClearConversation = () => {
    if (
      window.confirm(
        "Are you sure you want to clear this conversation? This action cannot be undone.",
      )
    ) {
      setMessages([]);
      setShowOptions(false);
      alert("Conversation cleared successfully.");
    }
  };

  // ✅ END CALL - Properly cleanup all media streams and resources
  const endCall = () => {
    console.log("📞 Ending call - Cleaning up streams...");

    // Stop all local media tracks
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        console.log(`Stopping ${track.kind} track`);
        track.stop();
      });
      setLocalStream(null);
    }

    // Clear video element
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    // Close peer connection
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    // Reset all call states
    setIsCallActive(false);
    setIsMuted(false);
    setIsCameraOff(false);
    console.log("✅ Call cleanup complete - Camera and microphone OFF");
  };

  // ✅ START VIDEO CALL
  const startGroupVideoCall = async () => {
    try {
      if (isCallActive) {
        endCall();
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      setIsCallActive(true);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Notify group about the call
      socket.emit("groupCallInitiated", {
        groupId: group._id,
        initiatedBy: myId,
        type: "video",
      });
    } catch (err) {
      console.error("VIDEO_ACCESS_DENIED:", err);
      alert(
        "Please enable camera and microphone access to start a video call.",
      );
    }
  };

  // ✅ START VOICE CALL
  const startGroupVoiceCall = async () => {
    try {
      if (isCallActive) {
        endCall();
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });
      setLocalStream(stream);
      setIsCallActive(true);

      // Notify group about the call
      socket.emit("groupCallInitiated", {
        groupId: group._id,
        initiatedBy: myId,
        type: "voice",
      });
    } catch (err) {
      console.error("AUDIO_ACCESS_DENIED:", err);
      alert("Please enable microphone access to start a voice call.");
    }
  };

  // ✅ CLEANUP ON UNMOUNT
  useEffect(() => {
    return () => {
      if (isCallActive) {
        endCall();
      }
    };
  }, []);

  if (!group)
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#050505] text-zinc-800">
        <ShieldCheck size={80} strokeWidth={1} className="mb-4 opacity-10" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">
          Select a group to begin
        </p>
      </div>
    );

  return (
    <div
      className={`flex flex-1 flex-col relative overflow-hidden transition-all duration-700 ${wallpapers[activeWallpaper]}`}
    >
      {/* ✅ CALL INDICATOR */}
      <AnimatePresence>
        {isCallActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute top-24 right-6 z-40 bg-black/60 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-white">
                Call Active
              </span>
              <button
                onClick={endCall}
                className="p-2 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-all"
                title="End Call"
              >
                <PhoneOff size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="h-20 px-6 border-b border-white/5 flex items-center justify-between backdrop-blur-3xl bg-black/40 z-50">
        <AnimatePresence mode="wait">
          {!isSearching ? (
            <motion.div
              key="group-info"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-4"
            >
              {/* Back button for mobile */}
              <button
                onClick={onBack}
                className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              {/* Menu button for mobile sidebar */}
              <button
                onClick={onToggleSidebar}
                className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
              >
                <Menu size={20} />
              </button>
              <div className="relative group">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black shadow-lg uppercase bg-purple-600/20 text-purple-400 border border-purple-500/30">
                  <Users size={16} />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 transition-colors cursor-pointer hover:text-indigo-400">
                  {group?.name || "Unnamed Group"}
                  <CheckCircle2 size={14} className="text-indigo-400" />
                </h3>
                {isOtherUserTyping ? (
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest animate-pulse">
                    Someone typing...
                  </span>
                ) : (
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">
                      {memberCount} members
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate(`/group/${group._id}`)}
                      className="text-[10px] uppercase tracking-[0.3em] text-indigo-400 hover:text-indigo-200 transition-colors"
                    >
                      View group profile
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="search-bar"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "100%" }}
              exit={{ opacity: 0, width: 0 }}
              className="flex-1 flex items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 mr-6"
            >
              <Search size={16} className="text-zinc-500 mr-3" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search group messages..."
                className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-zinc-600"
              />
              <button
                onClick={() => setIsSearching(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-1 relative">
          {!isSearching && (
            <>
              <button
                onClick={() => setIsSearching(true)}
                className="p-2.5 text-zinc-400 hover:text-white transition-all"
              >
                <Search size={20} />
              </button>
              <button
                onClick={startGroupVideoCall}
                className={`p-2.5 transition-all ${isCallActive ? "bg-red-500 text-white" : "text-zinc-400 hover:text-indigo-400 hover:bg-white/5"}`}
                title={isCallActive ? "End Video Call" : "Start Video Call"}
              >
                {isCallActive ? <PhoneOff size={20} /> : <Video size={20} />}
              </button>
              <button
                onClick={startGroupVoiceCall}
                className={`p-2.5 transition-all ${isCallActive ? "bg-red-500 text-white" : "text-zinc-400 hover:text-indigo-400 hover:bg-white/5"}`}
                title={isCallActive ? "End Voice Call" : "Start Voice Call"}
              >
                {isCallActive ? <PhoneOff size={20} /> : <Phone size={20} />}
              </button>
            </>
          )}

          <button
            onClick={() => setShowOptions(!showOptions)}
            className={`p-2.5 rounded-xl transition-all ${showOptions ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}
          >
            <MoreVertical size={20} />
          </button>

          <AnimatePresence>
            {showOptions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="absolute top-14 right-0 w-64 bg-[#121212]/95 border border-white/10 rounded-[28px] shadow-2xl z-50 p-2 backdrop-blur-2xl overflow-hidden"
              >
                <div className="p-3 mb-1">
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-2">
                    Settings
                  </span>
                </div>
                <button
                  onClick={() => {
                    setActiveWallpaper(
                      activeWallpaper === "carbon" ? "stardust" : "carbon",
                    );
                    setShowOptions(false);
                  }}
                  className="w-full flex items-center gap-3 p-3.5 hover:bg-white/5 rounded-2xl transition-all text-zinc-300 group"
                >
                  <Palette size={18} className="text-indigo-400" />
                  <span className="text-xs font-bold">Change Wallpaper</span>
                </button>
                <button
                  onClick={handleClearConversation}
                  className="w-full flex items-center gap-3 p-3.5 hover:bg-white/5 rounded-2xl transition-all text-zinc-300 group"
                >
                  <Trash2 size={18} className="text-zinc-500" />
                  <span className="text-xs font-bold">Clear Conversation</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <main
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar scroll-smooth"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 opacity-20">
            <Loader2 className="animate-spin text-indigo-500" />
            <span className="text-[10px] font-black tracking-widest uppercase">
              Loading group messages...
            </span>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-10 opacity-70 select-none">
            <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-500 italic">
              Group ready. Send the first message to get the conversation
              started.
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {messages.map((m) => {
              const isMe = m.sender === myId || m.sender?._id === myId;
              return (
                <motion.div
                  key={m._id || m.id || Math.random()}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] p-3 px-4 rounded-[20px] shadow-lg backdrop-blur-sm border border-white/10 ${
                      isMe
                        ? "bg-indigo-600/90 text-white rounded-tr-none"
                        : "bg-white/5 text-zinc-200 rounded-tl-none"
                    }`}
                  >
                    {!isMe && (
                      <p className="text-[10px] font-bold text-indigo-400 mb-1">
                        {m.sender?.username || "Unknown"}
                      </p>
                    )}
                    {m.file && m.fileType === "image" && (
                      <img
                        src={m.file}
                        alt="attachment"
                        className="rounded-lg mb-2 max-h-60 w-full object-cover border border-white/10"
                      />
                    )}
                    {m.file &&
                      (m.fileType === "pdf" || m.fileType === "file") && (
                        <div className="flex items-center gap-3 bg-black/20 p-2 rounded-lg mb-2">
                          <File size={24} className="text-indigo-400" />
                          <a
                            href={m.file}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs underline truncate max-w-[150px]"
                          >
                            View Attachment
                          </a>
                        </div>
                      )}
                    <p className="text-sm leading-relaxed">
                      {m.content || m.text}
                    </p>
                    <div
                      className={`flex items-center gap-1 mt-1 opacity-50 ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <span className="text-[9px] font-medium">
                        {m.createdAt
                          ? new Date(m.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Just now"}
                      </span>
                      {isMe && (
                        <div className="flex items-center ml-1">
                          <Check
                            size={12}
                            className={
                              m.status === "seen"
                                ? "text-indigo-400"
                                : "text-zinc-500"
                            }
                          />
                          {(m.status === "delivered" ||
                            m.status === "seen") && (
                            <Check
                              size={12}
                              className={`-ml-2 ${m.status === "seen" ? "text-indigo-400" : "text-zinc-500"}`}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {isOtherUserTyping && (
          <div className="flex justify-start">
            <div className="bg-white/5 text-zinc-500 text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-white/5 flex items-center gap-2 italic">
              <span className="flex gap-1">
                <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" />
              </span>
              Someone is typing...
            </div>
          </div>
        )}
      </main>

      <footer className="p-4 bg-black/60 border-t border-white/5 backdrop-blur-2xl relative z-40">
        <AnimatePresence>
          {showEmoji && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-24 left-6 p-4 bg-[#121212] border border-white/10 rounded-[28px] shadow-2xl z-50 grid grid-cols-4 gap-2"
            >
              {emojis.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setMsgText((t) => t + e)}
                  className="text-2xl hover:scale-125 transition-transform p-2"
                >
                  {e}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <form
          onSubmit={(e) => handleSendMessage(e)}
          className="max-w-6xl mx-auto flex items-center gap-2 bg-white/[0.03] border border-white/10 p-2 rounded-[24px] transition-all focus-within:border-indigo-500/40"
        >
          <button
            type="button"
            onClick={() => setShowEmoji(!showEmoji)}
            className={`p-3 rounded-2xl transition-all ${showEmoji ? "bg-indigo-600 text-white" : "text-zinc-500 hover:text-white hover:bg-white/5"}`}
          >
            <Smile size={22} />
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`p-3 rounded-2xl transition-all ${showAttachMenu ? "bg-indigo-600 text-white" : "text-zinc-500 hover:text-white hover:bg-white/5"}`}
          >
            <Plus size={22} />
          </button>

          <input
            type="text"
            value={msgText}
            onChange={handleInputChange}
            placeholder={`Message ${group?.name || "group"}...`}
            className="flex-1 bg-transparent border-none outline-none text-sm text-white px-3 placeholder:text-zinc-700"
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="submit"
            disabled={!msgText.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-20 text-white p-3.5 rounded-2xl transition-all shadow-lg active:scale-90"
          >
            <Send size={20} />
          </button>
        </form>
      </footer>
    </div>
  );
}
