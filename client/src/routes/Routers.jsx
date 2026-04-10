import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../routes/ProtectedRoute";

// Page Imports
import Home from "../pages/Home";
import Meetip from "../pages/Meetip";
import Messages from "../pages/Messages";
import PublicStatus from "../pages/PublicStatus";
import PrivateStatus from "../pages/PrivateStatus";
import LiveUsers from "../pages/LiveUsers";
import JoinUsers from "../pages/JoinUsers";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";
import BlockedUsers from "../pages/BlockedUsers";
import UserProfile from "../pages/UserProfile";
import GroupProfile from "../pages/GroupProfile";
import Login from "../pages/Login";
import Signup from "../pages/Signup";

export default function Routers() {
  return (
    <Routes>
      {/* --- PUBLIC ROUTES --- */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* --- PROTECTED ROUTES --- */}
      {/* Every route inside a <ProtectedRoute> wrapper requires a token */}

      <Route
        path="/meetip"
        element={
          <ProtectedRoute>
            {" "}
            <Meetip />{" "}
          </ProtectedRoute>
        }
      />

      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            {" "}
            <Messages />{" "}
          </ProtectedRoute>
        }
      />

      <Route
        path="/public-status"
        element={
          <ProtectedRoute>
            {" "}
            <PublicStatus />{" "}
          </ProtectedRoute>
        }
      />

      <Route
        path="/private-status"
        element={
          <ProtectedRoute>
            {" "}
            <PrivateStatus />{" "}
          </ProtectedRoute>
        }
      />

      <Route
        path="/live-users"
        element={
          <ProtectedRoute>
            {" "}
            <LiveUsers />{" "}
          </ProtectedRoute>
        }
      />

      <Route
        path="/join-users"
        element={
          <ProtectedRoute>
            {" "}
            <JoinUsers />{" "}
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            {" "}
            <Profile />{" "}
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            {" "}
            <Settings />{" "}
          </ProtectedRoute>
        }
      />

      <Route
        path="/blocked-users"
        element={
          <ProtectedRoute>
            {" "}
            <BlockedUsers />{" "}
          </ProtectedRoute>
        }
      />

      {/* Dynamic Profile Route */}
      <Route
        path="/group/:groupId"
        element={
          <ProtectedRoute>
            {" "}
            <GroupProfile />{" "}
          </ProtectedRoute>
        }
      />

      <Route
        path="/user/:userId"
        element={
          <ProtectedRoute>
            {" "}
            <UserProfile />{" "}
          </ProtectedRoute>
        }
      />

      {/* Catch-all: Redirect unknown paths to Home or Login */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
