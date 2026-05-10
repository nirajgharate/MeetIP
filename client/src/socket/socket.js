import { io } from "socket.io-client";

// ✅ Simple JWT decoder (no external dependency)
function decodeToken(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("❌ Failed to decode token:", error);
    return null;
  }
}

// ✅ 1. Initialize Socket instance (Pointing to your backend)
// autoConnect: false prevents connection attempts before we have a JWT
export const socket = io("http://localhost:5003", {
  autoConnect: false,
  reconnectionAttempts: 5,
  timeout: 10000,
});

// ✅ 2. Connection Function
// We attach the JWT to the 'auth' object so the backend can verify the user
export function connectSocket() {
  const token = localStorage.getItem("token");
  
  if (token) {
    // ✅ FIXED: Decode token to get userId for socket auth
    const decoded = decodeToken(token);
    
    socket.auth = { token, userId: decoded?.id };
    socket.connect();
    
    console.log("📡 Attempting Socket Handshake...");
    
    // Add connection event listeners
    socket.on("connect", () => {
      console.log("🔗 Socket connected successfully!", socket.id);
    });
    
    socket.on("disconnect", (reason) => {
      console.log("🔌 Socket disconnected:", reason);
    });
    
    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
    });
  }
}

// ✅ 3. Disconnect Function (Optional but recommended)
export function disconnectSocket() {
  if (socket.connected) {
    socket.disconnect();
    console.log("❌ Socket Tunnel Closed");
  }
}

// ✅ 4. Profile Update Listener
socket.on("userProfileUpdated", (data) => {
  const { userId, updatedUser } = data;
  console.log(`📡 Profile updated for user ${userId}:`, updatedUser);
  
  // Dispatch custom event for components to listen to
  window.dispatchEvent(new CustomEvent('profileUpdate', { 
    detail: { userId, updatedUser } 
  }));
});