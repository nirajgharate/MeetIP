import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * @param {Object} children - The component to render if authenticated
 */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  // If no token exists, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If token exists, render the protected page
  return children;
};

export default ProtectedRoute;