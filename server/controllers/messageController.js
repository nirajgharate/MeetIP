import Message from '../models/Message.js';
import Chat from '../models/Chat.js';

export const sendMessage = async (req, res) => {
  try {
    const { chatId, text, recipientId } = req.body;
    const senderId = req.user._id; // From your auth middleware

    // 1. INITIAL PHASE: Create message with default status "sent"
    const newMessage = new Message({
      chatId,
      sender: senderId,
      text,
      status: "sent" // Default from model, but explicit here for clarity
    });

    const savedMessage = await newMessage.save();

    // 2. UPDATE CHAT: Link the latest message to the Chat model
    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: savedMessage._id
    });

    // 3. SOCKET PHASE: Emit to the recipient
    // Assuming you have 'io' accessible (via req.app.get('socketio') or similar)
    const io = req.app.get('socketio');
    
    // Logic: If the recipient is online, emit the message
    // We check if the recipient has an active socket connection
    const recipientSocket = io.to(recipientId); 

    if (recipientSocket) {
      io.to(recipientId).emit("receive_message", savedMessage);
      
      // 4. DELIVERY UPDATE: If emitted successfully, upgrade status
      savedMessage.status = "delivered";
      await savedMessage.save();
    }

    res.status(201).json(savedMessage);
  } catch (error) {
    console.error("SEND_MESSAGE_ERROR:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const markMessagesAsSeen = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id; // The person opening the chat

    // ✅ LOGIC: 
    // 1. Find messages in this chat 
    // 2. Where the sender is NOT the current user (you don't "see" your own messages)
    // 3. Where status is not already "seen"
    const result = await Message.updateMany(
      { 
        chatId, 
        sender: { $ne: userId }, 
        status: { $ne: "seen" } 
      },
      { 
        $set: { status: "seen" },
        $addToSet: { seenBy: userId } // $addToSet prevents duplicate IDs in the array
      }
    );

    // ✅ SOCKET INTEGRATION: 
    // Notify the original sender that their messages were read
    const io = req.app.get('socketio');
    io.to(chatId).emit("messages_seen", { chatId, seenBy: userId });

    res.status(200).json({ 
      message: "Messages marked as seen", 
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error("MARK_SEEN_ERROR:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};