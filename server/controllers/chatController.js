import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import path from "path"; // Required for file extension check
import { getIO } from "../utils/socket.js";

export const createChat = async (req, res) => {
  const { userId, receiverId } = req.body; // Accept both parameter names for flexibility
  const targetUserId = userId || receiverId; // Use whichever is provided
  const currentUserId = req.user.id; // Your logged-in ID from middleware

  try {
    // ✅ FIX 1: Strict Self-Chat Prevention
    if (currentUserId === targetUserId) {
      return res.status(400).json({ message: "TERMINAL_ERROR: Cannot establish P2P link with self." });
    }

    // 🔍 CHECK: Does a private chat already exist between these two?
    let chat = await Chat.findOne({
      isGroup: false,
      members: { $all: [currentUserId, targetUserId] }, 
    }).populate("members", "-password");

    if (chat) {
      return res.status(200).json(chat); // Return existing link
    }

    // 🆕 CREATE: If no link exists, establish a new one
    const newChat = await Chat.create({
      chatName: "sender", // Or logic to handle naming
      isGroup: false,
      members: [currentUserId, targetUserId],
    });

    const fullChat = await Chat.findOne({ _id: newChat._id })
      .populate("members", "-password");

    res.status(201).json(fullChat);
  } catch (error) {
    res.status(500).json({ message: "FAILED_TO_ESTABLISH_LINK" });
  }
};

// ✅ 2. GET USER CHATS (Updated with population for ChatList)
export const getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      members: { $in: [req.user.id] }
    })
    // ✅ FIX 2: Populate members so the frontend can find the "Other User"
    .populate("members", "username email avatar") 
    .sort({ updatedAt: -1 }); // Show most recent conversations first

    res.status(200).json(chats);
  } catch (error) {
    console.error("❌ Get User Chats Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ 3. SEND MESSAGE (Updated for File Support - Step 12.3)
export const sendMessage = async (req, res) => {
  try {
    const { chatId, text } = req.body;

    // Modified check: Require either text OR a file
    if (!chatId || (!text && !req.file)) {
      return res.status(400).json({ message: "Chat ID and content (text/file) are required" });
    }

    // Prepare message data
    const messageData = {
      chatId,
      sender: req.user.id,
      text: text || "", // Default to empty string if sending only a file
    };

    // ✅ FILE HANDLING LOGIC
    if (req.file) {
      const filePath = `/uploads/${req.file.filename}`;
      const extension = path.extname(req.file.originalname).toLowerCase();

      // Detect type: image, pdf, or generic file
      let type = "file";
      if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(extension)) {
        type = "image";
      } else if (extension === ".pdf") {
        type = "pdf";
      }

      messageData.file = filePath;
      messageData.fileType = type;
    }

    const newMessage = new Message(messageData);
    const savedMessage = await newMessage.save(); 
    
    // ✅ POPULATE SENDER: So frontend knows who sent it immediately
    const fullMessage = await Message.findById(savedMessage._id)
      .populate("sender", "username email avatar");

    // ✅ UPDATE CHAT: Update the 'updatedAt' field so the chat moves to the top of the list
    await Chat.findByIdAndUpdate(chatId, { latestMessage: savedMessage._id });

    console.log("✅ Message Saved to DB:", fullMessage);
    res.status(201).json(fullMessage);
  } catch (error) {
    console.error("❌ Send Message Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ 4. GET MESSAGES
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chatId })
      .populate("sender", "username avatar")
      .sort({ createdAt: 1 }); // ✅ FIX 3: Ensure chronological order

    res.status(200).json(messages);
  } catch (error) {
    console.error("❌ Get Messages Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ 5. MARK AS READ
export const markAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    // Logic to clear unread markers for this user in this chat
    await Message.updateMany(
        { chatId: chatId, sender: { $ne: userId }, readBy: { $ne: userId } },
        { $addToSet: { readBy: userId } }
    );

    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ 6. CREATE GROUP
export const createGroup = async (req, res) => {
  try {
    const { name, members, description } = req.body;
    const currentUserId = req.user.id;

    if (!name || !members || members.length < 2) {
      return res.status(400).json({ message: "Group name and at least 2 members required" });
    }

    // Ensure current user is included in the group
    const allMembers = [...new Set([...members, currentUserId])];

    const newGroup = await Chat.create({
      name,
      isGroup: true,
      members: allMembers,
      admin: currentUserId,
      description: description || null
    });

    const fullGroup = await Chat.findOne({ _id: newGroup._id })
      .populate("members", "username email avatar profession")
      .populate("admin", "username");

    // ✅ EMIT SOCKET EVENT: Notify all users about the new group so clients can update lists
    getIO().emit("newGroup", { group: fullGroup });

    res.status(201).json(fullGroup);
  } catch (error) {
    console.error("❌ Create Group Error:", error);
    res.status(500).json({ message: "Failed to create group" });
  }
};

// ✅ 7. UPDATE GROUP
export const updateGroup = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { name, description, members } = req.body;
    const currentUserId = req.user.id;

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isGroup) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (chat.admin.toString() !== currentUserId) {
      return res.status(403).json({ message: "Only group admin can update group" });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (members) {
      // Ensure admin remains in the group
      updateData.members = [...new Set([...members, currentUserId])];
    }

    const updatedGroup = await Chat.findByIdAndUpdate(chatId, updateData, { new: true })
      .populate("members", "username email avatar profession")
      .populate("admin", "username");

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error("❌ Update Group Error:", error);
    res.status(500).json({ message: "Failed to update group" });
  }
};

// ✅ 8. REMOVE MEMBER FROM GROUP
export const removeFromGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.params;
    const currentUserId = req.user.id;

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isGroup) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (chat.admin.toString() !== currentUserId && userId !== currentUserId) {
      return res.status(403).json({ message: "Only admin can remove other members" });
    }

    if (userId === chat.admin.toString()) {
      return res.status(400).json({ message: "Admin cannot be removed from group" });
    }

    await Chat.findByIdAndUpdate(chatId, {
      $pull: { members: userId }
    });

    res.status(200).json({ message: "Member removed from group" });
  } catch (error) {
    console.error("❌ Remove from Group Error:", error);
    res.status(500).json({ message: "Failed to remove member" });
  }
};