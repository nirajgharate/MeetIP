// ✅ Socket Controller to handle specific event logic
export const registerSocketHandlers = (io, socket, onlineUsers) => {
  const userId = socket.userId;

  // --- PRIVATE ROOM LOGIC ---
  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log(`🔒 User ${socket.userId} joined secure room: ${chatId}`);
  });

  // --- MESSAGING LOGIC ---
  socket.on("sendMessage", (data) => {
    const { chatId, message } = data;
    console.log(`📩 Client sent message to room: ${chatId}`);
    if (chatId) {
      io.to(chatId).emit("receiveMessage", { chatId, message });
      socket.to(chatId).emit("newNotification", { chatId, message });
    }
  });

  // --- MESSAGE SEEN LOGIC ---
  socket.on("messageSeen", (data) => {
    const { chatId, userId } = data;
    console.log(`👁️ User ${userId} marked messages as seen in chat ${chatId}`);
    if (chatId) {
      io.to(chatId).emit("messages_seen", { chatId, seenBy: userId });
    }
  });

  // --- TYPING INDICATORS ---
  socket.on("typing", (chatId) => {
    socket.to(chatId).emit("typing", { userId: userId || socket.id, chatId });
  });

  socket.on("stopTyping", (chatId) => {
    socket.to(chatId).emit("stopTyping", { chatId });
  });

  // --- PROFILE UPDATE LOGIC ---
  socket.on("profileUpdated", (data) => {
    const { userId, updatedUser } = data;
    console.log(`👤 Profile updated for user ${userId}:`, updatedUser);
    
    // Broadcast to all connected users except the sender
    socket.broadcast.emit("userProfileUpdated", {
      userId,
      updatedUser: {
        username: updatedUser.username,
        avatar: updatedUser.avatar,
        about: updatedUser.about,
      },
    });
  });

  // --- GROUP CREATION LOGIC ---
  socket.on("groupCreated", (data) => {
    const { group, members } = data;
    console.log(`👥 Group created: ${group.name} with ${members.length} members`);
    
    // Notify all group members about the new group
    members.forEach((memberId) => {
      if (memberId !== userId) { // Don't notify the creator
        const memberSocketId = onlineUsers.get(memberId);
        if (memberSocketId) {
          io.to(memberSocketId).emit("newGroup", { group });
        }
      }
    });
  });

  // --- PUBLIC STATUS LOGIC ---
  socket.on("publicStatusCreated", (data) => {
    const { status } = data;
    console.log(`📢 Public status created by user ${userId}`);
    io.emit("newPublicStatus", { status });
  });

  socket.on("publicStatusLiked", (data) => {
    const { statusId, status } = data;
    console.log(`❤️ Public status ${statusId} liked`);
    io.emit("publicStatusUpdated", { statusId, status });
  });

  socket.on("publicStatusViewed", (data) => {
    const { statusId } = data;
    console.log(`👁️ Public status ${statusId} viewed`);
    io.emit("publicStatusViewed", { statusId });
  });

  socket.on("publicStatusDeleted", (data) => {
    const { statusId } = data;
    console.log(`🗑️ Public status ${statusId} deleted`);
    io.emit("publicStatusDeleted", { statusId });
  });

  // --- PRIVATE STATUS LOGIC ---
  socket.on("privateStatusCreated", (data) => {
    const { status, visibleTo } = data;
    console.log(`🔐 Private status created by user ${userId}`);
    
    // Broadcast to users who can see this status
    visibleTo.forEach((visibleUserId) => {
      const userSocketId = onlineUsers.get(visibleUserId);
      if (userSocketId) {
        io.to(userSocketId).emit("newPrivateStatus", { status });
      }
    });
  });

  socket.on("privateStatusLiked", (data) => {
    const { statusId, status, userId: statusUserId } = data;
    console.log(`❤️ Private status ${statusId} liked`);
    
    // Notify the status owner
    const statusOwnerSocketId = onlineUsers.get(statusUserId);
    if (statusOwnerSocketId) {
      io.to(statusOwnerSocketId).emit("privateStatusUpdated", { statusId, status });
    }
  });

  socket.on("privateStatusViewed", (data) => {
    const { statusId, userId: statusUserId } = data;
    console.log(`👁️ Private status ${statusId} viewed`);
    
    // Notify the status owner
    const statusOwnerSocketId = onlineUsers.get(statusUserId);
    if (statusOwnerSocketId) {
      io.to(statusOwnerSocketId).emit("privateStatusViewed", { statusId });
    }
  });

  socket.on("privateStatusDeleted", (data) => {
    const { statusId } = data;
    console.log(`🗑️ Private status ${statusId} deleted`);
    io.emit("privateStatusDeleted", { statusId });
  });
  socket.on("callUser", ({ userToCall, signalData, from, chatId }) => {
    const targetSocketId = onlineUsers.get(userToCall);
    if (targetSocketId) {
      io.to(targetSocketId).emit("incomingCall", { signalData, from, chatId });
    }
  });

  socket.on("answerCall", ({ signal, to }) => {
    const targetSocketId = onlineUsers.get(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("callAccepted", { answer: signal });
    }
  });

  socket.on("rejectCall", ({ to }) => {
    const targetSocketId = onlineUsers.get(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("callRejected");
    }
  });

  socket.on("iceCandidate", ({ to, candidate }) => {
    const targetSocketId = onlineUsers.get(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("iceCandidate", { candidate });
    }
  });

  socket.on("endCall", ({ to }) => {
    const targetSocketId = onlineUsers.get(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("callEnded");
    }
  });
};