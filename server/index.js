import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { createServer } from 'http';
import connectDB from './config/db.js';
import path from 'path';
import { initializeSocketServer, onlineUsers } from './utils/socket.js';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import statusRoutes from './routes/statusRoutes.js';

// ✅ Import Socket Controller
import { registerSocketHandlers } from './controllers/socketController.js';

dotenv.config();
const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// --- DATABASE ---
connectDB();

// --- HTTP & SOCKET.IO SETUP ---
const server = createServer(app);
const io = initializeSocketServer(server);

// ✅ SOCKET AUTH MIDDLEWARE
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id; // Store ID on the socket object
      next();
    } else {
      next(new Error("Authentication failed: No token provided"));
    }
  } catch (error) {
    next(new Error("Authentication failed: Invalid token"));
  }
});

// --- SOCKET CONNECTION HANDLER ---
io.on("connection", (socket) => {
  const userId = socket.userId;

  if (userId) {
    onlineUsers.set(userId, socket.id);
    console.log(`⚡ User ${userId} connected:`, socket.id);
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  }

  // ✅ HAND OFF TO CONTROLLER
  registerSocketHandlers(io, socket, onlineUsers);

  socket.on("disconnect", () => {
    if (userId) {
      onlineUsers.delete(userId);
      console.log("❌ User disconnected:", userId);
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    }
  });
});

// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/group', groupRoutes);
app.use('/api/status', statusRoutes);

const PORT = process.env.PORT || 5003;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io interface active`);
});

// ✅ EXPORT IO FOR USE IN CONTROLLERS
export { io };