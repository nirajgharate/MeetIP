import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Smile,
  Plus,
  Image as ImageIcon,
  Video,
  FileText,
  File,
  X,
  Phone,
  MoreVertical,
  Search,
  ShieldCheck,
  Trash2,
  Ban,
  Palette,
  CheckCircle2,
  ChevronLeft,
  Check,
  CheckCheck,
  Loader2,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

// ✅ IMPORT VIDEO CALL MODAL
import VideoCallModal from "../chat/VideoCallModal";
import IncomingCallModal from "../chat/IncomingCallModal";

// ✅ IMPORT API & SOCKET
import {
  getMessages,
  sendMessage,
  markMessagesAsSeen,
} from "../../services/chatService";
import { socket } from "../../socket/socket";
import { blockUser } from "../../services/userService";
import { useAuth } from "../../context/AuthContext";

export default function ChatWindow({ chat, myId }) {
  const [msgText, setMsgText] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [menuView, setMenuView] = useState("main");
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeWallpaper, setActiveWallpaper] = useState("carbon");

  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);

  // ✅ Navigation hook
  const navigate = useNavigate();

  // ✅ AUTH CONTEXT
  const { user: currentUser } = useAuth();

  // ✅ WEBRTC STATE & REFS
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false); // ✅ NEW: Track if it's video or voice
  const [showVideoModal, setShowVideoModal] = useState(false); // ✅ NEW: Control video modal
  const [incomingCall, setIncomingCall] = useState(null); // ✅ NEW: Incoming call state

  // ✅ TRACK MEDIA STATES
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState([]);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);

  const rtcConfig = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  // ✅ ATTACH STREAMS TO VIDEO ELEMENTS
  useEffect(() => {
    if (isCallActive && localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [isCallActive, localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      console.log("✅ Attaching remote stream to video element");
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // ✅ TOGGLE MICROPHONE
  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
        setIsMuted(!track.enabled);
      });
    }
  };

  // ✅ TOGGLE VIDEO
  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
        setIsCameraOff(!track.enabled);
      });
    }
  };

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

  const isGroup = chat?.isGroup;
  const groupMembers = chat?.members || [];
  const memberCount = groupMembers.length;

  const otherUser = !isGroup
    ? chat?.participants?.find((p) => p._id !== myId) ||
      chat?.members?.find((m) => m._id !== myId) || {
        username: chat?.name || "Unknown",
        _id: "unknown",
      }
    : null;

  // ✅ ACCEPT INCOMING CALL
  const acceptCall = async () => {
    if (!incomingCall) return;

    try {
      const { from, signalData, isVideoCall: callIsVideo } = incomingCall;
      setIsVideoCall(callIsVideo);

      const constraints = callIsVideo
        ? { video: true, audio: true }
        : { video: false, audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      setIsCallActive(true);

      if (callIsVideo) {
        setShowVideoModal(true);
      }

      const peer = new RTCPeerConnection(rtcConfig);
      peerConnection.current = peer;

      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("iceCandidate", { to: from, candidate: event.candidate });
        }
      };

      peer.ontrack = (event) => {
        console.log("📥 Remote track received (Receiver)");
        setRemoteStream(event.streams[0]);
      };

      await peer.setRemoteDescription(new RTCSessionDescription(signalData));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.emit("answerCall", { to: from, signal: answer });
      setIncomingCall(null);
    } catch (err) {
      console.error("ACCEPT_CALL_ERROR:", err);
      setIncomingCall(null);
    }
  };

  // ✅ REJECT INCOMING CALL
  const rejectCall = () => {
    if (incomingCall) {
      socket.emit("rejectCall", { to: incomingCall.from });
      setIncomingCall(null);
    }
  };

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    setIsCallActive(false);
    setIsVideoCall(false);
    setShowVideoModal(false);
    setIncomingCall(null);
    setIsMuted(false);
    setIsCameraOff(false);
    setShowOptions(false);
    setMenuView("main");
  };

  // ✅ START VIDEO CALL (DYNAMIC MODAL)
  const startVideoCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      setIsCallActive(true);
      setIsVideoCall(true);
      setShowVideoModal(true);

      const peer = new RTCPeerConnection(rtcConfig);
      peerConnection.current = peer;

      peer.oniceconnectionstatechange = () => {
        console.log("📡 ICE state (Video Caller):", peer.iceConnectionState);
      };

      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("iceCandidate", {
            to: otherUser._id,
            candidate: event.candidate,
          });
        }
      };

      peer.ontrack = (event) => {
        console.log("📥 Remote track received (Video Caller)");
        setRemoteStream(event.streams[0]);
      };

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      socket.emit("callUser", {
        userToCall: otherUser._id,
        signalData: offer,
        from: myId,
        chatId: chat._id,
      });
    } catch (err) {
      console.error("VIDEO_ACCESS_DENIED:", err);
      alert(
        "Please enable camera and microphone access to start a video call.",
      );
    }
  };

  // ✅ START VOICE CALL (SIMPLE - No Modal)
  const startVoiceCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });
      setLocalStream(stream);
      setIsCallActive(true);
      setIsVideoCall(false);

      const peer = new RTCPeerConnection(rtcConfig);
      peerConnection.current = peer;

      peer.oniceconnectionstatechange = () => {
        console.log("📡 ICE state (Voice Caller):", peer.iceConnectionState);
      };

      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("iceCandidate", {
            to: otherUser._id,
            candidate: event.candidate,
          });
        }
      };

      peer.ontrack = (event) => {
        console.log("📥 Remote track received (Voice Caller)");
        setRemoteStream(event.streams[0]);
      };

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      socket.emit("callUser", {
        userToCall: otherUser._id,
        signalData: offer,
        from: myId,
        chatId: chat._id,
      });
    } catch (err) {
      console.error("AUDIO_ACCESS_DENIED:", err);
      alert("Please enable microphone access to start a voice call.");
    }
  };

  // ✅ FETCH HISTORY & MARK AS SEEN
  useEffect(() => {
    if (chat?._id) {
      socket.emit("joinChat", chat._id);
      setIsOtherUserTyping(false);

      const fetchHistory = async () => {
        setLoading(true);
        try {
          const data = await getMessages(chat._id);
          setMessages(data);
          await markMessagesAsSeen(chat._id);
          socket.emit("messageSeen", { chatId: chat._id, userId: myId });
        } catch (err) {
          console.error("FETCH_ERROR:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    }
  }, [chat?._id, myId]);

  // ✅ REAL-TIME SOCKET LISTENERS
  useEffect(() => {
    const handleNewMessage = (payload) => {
      if (payload.chatId !== chat?._id) return;
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
        markMessagesAsSeen(chat._id);
        socket.emit("messageSeen", { chatId: chat._id, userId: myId });
      }
    };

    const handleStatusUpdate = (data) => {
      if (data.chatId === chat?._id) {
        setMessages((prev) =>
          prev.map((m) => {
            const isMe = m.sender === myId || m.sender?._id === myId;
            return isMe ? { ...m, status: "seen" } : m;
          }),
        );
      }
    };

    const handleIncomingCall = async ({ from, signalData, chatId }) => {
      // ✅ Show incoming call modal instead of auto-accepting
      const hasVideo = signalData.sdp.includes("m=video");
      setIncomingCall({
        from,
        signalData,
        chatId,
        isVideoCall: hasVideo,
        caller: { _id: from, username: "Incoming Call" }, // You might want to fetch user details here
      });
    };

    const handleCallAccepted = async ({ answer }) => {
      if (peerConnection.current) {
        try {
          await peerConnection.current.setRemoteDescription(
            new RTCSessionDescription(answer),
          );
        } catch (err) {
          console.error("SDP_HANDSHAKE_ERROR:", err);
        }
      }
    };

    const handleIceCandidate = async ({ candidate }) => {
      if (peerConnection.current && candidate) {
        try {
          await peerConnection.current.addIceCandidate(
            new RTCIceCandidate(candidate),
          );
        } catch (e) {
          console.error("ICE_CANDIDATE_ERROR", e);
        }
      }
    };

    const handleCallEnded = () => {
      console.log("📞 Call ended - Cleaning up streams...");

      if (localStream) {
        localStream.getTracks().forEach((track) => {
          console.log(`Stopping ${track.kind} track`);
          track.stop();
        });
      }

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }

      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }

      setLocalStream(null);
      setRemoteStream(null);
      setIsCallActive(false);
      setIsVideoCall(false);
      setShowVideoModal(false);
      setIsMuted(false);
      setIsCameraOff(false);
      console.log("✅ Call cleanup complete - Camera and microphone OFF");
    };

    const handleCallRejected = () => {
      console.log("📞 Call was rejected by the other user");
      endCall();
    };

    const handleOnlineUsers = (userIds) => {
      setOnlineUserIds(userIds);
    };

    socket.on("receiveMessage", handleNewMessage);
    socket.on("messages_seen", handleStatusUpdate);
    socket.on(
      "typing",
      (data) => data.chatId === chat?._id && setIsOtherUserTyping(true),
    );
    socket.on(
      "stopTyping",
      (data) => data.chatId === chat?._id && setIsOtherUserTyping(false),
    );
    socket.on("iceCandidate", handleIceCandidate);
    socket.on("incomingCall", handleIncomingCall);
    socket.on("callAccepted", handleCallAccepted);
    socket.on("callRejected", handleCallRejected);
    socket.on("callEnded", handleCallEnded);
    socket.on("onlineUsers", handleOnlineUsers);

    return () => {
      socket.off("receiveMessage", handleNewMessage);
      socket.off("messages_seen", handleStatusUpdate);
      socket.off("typing");
      socket.off("stopTyping");
      socket.off("iceCandidate", handleIceCandidate);
      socket.off("incomingCall");
      socket.off("callAccepted");
      socket.off("callRejected");
      socket.off("callEnded");
      socket.off("onlineUsers", handleOnlineUsers);
    };
  }, [chat?._id, myId, localStream]);

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOtherUserTyping]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showOptions && !event.target.closest(".menu-container")) {
        setShowOptions(false);
        setMenuView("main");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showOptions]);

  const handleInputChange = (e) => {
    setMsgText(e.target.value);
    socket.emit("typing", chat._id);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", chat._id);
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

    socket.emit("stopTyping", chat._id);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    const formData = new FormData();
    formData.append("chatId", chat._id);
    if (textToSend) formData.append("text", textToSend);
    if (fileToUpload) formData.append("file", fileToUpload);

    setMsgText("");
    setShowEmoji(false);
    setShowAttachMenu(false);

    try {
      const savedMsg = await sendMessage(chat._id, formData);
      socket.emit("sendMessage", { chatId: chat._id, message: savedMsg });
      setMessages((prev) => [...prev, savedMsg]);
    } catch (err) {
      console.error("TRANSMISSION_ERROR:", err);
    }
  };

  // ✅ CLEAR CONVERSATION FUNCTION
  const handleClearConversation = () => {
    if (
      window.confirm(
        "Are you sure you want to clear this conversation? This action cannot be undone.",
      )
    ) {
      // For now, just clear local messages. In a real app, you'd call an API to delete messages
      setMessages([]);
      setShowOptions(false);
      alert("Conversation cleared successfully.");
    }
  };

  // ✅ BLOCK USER FUNCTION
  const handleBlockUser = async () => {
    if (isBlocking || !otherUser) return;

    setIsBlocking(true);
    try {
      await blockUser(otherUser._id);
      // Close the menu
      setShowOptions(false);
      // Show success message
      alert(
        `${otherUser.username} has been blocked and removed from your connections.`,
      );
      // Navigate back to messages (user will be removed from chat list)
      navigate("/messages");
    } catch (err) {
      console.error("Failed to block user", err);
      alert("Failed to block user. Please try again.");
    } finally {
      setIsBlocking(false);
    }
  };

  if (!chat)
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#050505] text-zinc-800">
        <ShieldCheck size={80} strokeWidth={1} className="mb-4 opacity-10" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">
          Select a terminal to begin
        </p>
      </div>
    );

  return (
    <div
      className={`flex flex-1 flex-col relative overflow-hidden transition-all duration-700 ${wallpapers[activeWallpaper]}`}
    >
      {/* ✅ INCOMING CALL MODAL */}
      <IncomingCallModal
        isOpen={!!incomingCall}
        caller={incomingCall?.caller}
        isVideoCall={incomingCall?.isVideoCall}
        onAccept={acceptCall}
        onReject={rejectCall}
      />

      {/* ✅ VIDEO CALL MODAL */}
      <VideoCallModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        otherUser={otherUser}
        localStream={localStream}
        remoteStream={remoteStream}
        isCallActive={isCallActive}
        isMuted={isMuted}
        isCameraOff={isCameraOff}
        onToggleMic={toggleMic}
        onToggleCamera={toggleCamera}
      />

      {/* ✅ VOICE CALL INDICATOR (Simple overlay) */}
      <AnimatePresence>
        {isCallActive && !isVideoCall && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute top-24 right-6 z-40 bg-black/60 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-white">
                Voice Call Active
              </span>
              <button
                onClick={endCall}
                className="p-2 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-all"
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
              key="user-info"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-4"
            >
              <div className="relative group">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black shadow-lg uppercase ${
                    isGroup
                      ? "bg-purple-600/20 text-purple-400 border border-purple-500/30"
                      : "bg-gradient-to-tr from-indigo-600 to-violet-500"
                  }`}
                >
                  {isGroup ? (
                    <Users size={16} />
                  ) : otherUser?.username ? (
                    otherUser.username[0]
                  ) : (
                    "?"
                  )}
                </div>
                {!isGroup && otherUser?._id && (
                  <div
                    className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-4 border-[#0c0c0c] rounded-full ${onlineUserIds.includes(otherUser._id) ? "bg-emerald-500" : "bg-zinc-500"}`}
                  />
                )}
              </div>
              <div>
                <h3
                  className={`text-sm font-bold text-white flex items-center gap-2 transition-colors ${
                    isGroup
                      ? "cursor-default"
                      : "cursor-pointer hover:text-indigo-400"
                  }`}
                  onClick={() =>
                    !isGroup &&
                    otherUser?._id &&
                    navigate(`/user/${otherUser._id}`, {
                      state: { user: otherUser },
                    })
                  }
                >
                  {isGroup ? chat?.name : otherUser?.username || "Unknown"}{" "}
                  <CheckCircle2 size={14} className="text-indigo-400" />
                </h3>
                {isOtherUserTyping ? (
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest animate-pulse">
                    Inbound Transmission...
                  </span>
                ) : (
                  <div className="flex flex-col gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest ${
                        isGroup
                          ? "text-purple-400"
                          : otherUser?._id &&
                              onlineUserIds.includes(otherUser._id)
                            ? "text-emerald-500"
                            : "text-zinc-500"
                      }`}
                    >
                      {isGroup
                        ? `${memberCount} members`
                        : otherUser?._id &&
                            onlineUserIds.includes(otherUser._id)
                          ? "Online"
                          : "Offline"}
                    </span>
                    {isGroup && (
                      <button
                        type="button"
                        onClick={() => navigate(`/group/${chat._id}`)}
                        className="text-[10px] uppercase tracking-[0.3em] text-indigo-400 hover:text-indigo-200 transition-colors"
                      >
                        View group profile
                      </button>
                    )}
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
                placeholder="Search encrypted history..."
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
              {!isGroup && (
                <>
                  <button
                    onClick={startVideoCall}
                    className="p-2.5 text-zinc-400 hover:text-indigo-400 transition-all"
                  >
                    <Video size={20} />
                  </button>
                  <button
                    onClick={startVoiceCall}
                    className="p-2.5 text-zinc-400 hover:text-indigo-400 transition-all"
                  >
                    <Phone size={19} />
                  </button>
                </>
              )}
            </>
          )}

          <button
            onClick={() => {
              setShowOptions(!showOptions);
              setMenuView("main");
            }}
            className={`menu-container p-2.5 rounded-xl transition-all ${showOptions ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}
          >
            <MoreVertical size={20} />
          </button>

          <AnimatePresence>
            {showOptions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="menu-container absolute top-14 right-0 w-64 bg-[#121212]/95 border border-white/10 rounded-[28px] shadow-2xl z-50 p-2 backdrop-blur-2xl overflow-hidden"
              >
                {menuView === "main" ? (
                  <motion.div initial={{ x: -20 }} animate={{ x: 0 }}>
                    <div className="p-3 mb-1">
                      <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-2">
                        Settings
                      </span>
                    </div>
                    <button
                      onClick={() => setMenuView("wallpaper")}
                      className="w-full flex items-center justify-between p-3.5 hover:bg-white/5 rounded-2xl transition-all text-zinc-300 group"
                    >
                      <div className="flex items-center gap-3">
                        <Palette size={18} className="text-indigo-400" />
                        <span className="text-xs font-bold">
                          Change Wallpaper
                        </span>
                      </div>
                      <Plus size={14} className="opacity-40" />
                    </button>
                    <button
                      onClick={handleClearConversation}
                      className="w-full flex items-center gap-3 p-3.5 hover:bg-white/5 rounded-2xl transition-all text-zinc-300 group"
                    >
                      <Trash2 size={18} className="text-zinc-500" />
                      <span className="text-xs font-bold">
                        Clear Conversation
                      </span>
                    </button>
                    <div className="h-[1px] bg-white/5 my-1" />
                    {!isGroup && (
                      <button
                        onClick={handleBlockUser}
                        disabled={isBlocking}
                        className="w-full flex items-center gap-3 p-3.5 hover:bg-red-500/10 rounded-2xl transition-all text-red-500 group disabled:opacity-50"
                      >
                        {isBlocking ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Ban size={18} />
                        )}
                        <span className="text-xs font-bold">
                          {isBlocking ? "Blocking..." : "Block User"}
                        </span>
                      </button>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ x: 20 }}
                    animate={{ x: 0 }}
                    className="p-2"
                  >
                    <button
                      onClick={() => setMenuView("main")}
                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white mb-4 px-2"
                    >
                      <ChevronLeft size={14} /> Back
                    </button>
                    <div className="grid grid-cols-2 gap-2 px-1">
                      {Object.keys(wallpapers).map((w) => (
                        <button
                          key={w}
                          onClick={() => {
                            setActiveWallpaper(w);
                            setMenuView("main");
                            setShowOptions(false);
                          }}
                          className={`relative h-16 rounded-xl border-2 transition-all flex items-center justify-center overflow-hidden ${activeWallpaper === w ? "border-indigo-500" : "border-white/5 hover:border-white/20"}`}
                        >
                          <div
                            className={`absolute inset-0 ${wallpapers[w]} bg-cover bg-center`}
                          />
                          {activeWallpaper === w && (
                            <div className="z-10 bg-indigo-500 rounded-full p-1">
                              <Check size={12} className="text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
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
              Deciphering...
            </span>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-10 opacity-70 select-none">
            <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-500 italic">
              {isGroup
                ? "Group ready. Send the first message to get the conversation started."
                : "Secure P2P tunnel established"}
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
                          <FileText size={24} className="text-indigo-400" />
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
              User is typing...
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
            placeholder={`Message ${isGroup ? chat?.name || "group" : otherUser?.username || "user"}...`}
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
