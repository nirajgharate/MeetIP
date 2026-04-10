import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  ShieldCheck,
  Loader2,
  Settings,
  UserPlus,
  LogOut,
  Crown,
  MessageCircle,
  Calendar,
  MapPin,
} from "lucide-react";
import { motion } from "framer-motion";
import { getGroupById } from "../services/groupService";
import { useAuth } from "../context/AuthContext";

export default function GroupProfile() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        setLoading(true);
        const data = await getGroupById(groupId);
        setGroup(data);
      } catch (err) {
        console.error("Failed to load group profile:", err);
        setError("Unable to load group details.");
      } finally {
        setLoading(false);
      }
    };

    if (groupId) {
      fetchGroup();
    }
  }, [groupId]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex h-screen items-center justify-center bg-gradient-to-br from-[#050505] via-[#0a0a0a] to-[#050505] text-white"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="mx-auto mb-4" size={48} />
          </motion.div>
          <p className="text-sm text-zinc-400">Loading group profile...</p>
        </div>
      </motion.div>
    );
  }

  if (error || !group) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex h-screen flex-col items-center justify-center bg-gradient-to-br from-[#050505] via-[#0a0a0a] to-[#050505] text-white p-6 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <ShieldCheck size={64} className="mb-4 text-indigo-400" />
        </motion.div>
        <p className="text-sm text-zinc-400 mb-2">
          {error || "Group not found."}
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/messages")}
          className="mt-4 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold shadow-lg"
        >
          Back to Messages
        </motion.button>
      </motion.div>
    );
  }

  const isAdmin = group.admin?._id === user?._id;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-[#050505] via-[#0a0a0a] to-[#050505] text-white"
    >
      <div className="max-w-6xl mx-auto p-6">
        {/* Back Button */}
        <motion.button
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={18} /> Back
        </motion.button>

        {/* Cover Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative rounded-[32px] overflow-hidden mb-8"
        >
          <div className="h-48 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 relative">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute bottom-6 left-6 flex items-center gap-4">
              <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white text-4xl font-black shadow-2xl">
                <Users size={36} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                  {group.name || "Unnamed Group"}
                </h1>
                <p className="text-white/80 mt-1 drop-shadow">
                  {group.members.length} members
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description Card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-sm p-6 shadow-2xl"
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <MessageCircle size={20} />
                About
              </h2>
              <p className="text-zinc-300 leading-relaxed">
                {group.description ||
                  "This group doesn't have a description yet."}
              </p>
            </motion.div>

            {/* Members Grid */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Users size={20} />
                Members ({group.members.length})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {group.members.map((member, index) => (
                  <motion.div
                    key={member._id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ scale: 1.02 }}
                    className="group relative rounded-[20px] border border-white/10 bg-white/5 backdrop-blur-sm p-5 hover:bg-white/10 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
                          {member.username?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        {group.admin?._id === member._id && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                            <Crown size={12} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-white group-hover:text-indigo-300 transition-colors">
                          {member.username}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {member.profession || "Member"}
                        </p>
                        {group.admin?._id === member._id && (
                          <div className="inline-flex items-center gap-1 mt-1 px-2 py-1 rounded-full bg-amber-500/10 text-[10px] uppercase tracking-[0.3em] text-amber-300">
                            <ShieldCheck size={10} />
                            Admin
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Group Details */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-sm p-6 shadow-2xl"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Settings size={18} />
                Group Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Admin:</span>
                  <span className="text-white font-medium">
                    {group.admin?.username || "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Your Role:</span>
                  <span
                    className={`font-medium ${isAdmin ? "text-amber-300" : "text-zinc-300"}`}
                  >
                    {isAdmin ? "Admin" : "Member"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Created:</span>
                  <span className="text-zinc-300">
                    {new Date(group.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <p className="text-xs text-zinc-500 font-mono break-all">
                    ID: {group._id}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-3"
            >
              {isAdmin && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium shadow-lg"
                >
                  <UserPlus size={18} />
                  Invite Members
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/messages")}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-medium backdrop-blur-sm border border-white/20"
              >
                <MessageCircle size={18} />
                Open Chat
              </motion.button>
              {!isAdmin && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-red-600/20 hover:bg-red-600/30 text-red-300 font-medium border border-red-500/30"
                >
                  <LogOut size={18} />
                  Leave Group
                </motion.button>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
