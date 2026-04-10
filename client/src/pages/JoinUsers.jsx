import React, { useState, useEffect } from "react";
import Sidebar from "../components/layout/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  UserMinus,
  Search,
  MoreHorizontal,
  ShieldCheck,
  MessageSquare,
  Info,
  BellOff,
  UsersRound,
  Hash,
  Lock,
  Loader2,
} from "lucide-react";

// ✅ Logic Imports
import { useNavigate } from "react-router-dom";
import { createChat } from "../services/chatService";
import { getUsers } from "../services/userService";
import { useAuth } from "../context/AuthContext";

export default function JoinUsers() {
  const [viewMode, setViewMode] = useState("Users");
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);

  // ✅ LOGIC UPDATES
  const [users, setUsers] = useState([]);
  const [isLinking, setIsLinking] = useState(false);
  const navigate = useNavigate();

  // ✅ FIXED: Use AuthContext to get current user's ID
  const { user } = useAuth();
  const myId = user?._id;

  // ✅ 1. FETCH REAL USERS
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const data = await getUsers();

        // ✅ CRITICAL FIX: Filter out the logged-in user (Self)
        const filteredData = data.filter((u) => u._id !== myId);

        const formattedUsers = filteredData.map((u) => ({
          _id: u._id, // Keep original ID for navigation
          id: u._id,
          username: u.username, // Keep original field for profile
          name: u.username,
          avatar: u.username ? u.username[0].toUpperCase() : "?",
          email: u.email || "", // Pass to profile
          about: u.about || "", // Pass to profile
          role: "Active Node",
          joined: false,
          color: "bg-indigo-600",
        }));

        setUsers(formattedUsers);
      } catch (err) {
        console.error("Discovery failed", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (viewMode === "Users") {
      fetchUsers();
    } else {
      setUsers([]);
      setIsLoading(false);
    }
  }, [viewMode, myId]);

  // ✅ 2. START CHAT LOGIC (Updated Navigation)
  const handleStartChat = async (targetUserId) => {
    if (isLinking) return;

    setIsLinking(true);
    try {
      const chat = await createChat(targetUserId);
      navigate("/messages", { state: { autoSelectChat: chat } });
    } catch (err) {
      console.error("Failed to initialize P2P link", err);
    } finally {
      setIsLinking(false);
    }
  };

  // ✅ 3. VIEW PROFILE LOGIC
  const handleViewProfile = (userData) => {
    navigate(`/user/${userData._id}`, { state: { user: userData } });
  };

  const currentList = users.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    if (activeTab === "All") return matchesSearch;
    if (activeTab === "Joined") return matchesSearch && item.joined;
    if (activeTab === "Not Joined") return matchesSearch && !item.joined;
    return matchesSearch;
  });

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent transition-all duration-300">
        {/* Header */}
        <header className="h-24 border-b border-white/5 flex items-center px-8 bg-black/40 sticky top-0 z-40 backdrop-blur-xl justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/10">
              {viewMode === "Users" ? (
                <UserPlus size={24} />
              ) : (
                <UsersRound size={24} />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Join Users
              </h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black">
                Expand your network
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="relative group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors"
                size={16}
              />
              <input
                type="text"
                placeholder={`Search ${viewMode.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-2xl py-2 pl-10 pr-4 text-xs font-medium focus:ring-2 focus:ring-blue-500/20 outline-none w-64 transition-all"
              />
            </div>
          </div>
        </header>

        {/* Navigation Controls */}
        <div className="px-8 pt-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between shrink-0">
          <div className="flex p-1 bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-md">
            {["Users", "Groups"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-[14px] text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                  viewMode === mode
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                {mode === "Users" ? (
                  <Users size={14} />
                ) : (
                  <UsersRound size={14} />
                )}
                {mode}
              </button>
            ))}
          </div>

          <div className="flex gap-2 p-1.5 bg-white/[0.02] border border-white/5 rounded-[20px] backdrop-blur-sm">
            {["All", "Joined", "Not Joined"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-[14px] text-[10px] font-bold uppercase tracking-tighter transition-all duration-300 ${
                  activeTab === tab
                    ? "bg-white/10 text-white"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content Grid */}
        <main className="flex-1 p-8">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-60 rounded-[32px] bg-white/5 border border-white/5 animate-pulse flex items-center justify-center"
                  >
                    <Loader2 className="animate-spin text-zinc-800" size={32} />
                  </div>
                ))}
              </div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {currentList.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group relative bg-[#0A0A0A] rounded-[32px] p-6 border border-white/5 hover:border-blue-500/30 transition-all duration-500"
                  >
                    <div className="flex items-start justify-between relative z-20">
                      {/* ✅ CLICKABLE PROFILE AREA */}
                      <div
                        className="flex items-center gap-4 cursor-pointer group/identity"
                        onClick={() => handleViewProfile(item)}
                      >
                        <div
                          className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center text-xl font-black shadow-2xl transition-all group-hover/identity:scale-105 group-hover/identity:rotate-3 group-hover/identity:shadow-indigo-500/20`}
                        >
                          {item.avatar}
                        </div>
                        <div>
                          <h3 className="font-bold text-zinc-100 flex items-center gap-2 group-hover/identity:text-indigo-400 transition-colors">
                            {item.name}
                            {item.type === "Private" && (
                              <Lock size={12} className="text-amber-500/50" />
                            )}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {viewMode === "Users" ? (
                              <ShieldCheck
                                size={12}
                                className="text-blue-500/60"
                              />
                            ) : (
                              <Hash size={12} className="text-blue-500/60" />
                            )}
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                              {item.role}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === item.id ? null : item.id,
                            )
                          }
                          className="text-zinc-600 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors"
                        >
                          <MoreHorizontal size={20} />
                        </button>
                        <AnimatePresence>
                          {openMenuId === item.id && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="absolute right-0 mt-2 w-48 bg-[#121212] border border-white/10 rounded-2xl shadow-2xl z-50 p-2 backdrop-blur-xl"
                            >
                              <button
                                onClick={() => handleViewProfile(item)}
                                className="w-full flex items-center gap-3 px-3 py-2 text-[11px] font-bold text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg"
                              >
                                <Info size={14} /> Profile Details
                              </button>
                              <button className="w-full flex items-center gap-3 px-3 py-2 text-[11px] font-bold text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg">
                                <BellOff size={14} /> Ignore Node
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">
                          Connection Status
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${item.joined ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" : "bg-zinc-700"}`}
                          />
                          <span className="text-[10px] font-black uppercase text-zinc-400">
                            {item.joined ? "Active Link" : "Available"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <button
                        onClick={() => handleStartChat(item.id)}
                        disabled={isLinking}
                        className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-[18px] transition-all text-[11px] font-black uppercase tracking-wider ${
                          isLinking ? "opacity-50 cursor-not-allowed" : ""
                        } ${
                          item.joined
                            ? "bg-white/5 text-zinc-500 border border-white/5"
                            : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20"
                        }`}
                      >
                        {isLinking ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : item.joined ? (
                          <UserMinus size={16} />
                        ) : (
                          <UserPlus size={16} />
                        )}
                        {item.joined ? "Linked" : "Initialize"}
                      </button>
                      <button
                        onClick={() => handleStartChat(item.id)}
                        disabled={isLinking}
                        className="h-12 px-5 flex items-center justify-center rounded-[18px] bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-zinc-400 disabled:opacity-50"
                      >
                        <MessageSquare size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
