import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useCallback,
} from "react";
import Sidebar from "../components/layout/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit3,
  Phone,
  Users,
  Share2,
  ShieldAlert,
  Mail,
  ChevronRight,
  Camera,
  X,
  Check,
  MessageSquare,
  Fingerprint,
  ShieldCheck,
  Trash2,
  Loader2,
  Activity,
  Award,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// --- SERVICE & CONTEXT IMPORTS ---
import { getProfile, updateProfile } from "../services/userService";
import { getUserChats, createChat } from "../services/chatService";
import { AuthContext } from "../context/AuthContext";
import CreateGroupModal from "../components/chat/CreateGroupModal";
import { socket } from "../socket/socket";

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { setUser: setGlobalUser } = useContext(AuthContext); // Access global state

  // --- CORE STATE ---
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeView, setActiveView] = useState(null);
  const [formData, setFormData] = useState({});
  const [updateLoading, setUpdateLoading] = useState(false);
  const [stats, setStats] = useState({ connections: 0, groups: 0, blocked: 0 });
  const [connections, setConnections] = useState([]);
  const [groups, setGroups] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);

  // --- DATA FETCHING ---
  const fetchUserData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const data = await getProfile();
      setUser(data);

      // Initial form sync
      setFormData({
        username: data.username || data.name || "",
        mobile: data.mobileNumber || "",
        bio: data.bio || data.about || "",
        profilePic: data.avatar || null,
      });

      // Fetch additional data
      setDataLoading(true);
      try {
        const chats = await getUserChats();

        // Get groups
        const userGroups = chats.filter((chat) => chat.isGroup);
        setGroups(userGroups);

        // Get connections from non-group chats and group members
        const chattedUsers = [];
        chats.forEach((chat) => {
          if (!chat.isGroup && chat.members) {
            chat.members.forEach((member) => {
              if (
                member._id !== data._id &&
                !chattedUsers.find((u) => u._id === member._id)
              ) {
                chattedUsers.push(member);
              }
            });
          } else if (chat.isGroup && chat.members) {
            // Include group members as connections too
            chat.members.forEach((member) => {
              if (
                member._id !== data._id &&
                !chattedUsers.find((u) => u._id === member._id)
              ) {
                chattedUsers.push(member);
              }
            });
          }
        });
        setConnections(chattedUsers);

        // Update stats
        setStats({
          connections: chattedUsers.length,
          groups: userGroups.length,
          blocked: data.blockedUsers?.length || 0,
        });
      } catch (dataErr) {
        console.error("Failed to fetch additional data:", dataErr);
        setStats({
          connections: 0,
          groups: 0,
          blocked: data.blockedUsers?.length || 0,
        });
      } finally {
        setDataLoading(false);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
      if (err.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // --- LOAD DATA ON MOUNT ---
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // --- IMAGE LOGIC ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () =>
        setFormData((prev) => ({ ...prev, profilePic: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  // --- SAVE PROFILE CHANGES ---
  const handleSave = async () => {
    setUpdateLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("username", formData.username || "");
      formDataToSend.append("mobileNumber", formData.mobile || "");
      formDataToSend.append("bio", formData.bio || "");

      console.log("Form data to send:", {
        username: formData.username,
        mobile: formData.mobile,
        bio: formData.bio,
        profilePic: formData.profilePic ? "Present" : "Null",
      });

      // Handle avatar upload
      if (formData.profilePic && formData.profilePic.startsWith("data:image")) {
        // Convert base64 to blob for FormData
        const response = await fetch(formData.profilePic);
        const blob = await response.blob();
        formDataToSend.append("avatar", blob, "profile-image.jpg");
        console.log("Avatar blob added to FormData");
      } else if (formData.profilePic === null) {
        formDataToSend.append("avatar", "");
        console.log("Empty avatar added to FormData");
      }
      // If profilePic is an existing URL, don't send avatar field

      console.log("Sending update request...");
      const updatedUser = await updateProfile(formDataToSend);
      console.log("Update successful:", updatedUser);

      setUser(updatedUser);
      setGlobalUser(updatedUser);
      setIsEditing(false);

      // Emit socket event to notify other users about profile update
      socket.emit("profileUpdated", {
        userId: updatedUser._id,
        updatedUser: {
          username: updatedUser.username,
          avatar: updatedUser.avatar,
          about: updatedUser.bio,
        },
      });

      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Update failed:", err);
      alert(
        `Failed to update profile: ${err.message || err || "Please try again."}`,
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  // --- START CHAT WITH USER ---
  const handleStartChatWithUser = async (userId) => {
    try {
      const chat = await createChat(userId);
      navigate("/messages", { state: { autoSelectChat: chat } });
    } catch (err) {
      console.error("Failed to start chat:", err);
      alert("Failed to start chat. Please try again.");
    }
  };

  // --- HANDLE GROUP CREATED ---
  const handleGroupCreated = (newGroup) => {
    // Refresh the data to include the new group
    fetchUserData();
    // Navigate to messages with the new group selected
    navigate("/messages", { state: { autoSelectChat: newGroup } });
  };

  // UI Dummies (Replace with real data from backend later)
  // const connections = [
  //   { id: 1, name: "Sarah Connor", bio: "Resistance Leader" },
  // ];
  // const groups = [{ id: 101, name: "Alpha Devs", members: 12 }];

  if (loading) {
    return (
      <div className="h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">
          Decrypting Identity...
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden selection:bg-indigo-500/30">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent">
        {/* TOP BAR */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/40 sticky top-0 z-40 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
              <Fingerprint className="text-indigo-500" size={18} />
            </div>
            <div>
              <h1 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
                My Profile
              </h1>
              <p className="text-[8px] text-emerald-500 font-bold uppercase tracking-widest">
                Status: Online & Encrypted
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreateGroupModalOpen(true)}
              className="group px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 border border-violet-400/20 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 text-white shadow-lg shadow-violet-600/20"
            >
              <Users size={14} /> Create Group
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="group px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/20 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 text-white shadow-lg shadow-indigo-600/20"
            >
              <Edit3 size={14} /> Edit Profile
            </button>
          </div>
        </header>

        <main className="max-w-5xl mx-auto w-full p-8 space-y-8">
          {/* HERO IDENTITY CARD */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative p-[1px] bg-gradient-to-br from-white/20 via-white/5 to-transparent rounded-[48px]"
          >
            <div className="bg-[#0A0A0A]/90 backdrop-blur-3xl p-10 rounded-[47px] relative border border-white/5 shadow-2xl">
              <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                <div className="relative group">
                  <div className="w-48 h-48 rounded-[42px] bg-zinc-900 border-2 border-indigo-500/30 flex items-center justify-center text-6xl font-black text-white shadow-2xl overflow-hidden">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Profile"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <span className="bg-gradient-to-br from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                        {(user?.username || "U")[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-emerald-500 border-[8px] border-[#0A0A0A] rounded-full flex items-center justify-center shadow-lg">
                    <ShieldCheck size={20} className="text-white" />
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left space-y-4">
                  <div>
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                      <h2 className="text-4xl font-black tracking-tight text-white">
                        {user?.username || user?.name}
                      </h2>
                      <div className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-bold text-indigo-400 uppercase">
                        Core User
                      </div>
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-2 text-zinc-500">
                      <Mail size={12} />
                      <span className="text-sm font-medium">{user?.email}</span>
                    </div>
                  </div>

                  <p className="text-zinc-400 text-lg leading-relaxed font-medium max-w-xl">
                    {user?.about ||
                      "No decryption key provided for bio. Add one to customize your presence."}
                  </p>

                  <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                    <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-4 py-2.5 rounded-2xl text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                      <Phone size={14} className="text-indigo-400" />{" "}
                      {user?.mobileNumber || "No Mobile Linked"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* STATS GRID */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              {
                id: "connections",
                label: "Connections",
                count: stats.connections,
                icon: <Share2 size={24} />,
                color: "text-blue-400",
                bg: "bg-blue-500/20",
                border: "border-blue-500/20",
                shadow: "shadow-blue-500/10",
              },
              {
                id: "groups",
                label: "Groups",
                count: stats.groups,
                icon: <Users size={24} />,
                color: "text-purple-400",
                bg: "bg-purple-500/20",
                border: "border-purple-500/20",
                shadow: "shadow-purple-500/10",
              },
              {
                id: "blocked",
                label: "Blocked",
                count: stats.blocked,
                icon: <ShieldAlert size={24} />,
                color: "text-red-400",
                bg: "bg-red-500/20",
                border: "border-red-500/20",
                shadow: "shadow-red-500/10",
              },
            ].map((box) => (
              <motion.button
                key={box.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  box.id === "blocked"
                    ? navigate("/blocked-users")
                    : setActiveView(activeView === box.id ? null : box.id)
                }
                className={`group relative p-[1px] bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-[32px] transition-all duration-300 ${
                  activeView === box.id
                    ? "from-blue-500/20 via-blue-500/10 to-transparent"
                    : ""
                }`}
              >
                <div
                  className={`bg-[#0A0A0A]/90 backdrop-blur-xl p-6 rounded-[31px] border transition-all duration-300 ${
                    activeView === box.id
                      ? `border-blue-500/40 ${box.shadow} shadow-2xl`
                      : "border-white/5 hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-2xl ${box.bg} ${box.color} border ${box.border} transition-all duration-300 ${
                          activeView === box.id
                            ? "scale-110 shadow-lg"
                            : "group-hover:scale-105"
                        }`}
                      >
                        {box.icon}
                      </div>
                      <div>
                        <p className="text-3xl font-black text-white mb-1">
                          {box.count}
                        </p>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                          {box.label}
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      size={20}
                      className={`transition-all duration-300 ${
                        activeView === box.id
                          ? "rotate-90 text-blue-400 scale-110"
                          : "text-zinc-500 group-hover:text-zinc-300"
                      }`}
                    />
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.section>

          

          {/* RECENT ACTIVITY */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative p-[1px] bg-gradient-to-br from-white/20 via-white/5 to-transparent rounded-[48px]"
          >
            <div className="bg-[#0A0A0A]/90 backdrop-blur-3xl p-8 rounded-[47px] border border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <Activity className="text-emerald-400" size={18} />
                </div>
                <h3 className="text-sm font-black text-zinc-300 uppercase tracking-widest">
                  Recent Activity
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-blue-500/20">
                    <MessageSquare size={16} className="text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">
                      Active in {stats.groups} groups
                    </p>
                    <p className="text-xs text-zinc-500">
                      Connected with {stats.connections} people
                    </p>
                  </div>
                  <div className="text-xs text-zinc-600">
                    {new Date().toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl flex items-center justify-center border border-emerald-500/20">
                    <ShieldCheck size={16} className="text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">
                      Profile Verified
                    </p>
                    <p className="text-xs text-zinc-500">
                      Account security maintained
                    </p>
                  </div>
                  <div className="text-xs text-zinc-600">
                    {new Date().toLocaleDateString()}
                  </div>
                </div>

                {stats.blocked > 0 && (
                  <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl flex items-center justify-center border border-red-500/20">
                      <ShieldAlert size={16} className="text-red-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">
                        Privacy Controls Active
                      </p>
                      <p className="text-xs text-zinc-500">
                        {stats.blocked} user{stats.blocked !== 1 ? "s" : ""}{" "}
                        blocked
                      </p>
                    </div>
                    <div className="text-xs text-zinc-600">
                      {new Date().toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.section>

          {/* ACHIEVEMENTS */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative p-[1px] bg-gradient-to-br from-white/20 via-white/5 to-transparent rounded-[48px]"
          >
            <div className="bg-[#0A0A0A]/90 backdrop-blur-3xl p-8 rounded-[47px] border border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <Award className="text-amber-400" size={18} />
                </div>
                <h3 className="text-sm font-black text-zinc-300 uppercase tracking-widest">
                  Achievements
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Users size={14} className="text-blue-400" />
                    </div>
                    <span className="text-sm font-bold text-white">
                      Social Butterfly
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Connected with {stats.connections} people
                    {stats.connections >= 10
                      ? " - Master Level!"
                      : stats.connections >= 5
                        ? " - Advanced!"
                        : " - Keep going!"}
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <MessageSquare size={14} className="text-emerald-400" />
                    </div>
                    <span className="text-sm font-bold text-white">
                      Group Leader
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Created {stats.groups} group{stats.groups !== 1 ? "s" : ""}
                    {stats.groups >= 5
                      ? " - Community Builder!"
                      : stats.groups >= 2
                        ? " - Getting Started!"
                        : " - Start a group!"}
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <ShieldCheck size={14} className="text-purple-400" />
                    </div>
                    <span className="text-sm font-bold text-white">
                      Verified User
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Profile completed and verified
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <Fingerprint size={14} className="text-orange-400" />
                    </div>
                    <span className="text-sm font-bold text-white">
                      Privacy Guardian
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {stats.blocked > 0
                      ? `${stats.blocked} user${stats.blocked !== 1 ? "s" : ""} blocked for privacy`
                      : "No blocked users - clean slate!"}
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* EXPANDABLE SECTIONS */}
          <AnimatePresence>
            {activeView && (
              <motion.section
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="relative p-[1px] bg-gradient-to-br from-white/20 via-white/5 to-transparent rounded-[48px] overflow-hidden"
              >
                <div className="bg-[#0A0A0A]/90 backdrop-blur-3xl p-8 rounded-[47px] border border-white/5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                      {activeView === "connections" ? (
                        <Share2 className="text-indigo-400" size={18} />
                      ) : (
                        <Users className="text-indigo-400" size={18} />
                      )}
                    </div>
                    <h3 className="text-sm font-black text-zinc-300 uppercase tracking-widest">
                      {activeView === "connections"
                        ? "Your Connections"
                        : "Your Groups"}
                    </h3>
                  </div>

                  {dataLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                      <Loader2
                        className="animate-spin text-indigo-500"
                        size={32}
                      />
                      <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em]">
                        Decrypting Data...
                      </p>
                    </div>
                  ) : (activeView === "connections" ? connections : groups)
                      .length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-zinc-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                        {activeView === "connections" ? (
                          <Share2 className="text-zinc-600" size={24} />
                        ) : (
                          <Users className="text-zinc-600" size={24} />
                        )}
                      </div>
                      <p className="text-zinc-500 text-sm font-medium">
                        {activeView === "connections"
                          ? "No connections found. Start chatting with people!"
                          : "No groups found. Create your first group!"}
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      <AnimatePresence>
                        {(activeView === "connections"
                          ? connections
                          : groups
                        ).map((item, index) => (
                          <motion.div
                            key={item._id || item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ delay: index * 0.05 }}
                            className="group relative p-[1px] bg-gradient-to-r from-white/10 via-white/5 to-transparent rounded-[24px]"
                          >
                            <div className="bg-[#0F0F0F]/90 backdrop-blur-xl p-5 rounded-[23px] border border-white/5 hover:border-white/10 transition-all duration-300">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="relative">
                                    <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-black text-lg text-white overflow-hidden">
                                      {item.avatar ? (
                                        <img
                                          src={item.avatar}
                                          alt={item.username || item.name}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <span className="bg-gradient-to-br from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                                          {(item.username ||
                                            item.name ||
                                            "U")[0].toUpperCase()}
                                        </span>
                                      )}
                                    </div>
                                    {activeView === "connections" && (
                                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-[#0F0F0F] rounded-full flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-black text-white text-base mb-1">
                                      {item.username || item.name}
                                    </p>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                      {activeView === "connections"
                                        ? item.bio ||
                                          item.about ||
                                          "Connected user"
                                        : `${item.members?.length || 0} members`}
                                    </p>
                                  </div>
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() =>
                                    activeView === "connections"
                                      ? handleStartChatWithUser(item._id)
                                      : navigate("/messages", {
                                          state: { autoSelectChat: item },
                                        })
                                  }
                                  className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border border-indigo-400/20 rounded-2xl text-white transition-all duration-300 shadow-lg shadow-indigo-600/20"
                                >
                                  <MessageSquare size={16} />
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setIsEditing(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative p-[1px] bg-gradient-to-br from-white/20 via-white/5 to-transparent rounded-[48px] w-full max-w-lg max-h-[90vh] overflow-hidden"
            >
              <div className="bg-[#0A0A0A]/95 backdrop-blur-3xl rounded-[47px] border border-white/5 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-8 border-b border-white/5 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                      <Edit3 className="text-indigo-400" size={18} />
                    </div>
                    <h3 className="text-lg font-black text-white uppercase tracking-widest">
                      Edit Profile
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                  >
                    <X size={20} className="text-zinc-400" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-6 p-6 bg-white/5 border border-white/5 rounded-2xl">
                    <div className="relative group">
                      <div className="w-20 h-20 rounded-2xl bg-zinc-900 border-2 border-indigo-500/30 flex items-center justify-center text-3xl font-black text-white shadow-2xl overflow-hidden">
                        {formData.profilePic ? (
                          <img
                            src={formData.profilePic}
                            alt="Preview"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <span className="bg-gradient-to-br from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                            {(user?.username || "U")[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 border-4 border-[#0A0A0A] rounded-full flex items-center justify-center shadow-lg">
                        <ShieldCheck size={16} className="text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-white mb-3 uppercase tracking-widest">
                        Profile Picture
                      </p>
                      <div className="flex gap-3">
                        <label className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border border-indigo-400/20 rounded-xl text-[11px] font-black uppercase tracking-widest cursor-pointer transition-all flex items-center gap-2 text-white shadow-lg shadow-indigo-600/20">
                          <Camera size={14} />
                          Upload
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                        {formData.profilePic && (
                          <button
                            onClick={() =>
                              setFormData({ ...formData, profilePic: null })
                            }
                            className="px-4 py-2 bg-red-500 hover:bg-red-400 border border-red-400/20 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all text-white shadow-lg shadow-red-500/20"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        Username
                      </label>
                      <input
                        value={formData.username || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:border-indigo-500/50 outline-none transition-all font-medium"
                        placeholder="Enter your username"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        Mobile Number
                      </label>
                      <input
                        value={formData.mobile || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, mobile: e.target.value })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:border-indigo-500/50 outline-none transition-all font-medium"
                        placeholder="Enter your mobile number"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        Bio
                      </label>
                      <textarea
                        value={formData.bio || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, bio: e.target.value })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:border-indigo-500/50 outline-none transition-all font-medium resize-none h-24"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 p-8 border-t border-white/5 flex-shrink-0">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-black uppercase tracking-widest text-zinc-300 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={updateLoading}
                    className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border border-indigo-400/20 rounded-xl text-sm font-black uppercase tracking-widest text-white transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {updateLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Check size={16} />
                    )}
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
        onGroupCreated={handleGroupCreated}
      />
    </div>
  );
}
