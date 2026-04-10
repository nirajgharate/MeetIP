import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: false // Changed to false to allow sending files without captions
  },
  
  // ✅ Added: File Sharing Support
  file: {
    type: String, // Stores the URL or path to the file
    default: null
  },
  fileType: {
    type: String,
    enum: ["image", "pdf", "file"], // As per your Step 12.1 requirements
    default: null
  },

  // ✅ Added: Track the current state of the message
  status: {
    type: String,
    enum: ["sent", "delivered", "seen"],
    default: "sent"
  },
  // ✅ Added: List of User IDs who have opened/read the message
  seenBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

// Optional: Indexing chatId for faster message history loading
messageSchema.index({ chatId: 1, createdAt: -1 });

export default mongoose.model('Message', messageSchema);