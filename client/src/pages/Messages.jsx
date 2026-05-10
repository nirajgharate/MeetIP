import React, { useState, useEffect } from "react";
import Sidebar from "../components/layout/Sidebar";
import ChatList from "../components/chat/ChatList";
import ChatWindow from "../components/chat/ChatWindow";
import GroupChatWindow from "../components/chat/GroupChatWindow";
import CreateGroupModal from "../components/chat/CreateGroupModal";

// ✅ Logic Imports for navigation state
import { useLocation, useNavigate } from "react-router-dom";

// ✅ Hook for user identity
import { useAuth } from "../context/AuthContext";

// ✅ Import services
import { getUserChats } from "../services/chatService";

// ✅ Import socket instance
import { socket } from "../socket/socket";

// ✅ Step 13.5: Animation for Popup
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";

export default function Messages() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ STEP 13.2: NOTIFICATION STATE
  const [notifications, setNotifications] = useState([]);

  // ✅ GROUP CREATION STATE
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);

  // ✅ STEP 13.5: POPUP STATE
  const [activeToast, setActiveToast] = useState(null);

  // ✅ MOBILE SIDEBAR TOGGLE
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // ✅ Logic: Access the navigation state passed from JoinUsers
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Get the logged-in user from AuthContext
  const { user, loading: authLoading } = useAuth();
  const myId = user?._id;

  // ✅ STEP 13.2, 13.4 & 13.5: LISTEN FOR NOTIFICATIONS
  useEffect(() => {
    const handleNotification = (data) => {
      // 🛑 STEP 13.4: Only store if the incoming message is NOT from the active chat
      if (data.chatId !== selectedChat?._id) {
        setNotifications((prev) => {
          const isDuplicate = prev.some(
            (n) => n.message?._id === data.message?._id,
          );
          if (isDuplicate) return prev;

          // ✅ STEP 13.5: TRIGGER POPUP
          setActiveToast(data);
          setTimeout(() => setActiveToast(null), 4000); // Auto-dismiss after 4s

          return [...prev, data];
        });
      }
    };

    socket.on("newNotification", handleNotification);

    return () => {
      socket.off("newNotification", handleNotification);
    };
  }, [selectedChat?._id]);

  // ✅ GROUP CREATION: Listen for new groups created by other users
  useEffect(() => {
    const handleNewGroup = (data) => {
      const { group } = data;
      console.log("New group received:", group);

      // Check if the current user is a member of this group
      if (group.members.some((member) => member._id === myId)) {
        setChats((prev) => {
          // Check if group already exists
          const exists = prev.find((c) => c._id === group._id);
          if (!exists) {
            return [group, ...prev];
          }
          return prev;
        });
      }
    };

    socket.on("newGroup", handleNewGroup);

    return () => {
      socket.off("newGroup", handleNewGroup);
    };
  }, [myId]);

  // ✅ STEP 13.4: AUTO-CLEAR: Remove notifications for a chat when you click/open it
  useEffect(() => {
    if (selectedChat?._id) {
      setNotifications((prev) => {
        const filtered = prev.filter((n) => n.chatId !== selectedChat._id);
        return filtered.length !== prev.length ? filtered : prev;
      });
    }
  }, [selectedChat?._id]);

  // ✅ 2. PROFILE UPDATE SYNC: Keep chat participants in sync when a user updates avatar or name
  useEffect(() => {
    const handleProfileUpdated = (data) => {
      const { userId, updatedUser } = data;
      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (!chat.members) return chat;
          const updatedMembers = chat.members.map((member) =>
            member._id === userId ? { ...member, ...updatedUser } : member,
          );
          return { ...chat, members: updatedMembers };
        }),
      );

      if (selectedChat?.members) {
        setSelectedChat((prevChat) => {
          if (!prevChat) return prevChat;
          const updatedMembers = prevChat.members.map((member) =>
            member._id === userId ? { ...member, ...updatedUser } : member,
          );
          return { ...prevChat, members: updatedMembers };
        });
      }
    };

    socket.on("userProfileUpdated", handleProfileUpdated);
    return () => {
      socket.off("userProfileUpdated", handleProfileUpdated);
    };
  }, [selectedChat]);

  // ✅ 1. UPDATED LOGIC: Handle Auto-Selection and State Cleanup
  useEffect(() => {
    if (location.state?.autoSelectChat) {
      const incomingChat = location.state.autoSelectChat;
      setSelectedChat(incomingChat);
      setShowMobileSidebar(false);
      setChats((prevChats) => {
        const exists = prevChats.find((c) => c._id === incomingChat._id);
        if (!exists) return [incomingChat, ...prevChats];
        return [
          incomingChat,
          ...prevChats.filter((c) => c._id !== incomingChat._id),
        ];
      });
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // ✅ 2. UPDATED LOGIC: Sync Real Database History
  useEffect(() => {
    const fetchInitialData = async () => {
      if (authLoading) return;
      if (!user) return;

      try {
        setLoading(true);
        const data = await getUserChats();
        setChats(data);

        if (!selectedChat && data.length > 0) {
          setSelectedChat(data[0]);
        }

        if (selectedChat) {
          const freshData = data.find((c) => c._id === selectedChat._id);
          if (freshData) setSelectedChat(freshData);
        }
      } catch (err) {
        console.error("FAILED_TO_SYNC_CHATS:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [user, authLoading, location.state]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  // ✅ GROUP CREATION HANDLER
  const handleGroupCreated = async (newGroup) => {
    // Add the new group to the chats list
    setChats((prev) => [newGroup, ...prev]);
    setSelectedChat(newGroup);
    setShowMobileSidebar(false);
    setIsCreateGroupModalOpen(false);

    // Optionally refresh the chats list to ensure consistency
    try {
      const updatedChats = await getUserChats();
      setChats(updatedChats);
    } catch (error) {
      console.error("Failed to refresh chats after group creation:", error);
    }
  };

  // ✅ Show loading state while authentication or chats are loading
  if (authLoading || loading) {
    return (
      <div className="flex h-screen bg-[#050505] text-white items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading your messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden font-sans relative">
      {/* ✅ STEP 13.5: POPUP NOTIFICATION UI */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ y: -50, opacity: 0, x: "-50%" }}
            animate={{ y: 20, opacity: 1, x: "-50%" }}
            exit={{ y: -50, opacity: 0, x: "-50%" }}
            className="fixed top-0 left-1/2 z-[100] w-auto min-w-[300px] bg-[#0f0f0f] border border-indigo-500/30 px-4 py-3 rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.2)] flex items-center gap-3"
          >
            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
              <Bell size={18} />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400">
                New Message
              </h4>
              <p className="text-sm font-bold text-white">
                {activeToast.message?.sender?.username || "Node Incoming"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ GROUP CREATION MODAL */}
      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
        onGroupCreated={handleGroupCreated}
      />

      {/* 01. NAVIGATION NODE */}
      <div
        className={`${selectedChat && !showMobileSidebar ? "hidden md:flex" : "flex"} shrink-0`}
      >
        <Sidebar />
      </div>

      {/* 02. MAIN COMMUNICATION INTERFACE */}
      <div className="flex flex-1 min-w-0">
        {/* 03. CHAT DIRECTORY (LEFT PANEL) */}
        <section
          className={`w-80 lg:w-96 border-r border-white/5 bg-[#080808] flex flex-col shrink-0 z-10 shadow-xl relative ${selectedChat ? "hidden md:flex" : "flex"}`}
        >
          <div className="absolute top-0 left-0 w-full h-[1px] bg-white/5" />

          <ChatList
            chats={chats}
            onSelectChat={(chat) => {
              setSelectedChat(chat);
              setShowMobileSidebar(false);
            }}
            selectedChatId={selectedChat?._id}
            isLoading={loading}
            myId={myId}
            notifications={notifications}
            onCreateGroup={() => setIsCreateGroupModalOpen(true)}
          />
        </section>

        {/* 04. ACTIVE TERMINAL (RIGHT PANEL) */}
        <section className="flex-1 flex flex-col bg-gradient-to-b from-[#0c0c0c] to-[#0a0a0a] min-w-0 relative transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

          {selectedChat?.isGroup ? (
            <GroupChatWindow
              group={selectedChat}
              myId={myId}
              onBack={() => {
                setSelectedChat(null);
                setShowMobileSidebar(false);
              }}
              onToggleSidebar={() => setShowMobileSidebar(!showMobileSidebar)}
            />
          ) : (
            <ChatWindow
              chat={selectedChat}
              myId={myId}
              onBack={() => {
                setSelectedChat(null);
                setShowMobileSidebar(false);
              }}
              onToggleSidebar={() => setShowMobileSidebar(!showMobileSidebar)}
            />
          )}
        </section>
      </div>
    </div>
  );
}
