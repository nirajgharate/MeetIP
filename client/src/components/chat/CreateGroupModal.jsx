import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Users,
  Search,
  Plus,
  Check,
  Loader2,
  UserPlus,
  Crown,
} from "lucide-react";
import { getUsers } from "../../services/userService";
import { createGroup } from "../../services/chatService";
import { useAuth } from "../../context/AuthContext";

export default function CreateGroupModal({ isOpen, onClose, onGroupCreated }) {
  const [step, setStep] = useState(1);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const { user: currentUser } = useAuth();

  // FIX: Removed 'loading' from dependencies to prevent re-triggering loop
  useEffect(() => {
    const fetchUsers = async () => {
      // Only fetch if modal is open, we are on step 2, and we haven't loaded users yet
      if (isOpen && step === 2 && users.length === 0) {
        setLoading(true);
        try {
          const data = await getUsers();
          const availableUsers = data.filter(
            (u) =>
              u._id !== currentUser._id &&
              !currentUser.blockedUsers?.includes(u._id),
          );
          setUsers(availableUsers);
        } catch (err) {
          console.error("Failed to fetch users", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUsers();
  }, [step, isOpen, currentUser?._id]); // Depend on ID specifically

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.profession &&
        user.profession.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const handleUserSelect = (user) => {
    setSelectedUsers((prev) => {
      const isAlreadySelected = prev.some((u) => u._id === user._id);
      if (isAlreadySelected) {
        // If unselecting, also remove from admins
        setAdminUsers((prevAdmins) =>
          prevAdmins.filter((u) => u._id !== user._id),
        );
        return prev.filter((u) => u._id !== user._id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleAdminToggle = (user) => {
    setAdminUsers((prev) =>
      prev.some((u) => u._id === user._id)
        ? prev.filter((u) => u._id !== user._id)
        : [...prev, user],
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length < 2) return;

    setCreating(true);
    try {
      const groupData = {
        name: groupName.trim(),
        description: groupDescription.trim() || null,
        members: selectedUsers.map((u) => u._id),
        admins: adminUsers.map((u) => u._id),
      };

      console.log("Creating group with data:", groupData);
      const newGroup = await createGroup(groupData);
      console.log("Group created successfully:", newGroup);

      onGroupCreated?.(newGroup);
      handleClose();
    } catch (err) {
      console.error("Failed to create group", err);
      alert("Failed to create group. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setGroupName("");
    setGroupDescription("");
    setSearchQuery("");
    setSelectedUsers([]);
    setAdminUsers([]);
    setUsers([]);
    onClose();
  };

  const canProceed =
    step === 1
      ? groupName.trim().length >= 3
      : step === 2
        ? selectedUsers.length >= 2
        : true;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md bg-[#0c0c0c] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center">
                    <Users size={20} className="text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {step === 1
                        ? "Create Group"
                        : step === 2
                          ? "Select Members"
                          : "Set Administrators"}
                    </h2>
                    <p className="text-xs text-zinc-500">
                      {step === 1
                        ? "Set up your group details"
                        : step === 2
                          ? `${selectedUsers.length} selected`
                          : `${adminUsers.length} admin${adminUsers.length !== 1 ? "s" : ""} selected`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-xl bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Step Indicator */}
              <div className="flex items-center gap-2 mt-4">
                {[1, 2, 3].map((stepNum) => (
                  <React.Fragment key={stepNum}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        step >= stepNum
                          ? "bg-indigo-600 text-white"
                          : "bg-white/5 text-zinc-500"
                      }`}
                    >
                      {stepNum}
                    </div>
                    {stepNum < 3 && (
                      <div className="flex-1 h-0.5 bg-white/10">
                        <div
                          className={`h-full bg-indigo-600 transition-all ${
                            step > stepNum ? "w-full" : "w-0"
                          }`}
                        />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {step === 1 ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-2 ml-1">
                      Group Name *
                    </label>
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="Enter group name..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      maxLength={50}
                    />
                    <p className="text-[9px] text-zinc-600 mt-1">
                      {groupName.length}/50 characters
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-2 ml-1">
                      Description (Optional)
                    </label>
                    <textarea
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      placeholder="Describe your group..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors h-20 resize-none"
                      maxLength={200}
                    />
                    <p className="text-[9px] text-zinc-600 mt-1">
                      {groupDescription.length}/200 characters
                    </p>
                  </div>
                </div>
              ) : step === 2 ? (
                <div className="space-y-4">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-2 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none text-white"
                    />
                  </div>

                  {selectedUsers.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-indigo-400">
                      <Check size={12} />
                      <span>
                        {selectedUsers.length} member
                        {selectedUsers.length !== 1 ? "s" : ""} selected
                      </span>
                    </div>
                  )}

                  <div className="space-y-2">
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2
                          size={20}
                          className="animate-spin text-indigo-500"
                        />
                      </div>
                    ) : filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => {
                        const isSelected = selectedUsers.some(
                          (u) => u._id === user._id,
                        );
                        return (
                          <div
                            key={user._id}
                            onClick={() => handleUserSelect(user)}
                            className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                              isSelected
                                ? "bg-indigo-600/20 border border-indigo-500/30"
                                : "bg-white/5 border border-white/5 hover:bg-white/10"
                            }`}
                          >
                            <div className="relative">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold uppercase">
                                {user.username?.charAt(0) || "?"}
                              </div>
                              {isSelected && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                                  <Check size={12} className="text-white" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-bold text-white">
                                {user.username}
                              </h4>
                              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
                                {user.profession || "Member"}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-center text-zinc-500 text-xs py-4">
                        No users found
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <p className="text-sm text-zinc-400 mb-2">
                      Select group administrators
                    </p>
                    <p className="text-xs text-zinc-600">
                      Admins can manage settings
                    </p>
                  </div>

                  <div className="space-y-2">
                    {selectedUsers.map((user) => {
                      const isAdmin = adminUsers.some(
                        (u) => u._id === user._id,
                      );
                      return (
                        <div
                          key={user._id}
                          onClick={() => handleAdminToggle(user)}
                          className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                            isAdmin
                              ? "bg-amber-600/20 border border-amber-500/30"
                              : "bg-white/5 border border-white/5 hover:bg-white/10"
                          }`}
                        >
                          <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold uppercase">
                              {user.username?.charAt(0) || "?"}
                            </div>
                            {isAdmin && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-600 rounded-full flex items-center justify-center">
                                <Crown size={12} className="text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-white">
                              {user.username}
                            </h4>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
                              {isAdmin ? "Administrator" : "Member"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 flex gap-3">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex-1 py-3 rounded-2xl bg-white/5 text-zinc-400 font-bold text-sm hover:bg-white/10 transition-all"
                >
                  Back
                </button>
              )}
              <button
                onClick={
                  step === 3 ? handleCreateGroup : () => setStep(step + 1)
                }
                disabled={!canProceed || creating}
                className="flex-1 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating...
                  </>
                ) : step === 3 ? (
                  "Create Group"
                ) : (
                  "Next"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
