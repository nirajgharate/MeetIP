import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/layout/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  MessageSquare,
  User,
  MoreHorizontal,
  Search,
  Filter,
  ShieldCheck,
  UserPlus,
  UserMinus,
  Settings,
  BellOff,
  Info,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket/socket";
import { getUsers, blockUser } from "../services/userService";
import { useAuth } from "../context/AuthContext";

export default function LiveUsers() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [users, setUsers] = useState([]);
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const [isBlocking, setIsBlocking] = useState(false);
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        // Filter out current user
        const filteredUsers = data.filter((u) => u._id !== currentUser?._id);
        setUsers(filteredUsers);
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  // Listen for online users
  useEffect(() => {
    const handleOnlineUsers = (userIds) => {
      setOnlineUserIds(userIds);
    };

    socket.on("onlineUsers", handleOnlineUsers);

    return () => {
      socket.off("onlineUsers", handleOnlineUsers);
    };
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.profession &&
        user.profession.toLowerCase().includes(searchQuery.toLowerCase()));
    const isOnline = onlineUserIds.includes(user._id);

    if (activeTab === "All") return matchesSearch;
    if (activeTab === "Online") return matchesSearch && isOnline;
    if (activeTab === "Offline") return matchesSearch && !isOnline;
    return matchesSearch;
  });

  // Handle block user
  const handleBlockUser = async (userId, username) => {
    if (isBlocking) return;

    setIsBlocking(true);
    try {
      await blockUser(userId);
      // Remove user from the list
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setOpenMenuId(null);
      alert(`${username} has been blocked and removed from your network.`);
    } catch (err) {
      console.error("Failed to block user", err);
      alert("Failed to block user. Please try again.");
    } finally {
      setIsBlocking(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent transition-all duration-300">
        {/* Header */}
        <header className="h-24 border-b border-white/5 flex items-center px-8 bg-black/40 sticky top-0 z-40 backdrop-blur-xl justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
              <Zap size={24} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
                Network Nodes
              </h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black">
                Live Directory
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="relative group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-500 transition-colors"
                size={16}
              />
              <input
                type="text"
                placeholder="Search nodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-2xl py-2 pl-10 pr-4 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none w-64"
              />
            </div>
          </div>
        </header>

        {/* Tab Navigation Section */}
        <div className="px-8 pt-8 shrink-0">
          <div className="flex gap-2 p-1.5 bg-white/[0.02] border border-white/5 rounded-[20px] w-fit backdrop-blur-sm">
            {["All", "Online", "Offline"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-2.5 rounded-[14px] text-xs font-bold transition-all duration-300 ${
                  activeTab === tab
                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* User Grid Area */}
        <main className="flex-1 p-8">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-56 rounded-[32px] bg-white/5 border border-white/5"
                  />
                ))}
              </div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {filteredUsers.map((user) => {
                  const isOnline = onlineUserIds.includes(user._id);

                  return (
                    <motion.div
                      key={user._id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group relative bg-[#0A0A0A] rounded-[32px] p-6 border border-white/5 hover:border-indigo-500/30 transition-all duration-500 cursor-pointer"
                      onClick={() =>
                        navigate(`/user/${user._id}`, { state: { user } })
                      }
                    >
                      <div className="flex items-start justify-between relative z-20">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-xl font-black shadow-2xl uppercase text-white">
                              {user.username?.charAt(0) || "?"}
                            </div>
                            <div
                              className={`absolute -bottom-1 -right-1 w-5 h-5 bg-[#0A0A0A] rounded-full flex items-center justify-center border border-white/5`}
                            >
                              <div
                                className={`w-2.5 h-2.5 rounded-full ${isOnline ? "bg-emerald-500" : "bg-zinc-500"}`}
                              />
                            </div>
                          </div>
                          <div>
                            <h3 className="font-bold text-zinc-100 group-hover:text-white">
                              {user.username}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <ShieldCheck
                                size={12}
                                className="text-indigo-500/60"
                              />
                              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                {user.profession || "Member"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Professional Dropdown Menu */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(
                                openMenuId === user._id ? null : user._id,
                              );
                            }}
                            className="text-zinc-600 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5"
                          >
                            <MoreHorizontal size={20} />
                          </button>

                          <AnimatePresence>
                            {openMenuId === user._id && (
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-2 w-48 bg-[#121212] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
                              >
                                <div className="p-2 space-y-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/user/${user._id}`, {
                                        state: { user },
                                      });
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-[11px] font-bold text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                  >
                                    <Info size={14} /> View Profile
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate("/messages");
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-[11px] font-bold text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                  >
                                    <MessageSquare size={14} /> Start Chat
                                  </button>
                                  <div className="h-[1px] bg-white/5 my-1" />
                                  <button className="w-full flex items-center gap-3 px-3 py-2 text-[11px] font-bold text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                                    <UserMinus size={14} /> Block User
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Meta Info */}
                      <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">
                            Status
                          </span>
                          <span
                            className={`text-[10px] font-black uppercase mt-1 ${isOnline ? "text-emerald-400" : "text-zinc-500"}`}
                          >
                            {isOnline ? "Online" : "Offline"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500" : "bg-zinc-500"}`}
                          />
                          <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">
                            {isOnline ? "Active" : "Away"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 flex gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("/messages");
                          }}
                          className="flex-1 flex items-center justify-center gap-2 h-11 rounded-[16px] bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/20 transition-all text-[11px] font-black uppercase tracking-wider"
                        >
                          <MessageSquare size={16} /> Chat
                        </button>
                        <button
                          className="h-11 px-4 flex items-center justify-center rounded-[16px] bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-zinc-400"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <UserPlus size={18} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
