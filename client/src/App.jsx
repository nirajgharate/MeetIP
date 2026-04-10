import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Routers from "./routes/Routers";
// ✅ Import the AuthProvider
import { AuthProvider } from "./context/AuthContext"; 

export default function App() {
  console.log("App component rendering");
  return (
    <Router>
      {/* ✅ Wrap the entire app (or just the routes) in the Provider */}
      <AuthProvider>
        <div className="App">
          <Routers />
        </div>
      </AuthProvider>
    </Router>
  );
}