import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * @param {Object} children - The component to render if authenticated
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const token = localStorage.getItem("token");

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If no token exists or no user in context, redirect to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // If token exists and user is authenticated, render the protected page
  return children;
};

export default ProtectedRoute;