import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Routers from "./routes/Routers";

export default function App() {
  console.log("App component rendering");
  return (
    <Router>
      <div className="App">
        <Routers />
      </div>
    </Router>
  );
}
