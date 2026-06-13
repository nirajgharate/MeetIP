import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/api'; 
// ✅ Import Socket helpers
import { connectSocket, disconnectSocket } from '../socket/socket';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ 1. Check Login Status on Mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Fetch the latest profile data from backend
          const { data } = await api.get('/auth/profile');
          setUser(data);

          // ✅ SESSION RESTORED: Establish Socket Tunnel
          connectSocket();
        } catch (error) {
          console.error("Session expired or invalid token:", error);
          localStorage.removeItem('token');
          setUser(null);
          disconnectSocket();
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  // ✅ 2. Wrap setUser to handle socket connection on manual Login
  const loginSync = (userData) => {
    setUser(userData);
    if (userData) {
      connectSocket(); // ✅ LOGIN SUCCESS: Establish Socket Tunnel
    }
  };

  // ✅ 3. Logout Logic
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    // ✅ LOGOUT: Terminate Socket Tunnel
    disconnectSocket();
  };

  return (
    <AuthContext.Provider value={{ user, setUser: loginSync, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// ✅ Custom Hook for easy access
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
