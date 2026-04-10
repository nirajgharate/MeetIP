import React, { useState, useEffect } from "react";
import { Search, Hash, Loader2, MessageSquare, PlusCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

// ✅ Added 'notifications' to props (Step 13.3)
export default function ChatList({
  chats = [],
  onSelectChat,
  selectedChatId,
  isLoading,
  myId,
  onlineUsers = [],
  notifications = [],
  onCreateGroup,
}) {
  const [activeTab, setActiveTab] = useState("users");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // ✅ IMPROVED LOGIC: Safely extract the "Other" user's data
  const getContactInfo = (chat) => {
    const otherMember =
      chat.participants?.find((p) => p._id !== myId) ||
      chat.members?.find((m) => m._id !== myId);

    return {
      _id: otherMember?._id,
      username: otherMember?.username || "Unknown Node",
      avatar:
        otherMember?.avatar || otherMember?.username?.[0]?.toUpperCase() || "?",
      status: otherMember?.status || "offline",
      email: otherMember?.email || "",
      about: otherMember?.about || "",
      bio: otherMember?.bio || "", // Added bio mapping
    };
  };

  // ✅ STEP 15.4: Navigation Handler Fix
  const handleViewProfile = (e, userData) => {
    e.stopPropagation(); // Prevent triggering onSelectChat
    if (userData?._id) {
      // ✅ FIXED: Navigate to correct route path that matches router
      navigate(`/user/${userData._id}`, { state: { user: userData } });
    }
  };

  // ✅ STEP 13.3 LOGIC: Get unread count and latest notification for a chat
  const getChatNotifications = (chatId) => {
    const chatNotifs = notifications.filter((n) => n.chatId === chatId);
    return {
      count: chatNotifs.length,
      latestMsg: chatNotifs[chatNotifs.length - 1]?.message,
    };
  };

  // ✅ FILTERING LOGIC
  const filteredRealUsers = chats.filter((chat) => !chat.isGroup);
  const filteredRealGroups = chats.filter((chat) => chat.isGroup);

  const currentData =
    activeTab === "users" ? filteredRealUsers : filteredRealGroups;

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Search Bar */}
      <div className="p-4 border-b border-white/5">
        <div className="relative group">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab}...`}
            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/30 transition-all placeholder:text-zinc-700"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 py-3 flex gap-2">
        {["users", "groups"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all relative
              ${activeTab === tab ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            <span className="relative z-10">{tab}</span>
            {activeTab === tab && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white/5 border border-white/10 rounded-xl"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Create Group Button for Groups Tab */}
      {activeTab === "groups" && (
        <div className="px-4 pb-3">
          <button
            onClick={onCreateGroup}
            className="w-full py-3 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl text-indigo-400 hover:bg-indigo-600/20 transition-all flex items-center justify-center gap-2 group"
          >
            <PlusCircle
              size={16}
              className="group-hover:scale-110 transition-transform"
            />
            <span className="text-xs font-bold uppercase tracking-widest">
              Create Group
            </span>
          </button>
        </div>
      )}

      {/* List Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
        {isLoading && activeTab === "users" ? (
          <div className="space-y-2 p-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.02] animate-pulse"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 bg-white/5 rounded" />
                  <div className="h-2 w-full bg-white/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              {currentData.length === 0 ? (
                <div className="text-center py-20 opacity-20">
                  <MessageSquare
                    size={32}
                    className="mx-auto mb-2 text-zinc-500"
                  />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    No {activeTab} found
                  </p>
                </div>
              ) : (
                currentData.map((item) => {
                  const isGroup = item.isGroup;
                  const itemId = item._id;

                  const chatNotif = getChatNotifications(item._id);
                  const unreadCount = chatNotif.count;

                  const displayMsg =
                    chatNotif.latestMsg?.text ||
                    item.latestMessage?.text ||
                    (isGroup
                      ? "Group chat established"
                      : "Secure link established");

                  const displayTime = item.updatedAt
                    ? new Date(item.updatedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "";

                  const displayName = isGroup
                    ? item.name
                    : getContactInfo(item).username;
                  const displayAvatar = isGroup
                    ? item.name?.[0]?.toUpperCase() || "#"
                    : getContactInfo(item).avatar;

                  const isOnline =
                    !isGroup &&
                    getContactInfo(item)._id &&
                    onlineUsers.includes(getContactInfo(item)._id);

                  return (
                    <motion.div
                      key={itemId}
                      layout
                      onClick={() => onSelectChat(item)}
                      className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all border group
                      ${
                        selectedChatId === itemId
                          ? "bg-indigo-600/10 border-indigo-500/20 shadow-lg"
                          : "bg-transparent border-transparent hover:bg-white/[0.02]"
                      }`}
                    >
                      {/* Avatar Section */}
                      <div className="relative shrink-0">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10 shadow-xl transition-all group-hover:scale-105 group-hover:border-indigo-500/50 overflow-hidden
                        ${isGroup ? "bg-purple-600/20 text-purple-400" : "bg-zinc-800 text-zinc-400"}`}
                        >
                          {isGroup ? (
                            <Hash size={20} />
                          ) : displayAvatar &&
                            displayAvatar.startsWith("http") ? (
                            <img
                              src={displayAvatar}
                              alt={displayName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : (
                            <span className="font-bold uppercase">
                              {typeof displayAvatar === "string" &&
                              displayAvatar.length === 1
                                ? displayAvatar
                                : displayName[0]}
                            </span>
                          )}
                        </div>

                        {!isGroup && (
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-[#080808] rounded-full transition-all duration-500
                          ${
                            isOnline
                              ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)] animate-pulse"
                              : "bg-zinc-700 shadow-none"
                          }`}
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <h3 className="font-bold text-sm text-zinc-100 truncate">
                            {displayName}
                          </h3>
                          <span className="text-[10px] text-zinc-600 font-medium">
                            {displayTime}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-zinc-500 truncate flex-1">
                            {displayMsg}
                          </p>
                          {unreadCount > 0 && (
                            <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[18px] text-center">
                              {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
