import React, { useState, useContext } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../../assets/logo.svg'; // Ensure this path is correct
import { 
  MessageSquare, Globe, Lock, Zap, UserPlus, User, Settings, LogOut, Command 
} from 'lucide-react';

// ✅ Import the AuthContext
import { AuthContext } from '../../context/AuthContext';

export default function Sidebar() {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  
  // ✅ Access the logout function from your Global State
  const { logout } = useContext(AuthContext);

  const menuItems = [
    { path: '/messages', icon: <MessageSquare size={20} />, label: 'Messages' },
    { path: '/public-status', icon: <Globe size={20} />, label: 'Public Status' },
    { path: '/private-status', icon: <Lock size={20} />, label: 'Private Status' },
    { path: '/live-users', icon: <Zap size={20} />, label: 'Live Users' },
    { path: '/join-users', icon: <UserPlus size={20} />, label: 'Join Users' },
    { path: '/profile', icon: <User size={20} />, label: 'Profile' },
    { path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  // ✅ Logout Handler Logic
  const handleLogout = () => {
    const confirmed = window.confirm("TERMINATE_SESSION: Are you sure you want to de-initialize this identity node?");
    if (confirmed) {
      logout(); // 1. Clears localStorage & AuthContext State
      navigate('/login'); // 2. Redirects to Login Node
    }
  };

  return (
    <motion.aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{ width: isHovered ? 260 : 80 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="h-screen bg-[#080808]/60 backdrop-blur-2xl border-r border-white/5 z-50 flex flex-col shrink-0 overflow-hidden relative"
    >
      {/* --- LOGO SECTION --- */}
<Link 
  to="/" 
  className="h-20 flex items-center px-6 mb-6 hover:opacity-80 transition-opacity group"
>
  <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
    {/* Background glow effect */}
    <div className="absolute inset-0 bg-blue-500/20 blur-lg rounded-full group-hover:bg-blue-500/40 transition-all duration-500" />
    
    {/* ✅ Connected to your assets/logo.svg */}
    <img 
      src={logo} 
      alt="MeetIP Logo" 
      className="w-full h-full relative z-10 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] object-contain" 
    />
  </div>
  
  <AnimatePresence>
    {isHovered && (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        className="ml-4 flex flex-col"
      >
        <span className="font-black text-xl tracking-tighter text-white leading-none">
          MeetIP
        </span>
        <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-[0.3em] mt-1">
          Network
        </span>
      </motion.div>
    )}
  </AnimatePresence>
</Link>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar overflow-x-hidden">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center h-12 rounded-2xl transition-all duration-300 group relative
              ${isActive 
                ? 'bg-white/10 text-white border border-white/10 shadow-lg' 
                : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-200 border border-transparent'}`
            }
          >
            <div className="min-w-[48px] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              {item.icon}
            </div>
            
            <AnimatePresence mode="wait">
              {isHovered && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-bold text-sm whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>

            {/* Active Indicator Line */}
            <NavLink to={item.path}>
              {({ isActive }) => isActive && (
                <motion.div 
                  layoutId="activeIndicator"
                  className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full"
                />
              )}
            </NavLink>
          </NavLink>
        ))}
      </nav>

      {/* Footer Section (Logout) */}
      <div className="p-4 mt-auto border-t border-white/5 shrink-0">
        <button 
          onClick={handleLogout} // ✅ Attach the logout handler
          className="flex items-center w-full h-12 rounded-2xl text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-all group"
        >
          <div className="min-w-[48px] flex items-center justify-center shrink-0">
            <LogOut size={20} className="group-hover:rotate-180 transition-transform duration-500" />
          </div>
          <AnimatePresence>
            {isHovered && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-bold text-[10px] uppercase tracking-widest whitespace-nowrap"
              >
                Terminal_Exit
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}