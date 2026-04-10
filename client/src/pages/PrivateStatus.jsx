import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/layout/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Plus,
  X,
  Image as ImageIcon,
  Video as VideoIcon,
  Type,
  ChevronRight,
  Heart,
  Send,
  Trash2,
  Edit3,
  Check,
  Lock,
} from "lucide-react";

export default function PrivateStatus() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("All");
  const [activeStory, setActiveStory] = useState(null);
  const [isTextEditorOpen, setIsTextEditorOpen] = useState(false);
  const [statusInput, setStatusInput] = useState("");
  const [imageInput, setImageInput] = useState(null);
  const fileInputRef = useRef(null);

  const defaultMyStatus = {
    id: "me",
    user: user?.username || "You",
    avatar: (user?.username || "Y")[0].toUpperCase(),
    time: "Tap to add",
    content: "",
    type: "text",
    watched: false,
  };

  const defaultStatuses = [
    {
      id: 1,
      user: "Elena Gilbert",
      avatar: "EG",
      time: "22 mins ago",
      content: "Only for my close circles. 🤫",
      type: "text",
      watched: false,
      likes: 3,
    },
    {
      id: 2,
      user: "Marcus Vane",
      avatar: "MV",
      time: "1 hour ago",
      content: "https://images.unsplash.com/photo-1511367461989-f85a21fda167",
      type: "image",
      watched: false,
      likes: 8,
    },
    {
      id: 3,
      user: "Internal Bot",
      avatar: "IB",
      time: "5 hours ago",
      content: "Privacy is a right, not a feature.",
      type: "text",
      watched: true,
      likes: 1,
    },
  ];

  const [myStatus, setMyStatus] = useState(defaultMyStatus);
  const [statuses, setStatuses] = useState(defaultStatuses);

  useEffect(() => {
    const storedMyStatus = localStorage.getItem("privateMyStatus");
    const storedStatuses = localStorage.getItem("privateStatuses");

    if (storedMyStatus) {
      try {
        setMyStatus(JSON.parse(storedMyStatus));
      } catch (error) {
        console.error("Failed to parse stored private My Status", error);
      }
    }

    if (storedStatuses) {
      try {
        setStatuses(JSON.parse(storedStatuses));
      } catch (error) {
        console.error("Failed to parse stored private statuses", error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("privateMyStatus", JSON.stringify(myStatus));
  }, [myStatus]);

  useEffect(() => {
    localStorage.setItem("privateStatuses", JSON.stringify(statuses));
  }, [statuses]);

  const addImageStatus = async (file) => {
    if (!file) return;
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePostTextStatus = async () => {
    if (!statusInput.trim() && !imageInput) return;

    let content = statusInput.trim();
    let type = "text";

    if (imageInput) {
      content = await addImageStatus(imageInput);
      type = "image";
    }

    setMyStatus({
      ...myStatus,
      user: user?.username || myStatus.user,
      avatar: (user?.username || myStatus.user)[0].toUpperCase(),
      content,
      type,
      time: "Just now",
      watched: false,
    });
    setStatusInput("");
    setImageInput(null);
    setIsTextEditorOpen(false);
  };

  const handleDeleteStatus = (e) => {
    e.stopPropagation();
    setMyStatus({ ...myStatus, content: "", time: "Tap to add", type: "text" });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setImageInput(file);
  };

  const handleWatchStatus = (status) => {
    setStatuses((prev) =>
      prev.map((item) =>
        item.id === status.id ? { ...item, watched: true } : item,
      ),
    );
    setActiveStory({ ...status, watched: true });
  };

  const filteredStatuses = statuses.filter((s) => {
    if (activeTab === "Watched") return s.watched;
    if (activeTab === "Not Seen") return !s.watched;
    if (activeTab === "My Status") return false;
    return true;
  });

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 bg-[#080808]">
        {/* Header - Private Branding */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/40 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/10">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight uppercase">
                Private_Node
              </h1>
              <div className="flex items-center gap-1.5">
                <Lock size={8} className="text-zinc-500" />
                <p className="text-[8px] text-zinc-500 font-black uppercase tracking-[0.2em]">
                  Contact-Only Visibility
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="px-8 pt-6 flex gap-2">
          {["All", "Watched", "Not Seen", "My Status"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                activeTab === tab
                  ? "bg-emerald-600 border-emerald-500 shadow-lg shadow-emerald-600/20"
                  : "bg-white/5 border-white/5 text-zinc-500 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <main className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
          {/* MY STATUS CARD */}
          {(activeTab === "All" || activeTab === "My Status") && (
            <section className="space-y-4">
              <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">
                Your Identity
              </h2>
              <div
                className="flex items-center justify-between p-4 rounded-[32px] bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] transition-all group cursor-pointer"
                onClick={() => myStatus.content && setActiveStory(myStatus)}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center font-black">
                      Y
                    </div>
                    {!myStatus.content && (
                      <div className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center border-2 border-[#080808]">
                        <Plus size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Personal Update</h3>
                    <p className="text-xs text-zinc-500">{myStatus.time}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!myStatus.content ? (
                    <>
                      <button
                        onClick={() => setIsTextEditorOpen(true)}
                        className="p-3 bg-white/5 rounded-2xl hover:bg-emerald-600 transition-all text-zinc-400 hover:text-white"
                      >
                        <Type size={18} />
                      </button>
                      <button
                        onClick={() => fileInputRef.current.click()}
                        className="p-3 bg-white/5 rounded-2xl hover:bg-emerald-600 transition-all text-zinc-400 hover:text-white"
                      >
                        <ImageIcon size={18} />
                      </button>
                    </>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsTextEditorOpen(true)}
                        className="p-3 bg-white/5 rounded-2xl hover:text-emerald-400"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={handleDeleteStatus}
                        className="p-3 bg-white/5 rounded-2xl hover:text-red-400"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* CONTACT STATUSES */}
          {activeTab !== "My Status" && (
            <section className="space-y-4">
              <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">
                Circle Updates
              </h2>
              <div className="space-y-3">
                {filteredStatuses.map((s) => (
                  <StatusRow
                    key={s.id}
                    data={s}
                    onClick={() => handleWatchStatus(s)}
                  />
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      {/* TEXT EDITOR MODAL */}
      <AnimatePresence>
        {isTextEditorOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6"
          >
            <div className="w-full max-w-lg space-y-8">
              <textarea
                autoFocus
                value={statusInput}
                onChange={(e) => setStatusInput(e.target.value)}
                placeholder="Write something private..."
                className="w-full bg-transparent text-3xl font-black text-center outline-none placeholder-zinc-800 text-white"
              />
              <div className="flex justify-center gap-6">
                <button
                  onClick={() => setIsTextEditorOpen(false)}
                  className="p-5 bg-white/5 rounded-full text-zinc-500 hover:text-white transition-all"
                >
                  <X />
                </button>
                <button
                  onClick={handlePostTextStatus}
                  className="p-5 bg-emerald-600 rounded-full shadow-2xl shadow-emerald-600/40 text-white transition-all"
                >
                  <Check />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULL-SCREEN STORY VIEWER */}
      <AnimatePresence>
        {activeStory && (
          <StoryViewer
            story={activeStory}
            onClose={() => setActiveStory(null)}
          />
        )}
      </AnimatePresence>

      <input
        type="file"
        hidden
        ref={fileInputRef}
        accept="image/*,video/*"
        onChange={handleFileChange}
      />
    </div>
  );
}

// --- SUB-COMPONENTS ---

function StatusRow({ data, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-4 rounded-[28px] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <div
          className={`p-[2px] rounded-full border-2 ${data.watched ? "border-zinc-800" : "border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"}`}
        >
          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center font-black text-xs">
            {data.avatar}
          </div>
        </div>
        <div>
          <h3 className="font-bold text-sm tracking-tight">{data.user}</h3>
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
            {data.time}
          </p>
        </div>
      </div>
      <ChevronRight size={18} className="text-zinc-800" />
    </div>
  );
}

function StoryViewer({ story, onClose }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          onClose();
          return 100;
        }
        return p + 0.9;
      });
    }, 45);
    return () => clearInterval(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[400] bg-black flex flex-col items-center justify-center"
    >
      <div className="relative w-full max-w-lg h-full md:h-[90vh] bg-[#0A0A0A] md:rounded-[40px] overflow-hidden shadow-2xl flex flex-col">
        {/* Progress Bar */}
        <div className="absolute top-6 left-6 right-6 flex gap-1.5 z-[50]">
          <div className="h-[2px] flex-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-emerald-400 transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Story Header */}
        <div className="absolute top-12 left-6 right-6 flex items-center justify-between z-[50]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-black text-[10px]">
              {story.avatar}
            </div>
            <p className="font-black text-xs uppercase tracking-[0.2em]">
              {story.user}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 bg-black/40 backdrop-blur-md rounded-full border border-white/5"
          >
            <X size={18} />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex items-center justify-center p-12 relative">
          {story.type === "image" ? (
            <img
              src={story.content}
              className="w-full h-full object-contain"
              alt="private status"
            />
          ) : (
            <h2 className="text-3xl font-black text-center leading-tight tracking-tight px-4">
              {story.content}
            </h2>
          )}
        </div>

        {/* Interaction Footer */}
        <div className="p-8 space-y-6 z-[50] bg-gradient-to-t from-black to-transparent">
          <div className="flex justify-between items-center">
            <button className="flex items-center gap-3 group">
              <div className="p-3.5 rounded-2xl bg-white/5 group-hover:bg-emerald-500/20 transition-all border border-white/5">
                <Heart
                  size={20}
                  className="group-hover:text-emerald-500 group-active:scale-125 transition-all"
                />
              </div>
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                {story.likes || 0} Likes
              </span>
            </button>
            <div className="flex items-center gap-2">
              <Lock size={10} className="text-emerald-500/50" />
              <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em]">
                Encrypted_Node
              </span>
            </div>
          </div>

          <div className="relative">
            <input
              placeholder="Send a private reply..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-xs font-bold outline-none focus:border-emerald-500 transition-all pr-14 placeholder-zinc-700"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-emerald-600 rounded-xl hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20">
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
