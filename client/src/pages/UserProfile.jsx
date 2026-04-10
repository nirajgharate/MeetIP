import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  MessageSquare,
  Ban,
  Mail,
  Info,
  ShieldCheck,
  Loader2,
  Edit3,
  Users,
  Globe,
  UserPlus,
  PlusCircle,
  Phone,
  X,
  UserMinus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { createChat } from "../services/chatService";
import { blockUser, unblockUser } from "../services/userService";

// ✅ IMPORT CREATE GROUP MODAL
import CreateGroupModal from "../components/chat/CreateGroupModal";

export default function UserProfile() {
  const { userId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser, setUser: setCurrentUser } = useAuth();

  const [user, setUser] = useState(location.state?.user || null);
  const [loading, setLoading] = useState(!location.state?.user);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    username: user?.username || "",
    bio: user?.bio || "",
    profession: user?.profession || "",
    mobileNumber: user?.mobileNumber || "",
  });

  useEffect(() => {
    const handleProfileUpdate = (event) => {
      const { userId: updatedUserId, updatedUser } = event.detail;
      if (updatedUserId === userId) {
        console.log(`🔄 UserProfile updated for user ${updatedUserId}`);
        setUser((prev) => (prev ? { ...prev, ...updatedUser } : null));
      }
    };

    window.addEventListener("profileUpdate", handleProfileUpdate);
    return () =>
      window.removeEventListener("profileUpdate", handleProfileUpdate);
  }, [userId]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/user/${userId}`);
      setUser(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "User Not Found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchUser();
  }, [userId]);

  useEffect(() => {
    if (user) {
      setEditForm({
        username: user.username || "",
        bio: user.bio || "",
        profession: user.profession || "",
        mobileNumber: user.mobileNumber || "",
      });
    }
  }, [user]);

  // Check if the current user has blocked the displayed user
  const isBlocked =
    currentUser &&
    Array.isArray(currentUser.blockedUsers) &&
    currentUser.blockedUsers.some((blocked) =>
      typeof blocked === "string"
        ? blocked === user?._id
        : blocked?._id === user?._id,
    );
  const isCurrentUserProfile = currentUser && currentUser._id === user?._id;

  // Handle starting a chat
  const handleStartChat = async () => {
    if (isStartingChat || !user) return;

    setIsStartingChat(true);
    try {
      const chat = await createChat(user._id);
      navigate("/messages", { state: { autoSelectChat: chat } });
    } catch (err) {
      console.error("Failed to start chat", err);
    } finally {
      setIsStartingChat(false);
    }
  };

  // Handle block/unblock
  const handleBlockToggle = async () => {
    if (isBlocking || !user || !currentUser) return;

    setIsBlocking(true);
    try {
      if (isBlocked) {
        await unblockUser(user._id);
        setCurrentUser((prev) => ({
          ...prev,
          blockedUsers: Array.isArray(prev?.blockedUsers)
            ? prev.blockedUsers.filter((blocked) =>
                typeof blocked === "string"
                  ? blocked !== user._id
                  : blocked?._id !== user._id,
              )
            : [],
        }));
      } else {
        await blockUser(user._id);
        setCurrentUser((prev) => ({
          ...prev,
          blockedUsers: Array.isArray(prev?.blockedUsers)
            ? [...prev.blockedUsers, user._id]
            : [user._id],
        }));
      }
    } catch (err) {
      console.error("Failed to toggle block", err);
    } finally {
      setIsBlocking(false);
    }
  };

  // Handle group creation
  const handleGroupCreated = (newGroup) => {
    // Navigate to messages with the new group selected
    navigate("/messages", { state: { autoSelectChat: newGroup } });
  };

  // Handle save profile
  const handleSaveProfile = async (profileData) => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      const { data } = await api.put("/user/profile", profileData);
      setUser(data);
      if (isCurrentUserProfile) {
        setCurrentUser(data);
      }
      setIsEditModalOpen(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile", err);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen bg-[#050505] flex flex-col items-center justify-center text-zinc-500">
        <Loader2 size={40} className="mb-4 animate-spin text-indigo-500" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">
          Syncing Data...
        </p>
      </div>
    );

  if (error || !user)
    return (
      <div className="h-screen bg-[#050505] flex flex-col items-center justify-center text-zinc-500">
        <ShieldCheck size={48} className="mb-4 opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">
          {error || "User Not Found"}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 text-xs text-indigo-400 hover:underline"
        >
          Go Back
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-indigo-500/30">
      {/* Dynamic Header */}
      <div className="sticky top-0 z-30 p-6 backdrop-blur-xl bg-[#050505]/60 border-b border-white/5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
            User Identity
          </span>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-all"
          >
            <Edit3 size={20} />
          </button>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-6 pt-10 pb-20">
        {/* Profile Header Enhancement */}
        <div className="relative flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-40 h-40 rounded-[48px] bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-indigo-500/30 uppercase overflow-hidden border-4 border-white/5"
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              user.username?.charAt(0)
            )}
          </motion.div>

          <h1 className="mt-8 text-3xl font-bold text-white tracking-tight">
            {user.username}
          </h1>

          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">
                Active
              </span>
            </div>
            <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
              <Phone size={12} className="text-zinc-500" />
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                {user.mobileNumber || "No Mobile"}
              </span>
            </div>
          </div>

          <p className="mt-6 text-sm text-zinc-400 leading-relaxed italic max-w-md">
            "
            {user.bio ||
              user.about ||
              "This user hasn't provided an encrypted bio yet."}
            "
          </p>

          {user.profession && (
            <div className="mt-4 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full inline-flex items-center gap-2">
              <ShieldCheck size={14} className="text-indigo-400" />
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                {user.profession}
              </span>
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center gap-2">
            <UserPlus size={20} className="text-indigo-400" />
            <span className="text-xl font-bold text-white">
              {user.stats?.connections || 0}
            </span>
            <span className="text-[9px] font-black uppercase text-zinc-500 tracking-tighter">
              Connections
            </span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center gap-2">
            <Globe size={20} className="text-violet-400" />
            <span className="text-xl font-bold text-white">
              {user.stats?.groups || 0}
            </span>
            <span className="text-[9px] font-black uppercase text-zinc-500 tracking-tighter">
              Groups
            </span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center gap-2">
            <Ban size={20} className="text-zinc-600" />
            <span className="text-xl font-bold text-white">
              {user.stats?.blocked || 0}
            </span>
            <span className="text-[9px] font-black uppercase text-zinc-500 tracking-tighter">
              Blocked
            </span>
          </div>
        </div>

        {/* Data Sections */}
        <div className="mt-8 space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-[28px] p-6">
            <div className="flex items-center gap-4 text-zinc-400 mb-2">
              <Mail size={16} className="text-indigo-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Email Address
              </span>
            </div>
            <p className="text-sm text-white ml-8 font-medium">
              {user.email || "N/A"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 grid grid-cols-2 gap-4">
          {!isCurrentUserProfile && (
            <>
              <button
                onClick={handleStartChat}
                disabled={isStartingChat}
                className="py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-50"
              >
                {isStartingChat ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <MessageSquare size={18} />
                )}
                {isStartingChat ? "Starting..." : "Chat"}
              </button>
              <button
                onClick={handleBlockToggle}
                disabled={isBlocking}
                className={`py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] disabled:opacity-50 ${
                  isBlocked
                    ? "bg-red-600 hover:bg-red-500 text-white shadow-red-600/20"
                    : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                }`}
              >
                {isBlocking ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : isBlocked ? (
                  <UserMinus size={18} />
                ) : (
                  <Ban size={18} />
                )}
                {isBlocking ? "Processing..." : isBlocked ? "Unblock" : "Block"}
              </button>
            </>
          )}
          {isCurrentUserProfile && (
            <div className="grid grid-cols-1 gap-4">
              <button className="py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-600/20 active:scale-[0.98]">
                <Edit3 size={18} />
                Edit Profile
              </button>
              <button
                onClick={() => setIsCreateGroupModalOpen(true)}
                className="py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-3 shadow-lg shadow-violet-600/20 active:scale-[0.98]"
              >
                <PlusCircle size={18} />
                Create Group
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-[#0c0c0c] border border-white/10 rounded-[40px] p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-white uppercase tracking-tighter">
                  Edit Identity
                </h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 rounded-xl bg-white/5 text-zinc-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-2 ml-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-2 ml-1">
                    Bio / Identity
                  </label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors h-24 resize-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-2 ml-1">
                    Profession
                  </label>
                  <input
                    type="text"
                    value={editForm.profession}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        profession: e.target.value,
                      }))
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="e.g. Software Developer, Designer, etc."
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-2 ml-1">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    value={editForm.mobileNumber}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        mobileNumber: e.target.value,
                      }))
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="mt-10 flex gap-4">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-4 rounded-2xl bg-white/5 text-zinc-400 font-bold text-sm hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveProfile(editForm)}
                  disabled={isSaving}
                  className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
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
