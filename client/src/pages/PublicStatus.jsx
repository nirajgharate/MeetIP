import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
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
  Loader2,
  Eye,
  Clock,
  Sparkles,
} from "lucide-react";

import {
  createPublicStatus,
  getPublicStatuses,
  getMyPublicStatus,
  updatePublicStatus,
  toggleLikePublicStatus,
  markPublicStatusAsViewed,
  deletePublicStatus,
} from "../services/statusService";

export default function StatusPage() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("All");
  const [activeStory, setActiveStory] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [statusInput, setStatusInput] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState("text");
  const [isPosting, setIsPosting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingStatusId, setEditingStatusId] = useState(null);

  const [myStatus, setMyStatus] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadStatuses = async () => {
    setRefreshing(true);
    setError("");

    try {
      const [statusesData, myStatusData] = await Promise.all([
        getPublicStatuses(),
        getMyPublicStatus(),
      ]);
      setStatuses(statusesData || []);
      setMyStatus(myStatusData?.status || null);
    } catch (err) {
      console.error("Failed to load statuses:", err);
      setError(
        typeof err === "string"
          ? err
          : err?.message || "Unable to load statuses.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadStatuses();
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isEditorOpen && !activeStory) {
        loadStatuses();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isEditorOpen, activeStory, user]);

  const resetEditor = () => {
    if (mediaPreview && mediaPreview.startsWith("blob:")) {
      URL.revokeObjectURL(mediaPreview);
    }
    setStatusInput("");
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType("text");
    setIsEditing(false);
    setEditingStatusId(null);
    setError("");
    setIsEditorOpen(false);
  };

  const openNewStatusEditor = () => {
    resetEditor();
    setIsEditorOpen(true);
  };

  const openEditStatus = () => {
    if (!myStatus) return;

    setIsEditing(true);
    setEditingStatusId(myStatus._id);
    setStatusInput(myStatus.content || "");
    setMediaType(myStatus.type || "text");
    setMediaFile(null);
    setMediaPreview(
      myStatus.type === "image" || myStatus.type === "video"
        ? myStatus.content
        : null,
    );
    setIsEditorOpen(true);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (mediaPreview && mediaPreview.startsWith("blob:")) {
      URL.revokeObjectURL(mediaPreview);
    }

    const type = file.type.startsWith("video/") ? "video" : "image";
    setMediaType(type);
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
    setIsEditorOpen(true);
  };

  const handleSubmitStatus = async () => {
    if (!statusInput.trim() && !mediaFile && mediaType === "text") return;
    setIsPosting(true);
    setError("");

    try {
      const formData = new FormData();
      if (statusInput.trim()) formData.append("content", statusInput.trim());
      formData.append("type", mediaType);
      if (mediaFile) formData.append("media", mediaFile);

      if (isEditing && editingStatusId) {
        await updatePublicStatus(editingStatusId, formData);
      } else {
        await createPublicStatus(formData);
      }

      await loadStatuses();
      resetEditor();
    } catch (err) {
      console.error("Failed to save status:", err);
      setError(
        typeof err === "string"
          ? err
          : err?.message || "Failed to save status.",
      );
    } finally {
      setIsPosting(false);
    }
  };

  const handleViewStatus = async (status) => {
    if (!status) return;

    try {
      if (status.userId !== user?._id && !status.isViewedByMe) {
        await markPublicStatusAsViewed(status._id);
        setStatuses((prev) =>
          prev.map((s) =>
            s._id === status._id ? { ...s, isViewedByMe: true } : s,
          ),
        );
      }
      setActiveStory(status);
    } catch (error) {
      console.error("Error viewing status:", error);
    }
  };

  const handleLikeStatus = async (statusId) => {
    try {
      await toggleLikePublicStatus(statusId);
      await loadStatuses();
    } catch (error) {
      console.error("Failed to like status:", error);
    }
  };

  const handleDeleteMyStatus = async () => {
    if (!myStatus) return;
    try {
      await deletePublicStatus(myStatus._id);
      setMyStatus(null);
      await loadStatuses();
    } catch (error) {
      console.error("Failed to delete status:", error);
      setError("Could not delete status.");
    }
  };

  const filteredStatuses = statuses.filter((s) => {
    if (activeTab === "Watched") return s.isViewedByMe;
    if (activeTab === "Not Seen") return !s.isViewedByMe;
    return true;
  });

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 bg-[#080808]">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/40 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/10">
              <Globe size={20} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight uppercase">
                Public Status
              </h1>
              <p className="text-xs uppercase text-zinc-500 tracking-[0.3em]">
                Share text, photo, or video status updates.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openNewStatusEditor}
              className="px-4 py-2 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-[0.25em] text-[10px] hover:bg-indigo-500 transition-all"
            >
              New Status
            </button>
            <button
              onClick={() => fileInputRef.current.click()}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all"
            >
              <ImageIcon size={18} />
            </button>
          </div>
        </header>

        <div className="px-8 pt-6 flex flex-wrap gap-2">
          {["All", "Watched", "Not Seen", "My Status"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                activeTab === tab
                  ? "bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-600/20"
                  : "bg-white/5 border-white/5 text-zinc-500 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <main className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles size={48} className="text-indigo-400 mx-auto" />
                </motion.div>
                <p className="text-zinc-400 text-sm">Loading status feed...</p>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="rounded-3xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-200">
                  {error}
                </div>
              )}

              {(activeTab === "All" || activeTab === "My Status") && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">
                      My Status
                    </h2>
                    {refreshing && (
                      <div className="flex items-center gap-2 text-zinc-500">
                        <Loader2 size={12} className="animate-spin" />
                        <span className="text-[10px] uppercase tracking-widest">
                          Refreshing
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-4 p-4 rounded-[32px] bg-white/[0.03] border border-white/10 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white shadow-lg overflow-hidden">
                          {user?.avatar ? (
                            <img
                              src={user.avatar}
                              alt="avatar"
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            (user?.username || "Y")[0].toUpperCase()
                          )}
                        </div>
                        {!myStatus && (
                          <div className="absolute bottom-0 right-0 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-[#080808]">
                            <Plus size={12} strokeWidth={3} />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="font-bold text-sm">
                          {user?.username || "Your Status"}
                        </h3>
                        <p className="text-xs text-zinc-500">
                          {myStatus
                            ? formatTimeAgo(myStatus.createdAt)
                            : "Create a new status"}
                        </p>
                      </div>
                    </div>

                    {myStatus && myStatus.type !== "text" && (
                      <div className="rounded-3xl overflow-hidden border border-white/10">
                        {myStatus.type === "image" ? (
                          <img
                            src={myStatus.content}
                            alt="status preview"
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <video
                            src={myStatus.content}
                            className="w-full h-48 object-cover bg-black"
                            controls
                          />
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={openNewStatusEditor}
                        className="px-4 py-3 rounded-3xl bg-indigo-600 text-white text-sm font-black uppercase tracking-[0.25em] hover:bg-indigo-500 transition"
                      >
                        Add Status
                      </button>
                      <button
                        onClick={() => fileInputRef.current.click()}
                        className="px-4 py-3 rounded-3xl bg-white/5 text-zinc-300 hover:bg-white/10 transition"
                      >
                        Upload Photo / Video
                      </button>
                      {myStatus && (
                        <>
                          <button
                            onClick={openEditStatus}
                            className="px-4 py-3 rounded-3xl bg-white/5 text-zinc-300 hover:bg-white/10 transition"
                          >
                            <Edit3 size={16} className="inline-block mr-2" />
                            Edit
                          </button>
                          <button
                            onClick={handleDeleteMyStatus}
                            className="px-4 py-3 rounded-3xl bg-red-500/10 text-red-200 hover:bg-red-500/20 transition"
                          >
                            <Trash2 size={16} className="inline-block mr-2" />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {activeTab !== "My Status" && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">
                      Network Updates
                    </h2>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                      {filteredStatuses.length} status
                      {filteredStatuses.length !== 1 ? "es" : ""}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {filteredStatuses.length === 0 ? (
                      <div className="rounded-3xl border border-white/10 p-6 text-center text-zinc-400">
                        No statuses found for this tab yet.
                      </div>
                    ) : (
                      filteredStatuses.map((status) => (
                        <StatusItem
                          key={status._id}
                          data={status}
                          onClick={() => handleViewStatus(status)}
                        />
                      ))
                    )}
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </div>

      <AnimatePresence>
        {isEditorOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6 overflow-y-auto"
          >
            <div className="w-full max-w-2xl rounded-[36px] bg-[#0d0d0f] border border-white/10 p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-black">
                    {isEditing ? "Edit Status" : "New Status"}
                  </h2>
                  <p className="text-sm text-zinc-500">
                    Share text, photo, or video with your network.
                  </p>
                </div>
                <button
                  onClick={resetEditor}
                  className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition"
                >
                  <X size={18} />
                </button>
              </div>

              {mediaPreview && (
                <div className="relative rounded-3xl overflow-hidden border border-white/10 mb-6">
                  {mediaType === "video" ? (
                    <video
                      src={mediaPreview}
                      controls
                      className="w-full max-h-96 bg-black"
                    />
                  ) : (
                    <img
                      src={mediaPreview}
                      alt="preview"
                      className="w-full max-h-96 object-cover"
                    />
                  )}
                  <button
                    onClick={() => {
                      if (mediaPreview && mediaPreview.startsWith("blob:")) {
                        URL.revokeObjectURL(mediaPreview);
                      }
                      setMediaFile(null);
                      setMediaPreview(null);
                      setMediaType("text");
                    }}
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-red-500 transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <textarea
                autoFocus
                value={statusInput}
                onChange={(e) => setStatusInput(e.target.value)}
                placeholder={
                  mediaType === "text"
                    ? "Share a short update..."
                    : "Add a caption to your photo or video..."
                }
                className="w-full min-h-[160px] rounded-3xl bg-white/5 border border-white/10 p-6 text-base text-white outline-none placeholder:text-zinc-500 focus:border-indigo-500 transition"
              />

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="inline-flex items-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-200 hover:bg-white/10 transition"
                >
                  <VideoIcon size={16} />
                  Add Photo / Video
                </button>
                <span className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                  {mediaType === "text" ? "Text only" : `${mediaType} ready`}
                </span>
                <div className="ml-auto flex items-center gap-3">
                  <button
                    onClick={resetEditor}
                    className="rounded-3xl bg-white/5 px-4 py-3 text-sm text-zinc-400 hover:bg-white/10 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitStatus}
                    disabled={
                      isPosting ||
                      (!statusInput.trim() &&
                        !mediaFile &&
                        mediaType === "text")
                    }
                    className="rounded-3xl bg-indigo-600 px-4 py-3 text-sm font-black uppercase tracking-[0.25em] text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPosting ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : isEditing ? (
                      "Update"
                    ) : (
                      "Post"
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                  {error}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeStory && (
          <StatusViewer
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

function StatusItem({ data, onClick }) {
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="flex items-center justify-between p-4 rounded-[28px] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-4">
        <div
          className={`p-[2px] rounded-full border-2 ${data.isViewedByMe ? "border-zinc-700" : "border-indigo-500"}`}
        >
          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center font-black text-xs overflow-hidden">
            {data.avatar ? (
              <img
                src={data.avatar}
                alt="avatar"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              data.username?.charAt(0)?.toUpperCase() || "?"
            )}
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-sm group-hover:text-indigo-300 transition-colors">
            {data.username}
          </h3>
          <div className="flex items-center gap-2 text-[10px] text-zinc-500">
            <Clock size={10} />
            <span className="uppercase tracking-widest">
              {formatTimeAgo(data.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {data.type === "video" && (
          <span className="rounded-full bg-indigo-600/15 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-indigo-200">
            VIDEO
          </span>
        )}
        {data.type === "image" && (
          <span className="rounded-full bg-emerald-600/15 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-emerald-200">
            PHOTO
          </span>
        )}
        <div className="flex items-center gap-1 text-zinc-400">
          <Heart
            size={12}
            className={data.isLikedByMe ? "text-red-500 fill-red-500" : ""}
          />
          <span className="text-xs">{data.likes || 0}</span>
        </div>
        <ChevronRight
          size={18}
          className="text-zinc-700 group-hover:text-indigo-400 transition-colors"
        />
      </div>
    </motion.div>
  );
}

function StatusViewer({ story, onClose }) {
  const [progress, setProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(story.isLikedByMe);

  useEffect(() => {
    setProgress(0);
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          onClose();
          return 100;
        }
        return prev + 0.8;
      });
    }, 40);
    return () => clearInterval(timer);
  }, [onClose]);

  const handleLike = async () => {
    try {
      await toggleLikePublicStatus(story._id);
      setIsLiked((prev) => !prev);
    } catch (error) {
      console.error("Failed to like status:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[400] bg-black flex items-center justify-center p-6"
    >
      <div className="relative w-full max-w-3xl h-full md:h-[90vh] rounded-[40px] overflow-hidden bg-[#101012] shadow-2xl">
        <div className="absolute inset-x-0 top-0 z-50 p-6">
          <div className="h-1 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full bg-white transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="absolute inset-x-0 top-20 flex items-center justify-between px-6 z-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-black text-[10px] overflow-hidden">
              {story.avatar ? (
                <img
                  src={story.avatar}
                  alt="avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                story.username?.charAt(0)?.toUpperCase() || "?"
              )}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-zinc-400">
                {story.username}
              </p>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-white">
                {story.type === "video"
                  ? "Video Status"
                  : story.type === "image"
                    ? "Photo Status"
                    : "Text Status"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-2xl bg-black/40 backdrop-blur-md"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex h-full items-center justify-center px-6 pt-32 pb-8">
          {story.type === "video" ? (
            <video
              src={story.content}
              controls
              className="w-full max-h-[70vh] rounded-[32px] bg-black"
            />
          ) : story.type === "image" ? (
            <img
              src={story.content}
              alt="status"
              className="w-full max-h-[70vh] rounded-[32px] object-contain"
            />
          ) : (
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-3xl md:text-4xl font-black text-center leading-tight tracking-tight"
            >
              {story.content}
            </motion.h2>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 z-50 bg-black/60 backdrop-blur-xl px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLike}
              className={`inline-flex items-center gap-2 rounded-3xl px-4 py-3 font-black transition ${
                isLiked ? "bg-red-500/20 text-red-400" : "bg-white/5 text-white"
              }`}
            >
              <Heart size={18} className={isLiked ? "fill-red-500" : ""} />
              {isLiked ? "Liked" : "Like"}
            </motion.button>

            <div className="flex items-center gap-2 text-zinc-400">
              <Eye size={16} />
              <span className="text-xs uppercase tracking-[0.35em]">
                Viewed {story.viewedBy?.length || 0}
              </span>
            </div>
          </div>

          <div className="relative mt-4">
            <input
              placeholder="Reply feature coming soon..."
              disabled
              className="w-full rounded-3xl bg-white/5 border border-white/10 py-4 px-5 pr-16 text-sm text-zinc-300 outline-none"
            />
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-2xl bg-white/10 px-3 py-2 text-zinc-300"
              disabled
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
